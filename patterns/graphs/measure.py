"""Graphs pattern lesson: every number on the page comes from this script.

Run:  python3 patterns/graphs/measure.py

Counting rules (the page's JavaScript uses the same ones):
  neighbour checks = how many times a `for nb in adj[node]` loop body runs (one look along one edge)
  BFS stops when the goal is popped from the queue
  all-paths search walks every simple path from start to goal and keeps the shortest
  find hops = how many times the `while parent[x] != x` loop body runs
Neighbour order is always the order the edges are listed (adjacency lists keep insertion order).
Grid neighbour order is always: down, up, right, left.
"""
import sys
from collections import deque

# ---------- the small graph used in sections 1 and 4 ----------
NODES = "ABCDEFG"
EDGES = [("A", "B"), ("A", "C"), ("A", "D"), ("B", "E"), ("C", "E"),
         ("C", "F"), ("D", "F"), ("E", "G"), ("F", "G")]


def build(nodes, edges, directed=False):
    adj = {v: [] for v in nodes}
    for a, b in edges:
        adj[a].append(b)
        if not directed:
            adj[b].append(a)
    return adj


def bfs_hops(adj, start, goal):
    """Returns (hops, neighbour checks, pop order)."""
    dist = {start: 0}
    q = deque([start])
    checks, order = 0, []
    while q:
        node = q.popleft()
        order.append(node)
        if node == goal:
            return dist[node], checks, order
        for nb in adj[node]:
            checks += 1
            if nb not in dist:
                dist[nb] = dist[node] + 1
                q.append(nb)
    return -1, checks, order


def all_paths_hops(adj, start, goal):
    """Try every simple path. Returns (best hops, neighbour checks, paths found, walk calls)."""
    best = [float("inf")]
    stats = {"checks": 0, "paths": 0, "calls": 0}
    on_path = {start}

    def walk(node, length):
        stats["calls"] += 1
        if node == goal:
            stats["paths"] += 1
            best[0] = min(best[0], length)
            return
        for nb in adj[node]:
            stats["checks"] += 1
            if nb not in on_path:
                on_path.add(nb)
                walk(nb, length + 1)
                on_path.remove(nb)

    walk(start, 0)
    return best[0], stats["checks"], stats["paths"], stats["calls"]


def bfs_order(adj, start):
    seen = {start}
    q = deque([start])
    order, checks = [], 0
    while q:
        node = q.popleft()
        order.append(node)
        for nb in adj[node]:
            checks += 1
            if nb not in seen:
                seen.add(nb)
                q.append(nb)
    return order, checks


def dfs_order(adj, start):
    seen, order = set(), []
    checks = [0]
    deepest = [0]

    def dfs(node, depth):
        seen.add(node)
        order.append(node)
        deepest[0] = max(deepest[0], depth)
        for nb in adj[node]:
            checks[0] += 1
            if nb not in seen:
                dfs(nb, depth + 1)

    dfs(start, 1)
    return order, checks[0], deepest[0]


def grid_adj(n):
    """n x n open grid, neighbour order down, up, right, left."""
    adj = {}
    for r in range(n):
        for c in range(n):
            adj[(r, c)] = [(r + dr, c + dc) for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1))
                           if 0 <= r + dr < n and 0 <= c + dc < n]
    return adj


# ---------- islands ----------
ISLANDS = ["110010",
           "100110",
           "001000",
           "101101",
           "100011"]


def count_islands(rows):
    grid = [list(r) for r in rows]
    R, C = len(grid), len(grid[0])
    sizes, visits = [], [0]

    def dfs(r, c):
        if r < 0 or r >= R or c < 0 or c >= C or grid[r][c] != "1":
            return 0
        visits[0] += 1
        grid[r][c] = "#"
        return 1 + dfs(r + 1, c) + dfs(r - 1, c) + dfs(r, c + 1) + dfs(r, c - 1)

    count = 0
    for r in range(R):
        for c in range(C):
            if grid[r][c] == "1":
                count += 1
                sizes.append(dfs(r, c))
    return count, sizes, visits[0]


# ---------- maze playground (BFS ripple vs DFS) ----------
MAZE = ["S........G",
        ".#######..",
        "..........",
        "..........",
        ".........."]


