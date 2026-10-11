"""1D Dynamic Programming pattern lesson: every number on the page comes from this script.

Run:  python3 patterns/dp-1d/measure.py

Counting rules (the page's JavaScript uses the same ones):
  naive calls   = how many times the plain recursive function is entered (base cases included)
  memo calls    = how many times the memoised function is entered (cache hits included)
  cells filled  = how many dp cells the bottom-up loop writes (base cells included)
  sandbox naive counts stop at CAP calls and are then reported as "over CAP"
"""
import platform
import subprocess
import sys
import time
from functools import cache

CAP = 1_000_000


# ---------- climbing stairs (steps of 1 or 2), base: climb(1) = 1, climb(2) = 2 ----------
def climb_naive(n, cnt):
    cnt[0] += 1
    if n <= 2:
        return n
    return climb_naive(n - 1, cnt) + climb_naive(n - 2, cnt)


def climb_memo(n, memo, cnt):
    cnt[0] += 1
    if n <= 2:
        return n
    if n in memo:
        return memo[n]
    memo[n] = climb_memo(n - 1, memo, cnt) + climb_memo(n - 2, memo, cnt)
    return memo[n]


def climb_memo_depth(n):
    memo, deepest = {}, [0]

    def go(k, d):
        deepest[0] = max(deepest[0], d)
        if k <= 2:
            return k
        if k in memo:
            return memo[k]
        memo[k] = go(k - 1, d + 1) + go(k - 2, d + 1)
        return memo[k]
    go(n, 1)
    return deepest[0]


def climb_table(n):
    if n <= 2:
        return n, [0, 1, 2][: n + 1], n
    dp = [0] * (n + 1)
    dp[1], dp[2] = 1, 2
    for i in range(3, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n], dp, n  # cells filled: dp[1] .. dp[n]


def climb_two_vars(n):
    if n <= 2:
        return n
    prev, cur = 1, 2
    for _ in range(3, n + 1):
        prev, cur = cur, prev + cur
    return cur


def naive_calls(n):
    c = [0]
    v = climb_naive(n, c)
    return v, c[0]


def memo_calls(n):
    c = [0]
    v = climb_memo(n, {}, c)
    return v, c[0]


def tree_info(n):
    """Calls in the naive tree, distinct arguments, repeated calls (a call whose argument appeared earlier in the tree)."""
    order = []

    def go(k):
        order.append(k)
        if k <= 2:
            return
        go(k - 1)
        go(k - 2)

    go(n)
    seen, repeats = set(), 0
    for k in order:
        if k in seen:
            repeats += 1
        seen.add(k)
    return len(order), len(set(order)), repeats


# ---------- variants ----------
def rob(nums):
    dp = [0] * (len(nums) + 1)
    if nums:
        dp[1] = nums[0]
    for i in range(2, len(nums) + 1):
        dp[i] = max(dp[i - 1], dp[i - 2] + nums[i - 1])
    return dp[-1], dp


def rob_even_odd(nums):
    return sum(nums[0::2]), sum(nums[1::2])


def rob_greedy_biggest(nums):
    taken, s = set(), 0
    for i in sorted(range(len(nums)), key=lambda i: (-nums[i], i)):
        if i - 1 not in taken and i + 1 not in taken:
            taken.add(i)
            s += nums[i]
    return s


def coin_change(coins, amount, base=0):
    INF = float("inf")
    dp = [INF] * (amount + 1)
    if base == 0:
        dp[0] = 0
    tries = 0
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a:
                tries += 1
                dp[a] = min(dp[a], dp[a - c] + 1)
    ans = dp[amount] if dp[amount] != INF else -1
    return ans, dp, tries


def coin_greedy(coins, amount):
    used = []
    for c in sorted(coins, reverse=True):
        while amount >= c:
            amount -= c
            used.append(c)
    return used if amount == 0 else None


def lis(nums):
    dp = [1] * len(nums)
    comps = 0
    for i in range(len(nums)):
        for j in range(i):
            comps += 1
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return (max(dp) if dp else 0), dp, comps


