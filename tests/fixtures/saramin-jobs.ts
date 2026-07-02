import type { JobPosting, SaraminClient, SaraminSearchParams } from "../../src/services/index.js";

export const fixtureJobs: JobPosting[] = [
  {
    id: "1001",
    company: "ABC테크",
    title: "백엔드 개발 인턴",
    deadline: "2026-07-12",
    location: "서울 강남구",
    experience: "신입/경력무관",
    education: "대학교 재학 이상",
    employmentType: "인턴",
    keywords: ["IT", "Java", "Spring", "API"],
    requirements: ["Java 경험 우대", "신입/경력무관"],
    url: "https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=1001"
  },
  {
    id: "1002",
    company: "데이터로",
    title: "데이터 분석 인턴",
    deadline: "2026-07-15",
    location: "경기 성남시",
    experience: "경력무관",
    education: "학력무관",
    employmentType: "인턴",
    keywords: ["데이터", "SQL", "Python"],
    requirements: ["SQL 가능자 우대"],
    url: "https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=1002"
  },
  {
    id: "1003",
    company: "마켓핏",
    title: "마케팅 신입",
    deadline: "2026-07-20",
    location: "서울 마포구",
    experience: "신입",
    education: "초대졸 이상",
    employmentType: "정규직",
    keywords: ["마케팅", "콘텐츠"],
    requirements: ["SNS 운영 경험 우대"],
    url: "https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=1003"
  }
];

export class FixtureSaraminClient implements SaraminClient {
  public lastSearchParams?: SaraminSearchParams;

  constructor(private readonly jobs: JobPosting[] = fixtureJobs) {}

  async searchJobs(params: SaraminSearchParams): Promise<JobPosting[]> {
    this.lastSearchParams = params;
    return this.jobs;
  }

  async getJobDetail(identifier: { job_id?: string; job_url?: string }): Promise<JobPosting | undefined> {
    return this.jobs.find((job) => job.id === identifier.job_id || job.url === identifier.job_url);
  }
}
