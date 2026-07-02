import type { MakeSubmissionChecklistInput } from "../schemas/index.js";

import { hasAnyText, uniq } from "./text-utils.js";

const baseChecklistByType: Record<MakeSubmissionChecklistInput["deliverable_type"], string[]> = {
  presentation: ["PPT 최종본 확인", "발표 대본 작성", "참고문헌 형식 확인", "발표 순서 확정", "제출 담당자 확정"],
  report: ["보고서 최종본 확인", "표지와 목차 확인", "참고문헌 형식 확인", "파일명 규칙 확인", "제출 담당자 확정"],
  prototype: ["프로토타입 실행 확인", "데모 시나리오 정리", "README 확인", "제출 파일 압축", "제출 담당자 확정"],
  video: ["영상 최종본 확인", "자막과 음량 확인", "파일 형식 확인", "업로드 링크 확인", "제출 담당자 확정"],
  mixed: ["제출물 목록 확인", "각 파일 최종본 확인", "참고문헌 형식 확인", "압축 파일 확인", "제출 담당자 확정"],
  unknown: ["제출물 유형 확인", "최종 파일 확인", "마감 시간 확인", "제출 방식 확인", "제출 담당자 확정"]
};

export function makeSubmissionChecklist(input: MakeSubmissionChecklistInput): string {
  const knownTasks = input.known_tasks ?? [];
  if (!hasAnyText(input.chat_text, input.assignment_requirements) && knownTasks.length === 0) {
    return "체크리스트를 만들 기준 정보가 부족합니다.";
  }

  const checklist = uniq([
    ...knownTasks.map((task) => `${task.task} 확인`),
    ...requirementsToChecklist(input.assignment_requirements),
    ...baseChecklistByType[input.deliverable_type]
  ]).slice(0, 8);

  if (checklist.length === 0) {
    return "제출물 유형 기준의 기본 체크리스트를 먼저 확인해 주세요.";
  }

  const risks = buildRisks(input);
  const lines = ["제출 전 체크리스트", ...checklist.map((item) => `- [ ] ${item}`)];

  if (risks.length > 0) {
    lines.push("", "리스크", ...risks.map((risk) => `- ${risk}`));
  }

  return lines.join("\n");
}

function requirementsToChecklist(requirements: string | undefined): string[] {
  if (!requirements) {
    return [];
  }

  const items: string[] = [];
  if (/PDF|pdf/.test(requirements)) {
    items.push("PDF 변환 확인");
  }
  if (/참고문헌|출처/.test(requirements)) {
    items.push("참고문헌 포함 여부 확인");
  }
  if (/LMS|업로드|제출/.test(requirements)) {
    items.push("LMS 제출 방식 확인");
  }
  if (/발표/.test(requirements)) {
    items.push("발표 자료 최종본 확인");
  }
  return items;
}

function buildRisks(input: MakeSubmissionChecklistInput): string[] {
  const risks: string[] = [];
  const knownTasks = input.known_tasks ?? [];

  if (knownTasks.some((task) => task.status === "unclear")) {
    risks.push("담당이나 상태가 불명확한 작업이 있습니다.");
  }
  if (!input.deadline) {
    risks.push("전체 제출 마감이 아직 입력되지 않았습니다.");
  } else {
    risks.push(`전체 제출 마감은 ${input.deadline}입니다.`);
  }
  if (!/참고문헌|출처/.test(`${input.chat_text ?? ""}\n${input.assignment_requirements ?? ""}`)) {
    risks.push("참고문헌 형식이 확정되지 않았습니다.");
  }

  return risks.slice(0, 4);
}
