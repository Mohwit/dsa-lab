# Q23. Sort Characters By Frequency

- **LeetCode:** <https://leetcode.com/problems/sort-characters-by-frequency/> (#451, Medium)

## Problem

Given a string s, sort it in DECREASING order of character frequency. The
frequency of a character is the number of times it appears in the string.

Return the sorted string. If there are multiple answers, return any of them.

## Example 1

```text
Input:  s = "tree"
Output: "eert"
Explanation: 'e' appears twice while 'r' and 't' appear once, so 'e' must come
             before both. "eetr" is also a valid answer.
```

## Example 2

```text
Input:  s = "cccaaa"
Output: "aaaccc"
Explanation: Both 'c' and 'a' appear 3 times, so "cccaaa" and "aaaccc" are both
             valid. "cacaca" is incorrect: same characters must be together.
```

## Example 3

```text
Input:  s = "Aabb"
Output: "bbAa"
Explanation: "bbaA" is also valid, but "Aabb" is not.
             'A' and 'a' are treated as different characters.
```

## Constraints

```text
1 <= s.length <= 5 * 10^5
s consists of uppercase and lowercase English letters and digits.
```
