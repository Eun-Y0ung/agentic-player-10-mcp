import type { ExtractTeamTasksInput } from "../schemas/index.js";

import { compactJoin, limit, MAX_CHAT_TEXT_LENGTH, normalizeLines, stripSpeaker, uniq } from "./text-utils.js";

export class UserFacingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserFacingError";
  }
}

type ParsedTask = {
  owner: string;
  task: string;
  deadline?: string;
};

const taskKeywords = [
  "조사",
  "자료",
  "PPT",
  "피피티",
  "발표",
  "대본",
  "정리",
  "초안",
  "작성",
  "제출",
  "업로드",
  "확인",
  "만들",
  "찾아",
  "맡",
  "할게",
  "할께"
];

const deadlinePattern =
  /(오늘|내일|모레|이번\s*주\s*[월화수목금토일]요일|다음\s*주\s*[월화수목금토일]요일|[월화수목금토일]요일|[월화수목금토일]까지|오전\s*\d{1,2}시|오후\s*\d{1,2}시|\d{1,2}:\d{2}|마감[^,.!?]*)/;

export function extractTeamTasks(input: ExtractTeamTasksInput): string {
  if (!input.chat_text.trim()) {
    return "정리할 대화 내용이 없습니다.";
  }

  if (input.chat_text.length > MAX_CHAT_TEXT_LENGTH) {
    return "대화가 너무 깁니다. 최근 논의 부분만 나누어 입력해 주세요.";
  }

  const lines = normalizeLines(input.chat_text);
  const tasks: ParsedTask[] = [];
  const pending: string[] = [];

  for (const line of lines) {
    const { speaker, message } = stripSpeaker(line);
    const owner = resolveOwner(speaker, input.sender_name);
    const deadline = message.match(deadlinePattern)?.[0]?.trim();

    if (isPendingLine(message)) {
      pending.push(formatPending(message, owner));
      continue;
    }

    if (taskKeywords.some((keyword) => message.includes(keyword))) {
      const task = inferTask(message);
      tasks.push({
        owner: owner ?? "담당자 미정",
        task,
        deadline
      });
    }
  }

  const uniqueTasks = dedupeTasks(tasks);
  const uniquePending = uniq(pending);

  if (uniqueTasks.length === 0 && uniquePending.length === 0) {
    return "확정된 할 일이나 마감일을 찾지 못했습니다. 담당자, 작업, 마감 표현이 더 명확한 대화를 입력해 주세요.";
  }

  const sections: string[] = ["할 일/마감 정리"];

  if (uniqueTasks.length > 0) {
    sections.push(
      ...limit(
        uniqueTasks.map((task) => `- ${task.owner}: ${compactJoin([task.task, task.deadline], " / ")}`),
        8
      )
    );
  }

  if (uniquePending.length > 0) {
    sections.push("", "아직 미정", ...limit(uniquePending.map((item) => `- ${item}`), 6));
  }

  return sections.join("\n");
}

function resolveOwner(speaker: string | undefined, senderName: string | undefined): string | undefined {
  if (!speaker) {
    return undefined;
  }

  if ((speaker === "나" || speaker === "저") && senderName?.trim()) {
    return senderName.trim();
  }

  return speaker;
}

function isPendingLine(message: string): boolean {
  return /미정|정해야|정하자|모르겠|누가|누구|나중|아직/.test(message);
}

function inferTask(message: string): string {
  const candidates: Array<[RegExp, string]> = [
    [/자료\s*조사|조사/, "자료조사"],
    [/PPT|피피티|슬라이드/, "PPT"],
    [/대본/, "발표 대본"],
    [/발표\s*순서/, "발표 순서"],
    [/발표/, "발표"],
    [/제출|업로드/, "제출"],
    [/참고문헌|출처/, "참고문헌 확인"],
    [/초안/, "초안 작성"]
  ];

  const match = candidates.find(([pattern]) => pattern.test(message));
  if (match) {
    return match[1];
  }

  return message.replace(deadlinePattern, "").replace(/[.!?。]+$/u, "").trim().slice(0, 40) || "작업";
}

function formatPending(message: string, owner: string | undefined): string {
  const normalized = message.replace(/[.!?。]+$/u, "").trim();
  return owner ? `${owner}: ${normalized}` : normalized;
}

function dedupeTasks(tasks: ParsedTask[]): ParsedTask[] {
  const seen = new Set<string>();
  return tasks.filter((task) => {
    const key = `${task.owner}:${task.task}:${task.deadline ?? ""}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
