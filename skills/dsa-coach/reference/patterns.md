# Pattern curriculum

Twenty patterns in six tiers. A tier's patterns only need the tiers before it. Keys match `registry.json`. Within a pattern, problems go in order: easy ones that show the pattern plainly, then mediums that hide it, then the optional hard ones (`*`). LeetCode numbers are for linking only; always write the problem in your own words on the page. Premium-only problems are marked `(P)`: link the free equivalent where one exists, or skip them.

For every pattern, the pattern lesson must give: the plain-words idea and its analogy, the picture to animate, the trigger signals ("when you see X, think of this"), the code template, the typical complexity, and the classic traps.

## Tier 0: foundations

### foundations: Big-O and Recursion
- **Idea:** count how the work grows when the input doubles. Recursion is a function that hands a smaller copy of the job to itself.
- **Analogy:** looking up a word in a dictionary by flipping every page (O(n)) vs opening in the middle each time (O(log n)). Recursion: Russian nesting dolls.
- **Picture:** the operation counter racing two loops as n grows; a call stack growing and shrinking for `factorial(4)`; the recursion tree of naive `fib(5)` showing repeated work.
- **Teach:** O(1), O(log n), O(n), O(n log n), O(n^2), O(2^n); space includes the call stack; the base case.
- **Problems:** 509 Fibonacci Number (E), 344 Reverse String (E, recursive two-pointer), 50 Pow(x, n) (M, fast power: halving).

## Tier 1

### arrays-hashing: Arrays and Hashing
- **Idea:** trade memory for time. Remember what you have seen in a hash map, so each later question is a single lookup.
- **Analogy:** a coat check: hand over a coat, get a ticket; asking "is my coat here?" takes one glance, not a search of the whole rack.
- **Trigger signals:** "have I seen this before?", counting things, grouping things that are "the same" in some way, pairs that add up to a target, O(n) asked where O(n^2) is obvious.
- **Template:** `seen = {}` / `Counter`, one pass, check before insert.
- **Picture:** the array with a moving pointer and the map filling up as chips; the brute-force pair grid lighting up cell by cell next to it, with an operation counter on each.
- **Traps:** checking after inserting (pairs an element with itself), mutable keys (use a tuple or a sorted string), forgetting that a map lookup is O(1) on average, not worst case.
- **Problems:** 217 Contains Duplicate (E), 242 Valid Anagram (E), 1 Two Sum (E), 49 Group Anagrams (M), 347 Top K Frequent Elements (M, bucket sort), 238 Product of Array Except Self (M), 36 Valid Sudoku (M), 128 Longest Consecutive Sequence (M). Also good: 271 Encode and Decode Strings (P).

### two-pointers: Two Pointers
- **Idea:** two fingers walk the data, usually from both ends towards each other, and each step safely throws away one option.
- **Analogy:** two people searching a sorted bookshelf from opposite ends, meeting in the middle.
- **Trigger signals:** sorted input, pairs or triples with a target sum, palindromes, "in place", comparing from both ends.
- **Template:** `l, r = 0, len(a) - 1; while l < r: ... move the side that cannot be part of a better answer`.
- **Picture:** `l` and `r` markers sliding; discarded cells fade out; for 3Sum, the fixed `i` plus the inner pair.
- **Traps:** duplicates in 3Sum, `<` vs `<=`, forgetting the input must be sorted for the "move the smaller side" argument.
- **Problems:** 125 Valid Palindrome (E), 167 Two Sum II (M), 15 3Sum (M), 11 Container With Most Water (M), 42 Trapping Rain Water (H*).

### sliding-window: Sliding Window
- **Idea:** a window over a contiguous stretch grows on the right and shrinks on the left; you update its summary instead of recomputing it.
- **Analogy:** a train window: the view changes by one tree entering and one leaving.
- **Trigger signals:** contiguous subarray or substring, longest / shortest / count with a condition, "at most k".
- **Template:** `for r in range(n): add a[r]; while window is invalid: remove a[l]; l += 1; update answer`.
- **Picture:** the window highlighted on the array, the counts map beside it, the best answer recorded.
- **Traps:** updating the answer before the window is valid again; fixed vs variable windows; the "max frequency never decreases" trick in 424.
- **Problems:** 121 Best Time to Buy and Sell Stock (E), 3 Longest Substring Without Repeating Characters (M), 424 Longest Repeating Character Replacement (M), 567 Permutation in String (M), 76 Minimum Window Substring (H*), 239 Sliding Window Maximum (H*, monotonic deque).

