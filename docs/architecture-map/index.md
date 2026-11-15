# Architecture map — Fokus

Current-state only — this map records what the code exhibits; it contains no target design.

## How to read this map

This map describes what the code is today, project by project. It does not say what the code should be; for that, see the decided architecture below. Start with the context map on this page, then open the file for the project you care about.

Every table row is one checked fact, and the columns are the same in every file:

- **id**: a short label such as `D1-03`, so other rows can refer to it. The letter group tells you the kind of fact: D1 is how projects depend on each other, D2 is what the app can do and where each feature starts, D3 is which project owns which data, and D4 is the contracts and seams between projects.
- **claim** (or **statement**): the fact in one sentence.
- **evidence command**: a command you can run from the repo root to see the fact for yourself. A `\|` in it stands for a plain `|`.
- **output excerpt**: what that command printed when the map was made.
- **file:line** (or **declared at**, **entry point**): where in the code to look.
- **provenance**: the stamp at the end of each row. It says which run of the map wrote the row and which commit it was checked against (`archmap-2026-10-15-a@af34cde`), and the date it was last checked (`last_verified`). Where the code has changed since that commit, re-run a row's command to see whether its fact still holds.
- **lens-note** (inside a claim): the only place a judgment appears; everything else is plain fact.
- **rule-coverage**: whether a written list of business rules covers the feature. This repo keeps none, so it always reads `no-registry-estate`.

For the design problems found in the same code, and what not to copy, see [Known open work](../known-open-work.md).

Decided architecture: docs/architecture/ (index.md, v1.md) — the decided record wins for intent, this map for current-state fact.

Basis: af34cdeef7c8152ea405efe1268eea4fae1d055a

## Context map

Every row in this map is a fact: a statement, the command that reproduces it, the output excerpt, and provenance `archmap-2026-10-15-a@af34cde` with `last_verified: 2026-10-15`. Judgment appears only as `lens-note:` riding on a fact. Notation: in evidence commands every `\|` stands for a literal `|` (shell pipe, or regex alternation under `rg` / `grep -E`) — type a plain `|` when re-running; commands run from the repo root, and the helper scripts they cite live in `docs/architecture-map/scripts/`. Module files: [BuildingBlocks.md](BuildingBlocks.md) · [Jira.md](Jira.md) · [Xray.md](Xray.md) · [Fokus.Domain.md](Fokus.Domain.md) · [Fokus.Application.md](Fokus.Application.md) · [Fokus.Persistence.md](Fokus.Persistence.md) · [Fokus.API.md](Fokus.API.md) · [client.md](client.md).

### Modules

| project | module file | direct ProjectReferences | what it holds (row ids) |
|---|---|---|---|
| Blocks.Core | [BuildingBlocks.md](BuildingBlocks.md) | Blocks.Exceptions | Guard, GuardExtensions, MaxLength, FluentValidation extensions (D1-06); `Blocks.Core` namespaces are global usings in Fokus.API and Fokus.Application (D1-05) |
| Blocks.Exceptions | [BuildingBlocks.md](BuildingBlocks.md) | — (none) | HttpException family mapped to HTTP status by the global middleware (D4-17) |
| Blocks.Domain | [BuildingBlocks.md](BuildingBlocks.md) | Blocks.Core | Entity, AggregateRoot, ValueObject, DomainException, domain-event interfaces (D4-15, D4-18) |
| Blocks.AspNetCore | [BuildingBlocks.md](BuildingBlocks.md) | Blocks.Domain, Blocks.Exceptions | GlobalExceptionMiddleware (D4-17) |
| Blocks.EntityFrameworkCore | [BuildingBlocks.md](BuildingBlocks.md) | Blocks.Domain, Blocks.Exceptions | ApplicationDbContext, RepositoryBase, EntityConfiguration bases, save interceptor (D4-18, D4-15) |
| Blocks.FastEndpoints | [BuildingBlocks.md](BuildingBlocks.md) | Blocks.Domain | DomainEventPublisher (D1-16) |
| Jira.Contracts | [Jira.md](Jira.md) | — (none) | IJiraClient (7 methods) + DTOs; no reference of its own (D4-01) |
| Jira.RestApi | [Jira.md](Jira.md) | Jira.Contracts, Blocks.Exceptions | Refit IJiraApi (9 routes), RestApiJiraClient / TeamManagedJiraClient, JiraOptions (D4-04, D4-05) |
| Xray.Contracts | [Xray.md](Xray.md) | — (none) | IXrayClient (4 methods) + 5 DTO classes; no reference of its own (D4-06) |
| Xray.GraphQL | [Xray.md](Xray.md) | Xray.Contracts, Blocks.Exceptions | GraphQLXrayClient, XrayBearerTokenManager, XrayRateLimiter, XrayOptions (D4-08, D3-22) |
| Fokus.Domain | [Fokus.Domain.md](Fokus.Domain.md) | Blocks.Domain, Jira.Contracts | 2 aggregate roots (Sprint, Ticket) + 7 entities, AppSettings, 16 registered Domain classes (15 calculators + WorkflowStageResolver) (D3-08, D4-18, D4-29) |
| Fokus.Persistence | [Fokus.Persistence.md](Fokus.Persistence.md) | Fokus.Domain, Blocks.EntityFrameworkCore, Blocks.FastEndpoints | FokusDbContext (13 DbSets, SQLite), 7 concrete repositories (D4-20, D3-14) |
| Fokus.Application | [Fokus.Application.md](Fokus.Application.md) | Fokus.Domain, Fokus.Persistence, Jira.Contracts, Xray.Contracts | 8 registered capability classes (sync services, analytics *Inputs loaders) (D4-29, D3-13) |
| Fokus.API | [Fokus.API.md](Fokus.API.md) | Fokus.Application, Fokus.Domain, Fokus.Persistence, Blocks.AspNetCore, Jira.Contracts, Jira.RestApi, Xray.Contracts, Xray.GraphQL | 55 attribute-routed FastEndpoints files, minimal /auth/login, SprintHub, cookie + Google auth, host (D4-10, D4-12, D4-13) |
| client (Vue 3 SPA) | [client.md](client.md) | — (no compile-time link to backend code) | 11 Pinia setup stores, one `apiFetch` wrapper, one SignalR subscription (D3-26, D4-24, D1-19) |
| Fokus.Tests | — | out of scope | test project, excluded from the map |

