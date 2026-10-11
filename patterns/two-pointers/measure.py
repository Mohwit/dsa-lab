"""Two Pointers pattern lesson: every number on the page comes from this script.

Run:  python3 patterns/two-pointers/measure.py

Counting rules (the page's JavaScript uses the same ones):
  pair checks (two pointers) = how many times `s = nums[l] + nums[r]` runs before the loop returns or ends
  pair checks (brute force)  = how many times `nums[i] + nums[j] == target` runs; it also stops at the first hit
  palindrome comparisons     = how many times `s[l].lower() != s[r].lower()` runs
  3Sum checks                = how many times `s = nums[i] + nums[l] + nums[r]` runs (brute: one per triple i < j < k)
"""
from math import comb


def pair_sum(nums, target):
    """Opposite ends on sorted input. Returns (answer, checks)."""
    l, r = 0, len(nums) - 1
    checks = 0
    while l < r:
        s = nums[l] + nums[r]
        checks += 1
        if s == target:
            return [l, r], checks
        if s < target:
            l += 1
        else:
            r -= 1
    return None, checks


def pair_brute(nums, target):
    checks = 0
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            checks += 1
            if nums[i] + nums[j] == target:
                return [i, j], checks
    return None, checks


def is_palindrome(s):
    l, r = 0, len(s) - 1
    comps = 0
    while l < r:
        if not s[l].isalnum():
            l += 1
        elif not s[r].isalnum():
            r -= 1
        else:
            comps += 1
            if s[l].lower() != s[r].lower():
                return False, comps
            l += 1
            r -= 1
    return True, comps


def remove_dups(nums):
    nums = list(nums)
    if not nums:
        return 0, nums
    k = 1
    for i in range(1, len(nums)):
        if nums[i] != nums[k - 1]:
            nums[k] = nums[i]
            k += 1
    return k, nums


def three_sum(nums):
    nums = sorted(nums)
    out, checks = [], 0
    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        l, r = i + 1, len(nums) - 1
        while l < r:
            s = nums[i] + nums[l] + nums[r]
            checks += 1
            if s < 0:
                l += 1
            elif s > 0:
                r -= 1
            else:
                out.append([nums[i], nums[l], nums[r]])
                l += 1
                r -= 1
                while l < r and nums[l] == nums[l - 1]:
                    l += 1
    return out, checks


def three_sum_brute(nums):
    nums = sorted(nums)
    n, found, checks = len(nums), set(), 0
    for i in range(n):
        for j in range(i + 1, n):
            for k in range(j + 1, n):
                checks += 1
                if nums[i] + nums[j] + nums[k] == 0:
                    found.add((nums[i], nums[j], nums[k]))
    return sorted(map(list, found)), checks


