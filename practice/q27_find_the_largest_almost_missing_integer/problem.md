# Q27. Find the Largest Almost Missing Integer

- **LeetCode:** <https://leetcode.com/problems/find-the-largest-almost-missing-integer/> (#3471, Easy)

## Problem

You are given an integer array nums and an integer k.

An integer x is ALMOST MISSING from nums if x appears in exactly ONE subarray
of size k within nums.

Return the largest almost missing integer from nums. If no such integer exists,
return -1.

A subarray is a contiguous sequence of elements within an array.

## Example 1

```text
Input:  nums = [3,9,2,1,7], k = 3
Output: 7
Explanation:
  1 appears in 2 subarrays of size 3: [9,2,1], [2,1,7]
  2 appears in 3 subarrays of size 3: [3,9,2], [9,2,1], [2,1,7]
  3 appears in 1 subarray  of size 3: [3,9,2]
  7 appears in 1 subarray  of size 3: [2,1,7]
  9 appears in 2 subarrays of size 3: [3,9,2], [9,2,1]
  7 is the largest integer appearing in exactly one subarray of size k.
```

## Example 2

```text
Input:  nums = [3,9,7,2,1,7], k = 4
Output: 3
Explanation:
  1 appears in 2 subarrays of size 4: [9,7,2,1], [7,2,1,7]
  2 appears in 3 subarrays of size 4: [3,9,7,2], [9,7,2,1], [7,2,1,7]
  3 appears in 1 subarray  of size 4: [3,9,7,2]
  7 appears in 3 subarrays of size 4: [3,9,7,2], [9,7,2,1], [7,2,1,7]
  9 appears in 2 subarrays of size 4: [3,9,7,2], [9,7,2,1]
  3 is the largest (and only) integer appearing in exactly one subarray.
```

## Example 3

```text
Input:  nums = [0,0], k = 1
Output: -1
Explanation: No integer appears in only one subarray of size 1.
```

## Constraints

```text
1 <= nums.length <= 50
0 <= nums[i] <= 50
1 <= k <= nums.length
```
