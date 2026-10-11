// ======== SLOT 1: PATTERN LESSON, ARRAYS AND HASHING ========
(() => {
  const SEEN_CODE = `def has_repeat(nums):
    seen = set()
    for x in nums:
        if x in seen:
            return True
        seen.add(x)
    return False`;
  const BRUTE_CODE = `def has_repeat_brute(nums):
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            if nums[i] == nums[j]:
                return True
    return False`;
  const CAP = 60;

  // Counters with the same rules as measure.py: steps = runs of `if x in seen`, comparisons = runs of `nums[i] == nums[j]`.
  function scanCount(nums) {
    const seen = new Set(); let steps = 0;
    for (const x of nums) { steps++; if (seen.has(x)) return { found: true, steps }; seen.add(x); }
    return { found: false, steps };
  }
  function bruteCount(nums) {
    let comps = 0;
    for (let i = 0; i < nums.length; i++) for (let j = i + 1; j < nums.length; j++) { comps++; if (nums[i] === nums[j]) return { found: true, comps }; }
    return { found: false, comps };
  }

  // Trace of the one-pass set scan.
  function scanFrames(nums) {
    const frames = [], seen = [], L = s => lineOf(SEEN_CODE, s);
    const arr = (extra) => Object.assign({ type: 'array', name: 'nums', values: nums }, extra);
    frames.push({ line: L('seen = set()'), note: 'Start with an empty set: the coat check has no coats yet.', views: [arr({}), { type: 'set', name: 'seen', values: [] }, { type: 'vars', values: { steps: 0 } }] });
    let steps = 0;
    for (let i = 0; i < nums.length; i++) {
      const x = nums[i]; steps++;
      if (frames.length >= CAP) { frames.push({ line: L('if x in seen'), note: `... more steps, same rule: ask "is it in seen?", then add it.`, views: [arr({ pointers: { i }, hl: [i] }), { type: 'set', name: 'seen', values: seen.slice() }, { type: 'vars', values: { steps } }] }); break; }
      const hit = seen.includes(x);
      frames.push({ line: L('if x in seen'), note: `Step ${steps}: is ${x} in seen? ${hit ? 'Yes, one glance finds it.' : 'No, it is not among the chips.'}`, views: [arr({ pointers: { i }, hl: [i], dim: nums.map((_, k) => k).filter(k => k > i) }), { type: 'set', name: 'seen', values: seen.slice(), hl: hit ? x : undefined }, { type: 'vars', values: { x, steps } }] });
      if (hit) {
        const first = nums.indexOf(x);
        frames.push({ line: L('return True'), note: `${x} was already seen at index ${first}. Stop now: ${steps} steps.`, result: 'True', views: [arr({ pointers: { i }, bad: [first, i] }), { type: 'set', name: 'seen', values: seen.slice(), hl: x }, { type: 'vars', values: { x, steps } }] });
        return { found: true, steps, frames };
      }
      seen.push(x);
      frames.push({ line: L('seen.add(x)'), note: `Remember ${x}: it becomes a new chip in seen.`, views: [arr({ pointers: { i }, hl: [i], dim: nums.map((_, k) => k).filter(k => k > i) }), { type: 'set', name: 'seen', values: seen.slice(), new: x }, { type: 'vars', values: { x, steps } }] });
    }
    frames.push({ line: L('return False'), note: `End of the list and no repeat: ${steps} steps, one per number.`, result: 'False', views: [arr({}), { type: 'set', name: 'seen', values: seen.slice() }, { type: 'vars', values: { steps } }] });
    return { found: false, steps, frames };
  }

  // Trace of the brute force: one grid cell per pair comparison.
  function bruteFrames(nums) {
    const n = nums.length, frames = [], L = s => lineOf(BRUTE_CODE, s);
    const rows = nums.map((_, r) => nums.map((__, c) => (c > r ? '?' : null)));
    const labels = nums.map((x, k) => `${k}: ${x}`);
    const grid = hl => ({ type: 'grid', name: 'pairs (row i, column j)', rows: rows.map(r => r.slice()), rowLabels: labels, colLabels: labels, hl });
    frames.push({ line: L('n = len(nums)'), note: `Every "?" is a pair that may need comparing: ${n * (n - 1) / 2} pairs for ${n} numbers.`, views: [{ type: 'array', name: 'nums', values: nums }, grid([]), { type: 'vars', values: { comparisons: 0 } }] });
    let comps = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      comps++;
      const eq = nums[i] === nums[j];
      rows[i][j] = eq ? '=' : 'x';
      frames.push({ line: L('if nums[i] == nums[j]'), note: `Comparison ${comps}: nums[${i}] = ${nums[i]} and nums[${j}] = ${nums[j]}. ${eq ? 'Equal!' : 'Different.'}`, views: [{ type: 'array', name: 'nums', values: nums, pointers: { i, j }, hl: [i, j] }, grid([[i, j]]), { type: 'vars', values: { i, j, comparisons: comps } }] });
      if (eq) {
        frames.push({ line: L('return True'), note: `Found a repeat after ${comps} comparisons.`, result: 'True', views: [{ type: 'array', name: 'nums', values: nums, pointers: { i, j }, bad: [i, j] }, grid([[i, j]]), { type: 'vars', values: { comparisons: comps } }] });
        return { found: true, comps, frames };
      }
    }
    frames.push({ line: L('return False'), note: `Every pair checked, no repeat: ${comps} comparisons.`, result: 'False', views: [{ type: 'array', name: 'nums', values: nums }, grid([]), { type: 'vars', values: { comparisons: comps } }] });
    return { found: false, comps, frames };
  }

  const setVal = (id, v) => { const el = document.getElementById(id); if (!el) return; el.querySelector('.val').textContent = v; flash(el); };

  /* ---------- Section 1: the two players ---------- */
  (() => {
    const pic = [5, 2, 8, 1, 9, 2];
    const a = scanFrames(pic), b = bruteFrames(pic);
    const elA = document.getElementById('p1tpA'), elB = document.getElementById('p1tpB');
    if (elA) TracePlayer(elA, { frames: a.frames }, { code: false });
    if (elB) TracePlayer(elB, { frames: b.frames }, { code: false });
    setVal('p1roA', a.steps); setVal('p1roB', b.comps);
  })();

  /* ---------- Section 2: the operation race ---------- */
  (() => {
    const cv = document.getElementById('p1cvA'); if (!cv) return;
    const active = () => document.getElementById('lesson1').classList.contains('active');
    let n = 10, scan = 10, pairs = 45, prog = 1, raf = 0;
    const measure = k => { const nums = Array.from({ length: k }, (_, t) => t); scan = scanCount(nums).steps; pairs = bruteCount(nums).comps; };
    const num = v => Math.round(v).toLocaleString('en-US');
    function draw() {
      if (!cv.clientWidth) return;
      const { ctx: c, w, h } = fit(cv, Math.max(0.26, 150 / cv.clientWidth));
      c.clearRect(0, 0, w, h);
      const pad = 12, track = w - 2 * pad, done = prog * pairs;
      const lanes = [
        { label: 'seen-it scan, O(n)', total: scan, unit: 'steps', col: css('--teal'), y: h * 0.3 },
        { label: 'compare every pair, O(n^2)', total: pairs, unit: 'comparisons', col: css('--orange'), y: h * 0.74 }
      ];
      lanes.forEach(L => {
        const got = Math.min(L.total, done), fin = got >= L.total;
        text(c, L.label, pad, L.y - 16, css('--text-bright'), 12, 'left', 600);
        text(c, `${num(got)} ${L.unit}${fin ? ', done' : ''}`, w - pad, L.y - 16, L.col, 12, 'right', 700);
        c.fillStyle = css('--bg-input'); c.fillRect(pad, L.y, track, 12);
        c.fillStyle = L.col; c.fillRect(pad, L.y, Math.max(2, track * got / pairs), 12);
      });
    }
    function show() { setVal('p1roN', n); setVal('p1roS', num(scan)); setVal('p1roP', num(pairs)); setVal('p1roR', (pairs / scan).toFixed(1) + 'x'); }
    function race() {
      cancelAnimationFrame(raf);
      if (RM) { prog = 1; draw(); return; }
      const t0 = performance.now(), dur = 2500;
      const tick = t => { prog = Math.min(1, (t - t0) / dur); draw(); if (prog < 1 && active()) raf = requestAnimationFrame(tick); else { prog = 1; draw(); } };
      prog = 0; raf = requestAnimationFrame(tick);
    }
    document.querySelectorAll('[data-p1n]').forEach(btn => btn.addEventListener('click', () => {
      cancelAnimationFrame(raf); n = Number(btn.dataset.p1n); measure(n); prog = 1; show(); draw();
    }));
    document.getElementById('p1raceGo').addEventListener('click', race);
    window.addEventListener('resize', () => { if (active()) draw(); });
    window.addEventListener('themechange', () => { if (active()) draw(); });
    measure(n); show(); draw();
  })();

  /* ---------- Sandbox: seen-it scanner ---------- */
  (() => {
    const inp = document.getElementById('s1In'), err = document.getElementById('s1Err'), out = document.getElementById('s1Out'), tpEl = document.getElementById('s1Tp');
    if (!inp || !tpEl) return;
    const player = TracePlayer(tpEl, null, {});
    function parse(s) {
      const parts = s.split(',').map(t => t.trim());
      if (parts.length && parts[parts.length - 1] === '') parts.pop();
      if (!parts.length) throw new Error('Type at least one number, for example: 3, 8, 1');
      if (parts.length > 25) throw new Error(`That is ${parts.length} numbers. Please use 25 or fewer so the trace stays readable.`);
      return parts.map((t, k) => {
        if (!/^-?\d{1,6}$/.test(t)) throw new Error(`Item ${k + 1} ("${t || 'empty'}") is not a whole number. Use digits and commas, like 4, -2, 7.`);
        return Number(t);
      });
    }
    function run() {
      let nums;
      try { nums = parse(inp.value); } catch (e) { err.textContent = e.message; return; }
      err.textContent = '';
      const s = scanFrames(nums), b = bruteCount(nums);
      player.load({ code: SEEN_CODE, frames: s.frames });
      out.innerHTML = `<span class="rk">repeat found:</span> <span class="rv">${s.found ? 'True' : 'False'}</span><br>` +
        `<span class="rk">seen-it scan:</span> <span class="rv">${s.steps}</span> <span class="rk">steps</span><br>` +
        `<span class="rk">compare every pair:</span> <span class="rv-o">${b.comps}</span> <span class="rk">comparisons</span><br>` +
        `<span class="rk">numbers in the list:</span> <span class="rv">${nums.length}</span>`;
    }
    document.querySelectorAll('[data-s1ex]').forEach(btn => btn.addEventListener('click', () => { inp.value = btn.dataset.s1ex; run(); }));
    document.getElementById('s1Run').addEventListener('click', run);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); run(); } });
    run();
  })();
})();
