// ======== SLOT 22: PATTERN LESSON, MATH AND MATRIX ========
(() => {
  const CAP = 60;
  // Counting rules match patterns/math-geometry/measure.py (see its docstring).
  const ROT_CODE = `def rotate(m):
    n = len(m)
    for i in range(n):
        for j in range(i + 1, n):
            m[i][j], m[j][i] = m[j][i], m[i][j]
    for row in m:
        row.reverse()`;
  const COPY_CODE = `def rotate_copy(m):
    n = len(m)
    out = [[0] * n for _ in range(n)]
    for r in range(n):
        for c in range(n):
            out[c][n - 1 - r] = m[r][c]
    for r in range(n):
        for c in range(n):
            m[r][c] = out[r][c]`;
  const SPIRAL_CODE = `def spiral(m):
    out = []
    top, bottom, left, right = 0, len(m) - 1, 0, len(m[0]) - 1
    while top <= bottom and left <= right:
        for c in range(left, right + 1):
            out.append(m[top][c])
        top += 1
        for r in range(top, bottom + 1):
            out.append(m[r][right])
        right -= 1
        if top <= bottom:
            for c in range(right, left - 1, -1):
                out.append(m[bottom][c])
            bottom -= 1
        if left <= right:
            for r in range(bottom, top - 1, -1):
                out.append(m[r][left])
            left += 1
    return out`;
  const ZERO_CODE = `def set_zeroes(m):
    R, C = len(m), len(m[0])
    row0 = any(m[0][c] == 0 for c in range(C))
    col0 = any(m[r][0] == 0 for r in range(R))
    for r in range(1, R):
        for c in range(1, C):
            if m[r][c] == 0:
                m[r][0] = 0
                m[0][c] = 0
    for r in range(1, R):
        for c in range(1, C):
            if m[r][0] == 0 or m[0][c] == 0:
                m[r][c] = 0
    if row0:
        for c in range(C):
            m[0][c] = 0
    if col0:
        for r in range(R):
            m[r][0] = 0
    return m`;
  const HAPPY_CODE = `def next_num(n):
    total = 0
    while n:
        n, d = divmod(n, 10)
        total += d * d
    return total

def is_happy(n):
    seen = set()
    while n != 1 and n not in seen:
        seen.add(n)
        n = next_num(n)
    return n == 1`;
  const MUL_CODE = `def multiply(a, b):
    if a == "0" or b == "0":
        return "0"
    pos = [0] * (len(a) + len(b))
    for i in range(len(a) - 1, -1, -1):
        for j in range(len(b) - 1, -1, -1):
            mul = int(a[i]) * int(b[j])
            total = mul + pos[i + j + 1]
            pos[i + j + 1] = total % 10
            pos[i + j] += total // 10
    return "".join(map(str, pos)).lstrip("0")`;

  const setVal = (id, v) => { const el = document.getElementById(id); if (!el) return; el.querySelector('.val').textContent = v; flash(el); };
  const clone = m => m.map(r => r.slice());
  const square = n => Array.from({ length: n }, (_, r) => Array.from({ length: n }, (__, c) => r * n + c + 1));
  function recorder() {
    const frames = []; let skipped = 0;
    return {
      push(f) { if (frames.length < CAP) frames.push(f); else skipped++; },
      finish(last) { if (skipped) frames.push({ line: last.line, note: `... ${skipped} more steps, same rule.`, views: last.views }); frames.push(last); return frames; }
    };
  }

  // ---------- rotation traces ----------
  function rotateTrace(m0) {
    const m = clone(m0), n = m.length, L = s => lineOf(ROT_CODE, s), R = recorder();
    let swaps = 0;
    const views = hl => [{ type: 'grid', name: 'm (the only grid)', rows: clone(m), hl: hl || [] }, { type: 'vars', values: { swaps, 'cell writes': 2 * swaps, 'extra cells': 0 } }];
    R.push({ line: L('n = len(m)'), note: 'One grid, no copy. First flip it across the diagonal (top-left to bottom-right).', views: views([]) });
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      [m[i][j], m[j][i]] = [m[j][i], m[i][j]]; swaps++;
      R.push({ line: L('m[i][j], m[j][i] = m[j][i], m[i][j]'), note: `Swap (${i}, ${j}) with (${j}, ${i}): ${m[j][i]} and ${m[i][j]} trade places across the diagonal.`, views: views([[i, j], [j, i]]) });
    }
    R.push({ line: L('for row in m'), note: `Transpose done with ${swaps} swaps. The first row is now the old first column. Now mirror every row.`, views: views([]) });
    for (let r = 0; r < n; r++) {
      m[r].reverse(); swaps += Math.floor(n / 2);
      R.push({ line: L('row.reverse()'), note: `Reverse row ${r}: ${Math.floor(n / 2)} swaps.`, views: views(m[r].map((_, c) => [r, c])) });
    }
    return { m, swaps, frames: R.finish({ line: L('row.reverse()'), note: `Turned clockwise: ${swaps} swaps (${2 * swaps} cell writes) and 0 extra cells.`, result: m.map(r => r.join(' ')).join(' | '), views: views([]) }) };
  }
  function copyTrace(m0) {
    const m = clone(m0), n = m.length, L = s => lineOf(COPY_CODE, s), R = recorder();
    const out = m.map(r => r.map(() => null));
    let writes = 0;
    const views = (hlM, hlO) => [{ type: 'grid', name: 'm', rows: clone(m), hl: hlM || [] }, { type: 'grid', name: 'out (a second grid)', rows: clone(out), hl: hlO || [] }, { type: 'vars', values: { 'cell writes': writes, 'extra cells': n * n } }];
    R.push({ line: L('out = [[0] * n for _ in range(n)]'), note: `Make a second ${n} x ${n} grid: ${n * n} extra cells.`, views: views() });
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      out[c][n - 1 - r] = m[r][c]; writes++;
      R.push({ line: L('out[c][n - 1 - r] = m[r][c]'), note: `${m[r][c]} at (${r}, ${c}) goes to (${c}, ${n - 1 - r}) in out.`, views: views([[r, c]], [[c, n - 1 - r]]) });
    }
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) { m[r][c] = out[r][c]; writes++; }
    return { m, writes, extra: n * n, frames: R.finish({ line: L('m[r][c] = out[r][c]'), note: `Copy all ${n * n} cells back into m. Total: ${writes} cell writes and ${n * n} extra cells.`, result: m.map(r => r.join(' ')).join(' | '), views: views() }) };
  }
  (() => {
    const a = rotateTrace(square(4)), b = copyTrace(square(4));
    const elA = document.getElementById('p22tpA'), elB = document.getElementById('p22tpB');
    if (elA) TracePlayer(elA, { frames: a.frames }, { code: false });
    if (elB) TracePlayer(elB, { frames: b.frames }, { code: false });
    setVal('p22roA', 0); setVal('p22roB', b.extra); setVal('p22roC', 2 * a.swaps); setVal('p22roD', b.writes);
  })();

  /* ---------- rotation playground ---------- */
  (() => {
    const box = document.getElementById('p22rot'); if (!box) return;
    const start = square(3), same = (x, y) => JSON.stringify(x) === JSON.stringify(y);
    const tr = m => m[0].map((_, c) => m.map(r => r[c])), mirror = m => m.map(r => r.slice().reverse()), flip = m => m.slice().reverse().map(r => r.slice());
    const cw = m => tr(flip(m));
    const named = [['the start', start], ['a clockwise turn', cw(start)], ['a half turn', cw(cw(start))], ['a counter-clockwise turn', cw(cw(cw(start)))], ['the transpose', tr(start)], ['a mirror image', mirror(start)], ['upside down', flip(start)]];
    let m = clone(start), moves = [];
    function draw() {
      box.innerHTML = '<table class="tp-grid" style="width:auto;margin:0 auto;font-size:15px" aria-label="Current grid"><tbody>' + m.map(r => '<tr>' + r.map(x => `<td>${x}</td>`).join('') + '</tr>').join('') + '</tbody></table>';
      const hit = named.find(([, t]) => same(t, m));
      setVal('p22roMv', moves.length ? moves.join(', ') : 'none');
      setVal('p22roTn', hit ? hit[0] : 'a turn plus a mirror');
    }
    const act = (f, name) => () => { m = f(m); moves.push(name); if (moves.length > 6) moves = moves.slice(-6); draw(); };
    document.getElementById('p22rT').addEventListener('click', act(tr, 'transpose'));
    document.getElementById('p22rM').addEventListener('click', act(mirror, 'mirror'));
    document.getElementById('p22rF').addEventListener('click', act(flip, 'flip'));
    document.getElementById('p22rR').addEventListener('click', () => { m = clone(start); moves = []; draw(); });
    draw();
  })();

  /* ---------- spiral ---------- */
  function spiralTrace(m) {
    const L = s => lineOf(SPIRAL_CODE, s), R = recorder(), out = [], done = [];
    let top = 0, bottom = m.length - 1, left = 0, right = m[0].length - 1;
    const views = hl => [{ type: 'grid', name: 'm (blue = already output)', rows: clone(m), hl: hl ? [hl] : [], src: done.slice() }, { type: 'array', name: 'out', values: out.slice() }, { type: 'vars', values: { top, bottom, left, right } }];
    const take = (r, c, line, side) => { out.push(m[r][c]); R.push({ line: L(line), note: `${side}: take ${m[r][c]} at (${r}, ${c}).`, views: views([r, c]) }); done.push([r, c]); };
    R.push({ line: L('top, bottom, left, right = 0'), note: 'The boundaries start at the outer edge. Everything inside them is still to walk.', views: views() });
    while (top <= bottom && left <= right) {
      for (let c = left; c <= right; c++) take(top, c, 'out.append(m[top][c])', 'Top row, left to right');
      top++; R.push({ line: L('top += 1'), note: 'Top row done: move top down.', views: views() });
      for (let r = top; r <= bottom; r++) take(r, right, 'out.append(m[r][right])', 'Right column, downwards');
      right--; R.push({ line: L('right -= 1'), note: 'Right column done: move right in.', views: views() });
      if (top <= bottom) {
        for (let c = right; c >= left; c--) take(bottom, c, 'out.append(m[bottom][c])', 'Bottom row, right to left');
        bottom--; R.push({ line: L('bottom -= 1'), note: 'Bottom row done: move bottom up.', views: views() });
      } else R.push({ line: L('if top <= bottom'), note: 'top passed bottom: no row is left, so skip the bottom side.', views: views() });
      if (left <= right) {
        for (let r = bottom; r >= top; r--) take(r, left, 'out.append(m[r][left])', 'Left column, upwards');
        left++; R.push({ line: L('left += 1'), note: 'Left column done: move left in.', views: views() });
      } else R.push({ line: L('if left <= right'), note: 'left passed right: no column is left, so skip the left side.', views: views() });
    }
    return { out, frames: R.finish({ line: L('return out'), note: `The boundaries crossed: every cell is out, once each. ${out.length} cells.`, result: out.join(', '), views: views() }) };
  }
  function spiralNoGuardsVisits(R0, C0) {
    const visits = Array.from({ length: R0 }, () => new Array(C0).fill(0));
    let top = 0, bottom = R0 - 1, left = 0, right = C0 - 1, count = 0;
    const hit = (r, c) => { visits[r][c]++; count++; };
    while (top <= bottom && left <= right) {
      for (let c = left; c <= right; c++) hit(top, c); top++;
      for (let r = top; r <= bottom; r++) hit(r, right); right--;
      for (let c = right; c >= left; c--) hit(bottom, c); bottom--;
      for (let r = bottom; r >= top; r--) hit(r, left); left++;
    }
    return { visits, count };
  }
  (() => { const el = document.getElementById('p22tpC'); if (el) TracePlayer(el, { code: SPIRAL_CODE, frames: spiralTrace([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]).frames }); })();
  (() => {
    const cv = document.getElementById('p22cvS'), sR = document.getElementById('p22sR'), sC = document.getElementById('p22sC'); if (!cv || !sR) return;
    const active = () => document.getElementById('lesson22').classList.contains('active');
    function draw() {
      const R0 = Number(sR.value), C0 = Number(sC.value);
      document.getElementById('p22sRv').textContent = R0; document.getElementById('p22sCv').textContent = C0;
      const m = Array.from({ length: R0 }, (_, r) => Array.from({ length: C0 }, (__, c) => [r, c]));
      const order = spiralTrace(m).out, bad = spiralNoGuardsVisits(R0, C0);
      setVal('p22roS1', R0 * C0); setVal('p22roS2', order.length); setVal('p22roS3', bad.count);
      if (!cv.clientWidth) return;
      const { ctx: c, w, h } = fit(cv, 0.5);
      c.clearRect(0, 0, w, h);
      const cs = Math.min((w - 20) / C0, (h - 20) / R0), ox = (w - cs * C0) / 2, oy = (h - cs * R0) / 2;
      const ctr = ([r, cc]) => [ox + cc * cs + cs / 2, oy + r * cs + cs / 2];
      for (let r = 0; r < R0; r++) for (let cc = 0; cc < C0; cc++) {
        const x = ox + cc * cs, y = oy + r * cs;
        c.fillStyle = css('--bg-surface'); c.fillRect(x + 2, y + 2, cs - 4, cs - 4);
        c.strokeStyle = bad.visits[r][cc] > 1 ? css('--red') : css('--border'); c.lineWidth = bad.visits[r][cc] > 1 ? 3 : 1; c.strokeRect(x + 2, y + 2, cs - 4, cs - 4);
      }
      c.strokeStyle = css('--teal'); c.lineWidth = 2.5; c.beginPath();
      order.forEach((p, k) => { const [x, y] = ctr(p); k ? c.lineTo(x, y) : c.moveTo(x, y); }); c.stroke();
      order.forEach((p, k) => { const [x, y] = ctr(p); c.fillStyle = css('--bg-raised'); c.beginPath(); c.arc(x, y, Math.min(11, cs * 0.28), 0, 7); c.fill(); text(c, String(k + 1), x, y, k ? css('--text-bright') : css('--teal'), Math.max(9, Math.min(12, cs * 0.25)), 'center', 700); });
    }
    [sR, sC].forEach(s => s.addEventListener('input', draw));
    window.addEventListener('resize', () => { if (active()) draw(); });
    window.addEventListener('themechange', () => { if (active()) draw(); });
    draw();
  })();

  /* ---------- set zeroes ---------- */
  function zeroTrace(m0) {
    const m = clone(m0), Rn = m.length, Cn = m[0].length, L = s => lineOf(ZERO_CODE, s), Rc = recorder();
    let row0 = null, col0 = null;
    const views = (hl, src) => [{ type: 'grid', name: 'm (blue = marker cells read)', rows: clone(m), hl: hl || [], src: src || [] }, { type: 'vars', values: { row0: row0 === null ? '-' : row0, col0: col0 === null ? '-' : col0 } }];
    row0 = m[0].some(x => x === 0); col0 = m.some(r => r[0] === 0);
    Rc.push({ line: L('col0 = any'), note: `First save two flags: does row 0 hold a 0 (${row0 ? 'yes' : 'no'})? Does column 0 (${col0 ? 'yes' : 'no'})?`, views: views() });
    for (let r = 1; r < Rn; r++) for (let c = 1; c < Cn; c++) if (m[r][c] === 0) {
      m[r][0] = 0; m[0][c] = 0;
      Rc.push({ line: L('m[0][c] = 0'), note: `Found a 0 at (${r}, ${c}). Leave notes: a 0 at the start of row ${r} and at the top of column ${c}. Nothing else changes yet.`, views: views([[r, c]], [[r, 0], [0, c]]) });
    }
    for (let r = 1; r < Rn; r++) for (let c = 1; c < Cn; c++) {
      const z = m[r][0] === 0 || m[0][c] === 0;
      if (z) { const was = m[r][c]; m[r][c] = 0; Rc.push({ line: L('m[r][c] = 0'), note: `(${r}, ${c}): ${m[r][0] === 0 ? `row ${r} has a note` : `column ${c} has a note`}, so ${was} becomes 0.`, views: views([[r, c]], [[r, 0], [0, c]]) }); }
    }
    if (row0) { for (let c = 0; c < Cn; c++) m[0][c] = 0; Rc.push({ line: L('m[0][c] = 0', 2), note: 'row0 was True: zero the whole first row.', views: views(m[0].map((_, c) => [0, c])) }); }
    if (col0) { for (let r = 0; r < Rn; r++) m[r][0] = 0; Rc.push({ line: L('m[r][0] = 0', 2), note: 'col0 was True: zero the whole first column.', views: views(m.map((_, r) => [r, 0])) }); }
    return { m, frames: Rc.finish({ line: L('return m'), note: `Done in two passes with no extra grid: only two flags of memory. row0 = ${row0 ? 'True' : 'False'}, col0 = ${col0 ? 'True' : 'False'}.`, result: m.map(r => r.join(' ')).join(' | '), views: views() }) };
  }
  (() => { const el = document.getElementById('p22tpD'); if (el) TracePlayer(el, { code: ZERO_CODE, frames: zeroTrace([[1, 2, 3, 4], [5, 0, 7, 8], [9, 10, 11, 0], [13, 14, 15, 16]]).frames }); })();

  /* ---------- happy numbers ---------- */
  const nextNum = n => { let t = 0; while (n) { const d = n % 10; n = Math.floor(n / 10); t += d * d; } return t; };
  function happySet(n) { const seen = new Set(), chain = [n]; let steps = 0; while (n !== 1 && !seen.has(n)) { seen.add(n); n = nextNum(n); steps++; chain.push(n); } return { happy: n === 1, steps, chain }; }
  function happyFast(n) { let steps = 1, slow = n, fast = nextNum(n); while (fast !== 1 && slow !== fast) { slow = nextNum(slow); fast = nextNum(nextNum(fast)); steps += 3; } return { happy: fast === 1, steps }; }
  function happyTrace(n0) {
    const L = s => lineOf(HAPPY_CODE, s), R = recorder(), seen = [], chain = [n0];
    let n = n0;
    const views = (hl, nw) => [{ type: 'array', name: 'chain', values: chain.slice(), hl: hl === undefined ? [] : [hl] }, { type: 'set', name: 'seen', values: seen.slice(), hl: nw }, { type: 'vars', values: { n } }];
    R.push({ line: L('seen = set()'), note: `Start at ${n0}. The seen set is empty.`, views: views(0) });
    while (n !== 1 && !seen.includes(n)) {
      seen.push(n);
      const digits = String(n).split('').map(Number), nx = nextNum(n);
      n = nx; chain.push(n);
      R.push({ line: L('n = next_num(n)'), note: `${digits.map(d => `${d}x${d}`).join(' + ')} = ${nx}.`, views: views(chain.length - 1) });
    }
    const happy = n === 1;
    return { frames: R.finish({ line: L('return n == 1'), note: happy ? `Reached 1: ${n0} is happy.` : `${n} is already in seen: the chain loops forever, so ${n0} is not happy.`, result: happy ? 'True' : 'False', views: views(chain.length - 1, happy ? undefined : n) }) };
  }
  (() => { const el = document.getElementById('p22tpE'); if (el) TracePlayer(el, { code: HAPPY_CODE, frames: happyTrace(2).frames }); })();
  (() => {
    const inp = document.getElementById('p22hIn'), err = document.getElementById('p22hErr'), chainEl = document.getElementById('p22hChain'); if (!inp) return;
    function go() {
      const t = inp.value.trim();
      if (!/^\d{1,6}$/.test(t) || Number(t) < 1) { err.textContent = 'Type a whole number from 1 to 999999, for example 19.'; return; }
      err.textContent = '';
      const n = Number(t), a = happySet(n), b = happyFast(n);
      setVal('p22roH1', a.happy ? 'yes' : 'no, it loops'); setVal('p22roH2', a.steps); setVal('p22roH3', b.steps);
      chainEl.textContent = 'chain: ' + a.chain.join(' -> ') + (a.happy ? '' : ' (seen before)');
    }
    document.getElementById('p22hGo').addEventListener('click', go);
    document.querySelectorAll('[data-p22h]').forEach(btn => btn.addEventListener('click', () => { inp.value = btn.dataset.p22h; go(); }));
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
    go();
  })();

  /* ---------- multiply strings ---------- */
  function mulTrace(a, b) {
    const L = s => lineOf(MUL_CODE, s), R = recorder();
    if (a === '0' || b === '0') return { result: '0', products: 0, frames: [{ line: L('return "0"', 1), note: 'One side is zero, so the product is "0".', result: '0', views: [] }] };
    const pos = new Array(a.length + b.length).fill(0);
    let products = 0;
    const views = (i, j, hl) => [{ type: 'array', name: 'a', values: a.split(''), hl: i === undefined ? [] : [i] }, { type: 'array', name: 'b', values: b.split(''), hl: j === undefined ? [] : [j] }, { type: 'array', name: 'pos (one digit per slot)', values: pos.slice(), hl: hl || [] }, { type: 'vars', values: { 'digit products': products } }];
    R.push({ line: L('pos = [0] * (len(a) + len(b))'), note: `${a.length} digits times ${b.length} digits has at most ${a.length + b.length} digits.`, views: views() });
    for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--) {
      const mul = Number(a[i]) * Number(b[j]); products++;
      const total = mul + pos[i + j + 1];
      pos[i + j + 1] = total % 10; pos[i + j] += Math.floor(total / 10);
      R.push({ line: L('pos[i + j] += total // 10'), note: `${a[i]} x ${b[j]} = ${mul}, plus ${total - mul} already in slot ${i + j + 1} makes ${total}. Keep ${total % 10} there, carry ${Math.floor(total / 10)} to slot ${i + j}.`, views: views(i, j, [i + j, i + j + 1]) });
    }
    const s = pos.join('').replace(/^0+/, '');
    return { result: s, products, frames: R.finish({ line: L('return "".join'), note: `Join the slots and drop leading zeros: ${s}. ${products} digit products.`, result: `"${s}"`, views: views() }) };
  }
  (() => { const el = document.getElementById('p22tpF'); if (el) TracePlayer(el, { code: MUL_CODE, frames: mulTrace('123', '45').frames }); })();

  /* ---------- Sandbox: matrix lab ---------- */
  (() => {
    const inp = document.getElementById('s22In'), err = document.getElementById('s22Err'), out = document.getElementById('s22Out'), tpEl = document.getElementById('s22Tp');
    if (!inp || !tpEl) return;
    const player = TracePlayer(tpEl, null, {});
    function parse() {
      const rows = inp.value.split(';').map(r => r.trim()).filter(r => r !== '');
      if (!rows.length) throw new Error('Type a grid: numbers separated by spaces, rows separated by ";". For example: 1 2; 3 4');
      if (rows.length > 6) throw new Error(`That is ${rows.length} rows. Please use 6 or fewer.`);
      const m = rows.map((r, k) => r.split(/[\s,]+/).map(t => {
        if (!/^-?\d{1,4}$/.test(t)) throw new Error(`Row ${k + 1} has "${t}", which is not a whole number (up to 4 digits).`);
        return Number(t);
      }));
      if (m[0].length > 6) throw new Error(`Rows have ${m[0].length} numbers. Please use 6 or fewer per row.`);
      m.forEach((r, k) => { if (r.length !== m[0].length) throw new Error(`Row ${k + 1} has ${r.length} numbers but row 1 has ${m[0].length}. Every row needs the same length.`); });
      return m;
    }
    const show = m => m.map(r => r.join(' ')).join(' | ');
    function run(kind) {
      let m;
      try { m = parse(); } catch (e) { err.textContent = e.message; return; }
      if (kind === 'rotate' && m.length !== m[0].length) { err.textContent = `Rotation in place needs a square grid; yours is ${m.length} x ${m[0].length}. Try Spiral or Set zeroes instead.`; return; }
      err.textContent = '';
      if (kind === 'rotate') {
        const r = rotateTrace(m); player.load({ code: ROT_CODE, frames: r.frames });
        out.innerHTML = `<span class="rk">turned clockwise:</span> <span class="rv">${show(r.m)}</span><br><span class="rk">swaps:</span> <span class="rv">${r.swaps}</span> <span class="rk">extra cells:</span> <span class="rv">0</span> <span class="rk">(a copy would use</span> <span class="rv-o">${m.length * m.length}</span><span class="rk">)</span>`;
      } else if (kind === 'spiral') {
        const r = spiralTrace(m), bad = spiralNoGuardsVisits(m.length, m[0].length).count; player.load({ code: SPIRAL_CODE, frames: r.frames });
        out.innerHTML = `<span class="rk">spiral:</span> <span class="rv">${r.out.join(', ')}</span><br><span class="rk">cells out:</span> <span class="rv">${r.out.length}</span> <span class="rk">without guards:</span> <span class="rv-o">${bad}</span>`;
      } else {
        const r = zeroTrace(m); player.load({ code: ZERO_CODE, frames: r.frames });
        out.innerHTML = `<span class="rk">after:</span> <span class="rv">${show(r.m)}</span><br><span class="rk">extra memory:</span> <span class="rv">2 flags</span>`;
      }
    }
    document.querySelectorAll('[data-s22ex]').forEach(btn => btn.addEventListener('click', () => { inp.value = btn.dataset.s22ex; run(btn.dataset.s22run); }));
    document.getElementById('s22Rot').addEventListener('click', () => run('rotate'));
    document.getElementById('s22Spi').addEventListener('click', () => run('spiral'));
    document.getElementById('s22Zer').addEventListener('click', () => run('zeroes'));
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); run('spiral'); } });
    run('rotate');
  })();
})();
