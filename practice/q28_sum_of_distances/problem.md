# Q28. Sum of Distances

- **LeetCode:** <https://leetcode.com/problems/sum-of-distances/> (#2615, Medium)

## Problem

You are given a 0-indexed integer array nums.

Build an array arr of length nums.length where arr[i] is the sum of |i - j| over
all j such that nums[j] == nums[i] and j != i. If there is no such j, arr[i] = 0.

Return the array arr.

## Example 1

```text
Input:  nums = [1,3,1,1,2]
Output: [5,0,3,4,0]
Explanation:
  i = 0: nums[0] == nums[2] == nums[3] -> arr[0] = |0-2| + |0-3| = 5
  i = 1: no other index with value 3   -> arr[1] = 0
  i = 2: nums[2] == nums[0] == nums[3] -> arr[2] = |2-0| + |2-3| = 3
  i = 3: nums[3] == nums[0] == nums[2] -> arr[3] = |3-0| + |3-2| = 4
  i = 4: no other index with value 2   -> arr[4] = 0
```

## Example 2

```text
Input:  nums = [0,5,3]
Output: [0,0,0]
Explanation: All elements are distinct, so arr[i] = 0 for all i.
```

## Constraints

```text
1 <= nums.length <= 10^5
0 <= nums[i] <= 10^9
```
