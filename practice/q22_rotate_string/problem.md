# Q22. Rotate String

- **LeetCode:** <https://leetcode.com/problems/rotate-string/> (#796, Easy)

## Problem

Given two strings s and goal, return true if and only if s can become goal
after some number of shifts on s.

A shift on s moves the leftmost character of s to the rightmost position.

```text
  e.g. s = "abcde" becomes "bcdea" after one shift.
```

## Example 1

```text
Input:  s = "abcde", goal = "cdeab"
Output: true
Explanation: Rotating s left by 2 moves "ab" to the end -> "cdeab" == goal.
```

## Example 2

```text
Input:  s = "abcde", goal = "abced"
Output: false
Explanation: No sequence of rotations of s produces "abced"; the characters
             appear in a different relative order.
```

## Constraints

```text
1 <= s.length, goal.length <= 100
s and goal consist of lowercase English letters.
```
