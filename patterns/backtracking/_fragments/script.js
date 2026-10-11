// ======== SLOT 13: PATTERN LESSON, BACKTRACKING ========
(() => {
  const ALL_CODE = `def pick_sum_all(nums, target):
    out, path = [], []
    def bt(start):
        if sum(path) == target:
            out.append(path[:])
        for i in range(start, len(nums)):
            path.append(nums[i])
            bt(i + 1)
            path.pop()
    bt(0)
    return out`;
  const PRUNE_CODE = `def pick_sum(nums, target):
    nums = sorted(nums)
    out, path = [], []
    def bt(start, remain):
        if remain == 0:
            out.append(path[:])
            return
        for i in range(start, len(nums)):
            if nums[i] > remain:
                break
            path.append(nums[i])
            bt(i + 1, remain - nums[i])
            path.pop()
    bt(0, target)
    return out`;
  const SUB_CODE = `def subsets(nums):
    out, path = [], []
    def bt(start):
        out.append(path[:])
        for i in range(start, len(nums)):
            path.append(nums[i])
            bt(i + 1)
            path.pop()
    bt(0)
    return out`;
  const SUB2_CODE = `def subsets_no_dups(nums):
    nums = sorted(nums)
    out, path = [], []
    def bt(start):
        out.append(path[:])
        for i in range(start, len(nums)):
            if i > start and nums[i] == nums[i - 1]:
                continue
            path.append(nums[i])
            bt(i + 1)
            path.pop()
    bt(0)
    return out`;
  const PERM_CODE = `def permutations(nums):
    out, path = [], []
    used = [False] * len(nums)
    def bt():
        if len(path) == len(nums):
            out.append(path[:])
            return
        for i in range(len(nums)):
            if used[i]:
                continue
            used[i] = True
            path.append(nums[i])
            bt()
            path.pop()
            used[i] = False
    bt()
    return out`;
  const COMB_CODE = `def combination_sum(cands, target):
    cands = sorted(cands)
    out, path = [], []
    def bt(start, remain):
        if remain == 0:
            out.append(path[:])
            return
        for i in range(start, len(cands)):
            if cands[i] > remain:
                break
            path.append(cands[i])
            bt(i, remain - cands[i])
            path.pop()
    bt(0, target)
    return out`;
  const CAP = 60;
  const sum = a => a.reduce((x, y) => x + y, 0);
  const fmtL = a => '[' + a.join(', ') + ']';

  // Records one run: the decision tree (nodes in the order they appear) and a snapshot per step.
  // Counting rules match measure.py: nodes = calls to bt (root included), cuts = times the pruning test fires.
  function recorder(code) {
    const nodes = [{ id: 0, parent: -1, label: '[ ]', depth: 0 }], st = {}, ev = [];
    const R = {
      nodes, st, ev, skipped: 0,
      add(parent, label) { const id = nodes.length; nodes.push({ id, parent, label: String(label), depth: nodes[parent].depth + 1 }); return id; },
      push(snip, note, cur, path, vars, opt) {
        ev.push(Object.assign({ line: lineOf(code, snip), note, cur, path: path.slice(), vars: Object.assign({}, vars), shown: nodes.length, st: Object.assign({}, st) }, opt || {}));
      },
      snap(snip, note, cur, path, vars, opt) { if (ev.length >= CAP - 1) { R.skipped++; return; } R.push(snip, note, cur, path, vars, opt); }
    };
    return R;
  }
  const head = (id, path) => id === 0 ? 'Start at the root: the path is empty.' : `Choose ${path[path.length - 1]}: the path is ${fmtL(path)}.`;

  function runAll(nums, target) {
    const R = recorder(ALL_CODE), path = [], out = [];
    let cnt = 0;
    const vars = () => ({ sum: sum(path), target, nodes: cnt, found: out.length });
    (function bt(start, id) {
      cnt++;
      const s = sum(path), hit = s === target;
      if (hit) { out.push(path.slice()); R.st[id] = 'frontier'; }
      R.snap(hit ? 'out.append(path[:])' : 'if sum(path) == target', `${head(id, path)} Sum ${s}. ${hit ? `That is ${target}: record a copy.` : s > target ? `Already past ${target}, but this version keeps going anyway.` : `Not ${target}.`}`, id, path, vars());
      for (let i = start; i < nums.length; i++) {
        const c = R.add(id, nums[i]);
        path.push(nums[i]); bt(i + 1, c); path.pop();
        if (!R.st[c]) R.st[c] = 'visited';
        R.snap('path.pop()', `Un-choose ${nums[i]}: rub out the chalk. Back to ${fmtL(path)}.`, id, path, vars());
      }
    })(0, 0);
    if (!R.st[0]) R.st[0] = 'visited';
    R.push('return out', `Done: ${cnt} nodes visited, ${out.length} answer${out.length === 1 ? '' : 's'}.`, -1, [], vars(), { result: out });
    return { out, nodes: cnt, cuts: 0, R };
  }

  function runPrune(nums, target) {
    const a = nums.slice().sort((x, y) => x - y), R = recorder(PRUNE_CODE), path = [], out = [];
    let cnt = 0, cuts = 0;
    const vars = r => ({ remain: r, nodes: cnt, cuts, found: out.length });
    (function bt(start, remain, id) {
      cnt++;
      if (remain === 0) {
        out.push(path.slice()); R.st[id] = 'frontier';
        R.snap('out.append(path[:])', `${head(id, path)} remain is 0: record a copy and go back.`, id, path, vars(remain));
        return;
      }
      R.snap('if remain == 0', `${head(id, path)} remain is ${remain}.`, id, path, vars(remain));
      for (let i = start; i < a.length; i++) {
        if (a[i] > remain) {
          cuts++;
          const c = R.add(id, a[i]); R.st[c] = 'done';
          R.snap('break', `Next is ${a[i]}, bigger than remain ${remain}. Cut! The list is sorted, so every later number is too big as well.`, id, path, vars(remain));
          break;
        }
        const c = R.add(id, a[i]);
        path.push(a[i]); bt(i + 1, remain - a[i], c); path.pop();
        if (!R.st[c]) R.st[c] = 'visited';
        R.snap('path.pop()', `Un-choose ${a[i]}. Back to ${fmtL(path)}, remain ${remain}.`, id, path, vars(remain));
      }
    })(0, target, 0);
    if (!R.st[0]) R.st[0] = 'visited';
    R.push('return out', `Done: ${cnt} nodes visited, ${cuts} cuts, ${out.length} answer${out.length === 1 ? '' : 's'}.`, -1, [], vars(target), { result: out });
    return { out, nodes: cnt, cuts, R };
  }

  function runSub(nums) {
    const R = recorder(SUB_CODE), path = [], out = [];
    let cnt = 0;
    const vars = () => ({ nodes: cnt, found: out.length });
    (function bt(start, id) {
      cnt++;
      out.push(path.slice()); R.st[id] = 'frontier';
      R.snap('out.append(path[:])', `${head(id, path)} Every node is an answer here: record a copy.`, id, path, vars());
      for (let i = start; i < nums.length; i++) {
        const c = R.add(id, nums[i]);
        path.push(nums[i]); bt(i + 1, c); path.pop();
        R.snap('path.pop()', `Un-choose ${nums[i]}. Back to ${fmtL(path)}; the next choices start after index ${i}.`, id, path, vars());
      }
    })(0, 0);
    R.push('return out', `Done: ${out.length} subsets from ${cnt} nodes. Each node was one subset.`, -1, [], vars(), { result: out });
    return { out, nodes: cnt, cuts: 0, R };
  }

  function runSub2(nums) {
    const a = nums.slice().sort((x, y) => x - y), R = recorder(SUB2_CODE), path = [], out = [];
    let cnt = 0, cuts = 0;
    const vars = () => ({ nodes: cnt, skipped: cuts, found: out.length });
    (function bt(start, id) {
      cnt++;
      out.push(path.slice()); R.st[id] = 'frontier';
      R.snap('out.append(path[:])', `${head(id, path)} Record a copy.`, id, path, vars());
      for (let i = start; i < a.length; i++) {
        if (i > start && a[i] === a[i - 1]) {
          cuts++;
          const c = R.add(id, a[i]); R.st[c] = 'done';
          R.snap('continue', `Skip this ${a[i]}: an equal number was already tried at this level, so it would build the same lists again.`, id, path, vars());
          continue;
        }
        const c = R.add(id, a[i]);
        path.push(a[i]); bt(i + 1, c); path.pop();
        R.snap('path.pop()', `Un-choose ${a[i]}. Back to ${fmtL(path)}.`, id, path, vars());
      }
    })(0, 0);
    R.push('return out', `Done: ${out.length} different subsets, ${cuts} duplicate branch${cuts === 1 ? '' : 'es'} skipped.`, -1, [], vars(), { result: out });
    return { out, nodes: cnt, cuts, R };
  }

  function runPerm(nums) {
    const R = recorder(PERM_CODE), path = [], out = [], used = nums.map(() => false);
    let cnt = 0;
    const vars = () => ({ nodes: cnt, found: out.length });
    const more = () => ({ more: [{ type: 'array', name: 'used', values: used.slice(), hl: used.map((u, k) => u ? k : -1).filter(k => k >= 0) }] });
    (function bt(id) {
      cnt++;
      if (path.length === nums.length) {
        out.push(path.slice()); R.st[id] = 'frontier';
        R.snap('out.append(path[:])', `${head(id, path)} Every number is used: record a copy.`, id, path, vars(), more());
        return;
      }
      R.snap('if len(path) == len(nums)', `${head(id, path)} Not full yet.`, id, path, vars(), more());
      for (let i = 0; i < nums.length; i++) {
        if (used[i]) { R.snap('continue', `${nums[i]} is already on the path: skip it.`, id, path, vars(), more()); continue; }
        used[i] = true;
        const c = R.add(id, nums[i]);
        path.push(nums[i]); bt(c); path.pop();
        used[i] = false;
        if (!R.st[c]) R.st[c] = 'visited';
        R.snap('path.pop()', `Un-choose ${nums[i]} and mark it unused again. Back to ${fmtL(path)}.`, id, path, vars(), more());
      }
    })(0);
    if (!R.st[0]) R.st[0] = 'visited';
    R.push('return out', `Done: ${out.length} orders from ${cnt} nodes.`, -1, [], vars(), Object.assign({ result: out }, more()));
    return { out, nodes: cnt, cuts: 0, R };
  }

  function runComb(cands, target) {
    const a = cands.slice().sort((x, y) => x - y), R = recorder(COMB_CODE), path = [], out = [];
    let cnt = 0, cuts = 0;
    const vars = r => ({ remain: r, nodes: cnt, cuts, found: out.length });
    (function bt(start, remain, id) {
      cnt++;
      if (remain === 0) {
        out.push(path.slice()); R.st[id] = 'frontier';
        R.snap('out.append(path[:])', `${head(id, path)} remain is 0: record a copy.`, id, path, vars(remain));
        return;
      }
      R.snap('if remain == 0', `${head(id, path)} remain is ${remain}. Choices start at index ${start}, so ${a[start]} may be used again.`, id, path, vars(remain));
      for (let i = start; i < a.length; i++) {
        if (a[i] > remain) {
          cuts++;
          const c = R.add(id, a[i]); R.st[c] = 'done';
          R.snap('break', `${a[i]} is bigger than remain ${remain}: cut here and skip the rest.`, id, path, vars(remain));
          break;
        }
        const c = R.add(id, a[i]);
        path.push(a[i]); bt(i, remain - a[i], c); path.pop();
        if (!R.st[c]) R.st[c] = 'visited';
        R.snap('path.pop()', `Un-choose ${a[i]}. Back to ${fmtL(path)}, remain ${remain}.`, id, path, vars(remain));
      }
    })(0, target, 0);
    if (!R.st[0]) R.st[0] = 'visited';
    R.push('return out', `Done: ${cnt} nodes, ${cuts} cuts, ${out.length} answer${out.length === 1 ? '' : 's'}.`, -1, [], vars(target), { result: out });
    return { out, nodes: cnt, cuts, R };
  }

  // Turn a recorded run into TracePlayer frames: a growing decision tree (graph view), the path, and counters.
  function toFrames(R) {
    const nodes = R.nodes, kids = nodes.map(() => []);
    nodes.forEach(n => { if (n.parent >= 0) kids[n.parent].push(n.id); });
    let leaf = 0;
    const X = [];
    (function lay(id) {
      if (!kids[id].length) { X[id] = leaf++; return; }
      kids[id].forEach(lay);
      X[id] = (X[kids[id][0]] + X[kids[id][kids[id].length - 1]]) / 2;
    })(0);
    const maxD = Math.max(1, ...nodes.map(n => n.depth));
    const drawTree = leaf <= 11 && nodes.length <= 45;
    const frameOf = e => {
      const views = [];
      if (drawTree) {
        const shown = nodes.slice(0, e.shown), state = {}, hl = [];
        shown.forEach(n => { if (e.st[n.id]) state[n.id] = e.st[n.id]; });
        if (e.cur >= 0) { state[e.cur] = 'current'; for (let k = e.cur; nodes[k].parent >= 0; k = nodes[k].parent) hl.push([nodes[k].parent, k]); }
        views.push({
          type: 'graph', name: 'decision tree (teal: you are here, ring: answer, faded: cut)',
          nodes: shown.map(n => ({ id: n.id, label: n.label, x: leaf > 1 ? X[n.id] / (leaf - 1) : 0.5, y: n.depth / maxD })),
          edges: shown.filter(n => n.parent >= 0).map(n => [n.parent, n.id]), hl, state
        });
      }
      views.push({ type: 'array', name: 'path (the chalk marks)', values: e.path });
      if (e.more) views.push(...e.more);
      views.push({ type: 'vars', values: e.vars });
      const f = { line: e.line, note: e.note, views };
      if (e.result !== undefined) f.result = e.result;
      return f;
    };
    const frames = R.ev.map(frameOf);
    if (R.skipped) frames[frames.length - 1].note = `... ${R.skipped} more steps follow the same rule. ` + frames[frames.length - 1].note;
    return { frames, drawTree };
  }

  const setVal = (id, v) => { const el = document.getElementById(id); if (!el) return; el.querySelector('.val').textContent = v; flash(el); };

  /* ---------- Section 1: generate everything vs backtrack with pruning ---------- */
  (() => {
    const nums = [2, 3, 4, 5], target = 7;
    const a = runAll(nums, target), b = runPrune(nums, target);
    const elA = document.getElementById('p13tpA'), elB = document.getElementById('p13tpB');
    if (elA) TracePlayer(elA, { frames: toFrames(a.R).frames }, { code: false });
    if (elB) TracePlayer(elB, { frames: toFrames(b.R).frames }, { code: false });
    setVal('p13roA', a.nodes); setVal('p13roB', b.nodes); setVal('p13roC', b.cuts);
  })();

  /* ---------- Section 4: the three templates in one player ---------- */
  (() => {
    const el = document.getElementById('p13tpT'); if (!el) return;
    const player = TracePlayer(el, null, {});
    const V = {
      sub: () => ({ code: SUB_CODE, r: runSub([1, 2, 3]) }),
      perm: () => ({ code: PERM_CODE, r: runPerm([1, 2, 3]) }),
      comb: () => ({ code: COMB_CODE, r: runComb([2, 3, 5], 8) })
    };
    const btns = document.querySelectorAll('[data-p13v]');
    function pick(k) {
      const { code, r } = V[k]();
      player.load({ code, frames: toFrames(r.R).frames });
      btns.forEach(b => b.classList.toggle('btn-primary', b.dataset.p13v === k));
      setVal('p13roTa', r.out.length); setVal('p13roTn', r.nodes); setVal('p13roTc', r.cuts);
    }
    btns.forEach(b => b.addEventListener('click', () => pick(b.dataset.p13v)));
    pick('sub');
  })();

  /* ---------- Section 2: the pruning race ---------- */
  function countAll(n) { let c = 0; (function bt(s) { c++; for (let i = s; i < n; i++) bt(i + 1); })(0); return c; }
  function countPrune(nums, target) {
    const a = nums.slice().sort((x, y) => x - y); let c = 0, cuts = 0, found = 0;
    (function bt(s, r) { c++; if (r === 0) { found++; return; } for (let i = s; i < a.length; i++) { if (a[i] > r) { cuts++; break; } bt(i + 1, r - a[i]); } })(0, target);
    return { nodes: c, cuts, found };
  }
  (() => {
    const cv = document.getElementById('p13cvR'), slider = document.getElementById('p13Tg'); if (!cv || !slider) return;
    const active = () => document.getElementById('lesson13').classList.contains('active');
    const cache = new Map(), num = v => Math.round(v).toLocaleString('en-US');
    let n = 10, T = 10, all = 0, pr = { nodes: 0, cuts: 0, found: 0 }, prog = 1, raf = 0;
    function measure() {
      if (!cache.has(n)) cache.set(n, countAll(n));
      all = cache.get(n);
      pr = countPrune(Array.from({ length: n }, (_, k) => k + 1), T);
    }
    function draw() {
      if (!cv.clientWidth) return;
      const { ctx: c, w, h } = fit(cv, Math.max(0.26, 150 / cv.clientWidth));
      c.clearRect(0, 0, w, h);
      const pad = 12, track = w - 2 * pad, done = prog * all;
      [{ label: 'build every subset', total: all, col: css('--orange'), y: h * 0.3 },
       { label: 'backtrack with pruning', total: pr.nodes, col: css('--teal'), y: h * 0.74 }].forEach(L => {
        const got = Math.min(L.total, done), fin = got >= L.total;
        text(c, L.label, pad, L.y - 16, css('--text-bright'), 12, 'left', 600);
        text(c, `${num(got)} nodes${fin ? ', done' : ''}`, w - pad, L.y - 16, L.col, 12, 'right', 700);
        c.fillStyle = css('--bg-input'); c.fillRect(pad, L.y, track, 12);
        c.fillStyle = L.col; c.fillRect(pad, L.y, Math.max(2, track * got / all), 12);
      });
    }
    function show() {
      setVal('p13roN', n); setVal('p13roTt', T);
      const o = document.getElementById('p13TgOut'); if (o) o.textContent = T; setVal('p13roE', num(all)); setVal('p13roP', num(pr.nodes));
      setVal('p13roF', pr.found); setVal('p13roX', (all / pr.nodes).toLocaleString('en-US', { maximumFractionDigits: 0 }) + 'x');
    }
    function update() { cancelAnimationFrame(raf); measure(); prog = 1; show(); draw(); }
    function race() {
      cancelAnimationFrame(raf);
      if (RM) { prog = 1; draw(); return; }
      const t0 = performance.now(), dur = 2500;
      const tick = t => { prog = Math.min(1, (t - t0) / dur); draw(); if (prog < 1 && active()) raf = requestAnimationFrame(tick); else { prog = 1; draw(); } };
      prog = 0; raf = requestAnimationFrame(tick);
    }
    document.querySelectorAll('[data-p13n]').forEach(b => b.addEventListener('click', () => { n = Number(b.dataset.p13n); update(); }));
    slider.addEventListener('input', () => { T = Number(slider.value); update(); });
    document.getElementById('p13raceGo').addEventListener('click', race);
    window.addEventListener('resize', () => { if (active()) draw(); });
    window.addEventListener('themechange', () => { if (active()) draw(); });
    T = Number(slider.value); measure(); show(); draw();
  })();

  /* ---------- Sandbox: run a template on your own numbers ---------- */
  (() => {
    const inp = document.getElementById('s13In'), tg = document.getElementById('s13Tg'), err = document.getElementById('s13Err'), out = document.getElementById('s13Out'), tpEl = document.getElementById('s13Tp');
    if (!inp || !tpEl) return;
    const player = TracePlayer(tpEl, null, {});
    const MODES = {
      sub: { name: 'subsets', max: 6, code: SUB_CODE, run: a => runSub(a) },
      sub2: { name: 'subsets without duplicates', max: 6, code: SUB2_CODE, run: a => runSub2(a) },
      perm: { name: 'permutations', max: 5, code: PERM_CODE, run: a => runPerm(a) },
      comb: { name: 'combination sum', max: 6, code: COMB_CODE, run: (a, t) => runComb(a, t) }
    };
    let mode = 'sub';
    const modeBtns = document.querySelectorAll('[data-s13m]');
    function setMode(m) { mode = m; modeBtns.forEach(b => b.classList.toggle('btn-primary', b.dataset.s13m === m)); }
    function parse(s, m) {
      const parts = s.split(',').map(t => t.trim());
      if (parts.length && parts[parts.length - 1] === '') parts.pop();
      if (!parts.length) throw new Error('Type at least one number, for example: 1, 2, 3');
      const vals = parts.map((t, k) => {
        if (!/^-?\d{1,2}$/.test(t)) throw new Error(`Item ${k + 1} ("${t || 'empty'}") is not a whole number between -99 and 99. Use digits and commas, like 1, 2, 3.`);
        return Number(t);
      });
      if (vals.length > m.max) throw new Error(`${m.name} with ${vals.length} numbers makes a huge tree. Please use ${m.max} or fewer.`);
      if (mode === 'comb') {
        if (vals.some(v => v < 1 || v > 30)) throw new Error('For combination sum, use candidates from 1 to 30. A 0 or a negative number could be added forever.');
        if (new Set(vals).size !== vals.length) throw new Error('For combination sum, make the candidates all different (each one may already be reused).');
      }
      return vals;
    }
    function run() {
      const m = MODES[mode];
      let nums, t = null;
      try {
        nums = parse(inp.value, m);
        if (mode === 'comb') {
          if (!/^\d{1,2}$/.test(tg.value.trim()) || Number(tg.value) < 1 || Number(tg.value) > 30) throw new Error('The target must be a whole number from 1 to 30.');
          t = Number(tg.value);
        }
      } catch (e) { err.textContent = e.message; return; }
      err.textContent = '';
      const r = m.run(nums, t), tf = toFrames(r.R);
      player.load({ code: m.code, frames: tf.frames });
      const shown = r.out.slice(0, 10).map(fmtL).join(' ');
      out.innerHTML = `<span class="rk">template:</span> <span class="rv">${m.name}</span><br>` +
        `<span class="rk">answers:</span> <span class="rv">${r.out.length}</span><br>` +
        `<span class="rk">nodes visited:</span> <span class="rv">${r.nodes}</span>` +
        (mode === 'comb' ? ` <span class="rk">cuts:</span> <span class="rv-o">${r.cuts}</span>` : '') +
        (mode === 'sub2' ? ` <span class="rk">duplicate branches skipped:</span> <span class="rv-o">${r.cuts}</span>` : '') + '<br>' +
        `<span class="rk">first answers:</span> <span class="rv">${shown || 'none'}</span>${r.out.length > 10 ? ` <span class="rk">and ${r.out.length - 10} more</span>` : ''}` +
        (tf.drawTree ? '' : '<br><span class="rk">The tree is too big to draw here, so the player shows the path and the counters only.</span>');
    }
    modeBtns.forEach(b => b.addEventListener('click', () => { setMode(b.dataset.s13m); run(); }));
    document.querySelectorAll('[data-s13ex]').forEach(b => b.addEventListener('click', () => {
      const [m, nums, t] = b.dataset.s13ex.split('|');
      setMode(m); inp.value = nums; if (t) tg.value = t; run();
    }));
    document.getElementById('s13Run').addEventListener('click', run);
    [inp, tg].forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); run(); } }));
    setMode('sub'); run();
  })();
})();
