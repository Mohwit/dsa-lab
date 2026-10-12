# Q31. Rearrange Array Elements by Sign

- **LeetCode:** <https://leetcode.com/problems/rearrange-array-elements-by-sign/> (#2149, Medium)

## Problem

You are given a 0-indexed integer array nums of EVEN length with an equal number
of positive and negative integers.

Return nums rearranged so that:

```text
  1. Every consecutive pair of integers has opposite signs.
  2. Integers with the same sign keep their original relative order.
  3. The rearranged array begins with a positive integer.
```

## Example 1

```text
Input:  nums = [3,1,-2,-5,2,-4]
Output: [3,-2,1,-5,2,-4]
Explanation:
  Positives: [3,1,2]. Negatives: [-2,-5,-4].
  The only arrangement satisfying all conditions is [3,-2,1,-5,2,-4].
  [1,-2,2,-5,3,-4], [3,1,2,-2,-5,-4] and [-2,3,-5,1,-4,2] are incorrect because
  they break one or more conditions.
```

## Example 2

```text
Input:  nums = [-1,1]
Output: [1,-1]
Explanation: 1 is the only positive and -1 the only negative, so the result is
             [1,-1].
```

## Constraints

```text
2 <= nums.length <= 2 * 10^5
nums.length is even
1 <= |nums[i]| <= 10^5
nums has an equal number of positive and negative integers.

Note: It is not required to do the modifications in place.
```
