"""Greedy pattern lesson: every number on the page comes from this script.

Run:  python3 patterns/greedy/measure.py

Counting rules (the page's JavaScript uses the same ones):
  Kadane steps        = how many times `cur = max(x, cur + x)` runs (once per number)
  brute subarray sums = how many times `total += nums[j]` runs (once per subarray)
  reach steps         = how many times `if i > reach` runs before can_jump returns
  brute jump marks    = how many times the brute force marks a landing spot (`ok[i + j] = True` attempts)
  interval checks     = how many times `if s >= end` runs (once per interval, after the sort)
"""
import math
import random
from itertools import combinations


# ---------- Template A: running sum, restart when it hurts (Kadane) ----------
def max_subarray(nums):
    best = nums[0]
    cur = 0
    steps = 0
    for x in nums:
        steps += 1
        cur = max(x, cur + x)      # extend the run, or restart at x
        best = max(best, cur)
    return best, steps


def max_subarray_brute(nums):
    best = nums[0]
    sums = 0
    for i in range(len(nums)):
        total = 0
        for j in range(i, len(nums)):
            sums += 1
            total += nums[j]
            best = max(best, total)
    return best, sums


def kadane_trap(nums):
    best = 0                       # wrong: assumes the answer is at least 0
    cur = 0
    for x in nums:
        cur = max(0, cur + x)
        best = max(best, cur)
    return best


# ---------- Template B: reach pointer (Jump Game) ----------
def can_jump(nums):
    reach = 0
    steps = 0
    for i, step in enumerate(nums):
        steps += 1
        if i > reach:
            return False, steps
        reach = max(reach, i + step)
    return True, steps


def can_jump_brute(nums):
    n = len(nums)
    ok = [False] * n
    ok[0] = True
    marks = 0
    for i in range(n):
        if ok[i]:
            for j in range(1, nums[i] + 1):
                if i + j < n:
                    marks += 1
                    ok[i + j] = True
    return ok[-1], marks


def can_jump_trap(nums):
    reach = 0
    for i, step in enumerate(nums):
        reach = max(reach, i + step)   # wrong: never asks "can I even stand on i?"
    return reach >= len(nums) - 1


def min_jumps(nums):
    jumps, end, far = 0, 0, 0
    for i in range(len(nums) - 1):
        far = max(far, i + nums[i])
        if i == end:
            jumps += 1
            end = far
    return jumps


# ---------- Template C: sort by end, take if it fits ----------
def max_meetings(intervals):
    count, end = 0, float("-inf")
    checks = 0
    for s, e in sorted(intervals, key=lambda iv: iv[1]):
        checks += 1
        if s >= end:
            count += 1
            end = e
    return count, checks


def max_meetings_by_start(intervals):
    count, end = 0, float("-inf")
    for s, e in sorted(intervals):        # wrong: sorts by start
        if s >= end:
            count += 1
            end = e
    return count


def max_meetings_brute(intervals):
    n = len(intervals)
    best, subsets = 0, 0
    for k in range(n + 1):
        for pick in combinations(intervals, k):
            subsets += 1
            ivs = sorted(pick)
            if all(ivs[t][1] <= ivs[t + 1][0] for t in range(len(ivs) - 1)):
                best = max(best, k)
    return best, subsets


# ---------- Coins: greedy vs the true best ----------
def greedy_coins(coins, amount):
    picks = []
    for c in sorted(coins, reverse=True):
        take = amount // c
        picks += [c] * take
        amount -= take * c
    return picks if amount == 0 else None


def best_coins(coins, amount):
    INF = float("inf")
    dp = [0] + [INF] * amount
    last = [0] * (amount + 1)
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and dp[a - c] + 1 < dp[a]:
                dp[a] = dp[a - c] + 1
                last[a] = c
    if dp[amount] == INF:
        return None
    picks, a = [], amount
    while a:
        picks.append(last[a])
        a -= last[a]
    return sorted(picks, reverse=True)


