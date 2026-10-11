"""Advanced Graphs pattern lesson: every number on the page comes from this script.

Run:  python3 patterns/advanced-graphs/measure.py

Counting rules (the page's JavaScript uses the same ones):
  edge checks  = how many times a (neighbour, weight) pair is looked at in the inner loop
                 (brute force: every neighbour of the path's end, even ones already on the path;
                  Dijkstra: every neighbour of a node popped and not skipped; BFS: every neighbour scanned)
  pops         = how many times heapq.heappop runs (stale pops = pops that hit the `continue`)
  pushes       = how many times heapq.heappush runs, plus 1 for the start entry
Adjacency order = the order of the edge list, each undirected edge added to both ends.
"""
import heapq
import random
from collections import deque

LESSON_EDGES = [("A", "B", 4), ("A", "C", 1), ("B", "C", 2), ("B", "D", 5), ("C", "D", 8),
                ("C", "E", 10), ("D", "E", 2), ("D", "F", 4), ("E", "F", 3)]
FLIGHTS = [("A", "B", 1), ("B", "C", 1), ("C", "D", 1), ("A", "C", 5), ("B", "D", 4), ("A", "D", 9)]


def build(edges, directed=False):
    g = {}
    for a, b, w in edges:
        g.setdefault(a, [])
        g.setdefault(b, [])
        g[a].append((b, w))
        if not directed:
            g[b].append((a, w))
    return g


def dijkstra(graph, src, skip_stale=True):
    """The page's template. Returns (dist, stats)."""
    dist = {src: 0}
    heap = [(0, src)]
    done = set()
    st = {"pops": 0, "stale": 0, "pushes": 1, "checks": 0, "order": []}
    while heap:
        d, u = heapq.heappop(heap)
        st["pops"] += 1
        if u in done:
            st["stale"] += 1
            if skip_stale:
                continue
        else:
            st["order"].append(u)
        done.add(u)
        for v, w in graph[u]:
            st["checks"] += 1
            nd = d + w
            if v not in dist or nd < dist[v]:
                dist[v] = nd
                heapq.heappush(heap, (nd, v))
                st["pushes"] += 1
    return dist, st


def dijkstra_done_on_push(graph, src):
    """Trap: a node is treated as final the moment it is first reached."""
    dist = {src: 0}
    heap = [(0, src)]
    while heap:
        d, u = heapq.heappop(heap)
        for v, w in graph[u]:
            if v not in dist:          # first offer wins, never improved
                dist[v] = d + w
                heapq.heappush(heap, (d + w, v))
    return dist


def bfs_weights(graph, src):
    """Trap: plain BFS that adds weights along the first path it finds."""
    dist = {src: 0}
    q = deque([src])
    checks = 0
    while q:
        u = q.popleft()
        for v, w in graph[u]:
            checks += 1
            if v not in dist:
                dist[v] = dist[u] + w
                q.append(v)
    return dist, checks


def brute_paths(graph, src):
    """Try every simple path from src. Returns (best, checks, paths)."""
    best = {src: 0}
    st = {"checks": 0, "paths": 0}
    on_path = {src}

    def walk(u, cost):
        for v, w in graph[u]:
            st["checks"] += 1
            if v in on_path:
                continue
            st["paths"] += 1
            if v not in best or cost + w < best[v]:
                best[v] = cost + w
            on_path.add(v)
            walk(v, cost + w)
            on_path.remove(v)

    walk(src, 0)
    return best, st["checks"], st["paths"]


def bellman_k(nodes, flights, src, dst, k, copy=True):
    INF = float("inf")
    cost = {x: INF for x in nodes}
    cost[src] = 0
    checks = 0
    for _ in range(k + 1):
        new = dict(cost) if copy else cost
        for a, b, w in flights:
            checks += 1
            if cost[a] + w < new[b]:
                new[b] = cost[a] + w
        cost = new
    return (cost[dst] if cost[dst] < INF else -1), checks


def bellman_full(nodes, edges, src):
    INF = float("inf")
    cost = {x: INF for x in nodes}
    cost[src] = 0
    for _ in range(len(nodes) - 1):
        for a, b, w in edges:
            if cost[a] + w < cost[b]:
                cost[b] = cost[a] + w
    return cost


