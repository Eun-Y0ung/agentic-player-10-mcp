import { describe, expect, it } from "vitest";

import { rankJobs, scoreJob } from "../../src/services/index.js";
import { fixtureJobs } from "../fixtures/saramin-jobs.js";

describe("job-ranking-service", () => {
  it("gives higher score to student-friendly matching jobs", () => {
    const itScore = scoreJob(fixtureJobs[0]!, {
      keywords: "IT 인턴",
      employment_type: "intern",
      location: "서울",
      student_profile: { interests: ["Java"] }
    });
    const marketingScore = scoreJob(fixtureJobs[2]!, {
      keywords: "IT 인턴",
      employment_type: "intern",
      location: "서울",
      student_profile: { interests: ["Java"] }
    });

    expect(itScore.score).toBeGreaterThan(marketingScore.score);
  });

  it("limits ranked results", () => {
    const ranked = rankJobs(fixtureJobs, {
      keywords: "인턴",
      employment_type: "entry",
      deadline_within_days: 14,
      limit: 1
    });

    expect(ranked).toHaveLength(1);
  });
});
