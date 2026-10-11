// ======== SLOT 12: PATTERN LESSON, HEAP AND PRIORITY QUEUE ========
(() => {
  const K_CODE = `def k_largest(nums, k):
    heap = []                  # min-heap: the best k so far
    for x in nums:
        if len(heap) < k:
            heapq.heappush(heap, x)
        elif x > heap[0]:      # beats the weakest of the k?
            heapq.heapreplace(heap, x)
    return heap                # heap[0] is the k-th largest`;
  const SORT_CODE = `def k_largest_sort(nums, k):
    s = merge_sort(nums)       # sorts every item
    return s[-k:]

def merge_sort(a):
    if len(a) <= 1:
        return a
    m = len(a) // 2
    left, right = merge_sort(a[:m]), merge_sort(a[m:])
    out, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            out.append(left[i]); i += 1
        else:
            out.append(right[j]); j += 1
    return out + left[i:] + right[j:]`;
  const HEAP_CODE = `def push(h, x):
    h.append(x)
    i = len(h) - 1
    while i > 0:
        p = (i - 1) // 2
        if h[i] < h[p]:
            h[i], h[p] = h[p], h[i]
            i = p
        else:
            break

def pop(h):
    last = h.pop()
    if not h:
        return last
    top, h[0] = h[0], last
    i = 0
    while True:
        l = 2 * i + 1
        if l >= len(h):
            break
        c = l
        if l + 1 < len(h) and h[l + 1] < h[l]:
            c = l + 1
        if h[c] < h[i]:
            h[c], h[i] = h[i], h[c]
            i = c
        else:
            break
    return top`;
  const MED_CODE = `low, high = [], []    # low: max-heap (negated), high: min-heap

def add(num):
    heapq.heappush(low, -num)
    heapq.heappush(high, -heapq.heappop(low))
    if len(high) > len(low):
        heapq.heappush(low, -heapq.heappop(high))

def median():
    if len(low) > len(high):
        return -low[0]
    return (-low[0] + high[0]) / 2`;
  const CAP = 60;
  const ord = k => k + ([0, 'st', 'nd', 'rd'][k % 100 > 10 && k % 100 < 14 ? 0 : k % 10] || 'th');

  /* ---------- the textbook heap with the same counting rules as measure.py ---------- */
  function siftUp(h, i, c) { while (i > 0) { const p = (i - 1) >> 1; c.n++; if (h[i] < h[p]) { [h[i], h[p]] = [h[p], h[i]]; i = p; } else break; } }
  function siftDown(h, i, c) {
    const n = h.length;
    while (true) {
      const l = 2 * i + 1; if (l >= n) break;
      let ch = l;
      if (l + 1 < n) { c.n++; if (h[l + 1] < h[l]) ch = l + 1; }
      c.n++;
      if (h[ch] < h[i]) { [h[ch], h[i]] = [h[i], h[ch]]; i = ch; } else break;
    }
  }
  function kCount(nums, k) {
    const h = [], c = { n: 0 };
    for (const x of nums) { if (h.length < k) { h.push(x); siftUp(h, h.length - 1, c); } else { c.n++; if (x > h[0]) { h[0] = x; siftDown(h, 0, c); } } }
    return { heap: h, comps: c.n };
  }
  function mergeSort(a, c) {
    if (a.length <= 1) return a.slice();
    const m = a.length >> 1, L = mergeSort(a.slice(0, m), c), R = mergeSort(a.slice(m), c), out = [];
    let i = 0, j = 0;
    while (i < L.length && j < R.length) { c.n++; if (L[i] <= R[j]) out.push(L[i++]); else out.push(R[j++]); }
    return out.concat(L.slice(i), R.slice(j));
  }
  function sortCount(nums, k) { const c = { n: 0 }, s = mergeSort(nums, c); return { top: s.slice(s.length - k).reverse(), comps: c.n }; }
  function lcg(n) { let x = 12345; const out = []; for (let t = 0; t < n; t++) { x = x * 48271 % 2147483647; out.push(x % 1000); } return out; }

  const treeV = (h, hl, st, name) => ({ type: 'tree', name: name || 'heap as a tree', values: h.slice(), hl: hl || [], state: st || {} });
  const arrV = (h, hl, ptrs, name) => ({ type: 'array', name: name || 'heap as an array (what Python stores)', values: h.slice(), hl: hl || [], pointers: ptrs || {} });

  /* ---------- k largest with a size-k min-heap: one frame per decision ---------- */
  function kFrames(nums, k) {
    const frames = [], L = s => lineOf(K_CODE, s), h = [], c = { n: 0 };
    const view = (xi, hl, note) => [{ type: 'array', name: 'nums', values: nums, pointers: xi === null ? {} : { x: xi }, dim: nums.map((_, t) => t).filter(t => xi !== null && t < xi) }, treeV(h, hl), arrV(h, hl), { type: 'vars', values: { k, comparisons: c.n } }];
    frames.push({ line: L('heap = []'), note: `Keep only the best ${k} so far. The smallest of them sits on top, ready to be thrown out.`, views: view(null, []) });
    let capped = false;
    nums.forEach((x, t) => {
      if (capped) { if (h.length < k) { h.push(x); siftUp(h, h.length - 1, c); } else { c.n++; if (x > h[0]) { h[0] = x; siftDown(h, 0, c); } } return; }
      if (frames.length >= CAP - 2) { capped = true; frames.push({ line: L('for x in nums'), note: '... more numbers, same rule: compare with the top, replace it if bigger.', views: view(t, []) }); if (h.length < k) { h.push(x); siftUp(h, h.length - 1, c); } else { c.n++; if (x > h[0]) { h[0] = x; siftDown(h, 0, c); } } return; }
      if (h.length < k) {
        const before = c.n; h.push(x); siftUp(h, h.length - 1, c);
        frames.push({ line: L('heapq.heappush(heap, x)'), note: `The heap has room: push ${x}. It sifts up into place (${c.n - before} comparison${c.n - before === 1 ? '' : 's'}).`, views: view(t, [h.indexOf(x)]) });
      } else {
        c.n++;
        if (x > h[0]) {
          const old = h[0], before = c.n; h[0] = x; siftDown(h, 0, c);
          frames.push({ line: L('heapq.heapreplace(heap, x)'), note: `${x} beats the weakest, ${old}. Replace the top and sift ${x} down (${c.n - before} more comparison${c.n - before === 1 ? '' : 's'}).`, views: view(t, [h.indexOf(x)]) });
        } else {
          frames.push({ line: L('elif x > heap[0]'), note: `${x} is not bigger than the top, ${h[0]}. One comparison and it is skipped.`, views: view(t, [0]) });
        }
      }
    });
    frames.push({ line: L('return heap'), note: `Done: ${c.n} comparisons. heap[0] = ${h[0]} is the ${k === 1 ? '' : ord(k) + ' '}largest.`, result: h.slice(), views: view(null, [0]) });
    return { frames, comps: c.n, heap: h };
  }

  /* ---------- sort everything (merge sort): one frame per comparison ---------- */
  function sortFrames(nums, k) {
    const frames = [], L = s => lineOf(SORT_CODE, s), c = { n: 0 }, work = nums.slice();
    let capped = false;
    const push = f => { if (frames.length < CAP) frames.push(f); else capped = true; };
    function ms(lo, hi) {
      if (hi - lo <= 1) return;
      const m = (lo + hi) >> 1; ms(lo, m); ms(m, hi);
      const left = work.slice(lo, m), right = work.slice(m, hi), out = [];
      let i = 0, j = 0;
      while (i < left.length && j < right.length) {
        c.n++;
        const takeL = left[i] <= right[j];
        push({ line: L('if left[i] <= right[j]'), note: `Comparison ${c.n}: ${left[i]} vs ${right[j]}. Take ${takeL ? left[i] : right[j]}.`, views: [{ type: 'array', name: 'the whole list (blue: the part being merged)', values: work.slice(), win: [lo, hi - 1], hl: [lo + i, m + j] }, { type: 'array', name: 'merged so far', values: out.slice() }, { type: 'vars', values: { comparisons: c.n } }] });
        if (takeL) out.push(left[i++]); else out.push(right[j++]);
      }
      const merged = out.concat(left.slice(i), right.slice(j));
      for (let t = 0; t < merged.length; t++) work[lo + t] = merged[t];
      push({ line: L('return out + left[i:] + right[j:]'), note: `Positions ${lo} to ${hi - 1} are now sorted.`, views: [{ type: 'array', name: 'the whole list (blue: the part being merged)', values: work.slice(), win: [lo, hi - 1] }, { type: 'array', name: 'merged so far', values: merged }, { type: 'vars', values: { comparisons: c.n } }] });
    }
    push({ line: L('s = merge_sort(nums)'), note: 'Sort all the numbers, even though only the top few matter.', views: [{ type: 'array', name: 'the whole list (blue: the part being merged)', values: work.slice() }, { type: 'array', name: 'merged so far', values: [] }, { type: 'vars', values: { comparisons: 0 } }] });
    ms(0, work.length);
    if (capped) frames.push({ line: L('if left[i] <= right[j]'), note: '... more comparisons, same rule.', views: [{ type: 'array', name: 'the whole list (blue: the part being merged)', values: work.slice() }, { type: 'vars', values: { comparisons: c.n } }] });
    const top = work.slice(work.length - k).reverse();
    frames.push({ line: L('return s[-k:]'), note: `Sorted after ${c.n} comparisons. The last ${k} are the answer.`, result: top, views: [{ type: 'array', name: 'the whole list (sorted)', values: work.slice(), win: [work.length - k, work.length - 1] }, { type: 'vars', values: { comparisons: c.n } }] });
    return { frames, comps: c.n, top };
  }

  /* ---------- inside the heap: sift up and sift down, frame by frame ---------- */
  function pushFrames(h, x, c, frames) {
    const L = (s, nth) => lineOf(HEAP_CODE, s, nth), v = (hl, st, ptr) => [treeV(h, hl, st), arrV(h, hl, ptr), { type: 'vars', values: { comparisons: c.n } }];
    h.push(x); let i = h.length - 1;
    frames.push({ line: L('h.append(x)'), note: `Push ${x}: it goes in the first free spot, index ${i}, the bottom of the tree.`, views: v([i], {}, { i }) });
    while (i > 0) {
      const p = (i - 1) >> 1; c.n++;
      if (h[i] < h[p]) {
        frames.push({ line: L('if h[i] < h[p]'), note: `Is ${h[i]} smaller than its parent ${h[p]} (index (${i} - 1) // 2 = ${p})? Yes.`, views: v([i, p], {}, { i, p }) });
        [h[i], h[p]] = [h[p], h[i]];
        frames.push({ line: L('h[i], h[p] = h[p], h[i]'), note: `Swap: ${h[p]} moves up one level.`, views: v([p], {}, { i: p }) });
        i = p;
      } else {
        frames.push({ line: L('if h[i] < h[p]'), note: `Is ${h[i]} smaller than its parent ${h[p]}? No: it stops here.`, views: v([i, p], {}, { i, p }) });
        break;
      }
    }
    if (i === 0 && h.length > 1) frames.push({ line: L('while i > 0'), note: `${h[0]} reached the root: it is the new minimum.`, views: v([0], {}, { i: 0 }) });
  }
  function popFrames(h, c, frames) {
    const L = (s, nth) => lineOf(HEAP_CODE, s, nth), v = (hl, ptr) => [treeV(h, hl), arrV(h, hl, ptr), { type: 'vars', values: { comparisons: c.n } }];
    if (!h.length) { frames.push({ line: L('last = h.pop()'), note: 'The heap is empty: Python would raise IndexError here. Push something first.', views: v([]) }); return null; }
    const top = h[0], last = h.pop();
    if (!h.length) { frames.push({ line: L('return last'), note: `Pop: ${last} was the only item.`, result: last, views: v([]) }); return last; }
    h[0] = last;
    frames.push({ line: L('top, h[0] = h[0], last'), note: `Pop ${top} from the root. The last item, ${last}, jumps to the root to fill the hole.`, views: v([0], { i: 0 }) });
    let i = 0;
    while (true) {
      const l = 2 * i + 1; if (l >= h.length) { frames.push({ line: L('break', 2), note: `${h[i]} has no children: it is settled.`, views: v([i], { i }) }); break; }
      let ch = l;
      if (l + 1 < h.length) { c.n++; if (h[l + 1] < h[l]) ch = l + 1; }
      c.n++;
      if (h[ch] < h[i]) {
        frames.push({ line: L('if h[c] < h[i]'), note: `The smaller child of ${h[i]} is ${h[ch]} (index ${ch}). It is smaller, so they swap.`, views: v([i, ch], { i, c: ch }) });
        [h[ch], h[i]] = [h[i], h[ch]]; i = ch;
        frames.push({ line: L('h[c], h[i] = h[i], h[c]'), note: `${h[i]} moved down to index ${i}.`, views: v([i], { i }) });
      } else {
        frames.push({ line: L('if h[c] < h[i]'), note: `The smaller child is ${h[ch]}, not smaller than ${h[i]}. Settled.`, views: v([i, ch], { i, c: ch }) });
        break;
      }
    }
    frames.push({ line: L('return top'), note: `Returned ${top}. The new minimum, ${h[0]}, is on top.`, result: top, views: v([0]) });
    return top;
  }

  /* ---------- two heaps: running median ---------- */
  function medFrames(stream) {
    const frames = [], L = s => lineOf(MED_CODE, s), low = [], high = [], meds = [];
    const fmt = (v, avg) => (avg ? v.toFixed(1) : String(v));
    const view = (t, med) => [{ type: 'array', name: 'stream', values: stream, pointers: t === null ? {} : { num: t }, dim: stream.map((_, q) => q).filter(q => t !== null && q > t) },
      { type: 'set', name: 'low: max-heap, biggest first (stored negated)', values: low.slice().sort((a, b) => b - a), hl: low.length ? Math.max(...low) : undefined },
      { type: 'set', name: 'high: min-heap, smallest first', values: high.slice().sort((a, b) => a - b), hl: high.length ? Math.min(...high) : undefined },
      { type: 'vars', values: { median: med === undefined ? '-' : med, medians: meds.length ? meds.join(', ') : '-' } }];
    frames.push({ line: L('low, high = [], []'), note: 'Two piles: low holds the smaller half, high the bigger half. Their tops meet in the middle.', views: view(null) });
    stream.forEach((num, t) => {
      low.push(num);
      frames.push({ line: L('heapq.heappush(low, -num)'), note: `${num} goes into low first.`, views: view(t) });
      const mx = Math.max(...low); low.splice(low.indexOf(mx), 1); high.push(mx);
      frames.push({ line: L('heapq.heappush(high, -heapq.heappop(low))'), note: `low hands its biggest, ${mx}, to high. Now every item in low is at most every item in high.`, views: view(t) });
      if (high.length > low.length) {
        const mn = Math.min(...high); high.splice(high.indexOf(mn), 1); low.push(mn);
        frames.push({ line: L('heapq.heappush(low, -heapq.heappop(high))'), note: `high got too big: it hands its smallest, ${mn}, back. low may hold one extra.`, views: view(t) });
      }
      const m = low.length > high.length ? Math.max(...low) : (Math.max(...low) + Math.min(...high)) / 2;
      const avg = low.length === high.length; meds.push(fmt(m, avg));
      frames.push({ line: low.length > high.length ? L('return -low[0]') : L('return (-low[0] + high[0]) / 2'), note: low.length > high.length ? `Odd count: the median is low's top, ${fmt(m, avg)}.` : `Even count: average the two tops, (${Math.max(...low)} + ${Math.min(...high)}) / 2 = ${fmt(m, avg)}.`, views: view(t, fmt(m, avg)) });
    });
    frames[frames.length - 1].result = meds.join(', ');
    return { frames, meds };
  }

  const setVal = (eid, v) => { const el = document.getElementById(eid); if (!el) return; el.querySelector('.val').textContent = v; flash(el); };
  const mount = (eid, trace, o) => { const el = document.getElementById(eid); return el ? TracePlayer(el, trace, o || {}) : null; };
  const num = v => v.toLocaleString('en-US');

  /* ---------- Section 1: the two players ---------- */
  (() => {
    const pic = [4, 9, 2, 7, 1, 8, 3, 6, 5, 0];
    const a = kFrames(pic, 3), b = sortFrames(pic, 3);
    mount('p12tpA', { frames: a.frames }, { code: false, row: true });
    mount('p12tpB', { frames: b.frames }, { code: false, row: true });
    setVal('p12roA', a.comps); setVal('p12roB', b.comps);
  })();

  /* ---------- Section 4: template players ---------- */
  mount('p12tpC', { code: K_CODE, frames: kFrames([4, 9, 2, 7, 1, 8, 3, 6, 5, 0], 3).frames });
  mount('p12tpD', { code: MED_CODE, frames: medFrames([5, 15, 1, 3, 8]).frames });

  /* ---------- Section 4: heap playground ---------- */
  (() => {
    const el = document.getElementById('p12tpP'); if (!el) return;
    const inp = document.getElementById('p12pgIn'), err = document.getElementById('p12pgErr'), out = document.getElementById('p12pgOut');
    const player = TracePlayer(el, null, { row: true });
    let h, c, hist, popped;
    const show = (from) => {
      if (hist.length > 160) hist.splice(0, hist.length - 160);
      player.load({ code: HEAP_CODE, frames: hist.slice() }); player.go(Math.min(from, hist.length - 1));
      if (out) out.innerHTML = `<span class="rk">array:</span> <span class="rv">[${h.join(', ')}]</span><br><span class="rk">minimum (h[0]):</span> <span class="rv">${h.length ? h[0] : '-'}</span><br><span class="rk">comparisons so far:</span> <span class="rv">${c.n}</span><br><span class="rk">popped so far:</span> <span class="rv-o">${popped.length ? popped.join(', ') : '-'}</span>`;
    };
    function reset() { h = []; c = { n: 0 }; popped = []; hist = [{ line: lineOf(HEAP_CODE, 'def push(h, x)'), note: 'An empty heap. Push a number, or load the preset.', views: [treeV([]), arrV([]), { type: 'vars', values: { comparisons: 0 } }] }]; show(0); }
    function doPush(x) { const from = hist.length; pushFrames(h, x, c, hist); show(from); }
    document.getElementById('p12pgPush').addEventListener('click', () => {
      const t = inp.value.trim();
      if (!/^-?\d{1,3}$/.test(t)) { err.textContent = `"${t || 'empty'}" is not a whole number from -999 to 999.`; return; }
      if (h.length >= 15) { err.textContent = 'The playground holds 15 items, four levels of tree. Pop some first.'; return; }
      err.textContent = ''; doPush(Number(t));
    });
    document.getElementById('p12pgPop').addEventListener('click', () => { err.textContent = ''; const from = hist.length; const r = popFrames(h, c, hist); if (r !== null) popped.push(r); show(from); });
    document.getElementById('p12pgPre').addEventListener('click', () => { err.textContent = ''; reset(); const from = hist.length; [5, 3, 8, 1, 9, 2].forEach(x => pushFrames(h, x, c, hist)); show(from); });
    document.getElementById('p12pgClr').addEventListener('click', () => { err.textContent = ''; reset(); });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('p12pgPush').click(); } });
    reset();
  })();

  /* ---------- Section 7: the comparison race ---------- */
  (() => {
    const btns = document.querySelectorAll('[data-p12n]'); if (!btns.length) return;
    const barH = document.getElementById('p12barH'), barS = document.getElementById('p12barS');
    function upd(n) {
      const nums = lcg(n), a = kCount(nums, 3), b = sortCount(nums, 3);
      setVal('p12roN', num(n)); setVal('p12roH', num(a.comps)); setVal('p12roS', num(b.comps)); setVal('p12roR', (b.comps / a.comps).toFixed(1) + 'x');
      if (barS) barS.style.width = '100%';
      if (barH) barH.style.width = Math.max(0.5, 100 * a.comps / b.comps) + '%';
    }
    btns.forEach(btn => btn.addEventListener('click', () => upd(Number(btn.dataset.p12n))));
    upd(1000);
  })();

  /* ---------- Sandbox: top-k on your own numbers ---------- */
  (() => {
    const inp = document.getElementById('s12In'), kIn = document.getElementById('s12K'), err = document.getElementById('s12Err'), out = document.getElementById('s12Out'), tpEl = document.getElementById('s12Tp');
    if (!inp || !tpEl) return;
    const player = TracePlayer(tpEl, null, {});
    function parse() {
      const parts = inp.value.split(',').map(t => t.trim());
      if (parts.length && parts[parts.length - 1] === '') parts.pop();
      if (!parts.length) throw new Error('Type at least one number, for example: 4, 9, 2, 7');
      if (parts.length > 15) throw new Error(`That is ${parts.length} numbers. Please use 15 or fewer so the trace stays readable.`);
      const nums = parts.map((t, q) => { if (!/^-?\d{1,4}$/.test(t)) throw new Error(`Item ${q + 1} ("${t || 'empty'}") is not a whole number. Use digits and commas, like 4, -2, 7.`); return Number(t); });
      const ks = kIn.value.trim();
      if (!/^\d+$/.test(ks)) throw new Error('k must be a whole number, such as 3.');
      const k = Number(ks);
      if (k < 1 || k > nums.length) throw new Error(`k must be between 1 and ${nums.length}, the number of items.`);
      return { nums, k };
    }
    function run() {
      let a;
      try { a = parse(); } catch (e) { err.textContent = e.message; out.innerHTML = ''; return; }
      err.textContent = '';
      const r = kFrames(a.nums, a.k), s = sortCount(a.nums, a.k);
      player.load({ code: K_CODE, frames: r.frames });
      out.innerHTML = `<span class="rk">heap (any order):</span> <span class="rv">[${r.heap.join(', ')}]</span><br><span class="rk">k-th largest, heap[0]:</span> <span class="rv">${r.heap[0]}</span><br>` +
        `<span class="rk">size-k heap:</span> <span class="rv">${r.comps}</span> <span class="rk">comparisons</span><br><span class="rk">sort everything:</span> <span class="rv-o">${s.comps}</span> <span class="rk">comparisons</span>`;
    }
    document.querySelectorAll('[data-s12ex]').forEach(btn => btn.addEventListener('click', () => { inp.value = btn.dataset.s12ex; kIn.value = btn.dataset.s12k; run(); }));
    document.getElementById('s12Run').addEventListener('click', run);
    [inp, kIn].forEach(x => x.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); run(); } }));
    run();
  })();
})();
