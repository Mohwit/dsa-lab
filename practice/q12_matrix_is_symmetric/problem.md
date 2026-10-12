# Q12. Matrix Is Symmetric

- **LeetCode:** <https://leetcode.com/problems/transpose-matrix/> (#867, Easy)
- **Original:** <https://www.naukri.com/code360/problems/matrix-is-symmetric_799361>
- **Note:** No exact LeetCode version. 867 builds the transpose; a matrix is symmetric when it equals its transpose.

## Problem

You are given a square matrix. Return true if the matrix is symmetric,
otherwise return false.

A symmetric matrix is one whose transpose equals the matrix itself,
i.e. matrix[i][j] == matrix[j][i] for every i, j.

Example of a symmetric matrix:

```text
      Matrix            Transpose
    [ 1  2  3 ]        [ 1  2  3 ]
    [ 2  4  5 ]   ==   [ 2  4  5 ]
    [ 3  5  8 ]        [ 3  5  8 ]
```

## Constraints

```text
1 <= T <= 10
1 <= N <= 10^2
-10^9 <= data <= 10^9
Time limit: 1 sec
```

## Sample Input 1

```text
1
3
1 2 3 2 4 5 3 5 8
```

## Sample Output 1

```text
Yes

Explanation:
      Matrix            Transpose
    [ 1  2  3 ]        [ 1  2  3 ]
    [ 2  4  5 ]   ==   [ 2  4  5 ]
    [ 3  5  8 ]        [ 3  5  8 ]
  The transpose equals the matrix, so it is symmetric.
```

## Sample Input 2

```text
1
3
1 2 3 1 4 5 3 5 8
```

## Sample Output 2

```text
No

Explanation:
      Matrix            Transpose
    [ 1  2  3 ]        [ 1  1  3 ]
    [ 1  4  5 ]   !=   [ 2  4  5 ]
    [ 3  5  8 ]        [ 3  5  8 ]
  matrix[0][1] = 2 but matrix[1][0] = 1, so it is not symmetric.
```
