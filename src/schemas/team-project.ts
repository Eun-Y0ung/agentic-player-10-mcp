import { z } from "zod";

const optionalTrimmedString = z.string().trim().optional();
const nonEmptyString = z.string().trim().min(1);

export const TaskStatusSchema = z.enum(["assigned", "in_progress", "done", "unclear"]);

export const KnownTaskSchema = z.object({
  owner: optionalTrimmedString,
  task: nonEmptyString,
  status: TaskStatusSchema.optional()
});

export const ReminderTaskSchema = KnownTaskSchema.extend({
  deadline: optionalTrimmedString
});

export const ExtractTeamTasksInputSchema = z.object({
  chat_text: z.string({
    required_error: "대화 텍스트를 입력해 주세요.",
    invalid_type_error: "대화 텍스트를 입력해 주세요."
  }),
  project_context: optionalTrimmedString,
  known_members: z.array(z.string().trim().min(1)).optional(),
  base_date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "base_date는 YYYY-MM-DD 형식으로 입력해 주세요.")
    .optional(),
  sender_name: optionalTrimmedString
});

export const SummarizeTeamDecisionsInputSchema = z.object({
  chat_text: z.string({
    required_error: "회의 대화 텍스트를 입력해 주세요.",
    invalid_type_error: "회의 대화 텍스트를 입력해 주세요."
  }),
  project_context: optionalTrimmedString,
  focus: z.enum(["general", "meeting", "submission", "presentation"]).default("general"),
  max_items: z.number().int().min(1).max(10).default(5)
});

export const GenerateTeamReminderInputSchema = z.object({
  project_context: optionalTrimmedString,
  tasks: z.array(ReminderTaskSchema, {
    required_error: "공유할 할 일이나 마감일이 없습니다.",
    invalid_type_error: "공유할 할 일이나 마감일이 없습니다."
  }),
  decisions: z.array(z.string().trim().min(1)).optional(),
  pending_items: z.array(z.string().trim().min(1)).optional(),
  deadline: optionalTrimmedString,
  tone: z.enum(["friendly", "concise", "polite", "firm"]).default("friendly"),
  include_greeting: z.boolean().default(true)
});

export const MakeSubmissionChecklistInputSchema = z.object({
  chat_text: optionalTrimmedString,
  assignment_requirements: optionalTrimmedString,
  deliverable_type: z.enum(["presentation", "report", "prototype", "video", "mixed", "unknown"], {
    required_error: "제출물 유형을 입력해 주세요.",
    invalid_type_error: "제출물 유형을 입력해 주세요."
  }),
  deadline: optionalTrimmedString,
  known_tasks: z.array(KnownTaskSchema).optional()
});

export type ExtractTeamTasksInput = z.infer<typeof ExtractTeamTasksInputSchema>;
export type SummarizeTeamDecisionsInput = z.infer<typeof SummarizeTeamDecisionsInputSchema>;
export type GenerateTeamReminderInput = z.infer<typeof GenerateTeamReminderInputSchema>;
export type MakeSubmissionChecklistInput = z.infer<typeof MakeSubmissionChecklistInputSchema>;
export type KnownTask = z.infer<typeof KnownTaskSchema>;
export type ReminderTask = z.infer<typeof ReminderTaskSchema>;
