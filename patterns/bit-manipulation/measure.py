"""Bit Manipulation pattern lesson: every number on the page comes from this script.

Run:  python3 patterns/bit-manipulation/measure.py

Counting rules (the page's JavaScript uses the same ones):
  scan steps       = how many times `if (n >> i) & 1` runs in the check-all-32-bits loop (always 32)
  drop steps       = how many times `n &= n - 1` runs (one per set bit)
  xor steps        = how many times `acc ^= x` runs (one per number)
  map ops          = one per `count[x] = ...` update, plus one per key checked in the final scan until the single is found
"""
MASK = 0xFFFFFFFF


def ones_scan(n):
    """Check all 32 bits. Returns (ones, steps)."""
    ones = steps = 0
    for i in range(32):
        steps += 1
        if (n >> i) & 1:
            ones += 1
    return ones, steps


def ones_drop(n):
    """Drop the lowest set bit until nothing is left. Returns (ones, steps, values seen)."""
    steps, seen = 0, [n]
    while n:
        n &= n - 1
        steps += 1
        seen.append(n)
    return steps, steps, seen


def single_xor(nums):
    acc, steps, trail = 0, 0, []
    for x in nums:
        acc ^= x
        steps += 1
        trail.append(acc)
    return acc, steps, trail


def single_map(nums):
    count, ops = {}, 0
    for x in nums:
        count[x] = count.get(x, 0) + 1
        ops += 1
    for x, c in count.items():
        ops += 1
        if c == 1:
            return x, ops, len(count)
    return None, ops, len(count)


def combine(a, b, op):
    r = 0
    for i in range(8):
        x, y = (a >> i) & 1, (b >> i) & 1
        bit = x & y if op == "&" else x | y if op == "|" else x ^ y
        r |= bit << i
    return r


def b8(n):
    return format(n, "08b")


