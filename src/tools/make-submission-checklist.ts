import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { MakeSubmissionChecklistInputSchema } from "../schemas/index.js";
import { makeSubmissionChecklist } from "../services/index.js";

import { textResponse, validationMessage, type TextContentResponse } from "./tool-response.js";

export function handleMakeSubmissionChecklist(input: unknown): TextContentResponse {
  const parsed = MakeSubmissionChecklistInputSchema.safeParse(input);
  if (!parsed.success) {
    return textResponse(validationMessage(parsed.error, "제출물 유형을 입력해 주세요."));
  }

  try {
    return textResponse(makeSubmissionChecklist(parsed.data));
  } catch {
    return textResponse("체크리스트 생성 중 문제가 발생했습니다.");
  }
}

export function registerMakeSubmissionChecklistTool(server: McpServer): void {
  server.tool(
    "make_submission_checklist",
    "Create a submission checklist from assignment requirements, chat context, and known tasks.",
    MakeSubmissionChecklistInputSchema.shape,
    async (input) => handleMakeSubmissionChecklist(input)
  );
}
