(() => {
// @@PORT-START
const CODE = `def contains_duplicate(nums: list[int]) -> bool:
    seen = set()
    for x in nums:
        if x in seen:
            return True
        seen.add(x)
    return False`;
const BRUTE_CODE = `def contains_duplicate(nums):
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            if nums[i] == nums[j]:
                return True
    return False`;
const SORT_CODE = `def contains_duplicate(nums):
    nums = sorted(nums)
    for i in range(1, len(nums)):
        if nums[i] == nums[i - 1]:
            return True
    return False`;
const CAP = 60;
// Records frames up to CAP; after that it only counts the steps it skipped.
// Frames are passed as functions, so nothing is built for steps that are not recorded.
function recorder() {
  const frames = []; let skipped = 0;
  return {
    frames,
    add(make) { if (frames.length < CAP) frames.push(make()); else skipped++; },
    end(make) {
      const f = make();
      if (skipped) frames.push({ line: f.line, note: `... ${skipped} more steps, same rule. Jumping to the end.`, views: f.views });
      frames.push(f);
    }
  };
}

// Pattern solution: one pass with a set (what solution.py does).
function solve(args) {
  const nums = args[0], R = recorder(), seen = [], firstAt = new Map();
  let lookups = 0;
  const views = (extra = {}) => [
    Object.assign({ type: 'array', name: 'nums', values: nums }, extra.arr || {}),
    Object.assign({ type: 'set', name: 'seen', values: seen.slice() }, extra.set || {}),
    { type: 'vars', values: { lookups } }
  ];
  R.add(() => ({ line: lineOf(CODE, 'seen = set()'), note: 'Start with an empty set called <code>seen</code>. It remembers every number we have walked past.', views: views() }));
  for (let i = 0; i < nums.length; i++) {
    const x = nums[i];
    lookups++;
    if (firstAt.has(x)) {
      const j = firstAt.get(x);
      R.end(() => ({ line: lineOf(CODE, 'return True'), note: `${x} is already in <code>seen</code> (we met it at index ${j}). A repeat: stop now. Only ${lookups} lookups were needed.`, result: true,
        views: views({ arr: { pointers: { x: i }, bad: [j, i], dim: nums.map((_, k) => k).filter(k => k > i) }, set: { hl: x } }) }));
      return { result: true, frames: R.frames, ops: lookups };
    }
    R.add(() => ({ line: lineOf(CODE, 'if x in seen'), note: `Look at x = ${x}. Is ${x} in <code>seen</code>? No. That took one lookup.`, views: views({ arr: { pointers: { x: i }, hl: [i], dim: nums.map((_, k) => k).filter(k => k > i) } }) }));
    seen.push(x); firstAt.set(x, i);
    R.add(() => ({ line: lineOf(CODE, 'seen.add(x)'), note: `Remember ${x}: add it to <code>seen</code>, then move on.`, views: views({ arr: { pointers: { x: i }, hl: [i], dim: nums.map((_, k) => k).filter(k => k > i) }, set: { new: x } }) }));
  }
  R.end(() => ({ line: lineOf(CODE, 'return False'), note: nums.length ? `The walk finished and no number came back. Every number is different: ${lookups} lookups in total.` : 'The list is empty, so the loop never runs. Nothing can repeat.', result: false, views: views() }));
  return { result: false, frames: R.frames, ops: lookups };
}

// Brute force: compare every pair (i, j) with i < j.
function solveBrute(args) {
  const nums = args[0], n = nums.length, R = recorder();
  const grid = nums.map((_, r) => nums.map((__, c) => (c > r ? '' : null)));
  let comparisons = 0;
  const views = (i, j, extra = {}) => [
    Object.assign({ type: 'array', name: 'nums', values: nums, pointers: i === null ? {} : (j === null ? { i } : { i, j }), hl: i === null ? [] : (j === null ? [i] : [i, j]) }, extra),
    { type: 'grid', name: 'pairs checked (row i, column j)', rows: grid.map(r => r.slice()), rowLabels: nums.map((_, k) => 'i=' + k), colLabels: nums.map((_, k) => 'j=' + k), hl: i !== null && j !== null ? [[i, j]] : [] },
    { type: 'vars', values: { comparisons } }
  ];
  R.add(() => ({ line: lineOf(BRUTE_CODE, 'n = len(nums)'), note: `n = ${n}. Plan: compare every number with every number after it. The grid shows each pair we check.`, views: views(null, null) }));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      comparisons++;
      const same = nums[i] === nums[j];
      grid[i][j] = same ? '=' : 'x';
      if (same) {
        R.end(() => ({ line: lineOf(BRUTE_CODE, 'return True'), note: `nums[${i}] = ${nums[j]} equals nums[${j}] = ${nums[j]}. Found a repeat after ${comparisons} comparisons.`, result: true, views: views(i, j, { bad: [i, j], hl: [] }) }));
        return { result: true, frames: R.frames, ops: comparisons };
      }
      R.add(() => ({ line: lineOf(BRUTE_CODE, 'if nums[i] == nums[j]'), note: `Compare nums[${i}] = ${nums[i]} with nums[${j}] = ${nums[j]}. Different. (comparison ${comparisons})`, views: views(i, j) }));
    }
  }
  R.end(() => ({ line: lineOf(BRUTE_CODE, 'return False'), note: n > 1 ? `Every pair was different. That took all ${comparisons} comparisons: n(n-1)/2 = ${n}*${n - 1}/2.` : 'With fewer than two numbers there are no pairs to compare.', result: false, views: views(null, null) }));
  return { result: false, frames: R.frames, ops: comparisons };
}

