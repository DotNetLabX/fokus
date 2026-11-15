// Re-runs the D4-18 consumer count from the repo root: node docs/architecture-map/scripts/d4-consumers.mjs
// Prints "<n> <BuildingBlocks word> <consumer project>" = number of files in that project naming the word (owner files not counted).
import { execFileSync } from 'node:child_process';
const BS = String.fromCharCode(92);
const words = 'Guard|AggregateRoot|DomainException|ValueObject|BadGatewayException|BadRequestException|ConflictException|NotFoundException|UnauthorizedException|ApplicationDbContext|EntityConfiguration|AuditedEntityConfiguration|RepositoryBase|GlobalExceptionMiddleware|DomainEventPublisher';
const out = execFileSync('rg', ['-o', '-N', '-t', 'cs', '-w', '--with-filename', '-g', '!**/Fokus.Tests/**', '-g', '!**/Migrations/**', '-g', '!**/obj/**', words, 'src/Services', 'src/Modules'], { encoding: 'utf8', maxBuffer: 1 << 26 });
const c = {};
for (const l of new Set(out.split(/\r?\n/).filter(Boolean))) {
  const i = l.lastIndexOf(':'); const p = l.slice(0, i).split(BS).join('/'); const w = l.slice(i + 1);
  const proj = p.split('/').find((s) => /^(Fokus|Jira|Xray)[.][A-Za-z]+$/.test(s)); const k = w + ' ' + proj; c[k] = (c[k] || 0) + 1;
}
Object.keys(c).sort().forEach((k) => console.log(c[k], k));
