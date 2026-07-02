import { describe, expect, it } from "vitest";

import { buildSaraminSearchParams, searchEntryJobs } from "../../src/services/index.js";
import { FixtureSaraminClient } from "../fixtures/saramin-jobs.js";

describe("job-query-service", () => {
  it("uses 14 days and 5 results as search defaults", async () => {
    const input = {
      keywords: "IT 인턴",
      employment_type: "entry" as const,
      deadline_within_days: 14,
      limit: 5
    };
    const params = buildSaraminSearchParams(input);

    expect(params).toMatchObject({ keywords: "IT 인턴", count: 15 });
  });

  it("formats ranked job results for chat", async () => {
    const text = await searchEntryJobs(
      {
        keywords: "IT 인턴",
        employment_type: "intern",
        deadline_within_days: 14,
        limit: 2
      },
      new FixtureSaraminClient()
    );

    expect(text).toContain("오늘 기준 14일 안에 마감되는 IT 인턴 관련 공고");
    expect(text).toContain("ABC테크 - 백엔드 개발 인턴");
    expect(text).toContain("링크: https://www.saramin.co.kr");
  });

  it("returns a helpful empty result message", async () => {
    const text = await searchEntryJobs(
      {
        keywords: "우주 개발 인턴",
        employment_type: "intern",
        deadline_within_days: 14,
        limit: 5
      },
      new FixtureSaraminClient([])
    );

    expect(text).toContain("조건에 맞는 공고를 찾지 못했습니다.");
  });
});
