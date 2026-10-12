(() => {
// @@PORT-START
const CODE = `def second_largest_element(arr: list[int]) -> int:
    first = second = None
    for x in arr:
        if first is None or x > first:
            first, second = x, first
        elif x < first and (second is None or x > second):
            second = x
    return -1 if second is None else second`;
const SORT_CODE = `def second_largest_element(arr):
    arr = list(set(arr))
    if len(arr) < 2:
        return -1
    arr.sort(reverse=True)
    return arr[1]`;
const TWO_CODE = `def second_largest_element(arr):
    top = max(arr)
    best = None
    for x in arr:
        if x < top and (best is None or x > best):
            best = x
    return -1 if best is None else best`;
const CAP = 60;
// Records frames up to CAP; after that it only counts the steps it skipped.
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
const show = v => (v === null ? 'None' : v);
const after = (arr, i) => arr.map((_, k) => k).filter(k => k > i);

// Pattern solution: one pass, two variables (what solution.py does).
function solve(args) {
  const arr = args[0], R = recorder();
  let first = null, second = null, steps = 0;
  const views = (i, extra = {}) => [
    Object.assign({ type: 'array', name: 'arr', values: arr, pointers: i === null ? {} : { x: i }, hl: i === null ? [] : [i], dim: i === null ? [] : after(arr, i) }, extra),
    { type: 'vars', values: { first: show(first), second: show(second), steps } }
  ];
  R.add(() => ({ line: lineOf(CODE, 'first = second = None'), note: 'Two empty podium steps. <code>None</code> means "nobody stands here yet".', views: views(null) }));
  for (let i = 0; i < arr.length; i++) {
    const x = arr[i];
    steps++;
    if (first === null || x > first) {
      const old = first;
      second = first; first = x;
      R.add(() => ({ line: lineOf(CODE, 'first, second = x, first'), note: old === null
        ? `x = ${x} is the first number, so it takes the top step.`
        : `x = ${x} beats the champion ${old}. ${old} steps down to second, ${x} takes first.`, views: views(i) }));
    } else if (x < first && (second === null || x > second)) {
      const old = second;
      second = x;
      R.add(() => ({ line: lineOf(CODE, 'second = x'), note: old === null
        ? `x = ${x} is below first (${first}) and second is empty, so ${x} takes second.`
        : `x = ${x} is below first (${first}) but above second (${old}). ${x} takes second.`, views: views(i) }));
    } else {
      R.add(() => ({ line: lineOf(CODE, 'elif x < first'), note: x === first
        ? `x = ${x} equals first. A repeat of the champion is not a new runner-up: skip it.`
        : `x = ${x} is not above second (${second}). Skip it.`, views: views(i) }));
    }
  }
  const result = second === null ? -1 : second;
  R.end(() => ({ line: lineOf(CODE, 'return -1 if second is None'), note: second === null
    ? `The walk ended with an empty second step: every number was ${first}. Return -1. Steps: ${steps}.`
    : `The walk ended. Second place is ${second}. One look at each number: ${steps} steps.`, result, views: views(null) }));
  return { result, frames: R.frames, ops: steps };
}

// Sorting the way CPython does for short lists (binary insertion after the first run), counting comparisons.
// Here it sorts high to low. A Python set has no fixed order; the trace keeps first-seen order.
function sortDesc(a) {
  const b = a.slice(), n = b.length; let cmp = 0;
  const lt = (x, y) => { cmp++; return x > y; };   // "comes before" = bigger
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

// The learner's approach: drop repeats, sort high to low, take index 1.
function solveSort(args) {
  const orig = args[0], R = recorder();
  const distinct = [...new Set(orig)];
  const views = (list, name, extra = {}) => [
    { type: 'array', name: 'arr (input)', values: orig, dim: orig.map((_, k) => k) },
    Object.assign({ type: 'array', name, values: list }, extra)
  ];
  R.add(() => ({ line: lineOf(SORT_CODE, 'arr = list(set(arr))'), note: `Drop repeats: ${orig.length} numbers become ${distinct.length} different values. That is one pass over the input.`, views: views(distinct, 'distinct values') }));
  if (distinct.length < 2) {
    R.end(() => ({ line: lineOf(SORT_CODE, 'return -1'), note: 'Fewer than two different values: there is no second largest. Return -1.', result: -1, views: views(distinct, 'distinct values') }));
    return { result: -1, frames: R.frames, ops: orig.length, sortCmp: 0 };
  }
  const { sorted, cmp } = sortDesc(distinct);
  R.add(() => ({ line: lineOf(SORT_CODE, 'arr.sort(reverse=True)'), note: `Sort high to low. This sort made ${cmp} comparisons to put all ${distinct.length} values in order, though we only need the top two.`, views: views(sorted, 'sorted, high to low', { hl: [0, 1] }) }));
  R.end(() => ({ line: lineOf(SORT_CODE, 'return arr[1]'), note: `Index 0 is the largest (${sorted[0]}), index 1 is the answer: ${sorted[1]}. Work: ${orig.length} to build the set + ${cmp} sort comparisons.`, result: sorted[1], views: views(sorted, 'sorted, high to low', { pointers: { '1': 1 }, hl: [1] }) }));
  return { result: sorted[1], frames: R.frames, ops: orig.length + cmp, sortCmp: cmp };
}

// Two passes: find the max, then the biggest value below it.
function solveTwo(args) {
  const arr = args[0], R = recorder();
  let top = arr[0];
  for (let k = 1; k < arr.length; k++) if (arr[k] > top) top = arr[k];
  let best = null, steps = arr.length - 1;
  const views = (i, extra = {}) => [
    Object.assign({ type: 'array', name: 'arr', values: arr, pointers: i === null ? {} : { x: i }, hl: i === null ? [] : [i] }, extra),
    { type: 'vars', values: { top, best: show(best), steps } }
  ];
  R.add(() => ({ line: lineOf(TWO_CODE, 'top = max(arr)'), note: `Pass 1: <code>max</code> walks the list and finds top = ${top}. That costs ${arr.length - 1} comparisons.`, views: views(null, { hl: arr.map((v, k) => (v === top ? k : -1)).filter(k => k >= 0) }) }));
  for (let i = 0; i < arr.length; i++) {
    const x = arr[i];
    steps++;
    if (x < top && (best === null || x > best)) {
      best = x;
      R.add(() => ({ line: lineOf(TWO_CODE, 'best = x'), note: `Pass 2: x = ${x} is below top and is the biggest such value so far. best = ${x}.`, views: views(i) }));
    } else {
      R.add(() => ({ line: lineOf(TWO_CODE, 'if x < top'), note: x === top ? `Pass 2: x = ${x} is the top itself. Skip it.` : `Pass 2: x = ${x} is not bigger than best (${best}). Skip it.`, views: views(i) }));
    }
  }
  const result = best === null ? -1 : best;
  R.end(() => ({ line: lineOf(TWO_CODE, 'return -1 if best is None'), note: `Two passes done: ${steps} steps. Answer: ${result}.`, result, views: views(null) }));
  return { result, frames: R.frames, ops: steps };
}
// @@PORT-END

const $ = id => document.getElementById(id);
const players = [];
function mount(id, trace, opts) { const el = $(id); if (!el) return null; const p = TracePlayer(el, trace, opts); players.push({ el, p }); return p; }
const EX = [12, 1, 35, 10, 34, 1];

// Section 1: the examples, no code (one frame each).
mount('p23tpX', { frames: [
  { note: 'Example 1: 35 is the largest. The next one down is 34.', result: 34, views: [{ type: 'array', name: 'arr', values: EX, hl: [2], win: [4, 4] }] },
  { note: 'Example 2: 8 is the largest, and it appears twice. The answer is the next different value, 7.', result: 7, views: [{ type: 'array', name: 'arr', values: [7, 8, 8, 1, 4, 3], hl: [1, 2], win: [0, 0] }] },
  { note: 'Example 3: every number is 10. There is no second largest, so the answer is -1.', result: -1, views: [{ type: 'array', name: 'arr', values: [10, 10, 10, 10, 10], bad: [0, 1, 2, 3, 4] }] }
] }, { code: false });

mount('p23tpB', { code: SORT_CODE, frames: solveSort([EX]).frames });
mount('p23tpT', { code: TWO_CODE, frames: solveTwo([EX]).frames });
mount('p23tpA', { code: CODE, frames: solve([EX]).frames });

// Players inside closed <details> were drawn while hidden: redraw them when their box opens.
const panel = $('lesson23');
if (panel) panel.querySelectorAll('details').forEach(d => d.addEventListener('toggle', () => {
  if (d.open) players.forEach(({ el, p }) => { if (d.contains(el)) p.go(p.index); });
}));

// ======== SANDBOX 23: the podium race ========
const inp = $('s23In'), err = $('s23Err'), out = $('s23Out');
if (!inp) return;
const sb = mount('s23Tp', null, {});
const APPROACH = { sort: { fn: solveSort, code: SORT_CODE }, two: { fn: solveTwo, code: TWO_CODE }, one: { fn: solve, code: CODE } };
let approach = 'one';
function parse(text) {
  const t = text.trim().replace(/^\[/, '').replace(/\]$/, '').trim();
  if (!t) throw new Error('Type at least one number. The problem promises the list is never empty.');
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
  const res = { sort: solveSort([nums]), two: solveTwo([nums]), one: solve([nums]) };
  sb.load({ code: APPROACH[approach].code, frames: res[approach].frames });
  const row = (k, label, val) => `<span class="rk">${label}:</span> <span class="${k === approach ? 'rv-o' : 'rv'}">${val}</span><br>`;
  out.innerHTML = `<span class="rk">answer:</span> <span class="rv">${res.one.result}</span><br>`
    + `<span class="rk">n = ${nums.length}. Steps each approach needs on this input:</span><br>`
    + row('sort', 'drop repeats + sort', `${nums.length} set inserts + ${res.sort.sortCmp} sort comparisons = ${res.sort.ops}`)
    + row('two', 'two passes', `${res.two.ops} steps`)
    + row('one', 'one pass (podium)', `${res.one.ops} steps`);
}
document.querySelectorAll('#sandbox23 [data-s23ex]').forEach(b => b.addEventListener('click', () => { inp.value = b.dataset.s23ex; run(); }));
document.querySelectorAll('#sandbox23 [data-s23ap]').forEach(b => b.addEventListener('click', () => {
  approach = b.dataset.s23ap;
  document.querySelectorAll('#sandbox23 [data-s23ap]').forEach(o => { const on = o === b; o.classList.toggle('btn-primary', on); o.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  run();
}));
$('s23Run').addEventListener('click', run);
inp.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
run();
})();
