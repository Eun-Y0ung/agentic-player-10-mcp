import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { registerExtractTeamTasksTool } from "./extract-team-tasks.js";
import { registerGenerateTeamReminderTool } from "./generate-team-reminder.js";
import { registerHealthCheckTool } from "./health-check.js";
import { registerMakeSubmissionChecklistTool } from "./make-submission-checklist.js";
import { registerSummarizeTeamDecisionsTool } from "./summarize-team-decisions.js";

export function registerTools(server: McpServer): void {
  registerHealthCheckTool(server);
  registerExtractTeamTasksTool(server);
  registerSummarizeTeamDecisionsTool(server);
  registerGenerateTeamReminderTool(server);
  registerMakeSubmissionChecklistTool(server);
}
