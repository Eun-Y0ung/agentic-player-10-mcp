import type { SearchEntryJobsInput, StudentProfile } from "../schemas/index.js";
import { daysUntil, isWithinDays } from "../utils/dates.js";

import type { JobPosting } from "./saramin-client.js";

export function rankJobs(jobs: JobPosting[], input: SearchEntryJobsInput): JobPosting[] {
  return jobs
    .filter((job) => isWithinDays(job.deadline, input.deadline_within_days))
    .map((job) => {
      const result = scoreJob(job, input);
      return { ...job, score: result.score, reasons: result.reasons };
    })
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, input.limit);
}

export function scoreJob(job: JobPosting, input: Pick<SearchEntryJobsInput, "keywords" | "location" | "employment_type" | "student_profile">): {
  score: number;
  reasons: string[];
} {
  let score = 0;
  const reasons: string[] = [];
  const searchable = `${job.title} ${job.company} ${job.keywords?.join(" ") ?? ""}`.toLowerCase();
  const keywordTerms = input.keywords.toLowerCase().split(/\s+/).filter(Boolean);

  if (keywordTerms.some((term) => searchable.includes(term))) {
    score += 3;
    reasons.push("검색 키워드와 공고 내용이 맞습니다.");
  }

  if (isEntryFriendly(job, input.employment_type)) {
    score += 3;
    reasons.push("인턴/신입/경력무관 조건에 가깝습니다.");
  }

  const remainingDays = daysUntil(job.deadline);
  if (remainingDays !== undefined && remainingDays <= 14 && remainingDays >= 0) {
    score += 2;
    reasons.push("2주 안에 마감되어 지금 확인하기 좋습니다.");
    if (remainingDays >= 3) {
      score += 1;
      reasons.push("지원 준비 시간이 너무 촉박하지 않습니다.");
    }
  }

  if (input.location && job.location?.includes(input.location)) {
    score += 2;
    reasons.push("희망 지역과 맞습니다.");
  }

  const profileReason = profileMatchReason(job, input.student_profile);
  if (profileReason) {
    score += 1;
    reasons.push(profileReason);
  }

  return { score, reasons: reasons.slice(0, 3) };
}

function isEntryFriendly(job: JobPosting, employmentType: SearchEntryJobsInput["employment_type"]): boolean {
  const text = `${job.title} ${job.experience ?? ""} ${job.employmentType ?? ""}`;
  if (employmentType === "intern") return /인턴|intern/i.test(text);
  if (employmentType === "newcomer") return /신입|경력무관|인턴/i.test(text);
  if (employmentType === "entry") return /인턴|신입|경력무관|무관/i.test(text);
  return /인턴|신입|경력무관|무관/i.test(text);
}

function profileMatchReason(job: JobPosting, profile: StudentProfile | undefined): string | undefined {
  if (!profile) return undefined;
  const text = `${job.title} ${job.keywords?.join(" ") ?? ""}`.toLowerCase();
  const interests = profile.interests ?? [];
  if (interests.some((interest) => text.includes(interest.toLowerCase()))) {
    return "관심 분야와 연결됩니다.";
  }
  if (profile.major && text.includes(profile.major.toLowerCase())) {
    return "전공과 연결되는 공고입니다.";
  }
  return undefined;
}
