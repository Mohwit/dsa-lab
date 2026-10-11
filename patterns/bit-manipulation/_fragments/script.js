// ======== SLOT 21: PATTERN LESSON, BIT MANIPULATION ========
(() => {
  const DROP_CODE = `def count_ones(n):
    count = 0
    while n:
        n &= n - 1
        count += 1
    return count`;
  const SCAN_CODE = `def count_ones_slow(n):
    count = 0
    for i in range(32):
        if (n >> i) & 1:
            count += 1
    return count`;
  const XOR_CODE = `def single_number(nums):
    acc = 0
    for x in nums:
        acc ^= x
    return acc`;
  const MAP_CODE = `def single_number_count(nums):
    count = {}
    for x in nums:
        count[x] = count.get(x, 0) + 1
    for x, c in count.items():
        if c == 1:
            return x
    return None`;
  const ADD_CODE = `def add(a, b):
    MASK = 0xFFFFFFFF
    a, b = a & MASK, b & MASK
    while b:
        a, b = (a ^ b) & MASK, ((a & b) << 1) & MASK
    return a if a <= 0x7FFFFFFF else a - (1 << 32)`;
  const OPS = { '&': 'AND', '|': 'OR', '^': 'XOR' };
  const combineCode = op => `def combine(a, b):
    r = 0
    for i in range(8):
        x = (a >> i) & 1
        y = (b >> i) & 1
        r |= (x ${op} y) << i
    return r`;
  const CAP = 60;

  /* ---------- helpers: bits as one grid column per switch ---------- */
  const widthFor = m => (m < 16 ? 4 : m < 256 ? 8 : m < 65536 ? 16 : 32);
  const bits = (n, w) => Array.from({ length: w }, (_, c) => (n >>> (w - 1 - c)) & 1);
  const cols = w => Array.from({ length: w }, (_, c) => String(w - 1 - c));
  const colOf = (i, w) => w - 1 - i;                       // bit position i -> grid column
  const bin = (n, w) => (n >>> 0).toString(2).padStart(w, '0');
  const lowCol = (n, w) => { for (let i = 0; i < w; i++) if ((n >>> i) & 1) return colOf(i, w); return -1; };
  const grid = (name, rows, labels, w, hl) => ({ type: 'grid', name, rows, rowLabels: labels, colLabels: cols(w), hl: hl || [] });
  const setVal = (id, v) => { const el = document.getElementById(id); if (!el) return; el.querySelector('.val').textContent = v; flash(el); };

  // Counters with the same rules as measure.py.
  const dropCount = n => { let s = 0; n = n >>> 0; while (n) { n = (n & (n - 1)) >>> 0; s++; } return s; };
  const SCAN_STEPS = 32;
  function mapCount(nums) {
    const m = new Map(); let ops = 0;
    for (const x of nums) { m.set(x, (m.get(x) || 0) + 1); ops++; }
    for (const [x, c] of m) { ops++; if (c === 1) return { ans: x, ops, size: m.size }; }
    return { ans: null, ops, size: m.size };
  }

  /* ---------- trace: drop the lowest set bit ---------- */
  function dropFrames(n0, note0) {
    const L = s => lineOf(DROP_CODE, s), frames = [];
    let n = n0 >>> 0, count = 0;
    const w = widthFor(n);
    frames.push({ line: L('count = 0'), note: note0 || `n = ${n} is ${bin(n, w)} in binary. Each step will switch off one 1.`, views: [grid('n', [bits(n, w)], ['n'], w), { type: 'vars', values: { n, count } }] });
    while (n) {
      const m = (n - 1) >>> 0, next = (n & m) >>> 0, c = lowCol(n, w);
      if (frames.length >= CAP) { frames.push({ line: L('n &= n - 1'), note: `... ${dropCount(n)} more steps, same rule: each one switches off the lowest 1.`, views: [grid('n', [bits(n, w)], ['n'], w), { type: 'vars', values: { n, count } }] }); count += dropCount(n); n = 0; break; }
      frames.push({ line: L('n &= n - 1'), note: `n - 1 flips the lowest 1 (bit ${w - 1 - c}) to 0 and the 0s below it to 1. AND keeps only what both rows share, so that 1 is gone.`, views: [grid('n &= n - 1, column by column', [bits(n, w), bits(m, w), bits(next, w)], ['n', 'n - 1', 'n & (n - 1)'], w, [[0, c], [1, c], [2, c]]), { type: 'vars', values: { n: next, count } }] });
      n = next; count++;
      frames.push({ line: L('count += 1'), note: `One 1 removed, so count = ${count}. ${n ? 'Some 1s are left.' : 'n is 0 now: nothing left.'}`, views: [grid('n', [bits(n, w)], ['n'], w), { type: 'vars', values: { n, count } }] });
    }
    frames.push({ line: L('return count'), note: `Done in ${count} step${count === 1 ? '' : 's'}: one per 1, no matter how wide the number is.`, result: count, views: [grid('n', [bits(n, w)], ['n'], w), { type: 'vars', values: { n, count } }] });
    return { count, steps: count, frames };
  }

  /* ---------- trace: check all 32 bits ---------- */
  function scanFrames(n0) {
    const L = s => lineOf(SCAN_CODE, s), frames = [], n = n0 >>> 0, w = widthFor(n);
    let count = 0, steps = 0;
    frames.push({ line: L('count = 0'), note: `Only ${w} switches are drawn, but the loop checks all 32 positions.`, views: [grid('n', [bits(n, w)], ['n'], w), { type: 'vars', values: { i: '-', count, steps } }] });
    for (let i = 0; i < 32; i++) {
      steps++;
      const on = (n >>> i) & 1, inside = i < w;
      frames.push({ line: L('if (n >> i) & 1'), note: inside ? `Check ${steps}: bit ${i} is ${on ? '1, count it' : '0, skip'}.` : `Check ${steps}: bit ${i} is outside the drawing. It is 0, but the loop still looks.`, views: [grid('n', [bits(n, w)], ['n'], w, inside ? [[0, colOf(i, w)]] : []), { type: 'vars', values: { i, count, steps } }] });
      if (on) { count++; frames.push({ line: L('count += 1'), note: `count = ${count}.`, views: [grid('n', [bits(n, w)], ['n'], w, inside ? [[0, colOf(i, w)]] : []), { type: 'vars', values: { i, count, steps } }] }); }
    }
    frames.push({ line: L('return count'), note: `${count} ones, after ${steps} checks. Most checks looked at a 0.`, result: count, views: [grid('n', [bits(n, w)], ['n'], w), { type: 'vars', values: { i: 31, count, steps } }] });
    return { count, steps, frames };
  }

  /* ---------- trace: XOR fold ---------- */
  function xorFrames(nums) {
    const L = s => lineOf(XOR_CODE, s), frames = [], w = widthFor(Math.max(0, ...nums));
    let acc = 0, steps = 0;
    const arr = ex => Object.assign({ type: 'array', name: 'nums', values: nums }, ex);
    frames.push({ line: L('acc = 0'), note: 'acc starts at 0: every switch off. XOR with 0 changes nothing.', views: [arr({}), grid('acc', [bits(0, w)], ['acc'], w), { type: 'vars', values: { acc, steps } }] });
    for (let k = 0; k < nums.length; k++) {
      const x = nums[k], next = acc ^ x; steps++;
      if (frames.length >= CAP) { frames.push({ line: L('acc ^= x'), note: `... ${nums.length - k} more steps, same rule: flip the switches where x has a 1.`, views: [arr({ pointers: { x: k } }), grid('acc', [bits(acc, w)], ['acc'], w), { type: 'vars', values: { acc, steps: steps - 1 } }] }); for (let j = k; j < nums.length; j++) acc ^= nums[j]; steps = nums.length; break; }
      const flips = []; for (let c = 0; c < w; c++) if (bits(x, w)[c]) flips.push([1, c], [2, c]);
      const pairNote = nums.slice(0, k).includes(x) ? ` ${x} was seen before, so its switches flip back: the pair cancels.` : '';
      frames.push({ line: L('acc ^= x'), note: `acc ^ ${x}: flip every column where ${x} has a 1.${pairNote}`, views: [arr({ pointers: { x: k }, hl: [k], dim: nums.map((_, j) => j).filter(j => j > k) }), grid('acc ^= x', [bits(acc, w), bits(x, w), bits(next, w)], ['acc', 'x', 'acc ^ x'], w, flips), { type: 'vars', values: { acc: next, steps } }] });
      acc = next;
    }
    frames.push({ line: L('return acc'), note: `Every pair has cancelled. What is left is ${acc}. ${steps} step${steps === 1 ? "" : "s"}, one number of memory.`, result: acc, views: [arr({}), grid('acc', [bits(acc, w)], ['acc'], w), { type: 'vars', values: { acc, steps } }] });
    return { ans: acc, steps, frames };
  }

  /* ---------- trace: count with a dict ---------- */
  function mapFrames(nums) {
    const L = s => lineOf(MAP_CODE, s), frames = [], m = new Map();
    let ops = 0;
    const ent = () => [...m.entries()];
    frames.push({ line: L('count = {}'), note: 'An empty dict: value to how many times it appears.', views: [{ type: 'array', name: 'nums', values: nums }, { type: 'map', name: 'count', entries: [] }, { type: 'vars', values: { ops } }] });
    for (let k = 0; k < nums.length; k++) {
      const x = nums[k]; m.set(x, (m.get(x) || 0) + 1); ops++;
      if (frames.length < CAP) frames.push({ line: L('count[x] = count.get(x, 0) + 1'), note: `Tally ${x}: it has been seen ${m.get(x)} time${m.get(x) === 1 ? '' : 's'}. The dict holds ${m.size} key${m.size === 1 ? '' : 's'}.`, views: [{ type: 'array', name: 'nums', values: nums, pointers: { x: k }, hl: [k] }, { type: 'map', name: 'count', entries: ent(), new: x }, { type: 'vars', values: { ops } }] });
    }
    for (const [x, c] of m) {
      ops++;
      frames.push({ line: L('if c == 1'), note: `Is the count of ${x} equal to 1? ${c === 1 ? 'Yes.' : `No, it is ${c}.`}`, views: [{ type: 'array', name: 'nums', values: nums }, { type: 'map', name: 'count', entries: ent(), hl: x }, { type: 'vars', values: { ops } }] });
      if (c === 1) {
        frames.push({ line: L('return x'), note: `Found it after ${ops} operations, with ${m.size} key${m.size === 1 ? "" : "s"} stored.`, result: x, views: [{ type: 'array', name: 'nums', values: nums }, { type: 'map', name: 'count', entries: ent(), hl: x }, { type: 'vars', values: { ops } }] });
        return { ans: x, ops, size: m.size, frames };
      }
    }
    frames.push({ line: L('return None'), note: 'No value appears exactly once.', result: 'None', views: [{ type: 'array', name: 'nums', values: nums }, { type: 'map', name: 'count', entries: ent() }, { type: 'vars', values: { ops } }] });
    return { ans: null, ops, size: m.size, frames };
  }

  /* ---------- trace: combine two numbers column by column ---------- */
  function combineFrames(a, b, op) {
    const code = combineCode(op), L = s => lineOf(code, s), frames = [], w = 8;
    const f = (x, y) => (op === '&' ? x & y : op === '|' ? x | y : x ^ y);
    const r = Array(w).fill(null);
    let val = 0;
    const g = hl => grid(`a ${op} b, one column at a time`, [bits(a, w), bits(b, w), r.slice()], ['a', 'b', 'r'], w, hl);
    frames.push({ line: L('r = 0'), note: `a = ${a} and b = ${b}, drawn as 8 switches each. The answer row r fills from the right.`, views: [g([]), { type: 'vars', values: { r: 0 } }] });
    for (let i = 0; i < w; i++) {
      const x = (a >> i) & 1, y = (b >> i) & 1, bit = f(x, y), c = colOf(i, w);
      r[c] = bit; val |= bit << i;
      frames.push({ line: L('r |= (x'), note: `Column ${i}: x = ${x}, y = ${y}, so ${x} ${op} ${y} = ${bit}.`, views: [g([[0, c], [1, c], [2, c]]), { type: 'vars', values: { i, x, y, r: val } }] });
    }
    frames.push({ line: L('return r'), note: `Every column was handled on its own, with no carries: ${a} ${op} ${b} = ${val}.`, result: val, views: [g([]), { type: 'vars', values: { r: val } }] });
    return { val, frames };
  }

  /* ---------- trace: add with XOR and carries ---------- */
  function addFrames(a0, b0) {
    const L = s => lineOf(ADD_CODE, s), frames = [], w = 8;
    let a = a0 >>> 0, b = b0 >>> 0, rounds = 0;
    frames.push({ line: L('a, b = a & MASK'), note: `Start: a = ${a}, b = ${b}. XOR adds without carrying; AND finds where a carry is born.`, views: [grid('a and b', [bits(a, w), bits(b, w)], ['a', 'b'], w), { type: 'vars', values: { a, b, rounds } }] });
    while (b) {
      const s = (a ^ b) >>> 0, c = ((a & b) << 1) >>> 0; rounds++;
      frames.push({ line: L('(a ^ b) & MASK'), note: `Round ${rounds}: a ^ b = ${s} is the sum without carries. (a & b) << 1 = ${c} is the carry, moved one column left.`, views: [grid('one round', [bits(a, w), bits(b, w), bits(s, w), bits(c, w)], ['a', 'b', 'a ^ b', '(a & b) << 1'], w), { type: 'vars', values: { a: s, b: c, rounds } }] });
      a = s; b = c;
      frames.push({ line: L('while b'), note: b ? `Carry is ${b}, not 0, so go round again.` : 'Carry is 0: nothing left to add.', views: [grid('a and b', [bits(a, w), bits(b, w)], ['a', 'b'], w), { type: 'vars', values: { a, b, rounds } }] });
    }
    const res = a <= 0x7FFFFFFF ? a : a - 4294967296;
    frames.push({ line: L('return a if'), note: `${a0} + ${b0} = ${res} after ${rounds} rounds.`, result: res, views: [grid('a', [bits(a, w)], ['a'], w), { type: 'vars', values: { a, b, rounds } }] });
    return { res, rounds, frames };
  }

  const play = (id, trace, opts) => { const el = document.getElementById(id); return el ? TracePlayer(el, trace, opts || {}) : null; };

  /* ---------- Section 1: switch board ---------- */
  (() => {
    const box = document.getElementById('p21sw'); if (!box) return;
    let v = 0;
    const btns = [...box.querySelectorAll('[data-p21bit]')];
    function show() {
      btns.forEach(b => {
        const on = (v >> Number(b.dataset.p21bit)) & 1;
        b.textContent = on ? '1' : '0';
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.style.borderColor = on ? 'var(--teal)' : 'var(--border)';
        b.style.background = on ? 'var(--teal-wash)' : 'var(--bg-raised)';
        b.style.color = on ? 'var(--teal)' : 'var(--text-dim)';
      });
      setVal('p21roV', v); setVal('p21roW', bin(v, 8)); setVal('p21roK', dropCount(v));
      const goal = document.getElementById('p21goal');
      if (goal) goal.textContent = v === 44 ? 'You made 44: switches 5, 3 and 2 are on (32 + 8 + 4).' : v === 255 ? 'All eight on: 255, the biggest 8-switch number.' : 'Challenge: make 44, then 255.';
    }
    btns.forEach(b => b.addEventListener('click', () => { v ^= 1 << Number(b.dataset.p21bit); show(); }));
    const clr = document.getElementById('p21swClear');
    if (clr) clr.addEventListener('click', () => { v = 0; show(); });
    show();
  })();

  /* ---------- Section 1: the two players on 44 ---------- */
  (() => {
    const a = dropFrames(44), b = scanFrames(44);
    play('p21tpA', { code: DROP_CODE, frames: a.frames });
    play('p21tpB', { code: SCAN_CODE, frames: b.frames });
    setVal('p21roA', a.steps); setVal('p21roB', b.steps);
  })();

  /* ---------- Section 1: slider race ---------- */
  (() => {
    const sl = document.getElementById('p21slN'), out = document.getElementById('p21slO'); if (!sl) return;
    const upd = () => {
      const n = Number(sl.value);
      if (out) out.textContent = n;
      setVal('p21roS1', bin(n, 8)); setVal('p21roS2', dropCount(n)); setVal('p21roS3', SCAN_STEPS);
    };
    sl.addEventListener('input', upd); upd();
  })();

  /* ---------- Section 2: AND / OR / XOR playground ---------- */
  (() => {
    const inA = document.getElementById('p21inA'), inB = document.getElementById('p21inB'), err = document.getElementById('p21err'), el = document.getElementById('p21tpC');
    if (!inA || !el) return;
    const player = TracePlayer(el, null, {});
    let op = '^';
    function num(s, name) {
      const t = s.trim();
      if (!/^\d{1,3}$/.test(t)) throw new Error(`${name} should be a whole number from 0 to 255, like 12.`);
      const v = Number(t); if (v > 255) throw new Error(`${name} = ${v} needs more than 8 switches. Pick 0 to 255.`);
      return v;
    }
    function run() {
      let a, b;
      try { a = num(inA.value, 'a'); b = num(inB.value, 'b'); } catch (e) { err.textContent = e.message; return; }
      err.textContent = '';
      const r = combineFrames(a, b, op);
      player.load({ code: combineCode(op), frames: r.frames });
      setVal('p21roC', `${a} ${op} ${b} = ${r.val}`);
      document.querySelectorAll('[data-p21op]').forEach(x => x.classList.toggle('primary', x.dataset.p21op === op));
    }
    document.querySelectorAll('[data-p21op]').forEach(x => x.addEventListener('click', () => { op = x.dataset.p21op; run(); }));
    [inA, inB].forEach(i => i.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); run(); } }));
    const go = document.getElementById('p21go'); if (go) go.addEventListener('click', run);
    run();
  })();

  /* ---------- Section 4: XOR fold vs counting dict, and the add loop ---------- */
  (() => {
    const nums = [2, 7, 4, 7, 2];
    const x = xorFrames(nums), m = mapFrames(nums);
    play('p21tpD', { code: XOR_CODE, frames: x.frames });
    play('p21tpE', { code: MAP_CODE, frames: m.frames });
    setVal('p21roD', x.steps); setVal('p21roE', m.ops); setVal('p21roF', m.size);
    const ad = addFrames(5, 7);
    play('p21tpF', { code: ADD_CODE, frames: ad.frames });
  })();

  /* ---------- Sandbox ---------- */
  (() => {
    const inN = document.getElementById('s21N'), inL = document.getElementById('s21L'), err = document.getElementById('s21Err'), out = document.getElementById('s21Out'), el = document.getElementById('s21Tp');
    if (!inN || !el) return;
    const player = TracePlayer(el, null, {});
    function runN() {
      const t = inN.value.trim();
      if (!/^-?\d{1,15}$/.test(t)) { err.textContent = 'n should be one whole number, like 44 or -1. No commas or spaces inside it.'; return; }
      const n = Number(t);
      if (n < -2147483648 || n > 4294967295) { err.textContent = `${n} does not fit in 32 bits. Use -2147483648 to 4294967295.`; return; }
      err.textContent = '';
      const u = n >>> 0;
      const note = n < 0 ? `${n} is negative. In Python it has endless 1s on the left, so we first take n & 0xFFFFFFFF = ${u}: its 32-bit pattern.` : undefined;
      const d = dropFrames(u, note);
      player.load({ code: DROP_CODE, frames: d.frames });
      out.innerHTML = `<span class="rk">n as 32 bits:</span> <span class="rv">${u}</span><br>` +
        `<span class="rk">ones:</span> <span class="rv">${d.count}</span><br>` +
        `<span class="rk">n &amp;= n - 1 steps:</span> <span class="rv">${d.steps}</span><br>` +
        `<span class="rk">check all 32 bits:</span> <span class="rv-o">${SCAN_STEPS}</span> <span class="rk">steps</span>`;
    }
    function runL() {
      const parts = inL.value.split(',').map(s => s.trim());
      if (parts.length && parts[parts.length - 1] === '') parts.pop();
      if (!parts.length) { err.textContent = 'Type at least one number, for example: 2, 7, 4, 7, 2'; return; }
      if (parts.length > 25) { err.textContent = `That is ${parts.length} numbers. Please use 25 or fewer so the trace stays readable.`; return; }
      const nums = [];
      for (let k = 0; k < parts.length; k++) {
        if (!/^\d{1,5}$/.test(parts[k]) || Number(parts[k]) > 65535) { err.textContent = `Item ${k + 1} ("${parts[k] || 'empty'}") should be a whole number from 0 to 65535.`; return; }
        nums.push(Number(parts[k]));
      }
      err.textContent = '';
      const x = xorFrames(nums), m = mapCount(nums);
      player.load({ code: XOR_CODE, frames: x.frames });
      const same = m.ans === x.ans;
      out.innerHTML = `<span class="rk">xor of all:</span> <span class="rv">${x.ans}</span> <span class="rk">in</span> <span class="rv">${x.steps}</span> <span class="rk">step${x.steps === 1 ? '' : 's'}, 1 number of memory</span><br>` +
        `<span class="rk">counting dict:</span> <span class="rv-o">${m.ans === null ? 'None' : m.ans}</span> <span class="rk">in</span> <span class="rv-o">${m.ops}</span> <span class="rk">ops,</span> <span class="rv-o">${m.size}</span> <span class="rk">key${m.size === 1 ? '' : 's'} stored</span><br>` +
        (same ? '<span class="rk">They agree.</span>' : '<span class="rk">They disagree: the list is not "pairs plus one single", so XOR only gives the XOR of the leftovers.</span>');
    }
    document.querySelectorAll('[data-s21n]').forEach(b => b.addEventListener('click', () => { inN.value = b.dataset.s21n; runN(); }));
    document.querySelectorAll('[data-s21l]').forEach(b => b.addEventListener('click', () => { inL.value = b.dataset.s21l; runL(); }));
    document.getElementById('s21RunN').addEventListener('click', runN);
    document.getElementById('s21RunL').addEventListener('click', runL);
    inN.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); runN(); } });
    inL.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); runL(); } });
    runN();
  })();
})();
