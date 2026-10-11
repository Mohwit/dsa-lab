"""Register a new slot (pattern lesson or problem) in the DSA workspace and create its folder.

    python3 new_slot.py --ws ~/Desktop/dsa-lab problem --pattern arrays-hashing --title "Two Sum" --lc 1 \
        --diff easy --fn two_sum --sig "nums: list[int], target: int" --ret "list[int]"
    python3 new_slot.py --ws ~/Desktop/dsa-lab problem ... --from problems/two_sum.py   # file a learner's loose solution
    python3 new_slot.py --ws ~/Desktop/dsa-lab pattern --pattern arrays-hashing

Problems live in problems/<pattern>/<NNNN>-<slug>/ (NNNN = LeetCode number). With --from, the learner's file is
moved in as attempt.py (their code is kept as is; nothing is generated over it). Prints the new slot number and folder.
Never overwrites existing files.
"""
import argparse, json, pathlib, re, sys


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ws", required=True)
    sub = ap.add_subparsers(dest="kind", required=True)
    p = sub.add_parser("problem")
    p.add_argument("--pattern", required=True); p.add_argument("--title", required=True)
    p.add_argument("--lc", type=int); p.add_argument("--diff", choices=["easy", "medium", "hard"], required=True)
    p.add_argument("--fn", required=True); p.add_argument("--sig", required=True); p.add_argument("--ret", default="")
    p.add_argument("--short")
    p.add_argument("--from", dest="src", help="a learner's loose solution file to move in as attempt.py")
    q = sub.add_parser("pattern")
    q.add_argument("--pattern", required=True)
    a = ap.parse_args()
    ws = pathlib.Path(a.ws).expanduser()
    reg_p = ws / "registry.json"
    reg = json.loads(reg_p.read_text())
    pats = {x["key"]: x for x in reg["patterns"]}
    if a.pattern not in pats:
        sys.exit(f"unknown pattern {a.pattern}; known: {', '.join(pats)}")
    n = max([s["n"] for s in reg["slots"]] + [0]) + 1
    if a.kind == "pattern":
        if any(s["kind"] == "pattern" and s["pattern"] == a.pattern for s in reg["slots"]):
            sys.exit("pattern lesson already exists")
        d = f"patterns/{a.pattern}"
        slot = {"n": n, "kind": "pattern", "pattern": a.pattern, "title": "Pattern: " + pats[a.pattern]["title"],
                "short": "P " + pats[a.pattern]["title"][:14], "dir": d}
    else:
        slug = re.sub(r"[^a-z0-9]+", "-", a.title.lower()).strip("-")
        d = f"problems/{a.pattern}/{(a.lc or 0):04d}-{slug}"
        if any(s["dir"] == d for s in reg["slots"]):
            sys.exit(f"{d} already registered")
        slot = {"n": n, "kind": "problem", "pattern": a.pattern, "title": a.title, "diff": a.diff, "dir": d,
                "fn": a.fn, "short": a.short or a.title[:18]}
        if a.lc:
            slot["lc"] = a.lc
    folder = ws / d
    (folder / "_fragments").mkdir(parents=True, exist_ok=True)
    if a.kind == "problem" and a.src:
        src = (ws / a.src) if not pathlib.Path(a.src).is_absolute() else pathlib.Path(a.src)
        if not src.exists():
            sys.exit(f"--from file not found: {src}")
        if (folder / "attempt.py").exists():
            sys.exit(f"{folder / 'attempt.py'} already exists")
        if src.is_dir():
            for f in src.iterdir():
                f.rename(folder / ("attempt.py" if f.suffix == ".py" and not (folder / "attempt.py").exists() else f.name))
            src.rmdir()
        else:
            src.rename(folder / "attempt.py")
    if a.kind == "problem":
        ret = f" -> {a.ret}" if a.ret else ""
        files = {
            "attempt.py": f'"""{a.title}. Your attempt: fill in the function, then run\n    python3 tools/run_tests.py {d}\n"""\n\n\ndef {a.fn}({a.sig}){ret}:\n    raise NotImplementedError\n',
            "solution.py": f'"""{a.title}. Reference solution (the code the page traces)."""\n\n\ndef {a.fn}({a.sig}){ret}:\n    raise NotImplementedError\n',
            "tests.json": json.dumps({"fn": a.fn, "compare": "exact", "cases": []}, indent=2) + "\n",
            "notes.md": f"# {a.title}\n\nInteractive page: `site/index.html#p{n}`.\n",
        }
        for name, body in files.items():
            f = folder / name
            if not f.exists():
                f.write_text(body)
    reg["slots"].append(slot)
    reg_p.write_text(json.dumps(reg, indent=2) + "\n")
    print(json.dumps({"n": n, "dir": str(folder)}))


if __name__ == "__main__":
    main()
