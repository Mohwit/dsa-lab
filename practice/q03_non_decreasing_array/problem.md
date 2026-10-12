# Q3. Non-Decreasing Array

- **LeetCode:** <https://leetcode.com/problems/non-decreasing-array/> (#665, Medium)

## Problem

You are given an integer array/list ARR of size N. Check whether it can become
non-decreasing by modifying AT MOST 1 element.

An array is non-decreasing if ARR[i] <= ARR[i + 1] holds for every i (0-based)
such that 0 <= i <= N - 2.

## Constraints

```text
1 <= T <= 50
1 <= N <= 10^4
-10^9 <= ARR[i] <= 10^9
Time limit: 1 sec
```

## Sample Input 1

```text
2
3
8 4 6
3
8 4 2
```

## Sample Output 1

```text
true
false

Explanation:
  Test case 1: A possible non-decreasing array is 2 4 6
               (only the element at index 0 was modified).
  Test case 2: No way to make it non-decreasing by modifying at most 1 element.
```

## Sample Input 2

```text
2
6
-2 7 -1 0 1 2
5
-10 10 0 10 3
```

## Sample Output 2

```text
true
false

Explanation:
  Test case 1: A possible non-decreasing array is -2 -2 -1 0 1 2
               (only the element at index 1 was modified).
  Test case 2: No way to make it non-decreasing by modifying at most 1 element.
```