Direct ProjectReference graph: 28 edges, acyclic (D1-03, D1-10).

### Dependency-direction matrix

Cell = number of source-project files whose code names the target project (using or inline; the owner namespace is not counted; D1-04, a floor not a usage measure — D1-05). `t` = code edge with no direct ProjectReference (compiles through a transitive path, D1-08); `c` = XML-doc `cref` only, no reference path (D1-07, D1-09); `r0` = declared ProjectReference with no code use (D1-06); `·` = no edge. Abbreviations: Core = Blocks.Core, Exc = Blocks.Exceptions, Dom = Blocks.Domain, ASP = Blocks.AspNetCore, EF = Blocks.EntityFrameworkCore, FE = Blocks.FastEndpoints, JiC = Jira.Contracts, JiR = Jira.RestApi, XrC = Xray.Contracts, XrG = Xray.GraphQL, FDom = Fokus.Domain, FPer = Fokus.Persistence, FApp = Fokus.Application, FAPI = Fokus.API.

| from \ to | Core | Exc | Dom | ASP | EF | FE | JiC | JiR | XrC | XrG | FDom | FPer | FApp | FAPI |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Blocks.Core | — | 2 | · | · | · | · | · | · | · | · | · | · | · | · |
| Blocks.Exceptions | · | — | · | · | · | · | · | · | · | · | · | · | · | · |
| Blocks.Domain | r0 | · | — | · | · | · | · | · | · | · | · | · | · | · |
| Blocks.AspNetCore | · | 1 | 1 | — | · | · | · | · | · | · | · | · | · | · |
| Blocks.EntityFrameworkCore | · | 1 | 5 | · | — | · | · | · | · | · | · | · | · | · |
| Blocks.FastEndpoints | · | · | 1 | · | · | — | · | · | · | · | · | · | · | · |
| Jira.Contracts | · | · | · | · | · | · | — | · | · | · | · | · | · | · |
| Jira.RestApi | · | 2 | · | · | · | · | 4 | — | · | · | · | · | · | · |
| Xray.Contracts | · | 1c | · | · | · | · | · | · | — | · | · | · | · | · |
| Xray.GraphQL | · | 2 | · | · | · | · | · | · | 2 | — | · | · | · | · |
| Fokus.Domain | · | · | 2 | · | · | · | 1 | · | · | · | — | · | · | · |
| Fokus.Persistence | · | · | 1t | · | 13 | 1 | 1t | · | · | · | 3 | — | · | · |
| Fokus.Application | 1t | 1t | · | · | · | · | 2 | · | 1 | · | 2 | 1 | — | · |
| Fokus.API | 1t | 1t | · | 1 | · | · | 4 | 3 | 1 | 2 | 1 | 5 | 6 | — |

### External seams

