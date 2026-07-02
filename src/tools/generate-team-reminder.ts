import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { GenerateTeamReminderInputSchema } from "../schemas/index.js";
import { generateTeamReminder } from "../services/index.js";

import { textResponse, validationMessage, type TextContentResponse } from "./tool-response.js";

export function handleGenerateTeamReminder(input: unknown): TextContentResponse {
  const parsed = GenerateTeamReminderInputSchema.safeParse(input);
  if (!parsed.success) {
    return textResponse(validationMessage(parsed.error, "공유할 할 일이나 마감일이 없습니다."));
  }

  try {
    return textResponse(generateTeamReminder(parsed.data));
  } catch {
    return textResponse("리마인드 메시지 생성 중 문제가 발생했습니다.");
  }
}

export function registerGenerateTeamReminderTool(server: McpServer): void {
  server.tool(
    "generate_team_reminder",
    "Generate a copy-ready team reminder message from tasks, decisions, and pending items.",
    GenerateTeamReminderInputSchema.shape,
    async (input) => handleGenerateTeamReminder(input)
  );
}
