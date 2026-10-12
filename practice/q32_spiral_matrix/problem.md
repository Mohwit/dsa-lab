# Q32. Spiral Matrix

- **LeetCode:** <https://leetcode.com/problems/spiral-matrix/> (#54, Medium)

## Problem

Given an m x n matrix, return all elements of the matrix in spiral order.

## Example 1

![spiral_matrix_ex1.jpg](../images/spiral_matrix_ex1.jpg)
<sub>source: https://assets.leetcode.com/uploads/2020/11/13/spiral1.jpg</sub>

```text
    1 → 2 → 3
            ↓
    4 → 5   6
    ↑       ↓
    7 ← 8 ← 9

Input:  matrix = [[1,2,3],[4,5,6],[7,8,9]]
Output: [1,2,3,6,9,8,7,4,5]
```

## Example 2

![spiral_matrix_ex2.jpg](../images/spiral_matrix_ex2.jpg)
<sub>source: https://assets.leetcode.com/uploads/2020/11/13/spiral.jpg</sub>

```text
    1  →  2  →  3  →  4
                      ↓
    5  →  6  →  7     8
    ↑                 ↓
    9  ← 10  ← 11  ← 12

Input:  matrix = [[1,2,3,4],[5,6,7,8],[9,10,11,12]]
Output: [1,2,3,4,8,12,11,10,9,5,6,7]
```

## Constraints

```text
m == matrix.length
n == matrix[i].length
1 <= m, n <= 10
-100 <= matrix[i][j] <= 100
```
