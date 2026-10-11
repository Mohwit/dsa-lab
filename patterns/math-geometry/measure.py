"""Math and Matrix pattern lesson: every number on the page comes from this script.

Run:  python3 patterns/math-geometry/measure.py

Counting rules (the page's JavaScript uses the same ones):
  copy rotation:     cell writes = writes into the new matrix + writes copying it back; extra cells = n * n
  in-place rotation: swaps = transpose swaps (pairs above the diagonal) + reverse swaps (n // 2 per row);
                     cell writes = 2 per swap; extra cells = 0
  happy number:      steps = calls to next_num
  multiply strings:  digit products = runs of int(a[i]) * int(b[j])
"""


def rotate_copy(m):
    n = len(m)
    out = [[0] * n for _ in range(n)]
    writes = 0
    for r in range(n):
        for c in range(n):
            out[c][n - 1 - r] = m[r][c]
            writes += 1
    for r in range(n):
        for c in range(n):
            m[r][c] = out[r][c]
            writes += 1
    return writes, n * n


def rotate_in_place(m):
    n = len(m)
    swaps = 0
    for i in range(n):
        for j in range(i + 1, n):
            m[i][j], m[j][i] = m[j][i], m[i][j]
            swaps += 1
    for row in m:
        row.reverse()
        swaps += n // 2
    return swaps


def transpose(m):
    n = len(m)
    for i in range(n):
        for j in range(i + 1, n):
            m[i][j], m[j][i] = m[j][i], m[i][j]


def spiral(m):
    out = []
    if not m:
        return out
    top, bottom, left, right = 0, len(m) - 1, 0, len(m[0]) - 1
    while top <= bottom and left <= right:
        for c in range(left, right + 1):
            out.append(m[top][c])
        top += 1
        for r in range(top, bottom + 1):
            out.append(m[r][right])
        right -= 1
        if top <= bottom:
            for c in range(right, left - 1, -1):
                out.append(m[bottom][c])
            bottom -= 1
        if left <= right:
            for r in range(bottom, top - 1, -1):
                out.append(m[r][left])
            left += 1
    return out


def spiral_no_guards(m):
    out = []
    top, bottom, left, right = 0, len(m) - 1, 0, len(m[0]) - 1
    while top <= bottom and left <= right:
        for c in range(left, right + 1):
            out.append(m[top][c])
        top += 1
        for r in range(top, bottom + 1):
            out.append(m[r][right])
        right -= 1
        for c in range(right, left - 1, -1):
            out.append(m[bottom][c])
        bottom -= 1
        for r in range(bottom, top - 1, -1):
            out.append(m[r][left])
        left += 1
    return out


def set_zeroes(m):
    R, C = len(m), len(m[0])
    row0 = any(m[0][c] == 0 for c in range(C))
    col0 = any(m[r][0] == 0 for r in range(R))
    for r in range(1, R):
        for c in range(1, C):
            if m[r][c] == 0:
                m[r][0] = 0
                m[0][c] = 0
    for r in range(1, R):
        for c in range(1, C):
            if m[r][0] == 0 or m[0][c] == 0:
                m[r][c] = 0
    if row0:
        for c in range(C):
            m[0][c] = 0
    if col0:
        for r in range(R):
            m[r][0] = 0
    return m


def set_zeroes_naive_in_place(m):
    """Wrong: zero rows and columns while still scanning."""
    R, C = len(m), len(m[0])
    for r in range(R):
        for c in range(C):
            if m[r][c] == 0:
                for k in range(C):
                    m[r][k] = 0
                for k in range(R):
                    m[k][c] = 0
    return m


def next_num(n):
    total = 0
    while n:
        n, d = divmod(n, 10)
        total += d * d
    return total


def happy_set(n):
    seen, steps, chain = set(), 0, [n]
    while n != 1 and n not in seen:
        seen.add(n)
        n = next_num(n)
        steps += 1
        chain.append(n)
    return n == 1, steps, chain


