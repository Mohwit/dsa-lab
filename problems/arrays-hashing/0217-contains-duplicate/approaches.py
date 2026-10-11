"""Operation counts for every approach on the page example (used by the All approaches table).

Run: python3 problems/arrays-hashing/0217-contains-duplicate/approaches.py
"""
import json
import os
import random
import sys

sys.path.insert(0, os.path.dirname(__file__))
from solution import contains_duplicate  # noqa: E402


class C:
    n = 0

    def __init__(self, v):
        self.v = v

    def __lt__(self, o):
        C.n += 1
        return self.v < o.v


def pairs(nums):
    ops = 0
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            ops += 1
            if nums[i] == nums[j]:
                return True, ops
    return False, ops


def sort_neighbours(nums):
    C.n = 0
    s = [c.v for c in sorted(C(x) for x in nums)]
    sort_ops, checks = C.n, 0
    for i in range(1, len(s)):
        checks += 1
        if s[i] == s[i - 1]:
            return True, sort_ops, checks
    return False, sort_ops, checks


def hash_set(nums):
    seen, ops = set(), 0
    for x in nums:
        ops += 1
        if x in seen:
            return True, ops
        seen.add(x)
    return False, ops


def one_liner(nums):
    return len(set(nums)) != len(nums), len(nums)  # always inserts every number


if __name__ == "__main__":
    ex = [3, 8, 5, 1, 9, 5]
    print("example", ex)
    print("  compare all pairs      :", pairs(ex))
    print("  sort, then neighbours  : (answer, sort comparisons, neighbour checks) =", sort_neighbours(ex))
    print("  hash set, one pass     : (answer, lookups) =", hash_set(ex))
    print("  len(set(nums))         : (answer, inserts) =", one_liner(ex))
    # every approach agrees with the reference on all test cases and random lists
    cases = json.load(open(os.path.join(os.path.dirname(__file__), "tests.json")))["cases"]
    rng = random.Random(7)
    lists = [c["args"][0] for c in cases] + [[rng.randint(-20, 20) for _ in range(rng.randint(0, 15))] for _ in range(300)]
    for a in lists:
        want = contains_duplicate(a)
        assert pairs(a)[0] == sort_neighbours(a)[0] == hash_set(a)[0] == one_liner(a)[0] == want, a
    print("all four approaches agree on", len(lists), "inputs")
