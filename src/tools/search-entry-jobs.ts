import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { SearchEntryJobsInputSchema } from "../schemas/index.js";
import { searchEntryJobs, type SaraminClient } from "../services/index.js";
import { UserSafeError } from "../utils/errors.js";

import { textResponse, validationMessage, type TextContentResponse } from "./tool-response.js";

export async function handleSearchEntryJobs(input: unknown, client?: SaraminClient): Promise<TextContentResponse> {
  const parsed = SearchEntryJobsInputSchema.safeParse(input);
  if (!parsed.success) {
    return textResponse(validationMessage(parsed.error, "찾고 싶은 직무나 키워드를 입력해 주세요."));
  }

  try {
    return textResponse(await searchEntryJobs(parsed.data, client));
  } catch (error) {
    if (error instanceof UserSafeError) {
      return textResponse(error.message);
    }
    return textResponse("채용 공고 검색 중 문제가 발생했습니다.");
  }
}

export function registerSearchEntryJobsTool(server: McpServer): void {
  server.tool(
    "search_entry_jobs",
    "Search and rank student-friendly intern, newcomer, and entry-level job postings.",
    SearchEntryJobsInputSchema.shape,
    async (input) => handleSearchEntryJobs(input)
  );
}
