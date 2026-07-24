import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isWithinInterval,
  max as maxDate,
  min as minDate,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type {
  ExpenseFrequency,
  FixedIncome,
  Frequency,
  RecurringExpense,
} from "@/db/schema";
import { clampPayDay } from "./format";

export type PeriodKind = "week" | "month";

export type Period = {
  kind: PeriodKind;
  start: Date;
  end: Date;
  label: string;
};

export type Occurrence = {
  date: string;
  amount: number;
  sourceId: number;
  name: string;
  categoryId?: number;
};

function toISO(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function getPeriod(
  kind: PeriodKind,
  reference = new Date(),
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1,
): Period {
  const ref = startOfDay(reference);
  if (kind === "week") {
    const start = startOfWeek(ref, { weekStartsOn });
    const end = endOfWeek(ref, { weekStartsOn });
    return {
      kind,
      start,
      end,
      label: `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`,
    };
  }
  const start = startOfMonth(ref);
  const end = endOfMonth(ref);
  return {
    kind,
    start,
    end,
    label: format(start, "MMMM yyyy"),
  };
}

function parseOptionalEnd(endDate: string | null): Date | null {
  if (!endDate) return null;
  return startOfDay(parseISO(endDate));
}

function activeInRange(
  startDate: string,
  endDate: string | null,
  rangeStart: Date,
  rangeEnd: Date,
): boolean {
  const start = startOfDay(parseISO(startDate));
  const end = parseOptionalEnd(endDate);
  if (isAfter(start, rangeEnd)) return false;
  if (end && isBefore(end, rangeStart)) return false;
  return true;
}

function effectiveWindow(
  startDate: string,
  endDate: string | null,
  rangeStart: Date,
  rangeEnd: Date,
): { from: Date; to: Date } {
  const start = startOfDay(parseISO(startDate));
  const end = parseOptionalEnd(endDate);
  const from = maxDate([start, rangeStart]);
  const to = end ? minDate([end, rangeEnd]) : rangeEnd;
  return { from, to };
}

function monthlyOccurrences(
  payDay: number,
  from: Date,
  to: Date,
): Date[] {
  const dates: Date[] = [];
  let cursor = new Date(from.getFullYear(), from.getMonth(), 1);

  while (!isAfter(cursor, to)) {
    const day = clampPayDay(payDay, cursor.getFullYear(), cursor.getMonth());
    const occ = startOfDay(
      new Date(cursor.getFullYear(), cursor.getMonth(), day),
    );
    if (
      !isBefore(occ, from) &&
      !isAfter(occ, to) &&
      isWithinInterval(occ, { start: from, end: to })
    ) {
      dates.push(occ);
    }
    cursor = addMonths(cursor, 1);
  }
  return dates;
}

function yearlyOccurrences(
  payDay: number,
  startDate: string,
  from: Date,
  to: Date,
): Date[] {
  const anchor = parseISO(startDate);
  const month = anchor.getMonth();
  const dates: Date[] = [];
  let year = from.getFullYear() - 1;
  const endYear = to.getFullYear() + 1;

  while (year <= endYear) {
    const day = clampPayDay(payDay, year, month);
    const occ = startOfDay(new Date(year, month, day));
    if (!isBefore(occ, from) && !isAfter(occ, to)) {
      dates.push(occ);
    }
    year += 1;
  }
  return dates;
}

function weeklyOccurrences(
  weekday: number,
  from: Date,
  to: Date,
): Date[] {
  const dates: Date[] = [];
  let cursor = from;
  // Walk to the first matching weekday
  while (cursor.getDay() !== weekday && !isAfter(cursor, to)) {
    cursor = addDays(cursor, 1);
  }
  while (!isAfter(cursor, to)) {
    dates.push(startOfDay(cursor));
    cursor = addWeeks(cursor, 1);
  }
  return dates;
}

function biweeklyOccurrences(
  startDate: string,
  payDay: number,
  from: Date,
  to: Date,
): Date[] {
  // Anchor to first pay on/after startDate matching payDay (weekday)
  let cursor = startOfDay(parseISO(startDate));
  while (cursor.getDay() !== payDay) {
    cursor = addDays(cursor, 1);
  }
  const dates: Date[] = [];
  // Rewind if needed so we don't miss early occurrences in range
  while (isAfter(cursor, from)) {
    const prev = addWeeks(cursor, -2);
    if (isBefore(prev, parseISO(startDate))) break;
    cursor = prev;
  }
  while (!isAfter(cursor, to)) {
    if (!isBefore(cursor, from) && !isBefore(cursor, parseISO(startDate))) {
      dates.push(startOfDay(cursor));
    }
    cursor = addWeeks(cursor, 2);
  }
  return dates;
}

export function expandRecurringExpense(
  expense: RecurringExpense,
  rangeStart: Date,
  rangeEnd: Date,
): Occurrence[] {
  if (
    !activeInRange(expense.startDate, expense.endDate, rangeStart, rangeEnd)
  ) {
    return [];
  }
  const { from, to } = effectiveWindow(
    expense.startDate,
    expense.endDate,
    rangeStart,
    rangeEnd,
  );
  if (isAfter(from, to)) return [];

  let dates: Date[] = [];
  const freq = expense.frequency as ExpenseFrequency;
  if (freq === "weekly") {
    dates = weeklyOccurrences(expense.payDay, from, to);
  } else if (freq === "monthly") {
    dates = monthlyOccurrences(expense.payDay, from, to);
  } else if (freq === "yearly") {
    dates = yearlyOccurrences(expense.payDay, expense.startDate, from, to);
  }

  return dates.map((d) => ({
    date: toISO(d),
    amount: expense.amount,
    sourceId: expense.id,
    name: expense.name,
    categoryId: expense.categoryId,
  }));
}

export function expandFixedIncome(
  income: FixedIncome,
  rangeStart: Date,
  rangeEnd: Date,
): Occurrence[] {
  if (!activeInRange(income.startDate, income.endDate, rangeStart, rangeEnd)) {
    return [];
  }
  const { from, to } = effectiveWindow(
    income.startDate,
    income.endDate,
    rangeStart,
    rangeEnd,
  );
  if (isAfter(from, to)) return [];

  let dates: Date[] = [];
  const freq = income.frequency as Frequency;
  if (freq === "weekly") {
    dates = weeklyOccurrences(income.payDay, from, to);
  } else if (freq === "biweekly") {
    dates = biweeklyOccurrences(income.startDate, income.payDay, from, to);
  } else if (freq === "monthly") {
    dates = monthlyOccurrences(income.payDay, from, to);
  } else if (freq === "yearly") {
    dates = yearlyOccurrences(income.payDay, income.startDate, from, to);
  }

  return dates.map((d) => ({
    date: toISO(d),
    amount: income.takeHomeAmount,
    sourceId: income.id,
    name: income.name,
  }));
}

export function sumOccurrences(items: Occurrence[]): number {
  return items.reduce((sum, o) => sum + o.amount, 0);
}

export function upcomingFromRecurring(
  expenses: RecurringExpense[],
  from: Date,
  days: number,
): Occurrence[] {
  const to = addDays(from, days);
  const all = expenses.flatMap((e) => expandRecurringExpense(e, from, to));
  return all.sort((a, b) => a.date.localeCompare(b.date));
}

/** Project monthly-equivalent for display helpers */
export function monthlyEquivalent(
  amount: number,
  frequency: Frequency | ExpenseFrequency,
): number {
  switch (frequency) {
    case "weekly":
      return amount * (52 / 12);
    case "biweekly":
      return amount * (26 / 12);
    case "monthly":
      return amount;
    case "yearly":
      return amount / 12;
    default:
      return amount;
  }
}

export function weekdayLabel(day: number): string {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day] ?? String(day);
}

export { addDays, addYears };
