// Re-runs the D1-03 / D1-08 / D1-09 checks from the repo root: node docs/architecture-map/scripts/ref-graph.mjs
// Reads the non-test ProjectReference graph, runs the D1-04 scan, and prints the code pairs with no direct
// reference (transitive or none) plus reference pairs with no code use and the cycle count.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const BS = String.fromCharCode(92);
const csprojs = execFileSync('find', ['src', '-maxdepth', '4', '-name', '*.csproj', '-not', '-path', '*/bin/*', '-not', '-path', '*/Fokus.Tests/*'], { encoding: 'utf8' }).split(/\r?\n/).filter(Boolean);
const adj = {}; const direct = new Set();
for (const f of csprojs) {
  const n = path.basename(f, '.csproj'); adj[n] = adj[n] || [];
  for (const m of fs.readFileSync(f, 'utf8').matchAll(/ProjectReference Include="([^"]*)"/g)) {
    const t = m[1].split(BS).join('/').split('/').pop().replace('.csproj', ''); adj[n].push(t); direct.add(n + ' -> ' + t);
  }
}
console.log('ProjectReference edges: ' + direct.size);
const re = '\\b(Blocks|Jira|Xray|Fokus)\\.(Core|Exceptions|Domain|AspNetCore|EntityFrameworkCore|FastEndpoints|Contracts|RestApi|GraphQL|API|Application|Persistence)\\b';
const out = execFileSync('rg', ['-o', '--no-heading', '-g', '*.cs', '-g', '!**/bin/**', '-g', '!**/obj/**', '-g', '!**/Migrations/**', '-g', '!**/Fokus.Tests/**', re, 'src'], { encoding: 'utf8', maxBuffer: 1 << 26 });
const pairs = new Set();
for (const l of new Set(out.split(/\r?\n/).filter(Boolean))) {
  const i = l.lastIndexOf(':'); const p = l.slice(0, i).split(BS).join('/'); const tok = l.slice(i + 1);
  const m = p.split('/').find((s) => /^(Blocks|Jira|Xray|Fokus)[.][A-Za-z]+$/.test(s)); if (m && m !== tok) pairs.add(m + ' -> ' + tok);
}
const reach = (s, seen = new Set()) => { for (const n of adj[s] || []) if (!seen.has(n)) { seen.add(n); reach(n, seen); } return seen; };
console.log('code pairs: ' + pairs.size + ' · with a direct reference: ' + [...pairs].filter((p) => direct.has(p)).length);
for (const p of [...pairs].filter((p) => !direct.has(p)).sort()) { const [a, b] = p.split(' -> '); console.log('no direct reference: ' + p + (reach(a).has(b) ? ' (transitive path)' : ' (NO PATH)')); }
for (const d of [...direct].filter((d) => !pairs.has(d)).sort()) console.log('reference without code use: ' + d);
console.log('cycles in reference graph: ' + Object.keys(adj).filter((s) => reach(s).has(s)).length);
