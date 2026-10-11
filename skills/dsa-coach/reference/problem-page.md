# Problem and pattern pages (site/index.html)

Read this before writing or changing any slot. The site is one file, `site/index.html`, built by `python3 site/_build/build.py` from `site/_build/index.base.html` plus each slot's `_fragments/`. Never edit `site/index.html` by hand: the next build overwrites it.

## Page anatomy

| Column | What it holds |
|---|---|
| Sidebar | A filter box (`/` focuses it), Today (slot 0), then per tier one collapsible group per pattern: its pattern lesson (`P`), then collapsible Easy / Medium / Hard sub-groups of problems (LeetCode number + title), each with a solved counter. Open/closed state is remembered; the group holding the open slot opens itself. Dots show the outcome (teal alone, yellow hints, orange ring solution); a yellow dot on the right means a review is due. Built from `registry.json` by `build.py`. |
| Content pane | One `.lesson-content.xp#lessonN` panel per slot. |
| Sandbox pane | One `.sandbox-container#sandboxN` per slot (falls back to Home's trace player). Resizable by dragging its left edge, collapsible. |

Slot 0 (Home) shows today's set from `tracking/today.json`, reviews due (estimated from outcomes), level and XP, a 20-week practice calendar, solved counts by difficulty, the pattern map (status and a segment per solved problem) and badges. All of it is computed in the page from saved progress; never hard-code it. Page progress (outcomes, streak, unlocked sandboxes, hints opened, locked predictions) is saved to `tracking/lab-state.json` by `tools/serve.py` and baked into the page at build time; opened from disk, the page can only keep it in localStorage. Read `lab-state.json` when logging outcomes; `tracking/dsa-progress.md` stays the real record.

## Fragments for slot N

`<slot dir>/_fragments/`:
- `panel.html` (required): `<div class="lesson-content xp" id="lessonN"> ... </div>`
- `sandbox.html` (problems: required): `<div class="sandbox-container" id="sandboxN"> ... </div>`
- `script.js`: one IIFE, no new globals. For problems it contains the port block (below).

IDs: sections `pN-s-...`, recap `pN-recap`, other ids prefixed `pN` / `sN` followed by a letter (`p12cv`, `s12In`). All ids unique in the built file.

## Problem panel: the ladder

The learner must try before seeing anything that gives the answer away. Order and rules:

| # | Section (level tags) | Content | Spoiler rule |
|---|---|---|---|
| header | | `<p class="lesson-num-label">Problem 12 (LeetCode 1)</p>`. Title, one-line goal, then `<div class="lesson-meta">` with difficulty badge `<span class="badge diff-easy">easy</span>`, pattern badge, and the LeetCode link (`target="_blank" rel="noopener"`). | no hints |
| 1 | The problem in plain words (`lvl-plain`) | Your own wording, never copied. One everyday story for the problem, the input and output, two or three examples drawn as arrays (a static trace player frame or a small canvas), the constraints and what they hint at (n up to 10^5 means O(n log n) or better). | no hints |
| 2 | Predict (`lvl-pic`) | A predict box: the output for a small new input, solved by hand. | answer = only the output |
| 3 | Try it first | `<div class="card try-first">` with the exact commands: open `problems/.../attempt.py`, run `python3 tools/run_tests.py problems/...`. Say what a good time box is (easy 15 min, medium 25, hard 40). | none |
| 4 | Hints | Three `<details class="hint">`, each locked until the one before is opened (wired automatically). Hint 1 names the question to ask yourself, hint 2 names the pattern or data structure, hint 3 gives the key step without code. | hidden |
| 4b | Your solution (filed problems only) | A `.card` right after section 1 when the learner solved it before the page existed: their idea in one sentence, its complexity, what is good, one improvement. | none (they already solved it) |
| 5 | Brute force (`lvl-pic`) | Inside `<details class="spoiler"><summary>Show the brute force</summary>`. Plain idea, a trace player on the example, the operation count, why it is too slow for the constraints. | spoiler |
| 6 | The pattern insight (`lvl-words`) | Inside a spoiler. The one observation that unlocks it, named with the pattern's words (`<dfn class="term">`), the invariant in one sentence, then the trace player on the same example so the learner can compare operation counts. | spoiler |
| 6b | All approaches (`lvl-words`) | Inside a spoiler. `<table class="approaches">`: every reasonable approach from brute force to best (for example: compare all pairs, sort then scan, hash set), with the idea in one line, time, space, and when you would choose it. Mark the one to reach for with `<tr class="is-best">`. Each row's complexity is measured or derived from the code, never guessed. | spoiler |
| 6c | Mental map (`lvl-pic`) | Inside a spoiler. `<ol class="mmap">`: how to get from a blank page to this solution next time. Steps: the signal in the statement (`li.mm-signal`), the question to ask, the pattern it points to (with `.mm-branches` showing the forks you rule out and the one you pick, `li.is-pick`), the invariant, the steps of the code in words, and the edge checks (`li.mm-trap`). This is the section the learner reads when they meet a problem that looks similar. | spoiler |
| 7 | Code (`lvl-code`) | Inside a spoiler. The reference solution as a code walk table (code left, meaning right), then the invariant and the edge cases it handles. | spoiler |
| 8 | Complexity (`lvl-math`) | `<details class="math">` boxes: count the work in plain arithmetic for the example size, then Big-O for time and space, then why it cannot be done faster (when there is a neat argument). | collapsed |
| 9 | Interview talk track | A `.card` with what to say, in order: clarify (inputs, edge cases), example, brute force and its cost, the better idea, code, test on the example, complexity. Plus the two most likely follow-up questions and short answers hidden in a predict box. | follow-up answers hidden |
| 10 | Check yourself | Two or three predict boxes on variants (edge input, a changed constraint, "what if the input were sorted?"), then a glossary of new words. | hidden |
| recap | | `<section class="step recap" id="pN-recap">`: the pattern card in one minute (trigger signals, template, complexity), then `<div class="outcome-row" data-slot="N">` with three buttons: `data-outcome="alone"` "Solved it alone", `"hints"` "Solved with hints", `"solution"` "Read the solution", and a "Next:" button to the next slot in today's set when known. | |

Keep the panel tight: an easy problem is about 25-40 KB of fragments, a medium 35-60 KB. Fewer, better pictures beat many.

## Pattern lesson panel

A pattern lesson is taught before its first problem, and is the page the learner keeps open as a reference while solving new problems in that pattern. Sections, in order (each a `section.step`, with a sticky `.lesson-toc`):

1. **The idea** (`lvl-plain`, `lvl-pic`): plain words, the analogy card, then a side-by-side `.grid2` of two trace players on the same input (slow way and pattern way) with operation-count readouts. Both players get the same height automatically.
2. **The pattern's words** (`lvl-words`): every term as a `dfn.term`, with a one-line definition.
3. **Mental map** (`lvl-pic`): `<ol class="mmap">` from the signal in a problem statement to working code: signals (`mm-signal`), the question to ask, which variant of the pattern (`.mm-branches`, one `li` per variant with its tell-tale signal in `<i>`), the invariant, the steps, and the traps (`mm-trap`). This is the "how do I start" checklist.
4. **Templates** (`lvl-code`): each variant's template as a code walk table (code left, meaning right), runnable, and a trace player on a small input where it helps.
5. **Spot the pattern** quiz: 5 or more short problem descriptions in your own words, each a predict box ("does this pattern fit? which variant?"), including two that look like it but are not.
6. **Traps**: `.card.warn` per classic trap, each with the wrong code, why it fails on a concrete input, and the fix.
7. **Complexity** (`lvl-math`): `details.math` with counted work for a concrete n, then Big-O, including the hidden costs.
8. **Problems**: the pattern's list from `patterns.md` grouped Easy / Medium / Hard as a table (number, title linked to LeetCode, the one-line twist that makes it interesting). Buttons that `switchLesson` to existing slots; plain text for future ones.
9. **Check yourself**: 3 predict boxes and the glossary.
10. **Recap** (`#pN-recap`): the one-minute pattern card (idea, signals, template, cost, traps), "Mark lesson complete", and a button to the first problem if it exists.

A pattern lesson has a sandbox (`sandbox.html`) where the learner runs the pattern's template on their own input with the trace player; pattern sandboxes are not gated. Size: about 35-70 KB of fragments. Use `reference/patterns.md` for the content and go beyond it: research the pattern's variants and interview folklore, but every number on the page still comes from running code.

## Components (all already styled)

Everything from the MuJoCo course page pattern works here: `.lvl` tags, `dfn.term`, `.card.analogy`, `.card.rule`, `.card.warn`, `.grid2/.grid3`, `.predict`, `details.math`, code walk tables with `.t .a .s .n .k .c` spans, `.newwords` chips, `dl.glossary`, `.readout`, `.btn`, `.btn-row`, sliders. Colours only through CSS variables (`--teal`, `--orange`, `--purple`, `--blue`, `--yellow`, `--red`, `--text-dim` ...).

DSA additions:

| Component | Markup |
|---|---|
| Difficulty badge | `<span class="badge diff-easy">easy</span>` (`diff-medium`, `diff-hard`) |
| Hint (in order, locked until the previous one is open) | `<details class="hint"><summary>Hint 1: what are you really asking for each number?</summary><div>...</div></details>` |
| Spoiler | `<details class="spoiler"><summary>Show the pattern solution</summary><div>...</div></details>` |
| Try first card | `<div class="card try-first">...</div>` |
| Trace player | `<div id="p12tpA"></div>` then in script.js `TracePlayer(document.getElementById('p12tpA'), { code: CODE, frames: solve(args).frames })`. Without `code` the code column is hidden. |
| Side-by-side players | `<div class="grid2"><div><p>intro</p><div id="p12tpA"></div></div><div><p>intro</p><div id="p12tpB"></div></div></div>`. Equal height and aligned controls are automatic when each side is exactly one intro element plus the player. |
| Mental map | `<ol class="mmap"><li class="mm-signal"><b>Signal</b><span>...</span></li><li><b>Ask</b><span>...</span></li><li><b>Pick</b><span>...</span><ul class="mm-branches"><li><i>sorted input?</i>two pointers</li><li class="is-pick"><i>unsorted, need a partner</i>hash map</li></ul></li><li class="mm-trap"><b>Check</b><span>...</span></li></ol>` |
| Approaches table | `<table class="approaches"><tr><th>Approach</th><th>Idea</th><th>Time</th><th>Space</th><th>Choose it when</th></tr>... <tr class="is-best">...</tr></table>` |
| Outcome buttons | `<div class="outcome-row" data-slot="12"><button class="btn btn-sm" type="button" data-outcome="alone">Solved it alone</button>...</div>` |

Hints unlock in order automatically: in each panel, a hint can only be opened after the one before it.

## The trace player and the port

`TracePlayer(el, { code, frames }, opts)` shows the code with the current line lit, the data views, a note per step, and Reset / Back / Step / Play / End controls with a speed slider (Left and Right arrows also step). `opts.code === false` hides the code column; `opts.row: true` lays the views side by side (for example a heap as tree and array together). Frame format:

```js
{ line: lineOf(CODE, 'if need in seen'), note: 'Plain sentence about this step.', result: 'optional, shown on the last frame',
  views: [
    { type: 'array', name: 'nums', values: [2, 7, 11, 15], pointers: { i: 1 }, hl: [1], win: [0, 1], dim: [], bad: [] },
    { type: 'map', name: 'seen (value : index)', entries: [[2, 0]], hl: 2, new: 7 },
    { type: 'set', name: 'seen', values: [1, 2], hl: 2 },
    { type: 'stack', name: 'stack', values: [1, 4] },     // also: queue
    { type: 'vars', values: { target: 9, need: 2 } },     // changed values get an orange border automatically
    { type: 'grid', name: 'dp', rows: [[0, 1], [1, 2]], rowLabels: ['a', 'b'], colLabels: ['x', 'y'], hl: [[1, 1]], src: [[0, 1], [1, 0]] },
    { type: 'tree', name: 'root', values: [3, 9, 20, null, null, 15, 7], hl: [2], state: { 0: 'visited' } },
    { type: 'graph', name: 'g', nodes: [{ id: 'A', x: 0.1, y: 0.5 }], edges: [['A', 'B'], ['B', 'C', 4]], directed: true, hl: [['A', 'B']], state: { A: 'current' } }
  ] }
```

Each problem's `script.js` holds a **port**: the reference solution rewritten in JavaScript that records frames as it runs. It sits between two marker lines so the verifier can run it in node:

```js
// @@PORT-START
const CODE = `def two_sum(nums, target):
    seen = {}
    ...`;                                   // exactly the Python shown on the page (solution.py's function)
function solve(args) {                      // args = one test case's "args" array
  const [nums, target] = args, frames = [], seen = new Map();
  ...
  frames.push({ line: lineOf(CODE, 'seen[x] = i'), note: '...', views: [...] });
  return { result: [j, i], frames };
}
// @@PORT-END
```

Rules for ports:
- Use `lineOf(CODE, snippet)` for every frame's line, never a typed number (it throws if the code changes).
- A frame at each meaningful step: every comparison or update the learner should see. Cap long runs (for example stop recording after 60 frames and add a last frame "... N more steps, same rule").
- The result must equal the Python reference on every test case (`verify_port.cjs` checks this).
- Always end with a frame for the return line (with `result`), so even an empty input has at least one frame.
- A brute-force port, when shown, is a second pair (`BRUTE_CODE`, `solveBrute`) inside the same markers.

## Problem sandbox

Markup: `<div class="sandbox-container" id="sandboxN"><div class="sandbox-header"><span class="sandbox-dot"></span><span>Title</span></div><div class="sandbox-body"> ...inputs (`<input type="text">` in `.control-group` with a `<label>`), `.btn-row`, `<p class="sb-error" role="alert"></p>`, the player div, `.readout`... </div></div>`. The body scrolls on its own. Problem sandboxes are gated automatically ("Try it yourself first" until the learner opens it or marks an outcome), because they show the solution code.

The sandbox is where the learner plays with their own input: text inputs for each argument (with "Try an example" buttons for the interesting cases: empty, duplicates, negative, no answer), a Run button that validates input and shows a friendly error for bad input, the trace player on that input, and a "brute vs pattern" readout with the operation counts of both. Keep its input sizes small (the trace stops recording after its frame cap).

## Verification (run once, fix in one batch, at most one more check)

1. `python3 tools/run_tests.py <problem dir> solution.py` passes every case. Cases come from the examples, the edge cases you teach, and a few random larger inputs checked against a brute force.
2. `node site/_build/verify_port.cjs <problem dir>` prints PASS.
3. `python3 site/_build/build.py --only N --out /tmp/pN.html`, then parse-check: `node -e "new Function(require('fs').readFileSync('/tmp/pN.html','utf8').split('<script>')[1].split('</script>')[0])"`.
4. `node site/_build/check.cjs /tmp/pN.html N /tmp/shotsN` prints `OK: no JavaScript errors`. Look at the dark, light and mobile screenshots it saves.
5. No duplicate ids, no em or en dashes, no emoji, no problem text copied from LeetCode.
6. Rebuild the full site.
