"""Intervals pattern lesson: every number on the page comes from this script.

Run:  python3 patterns/intervals/measure.py

Intervals are [start, end] pairs of whole numbers with start < end.
Counting rules (the page's JavaScript uses the same ones):
  pair checks   = how many times the brute force tests whether two intervals overlap (every pair, once)
  scan checks   = how many times the sorted scan compares an interval with the last kept one
  sweep events  = how many +1 / -1 events the sweep line processes (two per meeting)
  rooms brute   = how many (start time, meeting) tests "is this meeting running at that start?"
"""
import functools
import heapq
import itertools
import random


# ---------- merge ----------

def merge(intervals):
    """Sort by start, then compare each interval with the last merged one. Returns (merged, scan checks)."""
    out, checks = [], 0
    for s, e in sorted(intervals):
        if out:
            checks += 1
        if out and s <= out[-1][1]:
            out[-1][1] = max(out[-1][1], e)
        else:
            out.append([s, e])
    return out, checks


def merge_brute(intervals):
    """Compare every pair; overlapping intervals join one group. Returns (merged, pair checks)."""
    n = len(intervals)
    group = list(range(n))
    checks = 0
    for i in range(n):
        for j in range(i + 1, n):
            checks += 1
            a, b = intervals[i], intervals[j]
            if a[0] <= b[1] and b[0] <= a[1]:
                old, new = group[j], group[i]
                group = [new if g == old else g for g in group]
    spans = {}
    for k, g in enumerate(group):
        s, e = intervals[k]
        if g in spans:
            spans[g] = [min(spans[g][0], s), max(spans[g][1], e)]
        else:
            spans[g] = [s, e]
    return sorted(spans.values()), checks


# ---------- insert ----------

def insert(intervals, new):
    out, i, n = [], 0, len(intervals)
    s, e = new
    while i < n and intervals[i][1] < s:          # ends before the new one starts
        out.append(intervals[i]); i += 1
    while i < n and intervals[i][0] <= e:         # overlaps: grow the new one
        s = min(s, intervals[i][0]); e = max(e, intervals[i][1]); i += 1
    out.append([s, e])
    out.extend(intervals[i:])                     # starts after the new one ends
    return out


# ---------- meeting rooms ----------

def min_rooms_sweep(meetings):
    """Events +1 at start, -1 at end; at equal times the end comes first. Returns (rooms, events)."""
    events = []
    for s, e in meetings:
        events.append((s, 1))
        events.append((e, -1))
    events.sort(key=lambda ev: (ev[0], ev[1]))   # (-1) sorts before (+1) at the same time
    rooms = best = 0
    for _, d in events:
        rooms += d
        best = max(best, rooms)
    return best, len(events)


def min_rooms_heap(meetings):
    ends = []
    for s, e in sorted(meetings):
        if ends and ends[0] <= s:
            heapq.heappop(ends)                   # that room is free again
        heapq.heappush(ends, e)
    return len(ends)


def min_rooms_brute(meetings):
    """For every start time, count meetings running then. Returns (rooms, tests)."""
    best, tests = 0, 0
    for s, _ in meetings:
        here = 0
        for a, b in meetings:
            tests += 1
            if a <= s < b:
                here += 1
        best = max(best, here)
    return best, tests


def active_at(meetings, t):
    return sum(1 for a, b in meetings if a <= t < b)


# ---------- remove fewest ----------

def erase_overlaps(intervals):
    """Greedy by end: keep the one that ends first. Returns (removed, checks)."""
    removed, checks, end = 0, 0, None
    for s, e in sorted(intervals, key=lambda iv: iv[1]):
        if end is None:
            end = e
            continue
        checks += 1
        if s < end:
            removed += 1
        else:
            end = e
    return removed, checks


def erase_brute(intervals):
    """Try every subset to keep; the largest one with no overlaps wins. Returns (removed, subsets tried)."""
    n, best, tried = len(intervals), 0, 0
    for mask in range(1 << n):
        tried += 1
        keep = sorted(intervals[k] for k in range(n) if mask >> k & 1)
        if all(keep[k][1] <= keep[k + 1][0] for k in range(len(keep) - 1)):
            best = max(best, len(keep))
    return n - best, tried


# ---------- buggy versions for the traps ----------

def rooms_touching_bug(meetings):
    events = []
    for s, e in meetings:
        events.append((s, 1))
        events.append((e, -1))
    events.sort(key=lambda ev: (ev[0], -ev[1]))  # bug: start (+1) before end (-1) at the same time
    rooms = best = 0
    for _, d in events:
        rooms += d
        best = max(best, rooms)
    return best


def erase_by_start_bug(intervals):
    removed, end = 0, None
    for s, e in sorted(intervals):                # bug: sorted by start, keeps whatever starts first
        if end is not None and s < end:
            removed += 1
        else:
            end = e
    return removed


def merge_replace_bug(intervals):
    out = []
    for s, e in sorted(intervals):
        if out and s <= out[-1][1]:
            out[-1][1] = e                        # bug: should be max(out[-1][1], e)
        else:
            out.append([s, e])
    return out


def merge_unsorted_bug(intervals):
    out = []
    for s, e in intervals:                        # bug: forgot to sort
        if out and s <= out[-1][1]:
            out[-1][1] = max(out[-1][1], e)
        else:
            out.append([s, e])
    return out


