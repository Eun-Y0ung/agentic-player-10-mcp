import { describe, expect, it } from "vitest";

import { handleMakeApplicationBrief } from "../../src/tools/make-application-brief.js";

function textOf(response: { content: Array<{ type: "text"; text: string }> }): string {
  return response.content[0]?.text ?? "";
}

describe("make_application_brief tool", () => {
  it("creates an application checklist", () => {
    const text = textOf(
      handleMakeApplicationBrief({
        job: {
          title: "백엔드 개발 인턴",
          company: "ABC테크",
          deadline: "2026-07-12",
          requirements: ["Java 경험 우대"],
          url: "https://example.com/job"
        },
        student_profile: { portfolio_ready: false }
      })
    );

    expect(text).toContain("ABC테크 백엔드 개발 인턴 지원 준비 체크리스트");
    expect(text).toContain("- [ ] 사람인 이력서 최신화");
    expect(text).toContain("합격 가능성을 예측하지 않으며");
  });

  it("returns validation message without job", () => {
    const text = textOf(handleMakeApplicationBrief({}));
    expect(text).toBe("체크리스트를 만들 공고 정보가 필요합니다.");
  });
});
