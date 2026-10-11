(() => {
// @@PORT-START
const CODE = `def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}                  # value -> index
    for i, x in enumerate(nums):
        need = target - x      # the partner x needs
        if need in seen:       # partner already passed?
            return [seen[need], i]
        seen[x] = i            # store AFTER the check
    return []                  # no pair found`;

const BRUTE_CODE = `def two_sum(nums: list[int], target: int) -> list[int]:
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`;

const BUGGY_CODE = `def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, x in enumerate(nums):
        seen[x] = i                # BUG: x is stored before the check
        need = target - x
        if need in seen:
            return [seen[need], i]
    return []`;

const FRAME_CAP = 60;
// Frames are built lazily (a function per step) and recorded until the cap; finish() adds a "... more steps" frame.
function recorder() {
  const frames = []; let skipped = 0;
  return {
    frames,
    push(make) { if (frames.length < FRAME_CAP) frames.push(make()); else skipped++; },
    finish(make) {
      const last = make();
      if (skipped) frames.push({ line: last.line, note: `... ${skipped} more steps, same rule.`, views: last.views });
      frames.push(last);
    }
  };
}

// One-pass map: the reference solution.
function solve(args) {
  const [nums, target] = args, seen = new Map(), R = recorder();
  let lookups = 0;
  const ents = () => [...seen.entries()];
  const vars = (o) => ({ type: 'vars', values: Object.assign({ target }, o, { lookups }) });
  R.push(() => ({ line: lineOf(CODE, 'seen = {}'), note: `Start with an empty map. It will remember each number we pass, and where it was.`,
    views: [{ type: 'array', name: 'nums', values: nums }, { type: 'map', name: 'seen (value : index)', entries: [] }, vars({})] }));
  for (let i = 0; i < nums.length; i++) {
    const x = nums[i], need = target - x;
    R.push(() => ({ line: lineOf(CODE, 'need = target - x'), note: `Look at nums[${i}] = ${x}. Its partner must be ${target} - ${x} = ${need}.`,
      views: [{ type: 'array', name: 'nums', values: nums, pointers: { i }, hl: [i] }, { type: 'map', name: 'seen (value : index)', entries: ents() }, vars({ i, x, need })] }));
    lookups++;
    if (seen.has(need)) {
      const j = seen.get(need);
      R.push(() => ({ line: lineOf(CODE, 'if need in seen'), note: `Is ${need} in the map? Yes, at index ${j}. One glance, no search.`,
        views: [{ type: 'array', name: 'nums', values: nums, pointers: { j, i }, hl: [j, i] }, { type: 'map', name: 'seen (value : index)', entries: ents(), hl: need }, vars({ i, x, need })] }));
      R.finish(() => ({ line: lineOf(CODE, 'return [seen[need], i]'), note: `Return the two indices: ${nums[j]} + ${x} = ${target}. ${lookups} lookups in total.`, result: [j, i],
        views: [{ type: 'array', name: 'nums', values: nums, pointers: { j, i }, hl: [j, i] }, { type: 'map', name: 'seen (value : index)', entries: ents(), hl: need }, vars({ i, x, need })] }));
      return { result: [j, i], frames: R.frames, ops: lookups };
    }
    R.push(() => ({ line: lineOf(CODE, 'if need in seen'), note: `Is ${need} in the map? No. The partner has not gone by yet.`,
      views: [{ type: 'array', name: 'nums', values: nums, pointers: { i }, hl: [i] }, { type: 'map', name: 'seen (value : index)', entries: ents() }, vars({ i, x, need })] }));
    seen.set(x, i);
    R.push(() => ({ line: lineOf(CODE, 'seen[x] = i'), note: `Remember ${x} at index ${i}, so a later number can find it.`,
      views: [{ type: 'array', name: 'nums', values: nums, pointers: { i }, hl: [i] }, { type: 'map', name: 'seen (value : index)', entries: ents(), new: x }, vars({ i, x, need })] }));
  }
  R.finish(() => ({ line: lineOf(CODE, 'return []'), note: `The loop ended without a match: no two numbers add up to ${target}.`, result: [],
    views: [{ type: 'array', name: 'nums', values: nums }, { type: 'map', name: 'seen (value : index)', entries: ents() }, vars({})] }));
  return { result: [], frames: R.frames, ops: lookups };
}

// Brute force: try every pair.
function solveBrute(args) {
  const [nums, target] = args, n = nums.length, R = recorder();
  const small = n <= 12, rows = small ? nums.map(() => nums.map(() => null)) : [];
  let checks = 0;
  // the pair grid is drawn only for short inputs (spread into the views list, so long inputs simply skip it)
  const grid = (hl) => small ? [{ type: 'grid', name: 'pair grid (each cell = one sum we checked)', rows: rows.map(r => r.slice()),
    rowLabels: nums.map((v, k) => `i=${k}`), colLabels: nums.map((v, k) => `j=${k}`), hl }] : [];
  R.push(() => ({ line: lineOf(BRUTE_CODE, 'n = len(nums)'), note: `Plan: try every pair (i, j) with i before j, and add the two prices.`,
    views: [{ type: 'array', name: 'nums', values: nums }, ...grid([]), { type: 'vars', values: { target, 'pair checks': 0 } }] }));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const s = nums[i] + nums[j];
      checks++; if (small) rows[i][j] = s;
      const hit = s === target;
      R.push(() => ({ line: lineOf(BRUTE_CODE, 'if nums[i] + nums[j] == target'), note: `Check pair (${i}, ${j}): ${nums[i]} + ${nums[j]} = ${s}. ${hit ? 'That is the target.' : 'Not ' + target + '.'}`,
        views: [{ type: 'array', name: 'nums', values: nums, pointers: { i, j }, hl: [i, j] }, ...grid([[i, j]]), { type: 'vars', values: { i, j, 'nums[i] + nums[j]': s, target, 'pair checks': checks } }] }));
      if (hit) {
        R.finish(() => ({ line: lineOf(BRUTE_CODE, 'return [i, j]'), note: `Found it after ${checks} pair check${checks === 1 ? '' : 's'}.`, result: [i, j],
          views: [{ type: 'array', name: 'nums', values: nums, pointers: { i, j }, hl: [i, j] }, ...grid([[i, j]]), { type: 'vars', values: { i, j, 'nums[i] + nums[j]': s, target, 'pair checks': checks } }] }));
        return { result: [i, j], frames: R.frames, ops: checks };
      }
    }
  }
  R.finish(() => ({ line: lineOf(BRUTE_CODE, 'return []'), note: `Every pair was checked (${checks} of them). None adds up to ${target}.`, result: [],
    views: [{ type: 'array', name: 'nums', values: nums }, ...grid([]), { type: 'vars', values: { target, 'pair checks': checks } }] }));
  return { result: [], frames: R.frames, ops: checks };
}