def main():
    print("== 1. Picture example: max subarray ==")
    pic = [2, -3, 4, -1, 2, -5, 3]
    print(f"nums = {pic}")
    print(f"kadane -> {max_subarray(pic)}   # (best, steps)")
    print(f"brute  -> {max_subarray_brute(pic)}   # (best, subarray sums)")
    cur, run = 0, []
    for x in pic:
        cur = max(x, cur + x)
        run.append(cur)
    print(f"cur after each number = {run}")

    print("\n== 2. Coins: greedy vs best ==")
    sets = {"[1, 5, 10, 25]": [1, 5, 10, 25], "[1, 3, 4]": [1, 3, 4], "[1, 7, 10]": [1, 7, 10], "[1, 10, 25]": [1, 10, 25]}
    for name, coins in sets.items():
        losses = [a for a in range(1, 41) if len(greedy_coins(coins, a)) > len(best_coins(coins, a))]
        first = losses[0] if losses else None
        print(f"{name:<15} amounts 1..40 where greedy loses: {len(losses):>2}   first loss: {first}", end="")
        if first:
            print(f"  greedy {greedy_coins(coins, first)} ({len(greedy_coins(coins, first))})  best {best_coins(coins, first)} ({len(best_coins(coins, first))})")
        else:
            print()
    print("[1, 3, 4] amount 6: greedy", greedy_coins([1, 3, 4], 6), " best", best_coins([1, 3, 4], 6))
    print("[1, 5, 10, 25] amount 6: greedy", greedy_coins([1, 5, 10, 25], 6), " best", best_coins([1, 5, 10, 25], 6))
    print("[1, 5, 10, 25] amount 41: greedy", greedy_coins([1, 5, 10, 25], 41), " best", best_coins([1, 5, 10, 25], 41))

    print("\n== 3. Template B: reach pointer ==")
    for nums in ([3, 1, 0, 2, 0, 1], [2, 1, 0, 3, 1]):
        print(f"can_jump({nums}) = {can_jump(nums)}   brute = {can_jump_brute(nums)}   # (answer, steps) / (answer, marks)")
    print("min_jumps([3, 1, 0, 2, 0, 1]) =", min_jumps([3, 1, 0, 2, 0, 1]))

    print("\n== 4. Template C: sort by end ==")
    ivs = [[5, 9], [1, 3], [6, 8], [2, 5], [8, 10], [4, 6]]
    print(f"intervals = {ivs}")
    print(f"sorted by end = {sorted(ivs, key=lambda iv: iv[1])}")
    print(f"max_meetings -> {max_meetings(ivs)}   # (count, checks)")
    print(f"brute subsets -> {max_meetings_brute(ivs)}   # (best, subsets tried)")

    print("\n== 5. Traps ==")
    print("greedy_coins([1, 3, 4], 6) =", len(greedy_coins([1, 3, 4], 6)), "coins; best =", len(best_coins([1, 3, 4], 6)))
    t = [[1, 10], [2, 3], [4, 5]]
    print(f"by start {t} -> {max_meetings_by_start(t)}   by end -> {max_meetings(t)[0]}")
    print("kadane_trap([-3, -1, -2]) =", kadane_trap([-3, -1, -2]), "  fixed =", max_subarray([-3, -1, -2])[0])
    print("can_jump_trap([0, 1]) =", can_jump_trap([0, 1]), "  fixed =", can_jump([0, 1])[0])

    print("\n== 6. Race: Kadane steps vs brute subarray sums ==")
    for n in (10, 100, 1000, 2000):
        nums = [(-1) ** k * k for k in range(n)]
        _, k = max_subarray(nums)
        _, b = max_subarray_brute(nums)
        print(f"n = {n:>4}: kadane steps = {k:>5}   brute sums = {b:>8}   ratio = {b / k:.1f}x")
    print(f"sort cost estimate n log2 n at n = 1000: {1000 * math.log2(1000):.0f}")
    print("coin DP work for amount 40 with 3 coins:", 40 * 3, "checks")

    print("\n== 7. Random check: greedy templates agree with brute force ==")
    rng = random.Random(16)
    bad = 0
    for _ in range(300):
        n = rng.randint(1, 9)
        nums = [rng.randint(-9, 9) for _ in range(n)]
        bad += max_subarray(nums)[0] != max_subarray_brute(nums)[0]
        jn = [rng.randint(0, 3) for _ in range(n)]
        bad += can_jump(jn)[0] != can_jump_brute(jn)[0]
        iv = []
        for _ in range(rng.randint(0, 7)):
            s = rng.randint(0, 12)
            iv.append([s, s + rng.randint(1, 5)])
        bad += max_meetings(iv)[0] != max_meetings_brute(iv)[0]
    print("mismatches over 300 random cases x 3 templates:", bad)

    print("\n== 8. Check yourself ==")
    print("max_subarray([-3, -1, -2]) =", max_subarray([-3, -1, -2]))
    print("can_jump([1, 0, 1]) =", can_jump([1, 0, 1]))
    print("[1, 10, 25] amount 30: greedy", greedy_coins([1, 10, 25], 30), " best", best_coins([1, 10, 25], 30))

    sf = [[1, 5], [4, 7], [6, 10]]
    booked = []
    for s, e in sorted(sf, key=lambda iv: iv[1] - iv[0]):   # shortest first: the wrong rule
        if all(e <= a or s >= b for a, b in booked):
            booked.append((s, e))
    print(f"shortest first on {sf} -> {len(booked)} {booked}   earliest end -> {max_meetings(sf)[0]}   brute -> {max_meetings_brute(sf)[0]}")

    print("\n== 10. Spot-the-pattern look-alikes ==")
    print("coins [1, 6, 9] amount 12: greedy", greedy_coins([1, 6, 9], 12), " best", best_coins([1, 6, 9], 12))
    items = [(6, 30), (5, 20), (5, 20)]   # (kg, value), bag 10 kg
    cap, got = 10, 0
    for w, v in sorted(items, key=lambda it: it[1] / it[0], reverse=True):
        if w <= cap:
            cap -= w
            got += v
    best_val = max(sum(v for _, v in pick) for k in range(4) for pick in combinations(items, k) if sum(w for w, _ in pick) <= 10)
    print(f"knapsack {items} bag 10: greedy by value per kg = {got}   best = {best_val}")
    print("subsets of 20 meetings =", 2 ** 20)

    print("\n== 11. Sandbox examples ==")
    for name, nums in {"mixed": [2, -3, 4, -1, 2, -5, 3], "all negative": [-4, -2, -7, -1], "all positive": [3, 1, 4, 1, 5], "dip then climb": [5, -9, 6, -2, 3]}.items():
        print(f"max subarray {name:<15} {str(nums):<26} best/steps = {max_subarray(nums)}  brute sums = {max_subarray_brute(nums)[1]}")
    for name, nums in {"reachable": [3, 1, 0, 2, 0, 1], "stuck": [2, 1, 0, 3, 1], "one spot": [0], "big first jump": [6, 0, 0, 0, 0, 0, 0]}.items():
        print(f"jump {name:<15} {str(nums):<24} reach = {can_jump(nums)}  brute marks = {can_jump_brute(nums)[1]}")


if __name__ == "__main__":
    main()
