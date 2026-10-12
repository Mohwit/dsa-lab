# Q20. Frequency of the Most Frequent Element

- **LeetCode:** <https://leetcode.com/problems/frequency-of-the-most-frequent-element/> (#1838, Medium)

## Problem

The frequency of an element is the number of times it occurs in an array.

You are given an integer array nums and an integer k. In one operation you can
choose an index of nums and increment the element at that index by 1.

Return the maximum possible frequency of an element after performing AT MOST k
operations.

## Example 1

```text
Input:  nums = [1,2,4], k = 5
Output: 3
Explanation: Increment the first element 3 times and the second element 2
             times to get nums = [4,4,4]. 4 has a frequency of 3.
```

## Example 2

```text
Input:  nums = [1,4,8,13], k = 5
Output: 2
Explanation: There are multiple optimal solutions:
  - Increment the 1st element 3 times -> [4,4,8,13].  4 has frequency 2.
  - Increment the 2nd element 4 times -> [1,8,8,13].  8 has frequency 2.
  - Increment the 3rd element 5 times -> [1,4,13,13]. 13 has frequency 2.
```

## Example 3

```text
Input:  nums = [3,9,6], k = 2
Output: 1
```

## Constraints

```text
1 <= nums.length <= 10^5
1 <= nums[i] <= 10^5
1 <= k <= 10^5
```
