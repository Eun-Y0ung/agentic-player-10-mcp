import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({
  name: "agentic-player-10-mcp",
  version: "0.1.0"
});

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

const transport = new StdioServerTransport();
await server.connect(transport);
