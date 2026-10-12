# Feedback: Q1. Second Largest Element

## Verdict: correct

Your `solution.py` passes every case I ran:

| Input | Expected | Yours |
|---|---|---|
| `2 4 5 6 8` | 6 | 6 |
| `12 1 35 10 34 1` | 34 | 34 |
| `10 10 10 10 10` | -1 | -1 |
| `7 8 8 1 4 3` | 7 | 7 |
| `5` (one element) | -1 | -1 |
| `-3 -1 -2` (all negative) | -2 | -2 |
| `-10^9 10^9` (extremes) | -10^9 | -10^9 |

It also matched a brute force (`max` of everything smaller than the max) on 5,000 random arrays with lots of duplicates.

## Complexity

- **Time:** O(n log n). `set(arr)` is O(n), `list(...)` is O(n), and the sort is O(k log k), where k is the number of distinct values. The sort dominates.
- **Space:** O(n) for the set and the new list.

With n up to 5000 this passes easily. But an interviewer will ask: "Can you do it without sorting?"

## Review notes

What you did well:

- **You handled duplicates on purpose.** Removing them first is exactly why `10 10 10 10 10` gives -1 and `7 8 8 ...` gives 7. Many first attempts return 8 there.
- **The `len(arr) < 2` guard** covers both "one element" and "all the same" in one line.
- Clear names and a type hint. Easy to read.

Things to improve:

- **Sorting does more work than the question needs.** You only need the top two values, but sorting puts *every* value in order. That is the gap between O(n log n) and O(n).
- **`arr = list(set(arr))` rebinds the parameter.** Harmless here, but reusing the input's name for something different makes code harder to follow. Prefer `distinct = list(set(arr))`.
- **Small style point:** `arr:list[int]` reads better as `arr: list[int]` (space after the colon, PEP 8).
- **`sorted(set(arr))[-2]`** is a one-line version of the same idea, if you ever want the short form.

## Pattern

**Array traversal with a few tracking variables** (Phase 1, `foundations`).

The signal: *"find the largest / smallest / second something"*. Whenever the answer is a small, fixed number of values (top 1, top 2, top 3), you can keep just those values in variables and update them as you scan once. No sorting needed.

## Best solution: one pass, two variables

Picture a podium with two steps. Walk along the array. Each new number either:

1. **beats the champion**: the old champion steps down to second place, and the new number takes first;
2. **is strictly between** second and first: it takes second place;
3. **otherwise** (smaller than second, or equal to first) it is ignored. The "equal to first" case is what handles duplicates.

```python
def second_largest_element(arr: list[int]) -> int:
    first = second = None
    for x in arr:
        if first is None or x > first:
            first, second = x, first      # old champion steps down
        elif x < first and (second is None or x > second):
            second = x                    # new runner-up
    return -1 if second is None else second
```

Code walk:

- `None` means "no value yet". It is safer than `-1` or `float('-inf')` because `-1` could be a real array value (values go down to -10^9).
- `first, second = x, first` moves the old champion down in one step. Forgetting this line is the classic bug: `[1, 5]` would give -1 instead of 1.
- `x < first` (strict) is the duplicate guard. With `<=`, the input `8 8` would set second to 8.

Trace on `12 1 35 10 34 1`:

| x | first | second |
|---|---|---|
| 12 | 12 | None |
| 1 | 12 | 1 |
| 35 | 35 | 12 |
| 10 | 35 | 12 |
| 34 | 35 | 34 |
| 1 | 35 | 34 |

Answer: **34**.

- **Time:** O(n), one pass.
- **Space:** O(1), two variables.

I checked this version against the brute force on 20,000 random arrays.

## Other approaches

| Approach | Time | Space | Notes |
|---|---|---|---|
| Sort distinct values (yours) | O(n log n) | O(n) | Simple and correct. Fine when n is small. |
| Two passes: find `max`, then the max of values `< max` | O(n) | O(1) | Easiest O(n) to write and explain. `m = max(arr)`, then `max((x for x in arr if x < m), default=-1)`. |
| One pass, two variables (best) | O(n) | O(1) | Reads the array once; generalises to top 3 (LC #414). |
| Heap: `heapq.nlargest(2, set(arr))` | O(n) | O(n) | Handy for top-k when k is large; overkill for k = 2. |

## Try next

Rewrite your solution as the one-pass version from memory, without looking. Then try **LC #414 (Third Maximum Number)**: same podium, three steps instead of two.
