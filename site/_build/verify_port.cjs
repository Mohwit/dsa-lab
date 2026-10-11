// Check a problem's in-page JavaScript port against its tests.
// Usage: node site/_build/verify_port.cjs <problem dir>
// The slot's _fragments/script.js must contain a block between "// @@PORT-START" and "// @@PORT-END" that defines
//   const CODE = `...python solution shown in the trace...`;
//   function solve(args) { ...; return { result, frames }; }      // args = one test case's "args" array
// tests.json: { "fn": "...", "compare": "exact" | "sorted" | "set" | "nested-sorted", "cases": [ { "args": [...], "expected": ... } ] }
// Every case must give the expected result, every frame must point at a real code line, and frames must not be empty.
const fs = require('fs'), path = require('path');
const dir = path.resolve(process.argv[2] || '.');
const js = fs.readFileSync(path.join(dir, '_fragments', 'script.js'), 'utf8');
const m = js.match(/\/\/ @@PORT-START\n([\s\S]*?)\/\/ @@PORT-END/);
if (!m) { console.error('no // @@PORT-START ... // @@PORT-END block in script.js'); process.exit(1); }
const base = fs.readFileSync(path.join(__dirname, 'index.base.html'), 'utf8');
const lineOfSrc = base.match(/function lineOf\([\s\S]*?\n}\n/)[0];
const { CODE, solve } = new Function(lineOfSrc + m[1] + '\nreturn { CODE: typeof CODE === "undefined" ? "" : CODE, solve };')();
const tests = JSON.parse(fs.readFileSync(path.join(dir, 'tests.json'), 'utf8'));
const norm = (v, how) => {
  if (how === 'sorted') return JSON.stringify([...v].sort((a, b) => JSON.stringify(a) < JSON.stringify(b) ? -1 : 1));
  if (how === 'set') return JSON.stringify([...new Set(v.map(x => JSON.stringify(x)))].sort());
  if (how === 'nested-sorted') return JSON.stringify(v.map(x => [...x].sort((a, b) => a < b ? -1 : 1)).sort((a, b) => JSON.stringify(a) < JSON.stringify(b) ? -1 : 1));
  return JSON.stringify(v);
};
const nLines = CODE.split('\n').length; let bad = 0, frames = 0;
tests.cases.forEach((c, k) => {
  let out;
  try { out = solve(JSON.parse(JSON.stringify(c.args))); } catch (e) { console.log(`case ${k}: threw ${e.message}`); bad++; return; }
  frames += out.frames.length;
  const ok = norm(out.result, tests.compare) === norm(c.expected, tests.compare);
  const badLine = out.frames.find(f => CODE && !(f.line >= 1 && f.line <= nLines));
  if (!ok) { console.log(`case ${k}: got ${JSON.stringify(out.result)} expected ${JSON.stringify(c.expected)}`); bad++; }
  if (!out.frames.length) { console.log(`case ${k}: no frames`); bad++; }
  if (badLine) { console.log(`case ${k}: frame line ${badLine.line} outside the ${nLines}-line CODE`); bad++; }
});
console.log(`${tests.cases.length - bad >= 0 ? tests.cases.length : 0} cases, ${frames} frames: ${bad ? 'FAIL (' + bad + ' problems)' : 'PASS'}`);
process.exit(bad ? 1 : 0);
