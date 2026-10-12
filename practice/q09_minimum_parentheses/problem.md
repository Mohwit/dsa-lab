# Q9. Minimum Parentheses

- **LeetCode:** <https://leetcode.com/problems/minimum-add-to-make-parentheses-valid/> (#921, Medium)
- **Original:** <https://www.naukri.com/code360/problems/mnfrj_1075018>

## Problem

Given a string "pattern" containing only '(' and ')', find the MINIMUM number
of parentheses ('(' or ')') that must be added so the resulting string is valid.

A string is valid if every opening '(' has a matching closing ')'.

```text
  Valid:   "(()(()))", "()()()", "((()))"
  Invalid: "(((", "(()", ")(())"
```

Note: Just implement the function and return the answer; printing is handled.

## Constraints

```text
1 <= T <= 50
1 <= N <= 10^4   (N = length of pattern)
Time limit: 1 sec
```

## Sample Input 1

```text
2
)((()
((
```

## Sample Output 1

```text
3
2

Explanation:
  Test case 1: pattern = ")((()"

      index:    0   1   2   3   4
      char:     )   (   (   (   )
                ^   ^   ^   └───┘
                |   |   |   valid pair
                |   └───┴── unmatched '(' -> need 2 x ')'
                └────────── unmatched ')' -> need 1 x '('

      Only the pair at indices 3-4 is valid. We need one '(' for index 0 and
      two ')' for indices 1 and 2 -> answer 3.

  Test case 2: pattern = "((" -> need two ')' -> answer 2.
```

## Sample Input 2

```text
2
(((((
))(
```

## Sample Output 2

```text
5
3
```
