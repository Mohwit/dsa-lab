// ======== SLOT 8: PATTERN LESSON, PREFIX SUMS ========
(() => {
  const CAP = 60;
  const RANGE_CODE = `def range_sums(nums, queries):
    prefix = [0] * (len(nums) + 1)
    for i in range(len(nums)):
        prefix[i + 1] = prefix[i] + nums[i]
    answers = []
    for l, r in queries:
        answers.append(prefix[r + 1] - prefix[l])
    return answers`;
  const COUNT_CODE = `def count_sum_k(nums, k):
    counts = {0: 1}
    prefix = 0
    found = 0
    for x in nums:
        prefix += x
        found += counts.get(prefix - k, 0)
        counts[prefix] = counts.get(prefix, 0) + 1
    return found`;
  const BAL_CODE = `def longest_balanced(bits):
    first = {0: -1}
    balance = 0
    best = 0
    for i, b in enumerate(bits):
        balance += 1 if b == 1 else -1
        if balance in first:
            best = max(best, i - first[balance])
        else:
            first[balance] = i
    return best`;
  const num = v => Number(v).toLocaleString('en-US');
  const setVal = (id, v) => { const el = document.getElementById(id); if (!el) return; el.querySelector('.val').textContent = v; flash(el); };
  const range = (a, b) => Array.from({ length: Math.max(0, b - a) }, (_, k) => a + k);
  const capped = (frames, push) => { let skipped = 0; return { push: f => { if (frames.length < CAP) frames.push(f); else skipped++; }, get skipped() { return skipped; } }; };

  /* ---------- counters with the same rules as measure.py ---------- */
  function slowCount(nums, queries) { let ops = 0; const out = []; for (const [l, r] of queries) { let t = 0; for (let i = l; i <= r; i++) { t += nums[i]; ops++; } out.push(t); } return { out, ops }; }
  function fastCount(nums, queries) {
    const prefix = [0]; let ops = 0;
    for (let i = 0; i < nums.length; i++) { prefix.push(prefix[i] + nums[i]); ops++; }
    const out = queries.map(([l, r]) => { ops++; return prefix[r + 1] - prefix[l]; });
    return { out, ops, prefix };
  }
  function bruteSums(nums, k) { let ops = 0, found = 0; for (let i = 0; i < nums.length; i++) { let t = 0; for (let j = i; j < nums.length; j++) { t += nums[j]; ops++; if (t === k) found++; } } return { found, ops }; }

  /* ---------- section 1: slow re-adding (no code) ---------- */
  function slowFrames(nums, queries) {
    const frames = [], C = capped(frames); let ops = 0;
    const arr = x => Object.assign({ type: 'array', name: 'nums', values: nums }, x);
    queries.forEach(([l, r], qi) => {
      let total = 0;
      C.push({ note: `Question ${qi + 1}: sum of index ${l}..${r}. Start a fresh total at 0.`, views: [arr({ win: [l, r], pointers: { l, r } }), { type: 'vars', values: { question: `${l}..${r}`, total, operations: ops } }] });
      for (let i = l; i <= r; i++) {
        total += nums[i]; ops++;
        C.push({ note: `Add nums[${i}] = ${nums[i]}. Total so far: ${total}.`, views: [arr({ win: [l, r], pointers: { i }, hl: [i] }), { type: 'vars', values: { question: `${l}..${r}`, total, operations: ops } }] });
      }
      C.push({ note: `Answer ${qi + 1}: ${total}, after ${r - l + 1} additions. The next question starts from zero again.`, views: [arr({ win: [l, r] }), { type: 'vars', values: { question: `${l}..${r}`, total, operations: ops } }] });
    });
    if (C.skipped) frames.push({ note: `... ${C.skipped} more steps, same rule.`, views: [arr({}), { type: 'vars', values: { operations: ops } }] });
    frames.push({ note: `All ${queries.length} questions answered: ${ops} additions in total.`, result: slowCount(nums, queries).out, views: [arr({}), { type: 'vars', values: { operations: ops } }] });
    return { ops, frames };
  }

  /* ---------- prefix build + questions (used without code in section 1, with code in template A and the sandbox) ---------- */
  function prefixFrames(nums, queries) {
    const frames = [], C = capped(frames), L = s => lineOf(RANGE_CODE, s), n = nums.length;
    const prefix = new Array(n + 1).fill(null); prefix[0] = 0;
    let ops = 0; const answers = [];
    const views = (np, pp, extra) => [Object.assign({ type: 'array', name: 'nums', values: nums }, np), Object.assign({ type: 'array', name: 'prefix (reading before index i)', values: prefix.map(v => (v === null ? '' : v)) }, pp), { type: 'vars', values: Object.assign({ operations: ops }, extra || {}) }];
    C.push({ line: L('prefix = [0]'), note: `Make ${n + 1} slots. prefix[0] = 0: the reading before anything is added.`, views: views({}, { hl: [0] }) });
    for (let i = 0; i < n; i++) {
      prefix[i + 1] = prefix[i] + nums[i]; ops++;
      C.push({ line: L('prefix[i + 1] = prefix[i] + nums[i]'), note: `prefix[${i + 1}] = prefix[${i}] + nums[${i}] = ${prefix[i]} + ${nums[i]} = ${prefix[i + 1]}.`, views: views({ pointers: { i }, hl: [i] }, { hl: [i + 1], pointers: { 'i+1': i + 1 } }) });
    }
    queries.forEach(([l, r], qi) => {
      const a = prefix[r + 1] - prefix[l]; ops++; answers.push(a);
      C.push({ line: L('answers.append'), note: `Question ${qi + 1}, index ${l}..${r}: prefix[${r + 1}] - prefix[${l}] = ${prefix[r + 1]} - ${prefix[l]} = ${a}. One subtraction.`, views: views({ win: [l, r] }, { hl: [l, r + 1], pointers: { l, 'r+1': r + 1 } }, { answer: a }) });
    });
    if (C.skipped) frames.push({ line: L('answers.append'), note: `... ${C.skipped} more steps, same rule.`, views: views({}, {}) });
    frames.push({ line: L('return answers'), note: `Done: ${n} additions to build, ${queries.length} subtractions to answer. ${ops} operations.`, result: answers, views: views({}, {}) });
    return { ops, answers, frames };
  }

  /* ---------- template B: prefix count map ---------- */
  function countFrames(nums, k) {
    const frames = [], C = capped(frames), L = s => lineOf(COUNT_CODE, s);
    const counts = new Map([[0, 1]]); let prefix = 0, found = 0, steps = 0;
    const ends = [];   // stretches found, as [l, r]
    const firstAt = new Map([[0, [-1]]]);   // reading -> indices where it happened (for drawing the found stretches)
    const mapView = (hl, fresh) => ({ type: 'map', name: 'counts (reading : times seen)', entries: [...counts.entries()], hl, new: fresh });
    const arr = x => Object.assign({ type: 'array', name: 'nums', values: nums }, x);
    C.push({ line: L('counts = {0: 1}'), note: `Seed the map: reading 0 (nothing added yet) seen once. Looking for stretches that sum to k = ${k}.`, views: [arr({}), mapView(0), { type: 'vars', values: { k, prefix, found } }] });
    nums.forEach((x, i) => {
      prefix += x; steps++;
      const need = prefix - k, got = counts.get(need) || 0;
      const starts = got ? (firstAt.get(need) || []).map(j => j + 1) : [];
      C.push({ line: L('found += counts.get'), note: `Index ${i}: reading = ${prefix}. Need an earlier reading of ${prefix} - ${k} = ${need}. The map has it ${got} time${got === 1 ? '' : 's'}${got ? `: stretch${got > 1 ? 'es' : ''} ${starts.map(s => `${s}..${i}`).join(', ')}` : ''}.`,
        views: [arr({ pointers: { i }, hl: [i], win: got ? [starts[0], i] : undefined }), mapView(got ? need : undefined), { type: 'vars', values: { k, prefix, need, found: found + got } }] });
      found += got; starts.forEach(s => ends.push([s, i]));
      counts.set(prefix, (counts.get(prefix) || 0) + 1);
      firstAt.set(prefix, (firstAt.get(prefix) || []).concat(i));
      C.push({ line: L('counts[prefix] = counts.get'), note: `Now record reading ${prefix} (seen ${counts.get(prefix)} time${counts.get(prefix) === 1 ? '' : 's'}).`, views: [arr({ pointers: { i }, hl: [i] }), mapView(undefined, prefix), { type: 'vars', values: { k, prefix, need, found } }] });
    });
    if (C.skipped) frames.push({ line: L('return found'), note: `... ${C.skipped} more steps, same rule: ask, then record.`, views: [arr({}), mapView(), { type: 'vars', values: { k, prefix, found } }] });
    frames.push({ line: L('return found'), note: `${found} stretch${found === 1 ? '' : 'es'} sum to ${k}${ends.length && ends.length <= 6 ? ': ' + ends.map(([a, b]) => `${a}..${b}`).join(', ') : ''}. ${steps} map steps.`, result: found, views: [arr({}), mapView(), { type: 'vars', values: { k, prefix, found } }] });
    return { found, steps, frames };
  }

  /* ---------- template C: balance trick ---------- */
  function balanceFrames(bits) {
    const frames = [], C = capped(frames), L = s => lineOf(BAL_CODE, s);
    const first = new Map([[0, -1]]); let balance = 0, best = 0, bestWin;
    const mapView = (hl, fresh) => ({ type: 'map', name: 'first (balance : first index)', entries: [...first.entries()], hl, new: fresh });
    const arr = x => Object.assign({ type: 'array', name: 'bits', values: bits }, x);
    C.push({ line: L('first = {0: -1}'), note: 'Balance 0 is "seen" at index -1, just before the array starts.', views: [arr({}), mapView(0), { type: 'vars', values: { balance, best } }] });
    bits.forEach((b, i) => {
      balance += b === 1 ? 1 : -1;
      if (first.has(balance)) {
        const j = first.get(balance), len = i - j, better = len > best;
        if (better) { best = len; bestWin = [j + 1, i]; }
        C.push({ line: L('best = max'), note: `Index ${i} (${b}): balance ${balance}, first seen at ${j}. Stretch ${j + 1}..${i} is balanced, length ${len}.${better ? ' New best.' : ''}`, views: [arr({ pointers: { i }, hl: [i], win: [j + 1, i] }), mapView(balance), { type: 'vars', values: { balance, best } }] });
      } else {
        first.set(balance, i);
        C.push({ line: L('first[balance] = i'), note: `Index ${i} (${b}): balance ${balance} is new. Record its first index, ${i}.`, views: [arr({ pointers: { i }, hl: [i] }), mapView(undefined, balance), { type: 'vars', values: { balance, best } }] });
      }
    });
    if (C.skipped) frames.push({ line: L('return best'), note: `... ${C.skipped} more steps, same rule.`, views: [arr({}), mapView(), { type: 'vars', values: { balance, best } }] });
    frames.push({ line: L('return best'), note: `Longest balanced stretch: ${best}${bestWin ? ` (index ${bestWin[0]}..${bestWin[1]})` : ''}.`, result: best, views: [arr(bestWin ? { win: bestWin } : {}), mapView(), { type: 'vars', values: { balance, best } }] });
    return { best, frames };
  }

  /* ---------- Section 1: the two players ---------- */
  (() => {
    const nums = [3, 1, 4, 1, 5, 9, 2, 6], qs = [[1, 4], [0, 7], [2, 5], [3, 6]];
    const a = slowFrames(nums, qs), b = prefixFrames(nums, qs);
    const elA = document.getElementById('p8tpA'), elB = document.getElementById('p8tpB');
    if (elA) TracePlayer(elA, { frames: a.frames }, { code: false });
    if (elB) TracePlayer(elB, { frames: b.frames }, { code: false });
    setVal('p8roA', a.ops); setVal('p8roB', b.ops);
  })();

  /* ---------- Section 2: the race ---------- */
  (() => {
    const cv = document.getElementById('p8cvA'), nIn = document.getElementById('p8nIn'), qIn = document.getElementById('p8qIn');
    if (!cv || !nIn) return;
    const active = () => document.getElementById('lesson8').classList.contains('active');
    let slow = 0, fast = 0, prog = 1, raf = 0;
    function measure() {
      const n = Number(nIn.value), q = Number(qIn.value);
      const nums = range(0, n), qs = Array.from({ length: q }, () => [0, n - 1]);
      slow = slowCount(nums, qs).ops; fast = fastCount(nums, qs).ops;
      document.getElementById('p8nOut').textContent = n; document.getElementById('p8qOut').textContent = q;
      setVal('p8roS', num(slow)); setVal('p8roP', num(fast)); setVal('p8roR', (slow / fast).toFixed(1) + 'x');
    }
    function draw() {
      if (!cv.clientWidth) return;
      const { ctx: c, w, h } = fit(cv, Math.max(0.26, 150 / cv.clientWidth));
      c.clearRect(0, 0, w, h);
      const pad = 12, track = w - 2 * pad, done = prog * Math.max(slow, fast);
      [{ label: 'prefix sums, O(n + q)', total: fast, col: css('--teal'), y: h * 0.3 }, { label: 're-adding, O(q x n)', total: slow, col: css('--orange'), y: h * 0.74 }].forEach(R => {
        const got = Math.min(R.total, done), fin = got >= R.total;
        text(c, R.label, pad, R.y - 16, css('--text-bright'), 12, 'left', 600);
        text(c, `${num(Math.round(got))} ops${fin ? ', done' : ''}`, w - pad, R.y - 16, R.col, 12, 'right', 700);
        c.fillStyle = css('--bg-input'); c.fillRect(pad, R.y, track, 12);
        c.fillStyle = R.col; c.fillRect(pad, R.y, Math.max(2, track * got / Math.max(slow, fast)), 12);
      });
    }
    function race() {
      cancelAnimationFrame(raf);
      if (RM) { prog = 1; draw(); return; }
      const t0 = performance.now(), dur = 2500;
      const tick = t => { prog = Math.min(1, (t - t0) / dur); draw(); if (prog < 1 && active()) raf = requestAnimationFrame(tick); else { prog = 1; draw(); } };
      prog = 0; raf = requestAnimationFrame(tick);
    }
    [nIn, qIn].forEach(el => el.addEventListener('input', () => { cancelAnimationFrame(raf); prog = 1; measure(); draw(); }));
    document.getElementById('p8go').addEventListener('click', race);
    window.addEventListener('resize', () => { if (active()) draw(); });
    window.addEventListener('themechange', () => { if (active()) draw(); });
    measure(); draw();
  })();

  /* ---------- Section 5: template players ---------- */
  (() => {
    const c = document.getElementById('p8tpC'), d = document.getElementById('p8tpD'), e = document.getElementById('p8tpE');
    if (c) TracePlayer(c, { code: RANGE_CODE, frames: prefixFrames([3, 1, 4, 1, 5], [[1, 3], [0, 4]]).frames });
    if (d) TracePlayer(d, { code: COUNT_CODE, frames: countFrames([1, 2, 3, -2, 2], 3).frames });
    if (e) TracePlayer(e, { code: BAL_CODE, frames: balanceFrames([0, 1, 1, 0, 1, 1, 1, 0]).frames });
  })();

  /* ---------- Sandbox: prefix lab ---------- */
  (() => {
    const numsIn = document.getElementById('s8Nums'), kIn = document.getElementById('s8K'), qIn = document.getElementById('s8Q');
    const kGroup = document.getElementById('s8KGroup'), qGroup = document.getElementById('s8QGroup');
    const err = document.getElementById('s8Err'), out = document.getElementById('s8Out'), tpEl = document.getElementById('s8Tp');
    if (!numsIn || !tpEl) return;
    const player = TracePlayer(tpEl, null, {});
    let mode = 'count';
    const modeBtns = document.querySelectorAll('[data-s8m]');
    function setMode(m) { mode = m; modeBtns.forEach(b => b.classList.toggle('btn-primary', b.dataset.s8m === m)); kGroup.hidden = m !== 'count'; qGroup.hidden = m !== 'range'; }
    function parseNums(s) {
      const parts = s.split(',').map(t => t.trim());
      if (parts.length && parts[parts.length - 1] === '') parts.pop();
      if (!parts.length) throw new Error('Type at least one number, for example: 1, 2, 3');
      if (parts.length > 20) throw new Error(`That is ${parts.length} numbers. Please use 20 or fewer so the trace stays readable.`);
      return parts.map((t, i) => { if (!/^-?\d{1,5}$/.test(t)) throw new Error(`Item ${i + 1} ("${t || 'empty'}") is not a whole number. Use digits and commas, like 3, -1, 4.`); return Number(t); });
    }
    function parseQueries(s, n) {
      const parts = s.split(';').map(t => t.trim()).filter(Boolean);
      if (!parts.length) throw new Error('Type at least one question as "l r", for example: 1 3; 0 4');
      if (parts.length > 10) throw new Error('Please ask 10 questions or fewer.');
      return parts.map(p => {
        const m = p.match(/^(\d+)\s*[ ,]\s*(\d+)$/);
        if (!m) throw new Error(`"${p}" is not a question. Write two indices, l and r, like 1 3.`);
        const l = Number(m[1]), r = Number(m[2]);
        if (l > r) throw new Error(`In "${p}", l is bigger than r. Write the smaller index first.`);
        if (r >= n) throw new Error(`In "${p}", r = ${r} is past the end. The last index is ${n - 1}.`);
        return [l, r];
      });
    }
    function run() {
      let nums, k, qs;
      try {
        nums = parseNums(numsIn.value);
        if (mode === 'count') { const t = kIn.value.trim(); if (!/^-?\d{1,6}$/.test(t)) throw new Error(`k must be a whole number, like 3 or -2. "${t || 'empty'}" is not.`); k = Number(t); }
        else qs = parseQueries(qIn.value, nums.length);
      } catch (e) { err.textContent = e.message; return; }
      err.textContent = '';
      if (mode === 'count') {
        const t = countFrames(nums, k), b = bruteSums(nums, k);
        player.load({ code: COUNT_CODE, frames: t.frames });
        out.innerHTML = `<span class="rk">stretches with sum ${k}:</span> <span class="rv">${t.found}</span><br>` +
          `<span class="rk">prefix map:</span> <span class="rv">${t.steps}</span> <span class="rk">steps</span><br>` +
          `<span class="rk">brute force:</span> <span class="rv-o">${b.ops}</span> <span class="rk">sums (found ${b.found})</span>`;
      } else {
        const t = prefixFrames(nums, qs), s = slowCount(nums, qs);
        player.load({ code: RANGE_CODE, frames: t.frames });
        out.innerHTML = `<span class="rk">answers:</span> <span class="rv">[${t.answers.join(', ')}]</span><br>` +
          `<span class="rk">prefix sums:</span> <span class="rv">${t.ops}</span> <span class="rk">operations</span><br>` +
          `<span class="rk">re-adding:</span> <span class="rv-o">${s.ops}</span> <span class="rk">operations</span>`;
      }
    }
    modeBtns.forEach(b => b.addEventListener('click', () => { setMode(b.dataset.s8m); run(); }));
    document.querySelectorAll('[data-s8ex]').forEach(b => b.addEventListener('click', () => {
      const [m, nums, extra] = b.dataset.s8ex.split('|'); setMode(m); numsIn.value = nums; if (m === 'count') kIn.value = extra; else qIn.value = extra; run();
    }));
    document.getElementById('s8Run').addEventListener('click', run);
    [numsIn, kIn, qIn].forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); run(); } }));
    setMode('count'); run();
  })();
})();
