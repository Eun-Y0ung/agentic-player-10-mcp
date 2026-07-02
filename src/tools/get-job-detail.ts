import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { GetJobDetailInputObjectSchema, GetJobDetailInputSchema } from "../schemas/index.js";
import { getJobDetail, type SaraminClient } from "../services/index.js";
import { UserSafeError } from "../utils/errors.js";

import { textResponse, validationMessage, type TextContentResponse } from "./tool-response.js";

export async function handleGetJobDetail(input: unknown, client?: SaraminClient): Promise<TextContentResponse> {
  const parsed = GetJobDetailInputSchema.safeParse(input);
  if (!parsed.success) {
    return textResponse(validationMessage(parsed.error, "상세 조회할 공고 ID 또는 URL이 필요합니다."));
  }

  try {
    return textResponse(await getJobDetail(parsed.data, client));
  } catch (error) {
    if (error instanceof UserSafeError) {
      return textResponse(error.message);
    }
    return textResponse("공고 상세 조회 중 문제가 발생했습니다.");
  }
}

export function registerGetJobDetailTool(server: McpServer): void {
  server.tool(
    "get_job_detail",
    "Summarize a specific Saramin job posting by job id or URL.",
    GetJobDetailInputObjectSchema.shape,
    async (input: unknown) => handleGetJobDetail(input)
  );
}
