"""Trees pattern lesson: every number on the page comes from this script.

Run:  python3 patterns/trees/measure.py

Counting rules (the page's JavaScript uses the same ones):
  node visits      = calls of a function on a real node (calls on None are counted separately as "empty calls")
  path walk visits = for every leaf, walk from the root down to it, one visit per node on the way
  naive diameter   = node visits of diameter_naive plus all node visits of the height() calls it makes
  one-pass diameter= node visits of the single post-order helper
"""
import sys
from collections import deque

sys.setrecursionlimit(20000)


class Node:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right


def build(vals):
    """LeetCode level order (None for a missing child) -> root."""
    if not vals or vals[0] is None:
        return None
    root = Node(vals[0])
    q, i = deque([root]), 1
    while q and i < len(vals):
        node = q.popleft()
        if i < len(vals) and vals[i] is not None:
            node.left = Node(vals[i]); q.append(node.left)
        i += 1
        if i < len(vals) and vals[i] is not None:
            node.right = Node(vals[i]); q.append(node.right)
        i += 1
    return root


# ---------- Template A: return a value (max depth) ----------
def max_depth_count(root):
    c = {"real": 0, "none": 0}

    def depth(node):
        if not node:
            c["none"] += 1
            return 0
        c["real"] += 1
        return 1 + max(depth(node.left), depth(node.right))

    return depth(root), c["real"], c["none"]


def path_walk(root):
    """Slow way: walk from the root to every leaf separately. Returns (deepest, visits)."""
    if not root:
        return 0, 0
    paths, visits, best = [], 0, 0

    def leaves(node, path):
        path = path + [node]
        if not node.left and not node.right:
            paths.append(path)
        if node.left:
            leaves(node.left, path)
        if node.right:
            leaves(node.right, path)

    leaves(root, [])
    for p in paths:
        visits += len(p)
        best = max(best, len(p))
    return best, visits


# ---------- Template B: carry state down (validate BST) ----------
def valid_bst(root):
    def ok(node, lo, hi):
        if not node:
            return True
        if not (lo < node.val < hi):
            return False
        return ok(node.left, lo, node.val) and ok(node.right, node.val, hi)

    return ok(root, float("-inf"), float("inf"))


def valid_bst_buggy(root):
    """Only compares a node with its own children."""
    if not root:
        return True
    if root.left and root.left.val >= root.val:
        return False
    if root.right and root.right.val <= root.val:
        return False
    return valid_bst_buggy(root.left) and valid_bst_buggy(root.right)


# ---------- Template C: global answer (diameter) ----------
def diameter_one_pass(root):
    best, visits = 0, 0

    def height(node):
        nonlocal best, visits
        if not node:
            return 0
        visits += 1
        l = height(node.left)
        r = height(node.right)
        best = max(best, l + r)
        return 1 + max(l, r)

    height(root)
    return best, visits


def diameter_naive(root):
    visits = 0

    def height(node):
        nonlocal visits
        if not node:
            return 0
        visits += 1
        return 1 + max(height(node.left), height(node.right))

    def diam(node):
        nonlocal visits
        if not node:
            return 0
        visits += 1
        through = height(node.left) + height(node.right)
        return max(through, diam(node.left), diam(node.right))

    return diam(root), visits


def diameter_root_only(root):
    """Trap: only measures the path that goes through the root."""
    def height(node):
        if not node:
            return 0
        return 1 + max(height(node.left), height(node.right))

    return height(root.left) + height(root.right) if root else 0


# ---------- Template D: BFS by level ----------
def level_order(root):
    if not root:
        return [], 0
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
    return out, max(len(l) for l in out)


def level_order_buggy(root):
    """Trap: no snapshot of the level size, so levels run together."""
    if not root:
        return []
    out, q = [], deque([root])
    level = []
    while q:
        node = q.popleft()
        level.append(node.val)
        if node.left:
            q.append(node.left)
        if node.right:
            q.append(node.right)
    out.append(level)
    return out


# ---------- Template E: BST order ----------
def orders(root):
    pre, ino, post = [], [], []

    def walk(node):
        if not node:
            return
        pre.append(node.val)
        walk(node.left)
        ino.append(node.val)
        walk(node.right)
        post.append(node.val)

    walk(root)
    return pre, ino, post


def kth_smallest(root, k):
    _, ino, _ = orders(root)
    return ino[k - 1]


def perfect(n):
    """Perfect tree with values 1..n in level order (n = 2^h - 1)."""
    return build(list(range(1, n + 1)))


