# adhoc-ReadmeShowcase — Lessons

## Solo Lessons

- **The pictures run on the real API with nothing real behind it.** Run the built `Fokus.API.dll` against a throwaway SQLite file through `ConnectionStrings__Database`, with an environment name other than Development (`Readme`), so the owner's user secrets are never loaded. Jira needs only placeholder `Jira__*` values, since nothing syncs. Point `Google__AuthorizationEndpoint`, `Google__TokenEndpoint` and `Google__UserInformationEndpoint` at a 30-line local stand-in that answers with an invented user; signing in through `/auth/login` in a real Chrome (Playwright `playwright-core` with the installed Chrome) makes that user the administrator. Chrome keeps the secure cookies on `http://localhost`.
- **Seed with Windows paths when the shell is Git Bash.** A `/d/temp/...` path passed in an environment variable reaches .NET unconverted and becomes `D:\d\temp\...`, so the API made its database in a stray folder. Use `D:/temp/...` for every path a .NET or Python process reads.
- **Every figure comes from transitions, so the seed is a set of ticket paths.** Give each ticket the times it enters each stage, write the sprint memberships with `AddedAt` before or after the planning window, and derive `FinalStatus` and `CurrentStatus` from the same path. A pace of about 1.1 days per stage gave ordinary sprints; seed 31 gave a last finished sprint with health 91.7, amber disruption (12.7%) and amber carry-over (12.7%).
- **Show finished sprints.** The running sprint's views show mostly zeros and a high carry-over rate; pass `?sprint={id}` of the last closed sprint for the Dashboard, Developers and Cycle Time pictures.
- **The page scrolls inside its own container,** so a full-page screenshot is cut at the window height. Set the window height to the part you want instead.
- **Found, not fixed: cycle time counts the time a ticket spends in Done.** The calculator walks every stage from the start stage to the end stage inclusive and closes an open stage at the sprint end, so a ticket finished on day 5 of a 14-day sprint adds about 9 days of "Done". On the sample data the stage funnel showed Done as the bottleneck (5.0 of 9.9 days) and the median cycle time doubled. `docs/kb/analytics/cycle-time.md` describes the same inclusive range, so the rule itself needs a decision before a fix. The README's cycle-time picture shows the inflated median.

## Skill Gaps

### readme-screenshots
- **Kind:** missing
- **Searched for:** a recipe for showcase screenshots of a web app: run it against throwaway data, stand in for external sign-in and APIs, capture with a browser at a fixed size and theme, and check every picture for private data
- **Why it would help:** this is the third README run (Reflekt, Sprint Rituals, Fokus) to rebuild the same tooling from scratch: a seed script, a sign-in stand-in, a capture script and the privacy check. Instead: hand-written scripts per run.
- **References:** the Sprint Rituals repo's `docs/specs/adhoc-ReadmeShowcase/delivery/lessons.md`; the Reflekt repo's `docs/specs/adhoc-ReadmeRewrite/delivery/lessons.md`
- **Evidence:** [adhoc-ReadmeRewrite (Reflekt), adhoc-ReadmeShowcase (Sprint Rituals), adhoc-ReadmeShowcase]
