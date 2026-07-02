import { describe, expect, it } from "vitest";

import { handleGetJobDetail } from "../../src/tools/get-job-detail.js";
import { FixtureSaraminClient } from "../fixtures/saramin-jobs.js";

function textOf(response: { content: Array<{ type: "text"; text: string }> }): string {
  return response.content[0]?.text ?? "";
}

describe("get_job_detail tool", () => {
  it("returns detail by job id", async () => {
    const text = textOf(await handleGetJobDetail({ job_id: "1001" }, new FixtureSaraminClient()));
    expect(text).toContain("ABC테크 - 백엔드 개발 인턴");
    expect(text).toContain("링크:");
  });

  it("returns validation message without identifier", async () => {
    const text = textOf(await handleGetJobDetail({}));
    expect(text).toBe("상세 조회할 공고 ID 또는 URL이 필요합니다.");
  });

  it("returns not found message", async () => {
    const text = textOf(await handleGetJobDetail({ job_id: "missing" }, new FixtureSaraminClient()));
    expect(text).toContain("공고를 찾지 못했습니다.");
  });
});
