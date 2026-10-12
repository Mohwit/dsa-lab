# Q10. Next Smallest Palindrome

- **LeetCode:** <https://leetcode.com/problems/find-the-closest-palindrome/> (#564, Hard)
- **Note:** Closest match, not identical. 564 asks for the CLOSEST palindrome (smaller or larger, excluding itself); this one asks for the next STRICTLY GREATER one. Same mirror-the-left-half technique.

## Problem

You are given a number N as a string S. Find the smallest number STRICTLY
greater than N that is a palindrome.

Notes:

```text
  1) A palindrome reads the same backward and forward, e.g. "naman", "abcba",
     "1234321".
  2) The numeric value of S is greater than 0.
  3) A single-digit number is a palindrome.
  4) The length of S is the number of digits in N.
```

## Constraints

```text
1 <= T <= 100
1 <= len(S) <= 10^4
Time limit: 1 sec
```

## Sample Input 1

```text
1
4
1221
```

## Sample Output 1

```text
1331

Explanation:
  1331 is the smallest palindrome strictly greater than 1221.
```

## Sample Input 2

```text
1
3
999
```

## Sample Output 2

```text
1001

Explanation:
  1001 is the smallest palindrome strictly greater than 999.
```