def happy_fast(n):
    steps = 1
    slow, fast = n, next_num(n)
    while fast != 1 and slow != fast:
        slow = next_num(slow)
        fast = next_num(next_num(fast))
        steps += 3
    return fast == 1, steps


def plus_one(digits):
    digits = digits[:]
    for i in range(len(digits) - 1, -1, -1):
        if digits[i] < 9:
            digits[i] += 1
            return digits
        digits[i] = 0
    return [1] + digits


def plus_one_buggy(digits):
    digits = digits[:]
    for i in range(len(digits) - 1, -1, -1):
        if digits[i] < 9:
            digits[i] += 1
            return digits
        digits[i] = 0
    return digits


def multiply(a, b):
    if a == "0" or b == "0":
        return "0", 0
    pos = [0] * (len(a) + len(b))
    products = 0
    for i in range(len(a) - 1, -1, -1):
        for j in range(len(b) - 1, -1, -1):
            mul = int(a[i]) * int(b[j])
            products += 1
            total = mul + pos[i + j + 1]
            pos[i + j + 1] = total % 10
            pos[i + j] += total // 10
    return "".join(map(str, pos)).lstrip("0"), products


def grid(n):
    return [[r * n + c + 1 for c in range(n)] for r in range(n)]


def show(m):
    return " | ".join(" ".join(f"{x:>2}" for x in row) for row in m)


