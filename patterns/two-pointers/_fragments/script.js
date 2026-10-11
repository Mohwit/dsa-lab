// ======== SLOT 5: PATTERN LESSON, TWO POINTERS ========
(() => {
  const PAIR_CODE = `def pair_sum(nums, target):
    l, r = 0, len(nums) - 1
    while l < r:
        s = nums[l] + nums[r]
        if s == target:
            return [l, r]
        if s < target:
            l += 1
        else:
            r -= 1
    return None`;
  const BRUTE_CODE = `def pair_brute(nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return None`;
  const PAL_CODE = `def is_palindrome(s):
    l, r = 0, len(s) - 1
    while l < r:
        if not s[l].isalnum():
            l += 1
        elif not s[r].isalnum():
            r -= 1
        elif s[l].lower() != s[r].lower():
            return False
        else:
            l += 1
            r -= 1
    return True`;
  const DUP_CODE = `def remove_dups(nums):
    if not nums:
        return 0
    k = 1
    for i in range(1, len(nums)):
        if nums[i] != nums[k - 1]:
            nums[k] = nums[i]
            k += 1
    return k`;
  const THREE_CODE = `def three_sum(nums):
    nums.sort()
    out = []
    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        l, r = i + 1, len(nums) - 1
        while l < r:
            s = nums[i] + nums[l] + nums[r]
            if s < 0:
                l += 1
            elif s > 0:
                r -= 1
            else:
                out.append([nums[i], nums[l], nums[r]])
                l += 1
                r -= 1
                while l < r and nums[l] == nums[l - 1]:
                    l += 1
    return out`;
  const CAP = 60;
  const range = n => Array.from({ length: n }, (_, k) => k);

  // A frame recorder with a cap: after CAP frames it only counts, then adds one "... N more steps" frame.
  function recorder() {
    const frames = []; let skipped = 0, lastSkipped = null;
    return {
      frames,
      push(f) { if (frames.length < CAP) frames.push(f); else { skipped++; lastSkipped = f; } },
      finish(f, rule) {
        if (skipped) frames.push(Object.assign({}, lastSkipped, { note: `... ${skipped} more steps, same rule: ${rule}`, result: undefined }));
        frames.push(f);
        return frames;
      }
    };
  }

  // Counters with the same rules as measure.py.
  function pairCount(nums, t) {
    let l = 0, r = nums.length - 1, checks = 0;
    while (l < r) { const s = nums[l] + nums[r]; checks++; if (s === t) return { ans: [l, r], checks }; if (s < t) l++; else r--; }
    return { ans: null, checks };
  }
  function bruteCount(nums, t) {
    let checks = 0;
    for (let i = 0; i < nums.length; i++) for (let j = i + 1; j < nums.length; j++) { checks++; if (nums[i] + nums[j] === t) return { ans: [i, j], checks }; }
    return { ans: null, checks };
  }

  // The pair grid without its always-empty first column and last row.
  const trimGrid = (name, rows, labels, hl, src) => {
    const m = p => [p[0], p[1] - 1];
    return { type: 'grid', name, rows: rows.slice(0, -1).map(x => x.slice(1)), rowLabels: labels.slice(0, -1), colLabels: labels.slice(1), hl: hl.map(m), src: (src || []).map(m) };
  };

  // Template A trace, with an optional pair grid that shows which pairs each move throws away.
  function pairFrames(nums, t, grid = true, code = true) {
    const n = nums.length, rec = recorder(), L = s => lineOf(PAIR_CODE, s);
    const rows = nums.map((_, r) => nums.map((__, c) => (c > r ? '?' : null)));
    const labels = nums.map(String);
    const gv = (hl, src) => trimGrid('pairs (row l, column r)', rows, labels, hl, src);
    const views = (l, r, vars, hl = [], src = [], extra = {}) => {
      const v = [Object.assign({ type: 'array', name: 'nums (sorted)', values: nums, pointers: l < r ? { l, r } : {}, dim: range(n).filter(k => k < l || k > r) }, extra)];
      if (grid && n > 1) v.push(gv(hl, src));
      v.push({ type: 'vars', values: vars });
      return v;
    };
    let l = 0, r = n - 1, checks = 0;
    rec.push({ line: L('l, r = 0, len(nums) - 1'), note: n > 1 ? `Fingers on both ends. ${n * (n - 1) / 2} pairs are still possible (every "?").` : 'Fewer than two numbers: there is no pair to check.', views: views(l, r, { target: t, checks }) });
    while (l < r) {
      const s = nums[l] + nums[r]; checks++;
      rows[l][r] = s;
      rec.push({ line: L('s = nums[l] + nums[r]'), note: `Check ${checks}: ${nums[l]} + ${nums[r]} = ${s}. The target is ${t}.`, views: views(l, r, { l, r, s, target: t, checks }, [[l, r]], [], { hl: [l, r] }) });
      if (s === t) {
        return { ans: [l, r], checks, frames: rec.finish({ line: L('return [l, r]'), note: `${s} is the target. Found after ${checks} checks.`, result: `[${l}, ${r}]`, views: views(l, r, { l, r, s, target: t, checks }, [[l, r]], [], { hl: [l, r] }) }, 'compare, then drop the useless side.') };
      }
      const src = [];
      if (s < t) {
        for (let c = l + 1; c < r; c++) if (rows[l][c] === '?') { rows[l][c] = 'x'; src.push([l, c]); }
        const was = l; l++;
        rec.push({ line: L('l += 1'), note: `${s} is too small. ${nums[was]} plus the biggest number left is not enough, so ${nums[was]} is useless: its whole row goes${src.length ? ` (${src.length + 1} pairs for one check)` : ''}. Move l right.`, views: views(l, r, { l, r, s, target: t, checks }, [], src) });
      } else {
        for (let q = l + 1; q < r; q++) if (rows[q][r] === '?') { rows[q][r] = 'x'; src.push([q, r]); }
        const was = r; r--;
        rec.push({ line: L('r -= 1'), note: `${s} is too big. ${nums[was]} plus the smallest number left is too much, so ${nums[was]} is useless: its whole column goes${src.length ? ` (${src.length + 1} pairs for one check)` : ''}. Move r left.`, views: views(l, r, { l, r, s, target: t, checks }, [], src) });
      }
    }
    return { ans: null, checks, frames: rec.finish({ line: L('return None'), note: `The pointers met. Every pair was checked or ruled out with ${checks} checks: no pair adds up to ${t}.`, result: 'None', views: views(l, r, { target: t, checks }) }, 'compare, then drop the useless side.') };
  }

  // Brute force trace: every pair in order, one grid cell per check.
  function bruteFrames(nums, t) {
    const n = nums.length, rec = recorder(), L = s => lineOf(BRUTE_CODE, s);
    const rows = nums.map((_, r) => nums.map((__, c) => (c > r ? '?' : null)));
    const labels = nums.map(String);
    const gv = hl => trimGrid('pairs (row i, column j)', rows, labels, hl, []);
    rec.push({ line: L('for i in range(len(nums))'), note: `Every "?" is a pair to try: ${n * (n - 1) / 2} pairs for ${n} numbers.`, views: [{ type: 'array', name: 'nums', values: nums }, gv([]), { type: 'vars', values: { target: t, checks: 0 } }] });
    let checks = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      checks++; const s = nums[i] + nums[j]; rows[i][j] = s;
      rec.push({ line: L('if nums[i] + nums[j] == target'), note: `Check ${checks}: ${nums[i]} + ${nums[j]} = ${s}. ${s === t ? 'That is the target!' : 'Not the target.'}`, views: [{ type: 'array', name: 'nums', values: nums, pointers: { i, j }, hl: [i, j] }, gv([[i, j]]), { type: 'vars', values: { i, j, s, checks } }] });
      if (s === t) return { ans: [i, j], checks, frames: rec.finish({ line: L('return [i, j]'), note: `Found after ${checks} checks, one by one.`, result: `[${i}, ${j}]`, views: [{ type: 'array', name: 'nums', values: nums, pointers: { i, j }, hl: [i, j] }, gv([[i, j]]), { type: 'vars', values: { checks } }] }, 'try the next pair.') };
    }
    return { ans: null, checks, frames: rec.finish({ line: L('return None'), note: `All ${checks} pairs tried, none adds up to ${t}.`, result: 'None', views: [{ type: 'array', name: 'nums', values: nums }, gv([]), { type: 'vars', values: { checks } }] }, 'try the next pair.') };
  }

  // Template B trace: mirror check with skips.
  function palFrames(str) {
    const s = Array.from(str), n = s.length, rec = recorder(), L = q => lineOf(PAL_CODE, q);
    const shown = s.map(ch => (ch === ' ' ? '␣' : ch));
    const alnum = ch => /^[\p{L}\p{N}]$/u.test(ch);
    const arr = (l, r, extra) => Object.assign({ type: 'array', name: 's (␣ is a space)', values: shown, pointers: n ? { l, r } : {}, dim: range(n).filter(k => k < l || k > r) }, extra);
    let l = 0, r = n - 1, comps = 0;
    rec.push({ line: L('l, r = 0, len(s) - 1'), note: 'One finger on the first character, one on the last.', views: [arr(l, r, {}), { type: 'vars', values: { l, r, comparisons: 0 } }] });
    while (l < r) {
      if (!alnum(s[l])) { rec.push({ line: L('l += 1'), note: `"${shown[l]}" is not a letter or digit: skip it on the left.`, views: [arr(l, r, { bad: [l] }), { type: 'vars', values: { l, r, comparisons: comps } }] }); l++; continue; }
      if (!alnum(s[r])) { rec.push({ line: L('r -= 1'), note: `"${shown[r]}" is not a letter or digit: skip it on the right.`, views: [arr(l, r, { bad: [r] }), { type: 'vars', values: { l, r, comparisons: comps } }] }); r--; continue; }
      comps++;
      const a = s[l].toLowerCase(), b = s[r].toLowerCase();
      rec.push({ line: L('elif s[l].lower() != s[r].lower()'), note: `Comparison ${comps}: "${a}" and "${b}". ${a === b ? 'They match.' : 'They differ!'}`, views: [arr(l, r, { hl: [l, r] }), { type: 'vars', values: { l, r, comparisons: comps } }] });
      if (a !== b) return { ans: false, comps, frames: rec.finish({ line: L('return False'), note: `A mirror pair differs, so it is not a palindrome. ${comps} comparisons.`, result: 'False', views: [arr(l, r, { bad: [l, r] }), { type: 'vars', values: { l, r, comparisons: comps } }] }, 'skip or compare, then step in.') };
      l++; r--;
      rec.push({ line: L('r -= 1', 2), note: 'Both step in.', views: [arr(l, r, {}), { type: 'vars', values: { l, r, comparisons: comps } }] });
    }
    return { ans: true, comps, frames: rec.finish({ line: L('return True'), note: `The fingers met and every mirror pair matched: a palindrome. ${comps} comparisons.`, result: 'True', views: [arr(l, r, {}), { type: 'vars', values: { comparisons: comps } }] }, 'skip or compare, then step in.') };
  }

  // Template C trace: reader i, writer k.
  function dupFrames(input) {
    const nums = input.slice(), n = nums.length, rec = recorder(), L = q => lineOf(DUP_CODE, q);
    const arr = (ptr, extra) => Object.assign({ type: 'array', name: 'nums (blue = kept so far)', values: nums.slice(), pointers: ptr }, extra);
    if (!n) return { k: 0, frames: rec.finish({ line: L('return 0'), note: 'Empty list: nothing to keep.', result: 0, views: [arr({}, {})] }, '') };
    let k = 1;
    rec.push({ line: L('k = 1'), note: 'The first item is always kept. The writer k waits at slot 1.', views: [arr({ k }, { win: [0, 0] }), { type: 'vars', values: { k } }] });
    for (let i = 1; i < n; i++) {
      const fresh = nums[i] !== nums[k - 1];
      rec.push({ line: L('if nums[i] != nums[k - 1]'), note: `Reader at ${nums[i]}, last kept value ${nums[k - 1]}. ${fresh ? 'New value!' : 'A repeat: skip it.'}`, views: [arr({ i, k }, { win: [0, k - 1], hl: [i, k - 1] }), { type: 'vars', values: { i, k } }] });
      if (fresh) {
        nums[k] = nums[i]; k++;
        rec.push({ line: L('k += 1'), note: `Write ${nums[k - 1]} into slot ${k - 1} and move the writer to ${k}.`, views: [arr({ i, k }, { win: [0, k - 1] }), { type: 'vars', values: { i, k } }] });
      }
    }
    return { k, nums, frames: rec.finish({ line: L('return k'), note: `Done: the first ${k} slots hold each value once. The rest is leftover.`, result: k, views: [arr({ k }, { win: [0, k - 1], dim: range(n).filter(q => q >= k) }), { type: 'vars', values: { k } }] }, 'keep a new value, skip a repeat.') };
  }

  // Template D trace: fixed i plus inner pair.
  function threeFrames(input) {
    const nums = input.slice().sort((a, b) => a - b), n = nums.length, rec = recorder(), L = q => lineOf(THREE_CODE, q);
    const out = [];
    const views = (ptr, vars, extra = {}) => [Object.assign({ type: 'array', name: 'nums (sorted)', values: nums, pointers: ptr, dim: ptr.i === undefined ? [] : range(n).filter(q => q < ptr.i) }, extra), { type: 'set', name: 'out', values: out.map(t => `[${t.join(', ')}]`), new: extra.fresh }, { type: 'vars', values: vars }];
    let checks = 0;
    rec.push({ line: L('nums.sort()'), note: 'Sort first, so the pair search works and equal values sit together.', views: views({}, { checks }) });
    for (let i = 0; i < n - 2; i++) {
      if (i > 0 && nums[i] === nums[i - 1]) { rec.push({ line: L('continue'), note: `${nums[i]} was already the fixed number: skip it so no triple repeats.`, views: views({ i }, { i, checks }, { bad: [i] }) }); continue; }
      let l = i + 1, r = n - 1;
      rec.push({ line: L('l, r = i + 1, len(nums) - 1'), note: `Fix ${nums[i]}. Now find a pair on its right adding to ${-nums[i]}.`, views: views({ i, l, r }, { i, need: -nums[i], checks }) });
      while (l < r) {
        const s = nums[i] + nums[l] + nums[r]; checks++;
        rec.push({ line: L('s = nums[i] + nums[l] + nums[r]'), note: `Check ${checks}: ${nums[i]} + ${nums[l]} + ${nums[r]} = ${s}. ${s < 0 ? 'Below 0: move l right.' : s > 0 ? 'Above 0: move r left.' : 'Zero: a triple!'}`, views: views({ i, l, r }, { i, s, checks }, { hl: [i, l, r] }) });
        if (s < 0) l++;
        else if (s > 0) r--;
        else {
          const t = [nums[i], nums[l], nums[r]]; out.push(t);
          rec.push({ line: L('out.append'), note: `Record [${t.join(', ')}], then move both pointers.`, views: views({ i, l, r }, { i, s, checks }, { hl: [i, l, r], fresh: `[${t.join(', ')}]` }) });
          l++; r--;
          let skippedAny = false;
          while (l < r && nums[l] === nums[l - 1]) { l++; skippedAny = true; }
          if (skippedAny) rec.push({ line: L('while l < r and nums[l] == nums[l - 1]'), note: `Skip copies of ${nums[l - 1]} on the left so this triple is not found again.`, views: views({ i, l, r }, { i, checks }) });
        }
      }
    }
    return { out, checks, frames: rec.finish({ line: L('return out'), note: `${out.length} triple${out.length === 1 ? '' : 's'} after ${checks} checks.`, result: out.map(t => `[${t.join(', ')}]`).join(', ') || '[]', views: views({}, { checks }) }, 'fix i, then pair search.') };
  }

  const setVal = (id, v) => { const el = document.getElementById(id); if (!el) return; el.querySelector('.val').textContent = v; flash(el); };
  const mount = (id, trace, opts) => { const el = document.getElementById(id); if (el) TracePlayer(el, trace, opts || {}); };

  /* ---------- Section 1: the two players ---------- */
  (() => {
    const pic = [1, 3, 5, 6, 8, 10, 12], t = 14;
    const a = pairFrames(pic, t, true), b = bruteFrames(pic, t);
    mount('p5tpA', { frames: a.frames }, { code: false });
    mount('p5tpB', { frames: b.frames }, { code: false });
    setVal('p5roA', a.checks); setVal('p5roB', b.checks); setVal('p5roC', pic.length * (pic.length - 1) / 2);
  })();

  /* ---------- Section 1: be the pointers ---------- */
  (() => {
    const box = document.getElementById('p5gArr'); if (!box) return;
    const task = document.getElementById('p5gTask'), msg = document.getElementById('p5gMsg');
    const bL = document.getElementById('p5gL'), bR = document.getElementById('p5gR');
    let nums = [], t = 0, ans = [0, 0], l = 0, r = 0, moves = 0, over = false;
    function puzzle() {
      for (let tries = 0; tries < 500; tries++) {
        const pool = range(29).map(k => k + 1);
        for (let k = pool.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [pool[k], pool[j]] = [pool[j], pool[k]]; }
        const a = pool.slice(0, 8).sort((x, y) => x - y);
        const i = 1 + Math.floor(Math.random() * 3), j = 4 + Math.floor(Math.random() * 3), tg = a[i] + a[j];
        let hits = 0; for (let p = 0; p < 8; p++) for (let q = p + 1; q < 8; q++) if (a[p] + a[q] === tg) hits++;
        if (hits === 1) { nums = a; t = tg; ans = [i, j]; return; }
      }
      nums = [2, 5, 7, 9, 12, 15, 18, 21]; t = 21; ans = [2, 4];
    }
    function draw() {
      box.innerHTML = '';
      nums.forEach((x, k) => {
        const c = document.createElement('div');
        const found = over && l === ans[0] && r === ans[1] && (k === l || k === r);
        c.className = 'tp-cell' + (k < l || k > r ? ' is-dim' : '') + ((k === l || k === r) && !over ? ' is-hl' : '') + (found ? ' is-win' : '');
        c.style.minWidth = '30px'; c.style.padding = '0 3px';
        c.innerHTML = `<span class="tp-ix">${k}</span>${x}`;
        box.appendChild(c);
      });
      box.style.paddingBottom = '30px';
      requestAnimationFrame(() => {
        const cells = box.querySelectorAll('.tp-cell');
        [['l', l, '--orange'], ['r', r, '--blue']].forEach(([name, idx, col], k) => {
          const cell = cells[idx]; if (!cell) return;
          const p = document.createElement('span'); p.className = 'tp-ptr'; p.textContent = name; p.style.color = css(col);
          p.style.left = cell.offsetLeft + 'px'; p.style.width = cell.offsetWidth + 'px';
          p.style.top = (cell.offsetTop + cell.offsetHeight + 2 + (l === r ? k * 16 : 0)) + 'px';
          box.appendChild(p);
        });
      });
      const s = nums[l] + nums[r];
      setVal('p5gSum', `${nums[l]} + ${nums[r]} = ${s}`);
      setVal('p5gCmp', s === t ? 'equal' : s < t ? 'too small' : 'too big');
      setVal('p5gMoves', moves);
      bL.disabled = bR.disabled = over;
    }
    function fresh() {
      puzzle(); l = 0; r = nums.length - 1; moves = 0; over = false;
      task.innerHTML = `Find two numbers that add up to <strong>${t}</strong>.`;
      msg.textContent = 'Tip: compare the sum with the target first, then move the finger whose number cannot be part of the answer.';
      setVal('p5gRule', pairCount(nums, t).checks - 1);
      draw();
    }
    function move(side) {
      if (over) return;
      const s = nums[l] + nums[r], ruleSide = s < t ? 'l' : 'r', dropped = side === 'l' ? l : r;
      moves++;
      if (side === 'l') l++; else r--;
      if (dropped === ans[0] || dropped === ans[1]) {
        over = true;
        msg.textContent = `Oops: that move dropped ${nums[dropped]}, which was part of the answer (${nums[ans[0]]} + ${nums[ans[1]]} = ${t}). The sum was ${s === t ? 'already equal' : s < t ? 'too small, so the rule moves l' : 'too big, so the rule moves r'}. Press New puzzle and try again.`;
      } else if (l >= r) {
        over = true; msg.textContent = 'The fingers met without finding the pair. Press New puzzle.';
      } else if (nums[l] + nums[r] === t) {
        over = true;
        msg.textContent = `Found it: ${nums[l]} + ${nums[r]} = ${t} in ${moves} move${moves === 1 ? '' : 's'}. ${side === ruleSide ? 'Every move followed the rule.' : 'You got there, but one move broke the rule and was lucky.'}`;
      } else {
        msg.textContent = side === ruleSide ? `Good move: ${s} was ${s < t ? 'too small, so the left number was useless' : 'too big, so the right number was useless'}.` : `Risky: ${s} was ${s < t ? 'too small; moving r makes the sum even smaller' : 'too big; moving l makes the sum even bigger'}. You got away with it this time.`;
      }
      draw();
    }
    bL.addEventListener('click', () => move('l'));
    bR.addEventListener('click', () => move('r'));
    document.getElementById('p5gNew').addEventListener('click', fresh);
    window.addEventListener('resize', () => { if (box.offsetParent) draw(); });
    fresh();
  })();

  /* ---------- Section 4: template players ---------- */
  mount('p5tpC', { code: PAL_CODE, frames: palFrames('Top spot!').frames });
  mount('p5tpD', { code: DUP_CODE, frames: dupFrames([1, 1, 2, 2, 2, 3, 4, 4]).frames });
  mount('p5tpE', { code: THREE_CODE, frames: threeFrames([-3, -1, -1, 0, 1, 2, 4]).frames });

  /* ---------- Section 7: the check race ---------- */
  (() => {
    const cv = document.getElementById('p5cvA'); if (!cv) return;
    const active = () => document.getElementById('lesson5').classList.contains('active');
    let n = 10, tp = 9, pairs = 45, prog = 1, raf = 0;
    const measure = k => { const nums = range(k); tp = pairCount(nums, -1).checks; pairs = bruteCount(nums, -1).checks; };
    const num = v => Math.round(v).toLocaleString('en-US');
    function draw() {
      if (!cv.clientWidth) return;
      const { ctx: c, w, h } = fit(cv, Math.max(0.26, 150 / cv.clientWidth));
      c.clearRect(0, 0, w, h);
      const pad = 12, track = w - 2 * pad, done = prog * pairs;
      [{ label: 'two pointers, O(n)', total: tp, col: css('--teal'), y: h * 0.3 }, { label: 'every pair, O(n^2)', total: pairs, col: css('--orange'), y: h * 0.74 }].forEach(R => {
        const got = Math.min(R.total, done), fin = got >= R.total;
        text(c, R.label, pad, R.y - 16, css('--text-bright'), 12, 'left', 600);
        text(c, `${num(got)} checks${fin ? ', done' : ''}`, w - pad, R.y - 16, R.col, 12, 'right', 700);
        c.fillStyle = css('--bg-input'); c.fillRect(pad, R.y, track, 12);
        c.fillStyle = R.col; c.fillRect(pad, R.y, Math.max(2, track * got / pairs), 12);
      });
    }
    function show() { setVal('p5roN', n); setVal('p5roS', num(tp)); setVal('p5roP', num(pairs)); setVal('p5roR', (pairs / tp).toFixed(1) + 'x'); }
    function race() {
      cancelAnimationFrame(raf);
      if (RM) { prog = 1; draw(); return; }
      const t0 = performance.now(), dur = 2500;
      const tick = t => { prog = Math.min(1, (t - t0) / dur); draw(); if (prog < 1 && active()) raf = requestAnimationFrame(tick); else { prog = 1; draw(); } };
      prog = 0; raf = requestAnimationFrame(tick);
    }
    document.querySelectorAll('[data-p5n]').forEach(btn => btn.addEventListener('click', () => { cancelAnimationFrame(raf); n = Number(btn.dataset.p5n); measure(n); prog = 1; show(); draw(); }));
    document.getElementById('p5raceGo').addEventListener('click', race);
    window.addEventListener('resize', () => { if (active()) draw(); });
    window.addEventListener('themechange', () => { if (active()) draw(); });
    measure(n); show(); draw();
  })();

  /* ---------- Sandbox: pair search and mirror check ---------- */
  (() => {
    const tpEl = document.getElementById('s5Tp'); if (!tpEl) return;
    const err = document.getElementById('s5Err'), out = document.getElementById('s5Out');
    const inN = document.getElementById('s5Nums'), inT = document.getElementById('s5Tgt'), inS = document.getElementById('s5Text');
    const pairBox = document.getElementById('s5PairBox'), palBox = document.getElementById('s5PalBox');
    const modeBtns = document.querySelectorAll('[data-s5mode]'), sortBtn = document.getElementById('s5Sort');
    const player = TracePlayer(tpEl, null, {});
    let mode = 'pair';
    function setMode(m) {
      mode = m;
      modeBtns.forEach(b => { const on = b.dataset.s5mode === m; b.classList.toggle('btn-primary', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      pairBox.hidden = m !== 'pair'; palBox.hidden = m !== 'pal';
    }
    function parseNums(s) {
      const parts = s.split(',').map(x => x.trim());
      if (parts.length && parts[parts.length - 1] === '') parts.pop();
      if (!parts.length) throw new Error('Type at least two numbers, for example: 1, 4, 6, 9');
      if (parts.length > 12) throw new Error(`That is ${parts.length} numbers. Please use 12 or fewer so the pair grid stays readable.`);
      return parts.map((x, k) => { if (!/^-?\d{1,5}$/.test(x)) throw new Error(`Item ${k + 1} ("${x || 'empty'}") is not a whole number. Use digits and commas, like 1, 4, -2.`); return Number(x); });
    }
    function run() {
      err.textContent = ''; sortBtn.hidden = true;
      if (mode === 'pair') {
        let nums, t;
        try {
          nums = parseNums(inN.value);
          if (!/^\s*-?\d{1,6}\s*$/.test(inT.value)) throw new Error('The target must be one whole number, like 10.');
          t = Number(inT.value.trim());
          const bad = nums.findIndex((x, k) => k > 0 && x < nums[k - 1]);
          if (bad > 0) { sortBtn.hidden = false; throw new Error(`Not sorted: ${nums[bad - 1]} comes before ${nums[bad]}. Two pointers needs sorted input (trap 2). Press "Sort it for me".`); }
        } catch (e) { err.textContent = e.message; out.innerHTML = ''; return; }
        const a = pairFrames(nums, t, nums.length <= 10), b = bruteCount(nums, t);
        player.load({ code: PAIR_CODE, frames: a.frames });
        out.innerHTML = `<span class="rk">answer:</span> <span class="rv">${a.ans ? `[${a.ans.join(', ')}]` : 'None'}</span><br>` +
          `<span class="rk">two pointer checks:</span> <span class="rv">${a.checks}</span><br>` +
          `<span class="rk">brute force checks:</span> <span class="rv-o">${b.checks}</span><br>` +
          `<span class="rk">pairs in the list:</span> <span class="rv">${nums.length * (nums.length - 1) / 2}</span>`;
      } else {
        const s = inS.value;
        if (!s.trim()) { err.textContent = 'Type a word or a sentence, for example: Top spot!'; out.innerHTML = ''; return; }
        if (Array.from(s).length > 40) { err.textContent = `That is ${Array.from(s).length} characters. Please use 40 or fewer so the trace stays readable.`; out.innerHTML = ''; return; }
        const p = palFrames(s);
        player.load({ code: PAL_CODE, frames: p.frames });
        out.innerHTML = `<span class="rk">palindrome:</span> <span class="rv">${p.ans ? 'True' : 'False'}</span><br>` +
          `<span class="rk">comparisons:</span> <span class="rv">${p.comps}</span><br>` +
          `<span class="rk">characters:</span> <span class="rv">${Array.from(s).length}</span>`;
      }
    }
    modeBtns.forEach(b => b.addEventListener('click', () => { setMode(b.dataset.s5mode); run(); }));
    document.querySelectorAll('[data-s5ex]').forEach(btn => btn.addEventListener('click', () => {
      const [nums, t] = btn.dataset.s5ex.split('|'); inN.value = nums; inT.value = t; setMode('pair'); run();
    }));
    document.querySelectorAll('[data-s5pal]').forEach(btn => btn.addEventListener('click', () => { inS.value = btn.dataset.s5pal; setMode('pal'); run(); }));
    sortBtn.addEventListener('click', () => {
      try { inN.value = parseNums(inN.value).sort((a, b) => a - b).join(', '); } catch (e) { err.textContent = e.message; return; }
      run();
    });
    document.getElementById('s5Run').addEventListener('click', run);
    [inN, inT, inS].forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); run(); } }));
    setMode('pair'); run();
  })();
})();
