import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { ExtractTeamTasksInputSchema } from "../schemas/index.js";
import { extractTeamTasks } from "../services/index.js";

import { textResponse, validationMessage, type TextContentResponse } from "./tool-response.js";

export function handleExtractTeamTasks(input: unknown): TextContentResponse {
  const parsed = ExtractTeamTasksInputSchema.safeParse(input);
  if (!parsed.success) {
    return textResponse(validationMessage(parsed.error, "대화 텍스트를 입력해 주세요."));
  }

  try {
    return textResponse(extractTeamTasks(parsed.data));
  } catch {
    return textResponse("할 일 정리 중 문제가 발생했습니다.");
  }
}

export function registerExtractTeamTasksTool(server: McpServer): void {
  server.tool(
    "extract_team_tasks",
    "Extract team tasks, owners, deadlines, and unclear items from a team chat.",
    ExtractTeamTasksInputSchema.shape,
    async (input) => handleExtractTeamTasks(input)
  );
}
