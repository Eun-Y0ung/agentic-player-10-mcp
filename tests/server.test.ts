import { describe, expect, it } from "vitest";

import { handleExtractTeamTasks } from "../src/tools/extract-team-tasks.js";
import { handleGenerateTeamReminder } from "../src/tools/generate-team-reminder.js";
import { handleHealthCheck } from "../src/tools/health-check.js";
import { handleMakeSubmissionChecklist } from "../src/tools/make-submission-checklist.js";
import { handleSummarizeTeamDecisions } from "../src/tools/summarize-team-decisions.js";

function textOf(response: { content: Array<{ type: "text"; text: string }> }): string {
  expect(response.content).toHaveLength(1);
  expect(response.content[0]?.type).toBe("text");
  return response.content[0]?.text ?? "";
}

describe("health_check", () => {
  it("returns server status", () => {
    expect(textOf(handleHealthCheck())).toBe("Agentic Player 10 MCP server is running.");
  });
});

describe("extract_team_tasks", () => {
  it("extracts owners, tasks, deadlines, and pending items", () => {
    const response = handleExtractTeamTasks({
      chat_text:
        "[민지] 내가 자료조사 맡을게. 수요일까지 정리해볼게\n[현우] PPT 초안은 금요일까지 만들게\n[서윤] 발표 순서는 아직 정해야 해",
      project_context: "생성형 AI 교육 활용 발표",
      known_members: ["민지", "현우", "서윤"],
      base_date: "2026-07-02"
    });

    const text = textOf(response);
    expect(text).toContain("할 일/마감 정리");
    expect(text).toContain("민지: 자료조사 / 수요일");
    expect(text).toContain("현우: PPT / 금요일");
    expect(text).toContain("아직 미정");
  });

  it("returns a safe validation message for missing chat_text", () => {
    const text = textOf(handleExtractTeamTasks({}));
    expect(text).toBe("대화 텍스트를 입력해 주세요.");
  });

  it("returns an empty chat message", () => {
    const text = textOf(handleExtractTeamTasks({ chat_text: "   " }));
    expect(text).toBe("정리할 대화 내용이 없습니다.");
  });
});

describe("summarize_team_decisions", () => {
  it("summarizes decisions and pending items", () => {
    const response = handleSummarizeTeamDecisions({
      chat_text:
        "[민지] 발표 주제는 생성형 AI 교육 활용으로 가자\n[현우] 좋아. 구성은 개념, 사례, 한계, 결론으로 하자\n[서윤] 발표 순서는 나중에 정해야 해",
      project_context: "발표 회의",
      focus: "meeting",
      max_items: 4
    });

    const text = textOf(response);
    expect(text).toContain("결정된 것");
    expect(text).toContain("아직 정할 것");
    expect(text).toContain("다음 회의 안건");
    expect(text).toContain("발표 순서");
  });

  it("returns a validation message for invalid focus", () => {
    const text = textOf(
      handleSummarizeTeamDecisions({
        chat_text: "주제는 AI로 하자",
        focus: "invalid"
      })
    );
    expect(text).toContain("Invalid enum value");
  });
});

describe("generate_team_reminder", () => {
  it("generates a copy-ready reminder", () => {
    const response = handleGenerateTeamReminder({
      project_context: "생성형 AI 교육 활용 발표",
      tasks: [
        { owner: "민지", task: "자료조사", deadline: "수요일", status: "assigned" },
        { owner: "현우", task: "PPT 초안", deadline: "금요일", status: "assigned" }
      ],
      decisions: ["발표 주제는 생성형 AI 교육 활용"],
      pending_items: ["발표 순서", "참고문헌 형식"],
      deadline: "다음 주 월요일 23:59",
      tone: "friendly",
      include_greeting: true
    });

    const text = textOf(response);
    expect(text).toContain("오늘 정리한 내용 공유할게요.");
    expect(text).toContain("민지 자료조사(수요일)");
    expect(text).toContain("전체 제출 마감은 다음 주 월요일 23:59입니다.");
  });

  it("returns an error message for empty tasks", () => {
    const text = textOf(handleGenerateTeamReminder({ tasks: [] }));
    expect(text).toBe("공유할 할 일이나 마감일이 없습니다.");
  });
});

describe("make_submission_checklist", () => {
  it("creates a checklist and risks", () => {
    const response = handleMakeSubmissionChecklist({
      chat_text: "[현우] PPT는 금요일까지 초안 만들게\n[민지] 참고문헌 형식 확인해야 해",
      assignment_requirements: "발표 자료 PDF 제출, 참고문헌 포함",
      deliverable_type: "presentation",
      deadline: "다음 주 월요일 23:59",
      known_tasks: [
        { owner: "민지", task: "자료조사", status: "assigned" },
        { owner: "현우", task: "PPT 초안", status: "assigned" }
      ]
    });

    const text = textOf(response);
    expect(text).toContain("제출 전 체크리스트");
    expect(text).toContain("- [ ] 자료조사 확인");
    expect(text).toContain("- [ ] PDF 변환 확인");
    expect(text).toContain("리스크");
  });

  it("returns a validation message for missing deliverable_type", () => {
    const text = textOf(
      handleMakeSubmissionChecklist({
        assignment_requirements: "발표 자료 PDF 제출"
      })
    );
    expect(text).toBe("제출물 유형을 입력해 주세요.");
  });

  it("returns a source content error when there is no checklist basis", () => {
    const text = textOf(
      handleMakeSubmissionChecklist({
        deliverable_type: "presentation"
      })
    );
    expect(text).toBe("체크리스트를 만들 기준 정보가 부족합니다.");
  });
});
