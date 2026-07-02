import type { GenerateTeamReminderInput, ReminderTask } from "../schemas/index.js";

export function generateTeamReminder(input: GenerateTeamReminderInput): string {
  const activeTasks = input.tasks.filter((task) => task.task.trim());
  const decisions = input.decisions ?? [];
  const pendingItems = input.pending_items ?? [];

  if (activeTasks.length === 0) {
    return "공유할 할 일이나 마감일이 없습니다.";
  }

  if (activeTasks.length === 0 && decisions.length === 0 && pendingItems.length === 0) {
    return "보낼 내용이 부족합니다. 할 일, 마감, 결정사항 중 하나 이상을 입력해 주세요.";
  }

  const paragraphs: string[] = [];

  if (input.include_greeting) {
    paragraphs.push(greetingForTone(input.tone));
  }

  const context = input.project_context ? `${input.project_context} 관련해서 ` : "";
  const decisionText = decisions.length > 0 ? `결정된 내용은 ${decisions.slice(0, 3).join(", ")}입니다. ` : "";
  paragraphs.push(`${context}${decisionText}할 일은 ${formatTasks(activeTasks)}입니다.`);

  if (pendingItems.length > 0) {
    paragraphs.push(`아직 정해야 할 것은 ${pendingItems.slice(0, 5).join(", ")}입니다.`);
  }

  if (input.deadline) {
    paragraphs.push(`전체 제출 마감은 ${input.deadline}입니다.`);
  }

  const message = paragraphs.join("\n\n");
  if (message.length <= 900) {
    return message;
  }

  return `할 일은 ${formatTasks(activeTasks.slice(0, 5))}입니다.${input.deadline ? `\n\n전체 제출 마감은 ${input.deadline}입니다.` : ""}`;
}

function greetingForTone(tone: GenerateTeamReminderInput["tone"]): string {
  switch (tone) {
    case "concise":
      return "오늘 정리 내용 공유합니다.";
    case "polite":
      return "안녕하세요, 오늘 논의한 내용을 공유드립니다.";
    case "firm":
      return "마감 기준으로 정리한 내용을 공유합니다.";
    case "friendly":
    default:
      return "오늘 정리한 내용 공유할게요.";
  }
}

function formatTasks(tasks: ReminderTask[]): string {
  return tasks
    .slice(0, 8)
    .map((task) => {
      const owner = task.owner ? `${task.owner} ` : "";
      const deadline = task.deadline ? `(${task.deadline})` : "";
      return `${owner}${task.task}${deadline}`;
    })
    .join(", ");
}
