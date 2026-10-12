# Q7. Encode the Message

- **LeetCode:** <https://leetcode.com/problems/string-compression/> (#443, Medium)
- **Note:** Close match. 443 compresses in place and omits the count when it is 1 ('abb' -> 'ab2'). Also see #3163 String Compression III: https://leetcode.com/problems/string-compression-iii/

## Problem

You are given a text message. Return its Run-Length Encoding.

Run-length encoding represents repeated successive characters as the character
followed by its count.
Example: "aaaabbbccdaa" -> "a4b3c2d1a2"

## Constraints

```text
1 <= T <= 10
1 <= N <= 10^5   (N = length of the message)
Time limit: 1 sec
```

## Sample Input 1

```text
3
aabbc
abcd
abbdcaas
```

## Sample Output 1

```text
a2b2c1
a1b1c1d1
a1b2d1c1a2s1

Explanation:
  Test case 1: 2 'a', 2 'b', 1 'c'                        -> "a2b2c1"
  Test case 2: 1 'a', 1 'b', 1 'c', 1 'd'                 -> "a1b1c1d1"
  Test case 3: 1 'a', 2 'b', 1 'd', 1 'c', 2 'a', 1 's'   -> "a1b2d1c1a2s1"
```

## Sample Input 2

```text
2
sadasd
adsad
```

## Sample Output 2

```text
s1a1d1a1s1d1
a1d1s1a1d1
```