def maze_bfs(rows):
    R, C = len(rows), len(rows[0])
    start = next((r, c) for r in range(R) for c in range(C) if rows[r][c] == "S")
    goal = next((r, c) for r in range(R) for c in range(C) if rows[r][c] == "G")
    dist = {start: 0}
    q = deque([start])
    popped = 0
    while q:
        r, c = q.popleft()
        popped += 1
        if (r, c) == goal:
            return dist[(r, c)], popped
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < R and 0 <= nc < C and rows[nr][nc] != "#" and (nr, nc) not in dist:
                dist[(nr, nc)] = dist[(r, c)] + 1
                q.append((nr, nc))
    return -1, popped


def maze_dfs(rows):
    """Plain DFS that stops at the first path to the goal. Returns (path steps, cells entered)."""
    R, C = len(rows), len(rows[0])
    start = next((r, c) for r in range(R) for c in range(C) if rows[r][c] == "S")
    goal = next((r, c) for r in range(R) for c in range(C) if rows[r][c] == "G")
    seen = set()
    path = []

    def dfs(r, c):
        seen.add((r, c))
        path.append((r, c))
        if (r, c) == goal:
            return True
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < R and 0 <= nc < C and rows[nr][nc] != "#" and (nr, nc) not in seen:
                if dfs(nr, nc):
                    return True
        path.pop()
        return False

    found = dfs(*start)
    return (len(path) - 1 if found else -1), len(seen)


# ---------- topological sort ----------
DRESS_NODES = ["under", "socks", "shirt", "pants", "shoes", "belt", "tie", "coat"]
DRESS_EDGES = [("under", "pants"), ("pants", "shoes"), ("socks", "shoes"), ("pants", "belt"),
               ("shirt", "belt"), ("shirt", "tie"), ("tie", "coat"), ("belt", "coat")]


def kahn(nodes, edges):
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
    return order if len(order) == len(nodes) else None, order


