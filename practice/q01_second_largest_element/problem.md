# Q1. Second Largest Element

- **LeetCode:** <https://leetcode.com/problems/third-maximum-number/> (#414, Easy)
- **Note:** Closest match, not identical. LeetCode has no plain 'second largest'; 414 asks for the THIRD distinct maximum (and returns the max if it doesn't exist). Same 'track top-k distinct values in one pass' idea.

## Problem

You are given an array/list ARR of integers. Find the second largest element
present in ARR.

Notes:

```text
  a) Duplicate elements may be present.
  b) If no such element exists, return -1.
```

## Example

```text
Input:  2 4 5 6 8
Output: 6
Explanation: 8 is the largest element, followed by 6, so 6 is the second largest.
```

## Constraints

```text
1 <= T <= 100
1 <= N <= 5000
-10^9 <= ARR[i] <= 10^9
Time limit: 1 sec
```

## Sample Input 1

```text
2
6
12 1 35 10 34 1
5
10 10 10 10 10
```

## Sample Output 1

```text
34
-1

Explanation:
  Test case 1: 35 is the largest, followed by 34 -> return 34.
  Test case 2: All elements are 10, so no second largest exists -> return -1.
```

## Sample Input 2

```text
1
6
7 8 8 1 4 3
```

## Sample Output 2

```text
7

Explanation:
  8 appears twice and is the largest; the next largest is 7.
```

## Hint

Think about how sorting the array can help.
