# Practice Plan — Pattern First, Then Problems

How to use this file:

1. Take the phases in order. Learn the **concept** first: read the matching lesson in the DSA Lab site (`patterns/<name>`) and tick the `Learn` box.
2. Then solve that phase's questions in the order given. Each one builds on the one before it.
3. Tick `[x]` when you solve a question **on your own**. If you needed a hint, write `(hint)` after it and come back to it in the Review section.
4. "Look for" tells you what to notice in the problem. It is not the solution.

Difficulty: 🟢 Easy · 🟡 Medium · 🔴 Hard

LeetCode links: `LC #n` is the exact problem. `LC #n ≈` is the closest match; the question file explains how it differs.

---

## Progress

| Phase | Pattern | Questions | Done |
|---|---|---|---|
| 1 | Array & string traversal | 6 | 1 / 6 |
| 2 | Hashing & counting | 7 | 0 / 7 |
| 3 | Two pointers (in-place) | 4 | 0 / 4 |
| 4 | Reversal / rotation trick | 3 | 0 / 3 |
| 5 | Prefix sums | 2 | 0 / 2 |
| 6 | Sliding window | 1 | 0 / 1 |
| 7 | Greedy & balance counting | 3 | 0 / 3 |
| 8 | Matrix (2D) traversal | 5 | 0 / 5 |
| 9 | Building rows (intro to DP) | 2 | 0 / 2 |
| 10 | Advanced tricks | 2 | 0 / 2 |
| | **Total** | **35** | **1 / 35** |

---

## Phase 1 — Array & String Traversal
**Lesson:** `foundations`

- [ ] **Learn:** a single pass with a few tracking variables; building a result as you scan; digit extraction with `% 10` and `// 10`; scanning from the right.

