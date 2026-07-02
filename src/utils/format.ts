import type { JobPosting } from "../services/index.js";
import { formatDate } from "./dates.js";

export function formatJobSearchResults(jobs: JobPosting[], deadlineWithinDays: number, keywords: string): string {
  if (jobs.length === 0) {
    return "조건에 맞는 공고를 찾지 못했습니다. 키워드나 지역 조건을 조금 넓혀 다시 검색해 주세요.";
  }

  const lines = [`오늘 기준 ${deadlineWithinDays}일 안에 마감되는 ${keywords} 관련 공고를 추천드립니다.`];
  jobs.forEach((job, index) => {
    lines.push(
      "",
      `${index + 1}. ${job.company} - ${job.title}`,
      `- 마감: ${formatDate(job.deadline)}`,
      `- 지역: ${job.location || "원문 확인 필요"}`,
      `- 경력: ${job.experience || "원문 확인 필요"}`,
      `- 고용형태: ${job.employmentType || "원문 확인 필요"}`,
      `- 추천 이유: ${(job.reasons ?? ["조건이 비교적 잘 맞습니다."]).join(" ")}`,
      `- 링크: ${job.url}`
    );
  });
  lines.push("", "마감일과 지원 조건은 공고 원문에서 최종 확인해 주세요.");
  return lines.join("\n");
}

export function formatJobDetail(job: JobPosting, applicationBrief?: string): string {
  const lines = [
    `${job.company} - ${job.title}`,
    "",
    `- 마감: ${formatDate(job.deadline)}`,
    `- 지역: ${job.location || "원문 확인 필요"}`,
    `- 경력: ${job.experience || "원문 확인 필요"}`,
    `- 학력: ${job.education || "원문 확인 필요"}`,
    `- 고용형태: ${job.employmentType || "원문 확인 필요"}`
  ];

  if (job.keywords?.length) {
    lines.push(`- 주요 키워드: ${job.keywords.join(", ")}`);
  }

  if (job.requirements?.length) {
    lines.push(`- 확인할 조건: ${job.requirements.join(", ")}`);
  }

  lines.push("", "조건이 불확실한 항목은 원문에서 최종 확인해 주세요.");

  if (applicationBrief) {
    lines.push("", applicationBrief);
  }

  lines.push("", `링크: ${job.url}`);
  return lines.join("\n");
}
