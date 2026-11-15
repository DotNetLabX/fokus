# Fokus.Application

Current-state only — this map records what the code exhibits; it contains no target design.

Module scope: src/Services/Fokus/Fokus.Application

Basis: 6d95994774374e49ae50335e631cec2b0502dd15 · run archmap-2026-10-15-a · back to [index.md](index.md)

Notation: in evidence commands every `\|` stands for a literal `|` (shell pipe, or regex alternation under `rg` / `grep -E`) — type a plain `|` when re-running; run from the repo root.

Cross-module rows touching this module are hosted in index.md: D1-03, D1-04, D1-08, D1-10; Application/API repository reach is row D1-17 in Fokus.API.md.

## Capabilities

_No capability rows mined for this module (it declares no entry point of its own; see Fokus.API.md capabilities that use it)._

## Data ownership

| id | store / type | owner module | declared at | claim | evidence command | output excerpt | provenance |
|----|--------------|--------------|-------------|-------|------------------|----------------|------------|
| D3-13 | SprintIssueSyncService (Jira→store sync writer) | Fokus.Application (Sync) | src/Services/Fokus/Fokus.Application/Sync/SprintIssueSyncService.cs:23 | The only sync writer of Sprints, Tickets, StatusTransitions and SprintMemberships (Sprint `Name/StartDate/EndDate/Goal` are also assigned by `UpdateSprintEndpoint.cs:16-19` and saved at `:21`, D3-09): calls `sprintRepository.UpsertAsync` (:57), `ticketRepository.UpsertAsync` (:111, :145), `ReplaceTransitionsAsync` (:155), `UpsertMembershipsAsync` (:163); reached only from the SyncSprints and SyncBacklogSprints endpoints (no hosted/background job exists — see D3-21). It also upserts Developers (:115, :150), but is not their only writer: `XrayIssueSyncService.cs:323` also upserts Developer rows and `UpdateTeamConfigEndpoint.cs:11` updates them (D3-17). | `grep -rln "SprintIssueSyncService" src/Services/Fokus/Fokus.API --include=*.cs \| grep -v /obj/; grep -nE "Repository\.(Upsert[A-Za-z]*\|Replace[A-Za-z]*)Async" src/Services/Fokus/Fokus.Application/Sync/SprintIssueSyncService.cs \| cut -c1-75; grep -rnE "developerRepository\.(Upsert\|UpdateTeamConfig)Async" src --include=*.cs \| grep -v -e /obj/ -e Fokus.Tests \| cut -d: -f1,2; grep -n 'sprint\.\(Name\|StartDate\|EndDate\|Goal\) =' src/Services/Fokus/Fokus.API/Features/Sprints/UpdateSprint/UpdateSprintEndpoint.cs` | `Fokus.API/Features/Sync/SyncBacklogSprints/SyncBacklogSprintsEndpoint.cs` · `Fokus.API/Features/Sync/SyncSprints/SyncSprintsEndpoint.cs` · `57: await sprintRepository.UpsertAsync(sprint, ct);` · `111: await ticketRepository.UpsertAsync(ticket, ct);` · `115: await developerRepository.UpsertAsync(developer` · `145: await ticketRepository.UpsertAsync(ticket, ct);` · `150: await developerRepository.UpsertAsync(developer, ct);` · `155: await ticketRepository.ReplaceTransitionsAsync(issue.Key, t` · `163: await sprintRepository.UpsertMembershipsAsync(sprint.Id, member` · developer writers: `Fokus.API/Features/Team/UpdateTeamConfig/UpdateTeamConfigEndpoint.cs:11` · `Fokus.Application/Sync/SprintIssueSyncService.cs:115` · `:150` · `Fokus.Application/Xray/XrayIssueSyncService.cs:323` · sprint-field writes outside sync: `16: sprint.Name = req.Name;` · `17: sprint.StartDate = req.StartDate;` · `18: sprint.EndDate = req.EndDate;` · `19: sprint.Goal = req.Goal;` | archmap-2026-10-15-a@6d95994 · last_verified: 2026-10-15 |
| D3-23 | Analytics read path (Domain calculators, Application `*Inputs` loaders, Analytics endpoints) — read-only (absence) | Fokus.Domain/Analytics, Fokus.Application/Analytics, Fokus.API/Features/Analytics | src/Services/Fokus/Fokus.Application/Analytics/ (6 files) | No file under the three analytics trees calls any Add/Upsert/Replace/Delete/Save/Update*Async method; the Application loaders call only repository Get*Async readers (e.g. `sprintRepository.GetSprintsWithMembershipsAsync`, `testExecutionRepository.GetTestExecutionsForSprintAsync`). Pattern fires on any repository write call. | `grep -rlE "\.(Add\|Upsert\|Replace\|Delete\|Save\|Update)[A-Za-z]*Async\(" src/Services/Fokus/Fokus.API/Features/Analytics src/Services/Fokus/Fokus.Application/Analytics src/Services/Fokus/Fokus.Domain --include=*.cs \| grep -v /obj/ \| wc -l` | `0` | archmap-2026-10-15-a@6d95994 · last_verified: 2026-10-15 |

## Contracts

| id | surface | kind | declared at | claim | evidence command | output excerpt | provenance |
|----|---------|------|-------------|-------|------------------|----------------|------------|
| D4-29 | Application/Domain capability seam consumed by API | layer seam (injected concrete classes) | src/Services/Fokus/Fokus.Application/DependencyInjection.cs:17 | `AddFokusApplication` registers 24 concrete classes by type (no interfaces): 16 declared in Fokus.Domain (calculators, e.g. SprintSummaryCalculator) and 8 in Fokus.Application; 19 Fokus.API files reference at least one of the 24 by name. | `P=$(rg -o -N 'services\.Add(Scoped\|Singleton\|Transient)<\w+' src/Services/Fokus/Fokus.Application/DependencyInjection.cs \| sed -E 's/.*<//' \| sort -u \| paste -sd'\|'); echo "$P" \| tr '\|' '\n' \| wc -l; rg -l -t cs "\bclass ($P)\b" src/Services/Fokus -g '!**/Fokus.Tests/**' -g '!**/obj/**' \| grep -o 'Fokus\.[A-Za-z]*' \| sort \| uniq -c; rg -l -t cs -w "($P)" src/Services/Fokus/Fokus.API -g '!**/obj/**' \| wc -l` | `24`; `16 Fokus.Domain` `8 Fokus.Application`; `19`; `19: services.AddScoped<SprintSummaryCalculator>();` | archmap-2026-10-15-a@6d95994 · last_verified: 2026-10-15 |

## Boundaries

_No module-specific boundary rows; see index.md cross-module rows._

