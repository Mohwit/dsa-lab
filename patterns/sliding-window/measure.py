"""Sliding Window pattern lesson: every number on the page comes from this script.

Run:  python3 patterns/sliding-window/measure.py

Counting rules (the page's JavaScript uses the same ones):
  fixed window, brute     = number touches: each window adds up its k numbers from scratch -> k per window
  fixed window, slide     = number touches: k for the first window, then 2 per slide (one added, one removed)
  variable window, slide  = window moves: 1 per character added on the right + 1 per character removed on the left
  variable window, brute  = character reads: for each start i, read s[j] for j = i, i+1, ... until the window breaks or the string ends
"""
import random


def max_sum_k(nums, k):
    """Fixed window. Returns (best, touches)."""
    total = sum(nums[:k])
    touches = k
    best = total
    for r in range(k, len(nums)):
        total += nums[r] - nums[r - k]
        touches += 2
        best = max(best, total)
    return best, touches


def max_sum_k_brute(nums, k):
    best, touches = None, 0
    for i in range(len(nums) - k + 1):
        total = 0
        for j in range(i, i + k):
            total += nums[j]
            touches += 1
        best = total if best is None else max(best, total)
    return best, touches


def longest_unique(s):
    """Variable window, no repeated character. Returns (best, moves)."""
    count = {}
    l = best = moves = 0
    for r, ch in enumerate(s):
        count[ch] = count.get(ch, 0) + 1
        moves += 1
        while count[ch] > 1:
            count[s[l]] -= 1
            l += 1
            moves += 1
        best = max(best, r - l + 1)
    return best, moves


def longest_unique_brute(s):
    best = reads = 0
    for i in range(len(s)):
        seen = set()
        for j in range(i, len(s)):
            reads += 1
            if s[j] in seen:
                break
            seen.add(s[j])
            best = max(best, j - i + 1)
    return best, reads


def longest_k_distinct(s, k):
    count = {}
    l = best = moves = 0
    for r, ch in enumerate(s):
        count[ch] = count.get(ch, 0) + 1
        moves += 1
        while len(count) > k:
            left = s[l]
            count[left] -= 1
            if count[left] == 0:
                del count[left]
            l += 1
            moves += 1
        best = max(best, r - l + 1)
    return best, moves


def longest_k_distinct_brute(s, k):
    best = reads = 0
    for i in range(len(s)):
        seen = set()
        for j in range(i, len(s)):
            reads += 1
            seen.add(s[j])
            if len(seen) > k:
                break
            best = max(best, j - i + 1)
    return best, reads


def shortest_at_least(nums, target):
    l, total, moves = 0, 0, 0
    best = float("inf")
    for r, x in enumerate(nums):
        total += x
        moves += 1
        while total >= target:
            best = min(best, r - l + 1)
            total -= nums[l]
            l += 1
            moves += 1
    return (0 if best == float("inf") else best), moves


def shortest_brute(nums, target):
    best = 0
    for i in range(len(nums)):
        total = 0
        for j in range(i, len(nums)):
            total += nums[j]
            if total >= target:
                if best == 0 or j - i + 1 < best:
                    best = j - i + 1
                break
    return best


