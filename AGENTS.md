# AGENTS.md

## Communication

- Respond in Korean by default.
- Keep answers concise, but include enough context for the user to act.
- Before editing files, briefly explain what will be changed and why.
- When changes are made, end the final response with a concise summary of what changed.
- In the final response, summarize changed files, verification performed, and any remaining TODOs.

## Project Context

- This repository is for an Agentic Player 10 MCP server.
- The current product direction is `InternMate MCP`: a student-focused intern/newcomer job discovery assistant.
- Read `docs/prd-intern-mcp.md` before implementing product features.
- The core value is not generic web search. It is using trusted job posting data to recommend intern/newcomer roles that university students can apply to soon.

## Development Rules

- Keep the TypeScript MCP server structure.
- Prefer small, focused tools over one large tool.
- Avoid adding unnecessary code, abstractions, files, comments, or dependencies.
- When adding a new MCP tool, update the relevant schema, service, tool registration, tests, and docs together when applicable.
- Use mock or fixture job posting data in tests. Do not call the real Saramin API in unit tests.
- Preserve uncertainty in outputs. If deadline, eligibility, or job details are unclear, say so and link to the original posting.
- Do not hardcode API keys. Read Saramin credentials from environment variables.
- Do not over-engineer fallback code. Add fallback behavior only when it is necessary for the user request, the MVP demo, or reliable error handling.

## Suggested Implementation Order

1. `search_entry_jobs`
2. `get_job_detail`
3. `make_application_brief`

## Verification

- Run `npm test` after changing implementation or tests.
- Run `npm run build` before considering MCP server changes complete.
- If a command cannot be run, explain why in the final response.
