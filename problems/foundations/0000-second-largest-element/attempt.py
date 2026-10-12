# Q1. Second Largest Element
# Problem: problem.md
# LeetCode: https://leetcode.com/problems/third-maximum-number/


def second_largest_element(arr:list[int]) -> int:

    ## remove duplicate
    arr =list(set(arr))

    if len(arr) < 2:
        return -1

    ## sorting the array
    arr.sort(reverse=True)
    return arr[1]

if __name__ == "__main__":
    arr = [12, 1, 35, 10, 34, 1]
    print(second_largest_element(arr))
