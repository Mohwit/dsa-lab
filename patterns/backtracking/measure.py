"""Backtracking pattern lesson: every number on the page comes from this script.

Run:  python3 patterns/backtracking/measure.py

Counting rules (the page's JavaScript uses the same ones):
  nodes visited = how many times the recursive helper bt(...) is called, the root call included
  cut           = how many times the pruning test `if nums[i] > remain: break` fires
"""
import math
import random


# ---------- the code shown on the page, with counters added ----------

def pick_sum_all(nums, target):
    """Generate every subset, test each one. Returns (answers, nodes)."""
    out, path, cnt = [], [], [0]

    def bt(start):
        cnt[0] += 1
        if sum(path) == target:
            out.append(path[:])
        for i in range(start, len(nums)):
            path.append(nums[i])
            bt(i + 1)
            path.pop()
    bt(0)
    return out, cnt[0]


def pick_sum(nums, target):
    """Backtracking with pruning (sorted, break when too big). Returns (answers, nodes, cuts)."""
    nums = sorted(nums)
    out, path, cnt, cut = [], [], [0], [0]

    def bt(start, remain):
        cnt[0] += 1
        if remain == 0:
            out.append(path[:])
            return
        for i in range(start, len(nums)):
            if nums[i] > remain:
                cut[0] += 1
                break
            path.append(nums[i])
            bt(i + 1, remain - nums[i])
            path.pop()
    bt(0, target)
    return out, cnt[0], cut[0]


def subsets(nums):
    out, path, cnt = [], [], [0]

    def bt(start):
        cnt[0] += 1
        out.append(path[:])
        for i in range(start, len(nums)):
            path.append(nums[i])
            bt(i + 1)
            path.pop()
    bt(0)
    return out, cnt[0]


def permutations(nums):
    out, path, used, cnt = [], [], [False] * len(nums), [0]

    def bt():
        cnt[0] += 1
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
    return out, cnt[0]


def combination_sum(cands, target):
    cands = sorted(cands)
    out, path, cnt, cut = [], [], [0], [0]

    def bt(start, remain):
        cnt[0] += 1
        if remain == 0:
            out.append(path[:])
            return
        for i in range(start, len(cands)):
            if cands[i] > remain:
                cut[0] += 1
                break
            path.append(cands[i])
            bt(i, remain - cands[i])
            path.pop()
    bt(0, target)
    return out, cnt[0], cut[0]


def subsets_dedup(nums, skips=None):
    nums = sorted(nums)
    out, path = [], []

    def bt(start):
        out.append(path[:])
        for i in range(start, len(nums)):
            if i > start and nums[i] == nums[i - 1]:
                if skips is not None:
                    skips[0] += 1
                continue
            path.append(nums[i])
            bt(i + 1)
            path.pop()
    bt(0)
    return out


# ---------- buggy versions for the traps ----------

def subsets_no_copy(nums):
    out, path = [], []

    def bt(start):
        out.append(path)              # bug: the same list object every time
        for i in range(start, len(nums)):
            path.append(nums[i])
            bt(i + 1)
            path.pop()
    bt(0)
    return out


def subsets_no_pop(nums):
    out, path = [], []

    def bt(start):
        out.append(path[:])
        for i in range(start, len(nums)):
            path.append(nums[i])
            bt(i + 1)
            # bug: no path.pop()
    bt(0)
    return out


def combination_sum_restart(cands, target):
    cands = sorted(cands)
    out, path = [], []

    def bt(remain):                   # bug: every level starts again at index 0
        if remain == 0:
            out.append(path[:])
            return
        for i in range(len(cands)):
            if cands[i] > remain:
                break
            path.append(cands[i])
            bt(remain - cands[i])
            path.pop()
    bt(target)
    return out


