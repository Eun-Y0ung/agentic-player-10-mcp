# AGENTS.md

## Communication

- Respond in Korean by default.
- Keep answers concise, but include enough context for the user to act.
- Before editing files, briefly explain what will be changed and why.
- When changes are made, end the final response with a concise summary of what changed.
- In the final response, summarize changed files, verification performed, and any remaining TODOs.

## Project Context

- This repository is for an Agentic Player 10 MCP server.
- The current product direction is `TeamTok MCP`: a university team project assistant for KakaoTalk-style group chats.
- Read `docs/prd-team-project-mcp.md` before implementing product features.
- The core value is not generic chat summarization. It is converting messy team project chat into roles, deadlines, decisions, pending items, checklists, and KakaoTalk-ready reminders.

## Development Rules

- Keep the TypeScript MCP server structure.
- Prefer small, focused tools over one large tool.
- Avoid adding unnecessary code, abstractions, files, comments, or dependencies.
- When adding a new MCP tool, update the relevant schema, service, tool registration, tests, and docs together when applicable.
- Use synthetic Korean team project chat data in tests and demos. Do not include real KakaoTalk conversations.
- Preserve uncertainty in outputs. If owner, deadline, or decision status is unclear, mark it as unclear rather than inventing details.
- Prefer deterministic rule-based behavior for MVP demos so the server can work without external API calls.
- Do not over-engineer fallback code. Add fallback behavior only when it is necessary for the user request, the MVP demo, or reliable error handling.

## Suggested Implementation Order

1. `extract_team_tasks`
2. `summarize_team_decisions`
3. `generate_team_reminder`
4. `make_submission_checklist`

## Verification

- Run `npm test` after changing implementation or tests.
- Run `npm run build` before considering MCP server changes complete.
- If a command cannot be run, explain why in the final response.
