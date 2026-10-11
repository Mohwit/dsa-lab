# Two Sum (LeetCode 1, easy, arrays and hashing)

Interactive page: `site/index.html#p3`. Link: https://leetcode.com/problems/two-sum/

## The problem in my words
A gift card is worth `target`. A shelf of price tags is `nums`. Pick exactly two different items whose prices add up to the card's value, and return their positions (indices), in any order. Exactly one pair works. Prices can be negative, zero or repeated.

## Key idea
For each number x, the partner it needs is `target - x`. Keep a dict `seen` (value -> index) of the numbers already passed, and ask it whether the partner has gone by. Ask first, store second.

```python
seen = {}
for i, x in enumerate(nums):
    need = target - x
    if need in seen:
        return [seen[need], i]
    seen[x] = i
```

Invariant: before index i, `seen` holds exactly the numbers to the left of i.

## Complexity
- Brute force (every pair): O(n^2) time, O(1) space. 15 pair checks on [5, 9, 1, 12, 3, 8], target 11.
- One-pass map: O(n) average time, O(n) space. 6 lookups on the same input.
- Cannot beat O(n): every number must be read once.

## Approaches (counts from `approaches.py` on [5, 9, 1, 12, 3, 8], target 11)
| Approach | Work on the example | Time | Extra space | Choose it when |
|---|---|---|---|---|
| All pairs | 15 pair checks | O(n^2) | O(1) | tiny n, or as a checker |
| Sort (value, index) + two pointers | 12 sort comparisons + 4 pointer steps | O(n log n) | O(n) | input already sorted (then O(1), LeetCode 167), or all pairs |
| Two-pass dict | 6 stores + 5 lookups | O(n) average | O(n) | "build, then query"; needs the j != i check |
| One-pass dict (best) | 6 lookups | O(n) average | O(n) | the default |

## Mental map
1. Signal: two items summing to a target, return positions, unsorted list.
2. Ask: standing on x, what am I looking for? Exactly `target - x`, and I need its index.
3. Pick: all pairs (too slow), two pointers (needs sorted input, loses indices), set (no index), **dict value -> index (pick)**.
4. Invariant: before index i, `seen` holds every number to the left of i.
5. Steps: need = target - x; if need in seen return [seen[need], i]; else seen[x] = i.
6. Checks: ask before store ([3, 4, 2], 6); duplicates ([0, 4, 0], 0 -> [0, 2]); dict not list.

## Mistakes to avoid
- Storing x before the check: x can pair with itself. [3, 4, 2], target 6 gives [0, 0] instead of [1, 2].
- Using a list for `seen`: `in` on a list is O(n), so the whole thing is O(n^2) again.
- Returning values instead of indices (read the question).

## Follow-ups
- Sorted input: two pointers from both ends, O(1) space (LeetCode 167).
- Values only: sort, then two pointers. All pairs with duplicates: count per value, or sort and skip repeats.
