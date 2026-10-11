// ======== SLOT 16: PATTERN LESSON, GREEDY ========
(() => {
  const KADANE_CODE = `def max_subarray(nums):
    best = nums[0]
    cur = 0
    for x in nums:
        cur = max(x, cur + x)
        best = max(best, cur)
    return best`;
  const BRUTE_CODE = `def max_subarray_brute(nums):
    best = nums[0]
    for i in range(len(nums)):
        total = 0
        for j in range(i, len(nums)):
            total += nums[j]
            best = max(best, total)
    return best`;
  const JUMP_CODE = `def can_jump(nums):
    reach = 0
    for i, step in enumerate(nums):
        if i > reach:
            return False
        reach = max(reach, i + step)
    return True`;
  const MEET_CODE = `def max_meetings(intervals):
    count, end = 0, float("-inf")
    for s, e in sorted(intervals, key=lambda iv: iv[1]):
        if s >= end:
            count += 1
            end = e
    return count`;
  const CAP = 60;
  const range = (a, b) => Array.from({ length: Math.max(0, b - a) }, (_, k) => a + k);

  // Counters with the same rules as measure.py.
  // Kadane steps = runs of `cur = max(x, cur + x)`; brute sums = runs of `total += nums[j]`.
  function kadaneCount(nums) {
    let best = nums[0], cur = 0, steps = 0;
    for (const x of nums) { steps++; cur = Math.max(x, cur + x); best = Math.max(best, cur); }
    return { best, steps };
  }
  function bruteCount(nums) {
    let best = nums[0], sums = 0;
    for (let i = 0; i < nums.length; i++) { let total = 0; for (let j = i; j < nums.length; j++) { sums++; total += nums[j]; best = Math.max(best, total); } }
    return { best, sums };
  }
  // reach steps = runs of `if i > reach`; brute marks = landing spots marked by the forward brute force.
  function jumpCount(nums) {
    let reach = 0, steps = 0;
    for (let i = 0; i < nums.length; i++) { steps++; if (i > reach) return { ok: false, steps }; reach = Math.max(reach, i + nums[i]); }
    return { ok: true, steps };
  }
  function jumpBrute(nums) {
    const n = nums.length, ok = new Array(n).fill(false); ok[0] = true; let marks = 0;
    for (let i = 0; i < n; i++) if (ok[i]) for (let j = 1; j <= nums[i]; j++) if (i + j < n) { marks++; ok[i + j] = true; }
    return { ok: ok[n - 1], marks };
  }

  // ---------- Template A trace: running sum, restart when it hurts ----------
  function kadaneFrames(nums) {
    const frames = [], L = s => lineOf(KADANE_CODE, s), n = nums.length;
    let best = nums[0], cur = 0, steps = 0, start = 0, bs = 0, be = 0, capAt = -1;
    const run = (a, b) => '[' + nums.slice(a, b + 1).join(', ') + ']';
    const arr = (i, extra) => Object.assign({ type: 'array', name: 'nums (blue = current run)', values: nums, pointers: i === null ? {} : { x: i }, hl: i === null ? [] : [i], dim: i === null ? [] : range(i + 1, n) }, extra);
    frames.push({ line: L('best = nums[0]'), note: `Start: best = ${best}, the first number, so the answer is a real run even if every number is negative.`, views: [arr(null), { type: 'vars', values: { cur: 0, best, steps: 0 } }] });
    for (let i = 0; i < n; i++) {
      const x = nums[i]; steps++;
      const ext = cur + x, restart = x > ext, tie = x === ext && i > 0;
      if (restart) start = i;
      cur = Math.max(x, ext);
      if (frames.length < CAP) {
        const why = i === 0 ? `First number: the run is just ${x}.` : restart ? `The old run (${ext - x}) is negative, so ${ext - x} + ${x} = ${ext} is worse than ${x} alone. Restart here: cur = ${x}.` : tie ? `The old run is worth 0, so extending or restarting both give ${cur}. Keep going.` : `Extend: the old run (${ext - x}) helps, ${ext - x} + ${x} = ${ext}. cur = ${cur}.`;
        frames.push({ line: L('cur = max(x, cur + x)'), note: `Step ${steps}, x = ${x}. ${why}`, views: [arr(i, { win: [start, i] }), { type: 'vars', values: { cur, best, steps } }] });
      }
      const better = cur > best;
      if (better) { best = cur; bs = start; be = i; }
      if (frames.length < CAP) {
        frames.push({ line: L('best = max(best, cur)'), note: better ? `New best: ${best}, the run ${run(bs, be)}.` : `best stays ${best} (cur = ${cur} is not bigger).`, views: [arr(i, { win: [start, i] }), { type: 'vars', values: { cur, best, steps } }] });
      } else if (capAt < 0) capAt = i;
    }
    if (capAt >= 0) frames.push({ line: L('cur = max(x, cur + x)'), note: `... ${n - capAt} more numbers, same rule: extend or restart, then update best.`, views: [arr(null), { type: 'vars', values: { cur, best, steps } }] });
    frames.push({ line: L('return best'), note: `Done after ${steps} steps, one per number. The best run is ${run(bs, be)} with total ${best}.`, result: best, views: [arr(null, { win: [bs, be] }), { type: 'vars', values: { cur, best, steps } }] });
    return { best, steps, frames, run: run(bs, be) };
  }

  // ---------- Brute force trace: one grid cell per run total ----------
  function bruteFrames(nums) {
    const n = nums.length, frames = [], L = s => lineOf(BRUTE_CODE, s);
    const rows = nums.map((_, r) => nums.map((__, c) => (c >= r ? '?' : null)));
    const labels = nums.map((x, k) => `${k}: ${x}`);
    let best = nums[0], sums = 0, bc = null;
    const grid = hl => ({ type: 'grid', name: 'run totals (row = first, column = last)', rows: rows.map(r => r.slice()), rowLabels: labels, colLabels: labels, hl, src: bc ? [bc] : [] });
    frames.push({ line: L('best = nums[0]'), note: `Every "?" is a run to add up: ${n * (n + 1) / 2} runs for ${n} numbers.`, views: [grid([]), { type: 'vars', values: { best, sums: 0 } }] });
    for (let i = 0; i < n; i++) {
      let total = 0;
      for (let j = i; j < n; j++) {
        sums++; total += nums[j]; rows[i][j] = total;
        const better = total > best;
        if (better) { best = total; bc = [i, j]; }
        if (frames.length < CAP) frames.push({ line: L('total += nums[j]'), note: `Run ${sums}: from index ${i} to ${j}, total ${total}.${better ? ' New best (blue cell).' : ''}`, views: [grid([[i, j]]), { type: 'vars', values: { i, j, total, best, sums } }] });
      }
    }
    if (frames.length >= CAP) frames.push({ line: L('total += nums[j]'), note: `... more runs, same rule, ${sums} in total.`, views: [grid([]), { type: 'vars', values: { best, sums } }] });
    frames.push({ line: L('return best'), note: `Every run added up: ${sums} run totals. Best ${best}, the same answer, with far more work.`, result: best, views: [grid(bc ? [bc] : []), { type: 'vars', values: { best, sums } }] });
    return { best, sums, frames };
  }

  // ---------- Template B trace: the reach pointer ----------
  function jumpFrames(nums) {
    const frames = [], L = s => lineOf(JUMP_CODE, s), n = nums.length;
    let reach = 0, steps = 0;
    const arr = (i, extra) => Object.assign({ type: 'array', name: 'nums (blue = reachable so far)', values: nums, pointers: Object.assign(i === null ? {} : { i }, { reach }), win: [0, Math.min(reach, n - 1)], dim: range(Math.min(reach, n - 1) + 1, n) }, extra);
    frames.push({ line: L('reach = 0'), note: 'Start on index 0. reach = 0: so far you can only stand here.', views: [arr(null), { type: 'vars', values: { reach, steps } }] });
    for (let i = 0; i < n; i++) {
      steps++;
      if (frames.length >= CAP) { frames.push({ line: L('if i > reach'), note: `... ${n - i} more spots, same rule.`, views: [arr(null), { type: 'vars', values: { reach, steps } }] }); break; }
      const stuck = i > reach;
      frames.push({ line: L('if i > reach'), note: `Check ${steps}: can I stand on index ${i}? ${stuck ? `No: ${i} is past reach ${reach}.` : `Yes: ${i} is within reach ${reach}.`}`, views: [arr(i, { hl: [i], bad: stuck ? [i] : [] }), { type: 'vars', values: { i, reach, steps } }] });
      if (stuck) {
        frames.push({ line: L('return False'), note: `Stuck after ${steps} checks. Nothing before index ${i} jumps far enough.`, result: false, views: [arr(i, { bad: [i] }), { type: 'vars', values: { i, reach, steps } }] });
        return { ok: false, steps, frames };
      }
      const old = reach; reach = Math.max(reach, i + nums[i]);
      frames.push({ line: L('reach = max(reach, i + step)'), note: reach > old ? `From index ${i} you can jump ${nums[i]}, to ${i + nums[i]}. Reach grows to ${reach}.` : `From index ${i} you get to ${i + nums[i]} at most, which is not past ${old}. Reach stays ${reach}.`, views: [arr(i, { hl: [i] }), { type: 'vars', values: { i, step: nums[i], reach, steps } }] });
    }
    frames.push({ line: L('return True'), note: `Every spot was reachable after ${steps} checks, so the last one is too.`, result: true, views: [arr(null), { type: 'vars', values: { reach, steps } }] });
    return { ok: true, steps, frames };
  }

  // ---------- Template C trace: sort by end, take if it fits ----------
  function meetFrames(ivs) {
    const frames = [], L = s => lineOf(MEET_CODE, s), lab = iv => `[${iv[0]}, ${iv[1]}]`;
    const sorted = ivs.map(iv => iv.slice()).sort((a, b) => a[1] - b[1]);
    const booked = []; let count = 0, end = '-inf', checks = 0;
    const view = (k, extra) => Object.assign({ type: 'array', name: 'sorted by end', values: sorted.map(lab), pointers: k === null ? {} : { k } }, extra);
    frames.push({ line: L('count, end = 0'), note: `The input, unsorted: ${ivs.map(lab).join(' ')}. Nothing booked yet.`, views: [{ type: 'array', name: 'intervals', values: ivs.map(lab) }, { type: 'set', name: 'booked', values: [] }, { type: 'vars', values: { count, end, checks } }] });
    frames.push({ line: L('sorted(intervals'), note: 'Sort by end time. The meeting that frees the room first comes first.', views: [view(null), { type: 'set', name: 'booked', values: [] }, { type: 'vars', values: { count, end, checks } }] });
    const skipped = [];
    sorted.forEach(([s, e], k) => {
      checks++;
      const fits = end === '-inf' || s >= end;
      frames.push({ line: L('if s >= end'), note: `Check ${checks}: ${lab([s, e])} starts at ${s}; the room is free from ${end}. ${fits ? 'It fits.' : 'It overlaps: skip it.'}`, views: [view(k, { hl: [k], bad: fits ? skipped.slice() : skipped.concat([k]) }), { type: 'set', name: 'booked', values: booked.slice() }, { type: 'vars', values: { count, end, checks } }] });
      if (fits) {
        count++; end = e; booked.push(lab([s, e]));
        frames.push({ line: L('end = e'), note: `Book ${lab([s, e])}. count = ${count}, and the room is busy until ${e}.`, views: [view(k, { hl: [k], bad: skipped.slice() }), { type: 'set', name: 'booked', values: booked.slice(), new: lab([s, e]) }, { type: 'vars', values: { count, end, checks } }] });
      } else skipped.push(k);
    });
    frames.push({ line: L('return count'), note: `${count} meetings booked after ${checks} checks. Red ones overlapped.`, result: count, views: [view(null, { bad: skipped }), { type: 'set', name: 'booked', values: booked.slice() }, { type: 'vars', values: { count, end, checks } }] });
    return { count, checks, frames };
  }

  const setVal = (id, v) => { const el = document.getElementById(id); if (!el) return; el.querySelector('.val').textContent = v; flash(el); };
  const active = () => { const p = document.getElementById('lesson16'); return p && p.classList.contains('active'); };
  const num = v => Math.round(v).toLocaleString('en-US');

  /* ---------- Section 1: the two players ---------- */
  (() => {
    const pic = [2, -3, 4, -1, 2, -5, 3];
    const a = kadaneFrames(pic), b = bruteFrames(pic);
    const elA = document.getElementById('p16tpA'), elB = document.getElementById('p16tpB');
    if (elA) TracePlayer(elA, { frames: a.frames }, { code: false });
    if (elB) TracePlayer(elB, { frames: b.frames }, { code: false });
    setVal('p16roA', a.steps); setVal('p16roB', b.sums); setVal('p16roC', a.best === b.best ? a.best : `${a.best} vs ${b.best}`);
  })();

  /* ---------- Section 2: the coin machine ---------- */
  function greedyCoins(coins, amount) {
    const picks = [];
    for (const c of coins.slice().sort((x, y) => y - x)) { const take = Math.floor(amount / c); for (let t = 0; t < take; t++) picks.push(c); amount -= take * c; }
    return amount === 0 ? picks : null;
  }
  function bestCoins(coins, amount) {
    const dp = [0].concat(new Array(amount).fill(Infinity)), last = new Array(amount + 1).fill(0);
    for (let a = 1; a <= amount; a++) for (const c of coins) if (c <= a && dp[a - c] + 1 < dp[a]) { dp[a] = dp[a - c] + 1; last[a] = c; }
    if (dp[amount] === Infinity) return null;
    const picks = []; let a = amount; while (a) { picks.push(last[a]); a -= last[a]; }
    return picks.sort((x, y) => y - x);
  }
  (() => {
    const cv = document.getElementById('p16cvC'), sl = document.getElementById('p16amt'), out = document.getElementById('p16amtOut');
    if (!cv || !sl) return;
    const btns = document.querySelectorAll('[data-p16coins]');
    let coins = [1, 3, 4];
    function draw() {
      if (!cv.clientWidth) return;
      const amount = Number(sl.value), g = greedyCoins(coins, amount), d = bestCoins(coins, amount);
      const { ctx: c, w, h } = fit(cv, Math.max(0.22, 130 / cv.clientWidth));
      c.clearRect(0, 0, w, h);
      const loses = g.length > d.length, labW = Math.min(110, w * 0.26), pad = 10;
      const maxN = Math.max(g.length, d.length, 4), r = Math.max(7, Math.min(17, (w - labW - 2 * pad) / (maxN * 2.25)));
      const rows = [
        { label: 'greedy', sub: `${g.length} coins`, picks: g, col: loses ? css('--orange') : css('--teal'), y: h * 0.3 },
        { label: 'fewest', sub: `${d.length} coins`, picks: d, col: css('--teal'), y: h * 0.72 }
      ];
      rows.forEach(R => {
        text(c, R.label, pad, R.y - 8, css('--text-bright'), 12, 'left', 700);
        text(c, R.sub, pad, R.y + 9, R.col, 12, 'left', 700);
        R.picks.forEach((v, k) => {
          const x = labW + r + k * r * 2.25, y = R.y;
          c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2);
          c.fillStyle = css('--bg-surface'); c.fill(); c.lineWidth = 2; c.strokeStyle = R.col; c.stroke();
          text(c, String(v), x, y + 1, css('--text-bright'), Math.max(9, Math.round(r * 0.8)), 'center', 700);
        });
      });
      out.textContent = amount;
      setVal('p16roG', `${g.length} (${g.join(' + ')})`);
      setVal('p16roD', `${d.length} (${d.join(' + ')})`);
      let lossN = 0, first = null;
      for (let a = 1; a <= 40; a++) if (greedyCoins(coins, a).length > bestCoins(coins, a).length) { lossN++; if (first === null) first = a; }
      setVal('p16roL', lossN); setVal('p16roF', first === null ? 'never' : first);
    }
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        coins = btn.dataset.p16coins.split(',').map(Number);
        btns.forEach(o => { const on = o === btn; o.classList.toggle('primary', on); o.setAttribute('aria-pressed', on ? 'true' : 'false'); });
        draw();
      });
      const on = btn.dataset.p16coins === '1,3,4';
      btn.classList.toggle('primary', on); btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    sl.addEventListener('input', draw);
    window.addEventListener('resize', () => { if (active()) draw(); });
    window.addEventListener('themechange', () => { if (active()) draw(); });
    draw();
  })();

  /* ---------- Section 5: template players ---------- */
  (() => {
    const el = document.getElementById('p16tpR'); if (!el) return;
    const player = TracePlayer(el, { code: JUMP_CODE, frames: jumpFrames([3, 1, 0, 2, 0, 1]).frames }, { code: false });
    const btns = document.querySelectorAll('[data-p16jump]');
    btns.forEach((btn, k) => {
      btn.classList.toggle('primary', k === 0);
      btn.addEventListener('click', () => {
        btns.forEach(o => o.classList.toggle('primary', o === btn));
        player.load({ code: JUMP_CODE, frames: jumpFrames(btn.dataset.p16jump.split(',').map(Number)).frames });
      });
    });
  })();
  (() => {
    const el = document.getElementById('p16tpI'); if (!el) return;
    TracePlayer(el, { code: MEET_CODE, frames: meetFrames([[5, 9], [1, 3], [6, 8], [2, 5], [8, 10], [4, 6]]).frames }, { code: false });
  })();

  /* ---------- Section 8: the operation race ---------- */
  (() => {
    const cv = document.getElementById('p16cvR'), sl = document.getElementById('p16n'), out = document.getElementById('p16nOut');
    if (!cv || !sl) return;
    let n = 10, kad = 10, brute = 55, prog = 1, raf = 0;
    const measure = k => { const nums = Array.from({ length: k }, (_, t) => (t % 2 ? -t : t)); kad = kadaneCount(nums).steps; brute = bruteCount(nums).sums; };
    function draw() {
      if (!cv.clientWidth) return;
      const { ctx: c, w, h } = fit(cv, Math.max(0.26, 150 / cv.clientWidth));
      c.clearRect(0, 0, w, h);
      const pad = 12, track = w - 2 * pad, done = prog * brute;
      [
        { label: 'running-sum scan, O(n)', total: kad, unit: 'steps', col: css('--teal'), y: h * 0.3 },
        { label: 'add up every run, O(n^2)', total: brute, unit: 'run totals', col: css('--orange'), y: h * 0.74 }
      ].forEach(L => {
        const got = Math.min(L.total, done), fin = got >= L.total;
        text(c, L.label, pad, L.y - 16, css('--text-bright'), 12, 'left', 600);
        text(c, `${num(got)} ${L.unit}${fin ? ', done' : ''}`, w - pad, L.y - 16, L.col, 12, 'right', 700);
        c.fillStyle = css('--bg-input'); c.fillRect(pad, L.y, track, 12);
        c.fillStyle = L.col; c.fillRect(pad, L.y, Math.max(2, track * got / brute), 12);
      });
    }
    function show() { out.textContent = n; setVal('p16roS', num(kad)); setVal('p16roP', num(brute)); setVal('p16roX', (brute / kad).toFixed(1) + 'x'); }
    function race() {
      cancelAnimationFrame(raf);
      if (RM) { prog = 1; draw(); return; }
      const t0 = performance.now(), dur = 2500;
      const tick = t => { prog = Math.min(1, (t - t0) / dur); draw(); if (prog < 1 && active()) raf = requestAnimationFrame(tick); else { prog = 1; draw(); } };
      prog = 0; raf = requestAnimationFrame(tick);
    }
    sl.addEventListener('input', () => { cancelAnimationFrame(raf); n = Number(sl.value); measure(n); prog = 1; show(); draw(); });
    document.getElementById('p16raceGo').addEventListener('click', race);
    window.addEventListener('resize', () => { if (active()) draw(); });
    window.addEventListener('themechange', () => { if (active()) draw(); });
    measure(n); show(); draw();
  })();

  /* ---------- Sandbox: greedy scanner ---------- */
  (() => {
    const inp = document.getElementById('s16In'), err = document.getElementById('s16Err'), out = document.getElementById('s16Out'), tpEl = document.getElementById('s16Tp'), lab = document.getElementById('s16Lab');
    if (!inp || !tpEl) return;
    const player = TracePlayer(tpEl, null, {});
    const modeBtns = document.querySelectorAll('[data-s16mode]');
    let mode = 'max';
    function setMode(m) {
      mode = m;
      modeBtns.forEach(b => { const on = b.dataset.s16mode === m; b.classList.toggle('btn-primary', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      lab.textContent = m === 'max' ? 'nums: gains and losses (up to 20 whole numbers)' : 'nums: longest jump from each spot (up to 20 numbers, 0 or more)';
    }
    function parse(s) {
      const parts = s.split(',').map(t => t.trim());
      if (parts.length && parts[parts.length - 1] === '') parts.pop();
      if (!parts.length || (parts.length === 1 && parts[0] === '')) throw new Error('Type at least one number, for example: 2, -3, 4');
      if (parts.length > 20) throw new Error(`That is ${parts.length} numbers. Please use 20 or fewer so the trace stays readable.`);
      return parts.map((t, k) => {
        if (!/^-?\d{1,3}$/.test(t)) throw new Error(`Item ${k + 1} ("${t || 'empty'}") is not a whole number between -999 and 999. Use digits and commas, like 4, -2, 7.`);
        const v = Number(t);
        if (mode === 'jump' && v < 0) throw new Error(`Item ${k + 1} is ${v}. A jump length cannot be negative: use 0 or more.`);
        if (mode === 'jump' && v > 50) throw new Error(`Item ${k + 1} is ${v}. Please keep jump lengths at 50 or less.`);
        return v;
      });
    }
    function run() {
      let nums;
      try { nums = parse(inp.value); } catch (e) { err.textContent = e.message; return; }
      err.textContent = '';
      if (mode === 'max') {
        const k = kadaneFrames(nums), b = bruteCount(nums);
        player.load({ code: KADANE_CODE, frames: k.frames });
        out.innerHTML = `<span class="rk">best total:</span> <span class="rv">${k.best}</span> <span class="rk">from the run</span> <span class="rv">${k.run}</span><br>` +
          `<span class="rk">running-sum scan:</span> <span class="rv">${k.steps}</span> <span class="rk">steps</span><br>` +
          `<span class="rk">add up every run:</span> <span class="rv-o">${b.sums}</span> <span class="rk">run totals (best ${b.best})</span>`;
      } else {
        const j = jumpFrames(nums), b = jumpBrute(nums);
        player.load({ code: JUMP_CODE, frames: j.frames });
        out.innerHTML = `<span class="rk">can reach the last spot:</span> <span class="rv">${j.ok ? 'True' : 'False'}</span><br>` +
          `<span class="rk">reach pointer:</span> <span class="rv">${j.steps}</span> <span class="rk">checks</span><br>` +
          `<span class="rk">mark every landing spot:</span> <span class="rv-o">${b.marks}</span> <span class="rk">marks (answer ${b.ok ? 'True' : 'False'})</span>`;
      }
    }
    modeBtns.forEach(b => b.addEventListener('click', () => { setMode(b.dataset.s16mode); inp.value = b.dataset.s16mode === 'max' ? '2, -3, 4, -1, 2, -5, 3' : '3, 1, 0, 2, 0, 1'; run(); }));
    document.querySelectorAll('[data-s16ex]').forEach(btn => btn.addEventListener('click', () => { setMode(btn.dataset.s16m); inp.value = btn.dataset.s16ex; run(); }));
    document.getElementById('s16Run').addEventListener('click', run);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); run(); } });
    setMode('max'); run();
  })();
})();
