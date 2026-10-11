"""Stack and Monotonic Stack pattern lesson: every number on the page comes from this script.

Run:  python3 patterns/stack/measure.py

Counting rules (the page's JavaScript uses the same ones):
  brute comparisons = how many times `nums[j] > nums[i]` runs in the nested scan (it stops at the first taller one)
  stack comparisons = how many times `nums[stack[-1]] < x` runs (only when the stack is not empty)
  pushes / pops     = calls to stack.append / stack.pop
  bracket steps     = characters read before the check returns
"""


def next_greater(nums):
    """Monotonic stack. Returns (answer, comparisons, pushes, pops)."""
    answer = [-1] * len(nums)
    stack = []
    comps = pushes = pops = 0
    for i, x in enumerate(nums):
        while stack:
            comps += 1
            if not nums[stack[-1]] < x:
                break
            j = stack.pop()
            pops += 1
            answer[j] = x
        stack.append(i)
        pushes += 1
    return answer, comps, pushes, pops


def next_greater_left(nums):
    """Same loop; returns the indices still on the stack at the end."""
    stack = []
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] < x:
            stack.pop()
        stack.append(i)
    return stack


def next_greater_brute(nums):
    """Nested scan. Returns (answer, comparisons)."""
    n = len(nums)
    answer = [-1] * n
    comps = 0
    for i in range(n):
        for j in range(i + 1, n):
            comps += 1
            if nums[j] > nums[i]:
                answer[i] = nums[j]
                break
    return answer, comps


PAIRS = {")": "(", "]": "[", "}": "{"}


def is_valid(s):
    """Bracket check. Returns (valid, steps, stack_left)."""
    stack = []
    steps = 0
    for ch in s:
        steps += 1
        if ch in PAIRS:
            if not stack or stack.pop() != PAIRS[ch]:
                return False, steps, stack
        else:
            stack.append(ch)
    return not stack, steps, stack


OPS = {"+": lambda a, b: a + b, "-": lambda a, b: a - b,
       "*": lambda a, b: a * b, "/": lambda a, b: int(a / b)}


def eval_rpn(tokens):
    stack = []
    for t in tokens:
        if t in OPS:
            b = stack.pop()
            a = stack.pop()
            stack.append(OPS[t](a, b))
        else:
            stack.append(int(t))
    return stack[0]


class MinStack:
    def __init__(self):
        self.stack = []          # pairs (value, smallest so far)

    def push(self, x):
        low = min(x, self.stack[-1][1]) if self.stack else x
        self.stack.append((x, low))

    def pop(self):
        return self.stack.pop()[0]

    def get_min(self):
        return self.stack[-1][1]


def minstd(n, seed=7, mod=100):
    """Shared pseudo-random heights (the page's JS uses the same generator)."""
    out, s = [], seed
    for _ in range(n):
        s = s * 48271 % 2147483647
        out.append(s % mod)
    return out


def falling_then_giant(n):
    return list(range(n - 1, 0, -1)) + [n]


