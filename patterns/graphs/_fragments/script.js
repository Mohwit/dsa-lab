// ======== SLOT 17: PATTERN LESSON, GRAPHS ========
(() => {
  const CAP = 60;
  // Counting rules match patterns/graphs/measure.py: a neighbour check is one run of a `for nb in adj[node]` body;
  // a find hop is one run of the `while parent[x] != x` body. Neighbour order = edge order; grid moves = down, up, right, left.
  const BFS_HOPS_CODE = `from collections import deque

def fewest_hops(adj, start, goal):
    dist = {start: 0}
    q = deque([start])
    while q:
        node = q.popleft()
        if node == goal:
            return dist[node]
        for nb in adj[node]:
            if nb not in dist:
                dist[nb] = dist[node] + 1
                q.append(nb)
    return -1`;
  const BRUTE_CODE = `def fewest_hops_slow(adj, start, goal):
    best = [float("inf")]
    on_path = {start}
    def walk(node, length):
        if node == goal:
            best[0] = min(best[0], length)
            return
        for nb in adj[node]:
            if nb not in on_path:
                on_path.add(nb)
                walk(nb, length + 1)
                on_path.remove(nb)
    walk(start, 0)
    return best[0]`;
  const BFS_CODE = `from collections import deque

def bfs(adj, start):
    seen = {start}
    q = deque([start])
    order = []
    while q:
        node = q.popleft()
        order.append(node)
        for nb in adj[node]:
            if nb not in seen:
                seen.add(nb)
                q.append(nb)
    return order`;
  const DFS_CODE = `def dfs(adj, node, seen, order):
    seen.add(node)
    order.append(node)
    for nb in adj[node]:
        if nb not in seen:
            dfs(adj, nb, seen, order)
    return order`;
  const ISL_CODE = `def num_islands(grid):
    R, C = len(grid), len(grid[0])
    def sink(r, c):
        if r < 0 or r >= R or c < 0 or c >= C or grid[r][c] != "1":
            return
        grid[r][c] = "#"
        sink(r + 1, c)
        sink(r - 1, c)
        sink(r, c + 1)
        sink(r, c - 1)
    count = 0
    for r in range(R):
        for c in range(C):
            if grid[r][c] == "1":
                count += 1
                sink(r, c)
    return count`;
  const KAHN_CODE = `from collections import deque

def topo_order(nodes, edges):
    adj = {v: [] for v in nodes}
    indeg = {v: 0 for v in nodes}
    for a, b in edges:
        adj[a].append(b)
        indeg[b] += 1
    q = deque(v for v in nodes if indeg[v] == 0)
    order = []
    while q:
        v = q.popleft()
        order.append(v)
        for w in adj[v]:
            indeg[w] -= 1
            if indeg[w] == 0:
                q.append(w)
    return order if len(order) == len(nodes) else None`;
  const DSU_CODE = `class DSU:
    def __init__(self, n):
        self.parent = list(range(n))
        self.size = [1] * n
    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]
            x = self.parent[x]
        return x
    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False
        if self.size[ra] < self.size[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra
        self.size[ra] += self.size[rb]
        return True`;

  // ---------- shared helpers ----------
  const setVal = (id, v) => { const el = document.getElementById(id); if (!el) return; el.querySelector('.val').textContent = v; flash(el); };
  const num = v => Math.round(v).toLocaleString('en-US');
  function buildAdj(nodes, edges, directed) {
    const adj = new Map(nodes.map(v => [v, []]));
    edges.forEach(([a, b]) => { adj.get(a).push(b); if (!directed) adj.get(b).push(a); });
    return adj;
  }
  function recorder() {
    const frames = []; let skipped = 0;
    return {
      push(f) { if (frames.length < CAP) frames.push(f); else skipped++; },
      finish(last) { if (skipped) frames.push({ line: last.line, note: `... ${skipped} more steps, same rule.`, views: last.views }); frames.push(last); return frames; }
    };
  }
  const gview = (G, state, hl, name) => ({ type: 'graph', name: name || 'graph', nodes: G.nodes.map(v => Object.assign({ id: v }, G.pos ? G.pos[v] : {})), edges: G.edges, directed: !!G.directed, state, hl: hl || [] });

  const G1 = {
    nodes: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    edges: [['A', 'B'], ['A', 'C'], ['A', 'D'], ['B', 'E'], ['C', 'E'], ['C', 'F'], ['D', 'F'], ['E', 'G'], ['F', 'G']],
    pos: { A: { x: 0.03, y: 0.5 }, B: { x: 0.35, y: 0.06 }, C: { x: 0.35, y: 0.5 }, D: { x: 0.35, y: 0.94 }, E: { x: 0.67, y: 0.25 }, F: { x: 0.67, y: 0.75 }, G: { x: 0.97, y: 0.5 } }
  };

  // ---------- BFS fewest hops (stops when the goal is popped) ----------
  function bfsHops(G, start, goal) {
    const adj = buildAdj(G.nodes, G.edges, G.directed), L = s => lineOf(BFS_HOPS_CODE, s), R = recorder();
    const dist = new Map([[start, 0]]), q = [start], done = new Set();
    let checks = 0, cur = null;
    const st = () => { const s = {}; done.forEach(v => s[v] = 'visited'); q.forEach(v => s[v] = 'frontier'); if (cur !== null) s[cur] = 'current'; return s; };
    const views = hl => [gview(G, st(), hl), { type: 'queue', name: 'queue (front on the left)', values: q.slice() }, { type: 'map', name: 'dist (node : hops)', entries: [...dist.entries()] }, { type: 'vars', values: { checks } }];
    R.push({ line: L('q = deque([start])'), note: `Drop the stone at ${start}: distance 0, and ${start} waits in the queue.`, views: views([]) });
    while (q.length) {
      cur = q.shift();
      R.push({ line: L('node = q.popleft()'), note: `Take ${cur} from the front of the queue. It is ${dist.get(cur)} hop${dist.get(cur) === 1 ? '' : 's'} from ${start}.`, views: views([]) });
      if (cur === goal) {
        const last = { line: L('return dist[node]'), note: `${goal} came out of the queue: the first ring that reached it is ring ${dist.get(cur)}. ${checks} neighbour checks.`, result: dist.get(cur), views: views([]) };
        return { hops: dist.get(cur), checks, frames: R.finish(last) };
      }
      for (const nb of adj.get(cur)) {
        checks++;
        const fresh = !dist.has(nb);
        R.push({ line: L('if nb not in dist'), note: `Check ${checks}: look from ${cur} to ${nb}. ${fresh ? 'Not discovered yet.' : 'Already discovered, skip it.'}`, views: views([[cur, nb]]) });
        if (fresh) { dist.set(nb, dist.get(cur) + 1); q.push(nb); R.push({ line: L('q.append(nb)'), note: `Mark ${nb} at ${dist.get(nb)} hop${dist.get(nb) === 1 ? '' : 's'} and add it to the back of the queue.`, views: views([[cur, nb]]) }); }
      }
      done.add(cur);
    }
    cur = null;
    return { hops: -1, checks, frames: R.finish({ line: L('return -1'), note: `The ripple died out without reaching ${goal}.`, result: -1, views: views([]) }) };
  }

  // ---------- try every simple route ----------
  function bruteHops(G, start, goal, wantFrames = true) {
    const adj = buildAdj(G.nodes, G.edges, G.directed), L = s => lineOf(BRUTE_CODE, s), R = recorder();
    let best = Infinity, checks = 0, paths = 0;
    const onPath = new Set([start]), path = [start];
    const views = () => {
      const s = {}; path.forEach(v => s[v] = 'visited'); s[path[path.length - 1]] = 'current';
      const hl = path.slice(1).map((v, k) => [path[k], v]);
      return [gview(G, s, hl), { type: 'vars', values: { 'route length': path.length - 1, best: best === Infinity ? 'none' : best, checks, routes: paths } }];
    };
    function walk(node, length) {
      if (node === goal) {
        paths++; best = Math.min(best, length);
        if (wantFrames) R.push({ line: L('best[0] = min(best[0], length)'), note: `Route ${paths} reaches ${goal} in ${length} hops (${path.join(' ')}). Best so far: ${best}. Keep looking, there might be a shorter one.`, views: views() });
        return;
      }
      if (wantFrames) R.push({ line: L('if node == goal'), note: `Walk into ${node} along ${path.join(' ')}. Not the goal yet.`, views: views() });
      for (const nb of adj.get(node)) {
        checks++;
        if (!onPath.has(nb)) { onPath.add(nb); path.push(nb); walk(nb, length + 1); path.pop(); onPath.delete(nb); }
      }
    }
    walk(start, 0);
    const res = best === Infinity ? Infinity : best;
    if (!wantFrames) return { hops: res, checks, paths };
    return { hops: res, checks, paths, frames: R.finish({ line: L('return best[0]'), note: `Every route tried: ${paths} routes, ${checks} neighbour checks, shortest ${res} hops.`, result: res, views: views() }) };
  }

  // ---------- BFS and DFS visit orders ----------
  function bfsOrder(G, start) {
    const adj = buildAdj(G.nodes, G.edges, G.directed), L = s => lineOf(BFS_CODE, s), R = recorder();
    const seen = new Set([start]), q = [start], order = [];
    let checks = 0, cur = null;
    const st = () => { const s = {}; seen.forEach(v => s[v] = 'frontier'); order.forEach(v => s[v] = 'visited'); if (cur !== null) s[cur] = 'current'; return s; };
    const views = hl => [gview(G, st(), hl), { type: 'queue', name: 'queue (front on the left)', values: q.slice() }, { type: 'array', name: 'order', values: order.slice() }, { type: 'vars', values: { checks } }];
    R.push({ line: L('q = deque([start])'), note: `Start at ${start}: mark it seen and put it in the queue.`, views: views([]) });
    while (q.length) {
      cur = q.shift(); order.push(cur);
      R.push({ line: L('order.append(node)'), note: `Pop ${cur} from the front (oldest first) and visit it.`, views: views([]) });
      for (const nb of adj.get(cur)) {
        checks++;
        const fresh = !seen.has(nb);
        if (fresh) { seen.add(nb); q.push(nb); }
        R.push({ line: fresh ? L('q.append(nb)') : L('if nb not in seen'), note: `Look from ${cur} to ${nb}: ${fresh ? 'new, so mark it and push it to the back.' : 'already seen, skip.'}`, views: views([[cur, nb]]) });
      }
    }
    cur = null;
    return { order, checks, frames: R.finish({ line: L('return order'), note: `Visit order: ${order.join(' ')}. ${checks} neighbour checks.`, result: order.join(' '), views: views([]) }) };
  }
  function dfsOrder(G, start) {
    const adj = buildAdj(G.nodes, G.edges, G.directed), L = s => lineOf(DFS_CODE, s), R = recorder();
    const seen = new Set(), order = [], calls = [];
    let checks = 0;
    const st = () => { const s = {}; order.forEach(v => s[v] = 'visited'); calls.forEach(v => s[v] = 'frontier'); if (calls.length) s[calls[calls.length - 1]] = 'current'; return s; };
    const views = hl => [gview(G, st(), hl), { type: 'stack', name: 'call stack', values: calls.map(v => `dfs(${v})`) }, { type: 'array', name: 'order', values: order.slice() }, { type: 'vars', values: { checks } }];
    function dfs(node) {
      calls.push(node); seen.add(node); order.push(node);
      R.push({ line: L('order.append(node)'), note: `Enter ${node}: mark it and visit it. The call stack is ${calls.length} deep.`, views: views([]) });
      for (const nb of adj.get(node)) {
        checks++;
        const fresh = !seen.has(nb);
        R.push({ line: L('if nb not in seen'), note: `From ${node}, look at ${nb}: ${fresh ? 'new, so dive into it right now.' : 'already seen, skip.'}`, views: views([[node, nb]]) });
        if (fresh) dfs(nb);
      }
      calls.pop();
      if (calls.length) R.push({ line: L('dfs(adj, nb, seen, order)'), note: `${node} has no new neighbours left. Back up to ${calls[calls.length - 1]}.`, views: views([]) });
    }
    dfs(start);
    return { order, checks, frames: R.finish({ line: L('return order'), note: `Visit order: ${order.join(' ')}. ${checks} neighbour checks.`, result: order.join(' '), views: views([]) }) };
  }

  /* ---------- Section 1: the two players ---------- */
  (() => {
    const a = bfsHops(G1, 'A', 'G'), b = bruteHops(G1, 'A', 'G');
    const elA = document.getElementById('p17tpA'), elB = document.getElementById('p17tpB');
    if (elA) TracePlayer(elA, { frames: a.frames }, { code: false });
    if (elB) TracePlayer(elB, { frames: b.frames }, { code: false });
    setVal('p17roA', a.checks); setVal('p17roB', b.checks);
  })();

  /* ---------- Section 1: grid race ---------- */
  function gridAdj(n) {
    const adj = new Map();
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      const out = [];
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => { const y = r + dr, x = c + dc; if (y >= 0 && y < n && x >= 0 && x < n) out.push(`${y},${x}`); });
      adj.set(`${r},${c}`, out);
    }
    return adj;
  }
  function raceCounts(n) {
    const adj = gridAdj(n), start = '0,0', goal = `${n - 1},${n - 1}`;
    const dist = new Map([[start, 0]]), q = [start]; let bc = 0;
    while (q.length) { const v = q.shift(); if (v === goal) break; for (const nb of adj.get(v)) { bc++; if (!dist.has(nb)) { dist.set(nb, dist.get(v) + 1); q.push(nb); } } }
    let checks = 0, paths = 0; const on = new Set([start]);
    (function walk(v) { if (v === goal) { paths++; return; } for (const nb of adj.get(v)) { checks++; if (!on.has(nb)) { on.add(nb); walk(nb); on.delete(nb); } } })(start);
    return { bfs: bc, brute: checks, paths };
  }
  (() => {
    const cv = document.getElementById('p17cvA'); if (!cv) return;
    const active = () => document.getElementById('lesson17').classList.contains('active');
    let n = 3, cnt = raceCounts(3), prog = 1, raf = 0;
    function draw() {
      if (!cv.clientWidth) return;
      const { ctx: c, w, h } = fit(cv, Math.max(0.26, 150 / cv.clientWidth));
      c.clearRect(0, 0, w, h);
      const pad = 12, track = w - 2 * pad, done = prog * cnt.brute;
      [{ label: 'BFS ripple', total: cnt.bfs, col: css('--teal'), y: h * 0.3 }, { label: 'try every route', total: cnt.brute, col: css('--orange'), y: h * 0.74 }].forEach(Ln => {
        const got = Math.min(Ln.total, done), fin = got >= Ln.total;
        text(c, Ln.label, pad, Ln.y - 16, css('--text-bright'), 12, 'left', 600);
        text(c, `${num(got)} checks${fin ? ', done' : ''}`, w - pad, Ln.y - 16, Ln.col, 12, 'right', 700);
        c.fillStyle = css('--bg-input'); c.fillRect(pad, Ln.y, track, 12);
        c.fillStyle = Ln.col; c.fillRect(pad, Ln.y, Math.max(2, track * got / cnt.brute), 12);
      });
    }
    function show() { setVal('p17roN', `${n} x ${n}`); setVal('p17roS', num(cnt.bfs)); setVal('p17roP', num(cnt.brute)); setVal('p17roQ', num(cnt.paths)); }
    function race() {
      cancelAnimationFrame(raf);
      if (RM) { prog = 1; draw(); return; }
      const t0 = performance.now(), dur = 2500;
      const tick = t => { prog = Math.min(1, (t - t0) / dur); draw(); if (prog < 1 && active()) raf = requestAnimationFrame(tick); else { prog = 1; draw(); } };
      prog = 0; raf = requestAnimationFrame(tick);
    }
    document.querySelectorAll('[data-p17n]').forEach(btn => btn.addEventListener('click', () => { cancelAnimationFrame(raf); n = Number(btn.dataset.p17n); cnt = raceCounts(n); prog = 1; show(); draw(); }));
    document.getElementById('p17raceGo').addEventListener('click', race);
    window.addEventListener('resize', () => { if (active()) draw(); });
    window.addEventListener('themechange', () => { if (active()) draw(); });
    show(); draw();
  })();

  /* ---------- Section 4: ripple vs cave ---------- */
  (() => {
    const a = bfsOrder(G1, 'A'), b = dfsOrder(G1, 'A');
    const elC = document.getElementById('p17tpC'), elD = document.getElementById('p17tpD');
    if (elC) TracePlayer(elC, { frames: a.frames }, { code: false });
    if (elD) TracePlayer(elD, { frames: b.frames }, { code: false });
  })();

  /* ---------- Section 4: maze playground ---------- */
  (() => {
    const cv = document.getElementById('p17cvM'); if (!cv) return;
    const active = () => document.getElementById('lesson17').classList.contains('active');
    const ROWS = 5, COLS = 10, S = [0, 0], GOAL = [0, 9];
    const DEFAULT = ['S........G', '.#######..', '..........', '..........', '..........'];
    let walls = new Set(), res = null, prog = 1, raf = 0, geo = null;
    const key = (r, c) => `${r},${c}`;
    const resetWalls = () => { walls = new Set(); DEFAULT.forEach((row, r) => [...row].forEach((ch, c) => { if (ch === '#') walls.add(key(r, c)); })); };
    const open = (r, c) => r >= 0 && r < ROWS && c >= 0 && c < COLS && !walls.has(key(r, c));
    const MOVES = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    function runBfs() {
      const dist = new Map([[key(...S), 0]]), par = new Map(), q = [S], order = [];
      while (q.length) {
        const [r, c] = q.shift(); order.push([r, c]);
        if (r === GOAL[0] && c === GOAL[1]) break;
        for (const [dr, dc] of MOVES) { const y = r + dr, x = c + dc; if (open(y, x) && !dist.has(key(y, x))) { dist.set(key(y, x), dist.get(key(r, c)) + 1); par.set(key(y, x), [r, c]); q.push([y, x]); } }
      }
      const gk = key(...GOAL), path = [];
      if (dist.has(gk) && order.some(([r, c]) => r === GOAL[0] && c === GOAL[1])) { let cur = GOAL; while (cur) { path.unshift(cur); cur = par.get(key(...cur)); } }
      return { kind: 'bfs', order, dist, path, steps: path.length ? path.length - 1 : -1 };
    }
    function runDfs() {
      const seen = new Set(), order = [], path = [];
      function dfs(r, c) {
        seen.add(key(r, c)); order.push([r, c]); path.push([r, c]);
        if (r === GOAL[0] && c === GOAL[1]) return true;
        for (const [dr, dc] of MOVES) { const y = r + dr, x = c + dc; if (open(y, x) && !seen.has(key(y, x)) && dfs(y, x)) return true; }
        path.pop(); return false;
      }
      const ok = dfs(...S);
      return { kind: 'dfs', order, path: ok ? path : [], steps: ok ? path.length - 1 : -1 };
    }
    function draw() {
      if (!cv.clientWidth) return;
      const { ctx: c, w, h } = fit(cv, ROWS / COLS);
      const cs = Math.min(w / COLS, h / ROWS), ox = (w - cs * COLS) / 2;
      geo = { cs, ox };
      c.clearRect(0, 0, w, h);
      const shown = res ? Math.floor(prog * res.order.length) : 0;
      const exploredIx = new Map(); if (res) res.order.slice(0, shown).forEach(([r, cc], k) => exploredIx.set(key(r, cc), k));
      const onPath = new Map(); if (res && prog >= 1) res.path.forEach(([r, cc], k) => onPath.set(key(r, cc), k));
      const pathCol = res && res.kind === 'dfs' ? css('--orange') : css('--teal');
      for (let r = 0; r < ROWS; r++) for (let cc = 0; cc < COLS; cc++) {
        const x = ox + cc * cs, y = r * cs, k = key(r, cc);
        c.fillStyle = css('--bg-surface'); c.fillRect(x + 1, y + 1, cs - 2, cs - 2); c.strokeStyle = css('--border'); c.lineWidth = 1; c.strokeRect(x + 1.5, y + 1.5, cs - 3, cs - 3);
        if (walls.has(k)) { c.fillStyle = css('--text-dim'); c.fillRect(x + 1, y + 1, cs - 2, cs - 2); continue; }
        if (onPath.has(k)) { c.globalAlpha = 0.55; c.fillStyle = pathCol; c.fillRect(x + 1, y + 1, cs - 2, cs - 2); c.globalAlpha = 1; }
        else if (exploredIx.has(k)) { c.globalAlpha = 0.22; c.fillStyle = css('--blue'); c.fillRect(x + 1, y + 1, cs - 2, cs - 2); c.globalAlpha = 1; }
        const fs = Math.max(9, Math.min(14, cs * 0.36));
        if (r === S[0] && cc === S[1]) text(c, 'S', x + cs / 2, y + cs / 2, css('--text-bright'), fs + 2, 'center', 700);
        else if (r === GOAL[0] && cc === GOAL[1]) text(c, 'G', x + cs / 2, y + cs / 2, css('--text-bright'), fs + 2, 'center', 700);
        else if (res && res.kind === 'bfs' && exploredIx.has(k)) text(c, String(res.dist.get(k)), x + cs / 2, y + cs / 2, css('--text'), fs, 'center', 600);
        else if (res && res.kind === 'dfs' && onPath.has(k)) text(c, String(onPath.get(k)), x + cs / 2, y + cs / 2, css('--text-bright'), fs, 'center', 600);
      }
    }
    function run(kind) {
      cancelAnimationFrame(raf);
      res = kind === 'bfs' ? runBfs() : runDfs();
      setVal(kind === 'bfs' ? 'p17roM1' : 'p17roM2', res.steps < 0 ? 'no path' : res.steps);
      setVal('p17roM3', `${res.order.length} (${kind.toUpperCase()})`);
      if (RM) { prog = 1; draw(); return; }
      const t0 = performance.now(), dur = 1800;
      const tick = t => { prog = Math.min(1, (t - t0) / dur); draw(); if (prog < 1 && active()) raf = requestAnimationFrame(tick); else { prog = 1; draw(); } };
      prog = 0; raf = requestAnimationFrame(tick);
    }
    function clearResult() { cancelAnimationFrame(raf); res = null; prog = 1; ['p17roM1', 'p17roM2', 'p17roM3'].forEach(id => setVal(id, '-')); draw(); }
    cv.addEventListener('click', e => {
      if (!geo) return;
      const rect = cv.getBoundingClientRect(), cc = Math.floor((e.clientX - rect.left - geo.ox) / geo.cs), r = Math.floor((e.clientY - rect.top) / geo.cs);
      if (r < 0 || r >= ROWS || cc < 0 || cc >= COLS) return;
      if ((r === S[0] && cc === S[1]) || (r === GOAL[0] && cc === GOAL[1])) return;
      const k = key(r, cc); walls.has(k) ? walls.delete(k) : walls.add(k);
      clearResult();
    });
    document.getElementById('p17mzB').addEventListener('click', () => run('bfs'));
    document.getElementById('p17mzD').addEventListener('click', () => run('dfs'));
    document.getElementById('p17mzR').addEventListener('click', () => { resetWalls(); clearResult(); });
    document.getElementById('p17mzC').addEventListener('click', () => { walls = new Set(); clearResult(); });
    window.addEventListener('resize', () => { if (active()) draw(); });
    window.addEventListener('themechange', () => { if (active()) draw(); });
    resetWalls(); draw();
  })();

  /* ---------- Section 4: islands ---------- */
  (() => {
    const el = document.getElementById('p17tpE'); if (!el) return;
    const rows = ['110010', '100110', '001000', '101101', '100011'];
    const grid = rows.map(r => [...r]), shown = rows.map(r => [...r]);
    const R = rows.length, C = rows[0].length, L = s => lineOf(ISL_CODE, s), rec = recorder();
    const calls = []; let count = 0, label = '';
    const views = hl => [{ type: 'grid', name: 'grid (letters = painted by island)', rows: shown.map(r => r.slice()), hl: hl ? [hl] : [], src: calls.slice(0, -1) }, { type: 'stack', name: 'call stack', values: calls.map(([r, c]) => `sink(${r}, ${c})`) }, { type: 'vars', values: { count } }];
    function sink(r, c) {
      if (r < 0 || r >= R || c < 0 || c >= C || grid[r][c] !== '1') return;
      grid[r][c] = '#'; shown[r][c] = label; calls.push([r, c]);
      rec.push({ line: L('grid[r][c] = "#"'), note: `Paint (${r}, ${c}) as part of island ${label}, then dive down, up, right, left.`, views: views([r, c]) });
      sink(r + 1, c); sink(r - 1, c); sink(r, c + 1); sink(r, c - 1);
      calls.pop();
    }
    rec.push({ line: L('count = 0'), note: 'Scan the grid row by row. Every 1 we meet that is not painted starts a new island.', views: views(null) });
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (grid[r][c] === '1') {
      count++; label = 'abcdefghij'[count - 1];
      rec.push({ line: L('count += 1'), note: `Fresh land at (${r}, ${c}): island number ${count}. Now sink all of it.`, views: views([r, c]) });
      sink(r, c);
    }
    TracePlayer(el, { code: ISL_CODE, frames: rec.finish({ line: L('return count'), note: `Scan finished: ${count} islands. Each land cell was painted exactly once.`, result: count, views: views(null) }) });
  })();

  /* ---------- Section 4: Kahn ---------- */
  const DRESS = {
    nodes: ['under', 'socks', 'shirt', 'pants', 'shoes', 'belt', 'tie', 'coat'],
    edges: [['under', 'pants'], ['pants', 'shoes'], ['socks', 'shoes'], ['pants', 'belt'], ['shirt', 'belt'], ['shirt', 'tie'], ['tie', 'coat'], ['belt', 'coat']],
    directed: true,
    pos: { under: { x: 0.02, y: 0.05 }, socks: { x: 0.02, y: 0.45 }, shirt: { x: 0.02, y: 0.9 }, pants: { x: 0.36, y: 0.05 }, tie: { x: 0.36, y: 0.95 }, shoes: { x: 0.7, y: 0.05 }, belt: { x: 0.68, y: 0.5 }, coat: { x: 0.98, y: 0.85 } }
  };
  function kahnTrace(G) {
    const L = s => lineOf(KAHN_CODE, s), R = recorder();
    const adj = new Map(G.nodes.map(v => [v, []])), indeg = new Map(G.nodes.map(v => [v, 0]));
    G.edges.forEach(([a, b]) => { adj.get(a).push(b); indeg.set(b, indeg.get(b) + 1); });
    const q = G.nodes.filter(v => indeg.get(v) === 0), order = [];
    let cur = null;
    const st = () => { const s = {}; order.forEach(v => s[v] = 'visited'); q.forEach(v => s[v] = 'frontier'); if (cur !== null) s[cur] = 'current'; return s; };
    const views = (hl, changed) => [gview(Object.assign({}, G, { directed: true }), st(), hl), { type: 'map', name: 'in-degree (waiting on)', entries: [...indeg.entries()], hl: changed }, { type: 'queue', name: 'queue: free to do now', values: q.slice() }, { type: 'array', name: 'order', values: order.slice() }];
    R.push({ line: L('q = deque(v for v in nodes if indeg[v] == 0)'), note: `Count what each item waits on. ${q.length ? q.join(', ') + ' wait on nothing, so they start in the queue.' : 'Nothing has in-degree 0: every item waits on something.'}`, views: views([]) });
    while (q.length) {
      cur = q.shift(); order.push(cur);
      R.push({ line: L('order.append(v)'), note: `Do ${cur}. It is item ${order.length} in the order.`, views: views([]) });
      for (const w of adj.get(cur)) {
        indeg.set(w, indeg.get(w) - 1);
        const free = indeg.get(w) === 0;
        if (free) q.push(w);
        R.push({ line: free ? L('q.append(w)') : L('indeg[w] -= 1'), note: `${w} was waiting on ${cur}. Now it waits on ${indeg.get(w)} more${free ? ', so it is free: join the queue.' : '.'}`, views: views([[cur, w]], w) });
      }
    }
    cur = null;
    const ok = order.length === G.nodes.length;
    return { order: ok ? order : null, partial: order, frames: R.finish({ line: L('return order if len(order) == len(nodes) else None'), note: ok ? `All ${order.length} items placed: ${order.join(', ')}.` : `Only ${order.length} of ${G.nodes.length} placed. The rest wait on each other forever: there is a cycle.`, result: ok ? order.join(', ') : 'None', views: views([]) }) };
  }
  (() => { const el = document.getElementById('p17tpF'); if (el) TracePlayer(el, { code: KAHN_CODE, frames: kahnTrace(DRESS).frames }); })();

  /* ---------- Section 4: union-find ---------- */
  function dsu(n, bySize = true, compress = true) {
    const parent = Array.from({ length: n }, (_, k) => k), size = new Array(n).fill(1);
    const d = { parent, size, hops: 0, groups: n, onHop: null };
    d.find = x => { while (parent[x] !== x) { d.hops++; if (compress) parent[x] = parent[parent[x]]; if (d.onHop) d.onHop(x); x = parent[x]; } return x; };
    // link two leaders; returns the new leader
    d.link = (ra, rb) => {
      if (bySize && size[ra] < size[rb]) [ra, rb] = [rb, ra];
      if (bySize) { parent[rb] = ra; size[ra] += size[rb]; d.groups--; return ra; }
      parent[ra] = rb; d.groups--; return rb;
    };
    d.union = (a, b) => { const ra = d.find(a), rb = d.find(b); if (ra === rb) return false; d.link(ra, rb); return true; };
    return d;
  }
  (() => {
    const el = document.getElementById('p17tpG'); if (!el) return;
    const L = s => lineOf(DSU_CODE, s), R = recorder(), d = dsu(6), ids = [0, 1, 2, 3, 4, 5];
    const views = (hlNodes, note) => {
      const s = {}; ids.forEach(k => { if (d.parent[k] === k) s[k] = 'visited'; }); (hlNodes || []).forEach(k => s[k] = 'current');
      return [{ type: 'graph', name: 'who follows whom (arrow points to parent)', nodes: ids.map(k => ({ id: k })), edges: ids.filter(k => d.parent[k] !== k).map(k => [k, d.parent[k]]), directed: true, state: s },
        { type: 'array', name: 'parent', values: d.parent.slice(), hl: hlNodes || [] }, { type: 'array', name: 'size (only leaders matter)', values: d.size.slice() }, { type: 'vars', values: { groups: d.groups, 'find hops': d.hops } }];
    };
    R.push({ line: L('self.parent = list(range(n))'), note: 'Six people, each their own leader (blue): six groups.', views: views([]) });
    d.onHop = x => R.push({ line: L('self.parent[x] = self.parent[self.parent[x]]'), note: `Hop up from ${x}. Halving re-points ${x} to its grandparent ${d.parent[x]}.`, views: views([x]) });
    let lastLine = L('return True');
    for (const [a, b] of [[0, 1], [2, 3], [4, 5], [1, 3], [0, 2], [3, 5]]) {
      const before = d.hops;
      const ra = d.find(a), rb = d.find(b);
      R.push({ line: L('ra, rb = self.find(a), self.find(b)'), note: `union(${a}, ${b}): leader of ${a} is ${ra}, leader of ${b} is ${rb}${d.hops > before ? ` (${d.hops - before} hop${d.hops - before === 1 ? '' : 's'})` : ''}.`, views: views([ra, rb]) });
      if (ra === rb) { lastLine = L('return False'); R.push({ line: lastLine, note: `Same leader: ${a} and ${b} are already friends of friends. Nothing changes.`, views: views([ra]) }); }
      else { lastLine = L('self.parent[rb] = ra'); const top = d.link(ra, rb); R.push({ line: lastLine, note: `Different leaders: the smaller group joins the bigger one (a tie keeps ${ra}). Leader is now ${top}. Groups left: ${d.groups}.`, views: views([top]) }); }
    }
    d.onHop = null;
    TracePlayer(el, { code: DSU_CODE, frames: R.finish({ line: lastLine, note: `Done: ${d.groups} group, ${d.hops} find hops in total.`, result: `${d.groups} group`, views: views([]) }) });
  })();
  (() => {
    const chain = (n, s, c) => { const d = dsu(n, s, c); for (let i = 0; i < n - 1; i++) d.union(i, i + 1); for (let i = 0; i < n; i++) d.find(i); return d.hops; };
    const show = n => { setVal('p17roU0', num(n)); setVal('p17roU1', num(chain(n, false, false))); setVal('p17roU2', num(chain(n, false, true))); setVal('p17roU3', num(chain(n, true, true))); };
    document.querySelectorAll('[data-p17u]').forEach(btn => btn.addEventListener('click', () => show(Number(btn.dataset.p17u))));
    if (document.getElementById('p17roU0')) show(10);
  })();

  /* ---------- Sandbox: graph explorer ---------- */
  (() => {
    const inE = document.getElementById('s17Edges'), inS = document.getElementById('s17Start'), inD = document.getElementById('s17Dir');
    const err = document.getElementById('s17Err'), out = document.getElementById('s17Out'), tpEl = document.getElementById('s17Tp');
    if (!inE || !tpEl) return;
    const player = TracePlayer(tpEl, null, {});
    function parse() {
      const txt = inE.value.trim();
      if (!txt) throw new Error('Type at least one edge, for example: A-B, B-C');
      const parts = txt.split(',').map(t => t.trim()).filter(t => t !== '');
      if (parts.length > 24) throw new Error(`That is ${parts.length} edges. Please use 24 or fewer so the picture stays readable.`);
      const nodes = [], edges = [];
      parts.forEach((p, k) => {
        const m = p.match(/^([A-Za-z0-9]{1,6})\s*-\s*([A-Za-z0-9]{1,6})$/);
        if (!m) throw new Error(`Edge ${k + 1} ("${p}") should look like A-B: two names of 1 to 6 letters or digits joined by a dash.`);
        if (m[1] === m[2]) throw new Error(`Edge ${k + 1} ("${p}") links ${m[1]} to itself. Please link two different nodes.`);
        [m[1], m[2]].forEach(v => { if (!nodes.includes(v)) nodes.push(v); });
        edges.push([m[1], m[2]]);
      });
      if (nodes.length > 12) throw new Error(`That uses ${nodes.length} nodes. Please use 12 or fewer.`);
      return { nodes, edges, directed: inD.checked };
    }
    function run(kind) {
      let G;
      try { G = parse(); } catch (e) { err.textContent = e.message; return; }
      const start = inS.value.trim();
      if (kind !== 'topo' && !G.nodes.includes(start)) { err.textContent = start ? `Start node "${start}" is not in your edges. Your nodes are: ${G.nodes.join(', ')}.` : 'Type a start node, for example A.'; return; }
      err.textContent = '';
      if (kind === 'bfs') {
        const r = bfsOrder(G, start); player.load({ code: BFS_CODE, frames: r.frames });
        out.innerHTML = `<span class="rk">BFS order:</span> <span class="rv">${r.order.join(' ')}</span><br><span class="rk">neighbour checks:</span> <span class="rv">${r.checks}</span><br><span class="rk">reached:</span> <span class="rv">${r.order.length} of ${G.nodes.length}</span> <span class="rk">nodes</span>`;
      } else if (kind === 'dfs') {
        const r = dfsOrder(G, start); player.load({ code: DFS_CODE, frames: r.frames });
        out.innerHTML = `<span class="rk">DFS order:</span> <span class="rv">${r.order.join(' ')}</span><br><span class="rk">neighbour checks:</span> <span class="rv">${r.checks}</span><br><span class="rk">reached:</span> <span class="rv">${r.order.length} of ${G.nodes.length}</span> <span class="rk">nodes</span>`;
      } else {
        const r = kahnTrace(Object.assign(G, { directed: true })); player.load({ code: KAHN_CODE, frames: r.frames });
        out.innerHTML = r.order ? `<span class="rk">topological order:</span> <span class="rv">${r.order.join(' ')}</span><br><span class="rk">edges read as one-way, left to right</span>` : `<span class="rk">no order:</span> <span class="rv-o">cycle</span><br><span class="rk">placed before getting stuck:</span> <span class="rv">${r.partial.join(' ') || 'none'}</span>`;
      }
    }
    document.querySelectorAll('[data-s17ex]').forEach(btn => btn.addEventListener('click', () => {
      const [e, s, d] = btn.dataset.s17ex.split('|'); inE.value = e; inS.value = s; inD.checked = d === '1'; run(btn.dataset.s17run || 'bfs');
    }));
    document.getElementById('s17Bfs').addEventListener('click', () => run('bfs'));
    document.getElementById('s17Dfs').addEventListener('click', () => run('dfs'));
    document.getElementById('s17Topo').addEventListener('click', () => run('topo'));
    [inE, inS].forEach(i => i.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); run('bfs'); } }));
    run('bfs');
  })();
})();
