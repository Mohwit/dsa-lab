# Q4. Equilibrium Index

- **LeetCode:** <https://leetcode.com/problems/find-pivot-index/> (#724, Easy)

## Problem

You are given an array Arr of N integers. Find the equilibrium index of the array.

An index is an equilibrium index if the sum of elements to its LEFT equals the
sum of elements to its RIGHT.

Notes:

```text
  1. The array is 0-indexed; return the 0-based index.
  2. The element at the equilibrium index is not counted in either sum.
  3. If multiple indices qualify, return the left-most (minimum) one.
  4. If no such index exists, return -1.
```

## Constraints

```text
1 <= T <= 50
1 <= N <= 10^5
-10^4 <= Arr[i] <= 10^4
Time limit: 1 sec
```

## Sample Input 1

```text
1
6
1 7 3 6 5 6
```

## Sample Output 1

```text
3

Explanation:
  Left sum of arr[3]  = 1 + 7 + 3 = 11
  Right sum of arr[3] = 5 + 6     = 11
  So the answer is 3.
```

## Sample Input 2

```text
2
6
1 2 2 9 3 2
4
1 2 3 4
```

## Sample Output 2

```text
3
-1

Explanation:
  Test case 1: Left sum of index 3 (arr[3] = 9) is 5, equal to the right sum.
  Test case 2: No such index exists, so -1.
```
