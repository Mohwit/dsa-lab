"""Binary Search pattern lesson: every number on the page comes from this script.

Run:  python3 patterns/binary-search/measure.py

Counting rules (the page's JavaScript uses the same ones):
  binary probes  = how many times the loop body runs (each run reads one middle item)
  linear checks  = how many times `nums[i] == target` runs (it stops at the first match)
  guesses        = higher/lower game on 1..100, always guessing the middle (lo + hi) // 2
  feasible calls = how many times feasible(k) runs in the search on the answer
"""


def search(nums, target):
    """Template A: exact match. Returns (index or -1, probes)."""
    lo, hi = 0, len(nums) - 1
    probes = 0
    while lo <= hi:
        probes += 1
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid, probes
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1, probes


def linear(nums, target):
    checks = 0
    for i in range(len(nums)):
        checks += 1
        if nums[i] == target:
            return i, checks
    return -1, checks


class Virtual:
    """A sorted 'list' with value 2 * i at index i, so huge n needs no memory."""

    def __init__(self, n):
        self.n = n

    def __len__(self):
        return self.n

    def __getitem__(self, i):
        if not 0 <= i < self.n:
            raise IndexError(i)
        return 2 * i


def lower_bound(nums, target):
    """Template B: first index with nums[i] >= target (len(nums) if none). Returns (index, probes)."""
    lo, hi = 0, len(nums)
    probes = 0
    while lo < hi:
        probes += 1
        mid = (lo + hi) // 2
        if nums[mid] >= target:
            hi = mid
        else:
            lo = mid + 1
    return lo, probes


