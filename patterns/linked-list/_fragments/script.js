// ======== SLOT 10: PATTERN LESSON, LINKED LIST ========
(() => {
  const REV_CODE = `def reverse(head):
    prev, cur = None, head
    while cur:
        nxt = cur.next      # 1. save the rest
        cur.next = prev     # 2. flip the arrow
        prev = cur          # 3. step prev
        cur = nxt           # 4. step cur
    return prev`;
  const SLOW_CODE = `def reverse_slow(head):
    new_head = tail = None
    while head:
        prev, cur = None, head
        while cur.next:
            prev, cur = cur, cur.next
        if prev:
            prev.next = None
        else:
            head = None
        if tail:
            tail.next = cur
        else:
            new_head = cur
        tail = cur
    return new_head`;
  const BUG_CODE = `def reverse_buggy(head):
    prev, cur = None, head
    while cur:
        cur.next = prev     # flipped first...
        prev = cur
        cur = cur.next      # ...so this follows the NEW arrow
    return prev`;
  const MERGE_CODE = `def merge(a, b):
    dummy = tail = ListNode(0)
    while a and b:
        if a.val <= b.val:
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next
    tail.next = a or b
    return dummy.next`;
  const MID_CODE = `def middle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow`;
  const CYC_CODE = `def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False`;
  const CAP = 60;

  /* ---------- counters on real nodes, same rules as measure.py ---------- */
  function build(vals, pos = -1) {
    const nodes = vals.map(v => ({ val: v, next: null }));
    nodes.forEach((nd, i) => { nd.next = nodes[i + 1] || null; });
    if (pos >= 0 && nodes.length) nodes[nodes.length - 1].next = nodes[pos];
    return nodes[0] || null;
  }
  function slowCount(head) {
    let hops = 0, newHead = null, tail = null;
    while (head) {
      let prev = null, cur = head;
      while (cur.next) { prev = cur; cur = cur.next; hops++; }
      if (prev) prev.next = null; else head = null;
      if (tail) tail.next = cur; else newHead = cur;
      tail = cur;
    }
    return { head: newHead, hops };
  }
  function revCount(head) {
    let prev = null, cur = head, hops = 0;
    while (cur) { const nxt = cur.next; cur.next = prev; prev = cur; cur = nxt; hops++; }
    return { head: prev, hops };
  }

  /* ---------- graph views: nodes in a row, pointers as labels underneath ---------- */
  const id = i => 'n' + i;
  function rowView(name, vals, nxt, ptrs, state, hl, withL) {
    const n = vals.length, nodes = [], edges = [], at = { R: 1 };
    if (withL) { at.L = 0; nodes.push({ id: 'L', label: 'None', x: 0, y: 0.47 }); }
    vals.forEach((v, i) => { at[id(i)] = withL ? (i + 1) / (n + 1) : i / n; nodes.push({ id: id(i), label: v, x: at[id(i)], y: 0.47 }); });
    nodes.push({ id: 'R', label: 'None', x: 1, y: 0.47 });
    nxt.forEach((t, i) => { if (t) edges.push([id(i), t]); });
    const st = Object.assign({}, state), byT = {};
    Object.entries(ptrs).forEach(([p, t]) => { if (t) (byT[t] = byT[t] || []).push(p); });
    Object.entries(byT).forEach(([t, ps]) => ps.forEach((p, k) => {
      const pid = 'p_' + p, x = Math.min(1, Math.max(0, at[t] + (k > 1 ? 0.12 : 0)));
      nodes.push({ id: pid, label: p, x, y: k === 1 ? 0 : 0.95 }); edges.push([pid, t]); st[pid] = 'frontier';
    }));
    return { type: 'graph', name, nodes, edges, directed: true, hl: hl || [], state: st };
  }
  const walk = (start, nxt, lim = 12) => { const out = []; let t = start; while (t && t.startsWith('n') && out.length < lim) { out.push(Number(t.slice(1))); t = nxt[Number(t.slice(1))]; } return out; };

  // Pattern reversal: re-point one arrow per node.
  function revFrames(vals) {
    const n = vals.length, frames = [], L = s => lineOf(REV_CODE, s);
    const nxt = vals.map((_, i) => (i < n - 1 ? id(i + 1) : 'R'));
    let prev = null, cur = n ? 0 : null, save, hops = 0;
    const tgt = (k, none) => (k === null || k === undefined ? none : id(k));
    const view = (extraHl, withNxt) => {
      const st = {}; for (let k = 0; k < n; k++) if (prev !== null && k <= prev) st[id(k)] = 'visited';
      if (cur !== null) st[id(cur)] = 'current';
      const ptrs = { prev: tgt(prev, 'L'), cur: tgt(cur, 'R') };
      if (withNxt) ptrs.nxt = tgt(save, 'R');
      return [rowView('the list (arrows are next pointers)', vals, nxt, ptrs, st, extraHl, true), { type: 'vars', values: { hops } }];
    };
    frames.push({ line: L('prev, cur = None, head'), note: 'Start: prev is None (nothing reversed yet) and cur is the head.', views: view([], false) });
    while (cur !== null) {
      if (frames.length >= CAP) { frames.push({ line: L('nxt = cur.next'), note: `... ${n - cur} more nodes, same four moves each.`, views: view([], false) }); break; }
      save = cur + 1 < n ? cur + 1 : null;
      frames.push({ line: L('nxt = cur.next'), note: `Save the rest first: nxt = ${save === null ? 'None' : 'node ' + vals[save]}. Now it is safe to cut.`, views: view([], true) });
      nxt[cur] = tgt(prev, 'L');
      frames.push({ line: L('cur.next = prev'), note: `Flip: node ${vals[cur]} now points back to ${prev === null ? 'None' : 'node ' + vals[prev]}.`, views: view([[id(cur), nxt[cur]]], true) });
      prev = cur;
      frames.push({ line: L('prev = cur'), note: `prev moves to node ${vals[prev]}. Everything up to prev is reversed.`, views: view([], true) });
      cur = save; hops++;
      frames.push({ line: L('cur = nxt'), note: `cur jumps to ${cur === null ? 'None: the walk is over' : 'node ' + vals[cur]}. Hop ${hops}.`, views: view([], true) });
    }
    const res = prev === null ? [] : walk(id(prev), nxt).map(k => vals[k]);
    frames.push({ line: L('return prev'), note: `prev is the new head. ${hops} hop${hops === 1 ? '' : 's'} for ${n} node${n === 1 ? '' : 's'}: one each.`, result: res, views: view([], false) });
    return { frames, hops, res };
  }

  // Slow reversal: walk to the tail again for every node.
  function slowFrames(vals) {
    const n = vals.length, frames = [], L = s => lineOf(SLOW_CODE, s);
    const nxt = vals.map((_, i) => (i < n - 1 ? id(i + 1) : 'R'));
    let head = n ? 0 : null, newHead = null, tail = null, hops = 0, capped = false;
    const done = new Set();
    const view = (c, hl) => {
      const st = {}; done.forEach(k => { st[id(k)] = 'visited'; }); if (c !== null) st[id(c)] = 'current';
      return [rowView('old list, and the new list in blue', vals, nxt, c === null ? {} : { cur: id(c) }, st, hl, false), { type: 'vars', values: { hops } }];
    };
    const push = f => { if (frames.length < CAP) frames.push(f); else capped = true; };
    push({ line: L('new_head = tail = None'), note: 'The new list starts empty. Each round pulls the last node off the old list.', views: view(null, []) });
    while (head !== null) {
      let prev = null, c = head;
      push({ line: L('prev, cur = None, head'), note: `New round: start walking from the head, node ${vals[head]}.`, views: view(c, []) });
      while (nxt[c] && nxt[c].startsWith('n')) {
        prev = c; c = Number(nxt[c].slice(1)); hops++;
        push({ line: L('prev, cur = cur, cur.next'), note: `Hop ${hops}: walk to node ${vals[c]}. There is no way back, so every round walks from the start.`, views: view(c, [[id(prev), id(c)]]) });
      }
      if (prev !== null) { nxt[prev] = null; push({ line: L('prev.next = None'), note: `Node ${vals[c]} is the last one. Cut it off the old list.`, views: view(c, []) }); }
      else { head = null; push({ line: L('head = None'), note: `Node ${vals[c]} was the only one left. The old list is now empty.`, views: view(c, []) }); }
      if (tail !== null) { nxt[tail] = id(c); done.add(c); push({ line: L('tail.next = cur'), note: `Append node ${vals[c]} to the new list.`, views: view(c, [[id(tail), id(c)]]) }); }
      else { newHead = c; done.add(c); push({ line: L('new_head = cur'), note: `Node ${vals[c]} becomes the head of the new list.`, views: view(c, []) }); }
      tail = c;
    }
    const res = newHead === null ? [] : walk(id(newHead), nxt).map(k => vals[k]);
    if (capped) frames.push({ line: L('while cur.next'), note: `... more rounds, same rule: walk from the head to the end every time.`, views: view(null, []) });
    frames.push({ line: L('return new_head'), note: `Done after ${hops} hops for ${n} nodes. Most of them were the same walk, repeated.`, result: res, views: view(null, []) });
    return { frames, hops, res };
  }

  // The trap: flip before saving next.
  function bugFrames(vals) {
    const n = vals.length, frames = [], L = s => lineOf(BUG_CODE, s);
    const nxt = vals.map((_, i) => (i < n - 1 ? id(i + 1) : 'R'));
    let prev = null, cur = 0;
    const lost = {};
    const view = hl => { const st = Object.assign({}, lost); if (cur !== null) st[id(cur)] = 'current'; return [rowView('the list', vals, nxt, { prev: prev === null ? 'L' : id(prev), cur: cur === null ? 'R' : id(cur) }, st, hl, true)]; };
    frames.push({ line: L('prev, cur = None, head'), note: 'Same start as before: prev is None, cur is the head.', views: view([]) });
    nxt[0] = 'L';
    for (let k = 1; k < n; k++) lost[id(k)] = 'done';
    frames.push({ line: L('cur.next = prev'), note: `Flip node ${vals[0]} to None. Nothing points to node ${vals[1]} any more: nodes ${vals.slice(1).join(' and ')} fade out.`, views: view([[id(0), 'L']]) });
    prev = 0;
    frames.push({ line: L('prev = cur'), note: `prev moves to node ${vals[0]}.`, views: view([]) });
    cur = null;
    frames.push({ line: L('cur = cur.next'), note: 'cur.next is now the flipped arrow, so cur becomes None. The loop stops early.', views: view([]) });
    frames.push({ line: L('return prev'), note: `Returns [${vals[0]}]. The other ${n - 1} nodes are lost for good.`, result: [vals[0]], views: view([]) });
    return frames;
  }

  // Dummy head: merge two sorted lists (drawn as arrays with pointers).
  function mergeFrames(a, b) {
    const frames = [], L = s => lineOf(MERGE_CODE, s), out = ['dummy'];
    let i = 0, j = 0, comps = 0;
    const view = (hlA, hlB) => [
      { type: 'array', name: 'list a', values: a, pointers: { a: i }, hl: hlA ? [i] : [], dim: a.map((_, k) => k).filter(k => k < i) },
      { type: 'array', name: 'list b', values: b, pointers: { b: j }, hl: hlB ? [j] : [], dim: b.map((_, k) => k).filter(k => k < j) },
      { type: 'array', name: 'merged (starts at the dummy)', values: out.slice(), pointers: { tail: out.length - 1 } },
      { type: 'vars', values: { comparisons: comps } }];
    frames.push({ line: L('dummy = tail = ListNode(0)'), note: 'A dummy node gives tail somewhere to stand before the real head is known.', views: view(false, false) });
    while (i < a.length && j < b.length) {
      comps++;
      const takeA = a[i] <= b[j];
      frames.push({ line: L('if a.val <= b.val'), note: `Comparison ${comps}: ${a[i]} vs ${b[j]}. Take ${takeA ? a[i] + ' from a' : b[j] + ' from b'}.`, views: view(true, true) });
      if (takeA) { out.push(a[i]); i++; frames.push({ line: L('tail.next, a = a, a.next'), note: `Hang ${a[i - 1]} after tail; a steps forward.`, views: view(false, false) }); }
      else { out.push(b[j]); j++; frames.push({ line: L('tail.next, b = b, b.next'), note: `Hang ${b[j - 1]} after tail; b steps forward.`, views: view(false, false) }); }
    }
    const rest = i < a.length ? a.slice(i) : b.slice(j);
    out.push(...rest); i = a.length; j = b.length;
    frames.push({ line: L('tail.next = a or b'), note: `One list ran out. Hang the rest (${rest.join(', ') || 'nothing'}) in one move: no more comparisons.`, views: view(false, false) });
    frames.push({ line: L('return dummy.next'), note: `Skip the dummy. ${comps} comparisons in total.`, result: out.slice(1), views: view(false, false) });
    return { frames, comps };
  }

  // Fast and slow: the middle.
  function midFrames(vals) {
    const n = vals.length, frames = [], L = s => lineOf(MID_CODE, s);
    const nxt = vals.map((_, i) => (i < n - 1 ? id(i + 1) : 'R'));
    let slow = 0, fast = 0, rounds = 0;
    const view = () => { const st = {}; st[id(slow)] = 'current'; return [rowView('the list', vals, nxt, { slow: id(slow), fast: fast === null ? 'R' : id(fast) }, st, [], false), { type: 'vars', values: { rounds } }]; };
    frames.push({ line: L('slow = fast = head'), note: 'Both walkers start at the head.', views: view() });
    while (fast !== null && fast + 1 < n) {
      if (frames.length >= CAP) { frames.push({ line: L('slow = slow.next'), note: '... more rounds, same rule.', views: view() }); break; }
      slow++; frames.push({ line: L('slow = slow.next'), note: `slow takes 1 step, to node ${vals[slow]}.`, views: view() });
      fast = fast + 2 < n ? fast + 2 : null; rounds++;
      frames.push({ line: L('fast = fast.next.next'), note: `fast takes 2 steps, to ${fast === null ? 'None (off the end)' : 'node ' + vals[fast]}. Round ${rounds}.`, views: view() });
    }
    frames.push({ line: L('return slow'), note: `fast cannot take two more steps, so slow is halfway: node ${vals[slow]}.`, result: vals[slow], views: view() });
    return { frames, rounds, res: vals[slow] };
  }

  // Fast and slow: cycle detection, drawn with the loop as a circle.
  function cycleView(vals, pos, st) {
    const n = vals.length, nodes = [], edges = [], H = 200 / 320;
    if (pos < 0) {
      vals.forEach((v, i) => nodes.push({ id: id(i), label: v, x: i / n, y: 0.5 }));
      nodes.push({ id: 'R', label: 'None', x: 1, y: 0.5 });
    } else {
      const c = n - pos, rx = Math.min(0.28, 0.07 + 0.035 * c), ry = Math.min(0.45, rx / H);
      const gap = pos ? Math.min(0.14, (0.97 - 2 * rx) / pos) : 0, cx = pos * gap + rx;
      for (let i = 0; i < pos; i++) nodes.push({ id: id(i), label: vals[i], x: i * gap, y: 0.5 });
      for (let k = 0; k < c; k++) { const t = Math.PI + 2 * Math.PI * k / c; nodes.push({ id: id(pos + k), label: vals[pos + k], x: cx + rx * Math.cos(t), y: 0.5 + ry * Math.sin(t) }); }
    }
    vals.forEach((_, i) => edges.push([id(i), i < n - 1 ? id(i + 1) : (pos >= 0 ? id(pos) : 'R')]));
    return { type: 'graph', name: pos >= 0 ? `the list (tail links back to index ${pos})` : 'the list (no loop)', nodes, edges, directed: true, state: st };
  }
  function cycFrames(vals, pos) {
    const n = vals.length, frames = [], L = s => lineOf(CYC_CODE, s);
    const step = k => (k === null ? null : k + 1 < n ? k + 1 : pos >= 0 ? pos : null);
    let slow = 0, fast = 0, rounds = 0;
    const view = meet => { const st = {}; if (fast !== null) st[id(fast)] = 'frontier'; st[id(slow)] = 'current'; if (meet) st[id(slow)] = 'current'; return [cycleView(vals, pos, st), { type: 'vars', values: { slow: vals[slow], fast: fast === null ? 'None' : vals[fast], rounds } }]; };
    frames.push({ line: L('slow = fast = head'), note: 'Both start at the head. Teal ring: slow. Orange ring: fast.', views: view(false) });
    while (fast !== null && step(fast) !== null) {
      if (frames.length >= CAP) { frames.push({ line: L('slow = slow.next'), note: '... more rounds, same rule.', views: view(false) }); break; }
      slow = step(slow);
      frames.push({ line: L('slow = slow.next'), note: `slow steps to node ${vals[slow]}.`, views: view(false) });
      fast = step(step(fast)); rounds++;
      frames.push({ line: L('fast = fast.next.next'), note: `fast jumps two, to ${fast === null ? 'None' : 'node ' + vals[fast]}. Round ${rounds}.`, views: view(false) });
      if (fast === slow) {
        frames.push({ line: L('return True'), note: `They meet at node ${vals[slow]} after ${rounds} rounds. Only a loop lets fast come round behind slow.`, result: true, views: view(true) });
        return { frames, found: true, rounds, meet: vals[slow] };
      }
    }
    frames.push({ line: L('return False'), note: `fast reached the end after ${rounds} rounds. A list with an end has no loop.`, result: false, views: view(false) });
    return { frames, found: false, rounds, meet: null };
  }
  function cycleStart(vals, pos) {
    if (pos < 0) return null;
    const head = build(vals, pos);
    let slow = head, fast = head;
    do { slow = slow.next; fast = fast.next.next; } while (slow !== fast);
    slow = head; while (slow !== fast) { slow = slow.next; fast = fast.next; }
    return slow.val;
  }

  const setVal = (eid, v) => { const el = document.getElementById(eid); if (!el) return; el.querySelector('.val').textContent = v; flash(el); };
  const mount = (eid, trace, o) => { const el = document.getElementById(eid); return el ? TracePlayer(el, trace, o || {}) : null; };

  /* ---------- Section 1: slow vs pattern on the same list ---------- */
  (() => {
    const pic = [1, 2, 3, 4, 5];
    const a = revFrames(pic), b = slowFrames(pic);
    mount('p10tpA', { frames: a.frames }, { code: false });
    mount('p10tpB', { frames: b.frames }, { code: false });
    setVal('p10roA', a.hops); setVal('p10roB', b.hops);
  })();

  /* ---------- Section 4: template players ---------- */
  mount('p10tpC', { code: REV_CODE, frames: revFrames([1, 2, 3, 4]).frames });
  mount('p10tpD', { code: MERGE_CODE, frames: mergeFrames([1, 4, 6], [2, 3, 7]).frames });
  mount('p10tpE', { code: MID_CODE, frames: midFrames([1, 2, 3, 4, 5, 6]).frames });
  mount('p10tpF', { code: CYC_CODE, frames: cycFrames([1, 2, 3, 4, 5, 6], 2).frames });
  mount('p10tpG', { code: BUG_CODE, frames: bugFrames([1, 2, 3]) });

  /* ---------- Section 4: drive the four moves yourself ---------- */
  (() => {
    const el = document.getElementById('p10tpH'); if (!el) return;
    const vals = [1, 2, 3, 4], n = vals.length;
    const player = TracePlayer(el, null, {});
    const msg = document.getElementById('p10gmMsg');
    let nxt, prev, cur, save, hist, moves, over;
    const name = k => (k === null ? 'None' : 'node ' + vals[k]);
    const tgtOf = k => (k === null ? 'L' : id(k));
    const follow = t => (t && t.startsWith('n') ? Number(t.slice(1)) : null);
    function reach() {
      const seen = new Set();
      [prev, cur, save].forEach(s => { let k = s, guard = 0; while (k !== null && k !== undefined && !seen.has(k) && guard++ < 20) { seen.add(k); k = follow(nxt[k]); } });
      return seen;
    }
    function snap(line, note, hl) {
      const r = reach(), st = {};
      for (let k = 0; k < n; k++) if (!r.has(k)) st[id(k)] = 'done';
      if (cur !== null && cur !== undefined) st[id(cur)] = 'current';
      const ptrs = { prev: tgtOf(prev), cur: cur === null ? 'R' : id(cur) };
      if (save !== undefined) ptrs.nxt = save === null ? 'R' : id(save);
      hist.push({ line: lineOf(REV_CODE, line), note, views: [rowView('your list', vals, nxt, ptrs, st, hl || [], true), { type: 'vars', values: { moves } }] });
      player.load({ code: REV_CODE, frames: hist.slice() }); player.go(hist.length - 1);
      const lost = n - r.size;
      if (msg) msg.textContent = lost > 0 ? `${lost} node${lost > 1 ? 's are' : ' is'} lost: nothing points to ${lost > 1 ? 'them' : 'it'}. Press "Start again".` : note;
      if (lost > 0) over = true;
    }
    function reset() {
      nxt = vals.map((_, i) => (i < n - 1 ? id(i + 1) : 'R')); prev = null; cur = 0; save = undefined; hist = []; moves = 0; over = false;
      snap('prev, cur = None, head', 'prev is None, cur is the head. Pick the first move.');
    }
    const ops = {
      save() { if (cur === null) return snap('nxt = cur.next', 'cur is None, so cur.next would crash. Try "return prev".'); save = follow(nxt[cur]); snap('nxt = cur.next', `Saved: nxt = ${name(save)}.`); },
      flip() { if (cur === null) return snap('cur.next = prev', 'cur is None, so there is no arrow to flip. Try "return prev".'); nxt[cur] = tgtOf(prev); snap('cur.next = prev', `Node ${vals[cur]} now points to ${name(prev)}.${prev === cur ? ' It points at itself: prev moved too early.' : ''}`, [[id(cur), tgtOf(prev)]]); },
      prev() { prev = cur; snap('prev = cur', `prev = ${name(prev)}.`); },
      cur() { if (save === undefined) return snap('cur = nxt', 'nxt was never saved, so there is nowhere to jump. Save it first.'); cur = save; snap('cur = nxt', `cur = ${name(cur)}.`); },
      ret() {
        const out = []; let k = prev, g = 0; while (k !== null && g++ < 10) { out.push(vals[k]); k = follow(nxt[k]); }
        if (g > 10) out.splice(6, out.length, '...');
        const ok = cur === null && out.join() === vals.slice().reverse().join();
        snap('return prev', ok ? `Returned [${out.join(', ')}] in ${moves} moves. That is the reversal: four moves per node.` : `Returned [${out.join(', ')}]${g > 10 ? ' (it loops forever)' : ''}. Not reversed yet: ${cur === null ? 'some arrows were never flipped' : 'cur still has nodes to visit'}.`);
      }
    };
    document.querySelectorAll('[data-p10op]').forEach(btn => btn.addEventListener('click', () => {
      if (over) { if (msg) msg.textContent = 'This list is broken. Press "Start again".'; return; }
      moves++; ops[btn.dataset.p10op]();
    }));
    const again = document.getElementById('p10gmReset'); if (again) again.addEventListener('click', reset);
    reset();
  })();

  /* ---------- Section 7: the hop race ---------- */
  (() => {
    const rg = document.getElementById('p10rgN'); if (!rg) return;
    const barS = document.getElementById('p10barS'), barF = document.getElementById('p10barF');
    const num = v => v.toLocaleString('en-US');
    function upd() {
      const n = Number(rg.value), vals = Array.from({ length: n }, (_, k) => k);
      const s = slowCount(build(vals)).hops, f = revCount(build(vals)).hops;
      setVal('p10roN', n); setVal('p10roS', num(s)); setVal('p10roF', num(f)); setVal('p10roR', (s / f).toFixed(1) + 'x');
      if (barS) barS.style.width = '100%';
      if (barF) barF.style.width = Math.max(0.4, 100 * f / s) + '%';
    }
    rg.addEventListener('input', upd); upd();
  })();

  /* ---------- Sandbox ---------- */
  (() => {
    const inp = document.getElementById('s10In'), posIn = document.getElementById('s10Pos'), err = document.getElementById('s10Err'), out = document.getElementById('s10Out'), tpEl = document.getElementById('s10Tp');
    if (!inp || !tpEl) return;
    const player = TracePlayer(tpEl, null, {});
    let mode = 'reverse';
    function parse() {
      const parts = inp.value.split(',').map(t => t.trim());
      if (parts.length && parts[parts.length - 1] === '') parts.pop();
      if (!parts.length) throw new Error('Type at least one value, for example: 1, 2, 3');
      if (parts.length > 7) throw new Error(`That is ${parts.length} nodes. Please use 7 or fewer so the arrows stay readable.`);
      const vals = parts.map((t, k) => {
        if (!/^-?\d{1,3}$/.test(t)) throw new Error(`Node ${k + 1} ("${t || 'empty'}") is not a whole number from -999 to 999.`);
        return Number(t);
      });
      const ps = posIn.value.trim();
      let pos = -1;
      if (ps !== '') {
        if (!/^-?\d+$/.test(ps)) throw new Error('pos must be a whole number: -1 for no loop, or the index the tail links back to.');
        pos = Number(ps);
        if (pos < -1 || pos >= vals.length) throw new Error(`pos must be -1 (no loop) or between 0 and ${vals.length - 1} for ${vals.length} nodes.`);
      }
      if (pos >= 0 && mode !== 'cycle') throw new Error('A list with a loop has no end, so it cannot be reversed or halved. Set pos to -1, or press "Detect a loop".');
      return { vals, pos };
    }
    function run() {
      let a;
      try { a = parse(); } catch (e) { err.textContent = e.message; out.innerHTML = ''; return; }
      err.textContent = '';
      const { vals, pos } = a;
      if (mode === 'reverse') {
        const r = revFrames(vals), s = slowCount(build(vals));
        player.load({ code: REV_CODE, frames: r.frames });
        out.innerHTML = `<span class="rk">reversed:</span> <span class="rv">[${r.res.join(', ')}]</span><br><span class="rk">pattern hops:</span> <span class="rv">${r.hops}</span><br><span class="rk">walk-to-the-tail hops:</span> <span class="rv-o">${s.hops}</span>`;
      } else if (mode === 'middle') {
        const m = midFrames(vals);
        player.load({ code: MID_CODE, frames: m.frames });
        out.innerHTML = `<span class="rk">middle node:</span> <span class="rv">${m.res}</span><br><span class="rk">loop rounds:</span> <span class="rv">${m.rounds}</span><br><span class="rk">nodes:</span> <span class="rv">${vals.length}</span>`;
      } else {
        const c = cycFrames(vals, pos);
        player.load({ code: CYC_CODE, frames: c.frames });
        out.innerHTML = `<span class="rk">loop found:</span> <span class="rv">${c.found ? 'True' : 'False'}</span><br><span class="rk">loop rounds:</span> <span class="rv">${c.rounds}</span>` +
          (c.found ? `<br><span class="rk">they meet at value:</span> <span class="rv">${c.meet}</span><br><span class="rk">loop starts at value:</span> <span class="rv-o">${cycleStart(vals, pos)}</span>` : '');
      }
    }
    document.querySelectorAll('[data-s10mode]').forEach(btn => btn.addEventListener('click', () => { mode = btn.dataset.s10mode; run(); }));
    document.querySelectorAll('[data-s10ex]').forEach(btn => btn.addEventListener('click', () => { inp.value = btn.dataset.s10ex; posIn.value = btn.dataset.s10pos; mode = btn.dataset.s10m; run(); }));
    [inp, posIn].forEach(x => x.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); run(); } }));
    run();
  })();
})();
