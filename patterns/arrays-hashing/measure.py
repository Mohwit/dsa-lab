"""Arrays and Hashing pattern lesson: every number on the page comes from this script.

Run:  python3 patterns/arrays-hashing/measure.py

Counting rules (the page's JavaScript uses the same ones):
  set scan steps   = how many times `if x in seen` runs before the scan stops (first repeat) or ends
  pair comparisons = how many times `nums[i] == nums[j]` runs in the brute force, which also stops at the first repeat
"""
import platform
import subprocess
import timeit
from collections import Counter, defaultdict


def set_scan(nums):
    """One pass with a set. Returns (has_repeat, steps)."""
    seen = set()
    steps = 0
    for x in nums:
        steps += 1
        if x in seen:
            return True, steps
        seen.add(x)
    return False, steps


def brute_pairs(nums):
    """Compare every pair. Returns (has_repeat, comparisons)."""
    comps = 0
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            comps += 1
            if nums[i] == nums[j]:
                return True, comps
    return False, comps


def machine():
    try:
        cpu = subprocess.run(["sysctl", "-n", "machdep.cpu.brand_string"], capture_output=True, text=True).stdout.strip()
    except OSError:
        cpu = ""
    return f"{cpu or platform.processor()}, {platform.system()} {platform.machine()}, Python {platform.python_version()}"


def main():
    print("== 1. Picture example ==")
    pic = [5, 2, 8, 1, 9, 2]
    print(f"nums = {pic}")
    print(f"set scan   -> {set_scan(pic)}   # (has_repeat, steps)")
    print(f"brute pair -> {brute_pairs(pic)}   # (has_repeat, comparisons)")

    print("\n== 2. Operation race, no repeats (worst case: both scan everything) ==")
    for n in (10, 100, 1000, 2000):
        nums = list(range(n))
        _, s = set_scan(nums)
        _, b = brute_pairs(nums)
        print(f"n = {n:>4}: set scan steps = {s:>5}   pair comparisons = {b:>7}   ratio = {b / s:.1f}x")

    print("\n== 3. Sandbox examples ==")
    examples = {
        "no repeats": [3, 8, 1, 9, 4, 6],
        "early repeat": [2, 9, 2, 6, 4, 7],
        "late repeat": [6, 1, 8, 3, 9, 4, 4],
        "all same": [7, 7, 7, 7, 7],
    }
    for name, nums in examples.items():
        r, s = set_scan(nums)
        _, b = brute_pairs(nums)
        print(f"{name:<13} {str(nums):<24} repeat = {r!s:<5}  set steps = {s}  pair comparisons = {b}")

    print("\n== 4. Check yourself ==")
    print(f"[2, 7, 2] -> set scan {set_scan([2, 7, 2])}")

    print("\n== 5. Templates on small inputs ==")
    print("Counter('banana') =", Counter("banana"))
    print("most_common(1)    =", Counter("banana").most_common(1))
    groups = defaultdict(list)
    for w in ["stop", "pots", "cat", "tops", "act", "dog"]:
        groups["".join(sorted(w))].append(w)
    print("groups            =", dict(groups))

    print("\n== 6. Trap: check after insert (pair target 10) ==")

    def pair_buggy(nums, target):
        seen = {}
        for i, x in enumerate(nums):
            seen[x] = i                  # insert first ...
            if target - x in seen:       # ... then check: x can find itself
                return [seen[target - x], i]
        return None

    def pair_fixed(nums, target):
        seen = {}
        for i, x in enumerate(nums):
            if target - x in seen:       # check first
                return [seen[target - x], i]
            seen[x] = i                  # then insert
        return None

    print("buggy([5, 3], 10) =", pair_buggy([5, 3], 10), "  # 5 paired with itself")
    print("fixed([5, 3], 10) =", pair_fixed([5, 3], 10))

    print("\n== 7. Trap: `in` on a list vs a set (value not present = worst case) ==")
    print("machine:", machine())
    for n in (10**4, 10**5):
        as_list = list(range(n))
        as_set = set(as_list)
        reps = 200
        t_list = min(timeit.repeat(lambda: -1 in as_list, number=reps, repeat=5)) / reps
        t_set = min(timeit.repeat(lambda: -1 in as_set, number=reps * 1000, repeat=5)) / (reps * 1000)
        print(f"n = {n:>6}: list {t_list * 1e6:6.1f} us   set {t_set * 1e9:4.1f} ns   list/set = {t_list / t_set:,.0f}x")

    print("\n== 8. Trap: unhashable key ==")
    try:
        d = {[1, 2]: "x"}
    except TypeError as e:
        print("{[1, 2]: 'x'} ->", f"TypeError: {e}")
    d = {(1, 2): "x"}
    print("{(1, 2): 'x'} ->", d)
    print("''.join(sorted('pots')) ->", repr("".join(sorted("pots"))))


if __name__ == "__main__":
    main()