- [x] 🟢 `q01_second_largest_element/` · [LC #414 ≈](https://leetcode.com/problems/third-maximum-number/) — Look for: keep `largest` and `second` in one pass. Watch out for duplicates.
- [ ] 🟢 `q06_reverse_string_word_wise/` · [LC #151 ≈](https://leetcode.com/problems/reverse-words-in-a-string/) — Look for: split into words, then reverse. Bonus: do it without `split()`.
- [ ] 🟢 `q07_encode_the_message/` · [LC #443 ≈](https://leetcode.com/problems/string-compression/) — Look for: group consecutive equal characters; flush the last group.
- [ ] 🟢 `q18_largest_odd_number_in_string/` · [LC #1903](https://leetcode.com/problems/largest-odd-number-in-string/) — Look for: only the last digit decides odd/even. Scan from the right.
- [ ] 🟢 `q19_longest_common_prefix/` · [LC #14](https://leetcode.com/problems/longest-common-prefix/) — Look for: compare column by column across all strings.
- [ ] 🟡 `q16_reverse_integer/` · [LC #7](https://leetcode.com/problems/reverse-integer/) — Look for: digit pop/push, the sign, and checking for overflow *before* it happens.

---

## Phase 2 — Hashing & Counting
**Lesson:** `arrays-hashing`

- [ ] **Learn:** `dict` / `set` for O(1) lookup; frequency maps (`Counter`); "have I seen the complement?"; bucket sort by frequency; two-way mappings.

- [ ] 🟢 `q34_two_sum/` · [LC #1](https://leetcode.com/problems/two-sum/) — Look for: store `value → index` and look up `target - x`.
- [ ] 🟢 `q15_make_unique_array/` · [LC #217 ≈](https://leetcode.com/problems/contains-duplicate/) — Look for: answer = `n - number of distinct values`.
- [ ] 🟢 `q21_isomorphic_strings/` · [LC #205](https://leetcode.com/problems/isomorphic-strings/) — Look for: the mapping must be one-to-one, so check both directions.
- [ ] 🟢 `q27_find_the_largest_almost_missing_integer/` · [LC #3471](https://leetcode.com/problems/find-the-largest-almost-missing-integer/) — Look for: count occurrences, then think about which positions can be in exactly one window (edge cases `k == 1` and `k == n`).
- [ ] 🟡 `q23_sort_characters_by_frequency/` · [LC #451](https://leetcode.com/problems/sort-characters-by-frequency/) — Look for: count, then sort by count (or use buckets indexed by count).
- [ ] 🟢 `q29_majority_element/` · [LC #169](https://leetcode.com/problems/majority-element/) — Solve with a hashmap first, then the follow-up: **Boyer–Moore voting** (O(1) space).
- [ ] 🟢 `q26_missing_number/` · [LC #268](https://leetcode.com/problems/missing-number/) — Solve with a set first, then the follow-up: **sum formula** or **XOR** (O(1) space).

---

## Phase 3 — Two Pointers (In-Place)
**Lesson:** `two-pointers`

- [ ] **Learn:** the read/write pointer (slow/fast) for in-place edits; opposite-end pointers on a sorted array; skipping duplicates.

- [ ] 🟢 `q24_move_zeroes/` · [LC #283](https://leetcode.com/problems/move-zeroes/) — Look for: a write pointer for the next non-zero slot.
- [ ] 🟢 `q25_remove_duplicates_from_sorted_array/` · [LC #26](https://leetcode.com/problems/remove-duplicates-from-sorted-array/) — Look for: the same write-pointer idea; compare with the last kept value.
- [ ] 🟡 `q31_rearrange_array_elements_by_sign/` · [LC #2149 ≈](https://leetcode.com/problems/rearrange-array-elements-by-sign/) — Look for: two write indices, even slots for positives and odd slots for negatives.
- [ ] 🟡 `q35_3sum/` · [LC #15](https://leetcode.com/problems/3sum/) — Look for: sort, fix one number, then two pointers on the rest. Skip duplicates at both levels.

---

## Phase 4 — Reversal / Rotation Trick
**Lesson:** `two-pointers` (reverse in place)

- [ ] **Learn:** `k %= n`; rotating by reversing (reverse all, then each part); "rotation of s" means it is a substring of `s + s`.

- [ ] 🟢 `q02_rotate_array_by_k/` · [LC #189 ≈](https://leetcode.com/problems/rotate-array/) — Left rotation. Try slicing first, then the 3-reversal trick.
- [ ] 🟡 `q17_rotate_array/` · [LC #189](https://leetcode.com/problems/rotate-array/) — Right rotation, in place, O(1) space. Same trick in the other direction.
- [ ] 🟢 `q22_rotate_string/` · [LC #796](https://leetcode.com/problems/rotate-string/) — Look for: the lengths must be equal and `goal in s + s`.

---

## Phase 5 — Prefix Sums
**Lesson:** `prefix-sums`

- [ ] **Learn:** `prefix[i]` = sum of everything before `i`; range sum in O(1); `left = running`, `right = total - running - arr[i]`.

- [ ] 🟢 `q04_equilibrium_index/` · [LC #724](https://leetcode.com/problems/find-pivot-index/) — Look for: keep a running left sum and the total.
- [ ] 🔴 `q28_sum_of_distances/` · [LC #2615](https://leetcode.com/problems/sum-of-distances/) — Look for: group indices by value; within a group use prefix sums of the indices. Distance to the left = `count_left * i - sum_left`. Do it last in this phase.

---

## Phase 6 — Sliding Window
**Lesson:** `sliding-window`

- [ ] **Learn:** a variable-size window; expand right, shrink left while invalid; keep a window sum as you go.

- [ ] 🟡 `q20_frequency_of_the_most_frequent_element/` · [LC #1838](https://leetcode.com/problems/frequency-of-the-most-frequent-element/) — Look for: sort first. Window `[l..r]` is valid if `nums[r] * len - window_sum <= k`.

---

## Phase 7 — Greedy & Balance Counting
**Lesson:** `greedy` (+ `stack` for parentheses)

- [ ] **Learn:** make the locally best choice and justify it; open/close balance counters (a stack without the stack); comparing against all possible targets.

- [ ] 🟢 `q09_minimum_parentheses/` · [LC #921 ≈](https://leetcode.com/problems/minimum-add-to-make-parentheses-valid/) — Look for: a `balance` counter. When it would go negative, you need an extra `(`.
- [ ] 🟢 `q08_beautiful_string/` · [LC #1758](https://leetcode.com/problems/minimum-changes-to-make-alternating-binary-string/) — Look for: only two possible targets (`0101…` and `1010…`). Count mismatches against one; the other is `n - that`.
- [ ] 🟡 `q03_non_decreasing_array/` · [LC #665](https://leetcode.com/problems/non-decreasing-array/) — Look for: at the first drop, decide whether to lower `arr[i]` or raise `arr[i+1]`, then make sure it never happens twice.

---

## Phase 8 — Matrix (2D) Traversal
**Lesson:** `math-geometry`

- [ ] **Learn:** row/column indexing; direction arrays `[(0,1),(1,0),(0,-1),(-1,0)]` with bounds checks; transpose; boundary-shrinking traversal; using the first row/column as markers.

- [ ] 🟢 `q12_matrix_is_symmetric/` · [LC #867 ≈](https://leetcode.com/problems/transpose-matrix/) — Look for: compare `m[i][j]` with `m[j][i]` (only the upper triangle is needed).
- [ ] 🟢 `q11_sum_of_zeroes/` · [LC #463 ≈](https://leetcode.com/problems/island-perimeter/) — Look for: for each 0, count 1-neighbours using the direction array.
- [ ] 🟡 `q13_inplace_rotate_matrix_90_degree/` · [LC #48 ≈](https://leetcode.com/problems/rotate-image/) — Look for: anti-clockwise = transpose + reverse each **column** (or reverse rows, then transpose).
- [ ] 🟡 `q32_spiral_matrix/` · [LC #54](https://leetcode.com/problems/spiral-matrix/) — Look for: four boundaries (`top`, `bottom`, `left`, `right`); shrink one after each side.
- [ ] 🟡 `q14_set_matrix_zeros/` · [LC #73](https://leetcode.com/problems/set-matrix-zeroes/) — Solve with row/column sets first, then the O(1)-space version (first row/column as markers).

---

## Phase 9 — Building Rows (Intro to DP)
**Lesson:** `dp-1d`

- [ ] **Learn:** build each answer from the previous one; reuse one array and update it right-to-left to save space.

- [ ] 🟢 `q30_pascals_triangle/` · [LC #118](https://leetcode.com/problems/pascals-triangle/) — Look for: `row[j] = prev[j-1] + prev[j]`.
- [ ] 🟢 `q33_pascals_triangle_ii/` · [LC #119](https://leetcode.com/problems/pascals-triangle-ii/) — Follow-up: a single array updated **right to left** (O(rowIndex) space).

---

## Phase 10 — Advanced Tricks (Do Last)
**Lessons:** `arrays-hashing` (index as hash), `math-geometry`

- [ ] **Learn:** using the array's own indices as a hash (cyclic sort / sign marking); mirroring a number and propagating a carry.

- [ ] 🔴 `q05_first_missing_positive/` · [LC #41](https://leetcode.com/problems/first-missing-positive/) — Look for: the answer is in `1..n+1`. Put each value `v` at index `v-1` (cyclic sort), then find the first mismatch.
- [ ] 🔴 `q10_next_smallest_palindrome/` · [LC #564 ≈](https://leetcode.com/problems/find-the-closest-palindrome/) — Look for: mirror the left half onto the right; if that isn't bigger, add 1 to the middle and carry left. Handle the all-9s case (`999 → 1001`).

---

## Review (Spaced Repetition)

Re-solve from scratch without looking at your old code. Note any question you needed a hint for here.

| Question | First solved | Review +3 days | Review +7 days | Review +21 days |
|---|---|---|---|---|
| | | [ ] | [ ] | [ ] |
| | | [ ] | [ ] | [ ] |
| | | [ ] | [ ] | [ ] |

---

## Pattern Cheat-Sheet (fill in as you learn)

| Pattern | Signal in the problem | Template idea | My notes |
|---|---|---|---|
| Hashing | "find pair / seen before / count" | `seen = {}` | |
| Two pointers | "sorted", "in-place", "pair sum" | `l, r` or `read, write` | |
| Reversal trick | "rotate by k" | reverse all + reverse parts | |
| Prefix sums | "sum left vs right", "range sum" | `running`, `total - running` | |
| Sliding window | "longest/shortest subarray with condition" | expand `r`, shrink `l` | |
| Greedy / balance | "minimum additions", "at most one change" | counter / local choice | |
| Matrix | "rotate / spiral / neighbours" | directions + boundaries | |
| Row DP | "build from previous row" | `new[j] = prev[j-1] + prev[j]` | |
| Index as hash | "O(n) time, O(1) space, values in 1..n" | cyclic sort | |
