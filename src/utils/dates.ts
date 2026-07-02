const dayMs = 24 * 60 * 60 * 1000;

export function today(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * dayMs);
}

export function parseDate(value: string | undefined): Date | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().replace(/\./g, "-").replace(/\//g, "-");
  const match = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!match) {
    return undefined;
  }

  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

export function formatDate(value: string | undefined): string {
  const date = parseDate(value);
  if (!date) {
    return value?.trim() || "원문 확인 필요";
  }

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

export function daysUntil(value: string | undefined, base = today()): number | undefined {
  const date = parseDate(value);
  if (!date) {
    return undefined;
  }
  return Math.ceil((date.getTime() - base.getTime()) / dayMs);
}

export function isWithinDays(value: string | undefined, days: number, base = today()): boolean {
  const remaining = daysUntil(value, base);
  return remaining === undefined || (remaining >= 0 && remaining <= days);
}
