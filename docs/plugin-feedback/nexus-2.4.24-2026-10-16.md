# Nexus plugin feedback — nexus 2.4.24 — 2026-10-16

Source repo: Fokus (`<repo-root>`). Filed by the main session at the owner's request, for the plugin owner to apply in the plugin source repo.

## Stop copy-pasted helpers at write time, not at review time

- **Suggested target:**
  1. `agents/developer.md` → `## Anti-patterns` (and the same line in `agents/solo.md`): before writing a private helper, search the solution for one that already does the job; reuse it or move it to the shared home the stack's skill names, never add a private copy.
  2. `skills/review-format` → the code-review checklist: "logic duplicated across files" as a named finding class, with the rule that every copy is listed (the problem-class rule already in `rules/workflow-core.md`).
  3. `agents/architect.md` → plan-time rules: when a step moves or extracts code, the plan names the duplicated helpers it must merge, with their copy counts — Step 4 of F39's plan did this by hand and still undercounted (8 sprint records named, 9 found).
  4. Proposal, larger: a duplicate check in the per-step close (`verify-run.js --profile fast`) or the verify gate — a declared, stack-specific duplicate detector run over the files the step touched, reporting new copies as an advisory line. Declared per repo in `.claude/verify.json` like the other roles, so a repo without one is unaffected.
- **Action:** add
- **Evidence:** F39-ServiceLayerSplit (Fokus, 2026-10-14), base commit `8a132ce`. Before F39, the analytics code in `src/Services/Fokus/Fokus.API/Features/Analytics/*Service.cs` carried these copies, each service holding its own private copy of a shared helper:

  | Copied item | Kind | Copies |
  |---|---|---|
  | `{Area}SprintInfo` 4-field sprint record (+ `SprintSummaryItem`) | record | 9 |
  | `FilterMemberships` | private method | 9, in two variants |
  | QA coverage helpers | private methods | 7, across 3 classes |
  | `IsBug` | private method | 5 |
  | `GetStageIndex` | private method | 4 (3 in services, 1 in `TestExecutionRepository`) |
  | `ResolveStartIndex` | private method | 3 |
  | `CountBusinessDays`, `GetEffectiveSp`, `GetEffectiveTicketSp` | private methods | 2 each |
  | `SparklinePointDto` | reply record | 2 |

  Records: `docs/specs/F39-ServiceLayerSplit/delivery/implementation.md` (Step 4, Step 7 and Fix Round 1 blocks), `done-check.md`, `review.md` § Step 2, `review-codex.md`, `review-second.md`.
  Recurrence: 1 feature, but the copies span about 15 classes, and the pattern repeated **inside** F39 itself — after Steps 4 and 7 were built to merge duplicates, both code reviewers still found three more (`GetEffectiveSp` ×2, `GetEffectiveTicketSp` ×2, `SparklinePointDto` ×2), fixed only in fix round 1. Every step close had passed; nothing at write time flagged them.
- **Why we are building this:**
  - **Copies drift, so fixes miss.** F39 found copies that had already diverged: `FilterMemberships` existed in two variants (one returned the input list, the other a copy), and `GetCapacity` had a variant taking a different lookup. A bug fixed in one copy stays in the others — exactly the class the kernel's problem-class rule exists for, but nothing applies it until a reviewer happens to look.
  - **Undoing it is expensive.** Two of F39's 13 build steps (4 and 7) were mostly merging copies; Step 7 alone took one developer about 26 minutes and 100 tool calls, each merge needing a proof of equal output (a golden comparison over 609 requests).
  - **Today's catch points are all late.** `boy-scout` is in-file only by design, so it cannot see a copy in another file; the code review and the mining skills catch duplication only after it has spread. The cheapest point to stop a copy is when it is written.
- **Lesson:** Before writing a private helper, look for an existing one and reuse or move it to the shared home; a reviewer lists every copy of duplicated logic, not just the one in front of them; and a repo may declare a duplicate check that the per-step close runs over the touched files.
