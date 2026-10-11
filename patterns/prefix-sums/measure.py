"""Prefix Sums pattern lesson: every number on the page comes from this script.

Run:  python3 patterns/prefix-sums/measure.py

Counting rules (the page's JavaScript uses the same ones):
  re-adding ops   = one per `total += nums[i]` inside a range question
  prefix ops      = one per `prefix[i + 1] = prefix[i] + nums[i]` while building,
                    plus one per `prefix[r + 1] - prefix[l]` per question
  brute sums      = one per `total += nums[j]` in the all-subarrays brute force
  map steps       = one per item in the one-pass prefix-count loop
"""
from collections import defaultdict


def slow_ranges(nums, queries):
    ops, out = 0, []
    for l, r in queries:
        total = 0
        for i in range(l, r + 1):
            total += nums[i]
            ops += 1
        out.append(total)
    return out, ops


def build_prefix(nums):
    prefix = [0] * (len(nums) + 1)
    for i in range(len(nums)):
        prefix[i + 1] = prefix[i] + nums[i]
    return prefix


def fast_ranges(nums, queries):
    prefix = build_prefix(nums)
    ops = len(nums)
    out = []
    for l, r in queries:
        out.append(prefix[r + 1] - prefix[l])
        ops += 1
    return out, ops, prefix


def count_k(nums, k):
    """LeetCode 560 shape: how many subarrays sum to exactly k."""
    counts = {0: 1}
    prefix = 0
    found = 0
    for x in nums:
        prefix += x
        found += counts.get(prefix - k, 0)
        counts[prefix] = counts.get(prefix, 0) + 1
    return found, len(nums), counts


def count_k_brute(nums, k):
    found = ops = 0
    for i in range(len(nums)):
        total = 0
        for j in range(i, len(nums)):
            total += nums[j]
            ops += 1
            if total == k:
                found += 1
    return found, ops


def count_k_no_seed(nums, k):
    counts, prefix, found = {}, 0, 0
    for x in nums:
        prefix += x
        found += counts.get(prefix - k, 0)
        counts[prefix] = counts.get(prefix, 0) + 1
    return found


def count_k_store_first(nums, k):
    counts, prefix, found = {0: 1}, 0, 0
    for x in nums:
        prefix += x
        counts[prefix] = counts.get(prefix, 0) + 1      # stored too early
        found += counts.get(prefix - k, 0)
    return found


def count_k_window(nums, k):
    """Sliding window: only correct when every number is positive."""
    l = total = found = 0
    for r in range(len(nums)):
        total += nums[r]
        while total > k and l <= r:
            total -= nums[l]
            l += 1
        if total == k:
            found += 1
    return found


def longest_balanced(bits, keep_first=True):
    """LeetCode 525 shape: longest stretch with as many 0s as 1s."""
    first = {0: -1}
    bal = best = 0
    for i, b in enumerate(bits):
        bal += 1 if b == 1 else -1
        if bal in first:
            best = max(best, i - first[bal])
            if not keep_first:
                first[bal] = i          # the trap: overwrite with the last index
        else:
            first[bal] = i
    return best, first


def longest_balanced_brute(bits):
    best = 0
    for i in range(len(bits)):
        z = o = 0
        for j in range(i, len(bits)):
            if bits[j]:
                o += 1
            else:
                z += 1
            if z == o:
                best = max(best, j - i + 1)
    return best


def pivot(nums):
    total, left = sum(nums), 0
    for i, x in enumerate(nums):
        if left == total - left - x:
            return i
        left += x
    return -1


def diff_array(n, updates):
    diff = [0] * (n + 1)
    for l, r, v in updates:
        diff[l] += v
        diff[r + 1] -= v
    out, run = [], 0
    for i in range(n):
        run += diff[i]
        out.append(run)
    return out, diff