def hours_needed(piles, k):
    return sum((p + k - 1) // k for p in piles)


def min_speed(piles, h):
    """Template C: search on the answer. Returns (speed, feasible calls, tried speeds)."""
    calls = 0
    tried = []

    def feasible(k):
        nonlocal calls
        calls += 1
        tried.append(k)
        return hours_needed(piles, k) <= h

    lo, hi = 1, max(piles)
    while lo < hi:
        mid = (lo + hi) // 2
        if feasible(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo, calls, tried


def rotated_min(nums):
    """First index i with nums[i] <= nums[-1] (template B with that test). Returns (index, probes)."""
    lo, hi = 0, len(nums) - 1
    probes = 0
    while lo < hi:
        probes += 1
        mid = (lo + hi) // 2
        if nums[mid] <= nums[-1]:
            hi = mid
        else:
            lo = mid + 1
    return lo, probes


def rotated_search(nums, target, strict=False):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        left_sorted = nums[lo] < nums[mid] if strict else nums[lo] <= nums[mid]
        if left_sorted:
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1


def game_guesses(secret, lo=1, hi=100):
    g = 0
    while True:
        g += 1
        mid = (lo + hi) // 2
        if mid == secret:
            return g
        if mid < secret:
            lo = mid + 1
        else:
            hi = mid - 1


def main():
    print("== 1. Guessing game 1..100, always guess the middle ==")
    counts = [game_guesses(s) for s in range(1, 101)]
    print(f"worst case = {max(counts)} guesses, average = {sum(counts) / 100:.2f}, secrets found in exactly 7 = {counts.count(7)}")
    print(f"secret 37 -> {game_guesses(37)} guesses, secret 50 -> {game_guesses(50)}, secret 100 -> {game_guesses(100)}")

    print("\n== 2. Picture example ==")
    pic = [3, 8, 12, 17, 21, 26, 30, 34, 39, 45, 51, 58]
    print(f"nums = {pic}")
    print(f"target 58: linear {linear(pic, 58)}  binary {search(pic, 58)}   # (index, count)")
    print(f"target 40: linear {linear(pic, 40)}  binary {search(pic, 40)}")

    print("\n== 3. Race: target bigger than everything (worst case for both), value at i is 2i ==")
    for n in (16, 1000, 10**6):
        v = Virtual(n)
        _, lc = linear(v, 2 * n + 1)
        _, bp = search(v, 2 * n + 1)
        print(f"n = {n:>7}: linear checks = {lc:>7}   binary probes = {bp:>2}   ratio = {lc / bp:,.1f}x")
    for n in (10, 100, 1000, 10**6, 10**9, 10**18):
        print(f"n = {n:>19}: binary probes (worst) = {search(Virtual(n), 2 * n + 1)[1]}")
    print("doubling n:", [(2 ** k, search(Virtual(2 ** k), 2 ** (k + 1) + 1)[1]) for k in range(0, 6)])

    print("\n== 4. Lower bound ==")
    lb = [1, 3, 3, 3, 5, 8, 9]
    for t in (3, 4, 10, 0):
        print(f"lower_bound({lb}, {t}) = {lower_bound(lb, t)}   # (index, probes)")

    print("\n== 5. Search on the answer ==")
    piles, h = [4, 9, 5, 12], 7
    print(f"piles = {piles}, h = {h}")
    print("hours by speed:", {k: hours_needed(piles, k) for k in range(1, max(piles) + 1)})
    print("min_speed ->", min_speed(piles, h), "  # (speed, feasible calls, speeds tried)")
    big = [10**9, 7, 123456789]
    print(f"piles {big}, h = 3 -> {min_speed(big, 3)[:2]};  h = 5 -> {min_speed(big, 5)[:2]}   # (speed, feasible calls)")
    print(f"linear try k = 1, 2, ...: first feasible after {next(k for k in range(1, 13) if hours_needed(piles, k) <= h)} calls")

    print("\n== 6. Rotated ==")
    rot = [6, 7, 9, 1, 2, 4, 5]
    print(f"rotated_min({rot}) = {rotated_min(rot)}")
    print(f"rotated_search({rot}, 2) = {rotated_search(rot, 2)}, target 7 -> {rotated_search(rot, 7)}, target 3 -> {rotated_search(rot, 3)}")
    print(f"strict '<' bug on [3, 1], target 1 -> {rotated_search([3, 1], 1, strict=True)}   fixed '<=' -> {rotated_search([3, 1], 1)}")

    print("\n== 7. Traps ==")
    # Trap 1: lo = mid with a round-down mid
    nums, target = [1, 3], 5
    lo, hi, rounds = 0, len(nums) - 1, 0
    while lo < hi and rounds < 1000:
        rounds += 1
        mid = (lo + hi) // 2
        if nums[mid] <= target:
            lo = mid
        else:
            hi = mid - 1
    print(f"last <= target with lo = mid, round-down mid on {nums}, target {target}: after {rounds} rounds lo = {lo}, hi = {hi} (stuck)")
    lo, hi, rounds = 0, len(nums) - 1, 0
    while lo < hi:
        rounds += 1
        mid = (lo + hi + 1) // 2
        if nums[mid] <= target:
            lo = mid
        else:
            hi = mid - 1
    print(f"fixed with mid = (lo + hi + 1) // 2: {rounds} rounds, answer index {lo}")

    # Trap 2: hi = len(nums) with lo <= hi
    def search_bad_hi(nums, target):
        lo, hi = 0, len(nums)
        while lo <= hi:
            mid = (lo + hi) // 2
            if nums[mid] == target:
                return mid
            if nums[mid] < target:
                lo = mid + 1
            else:
                hi = mid - 1
        return -1

    try:
        search_bad_hi([1, 3, 5], 9)
    except IndexError as e:
        print(f"hi = len(nums) with lo <= hi on [1, 3, 5], target 9 -> IndexError: {e}")
    print(f"fixed hi = len(nums) - 1 -> {search([1, 3, 5], 9)[0]}")

    # Trap 3: mixing templates
    nums, target = [1, 3, 5], 3
    lo, hi, rounds = 0, len(nums) - 1, 0
    while lo <= hi and rounds < 1000:
        rounds += 1
        mid = (lo + hi) // 2
        if nums[mid] >= target:
            hi = mid
        else:
            lo = mid + 1
    print(f"lo <= hi with hi = mid on {nums}, target {target}: after {rounds} rounds lo = {lo}, hi = {hi} (stuck)")
    print(f"fixed lo < hi, hi = len(nums): {lower_bound(nums, target)}")

    # Trap 5: lo = 0 in search on the answer
    def min_speed_lo0(piles, h):
        lo, hi = 0, max(piles)
        while lo < hi:
            mid = (lo + hi) // 2
            if hours_needed(piles, mid) <= h:
                hi = mid
            else:
                lo = mid + 1
        return lo

    try:
        min_speed_lo0([1, 1], 5)
    except ZeroDivisionError as e:
        print(f"lo = 0 on piles [1, 1], h = 5 -> ZeroDivisionError: {e}")
    print(f"fixed lo = 1 -> {min_speed([1, 1], 5)[0]}")

    print("\n== 8. Check yourself ==")
    print(f"max probes for n = 1000: {max(search(list(range(1000)), t)[1] for t in range(-1, 1001))}")
    print(f"lower_bound([1, 3, 3, 5, 8], 4) = {lower_bound([1, 3, 3, 5, 8], 4)}")
    print(f"min_speed([3, 8, 6], 6) = {min_speed([3, 8, 6], 6)}, hours: {[hours_needed([3, 8, 6], k) for k in range(1, 9)]}")

    print("\n== 9. Sandbox examples ==")
    ex = [("hit at the end", pic, 58), ("not there", pic, 40), ("first item", pic, 3), ("one item", [5], 5), ("empty", [], 4)]
    for name, nums, t in ex:
        print(f"exact {name:<17} target {t:<3} -> binary {search(nums, t)}  linear {linear(nums, t)}")
    for nums, t in (([1, 3, 3, 3, 5, 8, 9], 3), ([1, 3, 3, 3, 5, 8, 9], 4), ([1, 3, 3, 3, 5, 8, 9], 10), ([2, 2, 2, 2], 2)):
        print(f"lower bound {nums} target {t} -> {lower_bound(nums, t)}")
    for piles, h in (([4, 9, 5, 12], 7), ([4, 9, 5, 12], 4), ([30, 11, 23, 4, 20], 6), ([1, 1], 5)):
        print(f"speed piles {piles} h {h} -> {min_speed(piles, h)[:2]}")


if __name__ == "__main__":
    main()
