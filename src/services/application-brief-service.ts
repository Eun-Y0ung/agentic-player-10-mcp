import type { MakeApplicationBriefInput, StudentProfile } from "../schemas/index.js";
import type { JobPosting } from "./saramin-client.js";

export function makeApplicationBrief(input: MakeApplicationBriefInput): string {
  return createApplicationBrief(
    {
      id: input.job.url || input.job.title,
      title: input.job.title,
      company: input.job.company || "회사명 미확인",
      deadline: input.job.deadline,
      requirements: input.job.requirements,
      url: input.job.url || "원문 링크 미입력"
    },
    input.student_profile
  );
}

export function createApplicationBrief(job: JobPosting, profile?: StudentProfile): string {
  const checklist = [
    "사람인 이력서 최신화",
    "자기소개서 초안 작성",
    "관련 프로젝트 경험 1~2개 정리",
    "GitHub 또는 포트폴리오 링크 확인",
    "마감 하루 전 제출 준비"
  ];

  const requirementText = `${job.title} ${job.requirements?.join(" ") ?? ""}`.toLowerCase();
  if (/java|spring|backend|백엔드/.test(requirementText)) {
    checklist.splice(2, 0, "Java/Spring 또는 백엔드 프로젝트 경험 정리");
  }
  if (/data|데이터|sql|python/.test(requirementText)) {
    checklist.splice(2, 0, "SQL/Python 또는 데이터 분석 경험 정리");
  }
  if (profile?.portfolio_ready === false) {
    checklist.splice(3, 0, "포트폴리오 공개 링크 준비");
  }

  const heading = `${job.company} ${job.title} 지원 준비 체크리스트`;
  const lines = [heading, "", ...checklist.slice(0, 7).map((item) => `- [ ] ${item}`)];
  if (job.deadline) lines.push("", `마감: ${job.deadline}`);
  lines.push(`링크: ${job.url}`);
  lines.push("합격 가능성을 예측하지 않으며, 세부 조건은 원문에서 확인해 주세요.");
  return lines.join("\n");
}