def main():
    print("== 1. Picture example: merge ==")
    pic = [[7, 9], [1, 3], [2, 5], [10, 11], [6, 8]]
    print("intervals =", pic)
    print("sorted    =", sorted(pic))
    m, c = merge(pic)
    mb, cb = merge_brute(pic)
    print(f"sorted scan   -> {m}   scan checks = {c}")
    print(f"compare pairs -> {mb}   pair checks = {cb}")

    print("\n== 2. Race: overlap checks (any n random intervals) ==")
    rng = random.Random(15)
    for n in (10, 100, 1000):
        ivs = []
        for _ in range(n):
            s = rng.randint(0, 10 * n)
            ivs.append([s, s + rng.randint(1, 20)])
        m1, c1 = merge(ivs)
        m2, c2 = merge_brute(ivs)
        assert m1 == m2
        cmp = [0]

        def key(a, b):
            cmp[0] += 1
            return (a > b) - (a < b)
        sorted(ivs, key=functools.cmp_to_key(key))
        print(f"n = {n:>4}: scan checks = {c1:>4}  pair checks = {c2:>6}  ratio = {c2 / c1:.1f}x   (Python's sort used {cmp[0]:,} comparisons)")

    print("\n== 3. Templates ==")
    print("insert([[1, 2], [4, 6], [8, 10]], [5, 9]) =", insert([[1, 2], [4, 6], [8, 10]], [5, 9]))
    print("insert([[1, 2], [4, 6]], [7, 8])          =", insert([[1, 2], [4, 6]], [7, 8]))
    rooms_ex = [[1, 5], [2, 4], [3, 7], [4, 6], [8, 10]]
    r, ev = min_rooms_sweep(rooms_ex)
    print(f"rooms {rooms_ex}: sweep = {r} ({ev} events)  heap = {min_rooms_heap(rooms_ex)}  brute = {min_rooms_brute(rooms_ex)}")
    erase_ex = [[1, 4], [2, 3], [3, 6], [5, 7], [6, 8]]
    print(f"erase {erase_ex}: greedy by end = {erase_overlaps(erase_ex)}  brute = {erase_brute(erase_ex)}   # (removed, work)")
    print("sorted by end:", sorted(erase_ex, key=lambda iv: iv[1]))

    print("\n== 4. Sweep slider: meetings running at time t ==")
    print("meetings =", rooms_ex)
    print("t:      ", " ".join(f"{t:>2}" for t in range(0, 11)))
    print("running:", " ".join(f"{active_at(rooms_ex, t):>2}" for t in range(0, 11)))

    print("\n== 5. Traps ==")
    touch = [[1, 3], [3, 5]]
    print(f"touching {touch}: rooms fixed = {min_rooms_sweep(touch)[0]}  rooms bug (start first) = {rooms_touching_bug(touch)}")
    print(f"merge touching {touch} = {merge(touch)[0]}   # merge problems count touching as overlap")
    wrong_key = [[1, 10], [2, 3], [4, 5]]
    print(f"erase {wrong_key}: by end = {erase_overlaps(wrong_key)[0]}  by start (bug) = {erase_by_start_bug(wrong_key)}  brute = {erase_brute(wrong_key)[0]}")
    inside = [[1, 10], [2, 3]]
    print(f"merge {inside}: fixed = {merge(inside)[0]}  replace-end bug = {merge_replace_bug(inside)}")
    unsorted = [[4, 6], [1, 2], [2, 5]]
    print(f"merge {unsorted}: fixed = {merge(unsorted)[0]}  no-sort bug = {merge_unsorted_bug(unsorted)}")

    print("\n== 6. Random cross-check against the brute forces (500 cases) ==")
    rng = random.Random(7)
    for _ in range(500):
        n = rng.randint(0, 8)
        ivs = []
        for _ in range(n):
            s = rng.randint(0, 15)
            ivs.append([s, s + rng.randint(1, 6)])
        assert merge(ivs)[0] == merge_brute(ivs)[0]
        assert min_rooms_sweep(ivs)[0] == min_rooms_heap(ivs) == (min_rooms_brute(ivs)[0] if ivs else 0)
        assert erase_overlaps(ivs)[0] == erase_brute(ivs)[0]
    print("all 500 random cases agree")

    print("\n== 7. Sandbox examples ==")
    ex = {
        "merge example": [[7, 9], [1, 3], [2, 5], [10, 11], [6, 8]],
        "touching": [[1, 3], [3, 5], [5, 7]],
        "one inside another": [[1, 10], [2, 3], [4, 5]],
        "no overlaps": [[1, 2], [4, 5], [7, 8]],
        "rooms example": [[1, 5], [2, 4], [3, 7], [4, 6], [8, 10]],
    }
    for name, ivs in ex.items():
        m, c = merge(ivs)
        _, cb = merge_brute(ivs)
        r, ev = min_rooms_sweep(ivs)
        _, rb = min_rooms_brute(ivs)
        er, ec = erase_overlaps(ivs)
        _, eb = erase_brute(ivs)
        print(f"{name:<19} merge = {m} ({c} vs {cb} checks)  rooms = {r} ({ev} events vs {rb} tests)  remove = {er} ({ec} checks vs {eb} subsets)")

    print("\n== 8. Check yourself ==")
    print("merge([[1, 4], [4, 5]]) =", merge([[1, 4], [4, 5]])[0])
    q2 = [[0, 30], [5, 10], [15, 20]]
    print(f"rooms {q2} =", min_rooms_sweep(q2)[0])
    q3 = [[1, 2], [2, 3], [3, 4], [1, 3]]
    print(f"erase {q3} =", erase_overlaps(q3)[0])
    print("pair checks n = 2000:", 2000 * 1999 // 2, " scan checks:", 1999)
    print("sorted by end (stable):", sorted(q3, key=lambda iv: iv[1]))
    print(f"sets to try for n = 30: 2^30 = {2 ** 30:,}")


if __name__ == "__main__":
    main()
