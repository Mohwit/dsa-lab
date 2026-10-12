# Q14. Set Matrix Zeros

- **LeetCode:** <https://leetcode.com/problems/set-matrix-zeroes/> (#73, Medium)

## Problem

You are given an N x M integer matrix. Modify it IN PLACE so that if any cell
contains 0, every cell in that cell's row and column is also set to 0.

Requirements:

```text
  - If a cell has value 0, set all cells in its row and column to 0.
  - Do it in place (no additional matrices).
```

## Example

```text
Input:              Output:
  [7, 19, 3]          [7, 19, 0]
  [4, 21, 0]          [0,  0, 0]
```

## Sample Input 1

```text
2
2 3
7 19 3
4 21 0
3 3
1 2 3
4 0 6
7 8 9
```

## Sample Output 1

```text
7 19 0
0 0 0
1 0 3
0 0 0
7 0 9

Explanation:
  Test case 1: Same as the example above.
  Test case 2: Only cell (2, 2) is zero, so the whole 2nd row and 2nd column
               become zero.
```

## Sample Input 2

```text
2
4 2
1 0
2 7
3 0
4 8
3 3
0 2 3
1 0 3
1 2 0
```

## Sample Output 2

```text
0 0
2 0
0 0
4 0
0 0 0
0 0 0
0 0 0
```
