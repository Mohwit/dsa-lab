"""Contains Duplicate. Reference solution (the code the page traces).

Pattern: arrays and hashing. Walk once and remember every number in a set.
O(n) time on average, O(n) extra space.
"""


def contains_duplicate(nums: list[int]) -> bool:
    seen = set()
    for x in nums:
        if x in seen:
            return True
        seen.add(x)
    return False
