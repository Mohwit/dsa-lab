# Second Largest Element (practice Q1)

Interactive page: `site/index.html#p23`. Closest LeetCode: 414 Third Maximum Number.

**Problem:** return the second largest distinct value in a non-empty list, or -1 if there are fewer than two distinct values.

**Key idea:** the answer needs only the top two values, so keep two variables (`first`, `second`) and walk once. A new champion pushes the old one down to second; values equal to first are skipped.

**Complexity:** O(n) time, O(1) space. Sorting the distinct values works too but costs O(n log n).

**Mistakes to avoid:**
- forgetting `second = old first` when first changes (`[1, 5]` must give 1);
- `x <= first` instead of `x < first` (`[8, 8]` must give -1);
- starting from -1 or 0 instead of `None`: values can be negative.

**My attempt (2026-10-13):** set + sort, all tests green, logged as `alone`.
