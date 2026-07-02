export const MAX_CHAT_TEXT_LENGTH = 12000;

export function normalizeLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function stripSpeaker(line: string): { speaker?: string; message: string } {
  const match = line.match(/^\s*\[([^\]]+)\]\s*(.+)$/);
  if (!match) {
    return { message: line.trim() };
  }

  return {
    speaker: match[1]?.trim(),
    message: match[2]?.trim() ?? ""
  };
}

export function uniq(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export function limit(values: string[], maxItems: number): string[] {
  return values.slice(0, maxItems);
}

export function compactJoin(values: Array<string | undefined>, separator: string): string {
  return values.filter((value): value is string => Boolean(value && value.trim())).join(separator);
}

export function hasAnyText(...values: Array<string | undefined>): boolean {
  return values.some((value) => Boolean(value?.trim()));
}
