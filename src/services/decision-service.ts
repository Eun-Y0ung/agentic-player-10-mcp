import type { SummarizeTeamDecisionsInput } from "../schemas/index.js";

import { limit, MAX_CHAT_TEXT_LENGTH, normalizeLines, stripSpeaker, uniq } from "./text-utils.js";

const decisionPattern = /하자|하기로|확정|정했|맞지|좋아|그걸로|가자|결정/;
const pendingPattern = /미정|정해야|정하자|확인해야|모르겠|나중|아직|누가|어떻게/;
const agendaPattern = /다음|회의|확인|분배|정하기|정하자|검토/;

export function summarizeTeamDecisions(input: SummarizeTeamDecisionsInput): string {
  if (!input.chat_text.trim()) {
    return "회의 대화 텍스트를 입력해 주세요.";
  }

  if (input.chat_text.length > MAX_CHAT_TEXT_LENGTH) {
    return "대화가 너무 깁니다. 최근 논의 부분만 나누어 입력해 주세요.";
  }

  const lines = normalizeLines(input.chat_text).map((line) => stripSpeaker(line).message);
  const decisions = uniq(lines.filter((line) => decisionPattern.test(line)).map(formatDecision));
  const pendingItems = uniq(lines.filter((line) => pendingPattern.test(line)).map(formatPending));
  const nextAgenda = uniq(lines.filter((line) => agendaPattern.test(line) || pendingPattern.test(line)).map(formatAgenda));

  if (decisions.length === 0 && pendingItems.length === 0) {
    return "확정된 결정사항은 찾지 못했습니다. 할 일, 주제, 마감 등이 더 명확히 언급된 대화를 입력해 주세요.";
  }

  const maxItems = input.max_items;
  const sections = ["결정된 것"];
  sections.push(...formatBullets(limit(decisions, maxItems), "아직 확정된 결정사항이 없습니다."));
  sections.push("", "아직 정할 것");
  sections.push(...formatBullets(limit(pendingItems, maxItems), "추가로 확인할 미정 항목이 없습니다."));
  sections.push("", "다음 회의 안건");
  sections.push(...formatBullets(limit(nextAgenda, maxItems), "다음 회의 안건을 더 정리해 주세요."));

  return sections.join("\n");
}

function formatDecision(line: string): string {
  if (/주제/.test(line)) {
    return `주제: ${clean(line)}`;
  }
  if (/구성|목차/.test(line)) {
    return `구성: ${clean(line)}`;
  }
  return clean(line);
}

function formatPending(line: string): string {
  return clean(line);
}

function formatAgenda(line: string): string {
  if (/참고문헌|출처/.test(line)) {
    return "참고문헌 형식 확인";
  }
  if (/순서/.test(line)) {
    return "발표 순서 확정";
  }
  if (/분배|누가/.test(line)) {
    return "담당자 분배";
  }
  return clean(line);
}

function formatBullets(items: string[], fallback: string): string[] {
  if (items.length === 0) {
    return [`- ${fallback}`];
  }
  return items.map((item) => `- ${item}`);
}

function clean(line: string): string {
  return line.replace(/[.!?。]+$/u, "").trim();
}