def word_break(s, words):
    ok = [False] * (len(s) + 1)
    ok[0] = True
    for i in range(1, len(s) + 1):
        for j in range(i):
            if ok[j] and s[j:i] in words:
                ok[i] = True
                break
    return ok[-1], ok


def min_cost_stairs(cost):
    n = len(cost)
    dp = [0] * (n + 1)
    for i in range(2, n + 1):
        dp[i] = min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2])
    return dp[n], dp


# ---------- sandbox: the three modes, bottom-up and naive (capped) ----------
class Stop(Exception):
    pass


def capped(fn):
    cnt = [0]

    def tick():
        cnt[0] += 1
        if cnt[0] > CAP:
            raise Stop

    try:
        fn(tick)
        return cnt[0]
    except Stop:
        return None


def sb_stairs(n, steps):
    dp = [0] * (n + 1)
    dp[0] = 1
    for i in range(1, n + 1):
        for s in steps:
            if s <= i:
                dp[i] += dp[i - s]

    def naive(tick):
        def ways(k):
            tick()
            if k == 0:
                return 1
            return sum(ways(k - s) for s in steps if s <= k)
        ways(n)
    return dp[n], len(dp), capped(naive)


def sb_rob(nums):
    best, dp = rob(nums)

    def naive(tick):
        def go(i):
            tick()
            if i >= len(nums):
                return 0
            return max(go(i + 1), nums[i] + go(i + 2))
        go(0)
    return best, len(dp), capped(naive)


def sb_coins(coins, amount):
    ans, dp, _ = coin_change(coins, amount)

    def naive(tick):
        def fewest(a):
            tick()
            if a == 0:
                return 0
            best = float("inf")
            for c in coins:
                if c <= a:
                    best = min(best, fewest(a - c) + 1)
            return best
        fewest(amount)
    return ans, len(dp), capped(naive)


def machine():
    try:
        cpu = subprocess.run(["sysctl", "-n", "machdep.cpu.brand_string"], capture_output=True, text=True).stdout.strip()
    except OSError:
        cpu = ""
    return f"{cpu or platform.processor()}, {platform.system()} {platform.machine()}, Python {platform.python_version()}"


