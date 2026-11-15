# Jira module

Current-state only — this map records what the code exhibits; it contains no target design.

Module scope: src/Modules/Jira/{Jira.Contracts, Jira.RestApi}

Basis: 6d95994774374e49ae50335e631cec2b0502dd15 · run archmap-2026-10-15-a · back to [index.md](index.md)

Notation: in evidence commands every `\|` stands for a literal `|` (shell pipe, or regex alternation under `rg` / `grep -E`) — type a plain `|` when re-running; run from the repo root.

Cross-module rows touching this module are hosted in index.md: D1-03, D1-04, D1-10, D1-11 (reference graph, directions, Jira/Xray independence).

## Capabilities

| id | capability | EARS statement | entry point file:line | evidence command | output excerpt | rule-coverage | provenance |
|----|------------|----------------|-----------------------|------------------|----------------|---------------|------------|
| D2-44 | Jira module (src/Modules/Jira: Jira.Contracts + Jira.RestApi) · Jira gateway: boards, statuses, sprints by state, sprint / backlog / epic issues, sprint update — company-managed or team-managed client chosen by config | When a Fokus endpoint or sync service calls IJiraClient, the Jira module shall serve it through RestApiJiraClient, or TeamManagedJiraClient when JiraOptions.IsTeamManaged is set. No HTTP endpoint, hub or hosted service of its own: its entry points are the 7 IJiraClient methods. | src/Modules/Jira/Jira.Contracts/IJiraClient.cs:3 (methods :5-:11); src/Modules/Jira/Jira.RestApi/DependencyInjection.cs:15 (registered from src/Services/Fokus/Fokus.API/DependencyInjection.cs:24) | `grep -n -e 'interface IJiraClient' -e 'Task<' src/Modules/Jira/Jira.Contracts/IJiraClient.cs; grep -n -e AddRestApiJira -e IsTeamManaged src/Modules/Jira/Jira.RestApi/DependencyInjection.cs` | `3:public interface IJiraClient` · `5: Task<List<JiraBoard>> GetBoardsAsync(CancellationToken ct);` · `7: Task<List<JiraSprint>> GetSprintsAsync(int boardId, CancellationToken ct, params SprintState[] states);` · `10: Task<List<JiraIssue>> GetEpicIssuesAsync(string epicKey, CancellationToken ct);` · `11: Task<JiraSprint> UpdateSprintAsync(...)` · `15: public static IServiceCollection AddRestApiJira(...)` · `45: if (options.IsTeamManaged)` | rule-coverage: no-registry-estate | archmap-2026-10-15-a@6d95994 · last_verified: 2026-10-15 |

## Data ownership

_No data-ownership rows mined for this module._

## Contracts

