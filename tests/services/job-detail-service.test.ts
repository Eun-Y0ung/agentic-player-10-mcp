import { describe, expect, it } from "vitest";

import { getJobDetail } from "../../src/services/index.js";
import { FixtureSaraminClient } from "../fixtures/saramin-jobs.js";

describe("job-detail-service", () => {
  it("formats a job detail summary", async () => {
    const text = await getJobDetail({ job_id: "1001", include_application_brief: true }, new FixtureSaraminClient());

    expect(text).toContain("ABC테크 - 백엔드 개발 인턴");
    expect(text).toContain("지원 준비 체크리스트");
    expect(text).toContain("조건이 불확실한 항목은 원문에서 최종 확인해 주세요.");
  });
});
