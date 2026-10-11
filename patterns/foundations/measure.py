"""Big-O and Recursion pattern lesson: every number on the page comes from this script.

Run:  python3 patterns/foundations/measure.py

Counting rules (the page's JavaScript uses the same ones):
  page-by-page checks = how many times `if words[i] == target` runs
  halving checks      = how many times the binary search loop body runs (one mid look each)
  growth counters     = the loop bodies in growth_counts() below, counted one per run
  calls               = how many times a recursive function is entered (cache hits included)
  max depth           = the most calls waiting on the stack at one moment
"""
import platform
import subprocess
import sys
import time


# ---------- section 1: page-by-page vs open in the middle ----------
def linear_search(words, target):
    checks = 0
    for i in range(len(words)):
        checks += 1
        if words[i] == target:
            return i, checks
    return -1, checks


def halving_search(words, target):
    lo, hi, checks = 0, len(words) - 1, 0
    while lo <= hi:
        checks += 1
        mid = (lo + hi) // 2
        if words[mid] == target:
            return mid, checks
        if words[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1, checks


# ---------- section 2: growth counters ----------
def count_log(n):
    ops, k = 0, n
    while k >= 1:          # halve until nothing is left
        ops += 1
        k //= 2
    return ops


def count_subsets(n):
    """Try every keep / skip choice for n items; one op per finished choice list."""
    ops = 0

    def go(i):
        nonlocal ops
        if i == n:
            ops += 1
            return
        go(i + 1)          # skip item i
        go(i + 1)          # keep item i
    go(0)
    return ops


def growth_counts(n, run_expo=True):
    const = 1
    log = count_log(n)
    lin = 0
    for _ in range(n):
        lin += 1
    nlogn = 0
    for _ in range(n):
        nlogn += count_log(n)
    quad = 0
    for _ in range(n):
        for _ in range(n):
            quad += 1
    expo = count_subsets(n) if run_expo else 2 ** n
    return [const, log, lin, nlogn, quad, expo]


# ---------- section 3: recursion ----------
def factorial_trace(n):
    depth = [0, 0]   # current, max
    calls = [0]

    def fact(k):
        calls[0] += 1
        depth[0] += 1
        depth[1] = max(depth[1], depth[0])
        r = 1 if k <= 1 else k * fact(k - 1)
        depth[0] -= 1
        return r
    return fact(n), calls[0], depth[1]


def fib_naive_calls(n):
    calls, depth, maxd = [0], [0], [0]

    def fib(k):
        calls[0] += 1
        depth[0] += 1
        maxd[0] = max(maxd[0], depth[0])
        r = k if k <= 1 else fib(k - 1) + fib(k - 2)
        depth[0] -= 1
        return r
    return fib(n), calls[0], maxd[0]


def fib_memo_calls(n):
    """Same code as the page: memo check first, base case second."""
    calls = [0]

    def fib(k, memo):
        calls[0] += 1
        if k in memo:
            return memo[k]
        if k <= 1:
            return k
        memo[k] = fib(k - 1, memo) + fib(k - 2, memo)
        return memo[k]
    return fib(n, {}), calls[0]


def fib_naive_repeats(n):
    seen = {}

    def fib(k):
        seen[k] = seen.get(k, 0) + 1
        return k if k <= 1 else fib(k - 1) + fib(k - 2)
    fib(n)
    return dict(sorted(seen.items(), reverse=True))


def fast_pow(x, n):
    """Same code as the page's power(x, n). Counts calls and multiplications (half * half, result * x)."""
    calls, mults = [0], [0]

    def power(x, n):
        calls[0] += 1
        if n < 0:
            return 1 / power(x, -n)
        if n == 0:
            return 1
        half = power(x, n // 2)
        mults[0] += 1
        result = half * half
        if n % 2 == 1:
            mults[0] += 1
            result = result * x
        return result
    return power(x, n), calls[0], mults[0]


def slow_pow_twice(n):
    """The trap: pow(x, k // 2) computed twice per call."""
    calls = [0]

    def p(k):
        calls[0] += 1
        if k == 0:
            return 1
        return p(k // 2) * p(k // 2) * (2 if k % 2 else 1)
    p(n)
    return calls[0]


def reverse_rec(s, l, r, depth=1, best=[0]):
    best[0] = max(best[0], depth)
    if l >= r:
        return
    s[l], s[r] = s[r], s[l]
    reverse_rec(s, l + 1, r - 1, depth + 1, best)


def machine():
    try:
        cpu = subprocess.run(["sysctl", "-n", "machdep.cpu.brand_string"], capture_output=True, text=True).stdout.strip()
    except OSError:
        cpu = ""
    return f"{cpu or platform.processor()}, {platform.system()} {platform.machine()}, Python {platform.python_version()}"


def main():
    print("== 1. Page by page vs open in the middle ==")
    words = [2, 5, 8, 12, 16, 23, 38, 41, 56, 63, 72, 85, 91, 97, 99, 104]
    print("words =", words, " target = 97")
    print("page by page ->", linear_search(words, 97), "  # (index, checks)")
    print("halving      ->", halving_search(words, 97))
    for n in (1000, 10**6):
        big = list(range(n))
        print(f"n = {n:>7}: worst page by page = {linear_search(big, n - 1)[1]:>7} checks, worst halving = "
              f"{max(halving_search(big, t)[1] for t in (0, n - 1, -1, n))} checks")

    print("\n== 2. Growth race (counts from running the loops) ==")
    names = ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n^2)", "O(2^n)"]
    print(f"{'n':>4} " + " ".join(f"{x:>11}" for x in names))
    for n in (1, 2, 4, 5, 8, 10, 16, 20):
        print(f"{n:>4} " + " ".join(f"{c:>11,}" for c in growth_counts(n)))
    print("check: 2^n counter equals 2 ** n for n <= 20:", all(count_subsets(n) == 2 ** n for n in range(21)))
    print("doubling n from 10 to 20:")
    a, b = growth_counts(10), growth_counts(20)
    for nm, x, y in zip(names, a, b):
        print(f"  {nm:<11} {x:>9,} -> {y:>11,}   x{y / x:,.1f}")

    print("\n== 2b. Big n (formulas checked above; 2^n not run) ==")
    for n in (1000, 10**5):
        c = growth_counts(n, run_expo=False) if n <= 1000 else [1, count_log(n), n, n * count_log(n), n * n, None]
        print(f"n = {n:>6}: log = {c[1]}, n log n = {c[3]:,}, n^2 = {c[4]:,}")
    # loop speed on this laptop
    reps = 10**7
    t0 = time.perf_counter()
    k = 0
    for _ in range(reps):
        k += 1
    dt = time.perf_counter() - t0
    rate = reps / dt
    print("machine:", machine())
    print(f"simple Python loop: {reps:,} steps in {dt:.2f} s = {rate / 1e6:.0f} million steps per second")
    for label, ops in (("n = 10^5, O(n^2)", 10**10), ("n = 10^5, O(n log n)", 10**5 * count_log(10**5)),
                       ("n = 20, O(2^n)", 2**20), ("n = 40, O(2^n)", 2**40)):
        print(f"  {label:<22} {ops:>17,} steps ~ {ops / rate:,.3f} s")

    print("\n== 3. Recursion ==")
    print("factorial(4) -> (value, calls, max depth) =", factorial_trace(4))
    print("fib(5) naive -> (value, calls, max depth) =", fib_naive_calls(5))
    print("fib(5) naive: times each fib(k) is called =", fib_naive_repeats(5))
    print("fib(5) memo  -> (value, calls) =", fib_memo_calls(5))
    for n in (10, 20, 30):
        print(f"fib({n}): naive calls = {fib_naive_calls(n)[1]:>9,}   memo calls = {fib_memo_calls(n)[1]}")
    t0 = time.perf_counter(); fib_naive_calls(30); t1 = time.perf_counter(); fib_memo_calls(30); t2 = time.perf_counter()
    print(f"fib(30) time: naive {t1 - t0:.2f} s, memo {(t2 - t1) * 1e6:.0f} us")

    print("\n== 4. Fast power ==")
    for x, n in ((2, 10), (2, 13), (2, -2), (1.00000001, 10**9)):
        v, c, m = fast_pow(x, n)
        print(f"fast_pow({x}, {n}) = {v:.6g}  calls = {c}  multiplications = {m}  (plain loop: {abs(n):,} multiplications)")

    print("\n== 5. Traps ==")
    print("recursion limit:", sys.getrecursionlimit())

    def fact_bad(k):
        if k == 1:
            return 1
        return k * fact_bad(k - 1)
    try:
        fact_bad(0)
    except RecursionError as e:
        print("fact_bad(0) -> RecursionError:", e)
    for n in (10, 1000, 10**6):
        print(f"pow with half computed twice, k = {n:>7}: calls = {slow_pow_twice(n):>9,}   fast_pow calls = {fast_pow(2, n)[1]}")
    for n in (10, 1500, 5000):
        s = list("a" * n)
        best = [0]
        try:
            reverse_rec(s, 0, n - 1, 1, best)
            print(f"reverse_rec on {n} chars: ok, max depth = {best[0]}")
        except RecursionError:
            print(f"reverse_rec on {n} chars: RecursionError (needed depth {n // 2 + 1})")
    copied = 0

    def total_slice(nums):
        nonlocal copied
        if not nums:
            return 0
        copied += len(nums) - 1
        return nums[0] + total_slice(nums[1:])
    total_slice(list(range(900)))
    print(f"sum by slicing nums[1:] on 900 items: {copied:,} items copied (index version: 0)")

    print("\n== 5b. Complexity box ==")
    seq, k = [], 1000
    while k >= 1:
        seq.append(k)
        k //= 2
    print("halving 1000:", seq, " count =", len(seq), " log2(1000) =", round(__import__('math').log2(1000), 2))
    print("digits in 2^1000:", len(str(2 ** 1000)))
    c10, c20, c30 = (fib_naive_calls(n)[1] for n in (10, 20, 30))
    print(f"naive fib call growth per +10: {c20 / c10:.1f}x, {c30 / c20:.1f}x")
    print("memo calls == 2n - 1 for n = 1..30:", all(fib_memo_calls(n)[1] == 2 * n - 1 for n in range(1, 31)))
    print("naive fib(4) calls =", fib_naive_calls(4)[1])
    print("2^12 teams =", 2 ** 12)
    print("power(1.0, -2**31) calls =", fast_pow(1.0, -2 ** 31)[1])

    print("\n== 6. Check yourself ==")
    print("halving checks to rule out a missing word in 1,000,000 sorted words:", halving_search(list(range(10**6)), -1)[1])
    print("factorial(6) -> (value, calls, max depth) =", factorial_trace(6))
    print("fib(6) naive calls =", fib_naive_calls(6)[1], "  memo calls =", fib_memo_calls(6)[1])
    print("fast_pow(3, 5) -> calls, multiplications =", fast_pow(3, 5)[1:], " value =", fast_pow(3, 5)[0])


if __name__ == "__main__":
    main()