// Sort the way CPython's sort does for short lists (find the first run, then binary insertion),
// counting every "<" comparison. Matches Python 3.10's comparison count for lists under 64 numbers.
// (A browser's own sort is not used: different engines compare a different number of times.)
function pySort(a) {
  const b = a.slice(), n = b.length; let cmp = 0;
  const lt = (x, y) => { cmp++; return x < y; };
  if (n < 2) return { sorted: b, cmp };
  let run = 2;
  if (lt(b[1], b[0])) { while (run < n && lt(b[run], b[run - 1])) run++; b.splice(0, run, ...b.slice(0, run).reverse()); }
  else { while (run < n && !lt(b[run], b[run - 1])) run++; }
  for (let s = run; s < n; s++) {
    const piv = b[s]; let lo = 0, hi = s;
    while (lo < hi) { const p = (lo + hi) >> 1; if (lt(piv, b[p])) hi = p; else lo = p + 1; }
    b.splice(s, 1); b.splice(lo, 0, piv);
  }
  return { sorted: b, cmp };
}

// Sort first, then only neighbours can be equal.
function solveSort(args) {
  const orig = args[0], R = recorder();
  const { sorted: nums, cmp: sortCmp } = pySort(orig);
  let checks = 0;
  const views = (extra = {}) => [
    { type: 'array', name: 'nums before sorting', values: orig, dim: orig.map((_, k) => k) },
    Object.assign({ type: 'array', name: 'nums after sorting', values: nums }, extra),
    { type: 'vars', values: { 'sort comparisons': sortCmp, 'neighbour checks': checks } }
  ];
  R.add(() => ({ line: lineOf(SORT_CODE, 'nums = sorted(nums)'), note: `Sort first. Equal numbers now sit side by side. The sort itself made ${sortCmp} comparisons.`, views: views() }));
  for (let i = 1; i < nums.length; i++) {
    checks++;
    if (nums[i] === nums[i - 1]) {
      R.end(() => ({ line: lineOf(SORT_CODE, 'return True'), note: `nums[${i - 1}] and nums[${i}] are both ${nums[i]}. A repeat. Total work: ${sortCmp} + ${checks} = ${sortCmp + checks}.`, result: true, views: views({ pointers: { 'i-1': i - 1, i }, bad: [i - 1, i] }) }));
      return { result: true, frames: R.frames, ops: sortCmp + checks, sortCmp, checks };
    }
    R.add(() => ({ line: lineOf(SORT_CODE, 'if nums[i] == nums[i - 1]'), note: `Compare neighbours ${nums[i - 1]} and ${nums[i]}. Different, so slide right.`, views: views({ pointers: { 'i-1': i - 1, i }, win: [i - 1, i] }) }));
  }
  R.end(() => ({ line: lineOf(SORT_CODE, 'return False'), note: `No two neighbours match, so no number repeats. Total work: ${sortCmp} + ${checks} = ${sortCmp + checks}.`, result: false, views: views() }));
  return { result: false, frames: R.frames, ops: sortCmp + checks, sortCmp, checks };
}
// @@PORT-END

