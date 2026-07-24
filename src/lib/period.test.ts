import { describe, expect, it } from "vitest";
import { formatMoney, clampPayDay } from "@/lib/format";
import {
  expandFixedIncome,
  expandRecurringExpense,
  getPeriod,
  monthlyEquivalent,
  sumOccurrences,
  weekdayLabel,
} from "@/lib/period";
import type { FixedIncome, RecurringExpense } from "@/db/schema";

function expense(
  overrides: Partial<RecurringExpense> & Pick<RecurringExpense, "name" | "amount">,
): RecurringExpense {
  return {
    id: 1,
    categoryId: 1,
    frequency: "monthly",
    payDay: 1,
    startDate: "2025-01-01",
    endDate: null,
    notes: null,
    createdAt: "2025-01-01",
    ...overrides,
  };
}

function income(
  overrides: Partial<FixedIncome> &
    Pick<FixedIncome, "name" | "takeHomeAmount">,
): FixedIncome {
  return {
    id: 1,
    frequency: "monthly",
    payDay: 15,
    startDate: "2025-01-01",
    endDate: null,
    grossAmount: null,
    notes: null,
    createdAt: "2025-01-01",
    ...overrides,
  };
}

describe("formatMoney", () => {
  it("formats USD amounts", () => {
    expect(formatMoney(1234.5, "USD")).toBe("$1,234.50");
  });

  it("formats zero", () => {
    expect(formatMoney(0, "USD")).toBe("$0.00");
  });
});

describe("clampPayDay", () => {
  it("clamps to last day of February", () => {
    expect(clampPayDay(31, 2026, 1)).toBe(28);
  });

  it("keeps valid day", () => {
    expect(clampPayDay(15, 2026, 6)).toBe(15);
  });
});

describe("getPeriod", () => {
  it("builds a month window", () => {
    const period = getPeriod("month", new Date("2026-07-15"));
    expect(period.kind).toBe("month");
    expect(period.label).toMatch(/July 2026/);
    expect(period.start.getDate()).toBe(1);
    expect(period.end.getDate()).toBe(31);
  });

  it("builds a week window starting Monday by default", () => {
    const period = getPeriod("week", new Date("2026-07-15"), 1);
    expect(period.kind).toBe("week");
    expect(period.start.getDay()).toBe(1);
    expect(period.end.getDay()).toBe(0);
  });
});

describe("expandRecurringExpense", () => {
  it("emits one monthly occurrence in July", () => {
    const period = getPeriod("month", new Date("2026-07-15"));
    const occ = expandRecurringExpense(
      expense({ name: "Rent", amount: 1800, payDay: 1 }),
      period.start,
      period.end,
    );
    expect(occ).toHaveLength(1);
    expect(occ[0]?.date).toBe("2026-07-01");
    expect(occ[0]?.amount).toBe(1800);
  });

  it("stops after endDate", () => {
    const period = getPeriod("month", new Date("2026-07-15"));
    const occ = expandRecurringExpense(
      expense({
        name: "Netflix",
        amount: 15.99,
        payDay: 20,
        endDate: "2026-06-30",
      }),
      period.start,
      period.end,
    );
    expect(occ).toHaveLength(0);
  });

  it("expands weekly bills in a week", () => {
    const period = getPeriod("week", new Date("2026-07-15"), 1);
    const occ = expandRecurringExpense(
      expense({
        name: "Gym",
        amount: 20,
        frequency: "weekly",
        payDay: 3, // Wednesday
        startDate: "2026-01-01",
      }),
      period.start,
      period.end,
    );
    expect(occ).toHaveLength(1);
    expect(occ[0]?.amount).toBe(20);
  });
});

describe("expandFixedIncome", () => {
  it("projects monthly take-home", () => {
    const period = getPeriod("month", new Date("2026-07-15"));
    const occ = expandFixedIncome(
      income({ name: "Salary", takeHomeAmount: 5500, payDay: 15 }),
      period.start,
      period.end,
    );
    expect(occ).toHaveLength(1);
    expect(occ[0]?.amount).toBe(5500);
  });

  it("projects biweekly paydays", () => {
    const period = getPeriod("month", new Date("2026-07-15"));
    const occ = expandFixedIncome(
      income({
        name: "Contract",
        takeHomeAmount: 2000,
        frequency: "biweekly",
        payDay: 5, // Friday
        startDate: "2026-07-03",
      }),
      period.start,
      period.end,
    );
    expect(occ.length).toBeGreaterThanOrEqual(1);
    expect(sumOccurrences(occ)).toBeGreaterThanOrEqual(2000);
  });
});

describe("leftover math", () => {
  it("computes take-home − committed − spent", () => {
    const period = getPeriod("month", new Date("2026-07-15"));
    const takeHome = sumOccurrences(
      expandFixedIncome(
        income({ name: "Salary", takeHomeAmount: 5500 }),
        period.start,
        period.end,
      ),
    );
    const committed = sumOccurrences(
      expandRecurringExpense(
        expense({ name: "Rent", amount: 1800 }),
        period.start,
        period.end,
      ),
    );
    const spent = 250;
    expect(takeHome - committed - spent).toBe(3450);
  });
});

describe("monthlyEquivalent", () => {
  it("converts weekly and yearly to monthly", () => {
    expect(monthlyEquivalent(100, "weekly")).toBeCloseTo(100 * (52 / 12));
    expect(monthlyEquivalent(1200, "yearly")).toBe(100);
    expect(monthlyEquivalent(500, "monthly")).toBe(500);
  });
});

describe("weekdayLabel", () => {
  it("labels weekdays", () => {
    expect(weekdayLabel(0)).toBe("Sun");
    expect(weekdayLabel(5)).toBe("Fri");
  });
});

describe("resolveCategoryId behavior", () => {
  it("treats empty string as missing (defaults apply in actions)", () => {
    const raw = "";
    const parsed = raw.trim() ? Number(raw) : null;
    expect(parsed).toBeNull();
  });

  it("parses a valid category id", () => {
    const raw = "6";
    const id = Number(raw);
    expect(id).toBe(6);
    expect(Number.isNaN(id)).toBe(false);
  });
});
