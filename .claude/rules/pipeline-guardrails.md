# Pipeline Guardrails

- **No Opus for general-purpose agents** — always set `model: "sonnet"`. General-purpose agents do research and summarization, not deep reasoning.

  ```
  Agent({
    subagent_type: "general-purpose",
    model: "sonnet",   // REQUIRED
    ...
  })

  Agent({
    subagent_type: "Explore",
    model: "sonnet",   // REQUIRED
    ...
  })
  ```

- **Never override specialized agent models** — specialized agents (architect, developer, reviewer, etc.) have their model baked into their `.md` frontmatter. Never pass a `model` parameter that overrides it.
- **Project agents own the pipeline** — for feature pipeline roles (architect, developer, reviewer), always use the `.claude/agents/` project agents. Never substitute another tool's planner, executor or orchestration (team, autopilot, loop modes) for pipeline work.

## Output Size Constraint

Explore and general-purpose agents return a structured report under 300 words. Write detailed findings to disk (e.g., a notes file or questions.md); the message is a summary. Never return raw file dumps or full grep output as the agent response — summarize findings and cite file paths.
