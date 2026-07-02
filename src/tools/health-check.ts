import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { textResponse, type TextContentResponse } from "./tool-response.js";

export function handleHealthCheck(): TextContentResponse {
  return textResponse("Agentic Player 10 MCP server is running.");
}

export function registerHealthCheckTool(server: McpServer): void {
  server.tool("health_check", "Check whether the MCP server is running.", {}, async () => handleHealthCheck());
}
