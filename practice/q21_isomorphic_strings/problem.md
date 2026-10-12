# Q21. Isomorphic Strings

- **LeetCode:** <https://leetcode.com/problems/isomorphic-strings/> (#205, Easy)

## Problem

Given two strings s and t, determine if they are isomorphic.

Two strings s and t are isomorphic if the characters in s can be replaced to
get t.

All occurrences of a character must be replaced with another character while
preserving the order of characters. No two characters may map to the same
character, but a character may map to itself.

## Example 1

```text
Input:  s = "egg", t = "add"
Output: true
Explanation: Map 'e' -> 'a' and 'g' -> 'd'.
```

## Example 2

```text
Input:  s = "f11", t = "b23"
Output: false
Explanation: '1' would need to map to both '2' and '3'.
```

## Example 3

```text
Input:  s = "paper", t = "title"
Output: true
```

## Constraints

```text
1 <= s.length <= 5 * 10^4
t.length == s.length
s and t consist of any valid ascii character.
```
