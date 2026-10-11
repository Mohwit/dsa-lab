// ======== SLOT 14: PATTERN LESSON, TRIES ========
(() => {
  const CAP = 60;
  const AUTO_CODE = `def autocomplete(trie, p):
    node = trie._walk(p)
    if node is None:
        return []
    out = []
    collect(node, p, out)
    return out`;
  const SCAN_CODE = `def starts_scan(words, p):
    out = []
    for w in words:
        if w[:len(p)] == p:
            out.append(w)
    return out`;
  const INSERT_CODE = `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

def insert(root, word):
    node = root
    for ch in word:
        if ch not in node.children:
            node.children[ch] = TrieNode()
        node = node.children[ch]
    node.is_end = True`;
  const SEARCH_CODE = `def _walk(self, s):
    node = self.root
    for ch in s:
        if ch not in node.children: return None
        node = node.children[ch]
    return node

def search(self, word):
    node = self._walk(word)
    return node is not None and node.is_end

def starts_with(self, prefix):
    return self._walk(prefix) is not None`;
  const WILD_CODE = `def search(self, word):
    def dfs(node, i):
        if i == len(word): return node.is_end
        ch = word[i]
        if ch == '.':
            for child in node.children.values():
                if dfs(child, i + 1): return True
            return False
        if ch not in node.children: return False
        return dfs(node.children[ch], i + 1)
    return dfs(self.root, 0)`;

  /* ---------- the trie (children in insertion order, like a Python dict) ---------- */
  const newNode = (prefix, ch, depth) => ({ id: 'n' + prefix, prefix, ch, depth, children: new Map(), end: false });
  function makeTrie() { return { root: newNode('', '^', 0), nodes: 0, letters: 0 }; }
  function insert(T, w) {
    let node = T.root;
    for (const ch of w) { T.letters++; if (!node.children.has(ch)) { node.children.set(ch, newNode(node.prefix + ch, ch, node.depth + 1)); T.nodes++; } node = node.children.get(ch); }
    node.end = true;
  }
  const build = words => { const T = makeTrie(); words.forEach(w => insert(T, w)); return T; };
  function walk(T, s) { let node = T.root, steps = 0; for (const ch of s) { steps++; if (!node.children.has(ch)) return { node: null, steps }; node = node.children.get(ch); } return { node, steps }; }
  function autocomplete(T, p) {
    const w = walk(T, p), out = []; let collect = 0;
    if (!w.node) return { out, walk: w.steps, collect };
    (function dfs(n, path) { if (n.end) out.push(path); n.children.forEach((c, ch) => { collect++; dfs(c, path + ch); }); })(w.node, p);
    return { out, walk: w.steps, collect };
  }
  function scan(words, p) {
    const out = []; let comps = 0;
    for (const w of words) { let ok = true; for (let k = 0; k < p.length; k++) { if (k >= w.length) { ok = false; break; } comps++; if (w[k] !== p[k]) { ok = false; break; } } if (ok) out.push(w); }
    return { out, comps };
  }
  function genWords(n, seed = 42) {
    const out = []; let s = seed;
    for (let t = 0; t < n; t++) { s = s * 48271 % 2147483647; const len = 3 + s % 4; let w = ''; for (let k = 0; k < len; k++) { s = s * 48271 % 2147483647; w += 'abcdefgh'[s % 8]; } out.push(w); }
    return out;
  }

  /* ---------- drawing: leaves spread evenly, parents centred over their children ---------- */
  function graph(T, state, hl, name) {
    const all = [], leaves = [];
    (function dfs(n) { all.push(n); if (!n.children.size) leaves.push(n); n.children.forEach(dfs); })(T.root);
    const x = {}, maxD = Math.max(1, ...all.map(n => n.depth));
    leaves.forEach((n, k) => { x[n.id] = leaves.length === 1 ? 0.5 : k / (leaves.length - 1); });
    (function place(n) { if (!n.children.size) return x[n.id]; let s = 0; n.children.forEach(c => { s += place(c); }); return (x[n.id] = s / n.children.size); })(T.root);
    const gap = Math.min(0.17, 1 / maxD), off = (1 - maxD * gap) / 2, st = {}, edges = [];
    all.forEach(n => { if (n.end) st[n.id] = 'visited'; n.children.forEach(c => edges.push([n.id, c.id])); });
    return { type: 'graph', name: name || 'trie (^ is the root, blue fill = a word ends here)', nodes: all.map(n => ({ id: n.id, label: n.ch, x: x[n.id], y: off + n.depth * gap })), edges, state: Object.assign(st, state || {}), hl: hl || [] };
  }
  const pathOf = (T, s) => { const ids = [T.root.id], hl = []; let n = T.root; for (const ch of s) { const c = n.children.get(ch); if (!c) break; hl.push([n.id, c.id]); ids.push(c.id); n = c; } return { ids, hl }; };
  const ring = (ids, cur) => { const st = {}; ids.forEach(id => { st[id] = 'frontier'; }); if (cur) st[cur] = 'current'; return st; };

  /* ---------- traces ---------- */
  function autoFrames(T, p) {
    const L = s => lineOf(AUTO_CODE, s), frames = [], r = autocomplete(T, p);
    let n = T.root, steps = 0;
    frames.push({ line: L('node = trie._walk(p)'), note: `Start at the root. Walk "${p}" one letter at a time.`, views: [graph(T, { [T.root.id]: 'current' }), { type: 'vars', values: { prefix: p, 'walk steps': 0, 'collect steps': 0 } }] });
    for (let k = 0; k < p.length; k++) {
      steps++;
      const c = n.children.get(p[k]), path = pathOf(T, p.slice(0, k));
      if (!c) {
        frames.push({ line: L('return []'), note: `Step ${steps}: is there a child "${p[k]}" under "${p.slice(0, k) || 'the root'}"? No. No word starts with "${p}", so stop.`, result: [], views: [graph(T, ring(path.ids, path.ids[path.ids.length - 1]), path.hl), { type: 'vars', values: { prefix: p, 'walk steps': steps, 'collect steps': 0 } }] });
        return { r, frames };
      }
      n = c;
      const path2 = pathOf(T, p.slice(0, k + 1));
      frames.push({ line: L('node = trie._walk(p)'), note: `Step ${steps}: follow "${p[k]}". One dict lookup, no matter how many words there are.`, views: [graph(T, ring(path2.ids, c.id), path2.hl), { type: 'vars', values: { prefix: p, 'walk steps': steps, 'collect steps': 0 } }] });
    }
    const base = pathOf(T, p), below = [], found = [];
    let col = 0;
    (function dfs(node, path) {
      if (node.end) found.push(path);
      node.children.forEach((c, ch) => {
        col++; below.push(c.id);
        const st = ring(base.ids.concat(below), c.id);
        if (frames.length < CAP) frames.push({ line: L('collect(node, p, out)'), note: `Collect: visit "${path + ch}".${c.end ? ` A word ends here: ${path + ch}.` : ''}`, views: [graph(T, st, base.hl), { type: 'set', name: 'out', values: found.concat(c.end ? [path + ch] : []), new: c.end ? path + ch : undefined }, { type: 'vars', values: { prefix: p, 'walk steps': steps, 'collect steps': col } }] });
        dfs(c, path + ch);
      });
    })(n, p);
    frames.push({ line: L('return out'), note: `${r.out.length} word${r.out.length === 1 ? '' : 's'} found with ${r.walk} walk steps and ${r.collect} collect steps: ${r.walk + r.collect} in all.`, result: r.out, views: [graph(T, ring(base.ids.concat(below)), base.hl), { type: 'set', name: 'out', values: r.out }, { type: 'vars', values: { prefix: p, 'walk steps': r.walk, 'collect steps': r.collect } }] });
    return { r, frames };
  }
  function scanFrames(words, p) {
    const L = s => lineOf(SCAN_CODE, s), frames = [], out = [];
    let comps = 0;
    frames.push({ line: L('out = []'), note: `Read all ${words.length} words, comparing each with "${p}" letter by letter.`, views: [{ type: 'array', name: 'words', values: words }, { type: 'vars', values: { comparisons: 0, matches: 0 } }] });
    words.forEach((w, i) => {
      let k = 0, ok = true, here = 0;
      for (; k < p.length; k++) { if (k >= w.length) { ok = false; break; } comps++; here++; if (w[k] !== p[k]) { ok = false; break; } }
      if (ok) out.push(w);
      const why = ok ? `all ${here} letters match, keep it.` : k >= w.length ? `the word runs out after ${here} letters.` : `letter ${k + 1} differs ("${w[k]}" vs "${p[k]}") after ${here} comparison${here > 1 ? 's' : ''}.`;
      frames.push({ line: L(ok ? 'out.append(w)' : 'if w[:len(p)] == p'), note: `"${w}": ${why}`, views: [{ type: 'array', name: 'words', values: words, pointers: { w: i }, hl: ok ? [i] : [], bad: ok ? [] : [i] }, { type: 'vars', values: { comparisons: comps, matches: out.length } }] });
    });
    frames.push({ line: L('return out'), note: `Every word was read: ${comps} comparisons for ${out.length} matches.`, result: out, views: [{ type: 'array', name: 'words', values: words, hl: words.map((w, i) => out.includes(w) ? i : -1).filter(i => i >= 0) }, { type: 'vars', values: { comparisons: comps, matches: out.length } }] });
    return { comps, frames };
  }
  function insertFrames(words) {
    const L = s => lineOf(INSERT_CODE, s), frames = [], T = makeTrie();
    let more = 0;
    const push = f => { if (frames.length < CAP) frames.push(f); else more++; };
    const vars = (w, ch) => ({ type: 'vars', values: { word: w, ch: ch || '-', 'letters inserted': T.letters, 'nodes created': T.nodes } });
    push({ line: L('self.children = {}'), note: 'An empty trie: just the root.', views: [graph(T, { [T.root.id]: 'current' }), vars('-')] });
    words.forEach(w => {
      push({ line: L('node = root'), note: `Insert "${w}": start at the root.`, views: [graph(T, { [T.root.id]: 'current' }), vars(w)] });
      let node = T.root;
      for (const ch of w) {
        T.letters++;
        const fresh = !node.children.has(ch);
        if (fresh) { node.children.set(ch, newNode(node.prefix + ch, ch, node.depth + 1)); T.nodes++; }
        node = node.children.get(ch);
        const p = pathOf(T, node.prefix);
        push({ line: L(fresh ? 'node.children[ch] = TrieNode()' : 'node = node.children[ch]'), note: fresh ? `No "${ch}" under "${node.prefix.slice(0, -1) || 'the root'}" yet: create a node.` : `"${node.prefix}" already exists (an earlier word made it). Just step down: no new node.`, views: [graph(T, ring(p.ids, node.id), p.hl), vars(w, ch)] });
      }
      node.end = true;
      const p = pathOf(T, w);
      push({ line: L('node.is_end = True'), note: `Mark "${w}" as a word: its last node turns blue.`, views: [graph(T, ring(p.ids.slice(0, -1)), p.hl), vars(w)] });
    });
    if (more) frames.push({ line: L('node.is_end = True'), note: `... ${more} more steps, same rule: step down, create only what is missing, mark the end.`, views: [graph(T, {}), vars('-')] });
    frames.push({ line: L('node.is_end = True'), note: `Done: ${T.letters} letters made ${T.nodes} nodes. Shared starts were stored once.`, result: `${T.nodes} nodes`, views: [graph(T, {}), vars('-')] });
    return { T, frames };
  }
  function searchFrames(T, s, kind) {
    const L = t => lineOf(SEARCH_CODE, t), frames = [];
    let node = T.root, steps = 0;
    frames.push({ line: L(kind === 'search' ? 'node = self._walk(word)' : 'return self._walk(prefix) is not None'), note: `${kind === 'search' ? 'search' : 'starts_with'}("${s}"): walk from the root.`, views: [graph(T, { [T.root.id]: 'current' }), { type: 'vars', values: { s, steps: 0 } }] });
    for (const ch of s) {
      steps++;
      const c = node.children.get(ch), p = pathOf(T, node.prefix);
      if (!c) {
        const res = false;
        frames.push({ line: L('if ch not in node.children: return None'), note: `No "${ch}" under "${node.prefix || 'the root'}": the walk returns None.`, views: [graph(T, ring(p.ids, node.id), p.hl), { type: 'vars', values: { s, steps } }] });
        frames.push({ line: L(kind === 'search' ? 'return node is not None and node.is_end' : 'return self._walk(prefix) is not None'), note: `No path, so the answer is False after ${steps} step${steps > 1 ? 's' : ''}.`, result: res, views: [graph(T, ring(p.ids), p.hl), { type: 'vars', values: { s, steps } }] });
        return { res, steps, frames };
      }
      node = c;
      const p2 = pathOf(T, node.prefix);
      frames.push({ line: L('node = node.children[ch]'), note: `Step ${steps}: follow "${ch}".`, views: [graph(T, ring(p2.ids, node.id), p2.hl), { type: 'vars', values: { s, steps } }] });
    }
    const p = pathOf(T, s), res = kind === 'search' ? node.end : true;
    const why = kind === 'search' ? (node.end ? `The path exists and a word ends at "${s}": True.` : `The path exists, but no word ends at "${s}" (not blue): False.`) : `The path exists, so some word starts with "${s}": True.`;
    frames.push({ line: L(kind === 'search' ? 'return node is not None and node.is_end' : 'return self._walk(prefix) is not None'), note: why, result: res, views: [graph(T, ring(p.ids, node.id), p.hl), { type: 'vars', values: { s, steps, is_end: node.end } }] });
    return { res, steps, frames };
  }
  function wildFrames(T, word) {
    const L = s => lineOf(WILD_CODE, s), frames = [], stack = [];
    let calls = 0, more = 0;
    const push = (line, note, node, f) => {
      if (frames.length >= CAP) { more++; return; }
      const p = pathOf(T, node.prefix);
      frames.push(Object.assign({ line: L(line), note, views: [graph(T, ring(p.ids, node.id), p.hl), { type: 'stack', name: 'call stack', values: stack.slice() }, { type: 'vars', values: { pattern: word, calls } }] }, f));
    };
    function dfs(node, i) {
      calls++; stack.push(`dfs("${node.prefix || '^'}", ${i})`);
      let r;
      if (i === word.length) { r = node.end; push('if i == len(word): return node.is_end', `Call ${calls}: all ${word.length} letters used at "${node.prefix}". ${r ? 'A word ends here: True.' : 'No word ends here: False.'}`, node); }
      else if (word[i] === '.') {
        push("if ch == '.':", `Call ${calls}: a dot at position ${i}. Try every child of "${node.prefix || 'the root'}": ${[...node.children.keys()].join(', ') || 'none'}.`, node);
        r = false;
        for (const c of node.children.values()) { if (dfs(c, i + 1)) { r = true; break; } }
        if (!r) push('return False', `Every child of "${node.prefix || 'the root'}" failed. Back out with False.`, node);
      } else if (!node.children.has(word[i])) { r = false; push('if ch not in node.children: return False', `Call ${calls}: need "${word[i]}" under "${node.prefix || 'the root'}". It is not there: dead end, False.`, node); }
      else { push('return dfs(node.children[ch], i + 1)', `Call ${calls}: "${word[i]}" is a plain letter. Follow it.`, node); r = dfs(node.children.get(word[i]), i + 1); }
      stack.pop();
      return r;
    }
    const res = dfs(T.root, 0);
    if (more) frames.push({ line: L('return dfs(self.root, 0)'), note: `... ${more} more steps, same rule.`, views: [graph(T, {})] });
    frames.push({ line: L('return dfs(self.root, 0)'), note: `${res ? 'Found a match' : 'No word matches'} after ${calls} calls.`, result: res, views: [graph(T, {}), { type: 'vars', values: { pattern: word, calls } }] });
    return { res, calls, frames };
  }

  const setVal = (id, v) => { const el = document.getElementById(id); if (!el) return; el.querySelector('.val').textContent = v; flash(el); };
  const $ = id => document.getElementById(id);
  const WORDS = ['cat', 'car', 'card', 'care', 'cart', 'dog', 'dot', 'door', 'deer', 'can'];
  const BIG = build(WORDS);

  /* ---------- Section 1: side by side, playground, race ---------- */
  (() => {
    const a = autoFrames(BIG, 'car'), b = scanFrames(WORDS, 'car');
    if ($('p14tpA')) TracePlayer($('p14tpA'), { code: AUTO_CODE, frames: a.frames }, { code: false });
    if ($('p14tpB')) TracePlayer($('p14tpB'), { code: SCAN_CODE, frames: b.frames }, { code: false });
    setVal('p14roA', a.r.walk + a.r.collect); setVal('p14roB', b.comps);
  })();
  (() => {
    const inp = $('p14Pre'), el = $('p14tpP'), err = $('p14PreErr'); if (!inp || !el) return;
    const tp = TracePlayer(el, null, { code: false });
    function run() {
      const p = inp.value.trim().toLowerCase();
      if (!/^[a-z]{1,6}$/.test(p)) { err.textContent = 'Type 1 to 6 letters from a to z, like "ca".'; return; }
      err.textContent = '';
      const a = autoFrames(BIG, p), s = scan(WORDS, p);
      tp.load({ code: AUTO_CODE, frames: a.frames }); tp.go(a.frames.length - 1);
      setVal('p14roP1', a.r.out.length ? a.r.out.join(', ') : 'none');
      setVal('p14roP2', `${a.r.walk} + ${a.r.collect} = ${a.r.walk + a.r.collect}`);
      setVal('p14roP3', s.comps);
    }
    inp.addEventListener('input', run);
    document.querySelectorAll('[data-p14pre]').forEach(btn => btn.addEventListener('click', () => { inp.value = btn.dataset.p14pre; run(); }));
    run();
  })();
  (() => {
    const cv = $('p14cvA'); if (!cv) return;
    const active = () => $('lesson14').classList.contains('active');
    let n = 100, trie = 5, comps = 116, builds = 447, matches = 1, prog = 1, raf = 0;
    const cache = {};
    const measure = () => {
      if (!cache[n]) { const ws = genWords(n), T = build(ws), a = autocomplete(T, 'bad'); cache[n] = { trie: a.walk + a.collect, comps: scan(ws, 'bad').comps, builds: T.letters, matches: a.out.length }; }
      ({ trie, comps, builds, matches } = cache[n]);
    };
    const num = v => Math.round(v).toLocaleString('en-US');
    function draw() {
      if (!cv.clientWidth) return;
      const { ctx: c, w, h } = fit(cv, Math.max(0.26, 150 / cv.clientWidth));
      c.clearRect(0, 0, w, h);
      const pad = 12, track = w - 2 * pad, done = prog * comps;
      [{ label: 'trie walk + collect', total: trie, unit: 'steps', col: css('--teal'), y: h * 0.3 }, { label: 'read every word', total: comps, unit: 'comparisons', col: css('--orange'), y: h * 0.74 }].forEach(B => {
        const got = Math.min(B.total, done), fin = got >= B.total;
        text(c, B.label, pad, B.y - 16, css('--text-bright'), 12, 'left', 600);
        text(c, `${num(got)} ${B.unit}${fin ? ', done' : ''}`, w - pad, B.y - 16, B.col, 12, 'right', 700);
        c.fillStyle = css('--bg-input'); c.fillRect(pad, B.y, track, 12);
        c.fillStyle = B.col; c.fillRect(pad, B.y, Math.max(2, track * got / comps), 12);
      });
    }
    function show() { setVal('p14roN', `${num(n)}, ${matches}`); setVal('p14roT', num(trie)); setVal('p14roS', num(comps)); setVal('p14roBd', num(builds)); }
    function race() {
      cancelAnimationFrame(raf);
      if (RM) { prog = 1; draw(); return; }
      const t0 = performance.now(), dur = 2500;
      const tick = t => { prog = Math.min(1, (t - t0) / dur); draw(); if (prog < 1 && active()) raf = requestAnimationFrame(tick); else { prog = 1; draw(); } };
      prog = 0; raf = requestAnimationFrame(tick);
    }
    document.querySelectorAll('[data-p14n]').forEach(btn => btn.addEventListener('click', () => { cancelAnimationFrame(raf); n = Number(btn.dataset.p14n); measure(); prog = 1; show(); draw(); }));
    $('p14raceGo').addEventListener('click', race);
    window.addEventListener('resize', () => { if (active()) draw(); });
    window.addEventListener('themechange', () => { if (active()) draw(); });
    measure(); show(); draw();
  })();

  /* ---------- Section 4: templates ---------- */
  const SMALL = ['cat', 'car', 'card', 'care', 'dog'];
  (() => { const el = $('p14tpC'); if (el) TracePlayer(el, { code: INSERT_CODE, frames: insertFrames(SMALL).frames }); })();
  (() => {
    const el = $('p14tpD'); if (!el) return;
    const T = build(SMALL), tp = TracePlayer(el, { code: SEARCH_CODE, frames: searchFrames(T, 'car', 'search').frames });
    document.querySelectorAll('[data-p14q]').forEach(btn => btn.addEventListener('click', () => { const [k, s] = btn.dataset.p14q.split(':'); tp.load({ code: SEARCH_CODE, frames: searchFrames(T, s, k).frames }); }));
  })();
  (() => {
    const el = $('p14tpE'); if (!el) return;
    const T = build(['cat', 'cot', 'cut', 'cup', 'dog']), tp = TracePlayer(el, { code: WILD_CODE, frames: wildFrames(T, 'c.t').frames });
    document.querySelectorAll('[data-p14w]').forEach(btn => btn.addEventListener('click', () => tp.load({ code: WILD_CODE, frames: wildFrames(T, btn.dataset.p14w).frames })));
  })();

  /* ---------- Sandbox: your own trie ---------- */
  (() => {
    const wIn = $('s14Words'), qIn = $('s14Q'), err = $('s14Err'), out = $('s14Out'), tpEl = $('s14Tp');
    if (!wIn || !tpEl) return;
    const player = TracePlayer(tpEl, null, {});
    let mode = 'build';
    function parseWords(s) {
      const parts = s.split(',').map(t => t.trim().toLowerCase()).filter((t, k, a) => t !== '' || k < a.length - 1);
      if (!parts.length || (parts.length === 1 && !parts[0])) throw new Error('Type at least one word, for example: cat, car, dog');
      if (parts.length > 8) throw new Error(`That is ${parts.length} words. Please use 8 or fewer so the trie fits the picture.`);
      parts.forEach((w, k) => {
        if (!w) throw new Error(`Word ${k + 1} is empty. Check for two commas in a row.`);
        if (!/^[a-z]+$/.test(w)) throw new Error(`Word ${k + 1} ("${w}") has something other than the letters a to z.`);
        if (w.length > 6) throw new Error(`Word ${k + 1} ("${w}") has ${w.length} letters. Please keep words to 6 letters or fewer.`);
      });
      return parts;
    }
    function parseQuery(s, wild) {
      const q = s.trim().toLowerCase();
      if (!q) throw new Error('Type a word or prefix to look up in the query box.');
      if (q.length > 6) throw new Error(`The query has ${q.length} letters. Please keep it to 6 or fewer.`);
      if (wild ? !/^[a-z.]+$/.test(q) : !/^[a-z]+$/.test(q)) throw new Error(wild ? 'A wildcard query uses letters a to z and dots, like c.t' : `Use only the letters a to z here.${q.includes('.') ? ' Dots only work with "Wildcard search".' : ''}`);
      return q;
    }
    function run() {
      let words, q;
      try { words = parseWords(wIn.value); if (mode !== 'build') q = parseQuery(qIn.value, mode === 'wild'); } catch (e) { err.textContent = e.message; return; }
      err.textContent = '';
      const T = build(words);
      let info = '';
      if (mode === 'build') player.load({ code: INSERT_CODE, frames: insertFrames(words).frames });
      else if (mode === 'wild') { const r = wildFrames(T, q); player.load({ code: WILD_CODE, frames: r.frames }); info = `<span class="rk">wildcard "${q}":</span> <span class="rv">${r.res ? 'True' : 'False'}</span> <span class="rk">after</span> <span class="rv-o">${r.calls}</span> <span class="rk">dfs calls</span><br>`; }
      else {
        const r = searchFrames(T, q, mode), a = autocomplete(T, q), s = scan(words, q);
        player.load({ code: SEARCH_CODE, frames: r.frames });
        info = `<span class="rk">${mode === 'search' ? 'search' : 'starts_with'}("${q}"):</span> <span class="rv">${r.res ? 'True' : 'False'}</span> <span class="rk">in</span> <span class="rv">${r.steps}</span> <span class="rk">steps</span><br>` +
          `<span class="rk">words starting with "${q}":</span> <span class="rv">${a.out.length ? a.out.join(', ') : 'none'}</span><br>` +
          `<span class="rk">trie walk + collect:</span> <span class="rv">${a.walk} + ${a.collect}</span> <span class="rk">vs reading every word:</span> <span class="rv-o">${s.comps}</span><br>`;
      }
      out.innerHTML = info + `<span class="rk">words:</span> <span class="rv">${words.length}</span> <span class="rk">letters inserted:</span> <span class="rv">${T.letters}</span> <span class="rk">nodes:</span> <span class="rv">${T.nodes}</span>`;
    }
    const btns = { build: 's14Build', search: 's14Search', starts: 's14Starts', wild: 's14Wild' };
    const setMode = m => { mode = m; Object.entries(btns).forEach(([k, id]) => $(id).classList.toggle('btn-primary', k === m)); run(); };
    Object.entries(btns).forEach(([k, id]) => $(id).addEventListener('click', () => setMode(k)));
    document.querySelectorAll('[data-s14ex]').forEach(btn => btn.addEventListener('click', () => { const [w, q, m] = btn.dataset.s14ex.split('|'); wIn.value = w; qIn.value = q; setMode(m); }));
    [wIn, qIn].forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); run(); } }));
    run();
  })();
})();
