import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerTools(server: McpServer): void {
  server.tool("health_check", "Check whether the MCP server is running.", {}, async () => {
    return {
      content: [
        {
          type: "text",
          text: "Agentic Player 10 MCP server is running."
        }
      ]
    };
  });
}
