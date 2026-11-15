# Known open work

Fokus is a teaching project, and it is not perfect. A review of the code in October 2026 looked for habits a student could copy the wrong way: duplicated rules, logic in the wrong layer, missing small types, uneven error handling, dead code. Every finding below was checked against the code, and none of them has been fixed yet.

Use this page as a list of things **not** to copy. Each finding is in its own area table. The table gives its severity, the file to open first, and the habit to avoid. Bugs, missing features and performance were out of scope for the review. The code behaves as intended; these are design problems.

**97 findings: 4 high, 47 medium, 46 low.**

- **High** — the code breaks a rule the repo itself states (for example "Domain references nothing"), or one business rule is decided in the wrong layer or in three places.
- **Medium** — a habit that spreads if copied: the same rule written several times, a layer doing another layer's job, a missing type.
- **Low** — local untidiness: long parameter lists, dead code, names that mislead.

The file named is where to start reading. Most findings also touch other files nearby.

For what the code looks like as a whole, read the [architecture map](architecture-map/index.md).

## Sprint analytics calculators (backend) — 15

| Severity | File | Do not copy |
|---|---|---|
| High | `src/Services/Fokus/Fokus.Domain/Analytics/Sprints/SprintSummaryCalculator.cs` | Computing the same five sprint rates twice in one class: once for the cards, then again in five sparkline helpers. Compute once and reuse the result. |
| Medium | `src/Services/Fokus/Fokus.Domain/Analytics/Sprints/ScopeChangeCalculator.cs` | Asking "is this a bug?" with the string comparison `IssueType == "Bug"` in 27 places, instead of one named check. |
| Medium | `src/Services/Fokus/Fokus.Domain/Analytics/Sprints/CarryOverCalculator.cs` | Each calculator declaring its own private `IsExcluded` for the excluded-status rule, instead of sharing one. |
| Medium | `src/Services/Fokus/Fokus.Domain/Analytics/Shared/TransitionAttributionChecker.cs` | The workflow-boundary rule (which stages count, where the work ends) written three times in three classes. |
| Medium | `src/Services/Fokus/Fokus.Domain/Analytics/Sprints/ScopeChangeCalculator.cs` | Throwing away the timestamp a shared helper already returns, then working it out again by hand. |
| Medium | `src/Services/Fokus/Fokus.Domain/Analytics/Shared/MetricCard.cs` | Four near-identical records for one KPI-card idea. |
| Medium | `src/Services/Fokus/Fokus.Domain/Analytics/Sprints/SprintSummaryCalculator.cs` | Domain calculators producing card titles, formatted display text and UI tokens as raw strings. Presentation belongs outside the Domain, and closed sets deserve enums. |
| Medium | `src/Services/Fokus/Fokus.Domain/Analytics/Shared/StatusTransitionIndex.cs` | Two competing ways to look up a ticket's status changes, one case-sensitive and one not. |
| Medium | `src/Services/Fokus/Fokus.Domain/Analytics/Sprints/TestTimelineCalculator.cs` | The "finished test run" rule and the pass-rate formula written by hand in eight places. |
| Medium | `src/Services/Fokus/Fokus.Domain/Analytics/Sprints/CarryOverCalculator.cs` | One business rule ("a ticket in three or more sprints is a zombie") implemented in two layers, with two thresholds and two sets of sprints. |
| Medium | `src/Services/Fokus/Fokus.API/Features/Analytics/GetSprintSummary/GetSprintSummaryEndpoint.cs` | One computation split between the endpoint and the calculator, with rule work on both sides. |
| Low | `src/Services/Fokus/Fokus.Domain/Analytics/Sprints/SprintSummaryCalculator.cs` | Methods with 8 to 15 parameters. Group related inputs into a type. |
| Low | `src/Services/Fokus/Fokus.Domain/Analytics/Sprints/ScopeChangeCalculator.cs` | Branches that can never run, and parameters nothing reads. |
| Low | `src/Services/Fokus/Fokus.Domain/Analytics/Shared/SubTeamFilter.cs` | A business rule passed as an optional trailing parameter, so each caller silently decides whether it applies. |
| Low | `src/Services/Fokus/Fokus.Domain/Analytics/Sprints/SprintSummaryCalculator.cs` | Comments that cite spec codes instead of stating the rule. Some codes even mean two different rules. |

## Developer and QA analytics (backend) — 8