### stack: Stack and Monotonic Stack
- **Idea:** the last thing in is the first thing out; a monotonic stack keeps only items that can still be an answer.
- **Analogy:** a stack of plates; for monotonic stacks, people in a queue who are hidden behind a taller person can leave.
- **Trigger signals:** matching brackets, "next greater / smaller element", undo, evaluate expressions, spans and histograms.
- **Template:** `for i, x in enumerate(a): while stack and a[stack[-1]] < x: j = stack.pop(); answer[j] = i - j; stack.append(i)`.
- **Picture:** a vertical stack view pushing and popping beside the array.
- **Traps:** storing values when you need indices; empty-stack pops; processing what is left at the end.
- **Problems:** 20 Valid Parentheses (E), 155 Min Stack (M), 150 Evaluate Reverse Polish Notation (M), 22 Generate Parentheses (M, really backtracking), 739 Daily Temperatures (M), 853 Car Fleet (M), 84 Largest Rectangle in Histogram (H*).

### prefix-sums: Prefix Sums
- **Idea:** store running totals once; then the sum of any stretch is one subtraction.
- **Analogy:** a car's odometer: distance of a trip = reading at the end minus reading at the start.
- **Trigger signals:** many range-sum questions, "subarray sum equals k", balance of two kinds of things.
- **Template:** `prefix[i + 1] = prefix[i] + a[i]`; with a map of prefix counts for "equals k".
- **Problems:** 303 Range Sum Query - Immutable (E), 724 Find Pivot Index (E), 560 Subarray Sum Equals K (M), 525 Contiguous Array (M).

## Tier 2

### binary-search: Binary Search
- **Idea:** if you can tell which half the answer is in, throw the other half away.
- **Analogy:** guessing a number between 1 and 100 with "higher / lower" answers: at most 7 guesses.
- **Trigger signals:** sorted data, "minimum value that works" (search on the answer), rotated sorted arrays, O(log n) asked.
- **Template:** `lo, hi = 0, n - 1; while lo <= hi: mid = (lo + hi) // 2` and a clearly stated invariant; for "search on the answer", a `feasible(x)` check.
- **Picture:** lo, mid, hi pointers with the discarded half fading each step; a guess counter.
- **Traps:** infinite loops from `lo = mid`, off-by-one in `hi`, which half is sorted in rotated arrays.
- **Problems:** 704 Binary Search (E), 74 Search a 2D Matrix (M), 875 Koko Eating Bananas (M), 153 Find Minimum in Rotated Sorted Array (M), 33 Search in Rotated Sorted Array (M), 981 Time Based Key-Value Store (M), 4 Median of Two Sorted Arrays (H*).

### linked-list: Linked List
- **Idea:** each node knows only the next one; you re-point arrows instead of moving items.
- **Analogy:** a treasure hunt where each clue tells you where the next clue is.
- **Trigger signals:** linked list input, reverse / merge / reorder, cycles (fast and slow pointers), "O(1) extra space".
- **Template:** a dummy head; `prev, cur = None, head`; fast and slow pointers.
- **Picture:** nodes as boxes with arrows (graph view) re-pointing one by one.
- **Traps:** losing the rest of the list before saving `next`, null checks, forgetting the dummy node.
- **Problems:** 206 Reverse Linked List (E), 21 Merge Two Sorted Lists (E), 141 Linked List Cycle (E), 143 Reorder List (M), 19 Remove Nth Node From End of List (M), 138 Copy List with Random Pointer (M), 2 Add Two Numbers (M), 287 Find the Duplicate Number (M, Floyd), 146 LRU Cache (M), 23 Merge k Sorted Lists (H*), 25 Reverse Nodes in k-Group (H*).

### trees: Trees
- **Idea:** a tree problem is usually "solve it for the left child, solve it for the right child, combine".
- **Analogy:** a company org chart: each manager asks their two reports, then reports up.
- **Trigger signals:** binary tree / BST input, depth, paths, levels, "lowest common ancestor", validate or build a tree.
- **Template:** `def dfs(node): if not node: return base; l = dfs(node.left); r = dfs(node.right); return combine(l, r)`; BFS with a queue for levels.
- **Picture:** the tree view with the current node lit and the call stack beside it; BFS frontier highlighted by level.
- **Traps:** confusing what dfs returns with the global answer (diameter, max path sum), BST bounds passed down, None children.
- **Problems:** 226 Invert Binary Tree (E), 104 Maximum Depth of Binary Tree (E), 543 Diameter of Binary Tree (E), 110 Balanced Binary Tree (E), 100 Same Tree (E), 572 Subtree of Another Tree (E), 235 Lowest Common Ancestor of a BST (M), 102 Binary Tree Level Order Traversal (M), 199 Binary Tree Right Side View (M), 1448 Count Good Nodes in Binary Tree (M), 98 Validate Binary Search Tree (M), 230 Kth Smallest Element in a BST (M), 105 Construct Binary Tree from Preorder and Inorder Traversal (M), 124 Binary Tree Maximum Path Sum (H*), 297 Serialize and Deserialize Binary Tree (H*).

