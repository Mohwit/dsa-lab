# Q11. Sum Of Zeroes

- **LeetCode:** <https://leetcode.com/problems/island-perimeter/> (#463, Easy)
- **Note:** No exact LeetCode version. 463 uses the same idea: count 0-1 neighbour edges with a direction array.

## Problem

You are given a binary matrix (only 0s and 1s) of size N x M. Return the sum of
the coverages of all zeros in the matrix.

Coverage of a 0 = number of 1s immediately around it
(left, right, up and down).

## Constraints

```text
1 <= T <= 10
1 <= N, M <= 10^3
Time limit: 1 sec
```

## Sample Input 1

```text
1
2 2
1 0
0 1
```

## Sample Output 1

```text
4

Explanation:
  There are 2 zeros.
  0 at (row 1, col 2): neighbours left = 1, down = 1  -> coverage 2
  0 at (row 2, col 1): neighbours up = 1, right = 1   -> coverage 2
  Total coverage = 2 + 2 = 4.
```

## Sample Input 2

```text
1
2 3
0 0 0
0 0 0
```

## Sample Output 2

```text
0
```