| Severity | File | Do not copy |
|---|---|---|
| High | `src/Services/Fokus/Fokus.Domain/Analytics/Developers/DeveloperDetailCalculator.cs` | A private copy of another calculator's progress algorithm, admitted only in a comment. Share the code instead of copying it. |
| Medium | `src/Services/Fokus/Fokus.Domain/Analytics/Shared/CapacityResolver.cs` | The rule "sprint-specific capacity, else the developer's default" written four times, although a shared resolver exists. |
| Medium | `src/Services/Fokus/Fokus.API/Features/Analytics/GetDeveloperDetail/GetDeveloperDetailEndpoint.cs` | A business rule (which developers are left out) written inline in an endpoint instead of in the Domain. |
| Medium | `src/Services/Fokus/Fokus.Domain/Analytics/Developers/DeveloperThroughputResult.cs` | Splitting a change figure (value, direction, good or bad) across long positional records instead of giving it a small type. |
| Low | `src/Services/Fokus/Fokus.Domain/Analytics/Qa/QaWorkloadCalculator.cs` | Parameters that are never read. |
| Low | `src/Services/Fokus/Fokus.Domain/Analytics/Developers/DeveloperQualityCalculator.cs` | Long lists of loosely related parameters, including a true/false mode switch. |
| Low | `src/Services/Fokus/Fokus.API/Features/Analytics/GetQaWorkload/GetQaWorkloadQuery.cs` | Sibling features replying in two styles (immutable records and mutable classes) and declaring shared reply types again. |
| Low | `src/Services/Fokus/Fokus.Domain/Analytics/Developers/DeveloperDetailCalculator.cs` | The same rolling-average method written twice, with the window size as a bare number. |

## Jira and Xray sync (backend) — 14

| Severity | File | Do not copy |
|---|---|---|
| Medium | `src/Services/Fokus/Fokus.Domain/Ticket/Ticket.cs` | Aggregates as open property bags (`{ get; set; }` everywhere), against the repo's own conventions. |
| Medium | `src/Services/Fokus/Fokus.Domain/Ticket/Behaviors/Ticket.cs` | The effective-story-points rule copied line for line into two aggregates, with the `"Bug"` text hard-coded. |
| Medium | `src/Services/Fokus/Fokus.Application/Xray/XrayIssueSyncService.cs` | Seven hand-written `catch (Exception)` blocks with three different outcomes, and the exception left out of the log call. |
| Low | `src/Services/Fokus/Fokus.Domain/Ticket/Behaviors/Ticket.cs` | A factory that crams repeated conditions and fallback values into one object initializer. |
| Low | `src/Services/Fokus/Fokus.Domain/Sprint/Behaviors/SprintMembership.cs` | One method that parses Jira's data format, applies a business rule and sets a flag. |
| Low | `src/Services/Fokus/Fokus.Application/Xray/XrayIssueSyncService.cs` | Long tuple types spelled out again and again instead of named types. |
| Low | `src/Services/Fokus/Fokus.Application/Sync/SprintIssueSyncService.cs` | One result reshaped three times on its way to the reply. |
| Low | `src/Services/Fokus/Fokus.Application/Sync/SprintIssueSyncService.cs` | The question "is Xray switched on?" checked in four places with two different answers. Give it one home on the settings type. |
| Low | `src/Modules/Jira/Jira.RestApi/RestApiJiraClient.cs` | Five copies of the same paging loop. |
| Low | `src/Modules/Jira/Jira.RestApi/RestApiJiraClient.cs` | Retry with back-off written by hand inside the client instead of a resilience handler on the HTTP client, plus an error parser that swallows every exception. |
| Low | `src/Modules/Jira/Jira.RestApi/RestApiJiraClient.cs` | An integration module choosing the app's HTTP status codes: a 401 from Jira becomes the app's own "not signed in". |
| Low | `src/Services/Fokus/Fokus.Application/Sync/SprintIssueSyncService.cs` | One workflow (finding Test Sets) run from two different layers. |
| Low | `src/Modules/Jira/Jira.Contracts/JiraChangelog.cs` | JSON converters for the wire format placed in the public contracts project instead of in the implementation. |
| Low | `src/Services/Fokus/Fokus.Domain/Ticket/Behaviors/Ticket.cs` | Reading `DateTime.UtcNow` in Domain factories although the app registers a `TimeProvider`. |

## Persistence and repositories (backend) — 17

