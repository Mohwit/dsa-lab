# Q2. Rotate An Array By K

- **LeetCode:** <https://leetcode.com/problems/rotate-array/> (#189, Medium)
- **Note:** LeetCode rotates RIGHT. Rotating left by k = rotating right by n - k.

## Problem

Given an array arr with n elements, rotate the array to the LEFT by k steps,
where k is non-negative.

## Example

```text
arr = [1, 2, 3, 4, 5]
k = 1  ->  [2, 3, 4, 5, 1]
k = 2  ->  [3, 4, 5, 1, 2]
k = 3  ->  [4, 5, 1, 2, 3]  ... and so on.
```

## Sample Input 1

```text
8
7 5 2 11 2 43 1 1
2
```

## Sample Output 1

```text
2 11 2 43 1 1 7 5

Explanation:
  Rotate 1 step left:  5 2 11 2 43 1 1 7
  Rotate 2 steps left: 2 11 2 43 1 1 7 5
```

## Sample Input 2

```text
4
5 6 7 8
3
```

## Sample Output 2

```text
8 5 6 7

Explanation:
  Rotate 1 step left:  6 7 8 5
  Rotate 2 steps left: 7 8 5 6
  Rotate 3 steps left: 8 5 6 7
```

## Expected Time Complexity

O(n), where n is the size of arr.

## Constraints

```text
1 <= n <= 10^3
1 <= arr[i] <= 10^9
1 <= k < n
```

## Hints

1. For an index i, find where it lands after k rotations.
2. Rotate once and observe how the position of every element changes.