def main():
    print("== 1. Picture example (sorted, one pair adds up) ==")
    pic, t = [1, 3, 5, 6, 8, 10, 12], 14
    pairs = [(i, j) for i in range(len(pic)) for j in range(i + 1, len(pic)) if pic[i] + pic[j] == t]
    print(f"nums = {pic}, target = {t}, pairs that work = {pairs}, all pairs = {comb(len(pic), 2)}")
    print(f"two pointers -> {pair_sum(pic, t)}   # (answer, pair checks)")
    print(f"brute pairs  -> {pair_brute(pic, t)}   # (answer, pair checks)")

    print("\n== 2. Race, no pair adds up (worst case) : nums = 0..n-1, target = -1 ==")
    for n in (10, 100, 1000):
        nums = list(range(n))
        _, a = pair_sum(nums, -1)
        _, b = pair_brute(nums, -1)
        print(f"n = {n:>4}: two pointer checks = {a:>4}   brute pair checks = {b:>6}   ratio = {b / a:.1f}x")

    print("\n== 3. Templates on small inputs ==")
    for s in ("Top spot!", "race a car"):
        print(f"is_palindrome({s!r}) = {is_palindrome(s)}   # (answer, comparisons)")
    k, arr = remove_dups([1, 1, 2, 2, 2, 3, 4, 4])
    print(f"remove_dups([1, 1, 2, 2, 2, 3, 4, 4]) -> k = {k}, nums[:k] = {arr[:k]}, whole list = {arr}")
    ts = [-3, -1, -1, 0, 1, 2, 4]
    print(f"three_sum({ts}) = {three_sum(ts)}   # (triples, checks)")
    print(f"three_sum_brute  = {three_sum_brute(ts)}")

    print("\n== 4. Trap 1: `while l <= r` uses one item twice ==")

    def pair_le(nums, target):
        l, r = 0, len(nums) - 1
        while l <= r:
            s = nums[l] + nums[r]
            if s == target:
                return [l, r]
            if s < target:
                l += 1
            else:
                r -= 1
        return None

    print("pair_le([2, 5, 9], 10)  =", pair_le([2, 5, 9], 10), "  # 5 + 5, the same item twice")
    print("pair_sum([2, 5, 9], 10) =", pair_sum([2, 5, 9], 10)[0])

    print("\n== 5. Trap 2: unsorted input ==")
    print("pair_sum([1, 9, 4, 3], 7)         =", pair_sum([1, 9, 4, 3], 7)[0], "  # 4 + 3 = 7 exists")
    print("pair_sum(sorted -> [1, 3, 4, 9], 7) =", pair_sum([1, 3, 4, 9], 7)[0])

    print("\n== 6. Trap 3: 3Sum without skipping repeats ==")

    def three_sum_noskip(nums):
        nums = sorted(nums)
        out = []
        for i in range(len(nums) - 2):
            l, r = i + 1, len(nums) - 1
            while l < r:
                s = nums[i] + nums[l] + nums[r]
                if s < 0:
                    l += 1
                elif s > 0:
                    r -= 1
                else:
                    out.append([nums[i], nums[l], nums[r]])
                    l += 1
                    r -= 1
        return out

    print("noskip([-2, 0, 0, 2, 2])    =", three_sum_noskip([-2, 0, 0, 2, 2]))
    print("three_sum([-2, 0, 0, 2, 2]) =", three_sum([-2, 0, 0, 2, 2])[0])

    print("\n== 7. Trap 4: inner skip loop without a bound ==")

    def pal_buggy(s):
        l, r = 0, len(s) - 1
        while l < r:
            while not s[l].isalnum():
                l += 1
            while not s[r].isalnum():
                r -= 1
            if s[l].lower() != s[r].lower():
                return False
            l += 1
            r -= 1
        return True

    try:
        pal_buggy("?!")
    except IndexError as e:
        print("pal_buggy('?!') -> IndexError:", e)
    print("is_palindrome('?!') =", is_palindrome("?!")[0])

    print("\n== 8. 3Sum cost, no triple sums to 0 (nums = 1..n) ==")
    for n in (10, 100, 200):
        nums = list(range(1, n + 1))
        _, a = three_sum(nums)
        b = comb(n, 3) if n > 100 else three_sum_brute(nums)[1]
        print(f"n = {n:>3}: two pointer checks = {a:>6}   brute triple checks = {b:>8}   ratio = {b / a:.1f}x")

    print("\n== 9. Sandbox examples ==")
    ex = {
        "found": ([1, 3, 5, 6, 8, 10, 12], 14),
        "no pair": ([2, 4, 6, 8, 10], 7),
        "repeats": ([2, 2, 3, 5], 4),
        "negatives": ([-5, -2, 0, 3, 7], 1),
    }
    for name, (nums, tg) in ex.items():
        a, c = pair_sum(nums, tg)
        _, b = pair_brute(nums, tg)
        print(f"{name:<9} {str(nums):<24} target {tg:>2}: answer = {a}, two pointer checks = {c}, brute checks = {b}")
    for s in ("Top spot!", "race a car", "No lemon, no melon", "?!"):
        print(f"palindrome {s!r:<22} -> {is_palindrome(s)}")

    print("\n== 10. Check yourself ==")
    print("pair_sum([1, 2, 4, 7, 11], 15) =", pair_sum([1, 2, 4, 7, 11], 15))
    k, arr = remove_dups([0, 0, 1, 1, 1, 2])
    print(f"remove_dups([0, 0, 1, 1, 1, 2]) -> k = {k}, nums[:k] = {arr[:k]}")
    print("3Sum n = 100 above: two pointer and brute counts in section 8")


if __name__ == "__main__":
    main()
