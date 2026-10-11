"""Linked List pattern lesson: every number on the page comes from this script.

Run:  python3 patterns/linked-list/measure.py

Counting rules (the page's JavaScript uses the same ones):
  hops        = how many times a walking pointer moves one node forward
                (`cur = cur.next` in the slow reversal, `cur = nxt` in the pattern reversal)
  loop rounds = how many times the body of `while fast and fast.next` runs
                (one round = slow moves 1 node, fast moves 2 nodes)
"""
import sys


class Node:
    def __init__(self, val, nxt=None):
        self.val = val
        self.next = nxt


def build(vals, pos=-1):
    """Build a list; if pos >= 0 the tail links back to the node at index pos (a cycle)."""
    dummy = Node(0)
    tail = dummy
    nodes = []
    for v in vals:
        tail.next = Node(v)
        tail = tail.next
        nodes.append(tail)
    if pos >= 0 and nodes:
        tail.next = nodes[pos]
    return dummy.next


def to_list(head, cap=100):
    out = []
    while head and len(out) < cap:
        out.append(head.val)
        head = head.next
    return out


# ---------- reversal: slow (walk to the tail every time) vs pattern (re-point in one pass) ----------
def reverse_slow(head):
    hops = 0
    new_head = tail = None
    while head:
        prev, cur = None, head
        while cur.next:              # walk to the last node, every single time
            prev, cur = cur, cur.next
            hops += 1
        if prev:
            prev.next = None         # cut the last node off
        else:
            head = None
        if tail:
            tail.next = cur          # and append it to the new list
        else:
            new_head = cur
        tail = cur
    return new_head, hops


def reverse(head):
    hops = 0
    prev, cur = None, head
    while cur:
        nxt = cur.next      # 1. save the rest of the list
        cur.next = prev     # 2. flip this arrow
        prev = cur          # 3. step prev forward
        cur = nxt           # 4. step cur forward
        hops += 1
    return prev, hops


def reverse_buggy(head):
    prev, cur = None, head
    while cur:
        cur.next = prev     # flipped before saving the rest ...
        prev = cur
        cur = cur.next      # ... so this follows the NEW arrow, back to prev
    return prev


def reverse_recursive(head):
    if not head or not head.next:
        return head
    new_head = reverse_recursive(head.next)
    head.next.next = head
    head.next = None
    return new_head


# ---------- dummy head: merge two sorted lists ----------
def merge(a, b):
    dummy = tail = Node(0)
    comps = 0
    while a and b:
        comps += 1
        if a.val <= b.val:
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next
    tail.next = a or b
    return dummy.next, comps


# ---------- fast and slow ----------
def middle(head):
    slow = fast = head
    rounds = 0
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        rounds += 1
    return slow, rounds


def middle_buggy(head):
    slow = fast = head
    while fast.next:                 # forgets that fast itself can be None
        slow = slow.next
        fast = fast.next.next
    return slow


def has_cycle(head):
    slow = fast = head
    rounds = 0
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        rounds += 1
        if slow is fast:
            return True, rounds, slow.val
    return False, rounds, None


def cycle_start(head):
    found, _, _ = has_cycle(head)
    if not found:
        return None
    slow = fast = head
    while True:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            break
    slow = head
    while slow is not fast:
        slow = slow.next
        fast = fast.next
    return slow.val


# ---------- gap pointers: remove the nth node from the end ----------
def remove_nth(head, n):
    dummy = Node(0, head)
    fast = slow = dummy
    for _ in range(n + 1):
        fast = fast.next
    while fast:
        fast = fast.next
        slow = slow.next
    slow.next = slow.next.next
    return dummy.next


def remove_nth_no_dummy(head, n):
    fast = slow = head
    for _ in range(n):
        fast = fast.next
    while fast.next:                 # crashes when the head itself must go
        fast = fast.next
        slow = slow.next
    slow.next = slow.next.next
    return head


def err(fn, *args):
    try:
        return repr(fn(*args))
    except Exception as e:  # noqa: BLE001
        return f"{type(e).__name__}: {e}"


