// ======== SLOT 7: PATTERN LESSON, STACK AND MONOTONIC STACK ========
(() => {
  const NG_CODE = `def next_greater(nums):
    answer = [-1] * len(nums)
    stack = []
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] < x:
            j = stack.pop()
            answer[j] = x
        stack.append(i)
    return answer`;
  const BRUTE_CODE = `def next_greater_brute(nums):
    n = len(nums)
    answer = [-1] * n
    for i in range(n):
        for j in range(i + 1, n):
            if nums[j] > nums[i]:
                answer[i] = nums[j]
                break
    return answer`;
  const BR_CODE = `def is_valid(s):
    pairs = {')': '(', ']': '[', '}': '{'}
    stack = []
    for ch in s:
        if ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
        else:
            stack.append(ch)
    return not stack`;
  const RPN_CODE = `OPS = {'+': lambda a, b: a + b, '-': lambda a, b: a - b,
       '*': lambda a, b: a * b, '/': lambda a, b: int(a / b)}

def eval_rpn(tokens):
    stack = []
    for t in tokens:
        if t in OPS:
            b = stack.pop()
            a = stack.pop()
            stack.append(OPS[t](a, b))
        else:
            stack.append(int(t))
    return stack[0]`;
  const MIN_CODE = `class MinStack:
    def __init__(self):
        self.stack = []

    def push(self, x):
        low = min(x, self.stack[-1][1]) if self.stack else x
        self.stack.append((x, low))

    def pop(self):
        self.stack.pop()

    def get_min(self):
        return self.stack[-1][1]`;
  const CAP = 60;
  const PAIRS = { ')': '(', ']': '[', '}': '{' };

  // Counters with the same rules as measure.py.
  function ngCount(nums) {
    const st = []; let comps = 0, pushes = 0, pops = 0;
    nums.forEach((x, i) => {
      while (st.length) { comps++; if (!(nums[st[st.length - 1]] < x)) break; st.pop(); pops++; }
      st.push(i); pushes++;
    });
    return { comps, pushes, pops };
  }
  function bruteCount(nums) {
    let comps = 0;
    for (let i = 0; i < nums.length; i++) for (let j = i + 1; j < nums.length; j++) { comps++; if (nums[j] > nums[i]) break; }
    return comps;
  }
  const others = (n, keep) => Array.from({ length: n }, (_, k) => k).filter(k => !keep(k));

  // Trace of the monotonic stack.
  function ngFrames(nums) {
    const L = s => lineOf(NG_CODE, s), frames = [], st = [], answer = nums.map(() => -1), done = new Set();
    let comps = 0, pops = 0, pushes = 0, cut = 0;
    const views = (i, extra = {}) => [
      Object.assign({ type: 'array', name: 'nums (heights)', values: nums, pointers: i === undefined ? {} : { i }, hl: i === undefined ? [] : [i], dim: [...done] }, extra),
      { type: 'stack', name: 'stack (index: height)', values: st.map(j => `${j}: ${nums[j]}`) },
      { type: 'array', name: 'answer', values: answer.slice() },
      { type: 'vars', values: { comparisons: comps, pops } }
    ];
    const push = f => { if (frames.length < CAP) frames.push(f); else cut++; };
    push({ line: L('stack = []'), note: 'Nobody has an answer yet. The stack will hold the people who are still waiting for someone taller.', views: views() });
    nums.forEach((x, i) => {
      for (;;) {
        if (!st.length) break;
        comps++;
        const j = st[st.length - 1], taller = nums[j] < x;
        push({ line: L('while stack and'), note: `Comparison ${comps}: the top of the stack is index ${j} (height ${nums[j]}). Is ${nums[j]} &lt; ${x}? ${taller ? 'Yes, so index ' + j + ' has found its answer.' : 'No, so everyone below it is taller too. Stop popping.'}`, views: views(i, { pointers: { i, top: j } }) });
        if (!taller) break;
        st.pop(); pops++; answer[j] = x; done.add(j);
        push({ line: L('answer[j] = x'), note: `Pop index ${j}: its first taller person to the right is ${x}. It leaves the stack for good.`, views: views(i) });
      }
      st.push(i); pushes++;
      push({ line: L('stack.append(i)'), note: `Push index ${i} (height ${x}). The stack still falls from bottom to top.`, views: views(i) });
    });
    if (cut) frames.push({ line: L('stack.append(i)'), note: `... ${cut} more steps, same rule: pop every shorter top, then push.`, views: views() });
    frames.push({ line: L('return answer'), note: `Done after ${comps} comparisons. ${st.length ? 'Indices ' + st.join(', ') + ' are still on the stack: nobody taller came, so they keep -1.' : 'The stack is empty.'}`, result: JSON.stringify(answer).replace(/,/g, ', '), views: views() });
    return { answer, comps, pushes, pops, frames };
  }

  // Trace of the nested scan.
  function bruteFrames(nums) {
    const L = s => lineOf(BRUTE_CODE, s), frames = [], n = nums.length, answer = nums.map(() => -1);
    let comps = 0, cut = 0;
    const views = (ptr, hl) => [
      { type: 'array', name: 'nums (heights)', values: nums, pointers: ptr, hl },
      { type: 'array', name: 'answer', values: answer.slice() },
      { type: 'vars', values: { comparisons: comps } }
    ];
    const push = f => { if (frames.length < CAP) frames.push(f); else cut++; };
    push({ line: L('answer = [-1] * n'), note: 'For each person, look right one by one until someone taller shows up.', views: views({}, []) });
    for (let i = 0; i < n; i++) {
      let found = false;
      if (i === n - 1) push({ line: L('for j in range(i + 1, n)'), note: `Index ${i} is last in line: nobody to check, it keeps -1.`, views: views({ i }, [i]) });
      for (let j = i + 1; j < n; j++) {
        comps++;
        const t = nums[j] > nums[i];
        push({ line: L('if nums[j] > nums[i]'), note: `Comparison ${comps}: is ${nums[j]} &gt; ${nums[i]}? ${t ? 'Yes.' : 'No, keep walking.'}`, views: views({ i, j }, [i, j]) });
        if (t) { answer[i] = nums[j]; found = true; push({ line: L('answer[i] = nums[j]'), note: `Index ${i} gets ${nums[j]}. Next person starts a fresh walk.`, views: views({ i, j }, [j]) }); break; }
      }
      if (!found && i < n - 1) push({ line: L('for j in range(i + 1, n)'), note: `Nobody to the right of index ${i} is taller: it keeps -1.`, views: views({ i }, [i]) });
    }
    if (cut) frames.push({ line: L('if nums[j] > nums[i]'), note: `... ${cut} more steps, same rule: walk right until someone taller.`, views: views({}, []) });
    frames.push({ line: L('return answer'), note: `Done after ${comps} comparisons.`, result: JSON.stringify(answer).replace(/,/g, ', '), views: views({}, []) });
    return { answer, comps, frames };
  }

  // Trace of the bracket check.
  function brFrames(s) {
    const L = t => lineOf(BR_CODE, t), frames = [], st = [], chars = s.split('');
    let steps = 0, cut = 0;
    const views = (i, bad) => [
      { type: 'array', name: 's', values: chars, pointers: i === undefined ? {} : { ch: i }, hl: i === undefined ? [] : [i], bad: bad || [], dim: i === undefined ? [] : others(chars.length, k => k >= i) },
      { type: 'stack', name: 'stack (open brackets waiting)', values: st.slice() },
      { type: 'vars', values: { steps } }
    ];
    const push = f => { if (frames.length < CAP) frames.push(f); else cut++; };
    push({ line: L('stack = []'), note: 'Openers go on the stack. Each closer must match the opener on top.', views: views() });
    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i]; steps++;
      if (PAIRS[ch]) {
        if (!st.length) {
          push({ line: L('return False'), note: `Step ${steps}: "${ch}" closes, but the stack is empty. Nothing to match, so the string is not valid.`, result: 'False', views: views(i, [i]) });
          return { valid: false, steps, frames };
        }
        const top = st.pop();
        if (top !== PAIRS[ch]) {
          push({ line: L('return False'), note: `Step ${steps}: "${ch}" needs "${PAIRS[ch]}" on top, but the top was "${top}". Wrong order, so not valid.`, result: 'False', views: views(i, [i]) });
          return { valid: false, steps, frames };
        }
        push({ line: L('if not stack or stack.pop()'), note: `Step ${steps}: "${ch}" matches the "${top}" on top. Pop it.`, views: views(i) });
      } else {
        st.push(ch);
        push({ line: L('stack.append(ch)'), note: `Step ${steps}: "${ch}" opens. Push it and wait for its closer.`, views: views(i) });
      }
    }
    if (cut) frames.push({ line: L('for ch in s'), note: `... ${cut} more steps, same rule.`, views: views() });
    const ok = st.length === 0;
    frames.push({ line: L('return not stack'), note: ok ? `End of the string and the stack is empty: every opener was closed. ${steps} steps.` : `End of the string, but ${st.length} opener${st.length > 1 ? 's are' : ' is'} still waiting. Not valid.`, result: ok ? 'True' : 'False', views: views() });
    return { valid: ok, steps, frames };
  }

  // Trace of reverse Polish evaluation.
  function rpnFrames(tokens) {
    const L = t => lineOf(RPN_CODE, t), frames = [], st = [];
    const views = (i, extra) => [
      { type: 'array', name: 'tokens', values: tokens, pointers: i === undefined ? {} : { t: i }, hl: i === undefined ? [] : [i], dim: i === undefined ? [] : others(tokens.length, k => k >= i) },
      { type: 'stack', name: 'stack', values: st.slice() },
      { type: 'vars', values: extra || {} }
    ];
    frames.push({ line: L('stack = []'), note: 'Numbers wait on the stack. An operator takes the top two.', views: views() });
    tokens.forEach((t, i) => {
      if ('+-*/'.includes(t) && t.length === 1) {
        const b = st.pop(), a = st.pop();
        const r = t === '+' ? a + b : t === '-' ? a - b : t === '*' ? a * b : Math.trunc(a / b);
        frames.push({ line: L('a = stack.pop()'), note: `"${t}": pop b = ${b} first, then a = ${a}.`, views: views(i, { a, b }) });
        st.push(r);
        frames.push({ line: L('stack.append(OPS[t](a, b))'), note: `Push a ${t} b = ${a} ${t} ${b} = ${r}.`, views: views(i, { a, b, result: r }) });
      } else {
        st.push(Number(t));
        frames.push({ line: L('stack.append(int(t))'), note: `"${t}" is a number: push it.`, views: views(i) });
      }
    });
    frames.push({ line: L('return stack[0]'), note: 'One number is left: the value of the whole expression.', result: st[0], views: views() });
    return frames;
  }

  const setVal = (id, v) => { const el = document.getElementById(id); if (!el) return; el.querySelector('.val').textContent = v; flash(el); };
  const num = v => Math.round(v).toLocaleString('en-US');

  /* ---------- Section 1: slow vs stack ---------- */
  (() => {
    const pic = [6, 2, 5, 1, 3, 4, 0, 8];
    const a = ngFrames(pic), b = bruteFrames(pic);
    const elA = document.getElementById('p7tpA'), elB = document.getElementById('p7tpB');
    if (elB) TracePlayer(elB, { frames: b.frames }, { code: false });
    if (elA) TracePlayer(elA, { frames: a.frames }, { code: false });
    setVal('p7roA', a.comps); setVal('p7roB', b.comps); setVal('p7roC', `${a.pushes} / ${a.pops}`);
  })();

  /* ---------- Section 1b: the operation race ---------- */
  (() => {
    const cv = document.getElementById('p7cvA'); if (!cv) return;
    const active = () => document.getElementById('lesson7').classList.contains('active');
    const minstd = (n, seed = 7) => { const out = []; let s = seed; for (let k = 0; k < n; k++) { s = s * 48271 % 2147483647; out.push(s % 100); } return out; };
    const fall = n => { const out = []; for (let v = n - 1; v >= 1; v--) out.push(v); out.push(n); return out; };
    let n = 10, shape = 'fall', st = null, br = 0, prog = 1, raf = 0;
    const measure = () => { const nums = shape === 'fall' ? fall(n) : minstd(n); st = ngCount(nums); br = bruteCount(nums); };
    function draw() {
      if (!cv.clientWidth) return;
      const { ctx: c, w, h } = fit(cv, Math.max(0.26, 150 / cv.clientWidth));
      c.clearRect(0, 0, w, h);
      const pad = 12, track = w - 2 * pad, top = Math.max(br, st.comps), done = prog * top;
      [{ label: 'monotonic stack', total: st.comps, col: css('--teal'), y: h * 0.3 }, { label: 'nested scan', total: br, col: css('--orange'), y: h * 0.74 }].forEach(Ln => {
        const got = Math.min(Ln.total, done), fin = got >= Ln.total;
        text(c, Ln.label, pad, Ln.y - 16, css('--text-bright'), 12, 'left', 600);
        text(c, `${num(got)} comparisons${fin ? ', done' : ''}`, w - pad, Ln.y - 16, Ln.col, 12, 'right', 700);
        c.fillStyle = css('--bg-input'); c.fillRect(pad, Ln.y, track, 12);
        c.fillStyle = Ln.col; c.fillRect(pad, Ln.y, Math.max(2, track * got / top), 12);
      });
    }
    function show() { setVal('p7roN', n); setVal('p7roS', num(st.comps)); setVal('p7roP', num(br)); setVal('p7roR', (br / st.comps).toFixed(1) + 'x'); setVal('p7roU', `${num(st.pushes)} / ${num(st.pops)}`); }
    function race() {
      cancelAnimationFrame(raf);
      if (RM) { prog = 1; draw(); return; }
      const t0 = performance.now(), dur = 2500;
      const tick = t => { prog = Math.min(1, (t - t0) / dur); draw(); if (prog < 1 && active()) raf = requestAnimationFrame(tick); else { prog = 1; draw(); } };
      prog = 0; raf = requestAnimationFrame(tick);
    }
    const mark = (attr, val) => document.querySelectorAll(`[${attr}]`).forEach(b => b.classList.toggle('primary', b.getAttribute(attr) === String(val)));
    document.querySelectorAll('[data-p7n]').forEach(btn => btn.addEventListener('click', () => { cancelAnimationFrame(raf); n = Number(btn.dataset.p7n); mark('data-p7n', n); measure(); prog = 1; show(); draw(); }));
    document.querySelectorAll('[data-p7shape]').forEach(btn => btn.addEventListener('click', () => { cancelAnimationFrame(raf); shape = btn.dataset.p7shape; mark('data-p7shape', shape); measure(); prog = 1; show(); draw(); }));
    document.getElementById('p7raceGo').addEventListener('click', race);
    window.addEventListener('resize', () => { if (active()) draw(); });
    window.addEventListener('themechange', () => { if (active()) draw(); });
    measure(); show(); draw(); mark('data-p7n', n); mark('data-p7shape', shape);
  })();

  /* ---------- Template A: brackets, with example buttons ---------- */
  (() => {
    const el = document.getElementById('p7tpBr'); if (!el) return;
    const player = TracePlayer(el, { code: BR_CODE, frames: brFrames('([]{})').frames });
    document.querySelectorAll('[data-p7br]').forEach(b => b.addEventListener('click', () => player.load({ code: BR_CODE, frames: brFrames(b.dataset.p7br).frames })));
  })();

  /* ---------- Template B: monotonic stack, with code ---------- */
  (() => {
    const el = document.getElementById('p7tpNg'); if (!el) return;
    const player = TracePlayer(el, { code: NG_CODE, frames: ngFrames([4, 4, 4, 5]).frames });
    document.querySelectorAll('[data-p7ng]').forEach(b => b.addEventListener('click', () => player.load({ code: NG_CODE, frames: ngFrames(b.dataset.p7ng.split(',').map(Number)).frames })));
  })();

  /* ---------- Template C: reverse Polish ---------- */
  (() => {
    const el = document.getElementById('p7tpRpn'); if (!el) return;
    TracePlayer(el, { code: RPN_CODE, frames: rpnFrames(['5', '1', '2', '+', '4', '*', '+', '3', '-']) });
  })();

  /* ---------- Template D: min stack playground ---------- */
  (() => {
    const el = document.getElementById('p7tpMin'), inp = document.getElementById('p7minIn'), err = document.getElementById('p7minErr');
    if (!el || !inp) return;
    const L = t => lineOf(MIN_CODE, t);
    let st = [], frames = [];
    const views = (extra) => [{ type: 'stack', name: 'self.stack (value, smallest so far)', values: st.map(([v, m]) => `(${v}, ${m})`) }, { type: 'vars', values: Object.assign({ size: st.length, min: st.length ? st[st.length - 1][1] : '-' }, extra || {}) }];
    const player = TracePlayer(el, null);
    const add = f => { frames.push(f); if (frames.length > 80) frames.shift(); player.load({ code: MIN_CODE, frames }); player.go(frames.length - 1); };
    function push(x) {
      const low = st.length ? Math.min(x, st[st.length - 1][1]) : x;
      st.push([x, low]);
      add({ line: L('self.stack.append((x, low))'), note: `push(${x}): the smallest so far is min(${x}, previous min) = ${low}. Store the pair (${x}, ${low}).`, views: views({ x }) });
    }
    function pop() {
      if (!st.length) { add({ line: L('self.stack.pop()'), note: 'pop() on an empty stack: Python would raise IndexError. Real problems promise this never happens.', views: views() }); return; }
      const [v] = st.pop();
      add({ line: L('self.stack.pop()'), note: `pop() removes ${v}. The pair below already knows its own minimum, so nothing needs recomputing: min is now ${st.length ? st[st.length - 1][1] : 'undefined (empty)'}.`, views: views() });
    }
    function getMin() {
      if (!st.length) { add({ line: L('return self.stack[-1][1]'), note: 'get_min() on an empty stack would raise IndexError.', views: views() }); return; }
      add({ line: L('return self.stack[-1][1]'), note: `get_min() reads the top pair: ${st[st.length - 1][1]}. One look, O(1), no scan.`, views: views() });
    }
    function reset() { st = []; frames = []; add({ line: L('self.stack = []'), note: 'An empty min stack.', views: views() }); }
    reset(); [5, 3, 7, 2].forEach(push);
    document.getElementById('p7minPush').addEventListener('click', () => {
      const t = inp.value.trim();
      if (!/^-?\d{1,6}$/.test(t)) { err.textContent = `"${t || 'empty'}" is not a whole number. Type something like 4 or -2.`; return; }
      err.textContent = ''; push(Number(t));
    });
    document.getElementById('p7minPop').addEventListener('click', () => { err.textContent = ''; pop(); });
    document.getElementById('p7minGet').addEventListener('click', () => { err.textContent = ''; getMin(); });
    document.getElementById('p7minReset').addEventListener('click', () => { err.textContent = ''; reset(); });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('p7minPush').click(); } });
  })();

  /* ---------- Sandbox ---------- */
  (() => {
    const inp = document.getElementById('s7In'), err = document.getElementById('s7Err'), out = document.getElementById('s7Out'), tpEl = document.getElementById('s7Tp'), lab = document.getElementById('s7Lab'), exs = document.getElementById('s7Ex');
    if (!inp || !tpEl) return;
    const player = TracePlayer(tpEl, null, {});
    const MODES = {
      ng: { label: 'heights (up to 20 whole numbers, commas between)', start: '6, 2, 5, 1, 3, 4, 0, 8', ex: [['Mixed', '6, 2, 5, 1, 3, 4, 0, 8'], ['Falling', '9, 7, 5, 3, 1'], ['Rising', '1, 3, 5, 7, 9'], ['Giant last', '5, 4, 3, 2, 1, 6'], ['Ties', '4, 4, 4, 5']] },
      br: { label: 'brackets (only ( ) [ ] { }, up to 30)', start: '{[()()]}', ex: [['Nested', '{[()()]}'], ['Crossed', '([)]'], ['Left open', '((()'], ['Starts closed', ']'], ['Empty', '']] }
    };
    let mode = 'ng';
    function parseNums(s) {
      const parts = s.split(',').map(t => t.trim());
      if (parts.length && parts[parts.length - 1] === '') parts.pop();
      if (!parts.length) throw new Error('Type at least one number, for example: 6, 2, 5');
      if (parts.length > 20) throw new Error(`That is ${parts.length} numbers. Please use 20 or fewer so the trace stays readable.`);
      return parts.map((t, k) => { if (!/^-?\d{1,6}$/.test(t)) throw new Error(`Item ${k + 1} ("${t || 'empty'}") is not a whole number. Use digits and commas, like 4, -2, 7.`); return Number(t); });
    }
    function parseBr(s) {
      const t = s.replace(/\s+/g, '');
      if (t.length > 30) throw new Error(`That is ${t.length} brackets. Please use 30 or fewer.`);
      const badCh = t.split('').find(c => !'()[]{}'.includes(c));
      if (badCh) throw new Error(`"${badCh}" is not a bracket. Use only ( ) [ ] { }.`);
      return t;
    }
    function run() {
      try {
        if (mode === 'ng') {
          const nums = parseNums(inp.value), s = ngFrames(nums), b = bruteCount(nums);
          player.load({ code: NG_CODE, frames: s.frames });
          out.innerHTML = `<span class="rk">answer:</span> <span class="rv">[${s.answer.join(', ')}]</span><br>` +
            `<span class="rk">monotonic stack:</span> <span class="rv">${s.comps}</span> <span class="rk">comparisons,</span> <span class="rv">${s.pushes}</span> <span class="rk">pushes,</span> <span class="rv">${s.pops}</span> <span class="rk">pops</span><br>` +
            `<span class="rk">nested scan:</span> <span class="rv-o">${b}</span> <span class="rk">comparisons</span>`;
        } else {
          const s = parseBr(inp.value), r = brFrames(s);
          player.load({ code: BR_CODE, frames: r.frames });
          out.innerHTML = `<span class="rk">valid:</span> <span class="rv">${r.valid ? 'True' : 'False'}</span><br><span class="rk">characters read:</span> <span class="rv">${r.steps}</span> <span class="rk">of</span> <span class="rv">${s.length}</span>`;
        }
        err.textContent = '';
      } catch (e) { err.textContent = e.message; }
    }
    function setMode(m) {
      mode = m; lab.textContent = MODES[m].label; inp.value = MODES[m].start;
      document.querySelectorAll('[data-s7mode]').forEach(b => b.classList.toggle('btn-primary', b.dataset.s7mode === m));
      exs.innerHTML = MODES[m].ex.map(([t, v]) => `<button class="btn btn-sm" type="button" data-s7ex="${v}">${t}</button>`).join('');
      run();
    }
    exs.addEventListener('click', e => { const b = e.target.closest('[data-s7ex]'); if (!b) return; inp.value = b.dataset.s7ex; run(); });
    document.querySelectorAll('[data-s7mode]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.s7mode)));
    document.getElementById('s7Run').addEventListener('click', run);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); run(); } });
    setMode('ng');
  })();
})();