| seam | direction | declared in | rows |
|---|---|---|---|
| Jira Cloud REST (Refit `IJiraApi`, HTTP Basic) | outbound | Jira.RestApi | D4-04, D4-05, D2-44 |
| Xray Cloud GraphQL + `/api/v2/authenticate` (Bearer) | outbound | Xray.GraphQL | D4-08, D2-45 |
| Google OAuth sign-in + cookie auth, `Admins` policy | inbound | Fokus.API (Auth) | D4-12, D4-13, D2-01, D2-02 |
| SQLite file (`Data Source=fokus.db`) | persistence | Fokus.Persistence | D4-20 |
| HTTP JSON API under `/api` (55 attribute routes) + `/auth/login` + SPA fallback | inbound | Fokus.API | D4-10, D4-11, D4-12 |
| SignalR hub `/hubs/sprint` (`SprintSynced`, server to client) | inbound push | Fokus.API (Hubs) | D4-14, D2-42 |
| Browser SPA over `/api`, `/auth/login`, `/hubs/sprint` | consumer | client | D1-19, D1-22, D4-24 |
| Static configuration (`appsettings.json`: ConnectionStrings, Google, Jira, Xray) | startup | Fokus.API | D4-22 |
| Message broker / gRPC | absent | — | D4-16 |

### Cross-module evidence

Rows that span several modules are hosted here.

#### Boundaries