def main():
    print("== 1. Count the ones in 44 ==")
    print(f"44 = {b8(44)}")
    print(f"check all 32 bits -> (ones, steps) = {ones_scan(44)}")
    st, _, seen = ones_drop(44)
    print(f"n &= n - 1        -> steps = {st}, n goes {' -> '.join(f'{v} ({b8(v)})' for v in seen)}")

    print("\n== 2. Race: steps for different n ==")
    for n in (1, 44, 255, 1024, 2**31 - 1):
        o, s = ones_scan(n)
        d = ones_drop(n)[1]
        print(f"n = {n:>10}: ones = {o:>2}   scan steps = {s}   drop steps = {d}")
    print("slider range 0..255: max drop steps =", max(ones_drop(n)[1] for n in range(256)), "(n = 255)")

    print("\n== 3. Single number on [2, 7, 4, 7, 2] ==")
    nums = [2, 7, 4, 7, 2]
    acc, s, trail = single_xor(nums)
    print(f"xor   -> answer {acc}, steps {s}, acc after each step {trail}, memory: 1 number")
    x, ops, size = single_map(nums)
    print(f"count -> answer {x}, map ops {ops} (5 updates + {ops - 5} checks), map size {size}")

    print("\n== 4. Templates ==")
    x = 10
    print(f"x = {x} = {b8(x)}")
    print(f"get bit 1:    (x >> 1) & 1   = {(x >> 1) & 1}")
    print(f"set bit 0:    x | (1 << 0)   = {x | (1 << 0)} ({b8(x | 1)})")
    print(f"clear bit 3:  x & ~(1 << 3)  = {x & ~(1 << 3)} ({b8(x & ~(1 << 3))})")
    print(f"toggle bit 2: x ^ (1 << 2)   = {x ^ (1 << 2)} ({b8(x ^ (1 << 2))})")
    print(f"lowest set bit of 12: 12 & -12 = {12 & -12}")
    for n in (16, 18):
        print(f"power of two? n = {n}: n > 0 and n & (n - 1) == 0 -> {n > 0 and n & (n - 1) == 0}")
    bits = [0] * 6
    for i in range(1, 6):
        bits[i] = bits[i >> 1] + (i & 1)
    print(f"counting bits 0..5: {bits}")
    m = [3, 0, 1]
    r = len(m)
    for i, v in enumerate(m):
        r ^= i ^ v
    print(f"missing number in {m}: {r}")

    print("\n== 5. Playground default a = 12, b = 10 ==")
    for op in "&|^":
        print(f"12 {op} 10 = {combine(12, 10, op)} ({b8(combine(12, 10, op))})   python: {eval(f'12 {op} 10')}")

    print("\n== 6. Traps ==")
    n, seen, steps = -1, [-1], 0
    while n and steps < 100:
        n &= n - 1
        steps += 1
        seen.append(n)
    print(f"drop loop on -1 (no mask): first values {seen[:5]}, still not 0 after {steps} steps: n = {n}")
    print(f"drop loop on -1 & MASK: steps = {ones_drop(-1 & MASK)[1]}")
    print(f"bin(-5) = {bin(-5)!r}   bin(-5 & MASK) = {bin(-5 & MASK)!r}")
    print(f"~5 = {~5}   ~5 & MASK = {~5 & MASK}")

    print(f"python precedence: 4 & 1 == 0 -> {4 & 1 == 0!r}   (in Python & binds tighter than ==; in C and Java it does not)")

    def reverse_buggy(n):
        r = 0
        while n:
            r = (r << 1) | (n & 1)
            n >>= 1
        return r

    def reverse_fixed(n):
        r = 0
        for _ in range(32):
            r = (r << 1) | (n & 1)
            n >>= 1
        return r

    print(f"reverse_buggy(1) = {reverse_buggy(1)}   reverse_fixed(1) = {reverse_fixed(1)} ({bin(reverse_fixed(1))})")
    print(f"reverse_buggy(6) = {reverse_buggy(6)}   reverse_fixed(6) = {reverse_fixed(6)}")
    print(f"-1 >> 1 = {-1 >> 1}   -5 >> 1 = {-5 >> 1}")

    def add_buggy(a, b, cap=100):
        k = 0
        while b and k < cap:
            a, b = a ^ b, (a & b) << 1
            k += 1
        return a, b, k

    def add_fixed(a, b):
        k = 0
        while b:
            a, b = (a ^ b) & MASK, ((a & b) << 1) & MASK
            k += 1
        return (a if a <= 0x7FFFFFFF else a - 2**32), k

    a, b, k = add_buggy(-1, 1)
    print(f"add_buggy(-1, 1): carry still {b != 0} after {k} rounds (carry = {b})")
    print(f"add_fixed(-1, 1) = {add_fixed(-1, 1)}   # (answer, rounds)")
    print(f"add_fixed(-2, -3) = {add_fixed(-2, -3)}")
    print(f"add_fixed(5, 7) = {add_fixed(5, 7)}")
    print(f"without the convert-back step: (-2 + -3) & MASK = {(-2 + -3) & MASK}")

    print("\n== 7. Complexity: count ones for every n in 0..1000 ==")
    scan_total = sum(ones_scan(n)[1] for n in range(1001))
    drop_total = sum(ones_drop(n)[1] for n in range(1001))
    print(f"scan steps total = {scan_total}   drop steps total = {drop_total}   dp steps (bits[i] = bits[i >> 1] + (i & 1)) = 1000")

    print("\n== 8. Check yourself ==")
    print(f"12 & 11 = {12 & 11}   drop steps on 255 = {ones_drop(255)[1]}")
    print(f"xor of [5, 3, 5, 9, 3] = {single_xor([5, 3, 5, 9, 3])[0]}")
    print(f"-3 & MASK = {-3 & MASK} = {bin(-3 & MASK)}   drop steps = {ones_drop(-3 & MASK)[1]}")

    print("\n== 8b. Spot the pattern ==")
    print(f"subsets of 12 toppings: 1 << 12 = {1 << 12}")
    three = [5, 5, 5, 3]
    x3 = 0
    for v in three:
        x3 ^= v
    col = sum(1 << i for i in range(32) if sum((v >> i) & 1 for v in three) % 3)
    print(f"every value three times but one, {three}: plain xor = {x3}, per-column count mod 3 = {col}")
    print(f"(44).bit_count() = {(44).bit_count() if hasattr(int, 'bit_count') else 'n/a'}   bin(44).count('1') = {bin(44).count('1')}")

    print("\n== 9. Sandbox examples ==")
    for n in (44, 0, 255, -1, 2**31 - 1, 4096):
        u = n & MASK
        print(f"count ones n = {n:>10}: masked {u:>10}  ones = {ones_scan(u)[0]:>2}  drop steps = {ones_drop(u)[1]:>2}  scan steps = 32")
    for lst in ([2, 7, 4, 7, 2], [9], [1, 1, 2, 2, 3, 3, 8], [6, 6, 5, 3]):
        acc, s, _ = single_xor(lst)
        x, ops, size = single_map(lst)
        print(f"xor list {str(lst):<24}: xor = {acc}  xor steps = {s}  map answer = {x}  map ops = {ops}  map size = {size}")


if __name__ == "__main__":
    main()
