// ======== SLOT 20: PATTERN LESSON, 2D DYNAMIC PROGRAMMING ========
(() => {
  const CAP = 60, CALL_CAP = 1000000;
  const LCS_CODE = `def lcs(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]`;
  const EDIT_CODE = `def edit(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    return dp[m][n]`;
  const CHANGE_CODE = `def change(amount, coins):
    dp = [[0] * (amount + 1) for _ in range(len(coins) + 1)]
    for i in range(len(coins) + 1):
        dp[i][0] = 1
    for i in range(1, len(coins) + 1):
        c = coins[i - 1]
        for a in range(1, amount + 1):
            dp[i][a] = dp[i - 1][a]
            if a >= c:
                dp[i][a] += dp[i][a - c]
    return dp[len(coins)][amount]`;
  const fmtN = v => Number(v).toLocaleString('en-US');
  const setVal = (id, v) => { const el = document.getElementById(id); if (!el) return; el.querySelector('.val').textContent = v; flash(el); };

  // Counting rules shared with measure.py: calls = entries into the plain recursion, cells = rows x cols.
  function pathCalls(m, n) { let c = 0; const go = (r, k) => { c++; if (r === 0 || k === 0) return 1; return go(r - 1, k) + go(r, k - 1); }; const p = go(m - 1, n - 1); return { p, c }; }

  /* ---------- Section 1: visit counts vs table ---------- */
  function visitFrames(m, n) {
    const vis = Array.from({ length: m }, () => Array(n).fill(0)), frames = []; let calls = 0;
    const show = () => vis.map(r => r.map(x => x || ''));
    const go = (r, c) => {
      calls++; vis[r][c]++;
      const base = r === 0 || c === 0;
      frames.push({ note: `Call ${calls}: routes to (${r}, ${c}). ${vis[r][c] > 1 ? `Asked ${vis[r][c]} times now: wasted work.` : base ? 'On the edge: 1 route, stop.' : 'Needs the cell above and the cell to the left.'}`, views: [{ type: 'grid', name: 'times each cell is asked', rows: show(), hl: [[r, c]] }, { type: 'vars', values: { calls } }] });
      if (base) return 1;
      return go(r - 1, c) + go(r, c - 1);
    };
    const p = go(m - 1, n - 1);
    frames.push({ note: `${p} routes after ${calls} calls. The table needs only ${m * n} cells.`, result: p, views: [{ type: 'grid', name: 'times each cell is asked', rows: show() }, { type: 'vars', values: { calls } }] });
    return { frames, calls };
  }
  function fillFrames(m, n) {
    const dp = Array.from({ length: m }, () => Array(n).fill(null)), frames = [];
    const show = () => dp.map(r => r.map(x => x === null ? '' : x));
    for (let k = 0; k < n; k++) dp[0][k] = 1; for (let r = 0; r < m; r++) dp[r][0] = 1;
    const edge = []; for (let k = 0; k < n; k++) edge.push([0, k]); for (let r = 1; r < m; r++) edge.push([r, 0]);
    frames.push({ note: 'Top row and left column: 1 route each (ride straight).', views: [{ type: 'grid', name: 'dp: routes to each cell', rows: show(), hl: edge }, { type: 'vars', values: { 'cells filled': edge.length } }] });
    let filled = edge.length;
    for (let r = 1; r < m; r++) for (let c = 1; c < n; c++) {
      dp[r][c] = dp[r - 1][c] + dp[r][c - 1]; filled++;
      frames.push({ note: `dp[${r}][${c}] = above ${dp[r - 1][c]} + left ${dp[r][c - 1]} = ${dp[r][c]}.`, views: [{ type: 'grid', name: 'dp: routes to each cell', rows: show(), hl: [[r, c]], src: [[r - 1, c], [r, c - 1]] }, { type: 'vars', values: { 'cells filled': filled } }] });
    }
    frames.push({ note: `The corner holds the answer: ${dp[m - 1][n - 1]} routes, ${m * n} cells.`, result: dp[m - 1][n - 1], views: [{ type: 'grid', name: 'dp: routes to each cell', rows: show(), hl: [[m - 1, n - 1]] }, { type: 'vars', values: { 'cells filled': filled } }] });
    return { frames, cells: m * n };
  }
  (() => {
    const a = visitFrames(3, 4), b = fillFrames(3, 4);
    const elA = document.getElementById('p20tpA'), elB = document.getElementById('p20tpB');
    if (elA) TracePlayer(elA, { frames: a.frames }, { code: false });
    if (elB) TracePlayer(elB, { frames: b.frames }, { code: false });
    setVal('p20roA', a.calls); setVal('p20roB', b.cells);
  })();

  /* ---------- Section 2: race sliders ---------- */
  (() => {
    const rR = document.getElementById('p20rngR'), rC = document.getElementById('p20rngC'), cv = document.getElementById('p20cvA');
    if (!rR || !cv) return;
    const active = () => document.getElementById('lesson20').classList.contains('active');
    let calls = 1, cells = 1;
    function draw() {
      if (!cv.clientWidth) return;
      const { ctx: c, w, h } = fit(cv, Math.max(0.2, 110 / cv.clientWidth));
      c.clearRect(0, 0, w, h);
      const pad = 12, track = w - 2 * pad;
      [{ label: 'plain recursion', v: calls, unit: 'calls', col: css('--orange'), y: h * 0.32 }, { label: 'table', v: cells, unit: 'cells', col: css('--teal'), y: h * 0.76 }].forEach(L => {
        text(c, L.label, pad, L.y - 15, css('--text-bright'), 12, 'left', 600);
        text(c, `${fmtN(L.v)} ${L.unit}`, w - pad, L.y - 15, L.col, 12, 'right', 700);
        c.fillStyle = css('--bg-input'); c.fillRect(pad, L.y, track, 11);
        c.fillStyle = L.col; c.fillRect(pad, L.y, Math.max(2, track * L.v / calls), 11);
      });
    }
    function update() {
      const m = Number(rR.value), n = Number(rC.value);
      document.getElementById('p20outR').textContent = m; document.getElementById('p20outC').textContent = n;
      const r = pathCalls(m, n); calls = r.c; cells = m * n;
      setVal('p20roP', fmtN(r.p)); setVal('p20roN', fmtN(calls)); setVal('p20roT', cells); setVal('p20roX', (calls / cells).toFixed(1) + 'x');
      draw();
    }
    rR.addEventListener('input', update); rC.addEventListener('input', update);
    window.addEventListener('resize', () => { if (active()) draw(); });
    window.addEventListener('themechange', () => { if (active()) draw(); });
    update();
  })();

  /* ---------- Section 5: rock playground ---------- */
  (() => {
    const box = document.getElementById('p20rock'); if (!box) return;
    const M = 4, N = 5, msg = document.getElementById('p20rockMsg');
    let rocks = new Set(['1,1', '2,3']);
    function solve() {
      const dp = Array.from({ length: M }, () => Array(N).fill(0));
      for (let r = 0; r < M; r++) for (let c = 0; c < N; c++) {
        if (rocks.has(r + ',' + c)) dp[r][c] = 0;
        else if (r === 0 && c === 0) dp[r][c] = 1;
        else dp[r][c] = (r ? dp[r - 1][c] : 0) + (c ? dp[r][c - 1] : 0);
      }
      return dp;
    }
    function render() {
      const dp = solve();
      let h = '<table class="tp-grid"><tr><th></th>' + Array.from({ length: N }, (_, c) => `<th>${c}</th>`).join('') + '</tr>';
      for (let r = 0; r < M; r++) {
        h += `<tr><th>${r}</th>`;
        for (let c = 0; c < N; c++) {
          const rock = rocks.has(r + ',' + c), end = (r === 0 && c === 0) || (r === M - 1 && c === N - 1);
          const style = rock ? 'background:color-mix(in srgb, var(--red) 24%, transparent);' : end ? 'background:color-mix(in srgb, var(--teal) 22%, transparent);' : '';
          h += `<td style="padding:0;${style}"><button type="button" data-p20cell="${r},${c}" aria-label="Cell ${r}, ${c}: ${rock ? 'rock' : dp[r][c] + ' routes'}" style="all:unset;display:block;cursor:pointer;min-width:44px;height:34px;line-height:34px;text-align:center;font:inherit;color:var(--text-bright)">${rock ? 'rock' : dp[r][c]}</button></td>`;
        }
        h += '</tr>';
      }
      box.innerHTML = h + '</table>';
      setVal('p20roK', dp[M - 1][N - 1]); setVal('p20roQ', rocks.size);
      box.querySelectorAll('[data-p20cell]').forEach(b => b.addEventListener('click', () => {
        const k = b.dataset.p20cell;
        if (k === '0,0' || k === `${M - 1},${N - 1}`) { msg.textContent = 'The start and the goal cannot hold a rock.'; return; }
        if (rocks.has(k)) rocks.delete(k); else rocks.add(k);
        const v = solve()[M - 1][N - 1];
        msg.textContent = v === 0 ? 'Blocked: every route hits a rock, so the corner gets 0.' : v === 1 ? 'Exactly one route left.' : '';
        render();
      }));
    }
    const set = (ks, text) => { rocks = new Set(ks); msg.textContent = text; render(); };
    document.getElementById('p20rockA').addEventListener('click', () => set(['1,1', '2,3'], 'Two rocks: 7 routes left.'));
    document.getElementById('p20rockB').addEventListener('click', () => set(['0,1', '1,0'], 'Both first moves are blocked: 0 routes.'));
    document.getElementById('p20rockC').addEventListener('click', () => set([], 'No rocks: 35 routes.'));
    render();
  })();

  /* ---------- Two-strings tables (lesson and sandbox) ---------- */
  function stringFrames(a, b, mode) {
    const m = a.length, n = b.length, code = mode === 'lcs' ? LCS_CODE : EDIT_CODE, L = s => lineOf(code, s);
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(null)), frames = []; let computed = 0, more = 0;
    const rowL = ['""'].concat(a.split('')), colL = ['""'].concat(b.split(''));
    const g = (hl, src) => ({ type: 'grid', name: mode === 'lcs' ? 'dp[i][j] = LCS of a[:i] and b[:j]' : 'dp[i][j] = edits from a[:i] to b[:j]', rows: dp.map(r => r.map(x => x === null ? '' : x)), rowLabels: rowL, colLabels: colL, hl, src });
    for (let i = 0; i <= m; i++) dp[i][0] = mode === 'lcs' ? 0 : i;
    for (let j = 0; j <= n; j++) dp[0][j] = mode === 'lcs' ? 0 : j;
    frames.push({ line: mode === 'lcs' ? L('dp = [[0]') : L('dp[0][j] = j'), note: mode === 'lcs' ? 'Row 0 and column 0 are the empty prefix: nothing in common with an empty word, so 0.' : 'Row 0: build b[:j] from nothing with j inserts. Column 0: delete all i letters of a[:i].', views: [g([], []), { type: 'vars', values: { computed } }] });
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
      const same = a[i - 1] === b[j - 1]; let src, note, line;
      if (mode === 'lcs') {
        if (same) { dp[i][j] = dp[i - 1][j - 1] + 1; src = [[i - 1, j - 1]]; line = L('dp[i][j] = dp[i - 1][j - 1] + 1'); note = `'${a[i - 1]}' = '${b[j - 1]}': use it. Diagonal ${dp[i - 1][j - 1]} + 1 = ${dp[i][j]}.`; }
        else { dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]); src = [[i - 1, j], [i, j - 1]]; line = L('dp[i][j] = max('); note = `'${a[i - 1]}' and '${b[j - 1]}' differ: best of above ${dp[i - 1][j]} and left ${dp[i][j - 1]} = ${dp[i][j]}.`; }
      } else {
        if (same) { dp[i][j] = dp[i - 1][j - 1]; src = [[i - 1, j - 1]]; line = L('dp[i][j] = dp[i - 1][j - 1]'); note = `'${a[i - 1]}' = '${b[j - 1]}': no edit needed. Copy the diagonal ${dp[i][j]}.`; }
        else { dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]); src = [[i - 1, j], [i, j - 1], [i - 1, j - 1]]; line = L('dp[i][j] = 1 + min('); note = `'${a[i - 1]}' vs '${b[j - 1]}': 1 + min(delete ${dp[i - 1][j]}, insert ${dp[i][j - 1]}, replace ${dp[i - 1][j - 1]}) = ${dp[i][j]}.`; }
      }
      computed++;
      if (frames.length >= CAP) { more++; continue; }
      frames.push({ line, note, views: [g([[i, j]], src), { type: 'vars', values: { i, j, computed } }] });
    }
    if (more) frames.push({ line: L('for j in range(1, n + 1)'), note: `... ${more} more cells, same rule.`, views: [g([], []), { type: 'vars', values: { computed } }] });
    frames.push({ line: L('return dp[m][n]'), note: `The bottom-right corner: ${dp[m][n]}. ${computed} cells computed, ${(m + 1) * (n + 1)} in the table.`, result: dp[m][n], views: [g([[m, n]], []), { type: 'vars', values: { computed } }] });
    return { frames, ans: dp[m][n], cells: (m + 1) * (n + 1), code };
  }
  (() => { const el = document.getElementById('p20tpC'); if (el) TracePlayer(el, { code: LCS_CODE, frames: stringFrames('stone', 'tones', 'lcs').frames }); })();

  /* ---------- Section 5: coin change II table ---------- */
  function changeFrames(amount, coins) {
    const k = coins.length, L = s => lineOf(CHANGE_CODE, s), frames = [];
    const dp = Array.from({ length: k + 1 }, () => Array(amount + 1).fill(null));
    const rowL = ['no coins'].concat(coins.map(c => 'up to ' + c)), colL = Array.from({ length: amount + 1 }, (_, a) => String(a));
    const g = (hl, src) => ({ type: 'grid', name: 'dp[i][a] = ways to make a with the first i coin types', rows: dp.map(r => r.map(x => x === null ? '' : x)), rowLabels: rowL, colLabels: colL, hl, src });
    for (let i = 0; i <= k; i++) dp[i][0] = 1;
    for (let a = 1; a <= amount; a++) dp[0][a] = 0;
    frames.push({ line: L('dp[i][0] = 1'), note: 'Amount 0 has one way (take nothing). With no coins, every other amount has 0 ways.', views: [g(Array.from({ length: k + 1 }, (_, i) => [i, 0]), [])] });
    for (let i = 1; i <= k; i++) {
      const c = coins[i - 1];
      for (let a = 1; a <= amount; a++) {
        dp[i][a] = dp[i - 1][a]; const src = [[i - 1, a]];
        if (a >= c) { dp[i][a] += dp[i][a - c]; src.push([i, a - c]); }
        frames.push({ line: a >= c ? L('dp[i][a] += dp[i][a - c]') : L('dp[i][a] = dp[i - 1][a]'), note: a >= c ? `Amount ${a}: without coin ${c}: ${dp[i - 1][a]} (above). With at least one ${c}: ${dp[i][a - c]} (same row, amount ${a - c}). Total ${dp[i][a]}.` : `Amount ${a} is less than coin ${c}: copy the row above, ${dp[i][a]}.`, views: [g([[i, a]], src)] });
      }
    }
    frames.push({ line: L('return dp[len(coins)][amount]'), note: `${dp[k][amount]} combinations.`, result: dp[k][amount], views: [g([[k, amount]], [])] });
    return frames;
  }
  (() => { const el = document.getElementById('p20tpD'); if (el) TracePlayer(el, { code: CHANGE_CODE, frames: changeFrames(4, [1, 2, 3]) }); })();

  /* ---------- Sandbox ---------- */
  function capped(fn) { let c = 0; const tick = () => { if (++c > CALL_CAP) throw 0; }; try { fn(tick); return c; } catch (e) { if (e === 0) return null; throw e; } }
  const lcsNaive = (a, b) => capped(tick => { const go = (i, j) => { tick(); if (i === a.length || j === b.length) return 0; if (a[i] === b[j]) return 1 + go(i + 1, j + 1); return Math.max(go(i + 1, j), go(i, j + 1)); }; go(0, 0); });
  const editNaive = (a, b) => capped(tick => { const go = (i, j) => { tick(); if (i === a.length) return b.length - j; if (j === b.length) return a.length - i; if (a[i] === b[j]) return go(i + 1, j + 1); return 1 + Math.min(go(i + 1, j), go(i, j + 1), go(i + 1, j + 1)); }; go(0, 0); });
  (() => {
    const inA = document.getElementById('s20A'), inB = document.getElementById('s20B'), err = document.getElementById('s20Err'), out = document.getElementById('s20Out'), tpEl = document.getElementById('s20Tp');
    if (!inA || !tpEl) return;
    const player = TracePlayer(tpEl, null, {});
    let mode = 'lcs';
    function setMode(m) { mode = m; document.querySelectorAll('[data-s20mode]').forEach(x => x.classList.toggle('btn-primary', x.dataset.s20mode === m)); }
    function word(s, which) {
      const t = s.trim();
      if (t.length > 10) throw new Error(`Word ${which} has ${t.length} characters. Please use 10 or fewer so the table stays readable.`);
      if (!/^[a-z0-9]*$/i.test(t)) throw new Error(`Word ${which} may only use letters and digits (no spaces or symbols). Leave it empty for the empty word.`);
      return t;
    }
    function run() {
      let a, b;
      try { a = word(inA.value, 'a'); b = word(inB.value, 'b'); } catch (e) { err.textContent = e.message; return; }
      err.textContent = '';
      const r = stringFrames(a, b, mode), naive = mode === 'lcs' ? lcsNaive(a, b) : editNaive(a, b);
      player.load({ code: r.code, frames: r.frames });
      out.innerHTML = `<span class="rk">${mode === 'lcs' ? 'longest common subsequence' : 'edit distance'}:</span> <span class="rv">${r.ans}</span><br>` +
        `<span class="rk">table cells:</span> <span class="rv">${r.cells}</span><br>` +
        `<span class="rk">plain recursion:</span> <span class="rv-o">${naive === null ? 'over ' + fmtN(CALL_CAP) : fmtN(naive)}</span> <span class="rk">calls</span>`;
    }
    document.querySelectorAll('[data-s20mode]').forEach(btn => btn.addEventListener('click', () => { setMode(btn.dataset.s20mode); run(); }));
    document.querySelectorAll('[data-s20ex]').forEach(btn => btn.addEventListener('click', () => { const [m, a, b] = btn.dataset.s20ex.split('|'); setMode(m); inA.value = a; inB.value = b; run(); }));
    document.getElementById('s20Run').addEventListener('click', run);
    [inA, inB].forEach(x => x.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); run(); } }));
    setMode('lcs'); run();
  })();
})();
