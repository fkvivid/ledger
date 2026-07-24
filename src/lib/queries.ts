import { ensureSeeded } from "@/db/seed";
import { db } from "@/db";
import {
  categories,
  fixedIncomes,
  recurringExpenses,
  settings,
  transactions,
} from "@/db/schema";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import {
  expandFixedIncome,
  expandRecurringExpense,
  getPeriod,
  sumOccurrences,
  upcomingFromRecurring,
  type PeriodKind,
} from "@/lib/period";
import { typeMeta } from "@/lib/constants";
import { eachDayOfInterval, format, parseISO } from "date-fns";

const round2 = (n: number) => Math.round(n * 100) / 100;

let seeded = false;

export async function initDb() {
  if (!seeded) {
    await ensureSeeded();
    seeded = true;
  }
}

export async function getSettings() {
  await initDb();
  const rows = await db.select().from(settings).limit(1);
  return rows[0]!;
}

export async function getCategories() {
  await initDb();
  return db.select().from(categories).orderBy(categories.name);
}

/** Prefer "Essential", else first category, else create Essential. */
export async function getDefaultCategoryId(): Promise<number> {
  await initDb();
  const all = await db.select().from(categories).orderBy(categories.id);
  const essential = all.find(
    (c) => c.name.toLowerCase() === "essential" || c.type === "essential",
  );
  if (essential) return essential.id;
  if (all[0]) return all[0].id;

  const inserted = await db
    .insert(categories)
    .values({
      name: "Essential",
      type: "essential",
      color: "#1f6b57",
    })
    .returning({ id: categories.id });
  return inserted[0]!.id;
}

export async function getRecurringExpenses() {
  await initDb();
  return db
    .select({
      id: recurringExpenses.id,
      name: recurringExpenses.name,
      amount: recurringExpenses.amount,
      categoryId: recurringExpenses.categoryId,
      frequency: recurringExpenses.frequency,
      payDay: recurringExpenses.payDay,
      startDate: recurringExpenses.startDate,
      endDate: recurringExpenses.endDate,
      notes: recurringExpenses.notes,
      createdAt: recurringExpenses.createdAt,
      categoryName: categories.name,
      categoryType: categories.type,
      categoryColor: categories.color,
    })
    .from(recurringExpenses)
    .leftJoin(categories, eq(recurringExpenses.categoryId, categories.id))
    .orderBy(recurringExpenses.name);
}

export async function getFixedIncomes() {
  await initDb();
  return db.select().from(fixedIncomes).orderBy(fixedIncomes.name);
}