# ---------- union-find ----------
class DSU:
    def __init__(self, n, by_size=True, compress=True):
        self.parent = list(range(n))
        self.size = [1] * n
        self.by_size, self.compress = by_size, compress
        self.hops = 0
        self.groups = n

    def find(self, x):
        while self.parent[x] != x:
            self.hops += 1
            if self.compress:
                self.parent[x] = self.parent[self.parent[x]]
            x = self.parent[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False
        if self.by_size and self.size[ra] < self.size[rb]:
            ra, rb = rb, ra
        if self.by_size:
            self.parent[rb] = ra
            self.size[ra] += self.size[rb]
        else:
            self.parent[ra] = rb
        self.groups -= 1
        return True


def chain_then_ask(n, by_size, compress):
    """union(i, i+1) for every i, then everyone asks find(i). Returns total hops."""
    d = DSU(n, by_size, compress)
    for i in range(n - 1):
        d.union(i, i + 1)
    for i in range(n):
        d.find(i)
    return d.hops


FRIEND_UNIONS = [(0, 1), (2, 3), (4, 5), (1, 3), (0, 2), (3, 5)]


def main():
    adj = build(NODES, EDGES)
    print("== 1. Fewest hops A -> G on the 7-node graph ==")
    print("adjacency:", {k: "".join(v) for k, v in adj.items()})
    hops, checks, order = bfs_hops(adj, "A", "G")
    print(f"BFS:       hops = {hops}  neighbour checks = {checks}  pop order = {''.join(order)}")
    b, bc, paths, calls = all_paths_hops(adj, "A", "G")
    print(f"all paths: hops = {b}  neighbour checks = {bc}  simple paths found = {paths}  walk calls = {calls}")

    print("\n== 2. Grid race: corner to corner on an n x n open grid ==")
    for n in (2, 3, 4, 5):
        g = grid_adj(n)
        h, c, _ = bfs_hops(g, (0, 0), (n - 1, n - 1))
        bh, bc2, p, _ = all_paths_hops(g, (0, 0), (n - 1, n - 1))
        print(f"n = {n}: BFS hops = {h} checks = {c:>3}   all paths: hops = {bh} checks = {bc2:>7} paths = {p:>5}   ratio = {bc2 / c:.1f}x")

    print("\n== 4a. BFS vs DFS visit order from A (whole graph) ==")
    o, c = bfs_order(adj, "A")
    print(f"BFS order = {' '.join(o)}  checks = {c}")
    o, c, deep = dfs_order(adj, "A")
    print(f"DFS order = {' '.join(o)}  checks = {c}  deepest call stack = {deep}")
    print(f"edges = {len(EDGES)}, 2 x edges = {2 * len(EDGES)}, nodes = {len(NODES)}")

    print("\n== 4b. Islands ==")
    for r in ISLANDS:
        print("   ", r)
    cnt, sizes, visits = count_islands(ISLANDS)
    land = sum(r.count("1") for r in ISLANDS)
    print(f"islands = {cnt}  sizes = {sizes}  land cells = {land}  dfs visits that paint = {visits}  cells = {len(ISLANDS) * len(ISLANDS[0])}")

    print("\n== 4c. Maze playground (default walls) ==")
    for r in MAZE:
        print("   ", r)
    d, popped = maze_bfs(MAZE)
    p, entered = maze_dfs(MAZE)
    open_cells = sum(ch != "#" for r in MAZE for ch in r)
    print(f"BFS shortest = {d} steps, cells popped = {popped}   DFS first path = {p} steps, cells entered = {entered}   open cells = {open_cells}")

    print("\n== 4d. Topological sort: getting dressed ==")
    order, _ = kahn(DRESS_NODES, DRESS_EDGES)
    print("order =", " -> ".join(order))
    bad, partial = kahn(["a", "b", "c"], [("a", "b"), ("b", "c"), ("c", "a")])
    print("cycle a->b->c->a: result =", bad, " partial order =", partial)

    print("\n== 4e. Union-find: friends 0..5 (union by size + path halving) ==")
    d = DSU(6)
    for a, b in FRIEND_UNIONS:
        merged = d.union(a, b)
        print(f"union({a}, {b}) -> {'merged' if merged else 'already together'}  parent = {d.parent}  groups = {d.groups}")
    print("total find hops =", d.hops)

    print("\n== 4f. Everyone asks for their leader: union(i, i+1) chain, then find(i) for all i ==")
    for n in (10, 100, 1000):
        a = chain_then_ask(n, False, False)
        b = chain_then_ask(n, False, True)
        c = chain_then_ask(n, True, True)
        print(f"n = {n:>4}: no tricks = {a:>6}   halving only = {b:>5}   size + halving = {c:>5}")

    print("\n== 6a. Trap: mark visited on pop (pushes onto the queue, whole graph from A) ==")

    def pushes_wrong(adj, s):
        seen, q, pushes = set(), deque([s]), 1
        while q:
            v = q.popleft()
            if v in seen:
                continue
            seen.add(v)
            for nb in adj[v]:
                if nb not in seen:
                    q.append(nb)
                    pushes += 1
        return pushes

    def pushes_right(adj, s):
        seen, q, pushes = {s}, deque([s]), 1
        while q:
            v = q.popleft()
            for nb in adj[v]:
                if nb not in seen:
                    seen.add(nb)
                    q.append(nb)
                    pushes += 1
        return pushes

    print(f"7-node graph: mark on pop = {pushes_wrong(adj, 'A')} pushes   mark on push = {pushes_right(adj, 'A')} pushes")
    for n in (10, 50):
        g = grid_adj(n)
        print(f"{n}x{n} grid: mark on pop = {pushes_wrong(g, (0, 0))} pushes   mark on push = {pushes_right(g, (0, 0))} pushes")

    print("\n== 6b. Trap: recursion depth on an all-land grid ==")
    print("recursion limit =", sys.getrecursionlimit())
    for n in (20, 40):
        rows = ["1" * n] * n
        try:
            cnt, _, _ = count_islands(rows)
            print(f"{n}x{n} all land, recursive DFS -> {cnt} island")
        except RecursionError as e:
            print(f"{n}x{n} all land, recursive DFS -> RecursionError: {e}")

    def islands_iter(rows):
        grid = [list(r) for r in rows]
        R, C = len(grid), len(grid[0])
        count = 0
        for r in range(R):
            for c in range(C):
                if grid[r][c] != "1":
                    continue
                count += 1
                grid[r][c] = "#"
                stack = [(r, c)]
                while stack:
                    y, x = stack.pop()
                    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        ny, nx = y + dy, x + dx
                        if 0 <= ny < R and 0 <= nx < C and grid[ny][nx] == "1":
                            grid[ny][nx] = "#"
                            stack.append((ny, nx))
        return count

    print("40x40 all land, stack DFS ->", islands_iter(["1" * 40] * 40), "island")

    print("\n== 6c. Trap: undirected edges added one way ==")
    n, edges = 3, [(1, 0), (2, 1)]

    def components(n, edges, both):
        g = {i: [] for i in range(n)}
        for a, b in edges:
            g[a].append(b)
            if both:
                g[b].append(a)
        seen, count = set(), 0
        for s in range(n):
            if s in seen:
                continue
            count += 1
            stack = [s]
            seen.add(s)
            while stack:
                v = stack.pop()
                for w in g[v]:
                    if w not in seen:
                        seen.add(w)
                        stack.append(w)
        return count

    print(f"n = 3, edges = {edges}: one-way adjacency -> {components(n, edges, False)} components   both ways -> {components(n, edges, True)}")

    print("\n== 6d. Trap: directed cycle check with a plain visited set ==")
    diamond = build("ABCD", [("A", "B"), ("A", "C"), ("B", "D"), ("C", "D")], directed=True)

    def cycle_wrong(adj):
        seen = set()

        def dfs(v):
            if v in seen:
                return True
            seen.add(v)
            return any(dfs(w) for w in adj[v])
        return any(dfs(v) for v in adj if v not in seen)

    def cycle_right(adj):
        state = {v: 0 for v in adj}   # 0 new, 1 on the current path, 2 finished

        def dfs(v):
            if state[v] == 1:
                return True
            if state[v] == 2:
                return False
            state[v] = 1
            if any(dfs(w) for w in adj[v]):
                return True
            state[v] = 2
            return False
        return any(dfs(v) for v in adj if state[v] == 0)

    print("diamond A->B, A->C, B->D, C->D: plain visited says cycle =", cycle_wrong(diamond), "  three colours say cycle =", cycle_right(diamond))
    print("kahn on diamond:", kahn("ABCD", [("A", "B"), ("A", "C"), ("B", "D"), ("C", "D")])[0])

    print("\n== 7. Complexity counts ==")
    big = grid_adj(100)
    o, c = bfs_order(big, (0, 0))
    print(f"100x100 grid BFS: nodes = {len(o)}  neighbour checks = {c}  (2 x edges = {sum(len(v) for v in big.values())})")

    print("\n== 9. Check yourself ==")
    line = build("ABCDE", [("A", "B"), ("B", "C"), ("C", "D"), ("D", "E")])
    print("path A-B-C-D-E, BFS from C:", bfs_order(line, "C")[0], " DFS from C:", dfs_order(line, "C")[0])
    print("kahn on a->b, a->c, c->b:", kahn("abc", [("a", "b"), ("a", "c"), ("c", "b")])[0])
    d = DSU(5)
    for a, b in [(0, 1), (1, 2), (3, 4), (2, 0)]:
        print(f"  union({a}, {b}) -> {d.union(a, b)}")
    print("  groups =", d.groups)

    print("\n== Sandbox examples (BFS / DFS orders and checks) ==")
    ex = {
        "ring": ("A-B, B-C, C-D, D-E, E-F, F-A", "A"),
        "two islands": ("A-B, B-C, D-E", "A"),
        "star": ("H-A, H-B, H-C, H-D, H-E", "H"),
    }
    for name, (txt, s) in ex.items():
        es = [tuple(p.strip().split("-")) for p in txt.split(",")]
        nodes = []
        for a, b in es:
            for v in (a, b):
                if v not in nodes:
                    nodes.append(v)
        g = build(nodes, es)
        bo, bc = bfs_order(g, s)
        do, dc, _ = dfs_order(g, s)
        print(f"{name:<11} BFS {' '.join(bo)} ({bc} checks)   DFS {' '.join(do)} ({dc} checks)")
    print("dressing  topo:", " ".join(kahn(DRESS_NODES, DRESS_EDGES)[0]))
    print("one-way cycle a-b, b-c, c-a, c-d topo:", kahn("abcd", [("a", "b"), ("b", "c"), ("c", "a"), ("c", "d")]))


if __name__ == "__main__":
    main()
