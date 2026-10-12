"""Second Largest Element. Reference solution (the code the page traces)."""


def second_largest_element(arr: list[int]) -> int:
    first = second = None
    for x in arr:
        if first is None or x > first:
            first, second = x, first
        elif x < first and (second is None or x > second):
            second = x
    return -1 if second is None else second
