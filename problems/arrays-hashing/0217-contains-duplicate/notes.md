# Contains Duplicate (LeetCode 217, easy, arrays and hashing)

Interactive page: `site/index.html#p2`. Link: https://leetcode.com/problems/contains-duplicate/

## The problem in my words
A door guard gets the list of ticket numbers in arrival order. Answer True if any number
was used twice (same value at two positions), False if all values differ.
Up to 100,000 numbers, each between -10^9 and 10^9.

## Key idea
When you reach a number you only need one fact: did it appear earlier? A set answers that
in O(1) on average. One pass: check, then add; return True on the first repeat.

## Approaches (counts from `approaches.py` on [3, 8, 5, 1, 9, 5])
| Approach | Work on the example | Time | Extra space | Choose it when |
|---|---|---|---|---|
| Compare every pair | 12 comparisons | O(n^2) | O(1) | tiny n, or as a checker |
| Sort, then compare neighbours | 11 sort comparisons + 3 checks | O(n log n) | O(n) with sorted(), less in place | tight memory, may reorder |
| Hash set, one pass (best) | 6 lookups | O(n) average | O(n) | the default |
| `len(set(nums)) != len(nums)` | 6 inserts (always all n) | O(n) average | O(n) | one readable line, repeats rare |

The one-liner has no early exit. 100,000 numbers with a repeat at the start: loop ~0.0001 ms,
one-liner ~1.9 ms. With no repeat the one-liner is faster (1.9 ms vs 4.0 ms) because it runs in C.

## Mental map
1. Signal: "does any value appear twice?", n up to 100,000.
2. Ask: standing on a number, what do I need to know about the earlier ones? Only "is this value there?".
3. Pick: pairs (too slow), sort (O(n log n), reorders), Counter (more than needed), **set (pick)**.
4. Invariant: before index i, `seen` holds exactly nums[0..i-1], all different.
5. Steps: empty set; for each x: in seen -> True, else add; after the loop False.
6. Checks: check before add; set not list; empty and single element return False.

## Follow-ups
- Tight memory: sort in place, compare neighbours. O(n log n) time, O(1) extra with heapsort
  (Python's list.sort may borrow up to n/2 slots). The caller's list is reordered.
- Values in 0..k: a boolean list of size k + 1. O(n + k) time, O(k) space.
- Already sorted input: neighbours only, O(n) time, O(1) space.
- "At least 3 times": a dict of counts.

## Mistakes to avoid
- Adding to the set before checking (every list then looks like it has a repeat).
- Using a list for `seen` (`x in list` is O(n), so the whole thing becomes O(n^2)).
- Forgetting the empty list (should return False).
