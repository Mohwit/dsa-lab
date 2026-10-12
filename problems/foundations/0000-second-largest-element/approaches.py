"""Every approach on the page, with its work counted. Run: python3 approaches.py (from this folder).

Checks all four against the brute-force definition on the test cases and on random lists,
then prints the counts the page quotes.
"""
import json, pathlib, random
from functools import cmp_to_key

HERE = pathlib.Path(__file__).parent


def by_definition(arr):
    """Brute force: find the max, then the max of everything smaller. Two passes."""
    top = max(arr)
    rest = [x for x in arr if x < top]
    return max(rest) if rest else -1


def sort_distinct(arr, count=None):
    """The learner's approach: drop repeats, sort high to low, take index 1."""
    distinct = list(set(arr))
    if len(distinct) < 2:
        return -1
    def cmp(a, b):
        if count is not None:
            count[0] += 1
        return (a < b) - (a > b)
    distinct.sort(key=cmp_to_key(cmp))
    return distinct[1]


def two_pass(arr, count=None):
    """Pass 1: find the max. Pass 2: the biggest value below it."""
    top = arr[0]
    for x in arr[1:]:
        if count is not None: count[0] += 1
        if x > top: top = x
    best = None
    for x in arr:
        if count is not None: count[0] += 1
        if x < top and (best is None or x > best): best = x
    return -1 if best is None else best


def one_pass(arr, count=None):
    first = second = None
    for x in arr:
        if count is not None: count[0] += 1
        if first is None or x > first:
            first, second = x, first
        elif x < first and (second is None or x > second):
            second = x
    return -1 if second is None else second


if __name__ == "__main__":
    tests = json.loads((HERE / "tests.json").read_text())
    fns = [sort_distinct, two_pass, one_pass]
    for c in tests["cases"]:
        for f in fns:
            assert f(list(c["args"][0])) == c["expected"], (f.__name__, c)
    rnd = random.Random(7)
    for _ in range(3000):
        a = [rnd.randint(-6, 6) for _ in range(rnd.randint(1, 12))]
        for f in fns:
            assert f(list(a)) == by_definition(a), (f.__name__, a)
    print("all approaches agree on", len(tests["cases"]), "cases and 3000 random lists")
    for ex in ([12, 1, 35, 10, 34, 1], [7, 8, 8, 1, 4, 3], [10, 10, 10, 10, 10]):
        row = []
        for f in fns:
            k = [0]; r = f(list(ex), k); row.append(f"{f.__name__}={k[0]}")
        print(ex, "->", one_pass(ex), " steps:", ", ".join(row))
    for n in (5000, 100000):
        a = [rnd.randint(-10**9, 10**9) for _ in range(n)]
        row = []
        for f in fns:
            k = [0]; f(list(a), k); row.append(f"{f.__name__}={k[0]}")
        print("n =", n, "random:", ", ".join(row))