## Tier 3

### heap: Heap and Priority Queue
- **Idea:** a heap always hands you the smallest (or largest) item in O(log n), without sorting everything.
- **Analogy:** a hospital triage desk: the most urgent patient is always next.
- **Trigger signals:** "k largest / smallest / closest", streams, repeatedly pick the best next item, merging sorted lists.
- **Template:** `heapq.heappush / heappop`; a size-k min-heap for "k largest".
- **Picture:** the heap drawn as a tree (tree view) and as its array, sift-up and sift-down animated.
- **Traps:** Python's heapq is a min-heap (negate for max), tuples for ties, heap of size n when size k suffices.
- **Problems:** 703 Kth Largest Element in a Stream (E), 1046 Last Stone Weight (E), 973 K Closest Points to Origin (M), 215 Kth Largest Element in an Array (M), 621 Task Scheduler (M), 355 Design Twitter (M), 295 Find Median from Data Stream (H*).

### backtracking: Backtracking
- **Idea:** build an answer one choice at a time; when a choice cannot work, undo it and try the next.
- **Analogy:** walking a maze with chalk: mark the path, and rub it out when you hit a dead end.
- **Trigger signals:** "all" subsets / permutations / combinations, constraint puzzles, small n (n <= 20).
- **Template:** `def bt(i, path): if done: out.append(path[:]); return; for choice in options: path.append(choice); bt(...); path.pop()`.
- **Picture:** the decision tree growing and pruning, with the current path highlighted.
- **Traps:** appending `path` instead of a copy, duplicate results (sort and skip), forgetting to undo.
- **Problems:** 78 Subsets (M), 39 Combination Sum (M), 46 Permutations (M), 90 Subsets II (M), 40 Combination Sum II (M), 79 Word Search (M), 131 Palindrome Partitioning (M), 17 Letter Combinations of a Phone Number (M), 51 N-Queens (H*).

### tries: Tries
- **Idea:** a tree of letters, so all words sharing a prefix share a path.
- **Analogy:** a phone's autocomplete, one letter at a time.
- **Trigger signals:** prefixes, many words searched at once, wildcard word search.
- **Problems:** 208 Implement Trie (M), 211 Design Add and Search Words Data Structure (M), 212 Word Search II (H*).

### intervals: Intervals
- **Idea:** sort by start time; then each interval only needs to be compared with the last one kept.
- **Analogy:** booking meeting rooms from a calendar.
- **Trigger signals:** ranges, meetings, overlaps, merging.
- **Problems:** 57 Insert Interval (M), 56 Merge Intervals (M), 435 Non-overlapping Intervals (M), 252 Meeting Rooms (P) / 253 Meeting Rooms II (P), 1851 Minimum Interval to Include Each Query (H*).

### greedy: Greedy
- **Idea:** take the best-looking choice now, and prove it never hurts later.
- **Analogy:** paying with the fewest coins in a normal currency.
- **Trigger signals:** "minimum number of", "can you reach", a choice that can be shown safe by an exchange argument.
- **Traps:** greedy that only looks right (coin systems where it fails: then it is DP).
- **Problems:** 53 Maximum Subarray (M, Kadane), 55 Jump Game (M), 45 Jump Game II (M), 134 Gas Station (M), 846 Hand of Straights (M), 1899 Merge Triplets to Form Target Triplet (M), 763 Partition Labels (M), 678 Valid Parenthesis String (M).

## Tier 4