def prim(graph, start):
    seen = set()
    heap = [(0, start, None)]
    total, tree = 0, []
    st = {"pops": 0, "pushes": 1, "stale": 0}
    while heap and len(seen) < len(graph):
        w, u, frm = heapq.heappop(heap)
        st["pops"] += 1
        if u in seen:
            st["stale"] += 1
            continue
        seen.add(u)
        total += w
        if frm is not None:
            tree.append((frm, u, w))
        for v, wv in graph[u]:
            if v not in seen:
                heapq.heappush(heap, (wv, v, u))
                st["pushes"] += 1
    return total, tree, st


def kruskal(nodes, edges):
    parent = {x: x for x in nodes}

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    total, tree, skipped = 0, [], []
    for w, a, b in sorted((w, a, b) for a, b, w in edges):
        ra, rb = find(a), find(b)
        if ra == rb:
            skipped.append((a, b, w))
            continue
        parent[ra] = rb
        total += w
        tree.append((a, b, w))
    return total, tree, skipped


def fmt(d, nodes):
    return ", ".join(f"{x}={d.get(x, 'inf')}" for x in nodes)


def main():
    g = build(LESSON_EDGES)
    nodes = sorted(g)
    print("== 1. Lesson graph: brute force vs Dijkstra vs BFS (source A) ==")
    best, bchecks, bpaths = brute_paths(g, "A")
    dist, st = dijkstra(g, "A")
    bfs, bfs_checks = bfs_weights(g, "A")
    print(f"brute every path : {fmt(best, nodes)}   edge checks = {bchecks}   paths tried = {bpaths}")
    print(f"dijkstra         : {fmt(dist, nodes)}   edge checks = {st['checks']}   pops = {st['pops']}"
          f" (stale {st['stale']})   pushes = {st['pushes']}   finalised order = {''.join(st['order'])}")
    print(f"plain BFS        : {fmt(bfs, nodes)}   edge checks = {bfs_checks}")
    wrong = [x for x in nodes if bfs[x] != dist[x]]
    print(f"BFS wrong at     : {wrong}")

    print("\n== 2. Growth: complete graphs with random weights 1..9 (seed 7) ==")
    rnd = random.Random(7)
    for n in (4, 6, 8, 9):
        names = [f"n{i}" for i in range(n)]
        edges = [(names[i], names[j], rnd.randint(1, 9)) for i in range(n) for j in range(i + 1, n)]
        gg = build(edges)
        b, bc, _ = brute_paths(gg, "n0")
        d, s = dijkstra(gg, "n0")
        assert b == d
        print(f"n = {n}: edges = {len(edges):>2}   brute edge checks = {bc:>8}   dijkstra edge checks = {s['checks']:>3}")

    print("\n== 3. Trap: stale heap entries (lesson graph, source A) ==")
    d1, s1 = dijkstra(g, "A", skip_stale=True)
    d2, s2 = dijkstra(g, "A", skip_stale=False)
    print(f"with skip    : edge checks = {s1['checks']}   pops = {s1['pops']}   stale = {s1['stale']}")
    print(f"without skip : edge checks = {s2['checks']}   same answer = {d1 == d2}   extra = {s2['checks'] - s1['checks']}")

    print("\n== 4. Trap: final on push instead of on pop ==")
    print(f"done on push : {fmt(dijkstra_done_on_push(g, 'A'), nodes)}")
    print(f"correct      : {fmt(dist, nodes)}")

    print("\n== 5. Trap: a negative edge ==")
    neg = [("S", "A", 2), ("S", "B", 3), ("B", "A", -2), ("A", "C", 1)]
    gn = build(neg, directed=True)
    dn, _ = dijkstra(gn, "S")
    bf = bellman_full(sorted(gn), neg, "S")
    print("edges:", neg)
    print(f"dijkstra     : {fmt(dn, sorted(gn))}")
    print(f"bellman-ford : {fmt(bf, sorted(gn))}")

    print("\n== 6. Bellman-Ford with at most k stops (flights, A to D) ==")
    fn = ["A", "B", "C", "D"]
    print("flights:", FLIGHTS)
    for k in (0, 1, 2):
        ans, ch = bellman_k(fn, FLIGHTS, "A", "D", k)
        print(f"k = {k}: cheapest = {ans}   edge checks = {ch}")
    bad, _ = bellman_k(fn, FLIGHTS, "A", "D", 1, copy=False)
    print(f"k = 1 without the copy (trap): {bad}")
    dd, _ = dijkstra(build(FLIGHTS, directed=True), "A")
    print(f"plain Dijkstra ignoring k: {dd['D']}")

    print("\n== 7. MST on the lesson graph ==")
    pt, ptree, pst = prim(g, "A")
    kt, ktree, kskip = kruskal(nodes, LESSON_EDGES)
    print(f"prim from A : total = {pt}   tree = {ptree}   pops = {pst['pops']} (stale {pst['stale']})   pushes = {pst['pushes']}")
    print(f"kruskal     : total = {kt}   tree = {ktree}")
    print(f"kruskal skipped (would close a loop): {kskip}")
    # shortest path tree from A: parent of each node on its shortest path
    par = {}
    for a, b, w in LESSON_EDGES:
        for x, y in ((a, b), (b, a)):
            if dist[x] + w == dist[y] and y not in par and y != "A":
                par[y] = (x, w)
    spt = sum(w for _, w in par.values())
    print(f"shortest path tree from A: {sorted((p, c, w) for c, (p, w) in par.items())}   total weight = {spt}")
    # path cost A to F inside the MST
    mg = build(ktree)
    md, _ = dijkstra(mg, "A")
    print(f"A to F inside the MST = {md['F']}   real shortest A to F = {dist['F']}")

    print("\n== 8. Prim on points (like LeetCode 1584), n = 1000 random points, seed 3 ==")
    rnd = random.Random(3)
    pts = [(rnd.randint(0, 10**6), rnd.randint(0, 10**6)) for _ in range(1000)]
    n = len(pts)
    print(f"edges in the complete graph = n(n-1)/2 = {n * (n - 1) // 2}")
    # array Prim: O(n^2), count inner-loop steps
    INF = float("inf")
    best = [INF] * n
    best[0] = 0
    used = [False] * n
    steps = 0
    total_a = 0
    for _ in range(n):
        u = -1
        for i in range(n):
            steps += 1
            if not used[i] and (u == -1 or best[i] < best[u]):
                u = i
        used[u] = True
        total_a += best[u]
        for v in range(n):
            if not used[v]:
                c = abs(pts[u][0] - pts[v][0]) + abs(pts[u][1] - pts[v][1])
                if c < best[v]:
                    best[v] = c
    # heap Prim over the complete graph, count pushes
    seen = [False] * n
    heap = [(0, 0)]
    pushes = 1
    total_h = 0
    cnt = 0
    while heap and cnt < n:
        w, u = heapq.heappop(heap)
        if seen[u]:
            continue
        seen[u] = True
        cnt += 1
        total_h += w
        for v in range(n):
            if not seen[v]:
                heapq.heappush(heap, (abs(pts[u][0] - pts[v][0]) + abs(pts[u][1] - pts[v][1]), v))
                pushes += 1
    print(f"array Prim scan steps = {steps}   heap Prim pushes = {pushes}   same total = {total_a == total_h}")

    print("\n== 9. Sandbox examples ==")
    examples = {
        "lesson graph": ("A-B 4, A-C 1, B-C 2, B-D 5, C-D 8, C-E 10, D-E 2, D-F 4, E-F 3", "A"),
        "BFS fooled": ("S-T 10, S-X 1, X-Y 1, Y-T 1", "S"),
        "ties": ("A-B 1, A-C 1, B-D 1, C-D 1", "A"),
        "two islands": ("A-B 2, B-C 3, X-Y 1", "A"),
        "star": ("H-A 3, H-B 1, H-C 4, H-D 2", "H"),
    }
    for name, (text, src) in examples.items():
        edges = []
        for part in text.split(","):
            ab, w = part.split()
            a, b = ab.split("-")
            edges.append((a, b, int(w)))
        gg = build(edges)
        order = list(gg)                       # first appearance order, as in the page
        d, s = dijkstra(gg, src)
        pt, ptree, _ = prim(gg, src)
        print(f"{name:<12} dist: {fmt(d, order)}   pops = {s['pops']} (stale {s['stale']})   edge checks = {s['checks']}"
              f"   prim total = {pt} ({len(ptree)} edges)")


if __name__ == "__main__":
    main()
