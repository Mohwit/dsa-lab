# Q15. Make Unique Array

- **LeetCode:** <https://leetcode.com/problems/contains-duplicate/> (#217, Easy)
- **Note:** No exact LeetCode version. 217 is the same hashing idea (detect duplicates); here answer = n - number of distinct values.

## Problem

You are given an array ARR of size N. Find the MINIMUM number of elements to
remove so that all remaining elements are distinct, i.e. there is no I != J
with ARR[I] == ARR[J].

## Example

```text
N = 4, ARR = [1, 2, 1, 2]
Answer = 2 (1 and 2 are each repeated once, so remove 2 elements).
```

## Constraints

```text
1 <= T <= 10
1 <= N <= 5000
0 <= ARR[i] <= 10^6
Time limit: 1 sec
```

## Sample Input 1

```text
2
4
1 2 1 2
5
3 6 7 12 13
```

## Sample Output 1

```text
2
0

Explanation:
  Test case 1: Elements at index 2 and 3 are repeats -> remove 2 elements.
  Test case 2: All elements are already unique -> remove 0.
```

## Sample Input 2

```text
2
4
1 1 1 1
5
1 2 3 1 2
```

## Sample Output 2

```text
3
2
```