### graphs: Graphs: BFS, DFS, Topological Sort, Union-Find
- **Idea:** things (nodes) and connections (edges). BFS explores in rings; DFS goes deep first; topological sort orders tasks with prerequisites; union-find merges groups.
- **Analogy:** BFS is a ripple on a pond; DFS is exploring a cave one tunnel at a time; topological sort is getting dressed (socks before shoes); union-find is merging friend groups.
- **Trigger signals:** grids of cells, islands, "shortest number of steps" (unweighted: BFS), prerequisites and cycles, connected components.
- **Template:** adjacency list, `visited` set, queue for BFS, recursion or stack for DFS, in-degree queue (Kahn) for topological order, `find` with path compression and `union` by rank.
- **Picture:** the graph view (or grid view) with visited, frontier and current colours; the queue view beside it.
- **Traps:** marking visited when popping instead of when pushing (BFS duplicates), recursion depth on big grids, directed vs undirected.
- **Problems:** 200 Number of Islands (M), 133 Clone Graph (M), 695 Max Area of Island (M), 417 Pacific Atlantic Water Flow (M), 130 Surrounded Regions (M), 994 Rotting Oranges (M), 207 Course Schedule (M), 210 Course Schedule II (M), 684 Redundant Connection (M), 323 Number of Connected Components (P) / 261 Graph Valid Tree (P), 127 Word Ladder (H*).

### advanced-graphs: Shortest Paths and MST
- **Idea:** with weights, the nearest unvisited node is the next one you can finalise (Dijkstra); the cheapest edge that joins two groups is always safe (Prim / Kruskal).
- **Problems:** 743 Network Delay Time (M, Dijkstra), 1584 Min Cost to Connect All Points (M, Prim), 787 Cheapest Flights Within K Stops (M, Bellman-Ford), 778 Swim in Rising Water (H*), 332 Reconstruct Itinerary (H*), 269 Alien Dictionary (P, H*).

### dp-1d: 1D Dynamic Programming
- **Idea:** the answer for n is built from answers for smaller n; store them so each is computed once.
- **Analogy:** climbing stairs and writing on each step how many ways reach it.
- **Trigger signals:** "number of ways", "minimum / maximum cost", choices at each position that affect later ones, overlapping subproblems.
- **Template:** state (what `dp[i]` means, in one sentence), transition, base cases, order of filling, answer location. Top-down with `@cache` first, then bottom-up, then space-optimised.
- **Picture:** the recursion tree with repeated calls lit up, then the dp array filling left to right with arrows from the cells it reads.
- **Traps:** an unclear state sentence, wrong base case, iterating in an order that reads unfilled cells.
- **Problems:** 70 Climbing Stairs (E), 746 Min Cost Climbing Stairs (E), 198 House Robber (M), 213 House Robber II (M), 5 Longest Palindromic Substring (M), 647 Palindromic Substrings (M), 91 Decode Ways (M), 322 Coin Change (M), 152 Maximum Product Subarray (M), 139 Word Break (M), 300 Longest Increasing Subsequence (M), 416 Partition Equal Subset Sum (M).

## Tier 5

### dp-2d: 2D Dynamic Programming
- **Idea:** the state needs two numbers (two positions, or a position and a budget); fill a table.
- **Picture:** the grid view filling cell by cell, with the source cells of each update highlighted.
- **Problems:** 62 Unique Paths (M), 1143 Longest Common Subsequence (M), 309 Best Time to Buy and Sell Stock with Cooldown (M), 518 Coin Change II (M), 494 Target Sum (M), 97 Interleaving String (M), 329 Longest Increasing Path in a Matrix (H*), 115 Distinct Subsequences (H*), 72 Edit Distance (M), 312 Burst Balloons (H*), 10 Regular Expression Matching (H*).

### bit-manipulation: Bit Manipulation
- **Idea:** numbers are rows of switches; XOR cancels pairs, `n & (n - 1)` drops the lowest set bit.
- **Picture:** an array view of the bits with the operation applied column by column.
- **Problems:** 136 Single Number (E), 191 Number of 1 Bits (E), 338 Counting Bits (E), 190 Reverse Bits (E), 268 Missing Number (E), 371 Sum of Two Integers (M), 7 Reverse Integer (M).

### math-geometry: Math and Matrix
- **Problems:** 48 Rotate Image (M), 54 Spiral Matrix (M), 73 Set Matrix Zeroes (M), 202 Happy Number (E), 66 Plus One (E), 43 Multiply Strings (M).

## Choosing the next problems

1. Stay in the current pattern until it is `practiced` (2+ solved with at most one hint), then move on in tier order. Do not leave a pattern on its first medium failure: do one more easy-medium from it.
2. Interview mode with a date under 4 weeks away: cover every tier 1-4 pattern at `introduced` or better before deepening any one; skip `*` problems.
3. A day mixes at most one new pattern. A typical day: 1 review + 1 new easy + 1 medium, or 2 mediums for later tiers.
