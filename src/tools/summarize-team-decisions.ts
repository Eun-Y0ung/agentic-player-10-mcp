import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { SummarizeTeamDecisionsInputSchema } from "../schemas/index.js";
import { summarizeTeamDecisions } from "../services/index.js";

import { textResponse, validationMessage, type TextContentResponse } from "./tool-response.js";

export function handleSummarizeTeamDecisions(input: unknown): TextContentResponse {
  const parsed = SummarizeTeamDecisionsInputSchema.safeParse(input);
  if (!parsed.success) {
    return textResponse(validationMessage(parsed.error, "회의 대화 텍스트를 입력해 주세요."));
  }

  try {
    return textResponse(summarizeTeamDecisions(parsed.data));
  } catch {
    return textResponse("회의 내용 정리 중 문제가 발생했습니다.");
  }
}

export function registerSummarizeTeamDecisionsTool(server: McpServer): void {
  server.tool(
    "summarize_team_decisions",
    "Summarize confirmed decisions, pending items, and next meeting agenda from a team chat.",
    SummarizeTeamDecisionsInputSchema.shape,
    async (input) => handleSummarizeTeamDecisions(input)
  );
}
