# Q26. Missing Number

- **LeetCode:** <https://leetcode.com/problems/missing-number/> (#268, Easy)

## Problem

Given an array nums containing n DISTINCT numbers in the range [0, n], return
the only number in the range that is missing from the array.

## Example 1

```text
Input:  nums = [3,0,1]
Output: 2
Explanation: n = 3, so the range is [0,3]. 2 is missing.
```

## Example 2

```text
Input:  nums = [0,1]
Output: 2
Explanation: n = 2, so the range is [0,2]. 2 is missing.
```

## Example 3

```text
Input:  nums = [9,6,4,2,3,5,7,0,1]
Output: 8
Explanation: n = 9, so the range is [0,9]. 8 is missing.
```

## Constraints

```text
n == nums.length
1 <= n <= 10^4
0 <= nums[i] <= n
All the numbers of nums are unique.
```

## Follow up

Could you implement a solution using only O(1) extra space and O(n) runtime?
