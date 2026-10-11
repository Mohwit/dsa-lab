"""Heap and Priority Queue pattern lesson: every number on the page comes from this script.

Run:  python3 patterns/heap/measure.py

Counting rules (the page's JavaScript uses the same ones):
  comparisons = how many times two numbers are compared with < or > (or <= in merge sort).
  The heap is the textbook one drawn on the page:
    sift_up   compares the new item with its parent: 1 comparison per level climbed (and 1 for the stop)
    sift_down compares the two children (1, when there are two) and then the smaller child with the item (1)
  k_largest also counts its gate test `x > heap[0]`.
  The slow way is a top-down merge sort that counts each `left[i] <= right[j]`.
Python's heapq gives the same answers (checked below) but its sift_down is a slightly different variant,
so its exact comparison counts differ a little. The Big-O is the same.
"""
import heapq
import itertools


class Heap:
    """Textbook binary min-heap stored in a list, with a comparison counter."""

    def __init__(self):
        self.h = []
        self.comps = 0

    def push(self, x):
        self.h.append(x)
        self.sift_up(len(self.h) - 1)

    def pop(self):
        h = self.h
        last = h.pop()
        if not h:
            return last
        top = h[0]
        h[0] = last
        self.sift_down(0)
        return top

    def replace(self, x):
        top = self.h[0]
        self.h[0] = x
        self.sift_down(0)
        return top

    def sift_up(self, i):
        h = self.h
        while i > 0:
            p = (i - 1) // 2
            self.comps += 1
            if h[i] < h[p]:
                h[i], h[p] = h[p], h[i]
                i = p
            else:
                break

    def sift_down(self, i):
        h = self.h
        n = len(h)
        while True:
            l = 2 * i + 1
            if l >= n:
                break
            c = l
            if l + 1 < n:
                self.comps += 1
                if h[l + 1] < h[l]:
                    c = l + 1
            self.comps += 1
            if h[c] < h[i]:
                h[c], h[i] = h[i], h[c]
                i = c
            else:
                break


def k_largest(nums, k):
    """Size-k min-heap. Returns (heap list, comparisons)."""
    hp = Heap()
    for x in nums:
        if len(hp.h) < k:
            hp.push(x)
        else:
            hp.comps += 1
            if x > hp.h[0]:
                hp.replace(x)
    return hp.h, hp.comps


def merge_sort(a, counter):
    if len(a) <= 1:
        return a[:]
    m = len(a) // 2
    left, right = merge_sort(a[:m], counter), merge_sort(a[m:], counter)
    out, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        counter[0] += 1
        if left[i] <= right[j]:
            out.append(left[i])
            i += 1
        else:
            out.append(right[j])
            j += 1
    return out + left[i:] + right[j:]


def k_largest_sort(nums, k):
    c = [0]
    s = merge_sort(nums, c)
    return s[len(s) - k:][::-1], c[0]


def lcg(n, seed=12345):
    """Same pseudo-random list as the page: Park-Miller, values 0..999."""
    x, out = seed, []
    for _ in range(n):
        x = x * 48271 % 2147483647
        out.append(x % 1000)
    return out


