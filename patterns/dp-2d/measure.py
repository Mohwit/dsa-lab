"""2D Dynamic Programming pattern lesson: every number on the page comes from this script.

Run:  python3 patterns/dp-2d/measure.py

Counting rules (the page's JavaScript uses the same ones):
  naive calls  = how many times the plain recursive function is entered (base cases included)
  table cells  = rows x columns of the dp table (base row and column included)
  computed     = cells filled by the transition (the inner loop body), base cells excluded
  sandbox naive counts stop at CAP calls and are then reported as "over CAP"
"""
import itertools
import sys
from math import comb

CAP = 1_000_000


# ---------- grid paths ----------
def paths_naive(r, c, cnt, visits=None):
    cnt[0] += 1
    if visits is not None:
        visits[r][c] += 1
    if r == 0 or c == 0:
        return 1
    return paths_naive(r - 1, c, cnt, visits) + paths_naive(r, c - 1, cnt, visits)


def unique_paths(m, n):
    dp = [[1] * n for _ in range(m)]
    for r in range(1, m):
        for c in range(1, n):
            dp[r][c] = dp[r - 1][c] + dp[r][c - 1]
    return dp[m - 1][n - 1], dp


def unique_paths_row(m, n):
    dp = [1] * n
    for _ in range(1, m):
        for c in range(1, n):
            dp[c] += dp[c - 1]
    return dp[-1]


def paths_with_rocks(m, n, rocks):
    dp = [[0] * n for _ in range(m)]
    for r in range(m):
        for c in range(n):
            if (r, c) in rocks:
                dp[r][c] = 0
            elif r == 0 and c == 0:
                dp[r][c] = 1
            else:
                dp[r][c] = (dp[r - 1][c] if r else 0) + (dp[r][c - 1] if c else 0)
    return dp[m - 1][n - 1], dp


# ---------- two strings ----------
def lcs(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n], dp


def lcs_no_empty_row(a, b):
    """The off-by-one trap: no empty-prefix row or column, so i - 1 = -1 wraps to the last row."""
    m, n = len(a), len(b)
    dp = [[0] * n for _ in range(m)]
    for i in range(m):
        for j in range(n):
            if a[i] == b[j]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[-1][-1]


