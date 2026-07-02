import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { registerGetJobDetailTool } from "./get-job-detail.js";
import { registerHealthTool } from "./health.js";
import { registerMakeApplicationBriefTool } from "./make-application-brief.js";
import { registerSearchEntryJobsTool } from "./search-entry-jobs.js";

export function registerTools(server: McpServer): void {
  registerHealthTool(server);
  registerSearchEntryJobsTool(server);
  registerGetJobDetailTool(server);
  registerMakeApplicationBriefTool(server);
}