def main():
    print("== 1. Picture: reverse [1, 2, 3, 4, 5] ==")
    h, hops = reverse_slow(build([1, 2, 3, 4, 5]))
    print(f"slow (walk to the tail each time): {to_list(h)}  hops = {hops}")
    h, hops = reverse(build([1, 2, 3, 4, 5]))
    print(f"pattern (re-point in one pass):    {to_list(h)}  hops = {hops}")

    print("\n== 2. Race: hops to reverse n nodes ==")
    for n in (10, 100, 1000, 5000):
        _, s = reverse_slow(build(range(n)))
        _, f = reverse(build(range(n)))
        print(f"n = {n:>4}: slow hops = {s:>8}   pattern hops = {f:>4}   ratio = {s / f:.1f}x")

    print("\n== 3. Templates ==")
    h, hops = reverse(build([1, 2, 3, 4]))
    print(f"reverse([1, 2, 3, 4]) = {to_list(h)}  hops = {hops}")
    m, comps = merge(build([1, 4, 6]), build([2, 3, 7]))
    print(f"merge([1, 4, 6], [2, 3, 7]) = {to_list(m)}  comparisons = {comps}")
    for vals in ([1, 2, 3, 4, 5], [1, 2, 3, 4, 5, 6]):
        node, r = middle(build(vals))
        print(f"middle({vals}) = {node.val}  loop rounds = {r}")
    print(f"has_cycle([1..6], tail -> index 2) = {has_cycle(build([1, 2, 3, 4, 5, 6], 2))}   # (found, rounds, meeting value)")
    print(f"cycle_start([1..6], tail -> index 2) = {cycle_start(build([1, 2, 3, 4, 5, 6], 2))}")
    print(f"has_cycle([1..6], no cycle)       = {has_cycle(build([1, 2, 3, 4, 5, 6]))}")
    print(f"remove_nth([1, 2, 3, 4, 5], 2) = {to_list(remove_nth(build([1, 2, 3, 4, 5]), 2))}")
    _, rounds = reverse(build([1, 2, 3, 4]))
    print(f"drive-the-moves game on [1, 2, 3, 4]: {rounds} rounds x 4 moves + 1 return = {rounds * 4 + 1} presses")

    print("\n== 4. Traps ==")
    print(f"reverse_buggy([1, 2, 3]) = {to_list(reverse_buggy(build([1, 2, 3])))}   # nodes 2 and 3 are lost")
    print(f"reverse([1, 2, 3])       = {to_list(reverse(build([1, 2, 3]))[0])}")
    print(f"middle_buggy([1, 2, 3, 4]) -> {err(lambda: middle_buggy(build([1, 2, 3, 4])).val)}")
    print(f"middle([1, 2, 3, 4])       -> {middle(build([1, 2, 3, 4]))[0].val}")
    print(f"remove_nth_no_dummy([1, 2], 2) -> {err(lambda: to_list(remove_nth_no_dummy(build([1, 2]), 2)))}")
    print(f"remove_nth([1, 2], 2)          -> {to_list(remove_nth(build([1, 2]), 2))}")
    print(f"recursion limit = {sys.getrecursionlimit()}")
    print(f"reverse_recursive(1200 nodes) -> {err(lambda: len(to_list(reverse_recursive(build(range(1200))), 2000)))}")
    print(f"reverse(1200 nodes) -> {len(to_list(reverse(build(range(1200)))[0], 2000))} nodes, no crash")

    print("\n== 5. Sandbox examples ==")
    examples = {
        "five nodes": ([1, 2, 3, 4, 5], -1),
        "even length": ([4, 8, 15, 16, 23, 42], -1),
        "one node": ([7], -1),
        "loop back": ([1, 2, 3, 4, 5, 6], 2),
        "tail to head": ([3, 1, 4, 1, 5], 0),
    }
    for name, (vals, pos) in examples.items():
        line = f"{name:<12} {str(vals):<24} pos = {pos:>2}: "
        if pos < 0:
            r, hops = reverse(build(vals))
            m, rounds = middle(build(vals))
            line += f"reversed = {to_list(r)} hops = {hops} (slow {reverse_slow(build(vals))[1]}); middle = {m.val} rounds = {rounds}; "
        line += f"cycle = {has_cycle(build(vals, pos))}"
        if pos >= 0:
            line += f" start = {cycle_start(build(vals, pos))}"
        print(line)

    print("\n== 6. Check yourself ==")
    print(f"reverse([7, 8]) hops = {reverse(build([7, 8]))[1]}")
    print(f"middle([1, 2, 3, 4]) = {middle(build([1, 2, 3, 4]))[0].val}")
    print(f"remove_nth([5], 1) = {to_list(remove_nth(build([5]), 1))}")
    print(f"has_cycle([1, 2], tail -> index 0) = {has_cycle(build([1, 2], 0))}")


if __name__ == "__main__":
    main()
