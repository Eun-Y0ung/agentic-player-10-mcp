import { apiFailureMessage, missingApiKeyMessage, UserSafeError } from "../utils/errors.js";

export type JobPosting = {
  id: string;
  title: string;
  company: string;
  deadline?: string;
  location?: string;
  experience?: string;
  education?: string;
  employmentType?: string;
  keywords?: string[];
  requirements?: string[];
  url: string;
  score?: number;
  reasons?: string[];
};

export type SaraminSearchParams = {
  keywords: string;
  job_category?: string;
  location?: string;
  employment_type?: string;
  count: number;
};

export interface SaraminClient {
  searchJobs(params: SaraminSearchParams): Promise<JobPosting[]>;
  getJobDetail(identifier: { job_id?: string; job_url?: string }): Promise<JobPosting | undefined>;
}

export class HttpSaraminClient implements SaraminClient {
  private readonly accessKey: string | undefined;
  private readonly baseUrl: string;

  constructor(env: NodeJS.ProcessEnv = process.env) {
    this.accessKey = env.SARAMIN_ACCESS_KEY;
    this.baseUrl = env.SARAMIN_API_BASE_URL || "https://oapi.saramin.co.kr";
  }

  async searchJobs(params: SaraminSearchParams): Promise<JobPosting[]> {
    this.assertApiKey();
    const url = new URL("/job-search", this.baseUrl);
    url.searchParams.set("access-key", this.accessKey ?? "");
    url.searchParams.set("keywords", params.keywords);
    url.searchParams.set("count", String(params.count));
    if (params.job_category) url.searchParams.set("job_mid_cd", params.job_category);
    if (params.location) url.searchParams.set("loc_mcd", params.location);

    const json = await this.fetchJson(url);
    return normalizeSearchResponse(json);
  }

  async getJobDetail(identifier: { job_id?: string; job_url?: string }): Promise<JobPosting | undefined> {
    this.assertApiKey();
    if (identifier.job_url && !identifier.job_id) {
      return {
        id: identifier.job_url,
        title: "상세 정보는 원문에서 확인해 주세요",
        company: "원문 확인 필요",
        url: identifier.job_url
      };
    }

    const url = new URL("/job-search", this.baseUrl);
    url.searchParams.set("access-key", this.accessKey ?? "");
    url.searchParams.set("id", identifier.job_id ?? "");
    url.searchParams.set("count", "1");

    const json = await this.fetchJson(url);
    return normalizeSearchResponse(json)[0];
  }

  private assertApiKey(): void {
    if (!this.accessKey) {
      throw new UserSafeError(missingApiKeyMessage);
    }
  }

  private async fetchJson(url: URL): Promise<unknown> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Saramin API failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (error instanceof UserSafeError) {
        throw error;
      }
      throw new UserSafeError(apiFailureMessage);
    }
  }
}

export function normalizeSearchResponse(payload: unknown): JobPosting[] {
  const jobs = extractJobArray(payload);
  return jobs.map(normalizeJob).filter((job): job is JobPosting => Boolean(job));
}

function extractJobArray(payload: unknown): unknown[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }
  const root = payload as Record<string, unknown>;
  const jobs = root.jobs as Record<string, unknown> | undefined;
  const job = jobs?.job ?? root.job;
  return Array.isArray(job) ? job : job ? [job] : [];
}

function normalizeJob(raw: unknown): JobPosting | undefined {
  if (!raw || typeof raw !== "object") {
    return undefined;
  }

  const job = raw as Record<string, unknown>;
  const company = job.company as Record<string, unknown> | undefined;
  const position = job.position as Record<string, unknown> | undefined;
  const location = position?.location as Record<string, unknown> | undefined;
  const experience = position?.["experience-level"] as Record<string, unknown> | undefined;
  const jobType = position?.["job-type"] as Record<string, unknown> | undefined;
  const industry = position?.industry as Record<string, unknown> | undefined;

  const id = text(job.id) || text(job.url);
  const title = text(position?.title) || text(job.title);
  const url = text(job.url);
  if (!id || !title || !url) {
    return undefined;
  }

  return {
    id,
    title,
    company: text(company?.detail) || text(company?.name) || "회사명 미확인",
    deadline: text(job["expiration-date"]) || text(job.deadline),
    location: text(location?.name),
    experience: text(experience?.name),
    education: text((position?.["required-education-level"] as Record<string, unknown> | undefined)?.name),
    employmentType: text(jobType?.name),
    keywords: [text(industry?.name), title].filter((value): value is string => Boolean(value)),
    requirements: [text(experience?.name), text((position?.["required-education-level"] as Record<string, unknown> | undefined)?.name)].filter(
      (value): value is string => Boolean(value)
    ),
    url
  };
}

function text(value: unknown): string | undefined {
  if (typeof value === "string") return value.trim() || undefined;
  if (typeof value === "number") return String(value);
  return undefined;
}