def edit(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    return dp[m][n], dp


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


def lcs_naive_calls(a, b):
    def run(tick):
        def go(i, j):
            tick()
            if i == len(a) or j == len(b):
                return 0
            if a[i] == b[j]:
                return 1 + go(i + 1, j + 1)
            return max(go(i + 1, j), go(i, j + 1))
        go(0, 0)
    return capped(run)


def edit_naive_calls(a, b):
    def run(tick):
        def go(i, j):
            tick()
            if i == len(a):
                return len(b) - j
            if j == len(b):
                return len(a) - i
            if a[i] == b[j]:
                return go(i + 1, j + 1)
            return 1 + min(go(i + 1, j), go(i, j + 1), go(i + 1, j + 1))
        go(0, 0)
    return capped(run)


# ---------- position x budget ----------
def change_table(amount, coins):
    dp = [[0] * (amount + 1) for _ in range(len(coins) + 1)]
    for i in range(len(coins) + 1):
        dp[i][0] = 1
    for i in range(1, len(coins) + 1):
        c = coins[i - 1]
        for a in range(1, amount + 1):
            dp[i][a] = dp[i - 1][a]
            if a >= c:
                dp[i][a] += dp[i][a - c]
    return dp[len(coins)][amount], dp


def change_row(amount, coins):
    dp = [1] + [0] * amount
    for c in coins:
        for a in range(c, amount + 1):
            dp[a] += dp[a - c]
    return dp[amount]


def change_amount_outer(amount, coins):
    dp = [1] + [0] * amount
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a:
                dp[a] += dp[a - c]
    return dp[amount]


def can_sum(nums, target, backwards=True):
    dp = [True] + [False] * target
    for x in nums:
        rng = range(target, x - 1, -1) if backwards else range(x, target + 1)
        for t in rng:
            dp[t] = dp[t] or dp[t - x]
    return dp[target]


# ---------- interval order trap ----------
def count_pal(s, right_order=True):
    n = len(s)
    pal = [[False] * n for _ in range(n)]
    count = 0
    starts = range(n - 1, -1, -1) if right_order else range(n)
    for i in starts:
        for j in range(i, n):
            if s[i] == s[j] and (j - i < 2 or pal[i + 1][j - 1]):
                pal[i][j] = True
                count += 1
    return count


# ---------- state machine: stock with cooldown ----------
def stock_cooldown(prices):
    hold, sold, rest = float("-inf"), 0, 0
    for p in prices:
        hold, sold, rest = max(hold, rest - p), hold + p, max(rest, sold)
    return max(sold, rest)


def stock_brute(prices):
    # try every action sequence: 0 = wait, 1 = buy, 2 = sell
    best = 0
    n = len(prices)
    for acts in itertools.product(range(3), repeat=n):
        holding, cool, profit, ok = False, False, 0, True
        for p, a in zip(prices, acts):
            if a == 1:
                if holding or cool:
                    ok = False
                    break
                holding, profit = True, profit - p
                cool = False
            elif a == 2:
                if not holding:
                    ok = False
                    break
                holding, profit, cool = False, profit + p, True
                continue
            else:
                cool = False
        if ok and not holding:
            best = max(best, profit)
    return best


def main():
    print("== 1. Picture: unique paths on a 3 x 4 grid ==")
    cnt = [0]
    visits = [[0] * 4 for _ in range(3)]
    v = paths_naive(2, 3, cnt, visits)
    ans, dp = unique_paths(3, 4)
    print(f"paths = {v}   naive calls = {cnt[0]}   visits per cell = {visits}")
    print(f"table = {dp}   cells = {3 * 4}   computed = {(3 - 1) * (4 - 1)}   one-row answer = {unique_paths_row(3, 4)}")

    print("\n== 2. Grid race (rows x cols): naive calls vs table cells ==")
    for m, n in [(3, 3), (3, 7), (5, 5), (8, 8), (10, 10), (12, 12)]:
        c = [0]
        p = paths_naive(m - 1, n - 1, c)
        print(f"{m:>2} x {n:<2}: paths = {p:>7,}   naive calls = {c[0]:>9,}   cells = {m * n:>3}   2*paths-1 = {2 * p - 1:,}   C(m+n-2, m-1) = {comb(m + n - 2, m - 1):,}")

    print("\n== 3. Obstacle playground (4 x 5) ==")
    print("no rocks:", paths_with_rocks(4, 5, set())[0])
    print("rocks at (1, 1) and (2, 3):", paths_with_rocks(4, 5, {(1, 1), (2, 3)}))
    print("rocks at (0, 1) and (1, 0):", paths_with_rocks(4, 5, {(0, 1), (1, 0)})[0])

    print("\n== 4. LCS stone / tones ==")
    v, dp = lcs("stone", "tones")
    print(f"lcs = {v}   cells = {6 * 6}   computed = 25")
    for row in dp:
        print("   ", row)

    print("\n== 5. Edit distance flaw -> lawn ==")
    v, dp = edit("flaw", "lawn")
    print(f"edit = {v}")
    for row in dp:
        print("   ", row)

    print("\n== 6. Coin change II, coins [1, 2, 3], amount 4 ==")
    v, dp = change_table(4, [1, 2, 3])
    print(f"ways = {v}   one-row = {change_row(4, [1, 2, 3])}")
    for row in dp:
        print("   ", row)

    print("\n== 7. Trap: loop order in coin change II, coins [1, 2], amount 3 ==")
    print("coins outer (combinations) =", change_row(3, [1, 2]))
    print("amount outer (orders)      =", change_amount_outer(3, [1, 2]))

    print("\n== 8. Trap: one-row 0/1 subset sum, nums [3], target 6 ==")
    print("forwards  =", can_sum([3], 6, backwards=False), "  # used the 3 twice")
    print("backwards =", can_sum([3], 6, backwards=True))

    print("\n== 9. Trap: interval fill order, count palindromic substrings ==")
    for s in ("aaaa", "abcba"):
        print(f"{s!r}: right order (i from the end) = {count_pal(s, True)}   wrong order (i from 0) = {count_pal(s, False)}")

    print("\n== 10. Trap: LCS without the empty-prefix row ==")
    found = None
    for la in range(1, 5):
        for lb in range(1, 5):
            for a in itertools.product("ab", repeat=la):
                for b in itertools.product("ab", repeat=lb):
                    a2, b2 = "".join(a), "".join(b)
                    if lcs_no_empty_row(a2, b2) != lcs(a2, b2)[0]:
                        found = found or (a2, b2)
    print("smallest failing pair found:", found, "->", lcs_no_empty_row(*found), "instead of", lcs(*found)[0])
    print("lcs_no_empty_row('ab', 'ba') =", lcs_no_empty_row("ab", "ba"), " correct =", lcs("ab", "ba")[0])
    print("lcs_no_empty_row('ba', 'ab') =", lcs_no_empty_row("ba", "ab"), " correct =", lcs("ba", "ab")[0])

    print("\n== 11. Stock with cooldown (state machine) ==")
    pr = [3, 1, 4, 2, 5, 0, 3]
    print(f"prices = {pr}   dp = {stock_cooldown(pr)}   brute force = {stock_brute(pr)}")

    print("\n== 12. Complexity ==")
    a, b = "abcdefghij", "klmnopqrst"
    print(f"lcs naive calls on two 10-letter strings with no common letter = {lcs_naive_calls(a, b):,}   2*C(20,10)-1 = {2 * comb(20, 10) - 1:,}   table cells = {11 * 11}")
    print(f"strings of length 1000: table cells = {1001 * 1001:,}, computed = {1000 * 1000:,}")

    print("\n== 13. Check yourself ==")
    print("unique_paths(3, 3) =", unique_paths(3, 3)[0])
    print("unique_paths(3, 7) =", unique_paths(3, 7)[0])
    print("lcs('abc', 'acb') =", lcs("abc", "acb")[0])
    print("edit('sit', 'kiss') =", edit("sit", "kiss")[0])
    print("change_row(5, [2, 3]) =", change_row(5, [2, 3]))

    print("\n== 14. Sandbox examples (answer, cells, naive calls or None if over CAP) ==")
    ex = [("lcs", "stone", "tones"), ("lcs", "abc", "xyz"), ("lcs", "banana", "atana"), ("lcs", "", "abc"),
          ("edit", "flaw", "lawn"), ("edit", "kitten", "sitting"), ("edit", "", "abc"), ("edit", "intention", "attention")]
    for mode, a, b in ex:
        if mode == "lcs":
            v = lcs(a, b)[0]
            nc = lcs_naive_calls(a, b)
        else:
            v = edit(a, b)[0]
            nc = edit_naive_calls(a, b)
        print(f"{mode:<4} {a!r:<12} {b!r:<12} -> answer = {v}   cells = {(len(a) + 1) * (len(b) + 1)}   naive calls = {nc}")


if __name__ == "__main__":
    sys.setrecursionlimit(10000)
    main()