| Severity | File | Do not copy |
|---|---|---|
| High | `src/Services/Fokus/Fokus.Persistence/Repositories/TestExecutionRepository.cs` | One business rule ("a sub-task is covered when its parent is") decided in three places, one of them inside a repository. |
| Medium | `src/Services/Fokus/Fokus.Persistence/Repositories/TestExecutionRepository.cs` | A business rule (which sprint a test execution belongs to) kept as a private method in Persistence, and the flow around it written twice. |
| Medium | `src/Services/Fokus/Fokus.API/Features/Analytics/GetUntestedTickets/GetUntestedTicketsEndpoint.cs` | Two endpoints that are line-for-line copies of each other. |
| Medium | `src/BuildingBlocks/Blocks.EntityFrameworkCore/Repositories/RepositoryBase.cs` | Hiding a base method with `new` in every repository, so nothing ever calls the base. |
| Medium | `src/Services/Fokus/Fokus.Persistence/Repositories/TicketRepository.cs` | The rules for updating an entity from a newer Jira copy kept as hand-maintained copy lists inside repositories, while the Domain owns only creation. |
| Medium | `src/Services/Fokus/Fokus.Domain/Ticket/Ticket.cs` | Protected child lists on an aggregate that the sync then goes around, replacing the children through repository methods. |
| Medium | `src/Services/Fokus/Fokus.Persistence/Repositories/DeveloperRepository.cs` | A repository that owns a partial-update rule and changes the entity itself. |
| Low | `src/Services/Fokus/Fokus.Persistence/Repositories/TestExecutionRepository.cs` | Domain values (`"Cancelled"`, `"Bug"`) hard-coded in queries although the Domain already names them. |
| Low | `src/Services/Fokus/Fokus.Persistence/Repositories/TestExecutionRepository.cs` | The same load-and-group block written twice in one repository. |
| Low | `src/Services/Fokus/Fokus.Persistence/Repositories/TestExecutionRepository.cs` | A query method with seven loose parameters that every caller unpacks from the settings. |
| Low | `src/Services/Fokus/Fokus.Persistence/Repositories/DeveloperRepository.cs` | Two names for the same database context inside one class. |
| Low | `src/Services/Fokus/Fokus.Persistence/Repositories/TicketRepository.cs` | Repositories reading and writing tables that belong to other aggregates. |
| Low | `src/BuildingBlocks/Blocks.EntityFrameworkCore/Repositories/RepositoryBase.cs` | Two parallel sets of methods for the same job, with the base set unused. |
| Low | `src/Services/Fokus/Fokus.Persistence/Repositories/TestExecutionRepository.cs` | Public methods that nothing calls. |
| Low | `src/Services/Fokus/Fokus.Persistence/Repositories/TicketRepository.cs` | Doc comments that say the opposite of what the code does. |
| Low | `src/Services/Fokus/Fokus.Persistence/Repositories/TestExecutionRepository.cs` | Anonymous tuples and magic values instead of named types. |
| Low | `src/Services/Fokus/Fokus.Persistence/Repositories/SprintRepository.cs` | The "analytics sprint" rule (closed or active) written three times with no named condition. |

## Developers analytics page (frontend) — 19

| Severity | File | Do not copy |
|---|---|---|
| Medium | `client/src/api/analytics.ts` | The same query-string building code repeated in 17 functions. |
| Medium | `client/src/stores/developersStore.ts` | Five loaders that are one body copied five times. |
| Medium | `client/src/stores/developersStore.ts` | The page's selected tab kept in a store, and a view writing store values directly instead of calling actions. |
| Medium | `client/src/components/developers/ThroughputTab.vue` | Five copies of an averaging helper, each returning a formatted string that is then sorted as text. |
| Medium | `client/src/components/developers/ThroughputTab.vue` | Column-sort state written again in five files. |
| Medium | `client/src/components/developers/ThroughputTab.vue` | A business rule (story points adjusted for capacity) computed in the browser, and in two places. |
| Medium | `client/src/api/client.ts` | An HTTP wrapper that lies about what it returns and sends the whole page to the login screen from inside the HTTP layer. |
| Medium | `client/src/views/DevelopersView.vue` | Pasting the same icon SVG into 15 files although a shared component for it exists. |
| Medium | `client/src/types/index.ts` | A mode field plus two fields that may be empty, where a discriminated union would make wrong states impossible. |
| Medium | `client/src/views/DevelopersView.vue` | Components far over the repo's own size limits. |
| Low | `client/src/api/analytics.ts` | An API module named for one area that also holds others, with its request types declared inside it. |
| Low | `client/src/stores/developersStore.ts` | The list of tab names written out three times. |
| Low | `client/src/views/DevelopersView.vue` | Loading, error and empty states laid out differently on each tab. |
| Low | `client/src/components/developers/ThroughputTab.vue` | Chart colours hard-coded instead of taken from the theme. |
| Low | `client/src/components/developers/BugRatioDevTable.vue` | Helpers declared again locally although a shared composable exists. |
| Low | `client/src/stores/developersStore.ts` | Two full copies of the same try/catch block in one action. |
| Low | `client/src/types/index.ts` | The same metric-card shape declared four times under different names. |
| Low | `client/src/components/PageToolbar.vue` | A shared component that imports a feature's dialog and an API type. |
| Low | `client/src/components/developers/BugRatioTab.vue` | Sibling tabs that disagree on where they learn their mode. |

