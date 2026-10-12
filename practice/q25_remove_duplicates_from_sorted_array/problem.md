# Q25. Remove Duplicates from Sorted Array

- **LeetCode:** <https://leetcode.com/problems/remove-duplicates-from-sorted-array/> (#26, Easy)

## Problem

Given an integer array nums sorted in non-decreasing order, remove the
duplicates IN PLACE so that each unique element appears only once. Keep the
relative order of the elements the same.

Let k be the number of unique elements. After removing duplicates, return k.

The first k elements of nums should contain the unique numbers in sorted order.
Elements beyond index k - 1 can be ignored.

## Custom Judge

```text
    int[] nums = [...];          // Input array
    int[] expectedNums = [...];  // Expected answer with correct length

    int k = removeDuplicates(nums);

    assert k == expectedNums.length;
    for (int i = 0; i < k; i++) {
        assert nums[i] == expectedNums[i];
    }
```

If all assertions pass, your solution is accepted.

## Example 1

```text
Input:  nums = [1,1,2]
Output: 2, nums = [1,2,_]
Explanation: Return k = 2 with the first two elements being 1 and 2.
             What is left beyond k does not matter (shown as _).
```

## Example 2

```text
Input:  nums = [0,0,1,1,1,2,2,3,3,4]
Output: 5, nums = [0,1,2,3,4,_,_,_,_,_]
Explanation: Return k = 5 with the first five elements being 0, 1, 2, 3, 4.
             What is left beyond k does not matter (shown as _).
```

## Constraints

```text
1 <= nums.length <= 3 * 10^4
-100 <= nums[i] <= 100
nums is sorted in non-decreasing order.
```
