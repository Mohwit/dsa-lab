// ======== SLOT 15: PATTERN LESSON, INTERVALS ========
(() => {
  const MERGE_CODE = `def merge(intervals):
    out = []
    for s, e in sorted(intervals):
        if out and s <= out[-1][1]:
            out[-1][1] = max(out[-1][1], e)
        else:
            out.append([s, e])
    return out`;
  const PAIRS_CODE = `def merge_pairs(intervals):
    n = len(intervals)
    group = list(range(n))
    for i in range(n):
        for j in range(i + 1, n):
            a, b = intervals[i], intervals[j]
            if a[0] <= b[1] and b[0] <= a[1]:
                old, new = group[j], group[i]
                group = [new if g == old else g for g in group]
    return spans_of(group, intervals)`;
  const ROOMS_CODE = `def min_rooms(meetings):
    events = []
    for s, e in meetings:
        events.append((s, 1))
        events.append((e, -1))
    events.sort()
    rooms = best = 0
    for t, d in events:
        rooms += d
        best = max(best, rooms)
    return best`;
  const ERASE_CODE = `def erase_overlaps(intervals):
    removed, end = 0, None
    for s, e in sorted(intervals, key=lambda iv: iv[1]):
        if end is not None and s < end:
            removed += 1
        else:
            end = e
    return removed`;
  const CAP = 60;
  const byStart = (a, b) => a[0] - b[0] || a[1] - b[1];
  const byEnd = (a, b) => a[1] - b[1];   // stable, like Python sorted(key=end)
  const lab = iv => `[${iv[0]}, ${iv[1]}]`;
  const fmtList = a => '[' + a.map(lab).join(', ') + ']';

  // A timeline drawn as a grid: one row per interval, one column per time slot [t, t + 1).
  // look[k]: 'now' (teal), 'seen' (blue), 'todo' (dots), 'gone' (x marks).
  function timeline(name, ivs, look, span, labels) {
    const [T0, T1] = span, cols = [];
    for (let t = T0; t < T1; t++) cols.push(String(t));
    const hl = [], src = [];
    const rows = ivs.map((iv, r) => cols.map((_, c) => {
      const t = T0 + c;
      if (!(iv[0] <= t && t < iv[1])) return null;
      const L = look[r] || 'seen';
      if (L === 'now') hl.push([r, c]); else if (L === 'seen') src.push([r, c]);
      return L === 'todo' ? '.' : L === 'gone' ? 'x' : '';
    }));
    return { type: 'grid', name, rows, rowLabels: labels || ivs.map(lab), colLabels: cols, hl, src };
  }
  const spanOf = ivs => ivs.length ? [Math.min(...ivs.map(v => v[0])), Math.max(...ivs.map(v => v[1]))] : [0, 1];

  /* ---------- merge: sorted scan ---------- */
  function mergeFrames(input) {
    const L = s => lineOf(MERGE_CODE, s), srt = input.map(v => v.slice()).sort(byStart), span = spanOf(input), frames = [], out = [];
    let checks = 0;
    const view = (k, note, line, extra) => {
      if (frames.length >= CAP - 1) return;
      const look = srt.map((_, r) => r < k ? 'seen' : r === k ? 'now' : 'todo');
      frames.push(Object.assign({ line: L(line), note, views: [timeline('sorted by start (teal: now, blue: done, dots: not yet)', srt, look, span), timeline('out (merged so far)', out, out.map((_, r) => r === out.length - 1 ? 'now' : 'seen'), span), { type: 'vars', values: Object.assign({ checks }, extra || {}) }] }, {}));
    };
    let skipped = 0;
    const push = (...a) => { if (frames.length >= CAP - 1) skipped++; else view(...a); };
    push(-1, `Sort by start: ${fmtList(srt)}. Now each interval only has to look at the last one kept.`, 'for s, e in sorted(intervals)');
    srt.forEach(([s, e], k) => {
      if (!out.length) {
        out.push([s, e]);
        push(k, `${lab([s, e])} is the first one: nothing to compare with, so keep it.`, 'out.append([s, e])', { s, e });
        return;
      }
      checks++;
      const last = out[out.length - 1], hit = s <= last[1];
      push(k, `Check ${checks}: does ${lab([s, e])} start at or before the last end, ${last[1]}? ${hit ? 'Yes, they overlap.' : 'No, there is a gap.'}`, 'if out and s <= out[-1][1]', { s, e, last_end: last[1] });
      if (hit) {
        const old = last[1]; last[1] = Math.max(last[1], e);
        push(k, `Stretch the last one: its end becomes max(${old}, ${e}) = ${last[1]}.`, 'out[-1][1] = max(out[-1][1], e)', { s, e, last_end: last[1] });
      } else {
        out.push([s, e]);
        push(k, `Start a new merged interval ${lab([s, e])}.`, 'out.append([s, e])', { s, e, last_end: e });
      }
    });
    const fin = { line: L('return out'), note: `${skipped ? `... ${skipped} more steps follow the same rule. ` : ''}Done: ${out.length} merged interval${out.length === 1 ? '' : 's'} after ${checks} check${checks === 1 ? '' : 's'} (plus the sort).`, result: out, views: [timeline('sorted by start', srt, srt.map(() => 'seen'), span), timeline('out (merged)', out, out.map(() => 'now'), span), { type: 'vars', values: { checks } }] };
    frames.push(fin);
    return { out, checks, frames };
  }

  /* ---------- merge: compare every pair ---------- */
  function pairsFrames(input) {
    const L = s => lineOf(PAIRS_CODE, s), n = input.length, span = spanOf(input), frames = [];
    let group = input.map((_, k) => k), checks = 0, skipped = 0;
    const push = f => { if (frames.length >= CAP - 1) skipped++; else frames.push(f); };
    const views = (i, j) => [timeline('intervals in the given order (teal: the pair being compared)', input, input.map((_, r) => r === i || r === j ? 'now' : 'seen'), span),
      { type: 'array', name: 'group of each interval', values: group.slice(), pointers: i >= 0 ? { i, j } : {}, hl: i >= 0 ? [i, j] : [] }, { type: 'vars', values: { checks } }];
    push({ line: L('group = list(range(n))'), note: `No sorting. Every interval starts in its own group. There are ${n * (n - 1) / 2} pairs to compare.`, views: views(-1, -1) });
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      checks++;
      const a = input[i], b = input[j], hit = a[0] <= b[1] && b[0] <= a[1];
      let note = `Check ${checks}: ${lab(a)} and ${lab(b)}. ${hit ? 'They overlap' : 'No overlap.'}`;
      if (hit) {
        const old = group[j], nw = group[i];
        group = group.map(g => g === old ? nw : g);
        note += old === nw ? ', but they are already in one group.' : `: group ${old} joins group ${nw}.`;
      }
      push({ line: L(hit ? 'old, new = group[j], group[i]' : 'if a[0] <= b[1] and b[0] <= a[1]'), note, views: views(i, j) });
    }
    const spans = new Map();
    input.forEach((iv, k) => { const g = group[k], sp = spans.get(g); spans.set(g, sp ? [Math.min(sp[0], iv[0]), Math.max(sp[1], iv[1])] : iv.slice()); });
    const out = [...spans.values()].sort(byStart);
    frames.push({ line: L('return spans_of(group, intervals)'), note: `${skipped ? `... ${skipped} more steps follow the same rule. ` : ''}Every pair checked: ${checks} checks. Each group becomes one merged interval.`, result: out, views: [timeline('merged', out, out.map(() => 'now'), span), { type: 'array', name: 'group of each interval', values: group.slice() }, { type: 'vars', values: { checks } }] });
    return { out, checks, frames };
  }

  /* ---------- meeting rooms: sweep line ---------- */
  function roomsFrames(meetings) {
    const L = s => lineOf(ROOMS_CODE, s), span = spanOf(meetings), frames = [];
    const ev = [];
    meetings.forEach(([s, e]) => { ev.push([s, 1]); ev.push([e, -1]); });
    ev.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const evLab = ev.map(([t, d]) => `${t}${d > 0 ? '+' : '-'}`);
    let rooms = 0, best = 0, skipped = 0;
    const views = (k, t) => [timeline('meetings (teal: running just after this event)', meetings, meetings.map(([s, e]) => t !== null && s <= t && t < e ? 'now' : 'seen'), span),
      { type: 'array', name: 'events, sorted (time, + start / - end)', values: evLab, pointers: k >= 0 ? { k } : {}, hl: k >= 0 ? [k] : [], dim: evLab.map((_, q) => q).filter(q => q < k) },
      { type: 'vars', values: { rooms, best } }];
    frames.push({ line: L('events.sort()'), note: 'Each meeting becomes two events: +1 when it starts, -1 when it ends. Sort them by time. At the same time, -1 sorts before +1, so a room freed at 4 can be reused at 4.', views: views(-1, null) });
    ev.forEach(([t, d], k) => {
      rooms += d; best = Math.max(best, rooms);
      const f = { line: L('rooms += d'), note: `Time ${t}: a meeting ${d > 0 ? 'starts' : 'ends'}. ${rooms} room${rooms === 1 ? '' : 's'} busy now; the most so far is ${best}.`, views: views(k, t) };
      if (frames.length >= CAP - 1) skipped++; else frames.push(f);
    });
    frames.push({ line: L('return best'), note: `${skipped ? `... ${skipped} more steps follow the same rule. ` : ''}The busiest moment needed ${best} room${best === 1 ? '' : 's'}. ${ev.length} events, two per meeting.`, result: best, views: views(-1, null) });
    return { best, events: ev.length, frames };
  }

  /* ---------- remove fewest: greedy by end ---------- */
  function eraseFrames(input) {
    const L = s => lineOf(ERASE_CODE, s), srt = input.map(v => v.slice()).sort(byEnd), span = spanOf(input), frames = [], look = srt.map(() => 'todo');
    let removed = 0, end = null, checks = 0, skipped = 0;
    const lbl = () => srt.map((iv, r) => lab(iv) + (look[r] === 'gone' ? ' out' : look[r] === 'seen' ? ' kept' : ''));
    const push = (line, note) => {
      const f = { line: L(line), note, views: [timeline('sorted by end (teal: now, blue: kept, x: removed)', srt, look.slice(), span, lbl()), { type: 'vars', values: { end: end === null ? 'None' : end, removed, checks } }] };
      if (frames.length >= CAP - 1) skipped++; else frames.push(f);
    };
    push('for s, e in sorted(intervals, key=lambda iv: iv[1])', `Sort by <em>end</em>: ${fmtList(srt)}. The one that ends first leaves the most room for the rest.`);
    srt.forEach(([s, e], k) => {
      look[k] = 'now';
      if (end === null) { end = e; look[k] = 'seen'; push('end = e', `${lab([s, e])} ends first: keep it. end = ${e}.`); return; }
      checks++;
      if (s < end) { removed++; look[k] = 'gone'; push('removed += 1', `Check ${checks}: ${lab([s, e])} starts at ${s}, before end ${end}. It clashes: remove it (it ends later than the one we kept).`); }
      else { end = e; look[k] = 'seen'; push('end = e', `Check ${checks}: ${lab([s, e])} starts at ${s}, not before end ${end}. No clash: keep it, end = ${e}.`); }
    });
    const fin = { line: L('return removed'), note: `${skipped ? `... ${skipped} more steps follow the same rule. ` : ''}Removed ${removed}, after ${checks} check${checks === 1 ? '' : 's'} (plus the sort).`, result: removed, views: [timeline('sorted by end', srt, look.slice(), span, lbl()), { type: 'vars', values: { end: end === null ? 'None' : end, removed, checks } }] };
    frames.push(fin);
    return { removed, checks, frames };
  }

  // Plain counters with the same rules as measure.py (used by the race and the sandbox).
  function roomsBruteTests(m) { let tests = 0; m.forEach(() => m.forEach(() => tests++)); return tests; }
  function eraseBruteTried(ivs) {
    const n = ivs.length; let tried = 0, best = 0;
    for (let mask = 0; mask < (1 << n); mask++) {
      tried++;
      const keep = ivs.filter((_, k) => mask >> k & 1).sort(byStart);
      let ok = true;
      for (let k = 0; k + 1 < keep.length; k++) if (keep[k][1] > keep[k + 1][0]) { ok = false; break; }
      if (ok) best = Math.max(best, keep.length);
    }
    return { removed: n - best, tried };
  }
  function scanChecks(ivs) { let c = 0, has = false; ivs.slice().sort(byStart).forEach(() => { if (has) c++; has = true; }); return c; }
  function pairChecks(ivs) { let c = 0; for (let i = 0; i < ivs.length; i++) for (let j = i + 1; j < ivs.length; j++) c++; return c; }

  const setVal = (id, v) => { const el = document.getElementById(id); if (!el) return; el.querySelector('.val').textContent = v; flash(el); };

  /* ---------- Section 1: compare every pair vs sort and scan ---------- */
  (() => {
    const pic = [[7, 9], [1, 3], [2, 5], [10, 11], [6, 8]];
    const a = pairsFrames(pic), b = mergeFrames(pic);
    const elA = document.getElementById('p15tpA'), elB = document.getElementById('p15tpB');
    if (elA) TracePlayer(elA, { frames: a.frames }, { code: false });
    if (elB) TracePlayer(elB, { frames: b.frames }, { code: false });
    setVal('p15roA', a.checks); setVal('p15roB', b.checks);
  })();

  /* ---------- Section 2: the overlap-check race ---------- */
  (() => {
    const cv = document.getElementById('p15cvA'); if (!cv) return;
    const active = () => document.getElementById('lesson15').classList.contains('active');
    let n = 10, scan = 0, pairs = 0, prog = 1, raf = 0;
    const measure = k => { const ivs = Array.from({ length: k }, (_, t) => { const s = (t * 37) % (10 * k); return [s, s + 1 + t % 20]; }); scan = scanChecks(ivs); pairs = pairChecks(ivs); };
    const num = v => Math.round(v).toLocaleString('en-US');
    function draw() {
      if (!cv.clientWidth) return;
      const { ctx: c, w, h } = fit(cv, Math.max(0.26, 150 / cv.clientWidth));
      c.clearRect(0, 0, w, h);
      const pad = 12, track = w - 2 * pad, done = prog * pairs;
      [{ label: 'sort, then scan: O(n) checks', total: scan, col: css('--teal'), y: h * 0.3 },
       { label: 'compare every pair: O(n^2) checks', total: pairs, col: css('--orange'), y: h * 0.74 }].forEach(Ln => {
        const got = Math.min(Ln.total, done), fin = got >= Ln.total;
        text(c, Ln.label, pad, Ln.y - 16, css('--text-bright'), 12, 'left', 600);
        text(c, `${num(got)} checks${fin ? ', done' : ''}`, w - pad, Ln.y - 16, Ln.col, 12, 'right', 700);
        c.fillStyle = css('--bg-input'); c.fillRect(pad, Ln.y, track, 12);
        c.fillStyle = Ln.col; c.fillRect(pad, Ln.y, Math.max(2, track * got / pairs), 12);
      });
    }
    function show() { setVal('p15roN', n); setVal('p15roS', num(scan)); setVal('p15roP', num(pairs)); setVal('p15roR', (pairs / scan).toFixed(1) + 'x'); }
    function race() {
      cancelAnimationFrame(raf);
      if (RM) { prog = 1; draw(); return; }
      const t0 = performance.now(), dur = 2500;
      const tick = t => { prog = Math.min(1, (t - t0) / dur); draw(); if (prog < 1 && active()) raf = requestAnimationFrame(tick); else { prog = 1; draw(); } };
      prog = 0; raf = requestAnimationFrame(tick);
    }
    document.querySelectorAll('[data-p15n]').forEach(btn => btn.addEventListener('click', () => { cancelAnimationFrame(raf); n = Number(btn.dataset.p15n); measure(n); prog = 1; show(); draw(); }));
    document.getElementById('p15raceGo').addEventListener('click', race);
    window.addEventListener('resize', () => { if (active()) draw(); });
    window.addEventListener('themechange', () => { if (active()) draw(); });
    measure(n); show(); draw();
  })();

  /* ---------- Section 4: sweep-line slider ---------- */
  (() => {
    const cv = document.getElementById('p15cvS'), sl = document.getElementById('p15St'); if (!cv || !sl) return;
    const M = [[1, 5], [2, 4], [3, 7], [4, 6], [8, 10]], T1 = 11;
    const active = () => document.getElementById('lesson15').classList.contains('active');
    const runningAt = t => M.filter(([s, e]) => s <= t && t < e).length;
    let best = 0; for (let t = 0; t < T1; t++) best = Math.max(best, runningAt(t));
    function draw() {
      if (!cv.clientWidth) return;
      const t = Number(sl.value);
      const { ctx: c, w, h } = fit(cv, Math.max(0.3, 190 / cv.clientWidth));
      c.clearRect(0, 0, w, h);
      const padL = 70, padR = 14, top = 10, axis = h - 22, rowH = (axis - top) / M.length, x = v => padL + (w - padL - padR) * v / T1;
      for (let v = 0; v <= T1; v++) { c.fillStyle = css('--border'); c.fillRect(x(v), top, 1, axis - top); text(c, String(v), x(v), axis + 11, css('--text-dim'), 11, 'center', 500); }
      M.forEach(([s, e], r) => {
        const on = s <= t && t < e, y = top + r * rowH + rowH * 0.2;
        text(c, `[${s}, ${e}]`, 8, y + rowH * 0.3, on ? css('--text-bright') : css('--text-dim'), 12, 'left', on ? 700 : 500);
        c.globalAlpha = on ? 1 : 0.35; c.fillStyle = on ? css('--teal') : css('--text-dim'); c.fillRect(x(s), y, x(e) - x(s), rowH * 0.6); c.globalAlpha = 1;
      });
      c.fillStyle = css('--orange'); c.fillRect(x(t) - 1, top - 4, 2, axis - top + 6);
    }
    function upd() { const t = Number(sl.value); const o = document.getElementById('p15StOut'); if (o) o.textContent = t; setVal('p15roT', t); setVal('p15roNow', runningAt(t)); setVal('p15roBest', best); draw(); }
    sl.addEventListener('input', upd);
    window.addEventListener('resize', () => { if (active()) draw(); });
    window.addEventListener('themechange', () => { if (active()) draw(); });
    upd();
  })();

  /* ---------- Section 5: the variant player ---------- */
  (() => {
    const el = document.getElementById('p15tpT'); if (!el) return;
    const player = TracePlayer(el, null, {});
    const V = {
      merge: () => { const r = mergeFrames([[7, 9], [1, 3], [2, 5], [10, 11], [6, 8]]); return { code: MERGE_CODE, frames: r.frames, res: JSON.stringify(r.out).replace(/,/g, ', '), work: `${r.checks} checks` }; },
      rooms: () => { const r = roomsFrames([[1, 5], [2, 4], [3, 7], [4, 6], [8, 10]]); return { code: ROOMS_CODE, frames: r.frames, res: r.best + ' rooms', work: `${r.events} events` }; },
      erase: () => { const r = eraseFrames([[1, 4], [2, 3], [3, 6], [5, 7], [6, 8]]); return { code: ERASE_CODE, frames: r.frames, res: r.removed + ' removed', work: `${r.checks} checks` }; }
    };
    const btns = document.querySelectorAll('[data-p15v]');
    function pick(k) {
      const v = V[k]();
      player.load({ code: v.code, frames: v.frames });
      btns.forEach(b => b.classList.toggle('btn-primary', b.dataset.p15v === k));
      setVal('p15roVr', v.res); setVal('p15roVw', v.work);
    }
    btns.forEach(b => b.addEventListener('click', () => pick(b.dataset.p15v)));
    pick('merge');
  })();

  /* ---------- Sandbox: run a template on your own intervals ---------- */
  (() => {
    const inp = document.getElementById('s15In'), err = document.getElementById('s15Err'), out = document.getElementById('s15Out'), tpEl = document.getElementById('s15Tp');
    if (!inp || !tpEl) return;
    const player = TracePlayer(tpEl, null, {});
    let mode = 'merge';
    const modeBtns = document.querySelectorAll('[data-s15m]');
    const setMode = m => { mode = m; modeBtns.forEach(b => b.classList.toggle('btn-primary', b.dataset.s15m === m)); };
    function parse(s) {
      if (/[^\d\s,\-\[\]()]/.test(s)) throw new Error('Use only numbers, commas, dashes and brackets, like 1-3, 2-5 or [1,3],[2,5].');
      const nums = (s.match(/\d+/g) || []).map(Number);
      if (!nums.length) throw new Error('Type at least one interval, for example: 1-3, 2-5, 8-10');
      if (nums.length % 2) throw new Error(`I found ${nums.length} numbers, but each interval needs two: a start and an end.`);
      const ivs = [];
      for (let k = 0; k < nums.length; k += 2) ivs.push([nums[k], nums[k + 1]]);
      if (ivs.length > 12) throw new Error(`That is ${ivs.length} intervals. Please use 12 or fewer so the picture stays readable.`);
      ivs.forEach((iv, k) => {
        if (iv[1] > 30) throw new Error(`Interval ${k + 1} ${lab(iv)} goes past 30. Please keep times from 0 to 30.`);
        if (iv[0] >= iv[1]) throw new Error(`Interval ${k + 1} ${lab(iv)} needs its end bigger than its start.`);
      });
      return ivs;
    }
    function run() {
      let ivs;
      try { ivs = parse(inp.value); } catch (e) { err.textContent = e.message; return; }
      err.textContent = '';
      let html;
      if (mode === 'merge') {
        const r = mergeFrames(ivs), b = pairChecks(ivs);
        player.load({ code: MERGE_CODE, frames: r.frames });
        html = `<span class="rk">merged:</span> <span class="rv">${fmtList(r.out)}</span><br><span class="rk">sort, then scan:</span> <span class="rv">${r.checks}</span> <span class="rk">checks (plus the sort)</span><br><span class="rk">compare every pair:</span> <span class="rv-o">${b}</span> <span class="rk">checks</span>`;
      } else if (mode === 'rooms') {
        const r = roomsFrames(ivs), b = roomsBruteTests(ivs);
        player.load({ code: ROOMS_CODE, frames: r.frames });
        html = `<span class="rk">rooms needed:</span> <span class="rv">${r.best}</span><br><span class="rk">sweep line:</span> <span class="rv">${r.events}</span> <span class="rk">events (plus the sort)</span><br><span class="rk">check every start against every meeting:</span> <span class="rv-o">${b}</span> <span class="rk">tests</span>`;
      } else {
        const r = eraseFrames(ivs), b = eraseBruteTried(ivs);
        player.load({ code: ERASE_CODE, frames: r.frames });
        html = `<span class="rk">fewest to remove:</span> <span class="rv">${r.removed}</span>${b.removed !== r.removed ? ' <span class="rv-o">(brute force disagrees!)</span>' : ''}<br><span class="rk">greedy by end:</span> <span class="rv">${r.checks}</span> <span class="rk">checks (plus the sort)</span><br><span class="rk">try every set to keep:</span> <span class="rv-o">${b.tried.toLocaleString('en-US')}</span> <span class="rk">sets</span>`;
      }
      out.innerHTML = html + `<br><span class="rk">intervals:</span> <span class="rv">${ivs.length}</span>`;
    }
    modeBtns.forEach(b => b.addEventListener('click', () => { setMode(b.dataset.s15m); run(); }));
    document.querySelectorAll('[data-s15ex]').forEach(b => b.addEventListener('click', () => { const [m, v] = b.dataset.s15ex.split('|'); setMode(m); inp.value = v; run(); }));
    document.getElementById('s15Run').addEventListener('click', run);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); run(); } });
    setMode('merge'); run();
  })();
})();