## Settings page (frontend) — 13

| Severity | File | Do not copy |
|---|---|---|
| Medium | `client/src/components/settings/HealthTab.vue` | The save handler (saving, saved and error flags around a try/catch) copied by hand into each tab. |
| Medium | `client/src/stores/settingsStore.ts` | Store actions that report failure only through one shared error value and never rethrow. |
| Medium | `client/src/stores/settingsStore.ts` | The full default settings object written twice and its field list a third time. The copies have already drifted apart. |
| Medium | `client/src/views/SettingsView.vue` | Using `provide()` to hand down Pinia stores that any component can already reach. |
| Medium | `client/src/views/SettingsView.vue` | Data access split between store actions and direct API calls, with no rule for which to use. |
| Medium | `client/src/components/settings/SyncTab.vue` | Error messages extracted three different ways, with `catch (e: any)` turning type checks off. |
| Medium | `client/src/components/settings/JiraTab.vue` | Raw colour classes instead of the theme's design tokens. |
| Medium | `client/src/components/settings/JiraTab.vue` | Two near-identical multi-select dropdowns in one component. |
| Medium | `client/src/components/settings/SyncTab.vue` | One component doing five jobs, including a multi-step workflow. |
| Medium | `client/src/stores/teamStore.ts` | One action doing three jobs, plus two separate signals for the same fact. |
| Low | `client/src/stores/settingsStore.ts` | Exported members that are unused or misnamed. |
| Low | `client/src/api/settings.ts` | API modules grouped by the screen that uses them instead of by the server resource. |
| Low | `client/src/views/SettingsView.vue` | The tab and role rules stated more than once. |

## Across the codebase (structure) — 11

| Severity | File | Do not copy |
|---|---|---|
| High | `src/Services/Fokus/Fokus.Domain/Fokus.Domain.csproj` | The Domain project references the Jira integration contracts and builds aggregates from Jira data types, against the repo's own "Domain references nothing". |
| Medium | `src/Services/Fokus/Fokus.Domain/Sprint/Sprint.cs` | An aggregate's lifecycle state typed by an enum from an integration module. |
| Medium | `src/BuildingBlocks/Blocks.Domain/Events/IDomainEvent.cs` | The shared domain building block tied to the web framework, just so the event interface can extend its event type. |
| Medium | `src/Services/Fokus/Fokus.API/Features/Analytics/GetCarryOver/GetCarryOverEndpoint.cs` | Two different ways of loading data for query endpoints side by side. Pick one. |
| Medium | `client/src/types/index.ts` | One 1,481-line types file for every feature. |
| Medium | `client/src/stores/developersStore.ts` | Two stores that import each other. |
| Low | `src/Services/Fokus/Fokus.Persistence/DependencyInjection.cs` | The persistence layer choosing the web framework's event bus. |
| Low | `src/Services/Fokus/Fokus.API/Features/Analytics/GetDeveloperDetail/GetDeveloperDetailEndpoint.cs` | Endpoints importing an integration module's implementation just to read its settings class. |
| Low | `src/Services/Fokus/Fokus.API/Features/Xray/XrayCredentialsStartupExtensions.cs` | API code using the database context directly although a repository exists. |
| Low | `src/Services/Fokus/Fokus.Domain/Settings/AppSettings.cs` | One wide settings type passed everywhere, so every calculator depends on all of it. |
| Low | `src/Services/Fokus/Fokus.Domain/Settings/AppSettings.cs` | All entity folders sharing one flat namespace, so the entity boundaries never show in the `using` lines. |
