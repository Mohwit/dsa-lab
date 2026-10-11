// ======== SLOT 18: PATTERN LESSON, ADVANCED GRAPHS ========
(() => {
  const CAP = 60;
  // Counting rules match patterns/advanced-graphs/measure.py:
  //   edge checks = times a (neighbour, weight) pair is looked at in the inner loop; pops = heappop calls (stale = pops that hit `continue`).
  const LESSON = [['A', 'B', 4], ['A', 'C', 1], ['B', 'C', 2], ['B', 'D', 5], ['C', 'D', 8], ['C', 'E', 10], ['D', 'E', 2], ['D', 'F', 4], ['E', 'F', 3]];
  const LPOS = { A: [0, 0.5], B: [0.35, 0.06], C: [0.35, 0.94], D: [0.68, 0.06], E: [0.68, 0.94], F: [1, 0.5] };
  const FLIGHTS = [['A', 'B', 1], ['B', 'C', 1], ['C', 'D', 1], ['A', 'C', 5], ['B', 'D', 4], ['A', 'D', 9]];
  const FPOS = { A: [0, 0.78], B: [0.3, 0.06], C: [0.7, 0.06], D: [1, 0.78] };

  const DIJ_CODE = `import heapq

def dijkstra(graph, src):
    dist = {src: 0}
    heap = [(0, src)]
    done = set()
    while heap:
        d, u = heapq.heappop(heap)
        if u in done:
            continue
        done.add(u)
        for v, w in graph[u]:
            nd = d + w
            if v not in dist or nd < dist[v]:
                dist[v] = nd
                heapq.heappush(heap, (nd, v))
    return dist`;
  const BRUTE_CODE = `def every_path(graph, src):
    best = {src: 0}
    on_path = {src}
    def walk(u, cost):
        for v, w in graph[u]:
            if v in on_path:
                continue
            best[v] = min(best.get(v, cost + w), cost + w)
            on_path.add(v)
            walk(v, cost + w)
            on_path.remove(v)
    walk(src, 0)
    return best`;
  const BFS_CODE = `from collections import deque

def bfs_cost(graph, src):
    dist = {src: 0}
    q = deque([src])
    while q:
        u = q.popleft()
        for v, w in graph[u]:
            if v not in dist:
                dist[v] = dist[u] + w
                q.append(v)
    return dist`;
  const BF_CODE = `def cheapest(nodes, flights, src, dst, k):
    INF = float("inf")
    cost = {x: INF for x in nodes}
    cost[src] = 0
    for _ in range(k + 1):
        new = dict(cost)
        for a, b, w in flights:
            if cost[a] + w < new[b]:
                new[b] = cost[a] + w
        cost = new
    return cost[dst] if cost[dst] < INF else -1`;
  const PRIM_CODE = `import heapq

def prim(graph, start):
    seen = set()
    heap = [(0, start, None)]
    total, tree = 0, []
    while heap and len(seen) < len(graph):
        w, u, frm = heapq.heappop(heap)
        if u in seen:
            continue
        seen.add(u)
        total += w
        if frm is not None:
            tree.append((frm, u, w))
        for v, wv in graph[u]:
            if v not in seen:
                heapq.heappush(heap, (wv, v, u))
    return total, tree`;
  const KRUS_CODE = `def kruskal(nodes, edges):
    parent = {x: x for x in nodes}
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    total, tree = 0, []
    for w, a, b in sorted(edges):
        ra, rb = find(a), find(b)
        if ra == rb:
            continue
        parent[ra] = rb
        total += w
        tree.append((a, b, w))
    return total, tree`;

  /* ---------- helpers ---------- */
  function build(edges, directed) {
    const g = new Map();
    edges.forEach(([a, b, w]) => {
      if (!g.has(a)) g.set(a, []);
      if (!g.has(b)) g.set(b, []);
      g.get(a).push([b, w]);
      if (!directed) g.get(b).push([a, w]);
    });
    return g;
  }
  // Python tuple order: compare item by item; None sorts first (only the start entry has it).
  const cmp = (x, y) => { for (let k = 0; k < x.length; k++) { if (x[k] === y[k]) continue; if (x[k] === null) return -1; if (y[k] === null) return 1; return x[k] < y[k] ? -1 : 1; } return 0; };
  const W = 320, H = 200;
  // Node positions in [0, 1]; each edge gets a small weight bubble placed where it does not collide.
  function layout(ids, edges, pos) {
    const P = new Map();
    ids.forEach((id, k) => {
      if (pos && pos[id]) P.set(id, pos[id]);
      else { const a = 2 * Math.PI * k / ids.length - Math.PI / 2; P.set(id, [0.5 + 0.5 * Math.cos(a), 0.5 + 0.5 * Math.sin(a)]); }
    });
    const bubbles = [], far = (x, y) => bubbles.every(q => Math.hypot((q.x - x) * W, (q.y - y) * H) > 22) && ids.every(id => Math.hypot((P.get(id)[0] - x) * W, (P.get(id)[1] - y) * H) > 26);
    edges.forEach(([a, b, w], k) => {
      const [x1, y1] = P.get(a), [x2, y2] = P.get(b);
      let pt = null;
      for (const t of [0.5, 0.38, 0.62, 0.3, 0.7]) { const x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t; if (far(x, y)) { pt = { x, y }; break; } }
      if (!pt) pt = { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
      bubbles.push({ id: '~' + k, x: pt.x, y: pt.y, label: String(w) });
    });
    return { nodes: ids.map(id => ({ id, x: P.get(id)[0], y: P.get(id)[1] })), bubbles, edges };
  }
  function gv(L, name, o = {}) {
    const st = {}; L.bubbles.forEach(b => { st[b.id] = 'w'; });
    Object.assign(st, o.state || {});
    return { type: 'graph', name, directed: !!o.directed, nodes: L.nodes.concat(L.bubbles), edges: L.edges.map(([a, b]) => [a, b]), hl: o.hl || [], state: st };
  }
  const shown = v => (v === undefined || v === Infinity ? 'inf' : v);
  const distRow = (ids, dist) => ids.map(id => shown(dist.get(id)));
  const fmtDist = (ids, dist) => ids.map(id => `${id}=${shown(dist.get(id))}`).join(', ');
  function recorder() {
    const frames = []; let hidden = 0;
    return { frames, add(f) { if (frames.length < CAP) frames.push(f); else hidden++; }, more() { return hidden ? ` (${hidden} more steps not shown, same rule.)` : ''; } };
  }
  const setVal = (id, v) => { const el = document.getElementById(id); if (!el) return; el.querySelector('.val').textContent = v; flash(el); };
  const mount = (id, trace, o) => { const el = document.getElementById(id); return el ? TracePlayer(el, trace, o || {}) : null; };

  /* ---------- Dijkstra ---------- */
  function dijkstraRun(g, src, L) {
    const ids = [...g.keys()], R = recorder(), C = s => lineOf(DIJ_CODE, s);
    const dist = new Map([[src, 0]]), done = new Set(), par = new Map();
    const heap = [[0, src]], st = { pops: 0, stale: 0, pushes: 1, checks: 0 };
    const states = cur => { const s = {}; heap.forEach(([, x]) => { s[x] = 'frontier'; }); done.forEach(x => { s[x] = 'visited'; }); if (cur) s[cur] = 'current'; return s; };
    const views = (cur, edge, col, popHl) => [
      gv(L, 'graph (small circles are edge weights)', { hl: [...par.entries()].map(([v, u]) => [u, v]).concat(edge ? [edge] : []), state: states(cur) }),
      { type: 'grid', name: `dist: cheapest known cost from ${src}`, rows: [distRow(ids, dist)], colLabels: ids, rowLabels: ['dist'], hl: col !== undefined ? [[0, ids.indexOf(col)]] : [] },
      { type: 'array', name: 'heap, smallest first: (cost, node)', values: heap.map(([d, x]) => `(${d}, ${x})`), hl: popHl ? [0] : [] },
      { type: 'vars', values: { pops: st.pops, 'edge checks': st.checks } }
    ];
    R.add({ line: C('heap = [(0, src)]'), note: `Start: ${src} costs 0 to reach. Every other node is unknown (inf). The heap holds one entry.`, views: views(null, null, src, true) });
    while (heap.length) {
      const [d, u] = heap.shift(); st.pops++;
      if (done.has(u)) {
        st.stale++;
        R.add({ line: C('continue'), note: `Pop (${d}, ${u}). ${u} is already final at ${dist.get(u)}, so this entry is stale. Skip it.`, views: views(u, null, u) });
        continue;
      }
      done.add(u);
      R.add({ line: C('done.add(u)'), note: `Pop (${d}, ${u}): the cheapest entry. ${u} is now final. Every other entry costs ${d} or more, and no edge is negative, so no other route can beat ${d}.`, views: views(u, null, u) });
      for (const [v, w] of g.get(u)) {
        st.checks++;
        const nd = d + w, old = dist.get(v), better = old === undefined || nd < old;
        if (better) {
          dist.set(v, nd); par.set(v, u); heap.push([nd, v]); heap.sort(cmp); st.pushes++;
          R.add({ line: C('heapq.heappush(heap, (nd, v))'), note: `Edge ${u}-${v} (${w}): ${d} + ${w} = ${nd}, better than ${shown(old)}. Write dist[${v}] = ${nd} and push (${nd}, ${v}).`, views: views(u, [u, v], v) });
        } else {
          R.add({ line: C('if v not in dist or nd < dist[v]'), note: `Edge ${u}-${v} (${w}): ${d} + ${w} = ${nd}, not better than ${old}${done.has(v) ? ` (${v} is final)` : ''}. Nothing changes.`, views: views(u, [u, v], v) });
        }
      }
    }
    R.frames.push({ line: C('return dist'), note: `Heap empty. ${st.pops} pops (${st.stale} stale), ${st.checks} edge checks.` + R.more(), result: fmtDist(ids, dist), views: views(null, null) });
    return { dist, st, frames: R.frames };
  }

  /* ---------- brute force: every simple path ---------- */
  function bruteRun(g, src, L) {
    const ids = [...g.keys()], R = recorder(), C = s => lineOf(BRUTE_CODE, s);
    const best = new Map([[src, 0]]), on = [src]; let checks = 0, paths = 0;
    const views = col => {
      const s = {}; on.forEach(x => { s[x] = 'visited'; }); s[on[on.length - 1]] = 'current';
      const hl = on.slice(1).map((x, k) => [on[k], x]);
      return [gv(L, 'graph: the path being tried', { hl, state: s }),
        { type: 'grid', name: 'best cost found so far', rows: [distRow(ids, best)], colLabels: ids, rowLabels: ['best'], hl: col !== undefined ? [[0, ids.indexOf(col)]] : [] },
        { type: 'vars', values: { 'paths tried': paths, 'edge checks': checks } }];
    };
    R.add({ line: C('walk(src, 0)'), note: `Start at ${src}. Walk every path that never visits a node twice, and keep the cheapest cost seen for each node.`, views: views(src) });
    (function walk(u, cost) {
      for (const [v, w] of g.get(u)) {
        checks++;
        if (on.includes(v)) continue;
        paths++;
        const nc = cost + w, improved = !best.has(v) || nc < best.get(v);
        if (improved) best.set(v, nc);
        on.push(v);
        R.add({ line: C('best[v] = min('), note: `Path ${on.join('-')} costs ${nc}. ${improved ? `New best for ${v}.` : `best[${v}] stays ${best.get(v)}.`}`, views: views(v) });
        walk(v, nc);
        on.pop();
      }
    })(src, 0);
    R.frames.push({ line: C('return best'), note: `Done: ${paths} paths tried, ${checks} edge checks.` + R.more(), result: fmtDist(ids, best), views: views() });
    return { best, checks, paths, frames: R.frames };
  }

  /* ---------- plain BFS that adds weights (the trap) ---------- */
  function bfsRun(g, src, L, truth) {
    const ids = [...g.keys()], R = recorder(), C = s => lineOf(BFS_CODE, s);
    const dist = new Map([[src, 0]]), par = new Map(), q = [src]; let checks = 0;
    const views = (cur, col) => {
      const s = {}; dist.forEach((_, x) => { s[x] = 'visited'; }); q.forEach(x => { s[x] = 'frontier'; }); if (cur) s[cur] = 'current';
      return [gv(L, 'graph (small circles are edge weights)', { hl: [...par.entries()].map(([v, u]) => [u, v]), state: s }),
        { type: 'grid', name: 'dist as BFS writes it', rows: [distRow(ids, dist)], colLabels: ids, rowLabels: ['dist'], hl: col !== undefined ? [[0, ids.indexOf(col)]] : [] },
        { type: 'queue', name: 'queue', values: q.slice() }];
    };
    R.add({ line: C('q = deque([src])'), note: `BFS goes out in rings: first the neighbours of ${src}, then theirs. Each node keeps the first cost it gets.`, views: views(null, src) });
    while (q.length) {
      const u = q.shift();
      R.add({ line: C('u = q.popleft()'), note: `Take ${u} from the front of the queue.`, views: views(u) });
      for (const [v, w] of g.get(u)) {
        checks++;
        if (dist.has(v)) continue;
        dist.set(v, dist.get(u) + w); par.set(v, u); q.push(v);
        R.add({ line: C('dist[v] = dist[u] + w'), note: `${v} is reached first from ${u}: dist = ${dist.get(u)} + ${w} = ${dist.get(v)}. BFS never looks at ${v} again.`, views: views(u, v) });
      }
    }
    const wrong = ids.filter(x => dist.get(x) !== truth.get(x));
    R.frames.push({ line: C('return dist'), note: wrong.length ? `Wrong at ${wrong.join(', ')}: ${wrong.map(x => `${x} should be ${truth.get(x)}`).join(', ')}. Fewest edges is not cheapest.` : 'Here BFS happens to agree with Dijkstra.', result: fmtDist(ids, dist), views: views() });
    return { dist, checks, wrong, frames: R.frames };
  }

  /* ---------- Bellman-Ford with at most k stops ---------- */
  function bellmanRun(nodes, flights, src, dst, k, L) {
    const R = recorder(), C = s => lineOf(BF_CODE, s);
    let cost = new Map(nodes.map(x => [x, x === src ? 0 : Infinity]));
    const hist = [nodes.map(x => shown(cost.get(x)))], labels = ['start'];
    let checks = 0;
    const views = (newRow, round, edge, hlc, srcc) => [
      gv(L, 'flights (arrows point the way you fly)', { directed: true, hl: edge ? [edge] : [], state: { [src]: 'visited', [dst]: 'frontier' } }),
      { type: 'grid', name: 'cost per round (each round allows one more flight)', rows: newRow ? hist.concat([newRow]) : hist.slice(), rowLabels: newRow ? labels.concat([`round ${round} (new)`]) : labels.slice(), colLabels: nodes, hl: hlc || [], src: srcc || [] },
      { type: 'vars', values: { k, round, 'edge checks': checks } }
    ];
    R.add({ line: C('cost[src] = 0'), note: `Only ${src} is reachable with zero flights. k = ${k} stops means at most ${k + 1} flights, so we run ${k + 1} rounds.`, views: views(null, 0) });
    for (let r = 1; r <= k + 1; r++) {
      const nw = new Map(cost), row = () => nodes.map(x => shown(nw.get(x)));
      R.add({ line: C('new = dict(cost)'), note: `Round ${r}: copy last round's costs. Every update reads the old row and writes the new one.`, views: views(row(), r) });
      for (const [a, b, w] of flights) {
        checks++;
        const nr = hist.length, ia = nodes.indexOf(a), ib = nodes.indexOf(b), cand = cost.get(a) + w;
        if (cand < nw.get(b)) {
          nw.set(b, cand);
          R.add({ line: C('new[b] = cost[a] + w'), note: `Flight ${a} to ${b} (${w}): old cost[${a}] = ${shown(cost.get(a))}, plus ${w} is ${cand}. Better, so new[${b}] = ${cand}.`, views: views(row(), r, [a, b], [[nr, ib]], [[nr - 1, ia]]) });
        } else {
          R.add({ line: C('if cost[a] + w < new[b]'), note: `Flight ${a} to ${b} (${w}): ${cost.get(a) === Infinity ? `${a} was not reachable last round` : `${cost.get(a)} + ${w} = ${cand} is not better than ${shown(nw.get(b))}`}.`, views: views(row(), r, [a, b], [[nr, ib]], [[nr - 1, ia]]) });
        }
      }
      cost = nw; hist.push(nodes.map(x => shown(cost.get(x)))); labels.push(`round ${r}`);
      R.add({ line: C('cost = new'), note: `End of round ${r}: these are the cheapest costs using at most ${r} flight${r > 1 ? 's' : ''}.`, views: views(null, r) });
    }
    const ans = cost.get(dst) < Infinity ? cost.get(dst) : -1;
    R.frames.push({ line: C('return cost[dst]'), note: `Cheapest ${src} to ${dst} with at most ${k} stop${k === 1 ? '' : 's'}: ${ans}.` + R.more(), result: String(ans), views: views(null, k + 1) });
    return { ans, checks, frames: R.frames };
  }

  /* ---------- Prim ---------- */
  function primRun(g, start, L) {
    const R = recorder(), C = s => lineOf(PRIM_CODE, s);
    const seen = new Set(), heap = [[0, start, null]], tree = []; let total = 0, pops = 0, stale = 0;
    const views = cur => {
      const s = {}; heap.forEach(([, x]) => { s[x] = 'frontier'; }); seen.forEach(x => { s[x] = 'visited'; }); if (cur) s[cur] = 'current';
      return [gv(L, 'graph: teal edges are the tree so far', { hl: tree.map(([a, b]) => [a, b]), state: s }),
        { type: 'array', name: 'heap, smallest first: (weight, node, from)', values: heap.map(([w, v, f]) => `(${w}, ${v}, ${f === null ? 'None' : f})`) },
        { type: 'vars', values: { total, 'tree edges': tree.length, pops } }];
    };
    R.add({ line: C('heap = [(0, start, None)]'), note: `Grow one tree from ${start}. The heap holds every edge that leaves the tree, cheapest first.`, views: views() });
    while (heap.length && seen.size < g.size) {
      const [w, u, frm] = heap.shift(); pops++;
      if (seen.has(u)) { stale++; R.add({ line: C('continue'), note: `Pop (${w}, ${u}, ${frm}). ${u} is already in the tree: this edge would close a loop. Skip.`, views: views(u) }); continue; }
      seen.add(u); total += w;
      if (frm !== null) { tree.push([frm, u, w]); R.add({ line: C('tree.append((frm, u, w))'), note: `Pop (${w}, ${u}, ${frm}): the cheapest edge leaving the tree. Cut property: it is safe to keep. Total = ${total}.`, views: views(u) }); }
      else R.add({ line: C('seen.add(u)'), note: `${u} starts the tree at cost 0.`, views: views(u) });
      const offered = [];
      for (const [v, wv] of g.get(u)) if (!seen.has(v)) { heap.push([wv, v, u]); offered.push(`${u}-${v} (${wv})`); }
      heap.sort(cmp);
      if (offered.length) R.add({ line: C('heapq.heappush(heap, (wv, v, u))'), note: `Offer the edges from ${u} to nodes outside the tree: ${offered.join(', ')}.`, views: views(u) });
    }
    const all = seen.size === g.size;
    R.frames.push({ line: C('return total, tree'), note: (all ? `All ${g.size} nodes joined with ${tree.length} edges. Total = ${total}.` : `Only ${seen.size} of ${g.size} nodes are reachable from ${start}: the graph is not connected, so no spanning tree exists.`) + R.more(), result: `${total}, ${tree.length} edges`, views: views() });
    return { total, tree, all, pops, stale, frames: R.frames };
  }

  /* ---------- Kruskal ---------- */
  function kruskalRun(nodes, edges, L) {
    const R = recorder(), C = s => lineOf(KRUS_CODE, s);
    const parent = new Map(nodes.map(x => [x, x]));
    const find = x => { while (parent.get(x) !== x) { parent.set(x, parent.get(parent.get(x))); x = parent.get(x); } return x; };
    const sorted = edges.map(([a, b, w]) => [w, a, b]).sort(cmp), labels = sorted.map(([w, a, b]) => `${a}-${b} ${w}`);
    const tree = [], skipped = []; let total = 0;
    const views = (i, key) => [
      gv(L, 'graph: teal edges are the forest so far', { hl: tree.map(([a, b]) => [a, b]) }),
      { type: 'array', name: 'edges, cheapest first', values: labels, pointers: i === undefined ? {} : { i }, hl: i === undefined ? [] : [i], bad: skipped.slice() },
      { type: 'map', name: 'parent (union-find)', entries: [...parent.entries()], hl: key },
      { type: 'vars', values: { total, 'tree edges': tree.length } }];
    R.add({ line: C('for w, a, b in sorted(edges)'), note: 'Sort every edge by weight. Each node starts as its own group (its own parent).', views: views() });
    sorted.forEach(([w, a, b], i) => {
      const ra = find(a), rb = find(b);
      if (ra === rb) { skipped.push(i); R.add({ line: C('continue'), note: `${a}-${b} (${w}): find(${a}) = ${ra} and find(${b}) = ${rb}. Same group already, so this edge would close a loop. Skip.`, views: views(i) }); return; }
      parent.set(ra, rb); total += w; tree.push([a, b, w]);
      R.add({ line: C('parent[ra] = rb'), note: `${a}-${b} (${w}): find(${a}) = ${ra}, find(${b}) = ${rb}. Different groups, and no cheaper edge joins them: keep it and merge (parent[${ra}] = ${rb}). Total = ${total}.`, views: views(i, ra) });
    });
    R.frames.push({ line: C('return total, tree'), note: `${tree.length} edges kept, ${skipped.length} skipped. Total = ${total}.` + R.more(), result: `${total}`, views: views() });
    return { total, tree, frames: R.frames };
  }

  /* ---------- lesson players ---------- */
  const G = build(LESSON), LL = layout([...G.keys()], LESSON, LPOS);
  const dj = dijkstraRun(G, 'A', LL), br = bruteRun(G, 'A', LL), bf = bfsRun(G, 'A', LL, dj.dist);
  mount('p18tpA', { frames: br.frames }, { code: false });
  mount('p18tpB', { frames: dj.frames }, { code: false });
  setVal('p18roA', br.checks); setVal('p18roB', dj.st.checks);
  mount('p18tpC', { code: BFS_CODE, frames: bf.frames });
  setVal('p18roC', bf.dist.get('F')); setVal('p18roD', dj.dist.get('F'));
  mount('p18tpD', { code: DIJ_CODE, frames: dj.frames });
  setVal('p18roE', dj.st.pops); setVal('p18roF', dj.st.stale); setVal('p18roG', dj.st.checks);

  (() => {
    const FL = layout(['A', 'B', 'C', 'D'], FLIGHTS, FPOS);
    const p = mount('p18tpE', null);
    const show = k => {
      const r = bellmanRun(['A', 'B', 'C', 'D'], FLIGHTS, 'A', 'D', k, FL);
      if (p) p.load({ code: BF_CODE, frames: r.frames });
      setVal('p18roK', k); setVal('p18roH', r.ans); setVal('p18roI', r.checks);
      document.querySelectorAll('[data-p18k]').forEach(b => b.classList.toggle('btn-primary', Number(b.dataset.p18k) === k));
    };
    document.querySelectorAll('[data-p18k]').forEach(b => b.addEventListener('click', () => show(Number(b.dataset.p18k))));
    show(1);
  })();

  const pr = primRun(G, 'A', LL), kr = kruskalRun([...G.keys()].sort(), LESSON, LL);
  mount('p18tpF', { code: PRIM_CODE, frames: pr.frames });
  mount('p18tpG', { code: KRUS_CODE, frames: kr.frames });
  setVal('p18roP', pr.total); setVal('p18roQ', kr.total);

  /* ---------- sandbox ---------- */
  (() => {
    const inE = document.getElementById('s18E'), inS = document.getElementById('s18S'), err = document.getElementById('s18Err'), out = document.getElementById('s18Out'), tpEl = document.getElementById('s18Tp');
    if (!inE || !tpEl) return;
    const player = TracePlayer(tpEl, null, {});
    function parse(text) {
      const parts = text.split(/[,\n]/).map(t => t.trim()).filter(t => t !== '');
      if (!parts.length) throw new Error('Type at least one edge, for example: A-B 4, B-C 1');
      if (parts.length > 16) throw new Error(`That is ${parts.length} edges. Please use 16 or fewer so the picture stays readable.`);
      const edges = [], seenPair = new Set(), ids = [];
      parts.forEach((t, k) => {
        const m = t.match(/^([A-Za-z0-9]{1,3})\s*(?:-|\s)\s*([A-Za-z0-9]{1,3})\s+(-?\d{1,4})$/);
        if (!m) throw new Error(`Edge ${k + 1} ("${t}") should look like A-B 4: two node names (up to 3 letters or digits) and a whole-number weight.`);
        const [, a, b, ws] = m, w = Number(ws);
        if (a === b) throw new Error(`Edge ${k + 1} joins ${a} to itself. A loop never helps a shortest path or a tree, so leave it out.`);
        const key = [a, b].sort().join('|');
        if (seenPair.has(key)) throw new Error(`The pair ${a}-${b} appears twice. Keep only the weight you want.`);
        if (w > 999) throw new Error(`Edge ${a}-${b} has weight ${w}. Please keep weights at 999 or less.`);
        seenPair.add(key); edges.push([a, b, w]);
        [a, b].forEach(x => { if (!ids.includes(x)) ids.push(x); });
      });
      if (ids.length > 10) throw new Error(`That graph has ${ids.length} nodes. Please use 10 or fewer.`);
      return { edges, ids };
    }
    function run(algo) {
      let P;
      try { P = parse(inE.value); } catch (e) { err.textContent = e.message; out.innerHTML = ''; return; }
      const src = inS.value.trim();
      if (!P.ids.includes(src)) { err.textContent = `The start node "${src || 'empty'}" is not in the graph. Pick one of: ${P.ids.join(', ')}.`; out.innerHTML = ''; return; }
      const neg = P.edges.find(e => e[2] < 0);
      if (algo === 'dij' && neg) { err.textContent = `Edge ${neg[0]}-${neg[1]} has weight ${neg[2]}. Dijkstra needs weights of 0 or more (see Trap 2 in the lesson); negative edges need Bellman-Ford. Prim works fine with them.`; out.innerHTML = ''; return; }
      err.textContent = '';
      const g = build(P.edges), L = layout(P.ids, P.edges, P.ids.length === 6 && P.ids.every(x => LPOS[x]) ? LPOS : null);
      if (algo === 'dij') {
        const r = dijkstraRun(g, src, L);
        player.load({ code: DIJ_CODE, frames: r.frames });
        out.innerHTML = `<span class="rk">dist from ${src}:</span> <span class="rv">${fmtDist(P.ids, r.dist)}</span><br>` +
          `<span class="rk">pops:</span> <span class="rv">${r.st.pops}</span> <span class="rk">(stale ${r.st.stale})</span><br>` +
          `<span class="rk">edge checks:</span> <span class="rv">${r.st.checks}</span>`;
      } else {
        const r = primRun(g, src, L);
        player.load({ code: PRIM_CODE, frames: r.frames });
        out.innerHTML = `<span class="rk">tree total:</span> <span class="rv">${r.total}</span><br>` +
          `<span class="rk">tree edges:</span> <span class="rv">${r.tree.map(([a, b, w]) => `${a}-${b} ${w}`).join(', ') || 'none'}</span><br>` +
          `<span class="rk">connected:</span> <span class="${r.all ? 'rv' : 'rv-o'}">${r.all ? 'yes' : 'no, only part of the graph is covered'}</span>`;
      }
    }
    let last = 'dij';
    document.querySelectorAll('[data-s18e]').forEach(btn => btn.addEventListener('click', () => { inE.value = btn.dataset.s18e; inS.value = btn.dataset.s18s; run(last); }));
    document.getElementById('s18RunD').addEventListener('click', () => { last = 'dij'; run('dij'); });
    document.getElementById('s18RunP').addEventListener('click', () => { last = 'prim'; run('prim'); });
    [inE, inS].forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); run(last); } }));
    run('dij');
  })();
})();
