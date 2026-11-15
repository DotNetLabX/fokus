// Re-runs the D1-04 direction scan from the repo root: node docs/architecture-map/scripts/dir-matrix.mjs
// Prints "<source project> -> <target project> files=<n>" for every (source, target) pair (owner namespace not counted).
import { execFileSync } from 'node:child_process';
const BS = String.fromCharCode(92);
const re = '\\b(Blocks|Jira|Xray|Fokus)\\.(Core|Exceptions|Domain|AspNetCore|EntityFrameworkCore|FastEndpoints|Contracts|RestApi|GraphQL|API|Application|Persistence)\\b';
const out = execFileSync('rg', ['-o', '--no-heading', '-g', '*.cs', '-g', '!**/bin/**', '-g', '!**/obj/**', '-g', '!**/Migrations/**', '-g', '!**/Fokus.Tests/**', re, 'src'], { encoding: 'utf8', maxBuffer: 1 << 26 });
const lines = [...new Set(out.split(/\r?\n/).filter(Boolean))]; // unique (file, token)
const c = {};
for (const l of lines) {
  const i = l.lastIndexOf(':'); const p = l.slice(0, i).split(BS).join('/'); const tok = l.slice(i + 1);
  const m = p.split('/').find((s) => /^(Blocks|Jira|Xray|Fokus)[.][A-Za-z]+$/.test(s));
  if (m && m !== tok) { const k = m + ' -> ' + tok; c[k] = (c[k] || 0) + 1; }
}
Object.keys(c).sort().forEach((k) => console.log(k, 'files=' + c[k]));
console.log(Object.keys(c).length + ' directed pairs');
