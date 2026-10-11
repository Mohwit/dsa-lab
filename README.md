# DSA Lab

A personal workspace for learning data structures and algorithms by pattern. Each pattern and problem gets an interactive page with animated step-throughs, and progress is tracked with spaced review.

Live site: https://mohwit.github.io/dsa-lab/

## What's inside

```
registry.json        patterns (ordered by tier) and slots (one per lesson or problem)
patterns/<key>/      one lesson per pattern: page fragments + measure.py
problems/<pattern>/<NNNN-slug>/
  attempt.py         my solution
  solution.py        reference solution
  approaches.py      alternative approaches
  tests.json         test cases
  notes.md           notes in my own words
  _fragments/        page fragments for the interactive problem page
site/_build/         builds site/index.html from the registry and fragments
tools/               run_tests.py (test runner), serve.py (local server)
tracking/            progress log, today's set and saved page state
skills/dsa-coach/    the Claude Code skill that drives the daily sessions
```

## Patterns

| Tier | Patterns |
|------|----------|
| 0 | Big-O and Recursion |
| 1 | Arrays and Hashing, Two Pointers, Sliding Window, Stack and Monotonic Stack, Prefix Sums |
| 2 | Binary Search, Linked List, Trees |
| 3 | Heap and Priority Queue, Backtracking, Tries, Intervals, Greedy |
| 4 | Graphs (BFS, DFS, Topological Sort, Union-Find), Advanced Graphs (Shortest Paths, MST), 1D DP |
| 5 | 2D DP, Bit Manipulation, Math and Matrix |

## Usage

Requires `python3` (standard library only). Node.js is only needed for the headless page checks.

Build and open the site locally (progress is saved to `tracking/lab-state.json`):

```bash
python3 site/_build/build.py
python3 tools/serve.py          # then open http://localhost:8765
```

Run a problem's tests against my attempt, or against the reference solution:

```bash
python3 tools/run_tests.py problems/arrays-hashing/0001-two-sum
python3 tools/run_tests.py problems/arrays-hashing/0001-two-sum solution.py
```

Check a lesson page headlessly (dark, light and mobile views, JS errors, screenshots):

```bash
npm install
node site/_build/check.cjs site/index.html <slotN> /tmp/shots
```

## Daily workflow

1. Run `/dsa-coach today` in Claude Code to get the day's new and review problems.
2. Solve in `attempt.py` under `problems/`, then `/dsa-coach check` for a review.
3. The coach files notes, tests and the interactive page, and updates `tracking/`.

See [skills/README.md](skills/README.md) for installing the skill and its full command list.

## Deployment

`.github/workflows/pages.yml` rebuilds the site on every push to `main` and publishes it to GitHub Pages, so the online copy shows progress as of the last push. `site/index.html` is generated and not committed.
