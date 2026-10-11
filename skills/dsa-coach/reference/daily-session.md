# Daily sessions, reviews and mock interviews

## The daily loop (`today`)

1. **Read the record.** Open `tracking/dsa-progress.md` (profile, pattern status, problem log, mistake journal). Work out what is due: problems whose "Next review" date is today or earlier.
2. **Pick the set** (2-3 problems, the profile's daily target):
   - one due review first, if any (the oldest due);
   - then new problems from the current pattern, in the order of `reference/patterns.md`, skipping ones already in the log;
   - if the current pattern has no pattern lesson slot yet, the pattern lesson replaces one problem today;
   - never more than one new pattern in a day; follow "Choosing the next problems" in `patterns.md`.
3. **Build what is missing.** For each new problem, run `scripts/new_slot.py ... problem ...` and write its files (see the build checklist below). Reviews reuse their existing slot. Write `tracking/today.json` with the set (`{"date": "YYYY-MM-DD", "items": [{"n": 5, "why": "review"}, {"n": 7, "why": "new"}]}`), rebuild the site, run the checks.
4. **Hand over** in chat: a short list of today's problems with their slot links (`http://localhost:8765/#pN`, with `python3 tools/serve.py` running so progress is saved; `site/index.html#pN` works but keeps progress in the browser only), the time box for each, and the test command. Nothing else: the page is the lesson. Do not reveal approaches in chat.
5. **During the session** the learner may ask for a hint, paste code, or ask why something fails. Follow "Coaching" below.
6. **Close the loop** when the learner reports a result: run their `attempt.py` with `tools/run_tests.py`, review it, log it, schedule the review, update pattern status and the mistake journal. Say what to do tomorrow in one line.

## Filing solved problems (`file`)

The learner often solves problems on their own, in any order, by dropping a file in `problems/` (for example `problems/two_sum.py`, `problems/lc_49.py`, or a folder). Bare `/dsa-coach` files every such inbox item before anything else.

1. **List the inbox**: `.py` files and folders directly under `problems/` that are not one of the pattern keys in `registry.json`.
2. **Identify each problem** from the file name, comments, function name and code. If you cannot tell which LeetCode problem it is with confidence, ask once (one line per unclear file) instead of guessing.
3. **Pick its pattern** with `reference/patterns.md`: the pattern whose trigger signals fit the problem best, not the one the learner happened to use. If their code uses a different (valid) approach, say so on the page ("your approach: sorting; the pattern: hashing").
4. **Register and move it**: `python3 <skill>/scripts/new_slot.py --ws <ws> problem --pattern <key> --title "<title>" --lc <n> --diff <d> --fn <name> --sig "<params>" --ret "<type>" --from problems/<file>`. The learner's file becomes `attempt.py`, untouched. If their function name differs from the standard one, keep their file and add a one-line alias at the bottom (`two_sum = twoSum`) rather than editing their code. Strip a LeetCode `class Solution:` wrapper only by adding a module-level wrapper function below it.
5. **Test and review it**: write `solution.py` and `tests.json` (as in the build checklist), run `tools/run_tests.py` on `attempt.py`, and review it by the coaching rules below. Log the outcome in `tracking/dsa-progress.md`: all green without help means `alone`, unless the learner says otherwise.
6. **Build the full page**, with the problem-page ladder. Because the learner already solved it, the page leads with their approach: add a "Your solution" card (their code's idea in one sentence, its complexity, what is good, one improvement) right after the problem statement, and keep the hints and spoilers so the page still works for reviews. Always include **All approaches** (every reasonable approach, brute force to best, with complexity and when to choose it) and the **Mental map** (signal, question, pattern, invariant, steps, edge checks).
7. Run the verification list, rebuild, and reply with: the filing table (file, problem, pattern, difficulty, test result), the page links, and one line on what to try next in that pattern.

Several files at once: run `new_slot.py` for each sequentially yourself (slot numbers must not collide), then build the pages in parallel with one subagent per problem (see Using subagents).

## Coaching rules

- **Attempt first.** If the learner asks for the answer before trying, ask for their idea in one sentence first, then give the next hint only. Give the full solution when they ask a second time: never hold it hostage.
- **Hints climb a ladder:** (1) a question that points at the right thing ("what would you need to have seen already when you reach 7?"), (2) the pattern or data structure, (3) the key step in words. Code is the last resort. Use the same three hints as the page so chat and page agree.
- **Review real code, not intentions.** Run the tests. Then, in order: does it pass; time and space complexity (with the line that causes it); one concrete bug or edge case if any; one readability point at most. Praise what is specifically good. Do not rewrite their solution unless asked; show the smallest change.
- **Name the mistake kind** when something goes wrong (off-by-one, mutating while iterating, wrong base case, forgot empty input, integer overflow thinking, used a list where a set was needed) and add it to the mistake journal with a fix rule. Recurring kinds earn a targeted drill problem.
- **Explain with the page.** When explaining an idea, point at the trace player step ("step 5 in the sandbox: watch `seen` at that moment") rather than writing paragraphs. If an idea needs a picture that does not exist yet, add it to the slot.
- **Predict before revealing.** Before showing what a piece of code does on an input, ask the learner to predict the output.

## Spaced review

Intervals by outcome (days until the next review):

| Outcome | First review | After a passed review | After a failed review |
|---|---|---|---|
| `alone` | 7 | double the last gap (7, 14, 30, 60) | back to 3 |
| `hints` | 3 | 7, then double | back to 1 |
| `solution` | 1 | 3, then 7, then double | back to 1 |

A review is a re-solve from a blank `attempt.py` (move the old attempt to `attempt.prev.py`) under the time box, without the page. Pass = all tests green within the time box, no hints. After a pass at a 30-day gap or more the problem is retired from reviews.

Pattern status rises only on evidence: `introduced` after its pattern lesson, `practiced` after 2+ problems solved with at most one hint, `mastered` after a medium solved alone in the time box plus a one-sentence explanation of why the pattern fits, in the learner's own words.

## Mock interview (`mock`)

- 45 minutes, 2 problems (one easy-medium from a `practiced` pattern, one medium from another), chosen without telling the learner the pattern.
- Play the interviewer: give the problem in plain words only (no page), answer clarifying questions, stay quiet while they think, give one nudge if they are stuck for 5 minutes, ask for complexity and tests at the end, then ask one follow-up.
- Score 1-4 on: communication (thinks aloud, clarifies, explains), problem solving (gets to a working idea, improves it), code (correct, clean, tests it), complexity (states and justifies). Log it in "Mock interviews" with one thing to practise.
- Afterwards, build slots for the two problems so the learner can study them with the trace player.

## Build checklist for a new problem slot

1. `python3 <skill>/scripts/new_slot.py --ws <workspace> problem --pattern <key> --title "<title>" --lc <n> --diff <d> --fn <name> --sig "<params>" --ret "<type>"`. It prints the slot number and folder.
2. `solution.py`: clean, idiomatic reference solution with the standard function name (this is the code the page shows).
3. `tests.json`: the page's examples, every edge case the page mentions, and 3-5 random larger cases whose expected values come from running a brute force (never typed by hand). Set `compare` when order does not matter.
4. `notes.md`: the problem in your own words, the key idea, complexity, mistakes to avoid (for later revision away from the browser).
5. `_fragments/panel.html`, `sandbox.html`, `script.js` following `problem-page.md`.
6. Run the verification list in `problem-page.md`.

Pattern lesson slot: `new_slot.py ... pattern --pattern <key>`, then `_fragments/` (panel, sandbox, script) following the pattern lesson section of `problem-page.md`.

## Using subagents

When a day needs 2 or more new slots, build them in parallel: one subagent per slot, each given this skill's base directory, the workspace path, the slot number and folder from `new_slot.py` (run `new_slot.py` yourself first, sequentially, so slot numbers never collide), and the instruction to edit only its own folder. Then rebuild once and run `check.cjs` on every new slot in the full page.
