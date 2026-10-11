"""Operation counts for every approach on the page example (used by the All approaches table).

Run: python3 problems/arrays-hashing/0001-two-sum/approaches.py
"""
import json
import os
import random
import sys

sys.path.insert(0, os.path.dirname(__file__))
from solution import two_sum  # noqa: E402


class C:
    n = 0

    def __init__(self, v, i):
        self.v, self.i = v, i

    def __lt__(self, o):
        C.n += 1
        return self.v < o.v


def all_pairs(nums, target):
    ops = 0
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            ops += 1
            if nums[i] + nums[j] == target:
                return [i, j], ops
    return [], ops


def sort_two_pointers(nums, target):
    C.n = 0
    s = sorted(C(x, i) for i, x in enumerate(nums))  # keep (value, original index)
    sort_ops, steps = C.n, 0
    lo, hi = 0, len(s) - 1
    while lo < hi:
        steps += 1
        t = s[lo].v + s[hi].v
        if t == target:
            return sorted([s[lo].i, s[hi].i]), sort_ops, steps
        if t < target:
            lo += 1
        else:
            hi -= 1
    return [], sort_ops, steps


def two_pass(nums, target):
    where = {}
    stores = 0
    for i, x in enumerate(nums):
        where[x] = i  # a later copy overwrites an earlier one
        stores += 1
    lookups = 0
    for i, x in enumerate(nums):
        lookups += 1
        j = where.get(target - x)
        if j is not None and j != i:
            return [i, j], stores, lookups
    return [], stores, lookups


def one_pass(nums, target):
    seen, ops = {}, 0
    for i, x in enumerate(nums):
        ops += 1
        if target - x in seen:
            return [seen[target - x], i], ops
        seen[x] = i
    return [], ops


if __name__ == "__main__":
    ex, t = [5, 9, 1, 12, 3, 8], 11
    print("example", ex, "target", t)
    print("  all pairs                : (answer, pair checks) =", all_pairs(ex, t))
    print("  sort + two pointers      : (answer, sort comparisons, pointer steps) =", sort_two_pointers(ex, t))
    print("  two-pass dict            : (answer, stores, lookups) =", two_pass(ex, t))
    print("  one-pass dict            : (answer, lookups) =", one_pass(ex, t))
    # every approach finds a valid pair whenever the reference does
    cases = json.load(open(os.path.join(os.path.dirname(__file__), "tests.json")))["cases"]
    rng = random.Random(7)
    inputs = [tuple(c["args"]) for c in cases]
    for _ in range(300):
        n = rng.randint(2, 12)
        a = [rng.randint(-10, 10) for _ in range(n)]
        i, j = rng.sample(range(n), 2)
        inputs.append((a, a[i] + a[j]))
    for a, tg in inputs:
        want = two_sum(a, tg)
        for got in (all_pairs(a, tg)[0], sort_two_pointers(a, tg)[0], two_pass(a, tg)[0], one_pass(a, tg)[0]):
            assert bool(got) == bool(want), (a, tg, got, want)
            if got:
                assert got[0] != got[1] and a[got[0]] + a[got[1]] == tg, (a, tg, got)
    print("all four approaches agree on", len(inputs), "inputs")