def main():
    print("== 1. Picture: climb(5) ==")
    v, calls = naive_calls(5)
    ans, dp, cells = climb_table(5)
    print(f"answer = {v}   naive calls = {calls}   tree (calls, distinct, repeats) = {tree_info(5)}")
    print(f"bottom-up dp = {dp}   cells filled = {cells}   two-variable answer = {climb_two_vars(5)}")

    print("\n== 2. Recursion tree slider (n = 3 .. 9) ==")
    for n in range(3, 10):
        c, d, r = tree_info(n)
        print(f"n = {n}: ways = {naive_calls(n)[0]:>3}   naive calls = {c:>3}   distinct = {d}   repeated calls = {r}")

    print("\n== 3. Operation counts (naive calls / memo calls / bottom-up cells) ==")
    for n in (5, 10, 20, 30, 40):
        if n <= 30:
            v, c = naive_calls(n)
        else:
            c = tree_info(n)[0] if n <= 30 else None
            # count without building the tree: calls(n) = 1 + calls(n-1) + calls(n-2)
            f = {1: 1, 2: 1}
            for k in range(3, n + 1):
                f[k] = 1 + f[k - 1] + f[k - 2]
            c = f[n]
            v = climb_two_vars(n)
        m = memo_calls(n)[1]
        print(f"n = {n:>2}: ways = {v:>11,}  naive = {c:>11,}  memo = {m:>2}  cells = {n}")
        print(f"        repeated naive calls (calls - n) = {c - n:,}")
    print("memo calls formula check 2n - 3:", all(memo_calls(n)[1] == 2 * n - 3 for n in range(3, 40)))

    print("\n== 4. Timing (machine dependent) ==")
    print("machine:", machine())
    t0 = time.perf_counter()
    naive_calls(30)
    t1 = time.perf_counter()
    for _ in range(1000):
        climb_two_vars(30)
    t2 = time.perf_counter()
    print(f"naive climb(30): {t1 - t0:.2f} s   two-variable climb(30): {(t2 - t1) / 1000 * 1e6:.2f} us")

    print("\n== 5. Memo trace climb(5) ==")
    memo, c = {}, [0]
    climb_memo(5, memo, c)
    print(f"memo calls = {c[0]}   memo = {dict(sorted(memo.items()))}   deepest call stack = {climb_memo_depth(5)}")

    print("\n== 6. House robber playground ==")
    houses = [4, 2, 3, 7, 8, 7, 1]
    best, dp = rob(houses)
    print(f"houses = {houses}  best = {best}  dp = {dp}")
    print(f"every other (even, odd) = {rob_even_odd(houses)}   biggest-first greedy = {rob_greedy_biggest(houses)}")
    print("check-yourself rob([5, 1, 1, 5]) =", rob([5, 1, 1, 5]))

    print("\n== 7. Coin change [1, 3, 4] -> 6 ==")
    ans, dp, tries = coin_change([1, 3, 4], 6)
    print(f"dp answer = {ans}   dp = {dp}   coin tries = {tries}")
    print(f"greedy biggest-first = {coin_greedy([1, 3, 4], 6)}")
    ans0, dp0, _ = coin_change([1, 3, 4], 6, base=None)
    print(f"trap: forgot dp[0] = 0 -> answer {ans0}   dp = {dp0}")
    print("coins [2] amount 3 ->", coin_change([2], 3)[:2])

    print("\n== 8. LIS ==")
    for arr in ([2, 5, 3, 7, 1, 8], [3, 4, 1]):
        best, dp, comps = lis(arr)
        print(f"lis({arr}) = {best}   dp = {dp}   dp[-1] = {dp[-1]}   comparisons = {comps}")
    print("comparisons for n = 1000:", lis(list(range(1000)))[2])

    print("\n== 9. Word break ==")
    print('word_break("sunflowerpot") ->', word_break("sunflowerpot", {"sun", "flower", "sunflower", "pot", "flow"}))
    print('word_break("sunflowerpo") ->', word_break("sunflowerpo", {"sun", "flower", "sunflower", "pot", "flow"})[0])

    print("\n== 10. Min cost climbing stairs (check yourself) ==")
    print("min_cost([5, 10, 3, 8]) =", min_cost_stairs([5, 10, 3, 8]))

    print("\n== 11. Recursion depth trap ==")
    print("recursion limit:", sys.getrecursionlimit())

    @cache
    def climb_c(n):
        if n <= 2:
            return n
        return climb_c(n - 1) + climb_c(n - 2)

    try:
        climb_c(5000)
        print("climb_c(5000) ok")
    except RecursionError as e:
        print("climb_c(5000) -> RecursionError:", e)
    print("two-variable climb(5000) has", len(str(climb_two_vars(5000))), "digits")

    print("\n== 12. Sandbox examples (answer, cells filled, naive calls or None if over CAP) ==")
    print("stairs n=7 steps [1, 2]   ->", sb_stairs(7, [1, 2]))
    print("stairs n=8 steps [1, 3, 5]->", sb_stairs(8, [1, 3, 5]))
    print("stairs n=25 steps [1, 2]  ->", sb_stairs(25, [1, 2]))
    print("stairs n=30 steps [1, 2]  ->", sb_stairs(30, [1, 2]))
    print("rob [4, 2, 3, 7, 8, 7, 1]  ->", sb_rob([4, 2, 3, 7, 8, 7, 1]))
    print("rob [2, 1, 1, 2]          ->", sb_rob([2, 1, 1, 2]))
    print("coins [1, 3, 4] -> 6       ->", sb_coins([1, 3, 4], 6))
    print("coins [2] -> 3             ->", sb_coins([2], 3))
    print("coins [1, 2, 5] -> 11      ->", sb_coins([1, 2, 5], 11))


if __name__ == "__main__":
    main()