const $ = id => document.getElementById(id);
const players = [];
function mount(id, trace, opts) { const el = $(id); if (!el) return null; const p = TracePlayer(el, trace, opts); players.push({ el, p }); return p; }
const EX = [3, 8, 5, 1, 9, 5];

// Section 1: three example lists, no code (one frame each).
mount('p2tpX', { frames: [
  { note: 'Example 1: 5 shows up at index 2 and again at index 5.', result: true, views: [{ type: 'array', name: 'nums', values: EX, bad: [2, 5] }] },
  { note: 'Example 2: four numbers, all different.', result: false, views: [{ type: 'array', name: 'nums', values: [4, 2, 7, 1] }] },
  { note: 'Example 3: the same number three times. Any repeat counts.', result: true, views: [{ type: 'array', name: 'nums', values: [7, 7, 7], bad: [0, 1, 2] }] }
] }, { code: false });

mount('p2tpB', { code: BRUTE_CODE, frames: solveBrute([EX]).frames });
mount('p2tpS', { code: SORT_CODE, frames: solveSort([EX]).frames });
mount('p2tpA', { code: CODE, frames: solve([EX]).frames });

// Players inside closed <details> were drawn while hidden: redraw them when their box opens.
const panel = $('lesson2');
if (panel) panel.querySelectorAll('details').forEach(d => d.addEventListener('toggle', () => {
  if (d.open) players.forEach(({ el, p }) => { if (d.contains(el)) p.go(p.index); });
}));

// ======== SANDBOX 2: the duplicate race ========
const inp = $('s2In'), err = $('s2Err'), out = $('s2Out');
if (!inp) return;
const sb = mount('s2Tp', null, {});
const APPROACH = { pairs: { fn: solveBrute, code: BRUTE_CODE }, sort: { fn: solveSort, code: SORT_CODE }, set: { fn: solve, code: CODE } };
let approach = 'set';
function parse(text) {
  const t = text.trim().replace(/^\[/, '').replace(/\]$/, '').trim();
  if (!t) return [];
  const parts = t.split(/[\s,]+/).filter(Boolean);
  for (const s of parts) if (!/^-?\d+$/.test(s)) throw new Error(`"${s}" is not a whole number. Use numbers like 3, -7 or 42.`);
  const nums = parts.map(Number);
  if (nums.length > 12) throw new Error(`That is ${nums.length} numbers. Keep it to 12 or fewer so every step fits on screen.`);
  if (nums.some(v => Math.abs(v) > 1e9)) throw new Error('Keep each number between -1000000000 and 1000000000.');
  return nums;
}
function run() {
  let nums;
  try { nums = parse(inp.value); } catch (e) { err.textContent = e.message; return; }
  err.textContent = '';
  const res = { pairs: solveBrute([nums]), sort: solveSort([nums]), set: solve([nums]) };
  sb.load({ code: APPROACH[approach].code, frames: res[approach].frames });
  const best = Math.min(res.pairs.ops, res.sort.ops, res.set.ops);
  const won = ['pairs', 'sort', 'set'].filter(k => res[k].ops === best);
  const row = (k, label, val) => `<span class="rk">${label}:</span> <span class="${k === approach ? 'rv-o' : 'rv'}">${val}</span><br>`;
  out.innerHTML = `<span class="rk">answer:</span> <span class="rv">${res.set.result ? 'True (a number repeats)' : 'False (all different)'}</span><br>`
    + `<span class="rk">n = ${nums.length}. Steps each approach needs on this input:</span><br>`
    + row('pairs', 'pairs (compare every pair)', `${res.pairs.ops} comparisons`)
    + row('sort', 'sort + neighbours', `${res.sort.sortCmp} sort comparisons + ${res.sort.checks} neighbour checks = ${res.sort.ops}`)
    + row('set', 'set (one pass)', `${res.set.ops} lookups`)
    + `<span class="rk">fewest steps here:</span> <span class="rv">${won.join(' and ')}</span>`;
}
document.querySelectorAll('#sandbox2 [data-s2ex]').forEach(b => b.addEventListener('click', () => { inp.value = b.dataset.s2ex; run(); }));
document.querySelectorAll('#sandbox2 [data-s2ap]').forEach(b => b.addEventListener('click', () => {
  approach = b.dataset.s2ap;
  document.querySelectorAll('#sandbox2 [data-s2ap]').forEach(o => { const on = o === b; o.classList.toggle('btn-primary', on); o.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  run();
}));
$('s2Run').addEventListener('click', run);
inp.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
run();
})();
