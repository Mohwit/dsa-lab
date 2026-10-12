# Q13. Inplace Rotate Matrix 90 Degree

- **LeetCode:** <https://leetcode.com/problems/rotate-image/> (#48, Medium)
- **Note:** LeetCode rotates CLOCKWISE. Anti-clockwise = transpose + reverse each column (or reverse each row first, then transpose).

## Problem

You are given an N x N square matrix of non-negative integers. Rotate it by
90 degrees ANTI-CLOCKWISE, without using any extra space.

## Example

```text
Input:                  After 90 deg anti-clockwise rotation:
    [ 1  2  3 ]             [ 3  6  9 ]
    [ 4  5  6 ]             [ 2  5  8 ]
    [ 7  8  9 ]             [ 1  4  7 ]
```

## Constraints

```text
1 <= T <= 50
1 <= N <= 100
1 <= ARR[i][j] <= 10^9
Time limit: 1 sec
```

## Sample Input 1

```text
2
3
1  2  3
4  5  6
7  8  9
4
1  2  3  4
5  6  7  8
9 10 11 12
13 14 15 16
```

## Sample Output 1

```text
3  6  9
2  5  8
1  4  7
4  8 12 16
3  7 11 15
2  6 10 14
1  5  9 13

Explanation:
  In both cases, the first row becomes the first column (read bottom to top),
  and similarly for the remaining rows.
```

## Sample Input 2

```text
2
3
7  4  1
8  5  2
9  6  3
4
13  9  5  1
14 10  6  2
15 11  7  3
16 12  8  4
```

## Sample Output 2

```text
1  2  3
4  5  6
7  8  9
1  2  3  4
5  6  7  8
9 10 11 12
13 14 15 16
```