def perm_tree_nodes(n):
    """Nodes in the permutation tree: sum over depth k of n! / (n - k)!"""
    return sum(math.factorial(n) // math.factorial(n - k) for k in range(n + 1))


def main():
    print("== 1. Picture example: pick numbers from [2, 3, 4, 5] that add up to 7 ==")
    a, n_all = pick_sum_all([2, 3, 4, 5], 7)
    b, n_pr, c_pr = pick_sum([2, 3, 4, 5], 7)
    print(f"generate every subset: answers = {a}  nodes visited = {n_all}")
    print(f"backtrack with pruning: answers = {b}  nodes visited = {n_pr}  cuts = {c_pr}")

    print("\n== 2. Pruning race: nums = 1..n, target T ==")
    for n, t in ((10, 10), (15, 10), (20, 10), (20, 20)):
        nums = list(range(1, n + 1))
        _, na = pick_sum_all(nums, t) if n <= 20 else (None, 2 ** n)
        ans, np_, cp = pick_sum(nums, t)
        print(f"n = {n:>2}, T = {t:>2}: answers = {len(ans):>3}  every subset = {na:>9,}  pruned = {np_:>5,}  ratio = {na / np_:,.0f}x")

    print("\n== 3. Templates on [1, 2, 3] ==")
    s, sn = subsets([1, 2, 3])
    print(f"subsets       -> {s}  ({len(s)} answers, {sn} nodes)")
    p, pn = permutations([1, 2, 3])
    print(f"permutations  -> {p}  ({len(p)} answers, {pn} nodes)")
    cs, csn, csc = combination_sum([2, 3, 5], 8)
    print(f"combination_sum([2, 3, 5], 8) -> {cs}  ({len(cs)} answers, {csn} nodes, {csc} cuts)")

    print("\n== 4. Traps ==")
    print("no copy  subsets([1, 2, 3]) =", subsets_no_copy([1, 2, 3]))
    print("no pop   subsets([1, 2, 3]) =", subsets_no_pop([1, 2, 3]))
    dup, _ = subsets([1, 2, 2])
    print(f"plain subsets([1, 2, 2]) = {dup}  ({len(dup)} lists)")
    dd = subsets_dedup([1, 2, 2])
    print(f"sort + skip  ([1, 2, 2]) = {dd}  ({len(dd)} lists)")
    print("restart at 0: combination_sum([2, 3, 5], 8) =", combination_sum_restart([2, 3, 5], 8))
    print("start at i  : combination_sum([2, 3, 5], 8) =", combination_sum([2, 3, 5], 8)[0])

    print("\n== 5. Growth: answers and tree nodes ==")
    for n in (3, 4, 5, 8, 10, 12, 20):
        print(f"n = {n:>2}: subsets 2^n = {2 ** n:>9,}  permutations n! = {math.factorial(n):>13,}  permutation tree nodes = {perm_tree_nodes(n):>13,}")
    # confirm the formulas by running the code for small n
    for n in (3, 4, 5, 6):
        _, sn = subsets(list(range(n)))
        _, pn = permutations(list(range(n)))
        assert sn == 2 ** n and pn == perm_tree_nodes(n)
    print("checked by running: subsets nodes = 2^n and permutation nodes = formula, for n = 3..6")
    print("copy work for subsets(n=10): total items copied =", sum(len(x) for x in subsets(list(range(10)))[0]))

    print("\n== 6. Sandbox examples ==")
    print("subsets [1, 2, 3]      ->", subsets([1, 2, 3])[1], "nodes")
    sk = [0]
    print("subsets [1, 2, 2] dedup ->", len(subsets_dedup([1, 2, 2], sk)), "answers,", sk[0], "duplicate branches skipped")
    print("permutations [1, 2, 3] ->", permutations([1, 2, 3])[1], "nodes")
    for c, t in (([2, 3, 5], 8), ([2, 3, 6, 7], 7), ([3, 5], 4)):
        r, k, cut = combination_sum(c, t)
        print(f"combination_sum({c}, {t}) -> {r}  nodes = {k}  cuts = {cut}")

    print("\n== 7. Check yourself ==")
    print("subsets([1, 2, 3, 4]) nodes =", subsets([1, 2, 3, 4])[1])
    po, pon = permutations([1, 2, 3, 4])
    print(f"permutations([1, 2, 3, 4]) answers = {len(po)}  nodes = {pon}")
    print("sort + skip subsets([2, 1, 2]) =", subsets_dedup([2, 1, 2]))


if __name__ == "__main__":
    main()
