import { z } from "zod";

import { EmploymentTypeSchema, nonEmptyText, optionalText } from "./common.js";

export const StudentProfileSchema = z.object({
  major: optionalText,
  interests: z.array(z.string().trim().min(1)).optional(),
  preferred_locations: z.array(z.string().trim().min(1)).optional(),
  portfolio_ready: z.boolean().optional()
});

export const SearchEntryJobsInputSchema = z.object({
  keywords: nonEmptyText("찾고 싶은 직무나 키워드를 입력해 주세요."),
  job_category: optionalText,
  location: optionalText,
  employment_type: EmploymentTypeSchema.default("entry"),
  deadline_within_days: z.number().int().min(1).max(60).default(14),
  limit: z.number().int().min(1).max(10).default(5),
  student_profile: StudentProfileSchema.optional()
});

export const GetJobDetailInputObjectSchema = z.object({
  job_id: optionalText,
  job_url: optionalText,
  include_application_brief: z.boolean().default(false)
});

export const GetJobDetailInputSchema = GetJobDetailInputObjectSchema.refine((value) => Boolean(value.job_id || value.job_url), {
  message: "상세 조회할 공고 ID 또는 URL이 필요합니다."
});

export const ApplicationBriefJobSchema = z.object({
  title: nonEmptyText("공고명이 필요합니다."),
  company: optionalText,
  deadline: optionalText,
  requirements: z.array(z.string().trim().min(1)).optional(),
  url: optionalText
});

export const MakeApplicationBriefInputSchema = z.object({
  job: z.object(
    {
      title: nonEmptyText("공고명이 필요합니다."),
      company: optionalText,
      deadline: optionalText,
      requirements: z.array(z.string().trim().min(1)).optional(),
      url: optionalText
    },
    {
      required_error: "체크리스트를 만들 공고 정보가 필요합니다.",
      invalid_type_error: "체크리스트를 만들 공고 정보가 필요합니다."
    }
  ),
  student_profile: StudentProfileSchema.optional()
});

export type SearchEntryJobsInput = z.infer<typeof SearchEntryJobsInputSchema>;
export type GetJobDetailInput = z.infer<typeof GetJobDetailInputSchema>;
export type MakeApplicationBriefInput = z.infer<typeof MakeApplicationBriefInputSchema>;
export type StudentProfile = z.infer<typeof StudentProfileSchema>;
