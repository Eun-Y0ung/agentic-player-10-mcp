import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { MakeApplicationBriefInputSchema } from "../schemas/index.js";
import { makeApplicationBrief } from "../services/index.js";

import { textResponse, validationMessage, type TextContentResponse } from "./tool-response.js";

export function handleMakeApplicationBrief(input: unknown): TextContentResponse {
  const parsed = MakeApplicationBriefInputSchema.safeParse(input);
  if (!parsed.success) {
    return textResponse(validationMessage(parsed.error, "체크리스트를 만들 공고 정보가 필요합니다."));
  }

  try {
    return textResponse(makeApplicationBrief(parsed.data));
  } catch {
    return textResponse("지원 준비 체크리스트 생성 중 문제가 발생했습니다.");
  }
}

export function registerMakeApplicationBriefTool(server: McpServer): void {
  server.tool(
    "make_application_brief",
    "Create an application preparation checklist for a selected job posting.",
    MakeApplicationBriefInputSchema.shape,
    async (input) => handleMakeApplicationBrief(input)
  );
}
