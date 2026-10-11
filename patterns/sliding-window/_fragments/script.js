// ======== SLOT 6: PATTERN LESSON, SLIDING WINDOW ========
(() => {
  const FIXED_CODE = `def max_sum_k(nums, k):
    total = sum(nums[:k])
    best = total
    for r in range(k, len(nums)):
        total += nums[r] - nums[r - k]
        best = max(best, total)
    return best`;
  const RECOUNT_CODE = `def max_sum_k_brute(nums, k):
    best = None
    for i in range(len(nums) - k + 1):
        total = 0
        for j in range(i, i + k):
            total += nums[j]
        if best is None or total > best:
            best = total
    return best`;
  const UNIQUE_CODE = `def longest_unique(s):
    count = {}
    l = best = 0
    for r, ch in enumerate(s):
        count[ch] = count.get(ch, 0) + 1
        while count[ch] > 1:
            count[s[l]] -= 1
            l += 1
        best = max(best, r - l + 1)
    return best`;
  const KDIST_CODE = `def longest_k_distinct(s, k):
    count = {}
    l = best = 0
    for r, ch in enumerate(s):
        count[ch] = count.get(ch, 0) + 1
        while len(count) > k:
            left = s[l]
            count[left] -= 1
            if count[left] == 0:
                del count[left]
            l += 1
        best = max(best, r - l + 1)
    return best`;
  const SHORT_CODE = `def shortest_at_least(nums, target):
    l, total = 0, 0
    best = float('inf')
    for r, x in enumerate(nums):
        total += x
        while total >= target:
            best = min(best, r - l + 1)
            total -= nums[l]
            l += 1
    return 0 if best == float('inf') else best`;
  const CAP = 60;
  const range = n => Array.from({ length: n }, (_, k) => k);

  // A frame recorder with a cap: after CAP frames it only counts, then adds one "... N more steps" frame.
  function recorder() {
    const frames = []; let skipped = 0, last = null;
    return {
      push(f) { if (frames.length < CAP) frames.push(f); else { skipped++; last = f; } },
      finish(f, rule) {
        if (skipped) frames.push(Object.assign({}, last, { note: `... ${skipped} more steps, same rule: ${rule}`, result: undefined }));
        frames.push(f); return frames;
      }
    };
  }

  // Counters with the same rules as measure.py.
  function slideCount(nums, k) { let total = 0, touches = 0; for (let j = 0; j < k; j++) { total += nums[j]; touches++; } let best = total; for (let r = k; r < nums.length; r++) { total += nums[r] - nums[r - k]; touches += 2; best = Math.max(best, total); } return { best, touches }; }
  function recountCount(nums, k) { let best = null, touches = 0; for (let i = 0; i + k <= nums.length; i++) { let total = 0; for (let j = i; j < i + k; j++) { total += nums[j]; touches++; } if (best === null || total > best) best = total; } return { best, touches }; }
  function kdCount(s, k) { const c = new Map(); let l = 0, best = 0, moves = 0; for (let r = 0; r < s.length; r++) { c.set(s[r], (c.get(s[r]) || 0) + 1); moves++; while (c.size > k) { const x = s[l]; c.set(x, c.get(x) - 1); if (!c.get(x)) c.delete(x); l++; moves++; } best = Math.max(best, r - l + 1); } return { best, moves }; }
  function kdBrute(s, k) { let best = 0, reads = 0; for (let i = 0; i < s.length; i++) { const seen = new Set(); for (let j = i; j < s.length; j++) { reads++; seen.add(s[j]); if (seen.size > k) break; best = Math.max(best, j - i + 1); } } return { best, reads }; }
  function uniqueBest(s) { const c = new Map(); let l = 0, best = 0; for (let r = 0; r < s.length; r++) { c.set(s[r], (c.get(s[r]) || 0) + 1); while (c.get(s[r]) > 1) { c.set(s[l], c.get(s[l]) - 1); l++; } best = Math.max(best, r - l + 1); } return best; }

  // Template A trace: fixed window, one in and one out.
  function fixedFrames(nums, k) {
    const n = nums.length, rec = recorder(), L = q => lineOf(FIXED_CODE, q);
    const arr = (lo, hi, extra) => Object.assign({ type: 'array', name: `nums (blue = window of ${k})`, values: nums, win: [lo, hi] }, extra);
    let total = 0, touches = 0;
    for (let j = 0; j < k; j++) { total += nums[j]; touches++; }
    rec.push({ line: L('total = sum(nums[:k])'), note: `Build the first window once: ${nums.slice(0, k).join(' + ')} = ${total}. That is ${k} touches.`, views: [arr(0, k - 1, {}), { type: 'vars', values: { total, touches } }] });
    let best = total;
    rec.push({ line: L('best = total'), note: `The first window is the best so far: ${best}.`, views: [arr(0, k - 1, {}), { type: 'vars', values: { total, best, touches } }] });
    for (let r = k; r < n; r++) {
      const out = nums[r - k]; total += nums[r] - out; touches += 2;
      rec.push({ line: L('total += nums[r] - nums[r - k]'), note: `Slide: ${nums[r]} comes in, ${out} leaves (red). Total = ${total}. Two touches, not ${k}.`, views: [arr(r - k + 1, r, { hl: [r], bad: [r - k], pointers: { r } }), { type: 'vars', values: { r, total, best, touches } }] });
      if (total > best) { best = total; rec.push({ line: L('best = max(best, total)'), note: `${total} beats the old best: best = ${best}.`, views: [arr(r - k + 1, r, { pointers: { r } }), { type: 'vars', values: { r, total, best, touches } }] }); }
    }
    return { best, touches, frames: rec.finish({ line: L('return best'), note: `Done: best total ${best} with ${touches} touches.`, result: best, views: [arr(-1, -2, {}), { type: 'vars', values: { best, touches } }] }, 'one in, one out.') };
  }

  // Brute force trace: each window summed from scratch.
  function recountFrames(nums, k) {
    const n = nums.length, rec = recorder(), L = q => lineOf(RECOUNT_CODE, q);
    let best = null, touches = 0;
    rec.push({ line: L('best = None'), note: `${n - k + 1} windows of ${k} numbers. Each one will be added up from nothing.`, views: [{ type: 'array', name: 'nums', values: nums }, { type: 'vars', values: { touches } }] });
    for (let i = 0; i + k <= n; i++) {
      let total = 0;
      for (let j = i; j < i + k; j++) {
        total += nums[j]; touches++;
        rec.push({ line: L('total += nums[j]'), note: `Window ${i + 1}: add ${nums[j]}, total ${total}.${j > i && i > 0 && j < i + k - 1 ? ' (This number was already added last window.)' : ''}`, views: [{ type: 'array', name: 'nums (blue = window)', values: nums, win: [i, i + k - 1], hl: [j], pointers: { j } }, { type: 'vars', values: { total, best, touches } }] });
      }
      if (best === null || total > best) { best = total; rec.push({ line: L('best = total'), note: `New best: ${best}.`, views: [{ type: 'array', name: 'nums (blue = window)', values: nums, win: [i, i + k - 1] }, { type: 'vars', values: { total, best, touches } }] }); }
    }
    return { best, touches, frames: rec.finish({ line: L('return best'), note: `Done: best total ${best} with ${touches} touches.`, result: best, views: [{ type: 'array', name: 'nums', values: nums }, { type: 'vars', values: { best, touches } }] }, 'add every number of every window.') };
  }

  const mapView = (name, c, hl, fresh) => ({ type: 'map', name, entries: [...c.entries()], hl, new: fresh });

  // Template B trace: longest with no repeat.
  function uniqueFrames(str) {
    const s = Array.from(str), rec = recorder(), L = q => lineOf(UNIQUE_CODE, q), c = new Map();
    let l = 0, best = 0, moves = 0;
    const arr = (r, extra) => Object.assign({ type: 'array', name: 's (blue = window)', values: s, win: [l, r], pointers: r >= l ? { l, r } : { l } }, extra);
    rec.push({ line: L('l = best = 0'), note: 'Empty window, empty count map.', views: [arr(-1, {}), mapView('count', c), { type: 'vars', values: { best, moves } }] });
    for (let r = 0; r < s.length; r++) {
      const ch = s[r]; c.set(ch, (c.get(ch) || 0) + 1); moves++;
      const rep = c.get(ch) > 1;
      rec.push({ line: L('count[ch] = count.get(ch, 0) + 1'), note: `Expand: "${ch}" enters.${rep ? ` Now there are two "${ch}": invalid.` : ''}`, views: [arr(r, { hl: [r], bad: rep ? range(s.length).filter(q => q >= l && q <= r && s[q] === ch) : [] }), mapView('count', c, ch, ch), { type: 'vars', values: { r, best, moves } }] });
      while (c.get(ch) > 1) {
        const out = s[l]; c.set(out, c.get(out) - 1); l++; moves++;
        rec.push({ line: L('l += 1'), note: `Shrink: "${out}" leaves.${c.get(ch) > 1 ? ' Still a repeat.' : ' Valid again.'}`, views: [arr(r, {}), mapView('count', c, out), { type: 'vars', values: { r, best, moves } }] });
      }
      const len = r - l + 1, grew = len > best; best = Math.max(best, len);
      rec.push({ line: L('best = max(best, r - l + 1)'), note: `Valid window "${s.slice(l, r + 1).join('')}", length ${len}.${grew ? ` New best: ${best}.` : ''}`, views: [arr(r, {}), mapView('count', c), { type: 'vars', values: { r, best, moves } }] });
    }
    return { best, moves, frames: rec.finish({ line: L('return best'), note: `Longest stretch with no repeat: ${best}. ${moves} window moves.`, result: best, views: [{ type: 'array', name: 's', values: s }, mapView('count', c), { type: 'vars', values: { best, moves } }] }, 'expand, shrink while invalid, record.') };
  }

  // Template C trace: at most k different letters.
  function kdFrames(str, k) {
    const s = Array.from(str), rec = recorder(), L = q => lineOf(KDIST_CODE, q), c = new Map();
    let l = 0, best = 0, moves = 0;
    const arr = (r, extra) => Object.assign({ type: 'array', name: 's (blue = window)', values: s, win: [l, r], pointers: r >= l ? { l, r } : { l } }, extra);
    rec.push({ line: L('l = best = 0'), note: `Empty window. Rule: at most ${k} different letter${k === 1 ? '' : 's'}.`, views: [arr(-1, {}), mapView('count', c), { type: 'vars', values: { k, best, moves } }] });
    for (let r = 0; r < s.length; r++) {
      const ch = s[r]; c.set(ch, (c.get(ch) || 0) + 1); moves++;
      rec.push({ line: L('count[ch] = count.get(ch, 0) + 1'), note: `Expand: "${ch}" enters. ${c.size} different letter${c.size === 1 ? '' : 's'}${c.size > k ? `, more than ${k}: invalid.` : '.'}`, views: [arr(r, { hl: [r] }), mapView('count', c, ch, ch), { type: 'vars', values: { r, k, best, moves } }] });
      while (c.size > k) {
        const out = s[l]; c.set(out, c.get(out) - 1);
        const gone = c.get(out) === 0; if (gone) c.delete(out);
        l++; moves++;
        rec.push({ line: L(gone ? 'del count[left]' : 'l += 1'), note: `Shrink: "${out}" leaves.${gone ? ` Its count hit 0, so the key is deleted: ${c.size} different now.` : ` Its count drops to ${c.get(out)}; still ${c.size} different.`}`, views: [arr(r, {}), mapView('count', c), { type: 'vars', values: { r, k, best, moves } }] });
      }
      const len = r - l + 1, grew = len > best; best = Math.max(best, len);
      rec.push({ line: L('best = max(best, r - l + 1)'), note: `Valid window "${s.slice(l, r + 1).join('')}", length ${len}.${grew ? ` New best: ${best}.` : ''}`, views: [arr(r, {}), mapView('count', c), { type: 'vars', values: { r, k, best, moves } }] });
    }
    return { best, moves, frames: rec.finish({ line: L('return best'), note: `Longest stretch with at most ${k} different: ${best}. ${moves} window moves.`, result: best, views: [{ type: 'array', name: 's', values: s }, mapView('count', c), { type: 'vars', values: { best, moves } }] }, 'expand, shrink while too many different, record.') };
  }

  // Template D trace: shortest window that reaches the target.
  function shortFrames(nums, target) {
    const rec = recorder(), L = q => lineOf(SHORT_CODE, q);
    let l = 0, total = 0, best = Infinity, moves = 0;
    const b = () => (best === Infinity ? 'inf' : best);
    const arr = (r, extra) => Object.assign({ type: 'array', name: 'nums (blue = window)', values: nums, win: [l, r], pointers: r >= l ? { l, r } : { l } }, extra);
    rec.push({ line: L("best = float('inf')"), note: `Goal: the shortest stretch with total at least ${target}. No answer yet.`, views: [arr(-1, {}), { type: 'vars', values: { target, total, best: b(), moves } }] });
    for (let r = 0; r < nums.length; r++) {
      total += nums[r]; moves++;
      rec.push({ line: L('total += x'), note: `Expand: ${nums[r]} enters. Total ${total}${total >= target ? `, reaches ${target}.` : `, below ${target}.`}`, views: [arr(r, { hl: [r] }), { type: 'vars', values: { r, total, best: b(), moves } }] });
      while (total >= target) {
        const len = r - l + 1; best = Math.min(best, len);
        rec.push({ line: L('best = min(best, r - l + 1)'), note: `Good window, length ${len}: record it now (best = ${best}), before shrinking.`, views: [arr(r, {}), { type: 'vars', values: { r, total, best: b(), moves } }] });
        const out = nums[l]; total -= out; l++; moves++;
        rec.push({ line: L('l += 1'), note: `Shrink: ${out} leaves. Total ${total}${total >= target ? ', still good.' : ', no longer enough.'}`, views: [arr(r, {}), { type: 'vars', values: { r, total, best: b(), moves } }] });
      }
    }
    const res = best === Infinity ? 0 : best;
    return { best: res, moves, frames: rec.finish({ line: L('return 0 if'), note: `Shortest good stretch: ${res}. ${moves} window moves.`, result: res, views: [{ type: 'array', name: 'nums', values: nums }, { type: 'vars', values: { best: res, moves } }] }, 'expand, and while good: record, then shrink.') };
  }

  const setVal = (id, v) => { const el = document.getElementById(id); if (!el) return; el.querySelector('.val').textContent = v; flash(el); };
  const mount = (id, trace, opts) => { const el = document.getElementById(id); if (el) TracePlayer(el, trace, opts || {}); };

  /* ---------- Section 1: the two players ---------- */
  (() => {
    const pic = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3], k = 4;
    const a = fixedFrames(pic, k), b = recountFrames(pic, k);
    mount('p6tpA', { frames: a.frames }, { code: false });
    mount('p6tpB', { frames: b.frames }, { code: false });
    setVal('p6roA', a.touches); setVal('p6roB', b.touches); setVal('p6roC', a.best);
  })();

  /* ---------- Section 1: drive a variable window ---------- */
  (() => {
    const box = document.getElementById('p6gArr'); if (!box) return;
    const msg = document.getElementById('p6gMsg');
    const bG = document.getElementById('p6gGrow'), bS = document.getElementById('p6gShrink');
    let s = [], l = 0, r = -1, best = 0, goal = 0, shown = false;
    const repeats = () => { const seen = new Map(), bad = new Set(); for (let q = l; q <= r; q++) { if (seen.has(s[q])) { bad.add(q); bad.add(seen.get(s[q])); } else seen.set(s[q], q); } return bad; };
    function draw() {
      const bad = repeats(), ok = bad.size === 0;
      box.innerHTML = '';
      s.forEach((ch, q) => {
        const c = document.createElement('div');
        c.className = 'tp-cell' + (q >= l && q <= r ? ' is-win' : '') + (bad.has(q) ? ' is-bad' : '') + (q > r ? ' is-dim' : '');
        c.style.minWidth = '30px'; c.style.padding = '0 3px';
        c.innerHTML = `<span class="tp-ix">${q}</span>${ch}`;
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
      setVal('p6gWin', r >= l ? `"${s.slice(l, r + 1).join('')}"` : 'empty');
      setVal('p6gOk', ok ? 'yes' : 'no, a repeat');
      setVal('p6gBest', best);
      setVal('p6gGoal', shown ? goal : '?');
      bG.disabled = r >= s.length - 1; bS.disabled = l > r;
    }
    function fresh() {
      const letters = 'abcde';
      s = range(10).map(() => letters[Math.floor(Math.random() * letters.length)]);
      l = 0; r = -1; best = 0; shown = false; goal = uniqueBest(s);
      msg.textContent = 'Press Grow to let the first letter in.';
      draw();
    }
    bG.addEventListener('click', () => {
      if (r >= s.length - 1) return;
      r++;
      const ok = repeats().size === 0;
      if (ok && r - l + 1 > best) { best = r - l + 1; msg.textContent = `Valid, length ${best}: a new best.`; }
      else if (ok) msg.textContent = `Valid, length ${r - l + 1}. Keep growing.`;
      else msg.textContent = `"${s[r]}" is now in the window twice. Shrink from the left until the red cells are gone.`;
      if (r === s.length - 1 && ok) msg.textContent += ` That is the end of the string.${best === goal ? ' Your best matches the template.' : ''}`;
      draw();
    });
    bS.addEventListener('click', () => {
      if (l > r) return;
      l++;
      const ok = repeats().size === 0;
      if (ok && r - l + 1 > best) best = r - l + 1;
      msg.textContent = ok ? `Valid again, length ${r - l + 1}. Now grow.` : 'Still a repeat. Keep shrinking.';
      draw();
    });
    document.getElementById('p6gReveal').addEventListener('click', () => { shown = true; msg.textContent = `Template B finds ${goal}.${best === goal ? ' You found it too.' : best < goal ? ' Keep driving: a longer valid window is in there.' : ''}`; draw(); });
    document.getElementById('p6gNew').addEventListener('click', fresh);
    window.addEventListener('resize', () => { if (box.offsetParent) draw(); });
    fresh();
  })();

  /* ---------- Section 4: template players ---------- */
  mount('p6tpC', { code: UNIQUE_CODE, frames: uniqueFrames('abcbdab').frames });
  mount('p6tpD', { code: KDIST_CODE, frames: kdFrames('abaccbab', 2).frames });
  mount('p6tpE', { code: SHORT_CODE, frames: shortFrames([2, 1, 5, 1, 3, 2], 8).frames });

  /* ---------- Section 7: the touch race ---------- */
  (() => {
    const cv = document.getElementById('p6cvA'); if (!cv) return;
    const sN = document.getElementById('p6sN'), sK = document.getElementById('p6sK');
    const active = () => document.getElementById('lesson6').classList.contains('active');
    let slide = 0, recount = 0, prog = 1, raf = 0;
    const num = v => Math.round(v).toLocaleString('en-US');
    function measure() {
      const n = Number(sN.value); sK.max = String(n);
      const k = Math.min(Number(sK.value), n); sK.value = String(k);
      document.getElementById('p6oN').textContent = n; document.getElementById('p6oK').textContent = k;
      const nums = range(n); slide = slideCount(nums, k).touches; recount = recountCount(nums, k).touches;
      setVal('p6roS', num(slide)); setVal('p6roP', num(recount)); setVal('p6roR', (recount / slide).toFixed(1) + 'x');
    }
    function draw() {
      if (!cv.clientWidth) return;
      const { ctx: c, w, h } = fit(cv, Math.max(0.26, 150 / cv.clientWidth));
      c.clearRect(0, 0, w, h);
      const pad = 12, track = w - 2 * pad, top = Math.max(slide, recount), done = prog * top;
      [{ label: 'slide, O(n)', total: slide, col: css('--teal'), y: h * 0.3 }, { label: 'recount, O(n x k)', total: recount, col: css('--orange'), y: h * 0.74 }].forEach(R => {
        const got = Math.min(R.total, done), fin = got >= R.total;
        text(c, R.label, pad, R.y - 16, css('--text-bright'), 12, 'left', 600);
        text(c, `${num(got)} touches${fin ? ', done' : ''}`, w - pad, R.y - 16, R.col, 12, 'right', 700);
        c.fillStyle = css('--bg-input'); c.fillRect(pad, R.y, track, 12);
        c.fillStyle = R.col; c.fillRect(pad, R.y, Math.max(2, track * got / top), 12);
      });
    }
    function race() {
      cancelAnimationFrame(raf);
      if (RM) { prog = 1; draw(); return; }
      const t0 = performance.now(), dur = 2500;
      const tick = t => { prog = Math.min(1, (t - t0) / dur); draw(); if (prog < 1 && active()) raf = requestAnimationFrame(tick); else { prog = 1; draw(); } };
      prog = 0; raf = requestAnimationFrame(tick);
    }
    [sN, sK].forEach(el => el.addEventListener('input', () => { cancelAnimationFrame(raf); prog = 1; measure(); draw(); }));
    document.getElementById('p6raceGo').addEventListener('click', race);
    window.addEventListener('resize', () => { if (active()) draw(); });
    window.addEventListener('themechange', () => { if (active()) draw(); });
    measure(); draw();
  })();

  /* ---------- Sandbox: at most k different, or a fixed window ---------- */
  (() => {
    const tpEl = document.getElementById('s6Tp'); if (!tpEl) return;
    const err = document.getElementById('s6Err'), out = document.getElementById('s6Out');
    const inS = document.getElementById('s6Text'), inK = document.getElementById('s6K'), inN = document.getElementById('s6Nums'), inW = document.getElementById('s6W');
    const kdBox = document.getElementById('s6KdBox'), fxBox = document.getElementById('s6FxBox'), modeBtns = document.querySelectorAll('[data-s6mode]');
    const player = TracePlayer(tpEl, null, {});
    let mode = 'kd';
    function setMode(m) {
      mode = m;
      modeBtns.forEach(b => { const on = b.dataset.s6mode === m; b.classList.toggle('btn-primary', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      kdBox.hidden = m !== 'kd'; fxBox.hidden = m !== 'fx';
    }
    const whole = (v, lo, hi, what) => { const t = v.trim(); if (!/^\d{1,4}$/.test(t)) throw new Error(`${what} must be a whole number from ${lo} to ${hi}.`); const x = Number(t); if (x < lo || x > hi) throw new Error(`${what} must be from ${lo} to ${hi}; you typed ${x}.`); return x; };
    function run() {
      err.textContent = '';
      try {
        if (mode === 'kd') {
          const s = Array.from(inS.value);
          if (!inS.value.length) throw new Error('Type a word or some letters, for example: abaccbab');
          if (s.length > 20) throw new Error(`That is ${s.length} characters. Please use 20 or fewer so the trace stays readable.`);
          const k = whole(inK.value, 1, 26, 'k');
          const a = kdFrames(inS.value, k), b = kdBrute(s, k);
          player.load({ code: KDIST_CODE, frames: a.frames });
          out.innerHTML = `<span class="rk">longest with at most ${k} different:</span> <span class="rv">${a.best}</span><br>` +
            `<span class="rk">window moves:</span> <span class="rv">${a.moves}</span><br>` +
            `<span class="rk">brute force reads:</span> <span class="rv-o">${b.reads}</span><br>` +
            `<span class="rk">characters:</span> <span class="rv">${s.length}</span>`;
        } else {
          const parts = inN.value.split(',').map(x => x.trim());
          if (parts.length && parts[parts.length - 1] === '') parts.pop();
          if (!parts.length) throw new Error('Type some whole numbers, for example: 3, 1, 4, 1, 5');
          if (parts.length > 15) throw new Error(`That is ${parts.length} numbers. Please use 15 or fewer so the trace stays readable.`);
          const nums = parts.map((x, q) => { if (!/^-?\d{1,5}$/.test(x)) throw new Error(`Item ${q + 1} ("${x || 'empty'}") is not a whole number. Use digits and commas, like 3, -1, 4.`); return Number(x); });
          const k = whole(inW.value, 1, nums.length, 'The window size k');
          const a = fixedFrames(nums, k), b = recountCount(nums, k);
          player.load({ code: FIXED_CODE, frames: a.frames });
          out.innerHTML = `<span class="rk">best total of ${k} in a row:</span> <span class="rv">${a.best}</span><br>` +
            `<span class="rk">slide touches:</span> <span class="rv">${a.touches}</span><br>` +
            `<span class="rk">recount touches:</span> <span class="rv-o">${b.touches}</span><br>` +
            `<span class="rk">windows:</span> <span class="rv">${nums.length - k + 1}</span>`;
        }
      } catch (e) { err.textContent = e.message; out.innerHTML = ''; }
    }
    modeBtns.forEach(b => b.addEventListener('click', () => { setMode(b.dataset.s6mode); run(); }));
    document.querySelectorAll('[data-s6kd]').forEach(btn => btn.addEventListener('click', () => { const [s, k] = btn.dataset.s6kd.split('|'); inS.value = s; inK.value = k; setMode('kd'); run(); }));
    document.querySelectorAll('[data-s6fx]').forEach(btn => btn.addEventListener('click', () => { const [n, k] = btn.dataset.s6fx.split('|'); inN.value = n; inW.value = k; setMode('fx'); run(); }));
    document.getElementById('s6Run').addEventListener('click', run);
    [inS, inK, inN, inW].forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); run(); } }));
    setMode('kd'); run();
  })();
})();
