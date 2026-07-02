import { describe, expect, it } from "vitest";

import { handleSearchEntryJobs } from "../../src/tools/search-entry-jobs.js";
import { FixtureSaraminClient } from "../fixtures/saramin-jobs.js";

function textOf(response: { content: Array<{ type: "text"; text: string }> }): string {
  return response.content[0]?.text ?? "";
}

describe("search_entry_jobs tool", () => {
  it("returns recommendations with fixture client", async () => {
    const text = textOf(
      await handleSearchEntryJobs(
        {
          keywords: "IT 인턴",
          employment_type: "intern"
        },
        new FixtureSaraminClient()
      )
    );

    expect(text).toContain("ABC테크");
    expect(text).toContain("마감일과 지원 조건은 공고 원문에서 최종 확인해 주세요.");
  });

  it("returns safe validation message for missing keyword", async () => {
    const text = textOf(await handleSearchEntryJobs({}));
    expect(text).toBe("찾고 싶은 직무나 키워드를 입력해 주세요.");
  });

  it("returns missing API key message when no client is injected", async () => {
    const oldKey = process.env.SARAMIN_ACCESS_KEY;
    delete process.env.SARAMIN_ACCESS_KEY;
    const text = textOf(await handleSearchEntryJobs({ keywords: "IT 인턴" }));
    process.env.SARAMIN_ACCESS_KEY = oldKey;

    expect(text).toBe("사람인 API 키가 설정되지 않았습니다.");
  });
});
