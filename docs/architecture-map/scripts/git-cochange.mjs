// Re-runs D1-25 / D1-26 / D1-27 from the repo root: node docs/architecture-map/scripts/git-cochange.mjs
// Source: git log --no-merges --format=@@%h --name-only af34cde -- src client/src
// Scope: client/src files and src .cs/.csproj files, excluding Migrations and Fokus.Tests.
import { execFileSync } from 'node:child_process';
const log = execFileSync('git', ['log', '--no-merges', '--format=@@%h', '--name-only', 'af34cde', '--', 'src', 'client/src'], { encoding: 'utf8', maxBuffer: 1 << 26 });
const commits = []; let cur = null;
for (const l of log.split(/\r?\n/)) { if (l.startsWith('@@')) { cur = { h: l.slice(2), files: [] }; commits.push(cur); } else if (l.trim() && cur) cur.files.push(l.trim()); }
const inScope = (f) => !f.includes('/Migrations/') && !f.includes('/Fokus.Tests/') && (f.startsWith('client/src/') || (f.startsWith('src/') && /[.](cs|csproj)$/.test(f)));
const mod = (f) => { if (f.startsWith('client/src/')) return 'client'; let m; if (f.startsWith('src/BuildingBlocks/')) return 'BuildingBlocks'; if ((m = f.match(/^src\/Modules\/(Jira|Xray)\//))) return m[1]; if ((m = f.match(/^src\/Services\/Fokus\/(Fokus\.[A-Za-z]+)\//))) return m[1]; return 'other'; };
const mp = {}, fp = {}; let considered = 0, skipped = 0;
for (const c of commits) {
  const fs_ = c.files.filter(inScope); const mods = [...new Set(fs_.map(mod))].sort();
  for (let i = 0; i < mods.length; i++) for (let j = i + 1; j < mods.length; j++) { const k = mods[i] + '<>' + mods[j]; mp[k] = (mp[k] || 0) + 1; }
  if (fs_.length > 60) { skipped++; continue; } considered++;
  for (let i = 0; i < fs_.length; i++) for (let j = i + 1; j < fs_.length; j++) if (mod(fs_[i]) !== mod(fs_[j])) { const k = [fs_[i], fs_[j]].sort().join(' <> '); fp[k] = (fp[k] || 0) + 1; }
}
console.log('commits ' + commits.length);
Object.entries(mp).filter(([, v]) => v >= 5).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log('MODULE-PAIR', v, k));
console.log('file-pair commits considered ' + considered + ' skipped(>60 in-scope files) ' + skipped);
const top = Object.entries(fp).filter(([, v]) => v >= 5).sort((a, b) => b[1] - a[1]);
console.log('FILE-PAIRS>=5: ' + top.length); top.forEach(([k, v]) => console.log('FILE-PAIR', v, k));
console.log('LARGEST-COMMITS (all files in commit): ' + commits.map((c) => [c.h, c.files.length]).sort((a, b) => b[1] - a[1]).slice(0, 5).map((x) => x.join(' ')).join(' · '));
