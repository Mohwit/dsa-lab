# Q17. Rotate Array

- **LeetCode:** <https://leetcode.com/problems/rotate-array/> (#189, Medium)

## Problem

Given an integer array nums, rotate the array to the RIGHT by k steps, where k
is non-negative.

## Example 1

```text
Input:  nums = [1,2,3,4,5,6,7], k = 3
Output: [5,6,7,1,2,3,4]
Explanation:
  rotate 1 step right:  [7,1,2,3,4,5,6]
  rotate 2 steps right: [6,7,1,2,3,4,5]
  rotate 3 steps right: [5,6,7,1,2,3,4]
```

## Example 2

```text
Input:  nums = [-1,-100,3,99], k = 2
Output: [3,99,-1,-100]
Explanation:
  rotate 1 step right:  [99,-1,-100,3]
  rotate 2 steps right: [3,99,-1,-100]
```

## Constraints

```text
1 <= nums.length <= 10^5
-2^31 <= nums[i] <= 2^31 - 1
0 <= k <= 10^5
```
