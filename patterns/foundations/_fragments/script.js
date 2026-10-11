// ======== SLOT 4: PATTERN LESSON, BIG-O AND RECURSION ========
(() => {
  const CAP = 60;
  const FACT_CODE = `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)`;
  const FIB_CODE = `def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)`;
  const MEMO_CODE = `def fib(n, memo):
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fib(n - 1, memo) + fib(n - 2, memo)
    return memo[n]`;
  const POW_CODE = `def power(x, n):
    if n < 0:
        return 1 / power(x, -n)
    if n == 0:
        return 1
    half = power(x, n // 2)
    result = half * half
    if n % 2 == 1:
        result = result * x
    return result`;
  const num = v => Number(v).toLocaleString('en-US');
  const pyNum = v => (v === Infinity ? 'inf' : v === -Infinity ? '-inf' : String(v));
  const setVal = (id, v) => { const el = document.getElementById(id); if (!el) return; el.querySelector('.val').textContent = v; flash(el); };
  const range = n => Array.from({ length: n }, (_, k) => k);

  /* ---------- search traces (section 1). Counting rules match measure.py ---------- */
  function linearFrames(words, target) {
    const frames = [], arr = x => Object.assign({ type: 'array', name: 'sorted list', values: words }, x);
    frames.push({ note: `Look for ${target}. Start at index 0 and check each number in turn.`, views: [arr({}), { type: 'vars', values: { target, checks: 0 } }] });
    let checks = 0;
    for (let i = 0; i < words.length; i++) {
      checks++;
      const hit = words[i] === target;
      frames.push({ note: `Check ${checks}: index ${i} holds ${words[i]}. ${hit ? 'Found it!' : 'Not it, move one step right.'}`, result: hit ? i : undefined,
        views: [arr({ pointers: { i }, hl: [i], dim: range(i) }), { type: 'vars', values: { target, checks } }] });
      if (hit) return { checks, frames };
    }
    frames.push({ note: `${target} is not in the list: ${checks} checks.`, result: -1, views: [arr({ dim: range(words.length) }), { type: 'vars', values: { target, checks } }] });
    return { checks, frames };
  }
  function halvingFrames(words, target) {
    const frames = [], n = words.length;
    const arr = (lo, hi, x) => Object.assign({ type: 'array', name: 'sorted list', values: words, win: [lo, hi], dim: range(n).filter(k => k < lo || k > hi) }, x);
    let lo = 0, hi = n - 1, checks = 0;
    frames.push({ note: `Look for ${target}. The whole list is still in play (blue).`, views: [arr(lo, hi, { pointers: { lo, hi } }), { type: 'vars', values: { target, checks } }] });
    while (lo <= hi) {
      checks++;
      const mid = Math.floor((lo + hi) / 2), v = words[mid];
      if (v === target) {
        frames.push({ note: `Check ${checks}: the middle (index ${mid}) holds ${v}. Found it!`, result: mid, views: [arr(lo, hi, { pointers: { lo, mid, hi }, hl: [mid] }), { type: 'vars', values: { target, checks } }] });
        return { checks, frames };
      }
      const right = v < target;
      frames.push({ note: `Check ${checks}: the middle (index ${mid}) holds ${v}. ${right ? `${v} < ${target}, so the answer is to the right.` : `${v} > ${target}, so the answer is to the left.`}`,
        views: [arr(lo, hi, { pointers: { lo, mid, hi }, hl: [mid] }), { type: 'vars', values: { target, checks } }] });
      if (right) lo = mid + 1; else hi = mid - 1;
      frames.push({ note: `Throw away the ${right ? 'left' : 'right'} half. ${Math.max(0, hi - lo + 1)} numbers are left in play.`, views: [arr(lo, hi, { pointers: { lo, hi } }), { type: 'vars', values: { target, checks } }] });
    }
    frames.push({ note: `Nothing left in play: ${target} is not in the list after ${checks} checks.`, result: -1, views: [arr(0, -1, {}), { type: 'vars', values: { target, checks } }] });
    return { checks, frames };
  }

  /* ---------- growth counters (section 2). Same loops as measure.py growth_counts ---------- */
  function countLog(n) { let ops = 0, k = n; while (k >= 1) { ops++; k = Math.floor(k / 2); } return ops; }
  function countSubsets(n) { let ops = 0; const go = i => { if (i === n) { ops++; return; } go(i + 1); go(i + 1); }; go(0); return ops; }
  const growthCache = {};
  function growth(n) {
    if (growthCache[n]) return growthCache[n];
    let lin = 0, nlogn = 0, quad = 0;
    for (let i = 0; i < n; i++) lin++;
    for (let i = 0; i < n; i++) nlogn += countLog(n);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) quad++;
    return (growthCache[n] = [1, countLog(n), lin, nlogn, quad, countSubsets(n)]);
  }

  /* ---------- recursion tracers: frames on every call, check and return ---------- */
  function stackView(st) { return { type: 'stack', name: 'call stack', values: st.slice() }; }

  function factTrace(n0) {
    const frames = [], st = [], L = s => lineOf(FACT_CODE, s);
    let calls = 0, maxD = 0, skipped = 0;
    const push = f => { if (frames.length < CAP) frames.push(f); else skipped++; };
    const vars = (n) => ({ type: 'vars', values: { n, calls, depth: st.length } });
    function fact(n) {
      calls++; st.push(`factorial(${n})`); maxD = Math.max(maxD, st.length);
      push({ line: L('def factorial'), note: `Call factorial(${n}). A new note goes on top of the stack.`, views: [stackView(st), vars(n)] });
      if (n <= 1) {
        push({ line: L('return 1'), note: `${n} <= 1: base case. Answer 1 directly, no more calls.`, views: [stackView(st), vars(n)] });
        st.pop(); return 1;
      }
      st[st.length - 1] = `factorial(${n}) = ${n} x ?`;
      push({ line: L('return n * factorial(n - 1)'), note: `${n} > 1, so factorial(${n}) must wait for factorial(${n - 1}). It stays on the stack.`, views: [stackView(st), vars(n)] });
      const sub = fact(n - 1), r = n * sub;
      st[st.length - 1] = `factorial(${n}) = ${n} x ${sub}`;
      push({ line: L('return n * factorial(n - 1)'), note: `factorial(${n - 1}) answered ${sub}. So factorial(${n}) = ${n} x ${sub} = ${r}. Its note leaves the stack.`, views: [stackView(st), vars(n)] });
      st.pop(); return r;
    }
    const res = fact(n0);
    if (skipped) frames.push({ line: L('return n * factorial(n - 1)'), note: `... ${skipped} more steps, same rule: wait on the way down, multiply on the way up.`, views: [stackView(st), { type: 'vars', values: { calls, depth: 0 } }] });
    frames.push({ line: L('return n * factorial(n - 1)', 1), note: `Done: factorial(${n0}) = ${res}. ${calls} calls; the stack was at most ${maxD} notes tall.`, result: res, views: [stackView([]), { type: 'vars', values: { calls, 'max depth': maxD } }] });
    return { result: res, calls, maxD, frames };
  }

  // Fibonacci, naive or memo. The tree view is drawn as a graph with a leaf-based layout.
  function fibTrace(n0, memoOn, withTree) {
    const CODE = memoOn ? MEMO_CODE : FIB_CODE, L = s => lineOf(CODE, s);
    // 1. run once to build the call tree
    const nodes = [], events = [], memoRun = {};
    function build(k, parent, depth) {
      const id = nodes.length, node = { id, k, parent, depth, kids: [] };
      nodes.push(node); if (parent >= 0) nodes[parent].kids.push(id);
      events.push(['in', id]);
      let r;
      if (memoOn && k in memoRun) { node.hit = true; r = memoRun[k]; }
      else if (k <= 1) r = k;
      else { r = build(k - 1, id, depth + 1) + build(k - 2, id, depth + 1); if (memoOn) memoRun[k] = r; }
      node.val = r; events.push(['out', id]); return r;
    }
    const result = build(n0, -1, 0);
    // 2. layout: leaves spread evenly, parents centred over their children
    let leaf = 0; const leaves = nodes.filter(nd => !nd.kids.length).length, maxDepth = Math.max(...nodes.map(nd => nd.depth));
    (function place(id) { const nd = nodes[id]; if (!nd.kids.length) { nd.x = leaves > 1 ? leaf++ / (leaves - 1) : 0.5; } else { nd.kids.forEach(place); nd.x = (nodes[nd.kids[0]].x + nodes[nd.kids[nd.kids.length - 1]].x) / 2; } nd.y = maxDepth ? nd.depth / maxDepth : 0.5; })(0);
    // repeats: in the naive tree, a call is a repeat if an earlier call with the same k already finished
    const finished = new Set();
    // 3. replay the events into frames
    const frames = [], shown = [], st = [], state = {}, memo = [];
    let calls = 0, maxD = 0, skipped = 0;
    const doneK = new Set();
    const views = (cur, extra) => {
      const v = [];
      if (withTree) v.push({ type: 'graph', name: memoOn ? 'calls (orange = answered from the memo)' : 'calls (orange = repeated work)', nodes: shown.map(id => ({ id, x: nodes[id].x, y: nodes[id].y, label: nodes[id].k })), edges: shown.filter(id => nodes[id].parent >= 0).map(id => [nodes[id].parent, id]), hl: cur !== undefined && nodes[cur].parent >= 0 ? [[nodes[cur].parent, cur]] : [], state: Object.assign({}, state, cur !== undefined ? { [cur]: 'current' } : {}) });
      else v.push(stackView(st));
      if (memoOn) v.push({ type: 'map', name: 'memo (n : fib(n))', entries: memo.slice(), hl: extra && extra.hl, new: extra && extra.fresh });
      v.push({ type: 'vars', values: { calls, depth: st.length } });
      return v;
    };
    const push = f => { if (frames.length < CAP) frames.push(f); else skipped++; };
    events.forEach(([kind, id]) => {
      const nd = nodes[id];
      if (kind === 'in') {
        calls++; shown.push(id); st.push(memoOn ? `fib(${nd.k}, memo)` : `fib(${nd.k})`); maxD = Math.max(maxD, st.length);
        const repeat = !memoOn && doneK.has(nd.k);
        if (repeat || nd.hit) state[id] = 'frontier'; else state[id] = 'visited';
        if (nd.hit) push({ line: L('return memo[n]'), note: `Call fib(${nd.k}) again, but ${nd.k} is in the memo: answer ${nd.val} in one lookup. No new calls.`, views: views(id, { hl: nd.k }) });
        else if (nd.k <= 1) push({ line: L('return n'), note: `Call fib(${nd.k}): base case, return ${nd.k}.${repeat ? ' (This exact call already happened before.)' : ''}`, views: views(id) });
        else push({ line: L(memoOn ? 'memo[n] = fib' : 'return fib(n - 1)'), note: `Call fib(${nd.k}).${repeat ? ` Repeat work: fib(${nd.k}) was already computed once.` : ''} It needs fib(${nd.k - 1}) and fib(${nd.k - 2}).`, views: views(id) });
      } else {
        st.pop(); doneK.add(nd.k); finished.add(id);
        if (state[id] !== 'frontier') state[id] = 'done';
        let fresh;
        if (memoOn && !nd.hit && nd.k > 1) { memo.push([nd.k, nd.val]); fresh = nd.k; }
        if (nd.kids.length) push({ line: L(memoOn ? 'return memo[n]' : 'return fib(n - 1)', memoOn ? 2 : 1), note: `fib(${nd.k}) = fib(${nd.k - 1}) + fib(${nd.k - 2}) = ${nodes[nd.kids[0]].val} + ${nodes[nd.kids[1]].val} = ${nd.val}.${memoOn ? ' Written into the memo.' : ''}`, views: views(id, { fresh }) });
      }
    });
    if (skipped) frames.push({ line: L('def fib'), note: `... ${skipped} more steps, same rule.`, views: views(undefined) });
    frames.push({ line: L(memoOn ? 'return memo[n]' : 'return fib(n - 1)', memoOn ? 2 : 1), note: `fib(${n0}) = ${result} after ${calls} calls. The deepest chain was ${maxD} calls.`, result, views: views(undefined) });
    return { result, calls, maxD, frames };
  }

  function powTrace(x, n0) {
    const frames = [], st = [], L = s => lineOf(POW_CODE, s);
    let calls = 0, mults = 0, maxD = 0, skipped = 0;
    const push = f => { if (frames.length < CAP) frames.push(f); else skipped++; };
    const vars = (n, extra) => ({ type: 'vars', values: Object.assign({ x, n, calls, multiplications: mults }, extra || {}) });
    function power(n) {
      calls++; st.push(`power(${x}, ${n})`); maxD = Math.max(maxD, st.length);
      if (n < 0) {
        push({ line: L('return 1 / power'), note: `n = ${n} is negative: compute power(${x}, ${-n}) and take 1 over it.`, views: [stackView(st), vars(n)] });
        const r = 1 / power(-n);
        push({ line: L('return 1 / power'), note: `1 / ${pyNum(1 / r)} = ${pyNum(r)}.`, views: [stackView(st), vars(n)] });
        st.pop(); return r;
      }
      if (n === 0) {
        push({ line: L('return 1', 2), note: `n = 0: base case, return 1.`, views: [stackView(st), vars(n)] });
        st.pop(); return 1;
      }
      push({ line: L('half = power'), note: `n = ${n}: ask once for power(${x}, ${Math.floor(n / 2)}), half the power.`, views: [stackView(st), vars(n)] });
      const half = power(Math.floor(n / 2));
      mults++; let result = half * half;
      push({ line: L('result = half * half'), note: `half = ${pyNum(half)}. Square it: ${pyNum(half)} x ${pyNum(half)} = ${pyNum(result)}.`, views: [stackView(st), vars(n, { half, result })] });
      if (n % 2 === 1) {
        mults++; const before = result; result = result * x;
        push({ line: L('result = result * x'), note: `${n} is odd, so one x was lost when halving. ${pyNum(before)} x ${x} = ${pyNum(result)}.`, views: [stackView(st), vars(n, { half, result })] });
      }
      st.pop(); return result;
    }
    const res = power(n0);
    if (skipped) frames.push({ line: L('return result'), note: `... ${skipped} more steps, same rule.`, views: [stackView([]), vars(n0)] });
    frames.push({ line: L('return result'), note: `power(${x}, ${n0}) = ${pyNum(res)}: ${calls} calls and ${mults} multiplications. A plain loop needs ${num(Math.abs(n0))}.`, result: res, views: [stackView([]), { type: 'vars', values: { calls, multiplications: mults, 'max depth': maxD } }] });
    return { result: res, calls, mults, maxD, frames };
  }

  // call counts only (no frames), same rule: one per call entered
  function fibCalls(n, memoOn) {
    if (memoOn) return n <= 1 ? 1 : 2 * n - 1;          // 2n - 1, printed by measure.py for n = 5, 10, 20, 30
    const c = [1, 1]; for (let k = 2; k <= n; k++) c[k] = 1 + c[k - 1] + c[k - 2]; return c[n];
  }

  /* ---------- Section 1: two players ---------- */
  (() => {
    const words = [2, 5, 8, 12, 16, 23, 38, 41, 56, 63, 72, 85, 91, 97, 99, 104];
    const a = linearFrames(words, 97), b = halvingFrames(words, 97);
    const elA = document.getElementById('p4tpA'), elB = document.getElementById('p4tpB');
    if (elA) TracePlayer(elA, { frames: a.frames }, { code: false });
    if (elB) TracePlayer(elB, { frames: b.frames }, { code: false });
    setVal('p4roA', a.checks); setVal('p4roB', b.checks);
  })();

  /* ---------- Section 2: growth race ---------- */
  (() => {
    const cv = document.getElementById('p4cvA'), slider = document.getElementById('p4nIn'), out = document.getElementById('p4nOut'), ro = document.getElementById('p4roG');
    if (!cv || !slider) return;
    const active = () => document.getElementById('lesson4').classList.contains('active');
    const LANES = [['O(1)', '--text-dim'], ['O(log n)', '--teal'], ['O(n)', '--blue'], ['O(n log n)', '--purple'], ['O(n^2)', '--yellow'], ['O(2^n)', '--orange']];
    ro.innerHTML = LANES.map(([lab]) => `<div class="ro"><span class="lab">${lab}</span><span class="val">-</span> <span class="unit">steps</span></div>`).join('');
    const ros = ro.querySelectorAll('.ro');
    let n = 10, counts = growth(10), budget = Infinity, raf = 0;
    const DEC = 7;   // the axis runs from 1 to 10^7 steps
    function draw() {
      if (!cv.clientWidth) return;
      const { ctx: c, w, h } = fit(cv, Math.max(0.42, 240 / cv.clientWidth));
      c.clearRect(0, 0, w, h);
      const left = Math.min(110, w * 0.26), right = 12, top = 8, bottom = 22, track = w - left - right;
      const laneH = (h - top - bottom) / LANES.length;
      const xOf = v => left + track * Math.log10(Math.max(1, v)) / DEC;
      c.strokeStyle = css('--border'); c.lineWidth = 1;
      for (let d = 0; d <= DEC; d++) {
        const x = left + track * d / DEC; c.beginPath(); c.moveTo(x, top); c.lineTo(x, h - bottom); c.stroke();
        if (d % (w < 420 ? 2 : 1) === 0) text(c, d === 0 ? '1' : '1e' + d, x, h - bottom + 11, css('--text-dim'), 10, 'center', 500);
      }
      LANES.forEach(([lab, col], k) => {
        const y = top + laneH * k + laneH / 2, total = counts[k], got = Math.min(total, budget), fin = got >= total;
        text(c, lab, 4, y, css('--text-bright'), 11.5, 'left', 600);
        c.fillStyle = css(col);
        c.fillRect(left, y - laneH * 0.28, Math.max(3, xOf(got) - left), laneH * 0.56);
        const label = num(Math.floor(got)) + (fin && budget !== Infinity ? ' done' : '');
        const lx = Math.max(3, xOf(got) - left) + left + 6, inside = lx + 70 > w;
        text(c, label, inside ? lx - 12 : lx, y, inside ? css('--bg') : css('--text'), 11, inside ? 'right' : 'left', 600);
      });
    }
    function show() {
      out.textContent = n;
      counts.forEach((v, k) => { ros[k].querySelector('.val').textContent = num(v); });
    }
    function setN(v) { cancelAnimationFrame(raf); n = v; slider.value = v; counts = growth(n); budget = Infinity; show(); ros.forEach(flash); draw(); }
    function race() {
      cancelAnimationFrame(raf);
      const max = Math.max(...counts);
      if (RM) { budget = Infinity; draw(); return; }
      const t0 = performance.now(), dur = 4000;
      const tick = t => { const p = Math.min(1, (t - t0) / dur); budget = Math.pow(max, p); draw(); if (p < 1 && active()) raf = requestAnimationFrame(tick); else { budget = Infinity; draw(); } };
      budget = 1; raf = requestAnimationFrame(tick);
    }
    slider.addEventListener('input', () => setN(Number(slider.value)));
    document.getElementById('p4dbl').addEventListener('click', () => setN(n * 2 > 20 ? 1 : n * 2));
    document.getElementById('p4go').addEventListener('click', race);
    window.addEventListener('resize', () => { if (active()) draw(); });
    window.addEventListener('themechange', () => { if (active()) draw(); });
    show(); draw();
  })();

  /* ---------- Section 3: call stack and the fib trees ---------- */
  (() => {
    const elC = document.getElementById('p4tpC');
    if (elC) TracePlayer(elC, { code: FACT_CODE, frames: factTrace(4).frames });
    const d = fibTrace(5, false, true), e = fibTrace(5, true, true);
    const elD = document.getElementById('p4tpD'), elE = document.getElementById('p4tpE');
    if (elD) TracePlayer(elD, { frames: d.frames }, { code: false });
    if (elE) TracePlayer(elE, { frames: e.frames }, { code: false });
    setVal('p4roD', d.calls); setVal('p4roE', e.calls);
    const elF = document.getElementById('p4tpF');
    if (elF) TracePlayer(elF, { code: POW_CODE, frames: powTrace(2, 13).frames });
  })();

  /* ---------- Sandbox: recursion lab ---------- */
  (() => {
    const nIn = document.getElementById('s4N'), xIn = document.getElementById('s4X'), xGroup = document.getElementById('s4XGroup');
    const err = document.getElementById('s4Err'), out = document.getElementById('s4Out'), tpEl = document.getElementById('s4Tp');
    if (!nIn || !tpEl) return;
    const player = TracePlayer(tpEl, null, {});
    const KINDS = {
      fact: { label: 'factorial', lo: 0, hi: 15 },
      fib: { label: 'naive fib', lo: 0, hi: 15 },
      memo: { label: 'memo fib', lo: 0, hi: 40 },
      pow: { label: 'power', lo: -1e9, hi: 1e9 }
    };
    let kind = 'fact';
    const kindBtns = document.querySelectorAll('[data-s4k]');
    function setKind(k) {
      kind = k;
      kindBtns.forEach(b => b.classList.toggle('btn-primary', b.dataset.s4k === k));
      xGroup.hidden = k !== 'pow';
    }
    function parseInt10(s, what, lo, hi) {
      const t = s.trim();
      if (!t) throw new Error(`Type a whole number for ${what}.`);
      if (!/^-?\d+$/.test(t)) throw new Error(`${what} must be a whole number, like 5 or -3. "${t}" is not.`);
      const v = Number(t);
      if (v < lo || v > hi) throw new Error(`Please keep ${what} between ${num(lo)} and ${num(hi)} so the trace stays readable.`);
      return v;
    }
    function run() {
      const K = KINDS[kind];
      let n, x, t;
      try {
        n = parseInt10(nIn.value, 'n', K.lo, K.hi);
        if (kind === 'pow') {
          const s = xIn.value.trim();
          if (!/^-?\d+(\.\d+)?$/.test(s)) throw new Error(`x must be a number, like 2 or 1.5. "${s || 'empty'}" is not.`);
          x = Number(s);
          if (x === 0 && n < 0) throw new Error('0 to a negative power means dividing by zero. Pick another x or a positive n.');
          if (Number.isInteger(x) && Math.abs(x) >= 2 && Math.abs(n) * Math.log2(Math.abs(x)) > 52) throw new Error('That answer has too many digits to show exactly. Try a smaller n, or an x closer to 1, such as 1.0001.');
        }
      } catch (e2) { err.textContent = e2.message; return; }
      err.textContent = '';
      if (kind === 'fact') t = factTrace(n);
      else if (kind === 'fib') t = fibTrace(n, false, n <= 6);
      else if (kind === 'memo') t = fibTrace(n, true, n <= 6);
      else t = powTrace(x, n);
      if (kind === 'pow' && !Number.isFinite(t.result)) { err.textContent = 'The answer is too big for a float (Python would print inf). Try a smaller n.'; return; }
      player.load({ code: { fact: FACT_CODE, fib: FIB_CODE, memo: MEMO_CODE, pow: POW_CODE }[kind], frames: t.frames });
      out.innerHTML = `<span class="rk">result:</span> <span class="rv">${pyNum(t.result)}</span><br>` +
        `<span class="rk">calls:</span> <span class="rv">${num(t.calls)}</span><br>` +
        `<span class="rk">max stack depth:</span> <span class="rv-o">${t.maxD}</span>` +
        (kind === 'pow' ? `<br><span class="rk">multiplications:</span> <span class="rv">${t.mults}</span> <span class="rk">(plain loop: ${num(Math.abs(n))})</span>` : '') +
        (kind === 'fib' || kind === 'memo' ? `<br><span class="rk">the other version would make:</span> <span class="rv-o">${num(fibCalls(n, kind === 'fib'))}</span> <span class="rk">calls</span>` : '');
    }
    kindBtns.forEach(b => b.addEventListener('click', () => { setKind(b.dataset.s4k); run(); }));
    document.querySelectorAll('[data-s4ex]').forEach(b => b.addEventListener('click', () => {
      const [k, n, x] = b.dataset.s4ex.split('|'); setKind(k); nIn.value = n; if (x) xIn.value = x; run();
    }));
    document.getElementById('s4Run').addEventListener('click', run);
    [nIn, xIn].forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); run(); } }));
    setKind('fact'); run();
  })();
})();
