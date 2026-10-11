// ======== SLOT 11: PATTERN LESSON, TREES ========
(() => {
  const CAP = 60;
  const DEPTH_CODE = `def max_depth(node):
    if not node:
        return 0
    left = max_depth(node.left)
    right = max_depth(node.right)
    return 1 + max(left, right)`;
  const PATH_CODE = `def max_depth_slow(root):
    best = 0
    for leaf in all_leaves(root):
        steps = walk_down(root, leaf)
        best = max(best, steps)
    return best`;
  const BST_CODE = `def is_bst(node, lo, hi):
    if not node: return True
    if not lo < node.val < hi:
        return False
    if not is_bst(node.left, lo, node.val):
        return False
    return is_bst(node.right, node.val, hi)`;
  const DIAM_CODE = `def diameter(root):
    best = 0
    def height(node):
        nonlocal best
        if not node: return 0
        l = height(node.left)
        r = height(node.right)
        best = max(best, l + r)
        return 1 + max(l, r)
    height(root)
    return best`;
  const BFS_CODE = `def level_order(root):
    if not root:
        return []
    out, q = [], deque([root])
    while q:
        level = []
        for _ in range(len(q)):
            node = q.popleft()
            level.append(node.val)
            if node.left:
                q.append(node.left)
            if node.right:
                q.append(node.right)
        out.append(level)
    return out`;
  const ORDER_CODE = {
    pre: `def preorder(node, out):
    if not node:
        return
    out.append(node.val)
    preorder(node.left, out)
    preorder(node.right, out)`,
    in: `def inorder(node, out):
    if not node:
        return
    inorder(node.left, out)
    out.append(node.val)
    inorder(node.right, out)`,
    post: `def postorder(node, out):
    if not node:
        return
    postorder(node.left, out)
    postorder(node.right, out)
    out.append(node.val)`
  };

  /* ---------- tree building and drawing ---------- */
  // LeetCode level order (null = missing child) -> { root, nodes } ; node ids are their BFS order.
  function build(vals) {
    const nodes = [];
    if (!vals.length || vals[0] === null) return { root: null, nodes };
    const mk = v => { const nd = { id: nodes.length, val: v, left: null, right: null, depth: 0 }; nodes.push(nd); return nd; };
    const root = mk(vals[0]), q = [root];
    let i = 1, h = 0;
    while (h < q.length && i < vals.length) {
      const nd = q[h++];
      if (i < vals.length && vals[i] !== null) { nd.left = mk(vals[i]); nd.left.depth = nd.depth + 1; q.push(nd.left); }
      i++;
      if (i < vals.length && vals[i] !== null) { nd.right = mk(vals[i]); nd.right.depth = nd.depth + 1; q.push(nd.right); }
      i++;
    }
    return { root, nodes };
  }
  // Positions: x from the inorder rank (never overlaps on one level), y from the depth, centred.
  function layout(T) {
    const order = [];
    (function walk(nd) { if (!nd) return; walk(nd.left); order.push(nd); walk(nd.right); })(T.root);
    const n = order.length, maxD = Math.max(0, ...T.nodes.map(nd => nd.depth));
    const gap = Math.min(0.24, 1 / Math.max(1, maxD)), off = (1 - maxD * gap) / 2;
    const gnodes = order.map((nd, k) => ({ id: nd.id, label: nd.val, x: n === 1 ? 0.5 : k / (n - 1), y: off + nd.depth * gap }));
    gnodes.sort((a, b) => a.id - b.id);
    const edges = [];
    T.nodes.forEach(nd => { if (nd.left) edges.push([nd.id, nd.left.id]); if (nd.right) edges.push([nd.id, nd.right.id]); });
    T.g = { nodes: gnodes, edges };
    return T;
  }
  const treeView = (T, state, hl, name) => ({ type: 'graph', name: name || 'tree', nodes: T.g.nodes, edges: T.g.edges, state: Object.assign({}, state), hl: hl || [] });
  const make = vals => layout(build(vals));
  const PIC = [8, 3, 10, 1, 6, null, 14, null, null, 4, 7, 13];

  /* ---------- Template A: max depth, recorded ---------- */
  function depthFrames(T) {
    const frames = [], L = s => lineOf(DEPTH_CODE, s), state = {}, stack = [], answers = [];
    let real = 0, empty = 0, more = 0;
    const push = (line, note, extra) => {
      if (frames.length >= CAP) { more++; return; }
      frames.push(Object.assign({ line: L(line), note, views: [treeView(T, state, []), { type: 'stack', name: 'call stack', values: stack.slice() }, { type: 'map', name: 'answers reported (node : depth)', entries: answers.slice(), new: extra && extra.newKey }, { type: 'vars', values: { 'node visits': real, 'empty calls': empty } }] }, extra && extra.f));
    };
    function rec(nd, from) {
      if (!nd) {
        empty++;
        push('return 0', `${from}: this child is empty (None), so it answers 0 at once.`);
        return 0;
      }
      real++;
      stack.push(`max_depth(${nd.val})`);
      Object.keys(state).forEach(k => { if (state[k] === 'current') state[k] = 'frontier'; });
      state[nd.id] = 'current';
      push('if not node', `Visit ${nd.val}. It is a real node, so it asks its left child first.`);
      state[nd.id] = 'frontier';
      const l = rec(nd.left, `Left of ${nd.val}`);
      state[nd.id] = 'current';
      push('right = max_depth(node.right)', `Back at ${nd.val}: left said ${l}. Now ask the right child.`);
      state[nd.id] = 'frontier';
      const r = rec(nd.right, `Right of ${nd.val}`);
      const d = 1 + Math.max(l, r);
      stack.pop(); state[nd.id] = 'current'; answers.push([nd.val, d]);
      push('return 1 + max(left, right)', `${nd.val} combines: 1 + max(${l}, ${r}) = ${d}. It reports ${d} up and is done.`, { newKey: nd.val });
      state[nd.id] = 'done';
      return d;
    }
    const d = rec(T.root, 'The root');
    if (more) frames.push({ line: L('return 1 + max(left, right)'), note: `... ${more} more steps, same rule: ask left, ask right, report 1 + the bigger answer.`, views: [treeView(T, state, []), { type: 'vars', values: { 'node visits': real, 'empty calls': empty } }] });
    frames.push({ line: L('return 1 + max(left, right)'), note: `Done: depth ${d}. Every node was visited once (${real} visits) and every empty spot once (${empty} calls).`, result: d, views: [treeView(T, state, []), { type: 'stack', name: 'call stack', values: [] }, { type: 'map', name: 'answers reported (node : depth)', entries: answers.slice() }, { type: 'vars', values: { 'node visits': real, 'empty calls': empty } }] });
    return { depth: d, real, empty, frames };
  }

  /* ---------- Slow way: walk from the root to every leaf ---------- */
  function pathFrames(T) {
    const frames = [], L = s => lineOf(PATH_CODE, s), paths = [];
    (function leaves(nd, path) { if (!nd) return; path = path.concat([nd]); if (!nd.left && !nd.right) paths.push(path); leaves(nd.left, path); leaves(nd.right, path); })(T.root, []);
    let visits = 0, best = 0, more = 0;
    frames.push({ line: L('best = 0'), note: `There are ${paths.length} people with no reports. Walk from the top to each of them, one path at a time.`, views: [treeView(T, {}, []), { type: 'vars', values: { path: '-', steps: 0, best: 0, 'node visits': 0 } }] });
    paths.forEach((p, k) => {
      for (let s = 0; s < p.length; s++) {
        visits++;
        const state = {}, hl = [];
        for (let t = 0; t < s; t++) { state[p[t].id] = 'visited'; hl.push([p[t].id, p[t + 1].id]); }
        state[p[s].id] = 'current';
        const again = k > 0 && s < p.length - 1 && paths.slice(0, k).some(q => q[s] === p[s]);
        if (frames.length >= CAP) { more++; continue; }
        frames.push({ line: L('steps = walk_down(root, leaf)'), note: `Path ${k + 1}, step ${s + 1}: visit ${p[s].val}.${again ? ' Walked already on an earlier path.' : ''}`, views: [treeView(T, state, hl), { type: 'vars', values: { path: k + 1, steps: s + 1, best, 'node visits': visits } }] });
      }
      best = Math.max(best, p.length);
      if (frames.length < CAP) frames.push({ line: L('best = max(best, steps)'), note: `Leaf ${p[p.length - 1].val} is ${p.length} deep. Best so far: ${best}.`, views: [treeView(T, Object.fromEntries(p.map(nd => [nd.id, 'visited'])), p.slice(1).map((nd, t) => [p[t].id, nd.id])), { type: 'vars', values: { path: k + 1, steps: p.length, best, 'node visits': visits } }] });
      else more++;
    });
    if (more) frames.push({ line: L('best = max(best, steps)'), note: `... ${more} more steps, same rule: walk the whole path again for every leaf.`, views: [treeView(T, {}, []), { type: 'vars', values: { best, 'node visits': visits } }] });
    frames.push({ line: L('return best'), note: `Done: depth ${best}, but it took ${visits} node visits because shared bosses were walked again on every path.`, result: best, views: [treeView(T, {}, []), { type: 'vars', values: { best, 'node visits': visits } }] });
    return { depth: best, visits, frames };
  }

  /* ---------- Template B: BST bounds ---------- */
  function bstFrames(T) {
    const frames = [], L = s => lineOf(BST_CODE, s), state = {};
    const show = x => x === -Infinity ? '-inf' : x === Infinity ? 'inf' : x;
    const push = (line, note, vars, f) => { if (frames.length < CAP) frames.push(Object.assign({ line: L(line), note, views: [treeView(T, state, []), { type: 'vars', values: vars }] }, f)); };
    function rec(nd, lo, hi, side) {
      if (!nd) { push('if not node: return True', `${side} is empty: nothing can break the rule, so True.`, { lo: show(lo), hi: show(hi) }); return true; }
      state[nd.id] = 'current';
      const ok = lo < nd.val && nd.val < hi;
      push(ok ? 'if not lo < node.val < hi' : 'return False', `Node ${nd.val} must be between ${show(lo)} and ${show(hi)}. ${ok ? 'It is.' : `It is not: ${nd.val} ${nd.val <= lo ? '<=' : '>='} ${nd.val <= lo ? show(lo) : show(hi)}. Return False.`}`, { 'node.val': nd.val, lo: show(lo), hi: show(hi), ok });
      if (!ok) { state[nd.id] = 'frontier'; return false; }
      state[nd.id] = 'visited';
      if (!rec(nd.left, lo, nd.val, `Left of ${nd.val}`)) return false;
      if (!rec(nd.right, nd.val, hi, `Right of ${nd.val}`)) return false;
      return true;
    }
    const res = rec(T.root, -Infinity, Infinity, 'The tree');
    frames.push({ line: L(res ? 'return is_bst(node.right' : 'if not is_bst(node.left'), note: res ? 'Every node fit inside the bounds from all its ancestors: a valid BST.' : 'One node broke a bound set by an ancestor higher up. Each waiting call sees the False and returns False at once.', result: res, views: [treeView(T, state, [])] });
    return { res, frames };
  }

  /* ---------- Template C: diameter ---------- */
  function diamFrames(T) {
    const frames = [], L = s => lineOf(DIAM_CODE, s), state = {}, heights = [];
    let best = 0;
    function rec(nd) {
      if (!nd) return 0;
      state[nd.id] = 'current';
      frames.push({ line: L('l = height(node.left)'), note: `Visit ${nd.val}: ask both arms for their heights.`, views: [treeView(T, state, []), { type: 'map', name: 'height returned (node : height)', entries: heights.slice() }, { type: 'vars', values: { best } }] });
      state[nd.id] = 'frontier';
      const l = rec(nd.left), r = rec(nd.right);
      state[nd.id] = 'current';
      const old = best; best = Math.max(best, l + r);
      frames.push({ line: L('best = max(best, l + r)'), note: `At ${nd.val}: left arm ${l}, right arm ${r}. A path bending here has ${l + r} edges. ${best > old ? `New best: ${best}.` : `Best stays ${best}.`}`, views: [treeView(T, state, []), { type: 'map', name: 'height returned (node : height)', entries: heights.slice() }, { type: 'vars', values: { l, r, 'l + r': l + r, best } }] });
      heights.push([nd.val, 1 + Math.max(l, r)]);
      frames.push({ line: L('return 1 + max(l, r)'), note: `${nd.val} reports height ${1 + Math.max(l, r)} up, not ${best}. Its parent needs a height.`, views: [treeView(T, state, []), { type: 'map', name: 'height returned (node : height)', entries: heights.slice(), new: nd.val }, { type: 'vars', values: { l, r, best } }] });
      state[nd.id] = 'done';
      return 1 + Math.max(l, r);
    }
    const h = rec(T.root);
    frames.push({ line: L('return best'), note: `The root's height is ${h}, but the answer is best = ${best}. The longest path bends below the root.`, result: best, views: [treeView(T, state, []), { type: 'vars', values: { 'root height': h, best } }] });
    return { best, frames };
  }

  /* ---------- Template D: BFS ---------- */
  function bfsFrames(T) {
    const frames = [], L = s => lineOf(BFS_CODE, s), state = {}, out = [];
    let more = 0, widest = 0;
    const qv = q => ({ type: 'queue', name: 'q (front on the left)', values: q.map(nd => nd.val) });
    const push = (line, note, q, level, f) => {
      if (frames.length >= CAP) { more++; return; }
      frames.push(Object.assign({ line: L(line), note, views: [treeView(T, state, []), qv(q), { type: 'array', name: 'level', values: level.slice() }, { type: 'vars', values: { out: JSON.stringify(out).replace(/,/g, ', ') } }] }, f));
    };
    if (!T.root) { frames.push({ line: L('return []'), note: 'The tree is empty: no levels at all.', result: [], views: [treeView(T, {}, [])] }); return { out, widest, frames }; }
    const q = [T.root]; state[T.root.id] = 'frontier';
    push('out, q = [], deque([root])', 'Start with only the root in the queue.', q, []);
    while (q.length) {
      const level = [], size = q.length;
      widest = Math.max(widest, size);
      push('for _ in range(len(q)):', `Level ${out.length + 1}: the queue holds ${size} node${size > 1 ? 's' : ''} right now, so this level has exactly ${size}.`, q, level);
      for (let k = 0; k < size; k++) {
        const nd = q.shift(); level.push(nd.val); state[nd.id] = 'current';
        if (nd.left) { q.push(nd.left); state[nd.left.id] = 'frontier'; }
        if (nd.right) { q.push(nd.right); state[nd.right.id] = 'frontier'; }
        const kids = [nd.left, nd.right].filter(Boolean).map(c => c.val);
        push('node = q.popleft()', `Take ${nd.val} from the front and add it to this level. ${kids.length ? `Queue its children ${kids.join(' and ')} at the back.` : 'It has no children.'}`, q, level);
        state[nd.id] = 'visited';
      }
      out.push(level);
      push('out.append(level)', `Level ${out.length} is done: [${level.join(', ')}].`, q, level);
    }
    if (more) frames.push({ line: L('out.append(level)'), note: `... ${more} more steps, same rule: one loop turn per level.`, views: [treeView(T, state, [])] });
    frames.push({ line: L('return out'), note: `The queue is empty. ${out.length} levels, the widest has ${widest} nodes.`, result: out, views: [treeView(T, state, []), { type: 'vars', values: { out: JSON.stringify(out).replace(/,/g, ', ') } }] });
    return { out, widest, frames };
  }

  /* ---------- Template E: traversal orders ---------- */
  function orderFrames(T, kind) {
    const CODE = ORDER_CODE[kind], L = s => lineOf(CODE, s), frames = [], state = {}, out = [];
    const view = () => [treeView(T, state, []), { type: 'array', name: 'out', values: out.slice(), hl: out.length ? [out.length - 1] : [] }];
    function rec(nd) {
      if (!nd) return;
      state[nd.id] = 'frontier';
      frames.push({ line: L('if not node'), note: `Arrive at ${nd.val}.`, views: view() });
      const visit = () => { out.push(nd.val); state[nd.id] = 'current'; frames.push({ line: L('out.append(node.val)'), note: `Write ${nd.val}.`, views: view() }); state[nd.id] = 'visited'; };
      if (kind === 'pre') visit();
      rec(nd.left);
      if (kind === 'in') visit();
      rec(nd.right);
      if (kind === 'post') visit();
    }
    rec(T.root);
    frames.push({ line: L('out.append(node.val)'), note: `${{ pre: 'Preorder', in: 'Inorder', post: 'Postorder' }[kind]}: ${out.join(', ')}.${kind === 'in' ? ' Sorted, because this tree is a BST.' : ''}`, result: out, views: view() });
    return { out, frames };
  }

  /* ---------- counters for the race (same rules as measure.py) ---------- */
  function perfect(n) { return build(Array.from({ length: n }, (_, k) => k + 1)); }
  function chain(n) { const nodes = []; let prev = null, root = null; for (let v = 1; v <= n; v++) { const nd = { id: v - 1, val: v, left: null, right: null }; nodes.push(nd); if (prev) prev.left = nd; else root = nd; prev = nd; } return { root, nodes }; }
  function diamOnePass(root) { let best = 0, visits = 0; const h = nd => { if (!nd) return 0; visits++; const l = h(nd.left), r = h(nd.right); best = Math.max(best, l + r); return 1 + Math.max(l, r); }; h(root); return { best, visits }; }
  function diamNaive(root) {
    let visits = 0;
    const h = nd => { if (!nd) return 0; visits++; return 1 + Math.max(h(nd.left), h(nd.right)); };
    const d = nd => { if (!nd) return 0; visits++; const through = h(nd.left) + h(nd.right); return Math.max(through, d(nd.left), d(nd.right)); };
    return { best: d(root), visits };
  }

  const setVal = (id, v) => { const el = document.getElementById(id); if (!el) return; el.querySelector('.val').textContent = v; flash(el); };
  const $ = id => document.getElementById(id);

  /* ---------- Section 1 ---------- */
  (() => {
    const T = make(PIC), a = depthFrames(T), b = pathFrames(T);
    if ($('p11tpA')) TracePlayer($('p11tpA'), { code: DEPTH_CODE, frames: a.frames }, { code: false });
    if ($('p11tpB')) TracePlayer($('p11tpB'), { code: PATH_CODE, frames: b.frames }, { code: false });
    setVal('p11roA', a.real); setVal('p11roB', b.visits);
    if ($('p11tpC')) TracePlayer($('p11tpC'), { code: DEPTH_CODE, frames: a.frames });
  })();

  /* ---------- Section 4: BST, diameter, BFS, orders ---------- */
  (() => {
    const el = $('p11tpD'); if (!el) return;
    const trees = { sneaky: [5, 4, 6, null, null, 3, 7], good: PIC };
    const tp = TracePlayer(el, { code: BST_CODE, frames: bstFrames(make(trees.sneaky)).frames });
    document.querySelectorAll('[data-p11bst]').forEach(btn => btn.addEventListener('click', () => tp.load({ code: BST_CODE, frames: bstFrames(make(trees[btn.dataset.p11bst])).frames })));
  })();
  (() => { const el = $('p11tpG'); if (el) TracePlayer(el, { code: DIAM_CODE, frames: diamFrames(make([1, 2, null, 3, 4, 5, null, null, 6])).frames }); })();
  (() => { const el = $('p11tpE'); if (el) TracePlayer(el, { code: BFS_CODE, frames: bfsFrames(make(PIC)).frames }); })();
  (() => {
    const el = $('p11tpF'); if (!el) return;
    const T = make(PIC), tp = TracePlayer(el, { code: ORDER_CODE.pre, frames: orderFrames(T, 'pre').frames });
    document.querySelectorAll('[data-p11ord]').forEach(btn => btn.addEventListener('click', () => { const k = btn.dataset.p11ord; tp.load({ code: ORDER_CODE[k], frames: orderFrames(T, k).frames }); }));
  })();

  /* ---------- Section 4: diameter race ---------- */
  (() => {
    const cv = $('p11cvA'); if (!cv) return;
    const active = () => $('lesson11').classList.contains('active');
    let shape = 'balanced', n = 15, one = 15, naive = 49, prog = 1, raf = 0;
    const measure = () => { const t = shape === 'chain' ? chain(n) : perfect(n); one = diamOnePass(t.root).visits; naive = diamNaive(t.root).visits; };
    const num = v => Math.round(v).toLocaleString('en-US');
    function draw() {
      if (!cv.clientWidth) return;
      const { ctx: c, w, h } = fit(cv, Math.max(0.26, 150 / cv.clientWidth));
      c.clearRect(0, 0, w, h);
      const pad = 12, track = w - 2 * pad, done = prog * naive;
      [{ label: 'one pass, O(n)', total: one, col: css('--teal'), y: h * 0.3 }, { label: 'recompute heights, O(n^2) on a chain', total: naive, col: css('--orange'), y: h * 0.74 }].forEach(B => {
        const got = Math.min(B.total, done), fin = got >= B.total;
        text(c, B.label, pad, B.y - 16, css('--text-bright'), 12, 'left', 600);
        text(c, `${num(got)} visits${fin ? ', done' : ''}`, w - pad, B.y - 16, B.col, 12, 'right', 700);
        c.fillStyle = css('--bg-input'); c.fillRect(pad, B.y, track, 12);
        c.fillStyle = B.col; c.fillRect(pad, B.y, Math.max(2, track * got / naive), 12);
      });
    }
    function show() { setVal('p11roS', `${shape}, ${n}`); setVal('p11roO', num(one)); setVal('p11roV', num(naive)); setVal('p11roR', (naive / one).toFixed(1) + 'x'); }
    function race() {
      cancelAnimationFrame(raf);
      if (RM) { prog = 1; draw(); return; }
      const t0 = performance.now(), dur = 2500;
      const tick = t => { prog = Math.min(1, (t - t0) / dur); draw(); if (prog < 1 && active()) raf = requestAnimationFrame(tick); else { prog = 1; draw(); } };
      prog = 0; raf = requestAnimationFrame(tick);
    }
    const reset = () => { cancelAnimationFrame(raf); measure(); prog = 1; show(); draw(); };
    document.querySelectorAll('[data-p11shape]').forEach(btn => btn.addEventListener('click', () => { shape = btn.dataset.p11shape; reset(); }));
    document.querySelectorAll('[data-p11n]').forEach(btn => btn.addEventListener('click', () => { n = Number(btn.dataset.p11n); reset(); }));
    $('p11raceGo').addEventListener('click', race);
    window.addEventListener('resize', () => { if (active()) draw(); });
    window.addEventListener('themechange', () => { if (active()) draw(); });
    measure(); show(); draw();
  })();

  /* ---------- Sandbox: your own tree ---------- */
  (() => {
    const inp = $('s11In'), err = $('s11Err'), out = $('s11Out'), tpEl = $('s11Tp');
    if (!inp || !tpEl) return;
    const player = TracePlayer(tpEl, null, {});
    let mode = 'depth';
    function parse(s) {
      const body = s.trim().replace(/^\[/, '').replace(/\]$/, '').trim();
      if (!body) return [];
      const parts = body.split(',').map(t => t.trim());
      if (parts[parts.length - 1] === '') parts.pop();
      const vals = parts.map((t, k) => {
        if (/^(null|none)$/i.test(t)) return null;
        if (!/^-?\d{1,3}$/.test(t)) throw new Error(`Item ${k + 1} ("${t || 'empty'}") is not a whole number or null. Use numbers from -99 to 999, like 3, 9, 20, null, 7.`);
        const v = Number(t);
        if (v < -99) throw new Error(`Item ${k + 1} (${v}) is too small to draw. Please use numbers from -99 to 999.`);
        return v;
      });
      if (vals[0] === null) throw new Error('The first item is the root, so it cannot be null. For an empty tree, leave the box empty.');
      // how many items can actually hang somewhere
      let slots = 1, used = 0;
      for (let k = 0; k < vals.length; k++) {
        if (used >= slots) throw new Error(`Item ${k + 1} (${vals[k] === null ? 'null' : vals[k]}) has no parent to hang from: every node above it is already full or missing.`);
        used++; if (vals[k] !== null) slots += 2;
      }
      const T = build(vals);
      if (T.nodes.length > 15) throw new Error(`That tree has ${T.nodes.length} nodes. Please use 15 or fewer so the picture stays readable.`);
      if (Math.max(...T.nodes.map(nd => nd.depth)) > 5) throw new Error('That tree is more than 6 levels deep. Please keep it to 6 levels so it fits the picture.');
      return vals;
    }
    function run() {
      let vals;
      try { vals = parse(inp.value); } catch (e) { err.textContent = e.message; return; }
      err.textContent = '';
      const T = make(vals), d = depthFrames(T), b = bfsFrames(make(vals));
      if (mode === 'depth') player.load({ code: DEPTH_CODE, frames: d.frames });
      else player.load({ code: BFS_CODE, frames: b.frames });
      out.innerHTML = `<span class="rk">max depth:</span> <span class="rv">${d.depth}</span><br>` +
        `<span class="rk">DFS node visits:</span> <span class="rv">${d.real}</span> <span class="rk">+ empty calls:</span> <span class="rv">${d.empty}</span><br>` +
        `<span class="rk">levels:</span> <span class="rv">${JSON.stringify(b.out).replace(/,/g, ', ')}</span><br>` +
        `<span class="rk">widest level (BFS queue):</span> <span class="rv-o">${b.widest}</span> <span class="rk">tallest call stack (DFS):</span> <span class="rv-o">${d.depth}</span>`;
    }
    const setMode = m => { mode = m; $('s11Depth').classList.toggle('btn-primary', m === 'depth'); $('s11Bfs').classList.toggle('btn-primary', m === 'bfs'); run(); };
    document.querySelectorAll('[data-s11ex]').forEach(btn => btn.addEventListener('click', () => { inp.value = btn.dataset.s11ex; run(); }));
    $('s11Depth').addEventListener('click', () => setMode('depth'));
    $('s11Bfs').addEventListener('click', () => setMode('bfs'));
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); run(); } });
    run();
  })();
})();
