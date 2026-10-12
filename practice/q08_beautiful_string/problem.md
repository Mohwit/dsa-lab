# Q8. Beautiful String

- **LeetCode:** <https://leetcode.com/problems/minimum-changes-to-make-alternating-binary-string/> (#1758, Easy)

## Problem

You are given a binary string STR containing only '0' and '1'. A binary string
is BEAUTIFUL if it contains alternating 0s and 1s.

```text
  e.g. "0101", "1010", "101", "010" are beautiful.
```

In one operation you can flip a '0' to '1' or vice versa.
Find the MINIMUM number of operations needed to make STR beautiful.

## Example

```text
STR = "0010" -> 1 operation.
Flip the '0' at index 0 to '1' -> "1010", which is beautiful.
```

## Constraints

```text
1 <= T <= 100
2 <= |STR| <= 10^5
STR[i] = '1' or '0'
Time limit: 1 sec
```

## Sample Input 1

```text
2
0000
1010
```

## Sample Output 1

```text
2
0

Explanation:
  Test case 1: Target "1010" -> flip index 0 and 2   (2 ops)
               Target "0101" -> flip index 1 and 3   (2 ops)
               Minimum = 2.
  Test case 2: Already beautiful -> 0.
```

## Sample Input 2

```text
2
01011
1001
```

## Sample Output 2

```text
1
2

Explanation:
  Test case 1: Target "10101" -> flip index 0, 1, 2, 3   (4 ops)
               Target "01010" -> flip index 4            (1 op)
               Minimum = 1.
  Test case 2: Target "1010" -> flip index 2, 3          (2 ops)
               Target "0101" -> flip index 0, 1          (2 ops)
               Minimum = 2.
```