def heapify_count(a):
    hp = Heap()
    hp.h = a[:]
    for i in range(len(a) // 2 - 1, -1, -1):
        hp.sift_down(i)
    return hp.comps


def pushes_count(a):
    hp = Heap()
    for x in a:
        hp.push(x)
    return hp.comps


def medians(stream):
    low, high, out = [], [], []          # low: max-heap of negatives, high: min-heap
    for num in stream:
        heapq.heappush(low, -num)
        heapq.heappush(high, -heapq.heappop(low))
        if len(high) > len(low):
            heapq.heappush(low, -heapq.heappop(high))
        out.append(-low[0] if len(low) > len(high) else (-low[0] + high[0]) / 2)
    return out


def merge_k(lists):
    heap = [(lst[0], i, 0) for i, lst in enumerate(lists) if lst]
    heapq.heapify(heap)
    out, pops = [], 0
    while heap:
        val, i, j = heapq.heappop(heap)
        pops += 1
        out.append(val)
        if j + 1 < len(lists[i]):
            heapq.heappush(heap, (lists[i][j + 1], i, j + 1))
    return out, pops


def main():
    pic, k = [4, 9, 2, 7, 1, 8, 3, 6, 5, 0], 3
    print("== 1. Picture: the 3 largest of", pic, "==")
    h, c = k_largest(pic, k)
    print(f"size-k min-heap: heap = {h}  heap[0] = {h[0]}  comparisons = {c}")
    s, c2 = k_largest_sort(pic, k)
    print(f"sort everything: top 3 = {s}  comparisons = {c2}")
    print("heapq.nlargest agrees:", sorted(h, reverse=True) == heapq.nlargest(k, pic) == s)

    print("\n== 2. Race: k = 3, pseudo-random values 0..999 (comparisons) ==")
    for n in (10, 100, 1000, 10000, 100000):
        nums = lcg(n)
        h, c = k_largest(nums, 3)
        s, c2 = k_largest_sort(nums, 3)
        assert sorted(h, reverse=True) == heapq.nlargest(3, nums) == s
        print(f"n = {n:>6}: heap {c:>6}   sort {c2:>7}   sort / heap = {c2 / c:.1f}x")

    print("\n== 3. Heap playground preset: push 5, 3, 8, 1, 9, 2 then pop ==")
    hp = Heap()
    for x in (5, 3, 8, 1, 9, 2):
        hp.push(x)
        print(f"push {x}: {hp.h}  comparisons so far = {hp.comps}")
    top = hp.pop()
    print(f"pop -> {top}: {hp.h}  comparisons so far = {hp.comps}")
    print("heapq gives the same array for these pushes:", end=" ")
    q = []
    for x in (5, 3, 8, 1, 9, 2):
        heapq.heappush(q, x)
    print(q)

    print("\n== 4. Templates ==")
    nums = [3, 1, 4, 1, 5]
    mx = [-x for x in nums]
    heapq.heapify(mx)
    print(f"max via negation: -heappop(...) on {nums} = {-heapq.heappop(mx)}")
    print(f"medians of [5, 15, 1, 3, 8] = {medians([5, 15, 1, 3, 8])}")
    out, pops = merge_k([[1, 4, 7], [2, 5, 8], [3, 6, 9]])
    print(f"merge_k([[1, 4, 7], [2, 5, 8], [3, 6, 9]]) = {out}  pops = {pops}  (heap never holds more than 3)")
    print(f"heapq.nsmallest(2, [(3, 'c'), (1, 'a'), (2, 'b')]) = {heapq.nsmallest(2, [(3, 'c'), (1, 'a'), (2, 'b')])}")

    print("\n== 5. Traps ==")
    h = [3, 1, 4]
    heapq.heapify(h)
    print(f"heappop on [3, 1, 4] = {heapq.heappop(h)}   # wanted the max, 4")
    h = [-3, -1, -4]
    heapq.heapify(h)
    print(f"-heappop on negated  = {-heapq.heappop(h)}")

    def k_largest_wrong(nums, k):        # a MAX-heap of size k: throws away the biggest
        h = []
        for x in nums:
            heapq.heappush(h, -x)
            if len(h) > k:
                heapq.heappop(h)
        return sorted(-v for v in h)

    def k_largest_right(nums, k):
        h = []
        for x in nums:
            heapq.heappush(h, x)
            if len(h) > k:
                heapq.heappop(h)
        return sorted(h)

    print(f"k largest of [5, 1, 9, 3, 7], k = 2 with a max-heap: {k_largest_wrong([5, 1, 9, 3, 7], 2)}")
    print(f"k largest of [5, 1, 9, 3, 7], k = 2 with a min-heap: {k_largest_right([5, 1, 9, 3, 7], 2)}")
    h = []
    heapq.heappush(h, (1, {"id": "a"}))
    try:
        heapq.heappush(h, (1, {"id": "b"}))
        print("no error")
    except TypeError as e:
        print(f"push (1, dict) twice -> TypeError: {e}")
    h, tie = [], itertools.count()
    heapq.heappush(h, (1, next(tie), {"id": "a"}))
    heapq.heappush(h, (1, next(tie), {"id": "b"}))
    print(f"with a counter: {heapq.heappop(h)}")
    h = [5, 1, 4, 2, 3]
    heapq.heapify(h)
    print(f"heapify([5, 1, 4, 2, 3]) = {h}   h[:3] = {h[:3]}   true 3 smallest = {heapq.nsmallest(3, h)}")

    print("\n== 6. Hidden cost: n pushes vs heapify, descending input (worst case for pushes) ==")
    for n in (1000, 10000):
        a = list(range(n, 0, -1))
        print(f"n = {n:>5}: n pushes = {pushes_count(a):>6} comparisons   heapify = {heapify_count(a):>5} comparisons")

    print("\n== 7. Sandbox examples ==")
    examples = {
        "classic": ([4, 9, 2, 7, 1, 8, 3, 6, 5, 0], 3),
        "k = 1": ([6, 2, 9, 4, 7], 1),
        "duplicates": ([5, 5, 1, 5, 2, 5], 2),
        "ascending": ([1, 2, 3, 4, 5, 6, 7, 8], 3),
        "descending": ([8, 7, 6, 5, 4, 3, 2, 1], 3),
    }
    for name, (nums, k) in examples.items():
        h, c = k_largest(nums, k)
        s, c2 = k_largest_sort(nums, k)
        print(f"{name:<11} k = {k} {str(nums):<32} heap = {h}  kth largest = {h[0]}  heap comps = {c}  sort comps = {c2}")

    print("\n== 8. Check yourself ==")
    hp = Heap()
    for x in (7, 2, 5):
        hp.push(x)
    print(f"push 7, 2, 5 -> array {hp.h}")
    print(f"tree height for n = 1000: {(1000).bit_length() - 1} levels below the root")
    print(f"medians of [2, 9] = {medians([2, 9])}")


if __name__ == "__main__":
    main()