export async function getTransactions(opts?: {
  from?: string;
  to?: string;
  categoryId?: number;
}) {
  await initDb();
  const conditions = [];
  if (opts?.from) conditions.push(gte(transactions.date, opts.from));
  if (opts?.to) conditions.push(lte(transactions.date, opts.to));
  if (opts?.categoryId)
    conditions.push(eq(transactions.categoryId, opts.categoryId));

  const query = db
    .select({
      id: transactions.id,
      date: transactions.date,
      amount: transactions.amount,
      categoryId: transactions.categoryId,
      note: transactions.note,
      merchant: transactions.merchant,
      createdAt: transactions.createdAt,
      categoryName: categories.name,
      categoryType: categories.type,
      categoryColor: categories.color,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .orderBy(desc(transactions.date), desc(transactions.id));

  if (conditions.length > 0) {
    return query.where(and(...conditions));
  }
  return query;
}

export async function getDashboard(kind: PeriodKind) {
  await initDb();
  const s = await getSettings();
  const weekStartsOn = (s.weekStart as 0 | 1 | 2 | 3 | 4 | 5 | 6) ?? 1;
  const period = getPeriod(kind, new Date(), weekStartsOn);
  const fromStr = format(period.start, "yyyy-MM-dd");
  const toStr = format(period.end, "yyyy-MM-dd");

  const [incomes, expenses, txs, cats] = await Promise.all([
    getFixedIncomes(),
    db.select().from(recurringExpenses),
    getTransactions({ from: fromStr, to: toStr }),
    getCategories(),
  ]);

  const incomeOcc = incomes.flatMap((i) =>
    expandFixedIncome(i, period.start, period.end),
  );
  const expenseOcc = expenses.flatMap((e) =>
    expandRecurringExpense(e, period.start, period.end),
  );

  const takeHome = sumOccurrences(incomeOcc);
  const committed = sumOccurrences(expenseOcc);
  const spent = txs.reduce((sum, t) => sum + t.amount, 0);
  const leftover = takeHome - committed - spent;

  const catMap = new Map(cats.map((c) => [c.id, c]));
  const byCategory = new Map<
    number,
    { id: number; name: string; type: string; color: string; amount: number }
  >();

  for (const occ of expenseOcc) {
    if (occ.categoryId == null) continue;
    const cat = catMap.get(occ.categoryId);
    if (!cat) continue;
    const existing = byCategory.get(cat.id);
    if (existing) existing.amount += occ.amount;
    else
      byCategory.set(cat.id, {
        id: cat.id,
        name: cat.name,
        type: cat.type,
        color: cat.color,
        amount: occ.amount,
      });
  }
  for (const tx of txs) {
    const cat = catMap.get(tx.categoryId);
    if (!cat) continue;
    const existing = byCategory.get(cat.id);
    if (existing) existing.amount += tx.amount;
    else
      byCategory.set(cat.id, {
        id: cat.id,
        name: cat.name,
        type: cat.type,
        color: cat.color,
        amount: tx.amount,
      });
  }

  // Spend grouped by category TYPE (essential / extra / transport / food / luxury / custom)
  const byType = new Map<string, number>();
  for (const occ of expenseOcc) {
    const t = occ.categoryId != null ? catMap.get(occ.categoryId)?.type : null;
    const key = t ?? "custom";
    byType.set(key, (byType.get(key) ?? 0) + occ.amount);
  }
  for (const tx of txs) {
    const t = catMap.get(tx.categoryId)?.type ?? "custom";
    byType.set(t, (byType.get(t) ?? 0) + tx.amount);
  }
  const spendByType = [...byType.entries()]
    .map(([type, amount]) => ({
      type,
      label: typeMeta(type).label,
      color: typeMeta(type).color,
      amount: round2(amount),
    }))
    .sort((a, b) => b.amount - a.amount);

  // Daily cumulative cash flow across the period (income line vs outflow area)
  const outByDay = new Map<string, number>();
  for (const o of expenseOcc)
    outByDay.set(o.date, (outByDay.get(o.date) ?? 0) + o.amount);
  for (const tx of txs)
    outByDay.set(tx.date, (outByDay.get(tx.date) ?? 0) + tx.amount);
  const incByDay = new Map<string, number>();
  for (const i of incomeOcc)
    incByDay.set(i.date, (incByDay.get(i.date) ?? 0) + i.amount);

  const days = eachDayOfInterval({ start: period.start, end: period.end });
  let cumOut = 0;
  let cumIncome = 0;
  const trend = days.map((d) => {
    const key = format(d, "yyyy-MM-dd");
    cumOut += outByDay.get(key) ?? 0;
    cumIncome += incByDay.get(key) ?? 0;
    return {
      label: format(d, kind === "week" ? "EEE" : "MMM d"),
      out: round2(cumOut),
      income: round2(cumIncome),
    };
  });

  const savingsRate = takeHome > 0 ? Math.round((leftover / takeHome) * 100) : 0;
  const outflow = committed + spent;

  const upcoming = upcomingFromRecurring(
    expenses,
    new Date(),
    14,
  ).map((o) => ({
    ...o,
    categoryName: o.categoryId != null ? catMap.get(o.categoryId)?.name : null,
    categoryColor:
      o.categoryId != null ? catMap.get(o.categoryId)?.color : null,
  }));

  const recent = txs.slice(0, 8);

  return {
    settings: s,
    period: {
      kind: period.kind,
      label: period.label,
      start: fromStr,
      end: toStr,
    },
    takeHome: round2(takeHome),
    committed: round2(committed),
    spent: round2(spent),
    leftover: round2(leftover),
    outflow: round2(outflow),
    savingsRate,
    categoryBreakdown: [...byCategory.values()]
      .map((c) => ({ ...c, amount: round2(c.amount) }))
      .sort((a, b) => b.amount - a.amount),
    spendByType,
    trend,
    upcoming,
    recent,
    incomeOccurrences: incomeOcc,
    expenseOccurrences: expenseOcc,
  };
}

export function parseDateSafe(value: string): string {
  parseISO(value);
  return value;
}