def main():
    print("== 1. Picture example: first taller person to the right ==")
    pic = [6, 2, 5, 1, 3, 4, 0, 8]
    a, c, pu, po = next_greater(pic)
    b, bc = next_greater_brute(pic)
    print(f"nums = {pic}")
    print(f"answer          = {a}")
    print(f"brute answer    = {b}   same = {a == b}")
    print(f"stack: comparisons = {c}, pushes = {pu}, pops = {po}")
    print(f"brute: comparisons = {bc}")
    print(f"left on stack at the end (indices) = {next_greater_left(pic)}")

    print("\n== 2. Operation race ==")
    for shape, make in (("falling then a giant", falling_then_giant), ("random heights 0-99 (seed 7)", minstd)):
        print(f"-- {shape} --")
        for n in (10, 100, 1000):
            nums = make(n)
            ans, c, pu, po = next_greater(nums)
            bans, bc = next_greater_brute(nums)
            assert ans == bans
            print(f"n = {n:>4}: stack comps = {c:>5}  pushes = {pu:>4}  pops = {po:>4}   brute comps = {bc:>6}   ratio = {bc / c:.1f}x")
    print("random heights, first 10 values:", minstd(10))

    print("\n== 3. Bracket check ==")
    for s in ("([]{})", "([)]", "(()", "())", ")(", ""):
        v, steps, left = is_valid(s)
        print(f"{s!r:>9}: valid = {v!s:<5}  steps = {steps}  left on stack = {left}")

    print("\n== 4. Reverse Polish notation ==")
    for toks in (["3", "4", "+", "2", "*"], ["5", "1", "2", "+", "4", "*", "+", "3", "-"], ["7", "-2", "/"]):
        print(f"{' '.join(toks)} -> {eval_rpn(toks)}")

    print("\n== 5. Min stack ==")
    ms = MinStack()
    log = []
    for op, x in (("push", 5), ("push", 3), ("push", 7), ("push", 2), ("pop", None), ("pop", None)):
        if op == "push":
            ms.push(x)
            log.append(f"push {x}: stack = {ms.stack}  min = {ms.get_min()}")
        else:
            v = ms.pop()
            log.append(f"pop -> {v}: stack = {ms.stack}  min = {ms.get_min()}")
    print("\n".join(log))

    print("\n== 6. Traps ==")

    def valid_no_empty_check(s):
        stack = []
        for ch in s:
            if ch in PAIRS:
                if stack.pop() != PAIRS[ch]:
                    return False
            else:
                stack.append(ch)
        return not stack

    try:
        valid_no_empty_check(")(")
    except IndexError as e:
        print(f"no empty check on ')(' -> IndexError: {e}")
    print(f"fixed on ')(' -> {is_valid(')(')[0]}")

    def valid_forget_leftovers(s):
        stack = []
        for ch in s:
            if ch in PAIRS:
                if not stack or stack.pop() != PAIRS[ch]:
                    return False
            else:
                stack.append(ch)
        return True

    print(f"return True at the end on '((' -> {valid_forget_leftovers('((')}   fixed (return not stack) -> {is_valid('((')[0]}")

    def wait_days_values(temps):
        """Wrong: stores values, then looks the index up with list.index."""
        answer = [0] * len(temps)
        stack = []
        for i, t in enumerate(temps):
            while stack and stack[-1] < t:
                v = stack.pop()
                j = temps.index(v)
                answer[j] = i - j
            stack.append(t)
        return answer

    def wait_days(temps):
        answer = [0] * len(temps)
        stack = []
        for i, t in enumerate(temps):
            while stack and temps[stack[-1]] < t:
                j = stack.pop()
                answer[j] = i - j
            stack.append(i)
        return answer

    t = [3, 1, 1, 4]
    print(f"days to wait, values on the stack, {t} -> {wait_days_values(t)}")
    print(f"days to wait, indices on the stack, {t} -> {wait_days(t)}")

    def ng_le(nums):
        answer = [-1] * len(nums)
        stack = []
        for i, x in enumerate(nums):
            while stack and nums[stack[-1]] <= x:
                answer[stack.pop()] = x
            stack.append(i)
        return answer

    t = [2, 2, 3]
    print(f"next greater with <= on {t} -> {ng_le(t)}   with < -> {next_greater(t)[0]}")

    def rpn_floor(tokens):
        stack = []
        for tk in tokens:
            if tk in "+-*/":
                b = stack.pop()
                a = stack.pop()
                stack.append({"+": a + b, "-": a - b, "*": a * b, "/": a // b}[tk])
            else:
                stack.append(int(tk))
        return stack[0]

    def rpn_swapped(tokens):
        stack = []
        for tk in tokens:
            if tk in "+-*/":
                a = stack.pop()
                b = stack.pop()
                stack.append({"+": a + b, "-": a - b, "*": a * b, "/": int(a / b)}[tk])
            else:
                stack.append(int(tk))
        return stack[0]

    print(f"'7 -2 /' with // -> {rpn_floor(['7', '-2', '/'])}   with int(a / b) -> {eval_rpn(['7', '-2', '/'])}")
    print(f"'9 4 -' with swapped pops -> {rpn_swapped(['9', '4', '-'])}   correct -> {eval_rpn(['9', '4', '-'])}")

    print("\n== 7. Check yourself ==")
    q = [6, 2, 4, 1, 5]
    a, c, pu, po = next_greater(q)
    print(f"{q}: answer = {a}, left on stack (indices) = {next_greater_left(q)}, pops = {po}, comps = {c}")
    print(f"'([)]' -> {is_valid('([)]')}")
    n = 1000
    a, c, pu, po = next_greater(falling_then_giant(n))
    print(f"n = {n} falling then giant: pops = {po} (bound n - 1 = {n - 1}), comps = {c} (bound pops + n - 1 <= 2n - 2 = {2 * n - 2})")

    print("\n== 8. Sandbox examples ==")
    for name, nums in (("mixed", [6, 2, 5, 1, 3, 4, 0, 8]), ("falling", [9, 7, 5, 3, 1]), ("rising", [1, 3, 5, 7, 9]),
                       ("giant last", [5, 4, 3, 2, 1, 6]), ("ties", [4, 4, 4, 5])):
        a, c, pu, po = next_greater(nums)
        b, bc = next_greater_brute(nums)
        print(f"{name:<11} {str(nums):<26} answer = {str(a):<28} stack comps = {c:<3} pops = {po:<2} brute comps = {bc}")
    for s in ("{[()()]}", "([)]", "((()", "]"):
        v, steps, left = is_valid(s)
        print(f"brackets {s!r:<11} valid = {v!s:<5} steps = {steps}")


if __name__ == "__main__":
    main()
