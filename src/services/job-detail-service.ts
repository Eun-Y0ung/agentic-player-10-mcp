import type { GetJobDetailInput } from "../schemas/index.js";
import { UserSafeError } from "../utils/errors.js";
import { formatJobDetail } from "../utils/format.js";

import { createApplicationBrief } from "./application-brief-service.js";
import { HttpSaraminClient, type SaraminClient } from "./saramin-client.js";

export async function getJobDetail(input: GetJobDetailInput, client: SaraminClient = new HttpSaraminClient()): Promise<string> {
  const job = await client.getJobDetail({ job_id: input.job_id, job_url: input.job_url });
  if (!job) {
    throw new UserSafeError("공고를 찾지 못했습니다. 마감되었거나 URL이 변경되었을 수 있습니다.");
  }

  const brief = input.include_application_brief ? createApplicationBrief(job) : undefined;
  return formatJobDetail(job, brief);
}
