"""Assemble site/index.html from _build/index.base.html, registry.json, tracking/today.json and slot fragments.

Workspace layout (paths relative to the workspace root, the folder that holds registry.json):
  registry.json                   patterns (ordered by tier) and slots (one per pattern lesson or problem)
  tracking/lab-state.json         page progress written by tools/serve.py (baked into the page)
  tracking/today.json             {"date": "YYYY-MM-DD", "items": [{"n": 3, "why": "new" | "review"}]}
  <slot dir>/_fragments/panel.html    <div class="lesson-content xp" id="lessonN"> ... </div>   (required)
  <slot dir>/_fragments/sandbox.html  <div class="sandbox-container" id="sandboxN"> ... </div> (optional; Home's sandbox is used if missing)
  <slot dir>/_fragments/script.js     one IIFE, no new globals                                 (optional)
The sidebar (tier, then a collapsible group per pattern with its lesson and easy / medium / hard sub-groups)
and the mobile pills are generated from registry.json, so slots do not write their own.

Usage:
  python3 site/_build/build.py                 # every slot -> site/index.html
  python3 site/_build/build.py --only 3 --out /tmp/p3.html   # Home + slot 3 (preview)
"""
import argparse, html, json, pathlib, sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent                     # workspace root
SITE = HERE.parent


def frag(d, name, required):
    p = ROOT / d / "_fragments" / name
    if p.exists():
        return p.read_text().rstrip() + "\n"
    if required:
        sys.exit(f"missing {p}")
    return ""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", type=int, nargs="*")
    ap.add_argument("--out", default=str(SITE / "index.html"))
    a = ap.parse_args()
    reg = json.loads((ROOT / "registry.json").read_text())
    today_p = ROOT / "tracking" / "today.json"
    today = json.loads(today_p.read_text()) if today_p.exists() else {"date": "", "items": []}
    slots = [s for s in reg["slots"] if (ROOT / s["dir"] / "_fragments" / "panel.html").exists()]
    if a.only:
        slots = [s for s in slots if s["n"] in a.only]
    ns = [s["n"] for s in slots]
    assert len(ns) == len(set(ns)) and 0 not in ns, "slot numbers must be unique and >= 1"
    order = {p["key"]: k for k, p in enumerate(reg["patterns"])}
    titles = {p["key"]: p for p in reg["patterns"]}
    for s in slots:
        assert s["pattern"] in order, f"slot {s['n']}: unknown pattern {s['pattern']}"
    # sidebar order: pattern tier order, the pattern lesson first, then problems in slot order
    slots.sort(key=lambda s: (order[s["pattern"]], s["kind"] != "pattern", s["n"]))
    nav = pill = panel = sandbox = script = ""
    today_ns = {it["n"] for it in today.get("items", [])}
    chev = '<svg class="nav-chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M4.5 2.5 8 6l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'

    def item(s, extra=""):
        n = s["n"]
        kind = "pattern" if s["kind"] == "pattern" else ""
        num = "P" if kind else str(s.get("lc", n))
        title = "Pattern lesson" if kind else s["title"]
        return (f'      <button class="nav-item {kind}" data-lesson="{n}" title="{html.escape(s["title"])}">\n'
                f'        <span class="nav-dot" id="dot{n}"></span>\n'
                f'        <span class="nav-num">{num}</span>\n'
                f'        <span class="nav-title">{html.escape(title)}</span>{extra}\n'
                f'      </button>\n')

    # sidebar: tier label, then one collapsible group per pattern (lesson first, then easy / medium / hard groups)
    last_tier = None
    for key in sorted({s["pattern"] for s in slots}, key=lambda k: order[k]):
        p = titles[key]
        group = [s for s in slots if s["pattern"] == key]
        if p["tier"] != last_tier:
            nav += f'    <p class="nav-tier">Tier {p["tier"]}</p>\n'
            last_tier = p["tier"]
        is_open = " open" if any(s["n"] in today_ns for s in group) else ""
        nav += (f'    <details class="nav-group" data-group="{key}" data-title="{html.escape(p["title"])}"{is_open}>\n'
                f'      <summary>{chev}<span class="ng-title">{html.escape(p["title"])}</span><span class="ng-count"></span></summary>\n'
                f'      <div class="nav-group-body">\n')
        for s in group:
            if s["kind"] == "pattern":
                nav += item(s)
        for d in ("easy", "medium", "hard"):
            probs = [s for s in group if s["kind"] != "pattern" and s.get("diff") == d]
            if not probs:
                continue
            nav += (f'      <details class="nav-dg" data-group="{key}:{d}" open>\n'
                    f'        <summary>{chev}<span class="nav-diff diff-{d}">{d}</span><span class="ng-count"></span></summary>\n'
                    f'        <div class="nav-dg-body">\n')
            for s in probs:
                nav += item(s)
            nav += '        </div>\n      </details>\n'
        nav += '      </div>\n    </details>\n'

    for s in slots:
        n = s["n"]
        short = s.get("short") or s["title"][:18]
        pill += f'  <button class="pill" data-lesson="{n}">{html.escape(short)}</button>\n'
        d = s["dir"]
        panel += f"<!-- ~~~~~~~~ SLOT {n}: {s['title']} ~~~~~~~~ -->\n" + frag(d, "panel.html", True) + "\n"
        sb = frag(d, "sandbox.html", False)
        if sb:
            sandbox += f"<!-- ~~~~~~~~ SANDBOX {n} ~~~~~~~~ -->\n" + sb + "\n"
        js = frag(d, "script.js", False)
        if js:
            script += f"// ======== SLOT {n}: {s['title']} ========\n" + js + "\n"
    course = {
        "slots": [{k: s[k] for k in ("n", "kind", "pattern", "title", "diff", "lc") if k in s} for s in slots],
        "patterns": reg["patterns"],
        "today": today,
    }
    s = (HERE / "index.base.html").read_text()
    start, end = s.index("/*@@COURSE*/"), s.index("/*@@END*/")
    s = s[:start] + json.dumps(course, separators=(",", ":")).replace("</", "<\\/") + s[end + len("/*@@END*/"):]
    # progress saved by tools/serve.py, baked in so a page opened from disk starts from it
    state_p = ROOT / "tracking" / "lab-state.json"
    state = json.loads(state_p.read_text()) if state_p.exists() else {}
    start, end = s.index("/*@@STATE*/"), s.index("/*@@END_STATE*/")
    s = s[:start] + json.dumps(state, separators=(",", ":")).replace("</", "<\\/") + s[end + len("/*@@END_STATE*/"):]
    rep = {
        "    <!-- @@NAV_INSERT -->\n": nav,
        "  <!-- @@PILL_INSERT -->\n": pill,
        "<!-- @@PANEL_INSERT -->\n": panel,
        "<!-- @@SANDBOX_INSERT -->\n": sandbox,
        "// @@SCRIPT_INSERT\n": script,
    }
    for k, v in rep.items():
        assert s.count(k) == 1, k
        s = s.replace(k, v)
    pathlib.Path(a.out).write_text(s)
    print(f"built {a.out}: {len(slots)} slots {sorted(ns)}")


if __name__ == "__main__":
    main()
