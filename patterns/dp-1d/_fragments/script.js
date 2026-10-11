// ======== SLOT 19: PATTERN LESSON, 1D DYNAMIC PROGRAMMING ========
(() => {
  const CAP = 60, CALL_CAP = 1000000;
  const MEMO_CODE = `def climb(n, memo):
    if n <= 2:
        return n
    if n in memo:
        return memo[n]
    memo[n] = climb(n - 1, memo) + climb(n - 2, memo)
    return memo[n]`;
  const COIN_CODE = `def coin_change(coins, amount):
    dp = [0] + [float("inf")] * amount
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a:
                dp[a] = min(dp[a], dp[a - c] + 1)
    return dp[amount] if dp[amount] != float("inf") else -1`;
  const ROB_CODE = `def rob(nums):
    dp = [0] * (len(nums) + 1)
    if nums: dp[1] = nums[0]
    for i in range(2, len(nums) + 1):
        dp[i] = max(dp[i - 1], dp[i - 2] + nums[i - 1])
    return dp[-1]`;
  const STAIRS_CODE = `def ways(n, steps):
    dp = [0] * (n + 1)
    dp[0] = 1
    for i in range(1, n + 1):
        for s in steps:
            if s <= i:
                dp[i] += dp[i - s]
    return dp[n]`;
  const fmtN = v => Number(v).toLocaleString('en-US');
  const setVal = (id, v) => { const el = document.getElementById(id); if (!el) return; el.querySelector('.val').textContent = v; flash(el); };
  const range = (a, b) => Array.from({ length: Math.max(0, b - a) }, (_, k) => a + k);

  // Counting rules shared with measure.py.
  function naiveCalls(n) { let c = 0; const go = k => { c++; if (k <= 2) return k; return go(k - 1) + go(k - 2); }; go(n); return c; }
  function memoCalls(n) { let c = 0; const memo = new Map(); const go = k => { c++; if (k <= 2) return k; if (memo.has(k)) return memo.get(k); const v = go(k - 1) + go(k - 2); memo.set(k, v); return v; }; go(n); return c; }

  /* ---------- Section 1: slow tree vs chalk table ---------- */
  function treeFrames(n) {
    // heap-indexed tree: node k has children 2k+1 (n - 1) and 2k+2 (n - 2)
    const order = [];
    const walk = (k, v) => { order.push([k, v]); if (v <= 2) return; walk(2 * k + 1, v - 1); walk(2 * k + 2, v - 2); };
    walk(0, n);
    const size = Math.max(...order.map(o => o[0])) + 1;
    const vals = Array(size).fill(null), state = {}, seen = new Set(), frames = [];
    order.forEach(([k, v]) => { vals[k] = v; state[k] = 'done'; });
    let calls = 0, repeats = 0;
    order.forEach(([k, v]) => {
      calls++;
      const rep = seen.has(v); if (rep) repeats++;
      seen.add(v);
      Object.keys(state).forEach(q => { if (state[q] === 'current') state[q] = state['r' + q] ? 'frontier' : 'visited'; });
      state[k] = 'current'; if (rep) state['r' + k] = 1;
      const st = {}; Object.keys(state).forEach(q => { if (!q.startsWith('r')) st[q] = state[q]; });
      const note = rep ? `Call ${calls}: ways(${v}) again. This question was already answered earlier in the tree, so the work is wasted.`
        : v <= 2 ? `Call ${calls}: ways(${v}) is a base case. It returns ${v} right away.` : `Call ${calls}: ways(${v}) needs ways(${v - 1}) and ways(${v - 2}) first.`;
      frames.push({ note, views: [{ type: 'tree', name: 'calls of ways(n)', values: vals.slice(), hl: [k], state: st }, { type: 'vars', values: { calls, repeated: repeats } }] });
    });
    const st = {}; Object.keys(state).forEach(q => { if (!q.startsWith('r')) st[q] = state[q] === 'current' ? (state['r' + q] ? 'frontier' : 'visited') : state[q]; });
    frames.push({ note: `All answers add up to ${climbVal(n)} ways. It took ${calls} calls for only ${n} different questions: ${repeats} calls were repeats.`, result: climbVal(n), views: [{ type: 'tree', name: 'calls of ways(n)', values: vals.slice(), state: st }, { type: 'vars', values: { calls, repeated: repeats } }] });
    return { frames, calls };
  }
  function climbVal(n) { if (n <= 2) return n; let p = 1, c = 2; for (let i = 3; i <= n; i++) [p, c] = [c, p + c]; return c; }
  function tableFrames(n) {
    const dp = Array(n + 1).fill(null), frames = [];
    const arr = extra => Object.assign({ type: 'array', name: 'dp (step: ways)', values: dp.map((x, k) => k === 0 ? '-' : x === null ? '' : x), dim: [0] }, extra);
    frames.push({ note: `Make one cell per step, 0 to ${n}. Step 0 is not used.`, views: [arr({}), { type: 'vars', values: { 'cells filled': 0 } }] });
    dp[1] = 1; dp[2] = 2;
    frames.push({ note: 'Base cases: 1 way to reach step 1, 2 ways to reach step 2 (1+1 or 2).', views: [arr({ hl: [1, 2] }), { type: 'vars', values: { 'cells filled': 2 } }] });
    for (let i = 3; i <= n; i++) {
      dp[i] = dp[i - 1] + dp[i - 2];
      frames.push({ note: `dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}. Both were already on the stairs.`, views: [arr({ hl: [i], win: [i - 2, i - 1], pointers: { i } }), { type: 'vars', values: { 'cells filled': i } }] });
    }
    frames.push({ note: `Read the answer from the last cell: ${dp[n]} ways, ${n} cells filled.`, result: dp[n], views: [arr({ hl: [n] }), { type: 'vars', values: { 'cells filled': n } }] });
    return { frames, cells: n };
  }
  (() => {
    const a = treeFrames(5), b = tableFrames(5);
    const elA = document.getElementById('p19tpA'), elB = document.getElementById('p19tpB');
    if (elA) TracePlayer(elA, { frames: a.frames }, { code: false });
    if (elB) TracePlayer(elB, { frames: b.frames }, { code: false });
    setVal('p19roA', a.calls); setVal('p19roB', b.cells);
  })();

  /* ---------- Section 2: recursion tree slider ---------- */
  (() => {
    const rng = document.getElementById('p19rng'), out = document.getElementById('p19out'), box = document.getElementById('p19svg'), memo = document.getElementById('p19memo');
    if (!rng || !box) return;
    function draw() {
      const n = Number(rng.value); out.textContent = n;
      const calls = naiveCalls(n);
      setVal('p19roN', fmtN(calls)); setVal('p19roD', n); setVal('p19roW', fmtN(calls - n)); setVal('p19roM', memoCalls(n)); setVal('p19roC', n);
      if (n > 9) { box.innerHTML = `<p class="caption">${fmtN(calls)} calls is too many to draw. Slide back to 9 or less to see the tree.</p>`; return; }
      // lay out: leaves get consecutive x slots, a parent sits over its children
      const nodes = [], edges = [], seen = new Set(); let leaf = 0, maxD = 0;
      const build = (v, d, faded) => {
        const me = { v, d, rep: seen.has(v), faded }; seen.add(v); nodes.push(me); maxD = Math.max(maxD, d);
        if (v <= 2) { me.x = leaf++; return me; }
        const kidsFaded = faded || me.rep;
        const l = build(v - 1, d + 1, kidsFaded), r = build(v - 2, d + 1, kidsFaded);
        edges.push([me, l], [me, r]); me.x = (l.x + r.x) / 2; return me;
      };
      build(n, 0, false);
      const gap = 30, W = Math.max(320, leaf * gap + 20), H = (maxD + 1) * 48 + 10, rad = 12;
      const X = nd => 10 + gap / 2 + nd.x * gap * ((W - 20) / Math.max(leaf * gap, 1)), Y = nd => 24 + nd.d * 48;
      const useMemo = memo.checked;
      let s = `<svg class="tp-svg" viewBox="0 0 ${W} ${H}" style="max-width:${Math.max(360, W * 1.1)}px">`;
      edges.forEach(([p, c]) => { s += `<line class="tp-edge" x1="${X(p)}" y1="${Y(p)}" x2="${X(c)}" y2="${Y(c)}" opacity="${useMemo && c.faded ? 0.25 : 1}"/>`; });
      nodes.forEach(nd => {
        const cls = nd.rep ? 'st-frontier' : 'st-visited';
        s += `<g class="tp-node ${cls}" opacity="${useMemo && nd.faded ? 0.2 : 1}"><circle cx="${X(nd)}" cy="${Y(nd)}" r="${rad}"/><text x="${X(nd)}" y="${Y(nd)}" style="font-size:11px">${nd.v}</text></g>`;
      });
      box.innerHTML = s + '</svg>';
    }
    rng.addEventListener('input', draw); memo.addEventListener('change', draw);
    draw();
  })();

  /* ---------- Section 5: memo trace ---------- */
  function memoFrames(n) {
    const frames = [], memo = new Map(), stack = []; let calls = 0;
    const L = (s, k) => lineOf(MEMO_CODE, s, k);
    const views = (hl, fresh) => [{ type: 'stack', name: 'call stack', values: stack.slice() }, { type: 'map', name: 'memo (n : ways)', entries: [...memo.entries()], hl, new: fresh }, { type: 'vars', values: { calls, depth: stack.length } }];
    const go = k => {
      calls++; stack.push(`climb(${k})`);
      if (k <= 2) { frames.push({ line: L('return n'), note: `climb(${k}) is a base case: return ${k}.`, views: views() }); stack.pop(); return k; }
      if (memo.has(k)) { frames.push({ line: L('return memo[n]', 1), note: `climb(${k}) is already in the memo. Return ${memo.get(k)} without any more calls.`, views: views(k) }); stack.pop(); return memo.get(k); }
      frames.push({ line: L('if n in memo'), note: `climb(${k}) is new. It must ask climb(${k - 1}) and climb(${k - 2}).`, views: views() });
      const v = go(k - 1) + go(k - 2);
      memo.set(k, v);
      frames.push({ line: L('memo[n] = '), note: `Both answers are back: climb(${k}) = ${v}. Write it in the memo.`, views: views(undefined, k) });
      stack.pop(); return v;
    };
    const v = go(n);
    frames.push({ line: L('return memo[n]', 2), note: `Done: ${v} ways after ${calls} calls. Each new question was solved once.`, result: v, views: views() });
    return frames;
  }
  (() => { const el = document.getElementById('p19tpC'); if (el) TracePlayer(el, { code: MEMO_CODE, frames: memoFrames(5) }); })();

  /* ---------- Section 6: coin change trace ---------- */
  function coinFrames(coins, amount) {
    const dp = [0].concat(Array(amount).fill(Infinity)), frames = []; let tries = 0, more = 0;
    const L = s => lineOf(COIN_CODE, s);
    const show = () => dp.map(x => x === Infinity ? 'inf' : x);
    const grid = (hl, src) => ({ type: 'grid', name: 'dp (amount: fewest coins)', rows: [show()], colLabels: dp.map((_, k) => String(k)), hl, src });
    frames.push({ line: L('dp = [0]'), note: `dp[0] = 0: zero coins make 0. Every other amount starts at inf (not made yet).`, views: [grid([[0, 0]], []), { type: 'vars', values: { tries } }] });
    for (let a = 1; a <= amount; a++) for (const c of coins) {
      if (c > a) continue;
      tries++;
      const before = dp[a], cand = dp[a - c] + 1; dp[a] = Math.min(dp[a], cand);
      if (frames.length >= CAP) { more++; continue; }
      const cs = x => x === Infinity ? 'inf' : x;
      frames.push({ line: L('dp[a] = min'), note: `Amount ${a}, coin ${c}: dp[${a - c}] + 1 = ${cs(cand)}. ${cand < before ? `Better than ${cs(before)}, so dp[${a}] = ${cs(dp[a])}.` : `Not better than ${cs(before)}.`}`, views: [grid([[0, a]], [[0, a - c]]), { type: 'vars', values: { a, c, tries } }] });
    }
    if (more) frames.push({ line: L('dp[a] = min'), note: `... ${more} more tries, same rule.`, views: [grid([], []), { type: 'vars', values: { tries } }] });
    const ans = dp[amount] === Infinity ? -1 : dp[amount];
    frames.push({ line: L('return dp[amount]'), note: ans < 0 ? `dp[${amount}] is still inf: no mix of coins makes ${amount}. Return -1.` : `Read dp[${amount}] = ${ans}. ${tries} coin tries in total.`, result: ans, views: [grid([[0, amount]], []), { type: 'vars', values: { tries } }] });
    return { frames, ans, tries, cells: dp.length };
  }
  (() => { const el = document.getElementById('p19tpD'); if (el) TracePlayer(el, { code: COIN_CODE, frames: coinFrames([1, 3, 4], 6).frames }); })();

  /* ---------- House robber frames (playground table and sandbox) ---------- */
  function robFrames(nums) {
    const n = nums.length, dp = Array(n + 1).fill(null), frames = [];
    const L = s => lineOf(ROB_CODE, s);
    const grid = (hl, src) => ({ type: 'grid', name: 'column i = first i houses', rows: [[null].concat(nums), dp.map(x => x === null ? '' : x)], rowLabels: ['house', 'dp'], colLabels: dp.map((_, k) => String(k)), hl, src });
    dp[0] = 0;
    frames.push({ line: L('dp = [0]'), note: 'dp[i] = most loot from the first i houses. dp[0] = 0: no houses, no loot.', views: [grid([[1, 0]], [])] });
    if (n) { dp[1] = nums[0]; frames.push({ line: L('if nums'), note: `One house: rob it. dp[1] = ${nums[0]}.`, views: [grid([[1, 1]], [[0, 1]])] }); }
    let more = 0;
    for (let i = 2; i <= n; i++) {
      const skip = dp[i - 1], take = dp[i - 2] + nums[i - 1]; dp[i] = Math.max(skip, take);
      if (frames.length >= CAP) { more++; continue; }
      frames.push({ line: L('dp[i] = max'), note: `House ${i} (worth ${nums[i - 1]}): skip it and keep ${skip}, or take it: ${dp[i - 2]} + ${nums[i - 1]} = ${take}. dp[${i}] = ${dp[i]}.`, views: [grid([[1, i]], [[1, i - 1], [1, i - 2], [0, i]])] });
    }
    if (more) frames.push({ line: L('dp[i] = max'), note: `... ${more} more houses, same rule.`, views: [grid([], [])] });
    frames.push({ line: L('return dp[-1]'), note: `The whole street: ${dp[n]}.`, result: dp[n], views: [grid([[1, n]], [])] });
    return { frames, ans: dp[n], cells: n + 1 };
  }

  /* ---------- Section 6: robber playground ---------- */
  (() => {
    const box = document.getElementById('p19rob'); if (!box) return;
    const houses = [4, 2, 3, 7, 8, 7, 1], best = robFrames(houses).ans, msg = document.getElementById('p19robMsg');
    let picked = new Set(), shown = false, player = null;
    function render() {
      box.innerHTML = '';
      houses.forEach((v, k) => {
        const blocked = !picked.has(k) && (picked.has(k - 1) || picked.has(k + 1));
        const b = document.createElement('button'); b.type = 'button';
        b.className = 'tp-cell' + (picked.has(k) ? ' is-hl' : '') + (blocked ? ' is-dim' : '');
        b.style.cursor = 'pointer'; b.setAttribute('aria-pressed', picked.has(k));
        b.setAttribute('aria-label', `House ${k}, worth ${v}${picked.has(k) ? ', robbed' : blocked ? ', blocked' : ''}`);
        b.innerHTML = `<span class="tp-ix">${k}</span>${v}`;
        b.addEventListener('click', () => {
          if (picked.has(k)) picked.delete(k);
          else if (blocked) { msg.textContent = `House ${k} is next to a house you robbed: the alarms are linked.`; return; }
          else picked.add(k);
          update();
        });
        box.appendChild(b);
      });
    }
    function update() {
      const sum = [...picked].reduce((s, k) => s + houses[k], 0);
      setVal('p19roR', sum);
      if (sum === best) { msg.textContent = `You found the best total: ${best}.`; setVal('p19roT', best); }
      else if (!shown) msg.textContent = picked.size ? '' : 'Click a house to rob it.';
      else msg.textContent = '';
      render();
    }
    const pickRule = ks => { picked = new Set(ks); update(); };
    document.getElementById('p19robEven').addEventListener('click', () => pickRule([0, 2, 4, 6]));
    document.getElementById('p19robGreedy').addEventListener('click', () => {
      const order = houses.map((_, k) => k).sort((a, b) => houses[b] - houses[a] || a - b), s = [];
      order.forEach(k => { if (!s.includes(k - 1) && !s.includes(k + 1)) s.push(k); });
      pickRule(s);
    });
    document.getElementById('p19robClear').addEventListener('click', () => pickRule([]));
    document.getElementById('p19robShow').addEventListener('click', () => {
      shown = true; setVal('p19roT', best);
      const el = document.getElementById('p19robTable');
      if (!player) player = TracePlayer(el, { code: ROB_CODE, frames: robFrames(houses).frames });
      else player.go(0);
    });
    update();
  })();

  /* ---------- Sandbox: three templates on your input ---------- */
  function stairsFrames(n, steps) {
    const dp = Array(n + 1).fill(null), frames = []; let more = 0;
    const L = s => lineOf(STAIRS_CODE, s);
    const grid = (hl, src) => ({ type: 'grid', name: 'dp (step: ways)', rows: [dp.map(x => x === null ? '' : x)], colLabels: dp.map((_, k) => String(k)), hl, src });
    dp[0] = 1;
    frames.push({ line: L('dp[0] = 1'), note: 'dp[0] = 1: there is one way to stand at the bottom, doing nothing.', views: [grid([[0, 0]], [])] });
    for (let i = 1; i <= n; i++) {
      const src = steps.filter(s => s <= i).map(s => [0, i - s]);
      dp[i] = src.reduce((t, [, k]) => t + dp[k], 0);
      if (frames.length >= CAP) { more++; continue; }
      frames.push({ line: L('dp[i] += dp[i - s]'), note: src.length ? `dp[${i}] = ${src.map(([, k]) => `dp[${k}]`).join(' + ')} = ${dp[i]}.` : `No step fits below ${i}: dp[${i}] = 0.`, views: [grid([[0, i]], src)] });
    }
    if (more) frames.push({ line: L('dp[i] += dp[i - s]'), note: `... ${more} more cells, same rule.`, views: [grid([], [])] });
    frames.push({ line: L('return dp[n]'), note: `${fmtN(dp[n])} ways to reach step ${n}.`, result: dp[n], views: [grid([[0, n]], [])] });
    return { frames, ans: dp[n], cells: n + 1 };
  }
  // naive counters: return the call count, or null when it passes CALL_CAP
  function capped(fn) { let c = 0; const tick = () => { if (++c > CALL_CAP) throw 0; }; try { fn(tick); return c; } catch (e) { if (e === 0) return null; throw e; } }
  const naiveStairs = (n, steps) => capped(tick => { const w = k => { tick(); if (k === 0) return 1; let t = 0; for (const s of steps) if (s <= k) t += w(k - s); return t; }; w(n); });
  const naiveRob = nums => capped(tick => { const g = i => { tick(); if (i >= nums.length) return 0; return Math.max(g(i + 1), nums[i] + g(i + 2)); }; g(0); });
  const naiveCoins = (coins, amount) => capped(tick => { const f = a => { tick(); if (a === 0) return 0; let b = Infinity; for (const c of coins) if (c <= a) b = Math.min(b, f(a - c) + 1); return b; }; f(amount); });

  (() => {
    const inA = document.getElementById('s19A'), inB = document.getElementById('s19B'), labA = document.getElementById('s19LabA'), labB = document.getElementById('s19LabB');
    const grpB = document.getElementById('s19GrpB'), err = document.getElementById('s19Err'), out = document.getElementById('s19Out'), tpEl = document.getElementById('s19Tp');
    if (!inA || !tpEl) return;
    const player = TracePlayer(tpEl, null, {});
    let mode = 'stairs';
    const MODES = {
      stairs: { a: 'n: the top step (1 to 30)', b: 'steps you may take (1 to 10, comma separated)', da: '7', db: '1, 2' },
      rob: { a: 'house values (up to 20 whole numbers, 0 to 999)', b: null, da: '4, 2, 3, 7, 8, 7, 1', db: '' },
      coins: { a: 'coin values (up to 6 numbers, 1 to 50)', b: 'amount (0 to 40)', da: '1, 3, 4', db: '6' }
    };
    function setMode(m, a, b) {
      mode = m; const M = MODES[m];
      labA.textContent = M.a; inA.value = a !== undefined ? a : M.da;
      grpB.style.display = M.b ? '' : 'none'; if (M.b) { labB.textContent = M.b; inB.value = b !== undefined ? b : M.db; }
      document.querySelectorAll('[data-s19mode]').forEach(x => x.classList.toggle('btn-primary', x.dataset.s19mode === m));
    }
    function list(s, what, lo, hi, maxLen) {
      const parts = s.split(',').map(t => t.trim()); if (parts.length && parts[parts.length - 1] === '') parts.pop();
      if (!parts.length) throw new Error(`Type at least one ${what}, for example: 1, 2`);
      if (parts.length > maxLen) throw new Error(`That is ${parts.length} ${what}s. Please use ${maxLen} or fewer.`);
      return parts.map((t, k) => {
        if (!/^\d{1,4}$/.test(t)) throw new Error(`Item ${k + 1} ("${t || 'empty'}") is not a whole number. Use digits and commas, like 1, 3, 4.`);
        const v = Number(t); if (v < lo || v > hi) throw new Error(`Item ${k + 1} is ${v}. Each ${what} must be from ${lo} to ${hi}.`);
        return v;
      });
    }
    function one(s, what, lo, hi) {
      const t = s.trim(); if (!/^\d{1,4}$/.test(t)) throw new Error(`${what} must be one whole number, like ${lo + 5}.`);
      const v = Number(t); if (v < lo || v > hi) throw new Error(`${what} is ${v}. Please pick ${lo} to ${hi}.`); return v;
    }
    function run() {
      let r, naive, code;
      try {
        if (mode === 'stairs') {
          const n = one(inA.value, 'n', 1, 30), steps = [...new Set(list(inB.value, 'step size', 1, 10, 5))];
          r = stairsFrames(n, steps); naive = naiveStairs(n, steps); code = STAIRS_CODE;
        } else if (mode === 'rob') {
          const nums = list(inA.value, 'house value', 0, 999, 20);
          r = robFrames(nums); naive = naiveRob(nums); code = ROB_CODE;
        } else {
          const coins = [...new Set(list(inA.value, 'coin', 1, 50, 6))], amount = one(inB.value, 'The amount', 0, 40);
          r = coinFrames(coins, amount); naive = naiveCoins(coins, amount); code = COIN_CODE;
        }
      } catch (e) { err.textContent = e.message; return; }
      err.textContent = '';
      player.load({ code, frames: r.frames });
      out.innerHTML = `<span class="rk">answer:</span> <span class="rv">${fmtN(r.ans)}</span><br>` +
        `<span class="rk">table cells filled:</span> <span class="rv">${r.cells}</span><br>` +
        `<span class="rk">plain recursion:</span> <span class="rv-o">${naive === null ? 'over ' + fmtN(CALL_CAP) : fmtN(naive)}</span> <span class="rk">calls</span>`;
    }
    document.querySelectorAll('[data-s19mode]').forEach(btn => btn.addEventListener('click', () => { setMode(btn.dataset.s19mode); run(); }));
    document.querySelectorAll('[data-s19ex]').forEach(btn => btn.addEventListener('click', () => { const [m, a, b] = btn.dataset.s19ex.split('|'); setMode(m, a, b); run(); }));
    document.getElementById('s19Run').addEventListener('click', run);
    [inA, inB].forEach(x => x.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); run(); } }));
    setMode('stairs'); run();
  })();
})();