| id | claim | evidence command | output excerpt | file:line | provenance |
|----|-------|------------------|----------------|-----------|------------|
| D1-01 | The backend module set is 15 projects in one solution: 6 BuildingBlocks, 4 Modules (Jira, Xray: Contracts + adapter each), 5 under Services/Fokus (API, Application, Domain, Persistence, Tests — Tests out of scope); there is no `src/ApiGateway` | `find src -maxdepth 4 -name "*.csproj" -not -path "*/bin/*" \| sort; ls src` | `Blocks.{AspNetCore,Core,Domain,EntityFrameworkCore,Exceptions,FastEndpoints} … Jira.Contracts Jira.RestApi Xray.Contracts Xray.GraphQL Fokus.API Fokus.Application Fokus.Domain Fokus.Persistence Fokus.Tests` · `src: BuildingBlocks Directory.Packages.props Fokus.slnx Modules Services` | src/Fokus.slnx:3-25 | archmap-2026-10-15-a@af34cde · last_verified: 2026-10-15 |
| D1-02 | Namespaces align 1:1 with project names (first two segments), so a `Proj.X` token is a sound proxy for a dependency on project `Proj` | `rg -o --no-filename -g '*.cs' -g '!**/bin/**' -g '!**/obj/**' -g '!**/Migrations/**' '^namespace ([A-Za-z]+\.[A-Za-z]+)' -r '$1' src/BuildingBlocks src/Modules src/Services/Fokus/Fokus.{API,Application,Domain,Persistence} \| sort \| uniq -c` | `1 Blocks.AspNetCore · 4 Blocks.Core · 10 Blocks.Domain · 6 Blocks.EntityFrameworkCore · 7 Blocks.Exceptions · 1 Blocks.FastEndpoints · 142 Fokus.API · 9 Fokus.Application · 81 Fokus.Domain · 25 Fokus.Persistence · 8 Jira.Contracts · 5 Jira.RestApi · 2 Xray.Contracts · 5 Xray.GraphQL` (no foreign namespace prefix) | src/BuildingBlocks/Blocks.Core/Guard.cs:3 | archmap-2026-10-15-a@af34cde · last_verified: 2026-10-15 |
| D1-03 | ProjectReference graph (28 edges, non-test): Blocks.Core→Exceptions; Blocks.Domain→Core; Blocks.AspNetCore→{Domain,Exceptions}; Blocks.EFCore→{Domain,Exceptions}; Blocks.FastEndpoints→Domain; Jira.RestApi→{Jira.Contracts,Blocks.Exceptions}; Xray.GraphQL→{Xray.Contracts,Blocks.Exceptions}; Fokus.Domain→{Blocks.Domain,Jira.Contracts}; Fokus.Persistence→{Fokus.Domain,Blocks.EFCore,Blocks.FastEndpoints}; Fokus.Application→{Fokus.Domain,Fokus.Persistence,Jira.Contracts,Xray.Contracts}; Fokus.API→{Application,Domain,Persistence,Blocks.AspNetCore,Jira.Contracts,Jira.RestApi,Xray.Contracts,Xray.GraphQL}; Blocks.Exceptions, Jira.Contracts, Xray.Contracts reference nothing | `grep -n "ProjectReference" $(find src -maxdepth 4 -name "*.csproj" -not -path "*/Fokus.Tests/*" \| sort)` | `Fokus.Application.csproj:11: <ProjectReference Include="..\Fokus.Persistence\Fokus.Persistence.csproj" />` · `Fokus.Domain.csproj:11: <ProjectReference Include="..\..\..\Modules\Jira\Jira.Contracts\Jira.Contracts.csproj" />` · `Fokus.Persistence.csproj:17: …Blocks.FastEndpoints.csproj` (28 lines total) | src/Services/Fokus/Fokus.API/Fokus.API.csproj:23-30 | archmap-2026-10-15-a@af34cde · last_verified: 2026-10-15 |
| D1-04 | Code-level direction matrix (files in source project containing any `Proj.` token of the target project, using or inline; owner's own namespace not counted): API→{Application 6, Persistence 5, Jira.Contracts 4, Jira.RestApi 3, Xray.GraphQL 2, Xray.Contracts 1, Domain 1, Blocks.AspNetCore 1, Blocks.Core 1, Blocks.Exceptions 1}; Application→{Domain 2, Jira.Contracts 2, Persistence 1, Xray.Contracts 1, Blocks.Core 1, Blocks.Exceptions 1}; Persistence→{Blocks.EFCore 13, Domain 3, Blocks.Domain 1, Blocks.FastEndpoints 1, Jira.Contracts 1}; Domain→{Blocks.Domain 2, Jira.Contracts 1}; Jira.RestApi→{Jira.Contracts 4, Blocks.Exceptions 2}; Xray.GraphQL→{Xray.Contracts 2, Blocks.Exceptions 2}; Xray.Contracts→{Blocks.Exceptions 1}; Blocks.EFCore→{Domain 5, Exceptions 1}; Blocks.AspNetCore→{Domain 1, Exceptions 1}; Blocks.Core→Exceptions 2; Blocks.FastEndpoints→Domain 1 | `rg -o --no-heading -g '*.cs' -g '!**/bin/**' -g '!**/obj/**' -g '!**/Migrations/**' -g '!**/Fokus.Tests/**' '\b(Blocks\|Jira\|Xray\|Fokus)\.(Core\|Exceptions\|Domain\|AspNetCore\|EntityFrameworkCore\|FastEndpoints\|Contracts\|RestApi\|GraphQL\|API\|Application\|Persistence)\b' src \| sort -u`, then `node docs/architecture-map/scripts/dir-matrix.mjs` (the same scan; de-duplicates (file, token), drops the owner namespace, prints the file count per (source project, target) pair) | `Fokus.API -> Fokus.Application files=6` · `Fokus.Persistence -> Blocks.EntityFrameworkCore files=13` · `Xray.Contracts -> Blocks.Exceptions files=1` · `34 directed pairs` | src/Services/Fokus/Fokus.API/GlobalUsings.cs:1-18 | archmap-2026-10-15-a@af34cde · last_verified: 2026-10-15 |
| D1-05 | File counts in D1-04 are a FLOOR, not a usage measure: the four Fokus projects import other modules through `GlobalUsings.cs`, so one file carries the edge for the whole project (e.g. Fokus.Domain's only Jira.Contracts import is its GlobalUsings, yet 6 Domain files use Jira types) | `rg -n -g '*.cs' -g '!**/bin/**' -g '!**/obj/**' -g '!**/Fokus.Tests/**' '^\s*global\s+using\s+(Blocks\|Jira\|Xray\|Fokus)\.' src` | `Fokus.Persistence\GlobalUsings.cs:3:global using Jira.Contracts;` · `Fokus.Domain\GlobalUsings.cs:4:global using Jira.Contracts;` · `Fokus.API\GlobalUsings.cs:9:global using Fokus.Persistence.Repositories;` · `Fokus.Application\GlobalUsings.cs:4:global using Fokus.Persistence.Repositories;` (27 lines, 4 files) | src/Services/Fokus/Fokus.Domain/GlobalUsings.cs:4 | archmap-2026-10-15-a@af34cde · last_verified: 2026-10-15 |
| D1-08 | Use-via-transitive-reference: 6 code edges have no DIRECT ProjectReference and compile only through a transitive path — API→Blocks.Core, API→Blocks.Exceptions (via Blocks.AspNetCore→Domain→Core→Exceptions), Application→Blocks.Core, Application→Blocks.Exceptions (via Fokus.Domain→Blocks.Domain→Core), Persistence→Blocks.Domain (via Blocks.EFCore), Persistence→Jira.Contracts (via Fokus.Domain) | `node docs/architecture-map/scripts/ref-graph.mjs` (diffs the D1-03 reference list against the D1-04 pairs and prints every pair with no direct reference); edge sources: `rg -n '^\s*global\s+using\s+(Blocks\.Core\|Blocks\.Exceptions\|Jira\.Contracts)' src/Services/Fokus/Fokus.API src/Services/Fokus/Fokus.Application src/Services/Fokus/Fokus.Persistence; rg -n 'Blocks\.Domain' src/Services/Fokus/Fokus.Persistence/DependencyInjection.cs` | `Fokus.API\GlobalUsings.cs:1:global using Blocks.Core;` · `:2:global using Blocks.Exceptions;` · `Fokus.Application\GlobalUsings.cs:1:global using Blocks.Core;` · `:2:global using Blocks.Exceptions;` · `Fokus.Persistence\GlobalUsings.cs:3:global using Jira.Contracts;` · `DependencyInjection.cs:1:using Blocks.Domain.Events;` · ref-graph.mjs: `code pairs: 34 · with a direct reference: 27` · `no direct reference: Fokus.API -> Blocks.Core (transitive path)` · `Fokus.API -> Blocks.Exceptions` · `Fokus.Application -> Blocks.Core` · `Fokus.Application -> Blocks.Exceptions` · `Fokus.Persistence -> Blocks.Domain` · `Fokus.Persistence -> Jira.Contracts` (each `(transitive path)`) | src/Services/Fokus/Fokus.Persistence/GlobalUsings.cs:3 | archmap-2026-10-15-a@af34cde · last_verified: 2026-10-15 |
| D1-09 | Of the 34 code-level pairs in D1-04, 27 are backed by a direct ProjectReference and 6 compile only through a transitive path (D1-08); the 34th, Xray.Contracts -> Blocks.Exceptions, is the doc-only `cref` of D1-07 and has no reference path at all, so not every code edge points to a project reachable in the reference graph. | `node docs/architecture-map/scripts/ref-graph.mjs` (set difference of the D1-04 pairs minus the D1-03 pairs, then transitive closure over the 28-edge ProjectReference graph) | `ProjectReference edges: 28` · `code pairs: 34 · with a direct reference: 27` · six pairs `(transitive path)` · `no direct reference: Xray.Contracts -> Blocks.Exceptions (NO PATH)` · `reference without code use: Blocks.Domain -> Blocks.Core` · `cycles in reference graph: 0` | src/Services/Fokus/Fokus.API/Fokus.API.csproj:23 | archmap-2026-10-15-a@af34cde · last_verified: 2026-10-15 |
| D1-10 | No cycle exists: the code graph is a DAG layered BuildingBlocks ← Modules ← Fokus.Domain ← Fokus.Persistence ← Fokus.Application ← Fokus.API — each reverse direction is absent | `G=(-g '*.cs' -g '!**/bin/**' -g '!**/obj/**' -g '!**/Migrations/**' -g '!**/Fokus.Tests/**'); rg -l "${G[@]}" '\b(Jira\|Xray\|Fokus)\.[A-Z]' src/BuildingBlocks; rg -l "${G[@]}" '\bFokus\.[A-Z]' src/Modules; rg -l "${G[@]}" '\bFokus\.(Application\|Persistence\|API)\b' src/Services/Fokus/Fokus.Domain; rg -l "${G[@]}" '\bFokus\.(Application\|API)\b' src/Services/Fokus/Fokus.Persistence; rg -l "${G[@]}" '\bFokus\.API\b' src/Services/Fokus/Fokus.Application` (each `\| wc -l`; controls: Domain-pattern on Fokus.API → 144, BB-pattern on Fokus.Domain → 82) | `A BB->Jira\|Xray\|Fokus: 0 · B Modules->Fokus: 0 · E Domain->App\|Pers\|API: 0 · F Pers->App\|API: 0 · G App->API: 0` | src/Services/Fokus/Fokus.Domain/Fokus.Domain.csproj:10-11 | archmap-2026-10-15-a@af34cde · last_verified: 2026-10-15 |
| D1-11 | The two integration modules are mutually independent (Jira never names Xray, Xray never names Jira) and both Contracts projects are leaves that name no adapter and no Fokus type | `G=(-g '*.cs' -g '!**/bin/**' -g '!**/obj/**' -g '!**/Migrations/**' -g '!**/Fokus.Tests/**'); rg -l "${G[@]}" '\bXray\.[A-Z]' src/Modules/Jira; rg -l "${G[@]}" '\bJira\.[A-Z]' src/Modules/Xray; rg -l "${G[@]}" '\b(Fokus\.\|Jira\.RestApi\|Xray\.GraphQL)' src/Modules/Jira/Jira.Contracts src/Modules/Xray/Xray.Contracts` | `C Jira->Xray: 0 · D Xray->Jira: 0 · K contracts->Fokus\|RestApi\|GraphQL: 0` · lens-note: `XrayJiraIssueLinkDto` lives in Xray.Contracts as Xray's own DTO, not a Jira.Contracts import | src/Modules/Jira/Jira.Contracts/Jira.Contracts.csproj:1 | archmap-2026-10-15-a@af34cde · last_verified: 2026-10-15 |
| D1-25 | [history-derived, flagged boundary fact] Evolutionary coupling, module level (flagged boundary fact): of 30 non-merge commits touching `src`/`client/src` up to the basis, client co-changes with Fokus.API in 23 and with Fokus.Persistence in 12; Fokus.API↔Persistence 16, API↔Domain 13, Domain↔Persistence 11, Domain↔client 9; the Jira module co-changes with Persistence 7, API 7, client 5, Domain 5 (Xray, BuildingBlocks, Fokus.Application each < 5 with any partner). Counting: a commit counts once per module pair; Migrations, Fokus.Tests and non-.cs/.csproj backend files excluded | `node docs/architecture-map/scripts/git-cochange.mjs` (runs `git log --no-merges --format='@@%h' --name-only af34cde -- src client/src`; per commit, the set of modules — client = client/src, BuildingBlocks as one, Modules by folder, Services by project — counts unordered module pairs and prints the MODULE-PAIR lines ≥5) | `30` · `23 Fokus.API<>client · 16 Fokus.API<>Fokus.Persistence · 13 Fokus.API<>Fokus.Domain · 12 Fokus.Persistence<>client · 11 Fokus.Domain<>Fokus.Persistence · 9 Fokus.Domain<>client · 7 Fokus.Persistence<>Jira · 7 Fokus.API<>Jira · 5 Jira<>client · 5 Fokus.Domain<>Jira` | client/src/types/index.ts:1 | archmap-2026-10-15-a@af34cde · last_verified: 2026-10-15 |
| D1-26 | [history-derived, flagged boundary fact] Evolutionary coupling, file level (support ≥5, cross-module pairs, commits touching > 60 in-scope files skipped — 5 of 30): the top cross-boundary pair is `client/src/types/index.ts` ↔ `Fokus.API/DependencyInjection.cs` (12), then `client/src/api/analytics.ts` ↔ same DI file (10); the client types file also co-changes ≥5 with Domain `Settings/AppSettings.cs`, Persistence `AppSettingsConfiguration.cs` and `TestExecutionRepository.cs`, and API `GetSettingsEndpoint.cs` / `GetSprintSummaryEndpoint.cs` | `node docs/architecture-map/scripts/git-cochange.mjs` (same script; FILE-PAIR lines: per commit with ≤60 in-scope files, every file pair whose modules differ, counted, printed ≥5) | `FILE-PAIR 12 client/src/types/index.ts <> src/Services/Fokus/Fokus.API/DependencyInjection.cs` · `FILE-PAIR 10 client/src/api/analytics.ts <> src/Services/Fokus/Fokus.API/DependencyInjection.cs` · `FILE-PAIR 6 client/src/stores/settingsStore.ts <> src/Services/Fokus/Fokus.API/Features/Settings/GetSettings/GetSettingsEndpoint.cs` · `FILE-PAIR 5 client/src/types/index.ts <> src/Services/Fokus/Fokus.Domain/Settings/AppSettings.cs` · `file-pair commits considered 25 skipped(>60 in-scope files) 5` · `FILE-PAIRS>=5: 21` | src/Services/Fokus/Fokus.API/DependencyInjection.cs:1 | archmap-2026-10-15-a@af34cde · last_verified: 2026-10-15 |
| D1-27 | [history-derived, flagged boundary fact] History caveat for D1-25/26: git paths are not rename-followed and the history is short (30 commits; the five largest touch 215, 142, 115, 108, 86 files), and one ≥5 pair names a file gone at the basis (`Fokus.API/Features/Analytics/SprintSummaryService.cs`), so co-change support reflects pre-F39 locations | `[ -e src/Services/Fokus/Fokus.API/Features/Analytics/SprintSummaryService.cs ] && echo exists \|\| echo GONE; git log --no-merges --format='@@%h' --name-only af34cde -- src client/src \| awk '/^@@/{if(h)print h, n; h=$0; n=0; next} NF{n++} END{print h, n}' \| sort -k2 -nr \| head -5; git log --no-merges --format='@@%h' --name-only af34cde -- src client/src \| grep -c 'Fokus.API/Features/Analytics/SprintSummaryService.cs'` | `GONE src/Services/Fokus/Fokus.API/Features/Analytics/SprintSummaryService.cs` · `@@6727b3e 215 · @@af34cde 142 · @@35cb177 115 · @@0f54bf1 108 · @@254a5c8 86` · `8` (history lines naming the gone file) | src/Services/Fokus/Fokus.API/DependencyInjection.cs:1 | archmap-2026-10-15-a@af34cde · last_verified: 2026-10-15 |

#### Capabilities

| id | capability | EARS statement | entry point file:line | evidence command | output excerpt | rule-coverage | provenance |
|----|------------|----------------|-----------------------|------------------|----------------|---------------|------------|
| D2-46 | (whole src/) · ABSENCE: no hosted/background services, no in-process event handlers, no MassTransit consumers | No capability in src/ is triggered by a timer, a background loop, a domain event or an integration message: every business capability is entered by an HTTP request (55 attribute-routed FastEndpoints files + 1 minimal-API login route) or the OAuth callback; the only push channel is D2-42. lens-note: no class implements IDomainEvent either (the only `: IDomainEvent` text hit is IDomainEventPublisher), so the BuildingBlocks domain-event interceptor has nothing to dispatch. | n/a (absence); route count source: src/Services/Fokus/Fokus.API/Features/**/*Endpoint.cs | `grep -rlE 'IEventHandler<\|BackgroundService\|IHostedService\|AddHostedService\|IConsumer<' src --include=*.cs --exclude-dir=bin --exclude-dir=obj \| wc -l; grep -rlE '\[Http(Get\|Post\|Put\|Patch\|Delete)\(' src/Services/Fokus/Fokus.API --include=*.cs \| wc -l; grep -rn ': IDomainEvent' src --include=*.cs --exclude-dir=bin --exclude-dir=obj` | `0` · `55` · `src/BuildingBlocks/Blocks.FastEndpoints/DomainEventPublisher.cs:6:public class DomainEventPublisher : IDomainEventPublisher` | rule-coverage: no-registry-estate | archmap-2026-10-15-a@af34cde · last_verified: 2026-10-15 |

#### Data ownership

| id | store / type | owner module | declared at | claim | evidence command | output excerpt | provenance |
|----|--------------|--------------|-------------|-------|------------------|----------------|------------|
| D3-21 | Server-side caches / background writers (absence) | — | src/ (whole backend) | No IMemoryCache/IDistributedCache/output or response cache and no hosted/background service is registered anywhere in src; the only singletons are the two Xray module services (D3-22) and `TimeProvider.System`. Every store write is therefore request-driven (endpoint or start-up). The pattern fires on any cache or hosted-service registration line. | `grep -rn "AddSingleton\|AddMemoryCache\|AddHostedService\|AddDistributedMemoryCache\|AddOutputCache\|AddResponseCaching" src --include=*.cs \| grep -v -e /bin/ -e /obj/ -e Fokus.Tests` (BRE; `\|` here is grep's own alternation) | `Modules/Xray/Xray.GraphQL/DependencyInjection.cs:22: services.AddSingleton<XrayBearerTokenManager>();` · `:23: services.AddSingleton<XrayRateLimiter>();` · `Services/Fokus/Fokus.API/DependencyInjection.cs:22: services.TryAddSingleton(TimeProvider.System);` (only hits) | archmap-2026-10-15-a@af34cde · last_verified: 2026-10-15 |

#### Contracts

| id | surface | kind | declared at | claim | evidence command | output excerpt | provenance |
|----|---------|------|-------------|-------|------------------|----------------|------------|
| D4-16 | Integration events / gRPC (claimed stack) | absent seam | src/Directory.Packages.props (package list) | No MassTransit, RabbitMQ, gRPC or Protobuf package, using or type exists in src (CLAUDE.md lists MassTransit+RabbitMQ and gRPC code-first in the stack); the only cross-boundary channels are the two module interfaces (D4-01, D4-06), HTTP (D4-10) and SignalR (D4-14). | `rg -n -i 'masstransit\|rabbitmq\|grpc\|protobuf' src -g '*.props' -g '*.csproj' -g '*.cs' -g '!**/Fokus.Tests/**' \| wc -l` ; `rg -n 'PackageVersion Include' src/Directory.Packages.props \| awk -F'"' '{print $2}'` | `0`; packages: `FastEndpoints FastEndpoints.Swagger FluentValidation Microsoft.AspNetCore.Authentication.Google Microsoft.AspNetCore.OpenApi Microsoft.EntityFrameworkCore(.Design/.Sqlite) Microsoft.Extensions.Http Microsoft.Extensions.Options.DataAnnotations Refit.HttpClientFactory Scalar.AspNetCore` + test packages | archmap-2026-10-15-a@af34cde · last_verified: 2026-10-15 |

## Run report

Run `archmap-2026-10-15-a` · basis `af34cdeef7c8152ea405efe1268eea4fae1d055a` · date 2026-10-15 · stages: four clean-room extractors (D1 boundaries, D2 capability catalog, D3 data ownership, D4 contracts and seams), then consolidate + skeptic (re-execution of every row) + emit.

| measure | count |
|---|---|
| claims mined | 133 (D1 27, D2 46, D3 31, D4 29) |
| after dedup | 121 (12 duplicate rows merged into 10 survivors; each survivor records `Merged from`) |
| verdicts over all 133 mined rows (denominator 133) | writer's first pass: CONFIRMED 128 + IMPRECISE 5 = 133, WRONG 0 · after close-skeptic A: CONFIRMED 127 + IMPRECISE 6 = 133 (D4-26 reclassified), WRONG 0 |
| rows in the map (denominator 121 = 133 − 12 merged duplicates; CONFIRMED + corrected IMPRECISE, after the evidence gate) | 121 of 121 — first pass CONFIRMED 116 + IMPRECISE 5 = 121 · after close-skeptic A CONFIRMED 115 + IMPRECISE 6 = 121 (the 12 merged rows were all CONFIRMED) |
| survival rate | 100.0% of mined rows survived verification (first pass: 128 unchanged, 5 survived only after correction = 3.8%; after close-skeptic A: 127 unchanged, 6 corrected = 4.5%); WRONG rate 0.0% |
| evidence gate (`structuralEvidenceOk`) | 121 pass, 0 dropped |

**WRONG rows:** none. Every one of the 133 evidence commands, re-run against the current source, reproduced the phenomenon the row claims; no row was refuted. Vacuity check: each absence claim (D1-10, D1-11, D1-12, D1-15, D2-46, D3-04, D3-11, D3-21, D3-23, D4-15, D4-16, D4-28) was re-run together with a positive control showing the same pattern fires on a real hit (control outputs are in the run's working notes, not included in the public release).

**IMPRECISE rows (phenomenon real, scope or count off; corrected statement emitted):**

- D1-09: closure over the ProjectReference graph returned `NO PATH Xray.Contracts Blocks.Exceptions` — one of the 34 code pairs has no reference path (the doc-only cref of D1-07), contradicting "all code edges point to a reachable project".
- D2-02: `AuthConfiguration.cs:54-165` branches on the invite token first and sets the company domain only when `settings.CompanyDomain is null` (`:113`); the EARS statement ordered the branches by user count and dropped the null-guard.
- D2-22: `grep -rn -i exclud src/Services/Fokus/Fokus.Application` returns nothing and `ExcludedDeveloperFilter` has no caller besides the 8 endpoints — the lens-note that Application `*Inputs` classes "may" apply the filter is refuted.
- D3-13: `developerRepository.UpsertAsync` is also called at `XrayIssueSyncService.cs:323` and `UpdateTeamConfigEndpoint.cs:11` — `SprintIssueSyncService` is not the single writer of Developers. Corrected a second time by close-skeptic A: it is not the single writer of Sprints either — `UpdateSprintEndpoint.cs:16-19` assigns `sprint.Name/StartDate/EndDate/Goal` and `:21` saves them (D3-09); the row now says "only sync writer".
- D4-18: `rg -w Guard` finds only the comment `EpicProgressCalculator.cs:186: // Guard: …` (no consumer of Blocks.Core `Guard`), and Xray.Contracts names BadGatewayException/UnauthorizedException in XML-doc `cref` text (`IXrayClient.cs:16-17`), which the consumer table omitted.
- D4-26 (reclassified by close-skeptic A from CONFIRMED): `rg -l "from '(\.\./|\./)+types'|from '@/types'" client/src | wc -l` returns 91 (69 files import `'../../types'`, 22 import `'../types'`); the row's pattern matched only the 22 and stated "22 client files import from it".

**Dropped by the evidence gate:** none.

**Method notes**

- Substrate used: deterministic import / ProjectReference scan of the current tree (`rg`, `grep`, `find`, git log). No pre-built dependency graph and no earlier review notes were reused.
- Rule coverage: `no-registry-estate` for every capability row — the repository has no business-rule registry, so no BR-coverage join was possible and no zero-coverage module is flagged.
- Evidence commands are literal: the extractor files' `…` elisions, scratch-file placeholders (`ts.txt`, `gitlog.txt`, `closure.js`) and prose steps were replaced after close-skeptic A by runnable commands or by the scripts in `docs/architecture-map/scripts/` (`dir-matrix.mjs` D1-04, `ref-graph.mjs` D1-08/D1-09, `git-cochange.mjs` D1-25/D1-26, `d4-consumers.mjs` D4-18); each was re-run before its row was edited. Row D4-06 is emitted with the word-bounded command: its unbounded form also matches `XrayTestExecutionsSynced` result properties in three more files.
- Scope: `src/` and `client/src/`; tests, `bin/`, `obj/`, EF `Migrations/` and generated files are excluded.
- Rows D1-25, D1-26, D1-27 derive from git history (30 non-merge commits up to the basis, paths not rename-followed) and are marked `history-derived`.
- Cross-module rows (15) are hosted in this file under Context map; module-specific rows live in the module files.

## Changelog

- 2026-10-15 · run archmap-2026-10-15-a · initial map (basis af34cde): 121 rows across 9 files.
- 2026-10-15 close-skeptic A fixes applied: D3-13 now "only sync writer" and cites UpdateSprintEndpoint.cs:16-19/:21 (D3-09); D4-26 importers 22 → 91 (new pattern, reclassified IMPRECISE); D2-02 null-guard line 115 → 113 with the `-e` flags that print it; the 12 non-re-runnable rows (D1-04, D1-08, D1-09, D1-17, D1-22, D1-25, D1-26, D1-27, D4-18, D4-21, D4-26, D4-29) given literal commands or scripts in docs/architecture-map/scripts/; D1-10, D1-11 and D1-15 `$G` made literal, D1-15 widened to `global using` (control 2 → 3); `\|` notation note added to index.md and every module file; Fokus.Domain row reworded "16 registered Domain classes (15 calculators + WorkflowStageResolver)"; D1-25 prose gains Domain↔client 9; run-report tallies now state both views (133 mined: 128+5 first pass, 127+6 after; 121 in the map: 116+5, 115+6).
