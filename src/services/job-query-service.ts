import type { SearchEntryJobsInput } from "../schemas/index.js";
import { formatJobSearchResults } from "../utils/format.js";

import { rankJobs } from "./job-ranking-service.js";
import { HttpSaraminClient, type JobPosting, type SaraminClient, type SaraminSearchParams } from "./saramin-client.js";

export function buildSaraminSearchParams(input: SearchEntryJobsInput): SaraminSearchParams {
  return {
    keywords: input.keywords,
    job_category: input.job_category,
    location: input.location,
    employment_type: input.employment_type,
    count: Math.max(input.limit * 3, input.limit)
  };
}

export async function searchEntryJobs(input: SearchEntryJobsInput, client: SaraminClient = new HttpSaraminClient()): Promise<string> {
  const jobs = await client.searchJobs(buildSaraminSearchParams(input));
  const rankedJobs: JobPosting[] = rankJobs(jobs, input);
  return formatJobSearchResults(rankedJobs, input.deadline_within_days, input.keywords);
}