def main():
    print("== 1. Range questions: re-add vs prefix ==")
    nums = [3, 1, 4, 1, 5, 9, 2, 6]
    queries = [(1, 4), (0, 7), (2, 5), (3, 6)]
    s, so = slow_ranges(nums, queries)
    f, fo, prefix = fast_ranges(nums, queries)
    print("nums =", nums, " queries (l, r inclusive) =", queries)
    print("prefix =", prefix)
    print("answers =", s, " same:", s == f)
    print(f"re-adding ops = {so}   prefix ops = {fo}  (build {len(nums)} + {len(queries)} subtractions)")

    print("\n== 2. Race: every question asks for the whole array (worst case) ==")
    for n, q in ((8, 4), (100, 100), (1000, 1000), (10**5, 10**5)):
        if n <= 1000:
            arr = list(range(n))
            qs = [(0, n - 1)] * q
            a = slow_ranges(arr, qs)[1]
            b = fast_ranges(arr, qs)[1]
        else:
            a, b = n * q, n + q
        print(f"n = {n:>6}, q = {q:>6}: re-adding = {a:>14,}   prefix = {b:>7,}   ratio = {a / b:,.1f}x")
    arr = list(range(1000))
    print("formula check (q * n and n + q) for n = 1..60, q = 1..60:",
          all(slow_ranges(list(range(n)), [(0, n - 1)] * q)[1] == n * q and fast_ranges(list(range(n)), [(0, n - 1)] * q)[1] == n + q
              for n in range(1, 61) for q in range(1, 61, 7)))

    print("\n== 3. Template A on a small input ==")
    print("build_prefix([3, 1, 4, 1, 5]) =", build_prefix([3, 1, 4, 1, 5]))
    print("sum of index 1..3 = prefix[4] - prefix[1] =", build_prefix([3, 1, 4, 1, 5])[4], "-", build_prefix([3, 1, 4, 1, 5])[1])

    print("\n== 4. Template B: subarrays that sum to k ==")
    ex = [1, 2, 3, -2, 2]
    found, steps, counts = count_k(ex, 3)
    print(f"nums = {ex}, k = 3: found = {found}, map steps = {steps}, final counts = {counts}")
    print("brute force (found, sums) =", count_k_brute(ex, 3))
    for n in (1000, 10000):
        arr = [(i * 7) % 5 - 2 for i in range(n)]
        print(f"n = {n:>5}: map steps = {count_k(arr, 3)[1]:,}   brute sums = {count_k_brute(arr, 3)[1]:,}   same answer: {count_k(arr, 3)[0] == count_k_brute(arr, 3)[0]}")

    print("\n== 5. Template C: balance trick ==")
    bits = [0, 1, 1, 0, 1, 1, 1, 0]
    best, first = longest_balanced(bits)
    print(f"bits = {bits}: longest = {best}, first index of each balance = {first}, brute = {longest_balanced_brute(bits)}")

    print("\n== 6. Template D: pivot and difference array ==")
    pv = [2, 3, -1, 8, 4]
    i = pivot(pv)
    print(f"pivot({pv}) = {i}  (total = {sum(pv)}, left = {sum(pv[:i])}, right = {sum(pv[i + 1:])})")
    out, diff = diff_array(6, [(1, 3, 2), (2, 5, 3), (0, 1, 1)])
    print("diff_array(6, [(1, 3, +2), (2, 5, +3), (0, 1, +1)]) ->", out, " diff =", diff)

    print("\n== 7. Traps ==")
    p = build_prefix([3, 1, 4, 1, 5])
    print("off by one: sum of index 1..3 of [3, 1, 4, 1, 5]: right = prefix[4] - prefix[1] =", p[4] - p[1],
          "  wrong = prefix[3] - prefix[1] =", p[3] - p[1])
    print("no {0: 1} seed, [1, 2, 3], k = 3: buggy =", count_k_no_seed([1, 2, 3], 3), " right =", count_k([1, 2, 3], 3)[0])
    print("store before count, [1, 2], k = 0: buggy =", count_k_store_first([1, 2], 0), " right =", count_k([1, 2], 0)[0])
    for arr, k in (([1, -1, 0], 0), ([2, -1, 2], 3), ([1, 2, 3], 3)):
        print(f"window on {arr}, k = {k}: window = {count_k_window(arr, k)}  right = {count_k(arr, k)[0]}")
    lb = [0, 1, 1, 0, 1, 1, 1, 0]
    print("525 keeping the last index instead of the first:", longest_balanced(lb, keep_first=False)[0], " right =", longest_balanced(lb)[0])

    print("\n== 8. Check yourself ==")
    print("prefix of [2, -1, 3, 5] =", build_prefix([2, -1, 3, 5]), " sum 1..3 =", build_prefix([2, -1, 3, 5])[4] - build_prefix([2, -1, 3, 5])[1])
    print("count_k([1, 1, 1], 2) =", count_k([1, 1, 1], 2)[0])
    print("longest_balanced([0, 0, 1, 0, 1, 1]) =", longest_balanced([0, 0, 1, 0, 1, 1])[0], " brute =", longest_balanced_brute([0, 0, 1, 0, 1, 1]))

    print("\n== 9. Sandbox examples ==")
    for name, arr, k in (("mixed signs", [1, 2, 3, -2, 2], 3), ("all ones", [1, 1, 1, 1], 2), ("zeros", [0, 0, 0], 0),
                         ("negatives", [3, -3, 3, -3], 0), ("no answer", [5, 6, 7], 4)):
        f, steps, _ = count_k(arr, k)
        print(f"{name:<12} {str(arr):<20} k = {k}: found = {f}  map steps = {steps}  brute sums = {count_k_brute(arr, k)[1]}")


if __name__ == "__main__":
    main()