def main():
    print("== 1. Rotate a 4 x 4 matrix clockwise ==")
    a, b = grid(4), grid(4)
    w, extra = rotate_copy(a)
    s = rotate_in_place(b)
    print("result :", show(b))
    print(f"copy     : cell writes = {w}  extra cells = {extra}")
    print(f"in place : swaps = {s}  cell writes = {2 * s}  extra cells = 0   same result = {a == b}")
    for n in (3, 1000):
        print(f"n = {n}: copy extra cells = {n * n:,}  in-place swaps = {n * (n - 1) // 2 + n * (n // 2):,}")

    print("\n== 1b. Rotation playground: which moves give which turn (3 x 3) ==")

    def rev_rows(m):
        return [row[::-1] for row in m]

    def rev_cols(m):
        return m[::-1]

    def tr(m):
        return [list(r) for r in zip(*m)]

    def cw(m):
        return [list(r) for r in zip(*m[::-1])]

    m = grid(3)
    target_cw, target_ccw, target_180 = cw(m), cw(cw(cw(m))), cw(cw(m))
    print("start              :", show(m))
    print("clockwise          :", show(target_cw))
    print("transpose, rev rows:", show(rev_rows(tr(m))), " == clockwise:", rev_rows(tr(m)) == target_cw)
    print("rev cols, transpose:", show(tr(rev_cols(m))), " == clockwise:", tr(rev_cols(m)) == target_cw)
    print("transpose, rev cols:", show(rev_cols(tr(m))), " == counter-clockwise:", rev_cols(tr(m)) == target_ccw)
    print("rev rows, transpose:", show(tr(rev_rows(m))), " == counter-clockwise:", tr(rev_rows(m)) == target_ccw)
    print("rev rows, rev cols :", show(rev_cols(rev_rows(m))), " == 180 turn:", rev_cols(rev_rows(m)) == target_180)
    anti = [[m[3 - 1 - c][3 - 1 - r] for c in range(3)] for r in range(3)]
    print("anti-diagonal mirror:", show(anti), " == mirror, flip, transpose:", tr(rev_cols(rev_rows(m))) == anti)

    print("\n== 4a. Spiral of a 3 x 4 matrix ==")
    m34 = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]
    print("spiral =", spiral(m34))

    print("\n== 4b. Spiral playground: guarded vs no guards (cells output, cells in matrix) ==")
    for r, c in ((1, 1), (1, 3), (3, 1), (2, 3), (3, 3), (3, 4), (4, 3), (5, 2), (6, 6)):
        mm = [[i * c + j for j in range(c)] for i in range(r)]
        print(f"{r} x {c}: guarded = {len(spiral(mm))}  no guards = {len(spiral_no_guards(mm))}  cells = {r * c}")
    print("no guards on [[1, 2, 3]] ->", spiral_no_guards([[1, 2, 3]]))
    print("guarded   on [[1, 2, 3]] ->", spiral([[1, 2, 3]]))

    print("\n== 4c. Set matrix zeroes with first row and column as markers ==")
    z = [[1, 2, 3, 4], [5, 0, 7, 8], [9, 10, 11, 0], [13, 14, 15, 16]]
    print("before:", show(z))
    print("after :", show(set_zeroes([r[:] for r in z])))
    zz = [[1, 0, 3], [4, 5, 6], [7, 8, 9]]
    print("check yourself", show(zz), "->", show(set_zeroes([r[:] for r in zz])))

    print("\n== 4d. Happy numbers ==")
    for n in (19, 2, 7, 4):
        h, steps, chain = happy_set(n)
        hf, sf = happy_fast(n)
        print(f"n = {n}: happy = {h}  set steps = {steps}  fast/slow steps = {sf}  chain = {chain}")
    print("largest next_num below 1000:", max(next_num(k) for k in range(1000)), "  next_num(999) =", next_num(999))
    print("next_num(9999999999) =", next_num(9999999999))

    print("\n== 4e. Digit arithmetic ==")
    for d in ([1, 2, 9], [9, 9], [4, 5, 6]):
        print(f"plus_one({d}) = {plus_one(d)}")
    for a2, b2 in (("123", "45"), ("99", "99"), ("0", "52")):
        r, p = multiply(a2, b2)
        print(f"multiply({a2!r}, {b2!r}) = {r!r}  digit products = {p}  check = {int(a2) * int(b2)}")

    print("\n== 6. Traps ==")
    m = grid(3)
    t = [r[:] for r in m]
    for i in range(3):
        for j in range(3):          # wrong: every pair, so each is swapped twice
            t[i][j], t[j][i] = t[j][i], t[i][j]
    print("transpose with j from 0:", show(t), " unchanged =", t == m)
    print("reverse rows then transpose:", show(tr(rev_rows(m))), " (counter-clockwise, not clockwise)")
    z2 = [[1, 0, 1], [1, 1, 1], [1, 1, 1]]
    print("zero while scanning", show(z2), "->", show(set_zeroes_naive_in_place([r[:] for r in z2])))
    print("marker version     ", show(z2), "->", show(set_zeroes([r[:] for r in z2])))
    print("plus_one_buggy([9, 9]) =", plus_one_buggy([9, 9]), "  fixed =", plus_one([9, 9]))
    print("-7 % 3 =", -7 % 3, "  -7 // 2 =", -7 // 2, "  int(-7 / 2) =", int(-7 / 2))

    print("\n== 7. Complexity ==")
    print("happy steps for n = 1..1000 (set version): max =", max(happy_set(k)[1] for k in range(1, 1001)))
    r, p = multiply("9" * 50, "9" * 40)
    print("multiply 50-digit by 40-digit: digit products =", p, " correct =", r == str(int("9" * 50) * int("9" * 40)))

    print("\n== Sandbox examples ==")
    print("rotate 3x3:", show(rev_rows(tr(grid(3)))))
    print("spiral 3x3:", spiral(grid(3)))
    print("spiral 1x4:", spiral([[1, 2, 3, 4]]))
    print("zeroes [[1,1,1],[1,0,1],[1,1,1]]:", show(set_zeroes([[1, 1, 1], [1, 0, 1], [1, 1, 1]])))
    print("zeroes [[0,1,2],[3,4,5]]:", show(set_zeroes([[0, 1, 2], [3, 4, 5]])))


if __name__ == "__main__":
    main()