// The classic bug: store x before asking for its partner.
function solveBuggy(args) {
  const [nums, target] = args, seen = new Map(), R = recorder();
  let lookups = 0;
  const ents = () => [...seen.entries()];
  const vars = (o) => ({ type: 'vars', values: Object.assign({ target }, o, { lookups }) });
  R.push(() => ({ line: lineOf(BUGGY_CODE, 'seen = {}'), note: `Same empty map. Watch the order of the next two steps.`,
    views: [{ type: 'array', name: 'nums', values: nums }, { type: 'map', name: 'seen (value : index)', entries: [] }, vars({})] }));
  for (let i = 0; i < nums.length; i++) {
    const x = nums[i], need = target - x;
    seen.set(x, i);
    R.push(() => ({ line: lineOf(BUGGY_CODE, 'seen[x] = i'), note: `Store ${x} at index ${i} first. x is now inside the map.`,
      views: [{ type: 'array', name: 'nums', values: nums, pointers: { i }, hl: [i] }, { type: 'map', name: 'seen (value : index)', entries: ents(), new: x }, vars({ i, x })] }));
    R.push(() => ({ line: lineOf(BUGGY_CODE, 'need = target - x'), note: `Partner needed: ${target} - ${x} = ${need}.`,
      views: [{ type: 'array', name: 'nums', values: nums, pointers: { i }, hl: [i] }, { type: 'map', name: 'seen (value : index)', entries: ents() }, vars({ i, x, need })] }));
    lookups++;
    if (seen.has(need)) {
      const j = seen.get(need), self = j === i;
      R.push(() => ({ line: lineOf(BUGGY_CODE, 'if need in seen'), note: self ? `Is ${need} in the map? Yes, but it is x itself, stored one step ago.` : `Is ${need} in the map? Yes, at index ${j}.`,
        views: [{ type: 'array', name: 'nums', values: nums, pointers: { i }, hl: [i], bad: self ? [i] : [] }, { type: 'map', name: 'seen (value : index)', entries: ents(), hl: need }, vars({ i, x, need })] }));
      R.finish(() => ({ line: lineOf(BUGGY_CODE, 'return [seen[need], i]'), note: self ? `Returns [${j}, ${i}]: index ${i} used twice. Wrong answer.` : `Returns [${j}, ${i}]. This time the bug stayed hidden.`, result: [j, i],
        views: [{ type: 'array', name: 'nums', values: nums, pointers: { i }, hl: self ? [] : [j, i], bad: self ? [i] : [] }, { type: 'map', name: 'seen (value : index)', entries: ents(), hl: need }, vars({ i, x, need })] }));
      return { result: [j, i], frames: R.frames, ops: lookups };
    }
    R.push(() => ({ line: lineOf(BUGGY_CODE, 'if need in seen'), note: `Is ${need} in the map? No.`,
      views: [{ type: 'array', name: 'nums', values: nums, pointers: { i }, hl: [i] }, { type: 'map', name: 'seen (value : index)', entries: ents() }, vars({ i, x, need })] }));
  }
  R.finish(() => ({ line: lineOf(BUGGY_CODE, 'return []'), note: `No match found.`, result: [],
    views: [{ type: 'array', name: 'nums', values: nums }, { type: 'map', name: 'seen (value : index)', entries: ents() }, vars({})] }));
  return { result: [], frames: R.frames, ops: lookups };
}
// @@PORT-END

  // Redraw a player after its hidden container opens (pointers are placed from layout).
  const redrawOn = (player, el) => {
    const d = el.closest('details'); if (d) d.addEventListener('toggle', () => { if (d.open) player.go(player.index); });
  };
  const mount = (id, trace, opts) => {
    const el = document.getElementById(id); if (!el) return null;
    const p = TracePlayer(el, trace, opts); redrawOn(p, el); return p;
  };

  const GIFT = [[5, 9, 1, 12, 3, 8], 11];

  /* ---------- Section 1: three examples, one frame each ---------- */
  const exFrame = (nums, target, ans, note) => ({ line: 1, note, result: ans,
    views: [{ type: 'array', name: 'nums (price tags, left to right)', values: nums, hl: ans }, { type: 'vars', values: { target, answer: '[' + ans.join(', ') + ']' } }] });
  mount('p3tpEx', { frames: [
    exFrame(GIFT[0], 11, solve(GIFT).result, 'Gift card worth 11. Only 3 + 8 makes exactly 11, at indices 4 and 5.'),
    exFrame([3, 3], 6, solve([[3, 3], 6]).result, 'Two items with the same price. They are different items, so [0, 1] is fine.'),
    exFrame([-4, 7, -1, 12, 5], -5, solve([[-4, 7, -1, 12, 5], -5]).result, 'Numbers can be negative (think refunds): -4 + -1 = -5.')
  ] }, { code: false });

  /* ---------- Sections 5, 6 and 10: brute force, map, buggy map ---------- */
  mount('p3tpB', { code: BRUTE_CODE, frames: solveBrute(GIFT).frames });
  mount('p3tpM', { code: CODE, frames: solve(GIFT).frames });
  mount('p3tpX', { code: BUGGY_CODE, frames: solveBuggy([[3, 4, 2], 6]).frames });

  /* ---------- Sandbox 3 ---------- */
  const sbNums = document.getElementById('s3Nums'), sbTarget = document.getElementById('s3Target');
  const sbErr = document.getElementById('s3Err'), sbOut = document.getElementById('s3Out'), sbEl = document.getElementById('s3Player');
  if (!sbNums || !sbEl) return;
  const sbPlayer = TracePlayer(sbEl, null);
  const APPROACH = { pairs: [BRUTE_CODE, solveBrute], map: [CODE, solve], buggy: [BUGGY_CODE, solveBuggy] };
  let approach = 'map';
  const apBtns = document.querySelectorAll('#sandbox3 [data-s3ap]');
  const setApproach = (a) => {
    approach = a;
    apBtns.forEach(b => { const on = b.dataset.s3ap === a; b.classList.toggle('btn-primary', on); b.setAttribute('aria-pressed', String(on)); });
  };
  apBtns.forEach(b => b.addEventListener('click', () => { setApproach(b.dataset.s3ap); run(); }));

  const INT = /^-?\d+$/, LIM = 1e9;
  function parse() {
    const raw = sbNums.value.replace(/[\[\]]/g, ' ').trim();
    const parts = raw ? raw.split(/[\s,]+/).filter(Boolean) : [];
    if (parts.length < 2) return { err: 'Type at least two whole numbers, separated by commas. Example: 2, 7, 11, 15' };
    if (parts.length > 12) return { err: 'Please keep it to 12 numbers or fewer, so the trace stays short enough to watch.' };
    const bad = parts.find(p => !INT.test(p));
    if (bad !== undefined) return { err: `"${bad}" is not a whole number. Use digits and an optional minus sign, like -3.` };
    const nums = parts.map(Number);
    const t = sbTarget.value.trim();
    if (!INT.test(t)) return { err: 'The target must be one whole number, like 9 or -5.' };
    const target = Number(t);
    if (nums.some(v => Math.abs(v) > LIM) || Math.abs(target) > 2 * LIM) return { err: 'Keep each number between -1000000000 and 1000000000.' };
    return { nums, target };
  }
  const span = (cls, s) => `<span class="${cls}">${s}</span>`;
  function run() {
    const p = parse();
    if (p.err) { sbErr.textContent = p.err; return; }
    const { nums, target } = p, args = [nums, target];
    const [code, fn] = APPROACH[approach];
    const out = fn(args), brute = solveBrute(args), good = solve(args);
    sbPlayer.load({ code, frames: out.frames });
    let pairs = 0;
    for (let i = 0; i < nums.length; i++) for (let j = i + 1; j < nums.length; j++) if (nums[i] + nums[j] === target) pairs++;
    sbErr.textContent = pairs === 0 ? `No two numbers add up to ${target}. The real problem promises a pair, so this input breaks its rule. The trace still shows the full search.`
      : pairs > 1 ? `This input has ${pairs} valid pairs. The real problem promises exactly one, so different approaches may return different pairs.` : '';
    const r = out.result;
    let valid;
    if (!r.length) valid = span('rv-o', 'no pair returned');
    else if (r[0] === r[1]) valid = span('rv-o', `no: index ${r[0]} is used twice`);
    else if (nums[r[0]] + nums[r[1]] === target) valid = span('rv', `yes: ${nums[r[0]]} + ${nums[r[1]]} = ${target}`);
    else valid = span('rv-o', `no: ${nums[r[0]]} + ${nums[r[1]]} = ${nums[r[0]] + nums[r[1]]}`);
    sbOut.innerHTML = `${span('rk', 'approach:')} ${span('rv', { pairs: 'try every pair', map: 'one-pass map', buggy: 'buggy map (store before check)' }[approach])}<br>` +
      `${span('rk', 'result:')} ${span('rv', '[' + r.join(', ') + ']')}<br>` +
      `${span('rk', 'valid:')} ${valid}<br>` +
      `${span('rk', 'pair checks (try every pair):')} ${span('rv', brute.ops)}<br>` +
      `${span('rk', 'lookups (one-pass map):')} ${span('rv', good.ops)}`;
  }
  const EX = {
    classic: ['2, 7, 11, 15', '9', 'map'],
    ends: ['1, 6, 8, 4, 10', '11', 'map'],
    dupes: ['3, 3', '6', 'map'],
    neg: ['-4, 7, -1, 12, 5', '-5', 'map'],
    trap: ['3, 4, 2', '6', 'buggy']
  };
  document.querySelectorAll('#sandbox3 [data-s3ex]').forEach(b => b.addEventListener('click', () => {
    const [n, t, a] = EX[b.dataset.s3ex]; sbNums.value = n; sbTarget.value = t; setApproach(a); run();
  }));
  document.getElementById('s3Run').addEventListener('click', run);
  [sbNums, sbTarget].forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') run(); }));
  setApproach('map');
  run();
})();