def main():
    print("== 1. Picture example: best sum of k = 4 numbers in a row ==")
    pic, k = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3], 4
    print(f"nums = {pic}, k = {k}, windows = {len(pic) - k + 1}")
    print(f"slide -> {max_sum_k(pic, k)}   # (best, number touches)")
    print(f"brute -> {max_sum_k_brute(pic, k)}   # (best, number touches)")

    print("\n== 2. Race: number touches, fixed window ==")
    for n, k in ((10, 4), (100, 10), (1000, 100), (1000, 500)):
        nums = list(range(n))
        _, a = max_sum_k(nums, k)
        _, b = max_sum_k_brute(nums, k)
        print(f"n = {n:>4}, k = {k:>3}: slide = {a:>5}   brute = {b:>6}   ratio = {b / a:.1f}x")

    print("\n== 3. Templates on small inputs ==")
    print("longest_unique('abcbdab')        =", longest_unique("abcbdab"), "  # (best, window moves)")
    print("longest_unique_brute('abcbdab')  =", longest_unique_brute("abcbdab"), "  # (best, reads)")
    print("longest_k_distinct('abaccbab', 2) =", longest_k_distinct("abaccbab", 2))
    print("shortest_at_least([2, 1, 5, 1, 3, 2], 8) =", shortest_at_least([2, 1, 5, 1, 3, 2], 8), "  # (length, window moves)")
    print("shortest_brute                           =", shortest_brute([2, 1, 5, 1, 3, 2], 8))

    print("\n== 4. Trap 1: update the answer before the window is valid again ==")

    def longest_unique_early(s):
        count = {}
        l = best = 0
        for r, ch in enumerate(s):
            count[ch] = count.get(ch, 0) + 1
            best = max(best, r - l + 1)      # too early: the window may hold a repeat
            while count[ch] > 1:
                count[s[l]] -= 1
                l += 1
        return best

    print("early('abcc') =", longest_unique_early("abcc"), "  # 'abcc' has a repeat")
    print("fixed('abcc') =", longest_unique("abcc")[0])

    print("\n== 5. Trap 2: a zero count left in the map ==")

    def k_distinct_nodelete(s, k):
        count = {}
        l = best = 0
        for r, ch in enumerate(s):
            count[ch] = count.get(ch, 0) + 1
            while len(count) > k:
                count[s[l]] -= 1        # never deleted, so len(count) never drops
                l += 1
            best = max(best, r - l + 1)
        return best

    try:
        k_distinct_nodelete("abaccbab", 2)
    except IndexError as e:
        print("nodelete('abaccbab', 2) -> IndexError:", e)
    print("longest_k_distinct('abaccbab', 2) =", longest_k_distinct("abaccbab", 2)[0])

    print("\n== 6. Trap 3: negative numbers break the shrink rule ==")
    print("shortest_at_least([1, -5, 6], 6) =", shortest_at_least([1, -5, 6], 6)[0], "  # but [6] alone works")
    print("shortest_brute([1, -5, 6], 6)    =", shortest_brute([1, -5, 6], 6))

    print("\n== 7. Cost of the variable window: random strings over 10 letters (seed 7) ==")
    rng = random.Random(7)
    for n in (100, 1000, 10000):
        s = "".join(rng.choice("abcdefghij") for _ in range(n))
        a, m = longest_unique(s)
        b, rd = longest_unique_brute(s)
        assert a == b
        print(f"n = {n:>5}: window moves = {m:>5} (at most 2n = {2 * n:>5})   brute reads = {rd:>6}")
    rng = random.Random(7)
    for n in (100, 1000):
        s = "".join(rng.choice("ab") for _ in range(n))
        a, m = longest_k_distinct(s, 2)
        b, rd = longest_k_distinct_brute(s, 2)
        assert a == b
        print(f"two letters, k = 2, n = {n:>4}: window moves = {m:>4}   brute reads = {rd:>6}   # nothing ever breaks the window")

    print("\n== 8. Sandbox examples ==")
    for s, k in (("abaccbab", 2), ("tattoo", 2), ("aaaa", 1), ("abcdef", 3)):
        a, m = longest_k_distinct(s, k)
        b, rd = longest_k_distinct_brute(s, k)
        assert a == b
        print(f"at most {k} distinct in {s!r:<11}: best = {a}, window moves = {m}, brute reads = {rd}")
    for nums, k in (([3, 1, 4, 1, 5, 9, 2, 6, 5, 3], 4), ([-2, 5, -1, 7, -3], 2), ([4, 4, 4, 4, 4, 4], 3)):
        a, t = max_sum_k(nums, k)
        b, tb = max_sum_k_brute(nums, k)
        assert a == b
        print(f"fixed k = {k} on {str(nums):<32}: best = {a}, slide touches = {t}, brute touches = {tb}")

    print("\n== 9. Check yourself ==")
    print("max_sum_k([2, 8, 1, 7, 3], 2) =", max_sum_k([2, 8, 1, 7, 3], 2))
    print("max_sum_k_brute               =", max_sum_k_brute([2, 8, 1, 7, 3], 2))
    print("longest_unique('pqrqs')        =", longest_unique("pqrqs"))
    print("shortest_at_least([1, 2, 3, 4, 5], 9) =", shortest_at_least([1, 2, 3, 4, 5], 9))


if __name__ == "__main__":
    main()