| id | surface | kind | declared at | claim | evidence command | output excerpt | provenance |
|----|---------|------|-------------|-------|------------------|----------------|------------|
| D4-01 | Jira module contract `IJiraClient` | module contract (interface) | src/Modules/Jira/Jira.Contracts/IJiraClient.cs:3 | Jira.Contracts exposes one interface with 7 async methods (6 reads: boards, statuses, sprints, sprint issues, backlog issues, epic issues; 1 write: UpdateSprintAsync); the project has no ProjectReference or PackageReference. | `rg -n "Task<" src/Modules/Jira/Jira.Contracts/IJiraClient.cs; rg -c "Reference" src/Modules/Jira/Jira.Contracts/Jira.Contracts.csproj` | `5: Task<List<JiraBoard>> GetBoardsAsync … 11: Task<JiraSprint> UpdateSprintAsync(int sprintId, string name, DateTime startDate, DateTime endDate, string? goal, …)` (7 lines); csproj Reference count: no output (0) | archmap-2026-10-15-a@6d95994 · last_verified: 2026-10-15 |
| D4-02 | `IJiraClient` consumers | module seam (consumer count) | src/Modules/Jira/Jira.Contracts/IJiraClient.cs:3 | 8 non-test files outside Modules/Jira inject `IJiraClient` (owner file and module implementations not counted): 7 API endpoints + 1 Application class (SprintIssueSyncService). | `rg -lw IJiraClient -t cs src -g '!**/Fokus.Tests/**' -g '!src/Modules/Jira/**' \| wc -l` | `8` — UpdateSprintEndpoint, GetBoardsEndpoint, GetJiraSprintsEndpoint, GetStatusesEndpoint, SyncBacklogSprintsEndpoint, SyncSprintsEndpoint, SyncXrayEndpoint, Application/Sync/SprintIssueSyncService.cs | archmap-2026-10-15-a@6d95994 · last_verified: 2026-10-15 |
| D4-03 | Jira.Contracts DTOs inside the service layers | module seam (DTO reach) | src/Services/Fokus/Fokus.Domain/Sprint/Sprint.cs:10 | Jira.Contracts types (JiraIssue, JiraSprint, SprintState) are referenced by 6 Domain, 1 Persistence, 8 Application and 11 API non-test files; the Sprint aggregate's persisted `State` property is typed `Jira.Contracts.SprintState`, and aggregates expose `FromJira(JiraIssue/JiraSprint)` factories. Jira.Contracts is a global using in all four service projects. lens-note: the integration DTO vocabulary is the domain's vocabulary. Merged from: D1-14 (6 Fokus.Domain files name a Jira.Contracts type, owner GlobalUsings not counted). | `rg -l -t cs -g '!**/Migrations/**' '\b(JiraIssue\|JiraSprint\|SprintState\|JiraBoard\|JiraStatus)\b' src/Services/Fokus/Fokus.Domain \| wc -l` (repeat per project); `rg -n "SprintState State\|FromJira" src/Services/Fokus/Fokus.Domain` ; `rg -n "global using Jira.Contracts" src -t cs` | Domain 6 / Persistence 1 (SprintRepository.cs) / Application 8 / API 11; `Sprint.cs:10: public SprintState State { get; set; }`; `Behaviors/Sprint.cs:7: public static Sprint FromJira(JiraSprint dto, string boardName)`; `Ticket.cs:16: public static Ticket FromJira(JiraIssue dto)`; global using in Fokus.API, .Application, .Domain, .Persistence GlobalUsings.cs | archmap-2026-10-15-a@6d95994 · last_verified: 2026-10-15 |
| D4-04 | Jira implementation `Jira.RestApi` (Refit REST client) | outbound integration (Jira Cloud REST) | src/Modules/Jira/Jira.RestApi/IJiraApi.cs:6 | Refit interface `IJiraApi` declares 9 Jira routes: 8 GET (`/rest/agile/1.0/board`, `/rest/api/3/status`, board sprints, sprint issues, board backlog, epic issues, `/rest/api/3/search/jql`, issue changelog) + 1 POST `/rest/agile/1.0/sprint/{sprintId}`. | `rg -n '\[(Get\|Post\|Put\|Delete\|Patch)\(' src/Modules/Jira/Jira.RestApi/IJiraApi.cs` | `8: [Get("/rest/agile/1.0/board")] … 26: [Get("/rest/api/3/search/jql")] 29: [Get("/rest/api/3/issue/{issueIdOrKey}/changelog")] 32: [Post("/rest/agile/1.0/sprint/{sprintId}")]` (9 lines) | archmap-2026-10-15-a@6d95994 · last_verified: 2026-10-15 |
| D4-05 | Jira auth + implementation switch | outbound integration (auth, registration) | src/Modules/Jira/Jira.RestApi/DependencyInjection.cs:15 | `AddRestApiJira` binds section `Jira` with DataAnnotations + ValidateOnStart, sets HTTP Basic auth from `Email:ApiToken`, and registers `IJiraClient` transient as `TeamManagedJiraClient` when `IsTeamManaged` (default true) else `RestApiJiraClient`. | `rg -n 'GetSection\|ValidateOnStart\|"Basic"\|IsTeamManaged\|AddTransient<IJiraClient>' src/Modules/Jira/Jira.RestApi/DependencyInjection.cs src/Modules/Jira/Jira.RestApi/JiraOptions.cs` | `DependencyInjection.cs:18: .Bind(configuration.GetSection("Jira"))` `:20: .ValidateOnStart();` `:37: … new AuthenticationHeaderValue("Basic", credentials);` `:40: services.AddTransient<IJiraClient>(sp =>` `:45: if (options.IsTeamManaged)` `JiraOptions.cs:13: public bool IsTeamManaged { get; set; } = true;` | archmap-2026-10-15-a@6d95994 · last_verified: 2026-10-15 |

## Boundaries

_No module-specific boundary rows; see index.md cross-module rows._