def chain(n):
    """Left-only chain of n nodes, built without recursion."""
    root = Node(1)
    cur = root
    for v in range(2, n + 1):
        cur.left = Node(v)
        cur = cur.left
    return root


def main():
    pic = [8, 3, 10, 1, 6, None, 14, None, None, 4, 7, 13]
    root = build(pic)
    print("== 1. Picture tree ==")
    print("level order input:", pic)
    print("max depth DFS -> (depth, real node visits, empty calls):", max_depth_count(root))
    print("path walk     -> (depth, node visits):", path_walk(root))

    print("\n== 4A. Template A trace tree: same picture tree ==")
    print("== 4B. Validate BST ==")
    sneaky = [5, 4, 6, None, None, 3, 7]
    print(sneaky, "buggy local check:", valid_bst_buggy(build(sneaky)), " bounds check:", valid_bst(build(sneaky)))
    print(pic, "bounds check:", valid_bst(root))

    print("\n== 4C. Diameter race (node visits) ==")
    for shape, mk in (("balanced", perfect), ("chain", chain)):
        for n in (15, 127, 1023):
            t = mk(n)
            d1, v1 = diameter_one_pass(t)
            d2, v2 = diameter_naive(t)
            assert d1 == d2
            print(f"{shape:<8} n = {n:>4}: one pass {v1:>4}   naive {v2:>6}   {v2 / v1:.1f}x   (diameter = {d1})")
    print("picture tree diameter:", diameter_one_pass(root))

    print("\n== 4D. Level order ==")
    print("levels, widest level:", level_order(root))

    print("\n== 4E. Traversal orders and kth smallest ==")
    pre, ino, post = orders(root)
    print("preorder :", pre)
    print("inorder  :", ino)
    print("postorder:", post)
    print("3rd smallest:", kth_smallest(root, 3))

    print("\n== 6. Traps ==")

    def depth_buggy(node):
        return 1 + max(depth_buggy(node.left), depth_buggy(node.right))

    try:
        depth_buggy(build([1, 2]))
    except AttributeError as e:
        print("depth without base case on [1, 2] -> AttributeError:", e)
    t = [1, 2, None, 3, 4, 5, None, None, 6]
    print(t, "root-only diameter:", diameter_root_only(build(t)), " one-pass:", diameter_one_pass(build(t))[0])
    print(pic, "level order without size snapshot:", level_order_buggy(root))
    deep = chain(5000)
    sys.setrecursionlimit(1000)
    try:
        max_depth_count(deep)
        print("recursive depth on chain(5000): ok")
    except RecursionError as e:
        print("recursive depth on chain(5000) with the default limit 1000 -> RecursionError:", e)
    sys.setrecursionlimit(20000)
    print("BFS level count on chain(5000):", len(level_order(deep)[0]))

    print("\n== 7. Complexity ==")
    p15 = perfect(15)
    print("perfect 15: max_depth (depth, real, empty):", max_depth_count(p15), " widest level:", level_order(p15)[1])
    c15 = chain(15)
    print("chain 15  : max_depth (depth, real, empty):", max_depth_count(c15), " widest level:", level_order(c15)[1])
    for n in (1000, 100000):
        print(f"chain n = {n}: naive diameter visits by formula n(n+1)/2 = {n * (n + 1) // 2:,}   one-pass = {n:,}")
    print("chain 1023 naive check:", diameter_naive(chain(1023))[1])

    print("\n== 9. Check yourself ==")
    print("[1, None, 2, None, 3] max_depth (depth, real, empty):", max_depth_count(build([1, None, 2, None, 3])))
    q2 = build([1, 2, 3, 4, None, None, 5])
    lv = level_order(q2)[0]
    print("[1, 2, 3, 4, None, None, 5] levels:", lv, " right side view:", [l[-1] for l in lv])
    print("[10, 5, 15, None, None, 6, 20] valid BST:", valid_bst(build([10, 5, 15, None, None, 6, 20])),
          " buggy local check:", valid_bst_buggy(build([10, 5, 15, None, None, 6, 20])))

    print("\n== Sandbox examples ==")
    ex = {
        "picture": pic,
        "small": [3, 9, 20, None, None, 15, 7],
        "single": [42],
        "empty": [],
        "left chain": [1, 2, None, 3, None, 4],
        "perfect 15": list(range(1, 16)),
    }
    for name, v in ex.items():
        r = build(v)
        d, real, none = max_depth_count(r)
        lv, w = level_order(r)
        print(f"{name:<11} depth = {d}  real visits = {real}  empty calls = {none}  levels = {lv}  widest level = {w}")


if __name__ == "__main__":
    main()
