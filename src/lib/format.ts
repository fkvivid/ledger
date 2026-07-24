import { format, parseISO } from "date-fns";

export function formatMoney(
  amount: number,
  currency = "USD",
  locale = "en-US",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatShortDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "MMM d, yyyy");
  } catch {
    return dateStr;
  }
}

export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function clampPayDay(day: number, year: number, month: number): number {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return Math.min(Math.max(1, day), lastDay);
}
