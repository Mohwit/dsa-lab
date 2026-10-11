"""Two Sum. Reference solution (the code the page traces)."""


def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}                  # value -> index
    for i, x in enumerate(nums):
        need = target - x      # the partner x needs
        if need in seen:       # partner already passed?
            return [seen[need], i]
        seen[x] = i            # store AFTER the check
    return []                  # no pair found
