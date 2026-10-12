# Q18. Largest Odd Number in String

- **LeetCode:** <https://leetcode.com/problems/largest-odd-number-in-string/> (#1903, Easy)

## Problem

You are given a string num representing a large integer. Return the
largest-valued ODD integer (as a string) that is a non-empty substring of num,
or an empty string "" if no odd integer exists.

A substring is a contiguous sequence of characters within a string.

## Example 1

```text
Input:  num = "52"
Output: "5"
Explanation: The substrings are "5", "2" and "52". "5" is the only odd number.
```

## Example 2

```text
Input:  num = "4206"
Output: ""
Explanation: There are no odd numbers in "4206".
```

## Example 3

```text
Input:  num = "35427"
Output: "35427"
Explanation: "35427" is already an odd number.
```

## Constraints

```text
1 <= num.length <= 10^5
num consists only of digits and has no leading zeros.
```
