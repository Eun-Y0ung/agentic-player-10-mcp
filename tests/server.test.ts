import { describe, expect, it } from "vitest";

import { handleHealthCheck } from "../src/tools/health.js";

describe("health_check", () => {
  it("returns server status in MCP content format", () => {
    expect(handleHealthCheck()).toEqual({
      content: [{ type: "text", text: "Agentic Player 10 MCP server is running." }]
    });
  });
});
