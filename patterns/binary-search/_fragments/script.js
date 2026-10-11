// ======== SLOT 9: PATTERN LESSON, BINARY SEARCH ========
(() => {
  const A_CODE = `def search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`;
  const LIN_CODE = `def linear(nums, target):
    for i in range(len(nums)):
        if nums[i] == target:
            return i
    return -1`;
  const LB_CODE = `def lower_bound(nums, target):
    lo, hi = 0, len(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] >= target:
            hi = mid
        else:
            lo = mid + 1
    return lo`;
  const SP_CODE = `def min_speed(piles, h):
    def feasible(k):
        hours = sum((p + k - 1) // k for p in piles)
        return hours <= h

    lo, hi = 1, max(piles)
    while lo < hi:
        mid = (lo + hi) // 2
        if feasible(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo`;
  const ROT_CODE = `def find_min_index(nums):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] <= nums[-1]:
            hi = mid
        else:
            lo = mid + 1
    return lo`;
  const CAP = 60;
  const range = n => Array.from({ length: n }, (_, k) => k);
  const outside = (n, lo, hi) => range(n).filter(k => k < lo || k > hi);
  const hoursNeeded = (piles, k) => piles.reduce((s, p) => s + Math.floor((p + k - 1) / k), 0);

  // Counters with the same rules as measure.py. `at(i)` reads index i, so huge sorted lists need no memory.
  function searchCount(n, at, target) {
    let lo = 0, hi = n - 1, probes = 0;
    while (lo <= hi) { probes++; const mid = Math.floor((lo + hi) / 2), v = at(mid); if (v === target) return { idx: mid, probes }; if (v < target) lo = mid + 1; else hi = mid - 1; }
    return { idx: -1, probes };
  }
  function linearCount(n, at, target) { let checks = 0; for (let i = 0; i < n; i++) { checks++; if (at(i) === target) return { idx: i, checks }; } return { idx: -1, checks }; }
  function gameGuesses(secret) { let lo = 1, hi = 100, g = 0; for (;;) { g++; const mid = Math.floor((lo + hi) / 2); if (mid === secret) return g; if (mid < secret) lo = mid + 1; else hi = mid - 1; } }

  // Template A trace.
  function aFrames(nums, target) {
    const L = s => lineOf(A_CODE, s), frames = [], n = nums.length;
    let lo = 0, hi = n - 1, probes = 0;
    const views = (ptr, hl, extra) => [
      { type: 'array', name: 'nums (sorted)', values: nums, pointers: ptr, hl: hl || [], dim: outside(n, lo, hi), bad: (extra && extra.bad) || [] },
      { type: 'vars', values: Object.assign({ target, lo, hi, probes }, extra && extra.v) }
    ];
    frames.push({ line: L('lo, hi = 0, len(nums) - 1'), note: `The answer, if it exists, is somewhere in nums[${lo}..${hi}]. Nothing has been thrown away yet.`, views: views({ lo, hi }) });
    while (lo <= hi) {
      probes++;
      const mid = Math.floor((lo + hi) / 2), v = nums[mid];
      frames.push({ line: L('mid = (lo + hi) // 2'), note: `Probe ${probes}: look at the middle, index ${mid}, value ${v}.`, views: views({ lo, mid, hi }, [mid], { v: { mid } }) });
      if (v === target) {
        frames.push({ line: L('return mid'), note: `${v} is the target. Found at index ${mid} after ${probes} probes.`, result: mid, views: views({ mid }, [mid], { v: { mid } }) });
        return { idx: mid, probes, frames };
      }
      if (v < target) { const was = lo; lo = mid + 1; frames.push({ line: L('lo = mid + 1'), note: `${v} &lt; ${target}, so the target cannot be at index ${mid} or to its left. Throw away ${was}..${mid}: lo = ${lo}.`, views: views({ lo, hi }, [], { v: { mid } }) }); }
      else { const was = hi; hi = mid - 1; frames.push({ line: L('hi = mid - 1'), note: `${v} &gt; ${target}, so the target cannot be at index ${mid} or to its right. Throw away ${mid}..${was}: hi = ${hi}.`, views: views({ lo, hi }, [], { v: { mid } }) }); }
    }
    frames.push({ line: L('return -1'), note: n ? `lo = ${lo} passed hi = ${hi}: the range is empty, so ${target} is not in the list. ${probes} probes.` : 'The list is empty: the loop never runs.', result: -1, views: views({}) });
    return { idx: -1, probes, frames };
  }

  // Linear scan trace (section 1, no code).
  function linFrames(nums, target) {
    const L = s => lineOf(LIN_CODE, s), frames = [];
    let checks = 0, cut = 0;
    for (let i = 0; i < nums.length; i++) {
      checks++;
      const hit = nums[i] === target;
      const f = { line: L('if nums[i] == target'), note: `Check ${checks}: is nums[${i}] = ${nums[i]} the target ${target}? ${hit ? 'Yes!' : 'No, next one.'}`, views: [{ type: 'array', name: 'nums (sorted)', values: nums, pointers: { i }, hl: [i], dim: range(i) }, { type: 'vars', values: { target, checks } }] };
      if (frames.length < CAP) frames.push(f); else cut++;
      if (hit) { frames.push({ line: L('return i'), note: `Found at index ${i} after ${checks} checks.`, result: i, views: [{ type: 'array', name: 'nums (sorted)', values: nums, pointers: { i }, hl: [i], dim: range(i) }, { type: 'vars', values: { target, checks } }] }); return { idx: i, checks, frames }; }
    }
    if (cut) frames.push({ line: L('if nums[i] == target'), note: `... ${cut} more checks, same rule.`, views: [{ type: 'array', name: 'nums (sorted)', values: nums }, { type: 'vars', values: { target, checks } }] });
    frames.push({ line: L('return -1'), note: `Checked all ${checks} items: not there.`, result: -1, views: [{ type: 'array', name: 'nums (sorted)', values: nums, dim: range(nums.length) }, { type: 'vars', values: { target, checks } }] });
    return { idx: -1, checks, frames };
  }

  // Generic "first true" trace: ok(i) gives the yes/no strip. Used for lower bound, rotated minimum and speeds.
  function firstTrueFrames(code, opts) {
    const L = s => lineOf(code, s), frames = [];
    const { values, name, okName, ok, hiStart, labelOk, lo0 = 0, offset = 0, extraVars = () => ({}) } = opts;
    let lo = lo0, hi = hiStart, probes = 0;
    const n = values.length, seen = {};
    const okRow = () => values.map((_, k) => (k + offset) in seen ? seen[k + offset] : '?');
    const views = (ptr, hl, v) => [
      { type: 'array', name, values, pointers: ptr, hl: hl || [], dim: outside(n, lo - offset, hi - offset) },
      { type: 'array', name: okName, values: okRow(), hl: hl || [] },
      { type: 'vars', values: Object.assign({ lo, hi, probes }, v || {}) }
    ];
    frames.push({ line: L(opts.startLine), note: opts.startNote(lo, hi), views: views({ lo: lo - offset, hi: hi - offset }) });
    while (lo < hi) {
      probes++;
      const mid = Math.floor((lo + hi) / 2), r = ok(mid);
      seen[mid] = r;
      const ev = extraVars(mid);
      frames.push({ line: L(opts.testLine), note: `Probe ${probes}: mid = ${mid}. ${labelOk(mid, r)}`, views: views({ lo: lo - offset, mid: mid - offset, hi: hi - offset }, [mid - offset], Object.assign({ mid }, ev)) });
      if (r) { hi = mid; frames.push({ line: L('hi = mid'), note: `True: mid might be the first true one, so keep it. hi = ${hi}.`, views: views({ lo: lo - offset, hi: hi - offset }, [], ev) }); }
      else { lo = mid + 1; frames.push({ line: L('lo = mid + 1'), note: `False: the first true one is to the right of ${mid}. lo = ${lo}.`, views: views({ lo: lo - offset, hi: hi - offset }, [], ev) }); }
    }
    frames.push({ line: L('return lo'), note: opts.endNote(lo, probes), result: lo, views: views({ lo: lo - offset }, [lo - offset]) });
    return { ans: lo, probes, frames };
  }
  const lbFrames = (nums, target) => firstTrueFrames(LB_CODE, {
    values: nums, name: 'nums (sorted)', okName: `nums[i] >= ${target}?`, ok: i => nums[i] >= target, hiStart: nums.length,
    startLine: 'lo, hi = 0, len(nums)', testLine: 'if nums[mid] >= target',
    startNote: (lo, hi) => `Answer range is lo..hi = ${lo}..${hi}. hi = ${hi} is one past the end: it means "no item is big enough".`,
    labelOk: (m, r) => `Is nums[${m}] = ${nums[m]} &gt;= ${target}? ${r ? 'True' : 'False'}.`,
    endNote: (lo, p) => `lo = hi = ${lo}: the first index whose value is at least ${target}${lo === nums.length ? ' (none, so the length)' : ''}. ${p} probes.`
  });
  const rotFrames = nums => firstTrueFrames(ROT_CODE, {
    values: nums, name: 'nums (sorted, then rotated)', okName: `nums[i] <= ${nums[nums.length - 1]}?`, ok: i => nums[i] <= nums[nums.length - 1], hiStart: nums.length - 1,
    startLine: 'lo, hi = 0, len(nums) - 1', testLine: 'if nums[mid] <= nums[-1]',
    startNote: () => `Items of the right-hand piece are all &lt;= the last item (${nums[nums.length - 1]}); items of the left-hand piece are all bigger. Find the first True.`,
    labelOk: (m, r) => `Is nums[${m}] = ${nums[m]} &lt;= ${nums[nums.length - 1]}? ${r ? 'True: mid is in the right-hand piece.' : 'False: mid is in the left-hand piece.'}`,
    endNote: (lo, p) => `The smallest item is nums[${lo}] = ${nums[lo]}. ${p} probes.`
  });
  const spFrames = (piles, h) => {
    const mx = Math.max(...piles), speeds = range(mx).map(k => k + 1);
    return firstTrueFrames(SP_CODE, {
      values: speeds, name: 'speed k (letters per hour)', okName: 'feasible(k)?', ok: k => hoursNeeded(piles, k) <= h, hiStart: mx, lo0: 1, offset: 1,
      extraVars: k => ({ hours: hoursNeeded(piles, k), h }),
      startLine: 'lo, hi = 1, max(piles)', testLine: 'if feasible(mid)',
      startNote: (lo, hi) => `Speeds ${lo}..${hi} are possible answers. Speed ${hi} always works: every box takes one hour.`,
      labelOk: (k, r) => `At speed ${k} the boxes take ${hoursNeeded(piles, k)} hours; the limit is ${h}. ${r ? 'Feasible.' : 'Too slow.'}`,
      endNote: (lo, p) => `The slowest speed that still finishes in ${h} hours is ${lo}. feasible() ran ${p} times.`
    });
  };

  const setVal = (id, v) => { const el = document.getElementById(id); if (!el) return; el.querySelector('.val').textContent = v; flash(el); };
  const num = v => Math.round(v).toLocaleString('en-US');
  const PIC = [3, 8, 12, 17, 21, 26, 30, 34, 39, 45, 51, 58];

  /* ---------- Section 1a: the guessing game ---------- */
  (() => {
    const cv = document.getElementById('p9cvG'), inp = document.getElementById('p9gIn'), msg = document.getElementById('p9gMsg');
    if (!cv || !inp) return;
    const active = () => document.getElementById('lesson9').classList.contains('active');
    let secret, lo, hi, guesses, won, marks;
    function fresh() { secret = 1 + Math.floor(Math.random() * 100); lo = 1; hi = 100; guesses = 0; won = false; marks = []; msg.textContent = 'I picked a whole number from 1 to 100. Your guess?'; show(); draw(); }
    function show() { setVal('p9roG', guesses); setVal('p9roL', won ? '-' : `${lo} to ${hi}`); setVal('p9roK', won ? '0' : String(hi - lo + 1)); }
    function draw() {
      if (!cv.clientWidth) return;
      const { ctx: c, w, h } = fit(cv, Math.max(0.16, 90 / cv.clientWidth));
      c.clearRect(0, 0, w, h);
      const pad = 14, cw = (w - 2 * pad) / 100, y = h * 0.38, bh = 18;
      for (let v = 1; v <= 100; v++) {
        const live = v >= lo && v <= hi && !won;
        c.fillStyle = won && v === secret ? css('--teal') : live ? css('--blue') : css('--border');
        c.globalAlpha = live || (won && v === secret) ? 0.85 : 0.35;
        c.fillRect(pad + (v - 1) * cw + 0.5, y, Math.max(1, cw - 1), bh);
      }
      c.globalAlpha = 1;
      marks.forEach(([g, r]) => { const x = pad + (g - 0.5) * cw; c.fillStyle = r === 0 ? css('--teal') : css('--orange'); c.fillRect(x - 1, y - 8, 2, bh + 16); });
      [1, 25, 50, 75, 100].forEach(v => text(c, String(v), pad + (v - 0.5) * cw, y + bh + 16, css('--text-dim'), 10, 'center', 500));
      text(c, won ? `found ${secret}` : `still possible: ${lo}..${hi}`, pad, y - 16, css('--text-bright'), 11, 'left', 600);
    }
    function guess() {
      if (won) { msg.textContent = 'You already found it. Press "New secret" to play again.'; return; }
      const t = inp.value.trim();
      if (!/^\d{1,3}$/.test(t) || +t < 1 || +t > 100) { msg.textContent = `"${t || 'empty'}" is not a whole number from 1 to 100.`; return; }
      const g = +t; guesses++;
      const wasted = g < lo || g > hi;
      if (g === secret) {
        won = true; marks.push([g, 0]);
        const opt = gameGuesses(secret);
        msg.textContent = `Yes, ${secret}! You took ${guesses} guess${guesses > 1 ? 'es' : ''}. Always guessing the middle of what is left takes ${opt} for this number, and never more than 7.`;
      } else if (g < secret) {
        lo = Math.max(lo, g + 1); marks.push([g, 1]);
        msg.textContent = `Higher than ${g}.` + (wasted ? ' (You already knew that: the guess was outside the live range.)' : ` Now ${hi - lo + 1} numbers are left. The middle is ${Math.floor((lo + hi) / 2)}.`);
      } else {
        hi = Math.min(hi, g - 1); marks.push([g, -1]);
        msg.textContent = `Lower than ${g}.` + (wasted ? ' (You already knew that: the guess was outside the live range.)' : ` Now ${hi - lo + 1} numbers are left. The middle is ${Math.floor((lo + hi) / 2)}.`);
      }
      show(); draw();
    }
    document.getElementById('p9gGo').addEventListener('click', guess);
    document.getElementById('p9gNew').addEventListener('click', fresh);
    document.getElementById('p9gMid').addEventListener('click', () => { if (!won) { inp.value = String(Math.floor((lo + hi) / 2)); guess(); } });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); guess(); } });
    window.addEventListener('resize', () => { if (active()) draw(); });
    window.addEventListener('themechange', () => { if (active()) draw(); });
    fresh();
  })();

  /* ---------- Section 1b: two players ---------- */
  (() => {
    const a = aFrames(PIC, 58), b = linFrames(PIC, 58);
    const elA = document.getElementById('p9tpA'), elB = document.getElementById('p9tpB');
    if (elA) TracePlayer(elA, { frames: a.frames }, { code: false });
    if (elB) TracePlayer(elB, { frames: b.frames }, { code: false });
    setVal('p9roA', a.probes); setVal('p9roB', b.checks);
  })();

  /* ---------- Section 1c: race ---------- */
  (() => {
    const cv = document.getElementById('p9cvA'); if (!cv) return;
    const active = () => document.getElementById('lesson9').classList.contains('active');
    let n = 16, lin = 16, bin = 5, prog = 1, raf = 0;
    const at = i => 2 * i;
    const measure = () => { lin = linearCount(n, at, 2 * n + 1).checks; bin = searchCount(n, at, 2 * n + 1).probes; };
    function draw() {
      if (!cv.clientWidth) return;
      const { ctx: c, w, h } = fit(cv, Math.max(0.26, 150 / cv.clientWidth));
      c.clearRect(0, 0, w, h);
      const pad = 12, track = w - 2 * pad, done = prog * lin;
      [{ label: 'binary search, O(log n)', total: bin, unit: 'probes', col: css('--teal'), y: h * 0.3 }, { label: 'linear scan, O(n)', total: lin, unit: 'checks', col: css('--orange'), y: h * 0.74 }].forEach(Ln => {
        const got = Math.min(Ln.total, done), fin = got >= Ln.total;
        text(c, Ln.label, pad, Ln.y - 16, css('--text-bright'), 12, 'left', 600);
        text(c, `${num(got)} ${Ln.unit}${fin ? ', done' : ''}`, w - pad, Ln.y - 16, Ln.col, 12, 'right', 700);
        c.fillStyle = css('--bg-input'); c.fillRect(pad, Ln.y, track, 12);
        c.fillStyle = Ln.col; c.fillRect(pad, Ln.y, Math.max(2, track * got / lin), 12);
      });
    }
    function show() { setVal('p9roN', num(n)); setVal('p9roS', num(bin)); setVal('p9roP', num(lin)); setVal('p9roR', (lin / bin).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + 'x'); }
    function race() {
      cancelAnimationFrame(raf);
      if (RM) { prog = 1; draw(); return; }
      const t0 = performance.now(), dur = 2500;
      const tick = t => { prog = Math.min(1, (t - t0) / dur); draw(); if (prog < 1 && active()) raf = requestAnimationFrame(tick); else { prog = 1; draw(); } };
      prog = 0; raf = requestAnimationFrame(tick);
    }
    const mark = () => document.querySelectorAll('[data-p9n]').forEach(b => b.classList.toggle('primary', Number(b.dataset.p9n) === n));
    document.querySelectorAll('[data-p9n]').forEach(btn => btn.addEventListener('click', () => { cancelAnimationFrame(raf); n = Number(btn.dataset.p9n); measure(); prog = 1; mark(); show(); draw(); }));
    document.getElementById('p9raceGo').addEventListener('click', race);
    window.addEventListener('resize', () => { if (active()) draw(); });
    window.addEventListener('themechange', () => { if (active()) draw(); });
    measure(); mark(); show(); draw();
  })();

  /* ---------- Templates: players ---------- */
  (() => {
    const el = document.getElementById('p9tpTa');
    if (el) {
      const p = TracePlayer(el, { code: A_CODE, frames: aFrames(PIC, 40).frames });
      document.querySelectorAll('[data-p9ta]').forEach(b => b.addEventListener('click', () => p.load({ code: A_CODE, frames: aFrames(PIC, Number(b.dataset.p9ta)).frames })));
    }
    const lb = document.getElementById('p9tpTb'), LBN = [1, 3, 3, 3, 5, 8, 9];
    if (lb) {
      const p = TracePlayer(lb, { code: LB_CODE, frames: lbFrames(LBN, 3).frames });
      document.querySelectorAll('[data-p9tb]').forEach(b => b.addEventListener('click', () => p.load({ code: LB_CODE, frames: lbFrames(LBN, Number(b.dataset.p9tb)).frames })));
    }
    const sp = document.getElementById('p9tpTc');
    if (sp) TracePlayer(sp, { code: SP_CODE, frames: spFrames([4, 9, 5, 12], 7).frames });
    const rt = document.getElementById('p9tpTd');
    if (rt) TracePlayer(rt, { code: ROT_CODE, frames: rotFrames([6, 7, 9, 1, 2, 4, 5]).frames });
  })();

  /* ---------- Template C: feel the yes/no line with a slider ---------- */
  (() => {
    const sl = document.getElementById('p9kSl'), strip = document.getElementById('p9kStrip'); if (!sl || !strip) return;
    const piles = [4, 9, 5, 12], h = 7;
    strip.innerHTML = range(12).map(k => { const ok = hoursNeeded(piles, k + 1) <= h; return `<span class="tp-chip" data-k="${k + 1}" style="${ok ? 'border-color:var(--teal)' : ''}">${k + 1}: ${ok ? 'yes' : 'no'}</span>`; }).join('');
    function upd() {
      const k = Number(sl.value), hrs = hoursNeeded(piles, k), ok = hrs <= h;
      document.getElementById('p9kOut').textContent = k;
      setVal('p9roKh', hrs); setVal('p9roKf', ok ? 'yes' : 'no');
      document.getElementById('p9kWhy').textContent = piles.map(p => `ceil(${p} / ${k}) = ${Math.floor((p + k - 1) / k)}`).join(', ') + ` -> ${hrs} hours`;
      strip.querySelectorAll('.tp-chip').forEach(c => c.classList.toggle('is-hl', Number(c.dataset.k) === k));
    }
    sl.addEventListener('input', upd); upd();
  })();

  /* ---------- Sandbox ---------- */
  (() => {
    const in1 = document.getElementById('s9In'), in2 = document.getElementById('s9In2'), lab1 = document.getElementById('s9Lab'), lab2 = document.getElementById('s9Lab2');
    const err = document.getElementById('s9Err'), out = document.getElementById('s9Out'), tpEl = document.getElementById('s9Tp'), exs = document.getElementById('s9Ex');
    if (!in1 || !tpEl) return;
    const player = TracePlayer(tpEl, null, {});
    const P = PIC.join(', ');
    const MODES = {
      exact: { l1: 'nums (sorted, up to 40 whole numbers)', l2: 'target', ex: [['Hit at the end', P, '58'], ['Not there', P, '40'], ['First item', P, '3'], ['One item', '5', '5'], ['Empty list', '', '4']] },
      lower: { l1: 'nums (sorted, duplicates allowed, up to 40)', l2: 'target', ex: [['Run of 3s', '1, 3, 3, 3, 5, 8, 9', '3'], ['Between values', '1, 3, 3, 3, 5, 8, 9', '4'], ['Bigger than all', '1, 3, 3, 3, 5, 8, 9', '10'], ['All the same', '2, 2, 2, 2', '2']] },
      speed: { l1: 'box sizes (whole numbers 1 to 40, up to 12 boxes)', l2: 'hours allowed h', ex: [['Lesson example', '4, 9, 5, 12', '7'], ['Tight: h = boxes', '4, 9, 5, 12', '4'], ['Five boxes', '30, 11, 23, 4, 20', '6'], ['Tiny boxes', '1, 1', '5']] }
    };
    let mode = 'exact';
    function parseList(s, max, allowEmpty) {
      const parts = s.split(',').map(t => t.trim());
      if (parts.length && parts[parts.length - 1] === '') parts.pop();
      if (!parts.length) { if (allowEmpty) return []; throw new Error('Type at least one number, for example: 4, 9, 5'); }
      if (parts.length > max) throw new Error(`That is ${parts.length} numbers. Please use ${max} or fewer so the trace stays readable.`);
      return parts.map((t, k) => { if (!/^-?\d{1,6}$/.test(t)) throw new Error(`Item ${k + 1} ("${t || 'empty'}") is not a whole number. Use digits and commas, like 1, 4, 9.`); return Number(t); });
    }
    function parseOne(s, what) { const t = s.trim(); if (!/^-?\d{1,6}$/.test(t)) throw new Error(`The ${what} "${t || 'empty'}" is not a whole number.`); return Number(t); }
    function needSorted(nums) { for (let k = 1; k < nums.length; k++) if (nums[k] < nums[k - 1]) throw new Error(`The list must be sorted from small to large: ${nums[k - 1]} comes before ${nums[k]} (items ${k} and ${k + 1}). Binary search only works on sorted data.`); }
    function run() {
      try {
        if (mode === 'exact') {
          const nums = parseList(in1.value, 40, true); needSorted(nums); const t = parseOne(in2.value, 'target');
          const r = aFrames(nums, t), l = linearCount(nums.length, i => nums[i], t);
          player.load({ code: A_CODE, frames: r.frames });
          out.innerHTML = `<span class="rk">index:</span> <span class="rv">${r.idx}</span><br><span class="rk">binary search:</span> <span class="rv">${r.probes}</span> <span class="rk">probes</span><br><span class="rk">linear scan:</span> <span class="rv-o">${l.checks}</span> <span class="rk">checks</span>`;
        } else if (mode === 'lower') {
          const nums = parseList(in1.value, 40, true); needSorted(nums); const t = parseOne(in2.value, 'target');
          const r = lbFrames(nums, t);
          player.load({ code: LB_CODE, frames: r.frames });
          out.innerHTML = `<span class="rk">first index with value &gt;= ${t}:</span> <span class="rv">${r.ans}</span>${r.ans === nums.length ? ' <span class="rk">(none, so the length)</span>' : ''}<br><span class="rk">probes:</span> <span class="rv">${r.probes}</span>`;
        } else {
          const piles = parseList(in1.value, 12, false);
          piles.forEach((p, k) => { if (p < 1 || p > 40) throw new Error(`Box ${k + 1} has size ${p}. Use sizes from 1 to 40.`); });
          const h = parseOne(in2.value, 'hours');
          if (h < piles.length) throw new Error(`h = ${h} is impossible: each box takes at least one hour, so h must be at least ${piles.length}.`);
          if (h > 1000) throw new Error('Please keep h at 1000 or less.');
          const r = spFrames(piles, h);
          let tries = 0; for (let k = 1; ; k++) { tries++; if (hoursNeeded(piles, k) <= h) break; }
          player.load({ code: SP_CODE, frames: r.frames });
          out.innerHTML = `<span class="rk">slowest speed that works:</span> <span class="rv">${r.ans}</span><br><span class="rk">feasible() calls, binary:</span> <span class="rv">${r.probes}</span><br><span class="rk">trying k = 1, 2, 3, ... instead:</span> <span class="rv-o">${tries}</span> <span class="rk">calls</span>`;
        }
        err.textContent = '';
      } catch (e) { err.textContent = e.message; }
    }
    function setMode(m) {
      mode = m; lab1.textContent = MODES[m].l1; lab2.textContent = MODES[m].l2;
      in1.value = MODES[m].ex[0][1]; in2.value = MODES[m].ex[0][2];
      document.querySelectorAll('[data-s9mode]').forEach(b => b.classList.toggle('btn-primary', b.dataset.s9mode === m));
      exs.innerHTML = MODES[m].ex.map(([t, a, b]) => `<button class="btn btn-sm" type="button" data-s9a="${a}" data-s9b="${b}">${t}</button>`).join('');
      run();
    }
    exs.addEventListener('click', e => { const b = e.target.closest('[data-s9a]'); if (!b) return; in1.value = b.dataset.s9a; in2.value = b.dataset.s9b; run(); });
    document.querySelectorAll('[data-s9mode]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.s9mode)));
    document.getElementById('s9Run').addEventListener('click', run);
    [in1, in2].forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); run(); } }));
    setMode('exact');
  })();
})();
