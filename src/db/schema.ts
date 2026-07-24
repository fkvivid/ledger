import { relations, sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const categoryTypes = [
  "essential",
  "extra",
  "transport",
  "food",
  "luxury",
  "custom",
] as const;
export type CategoryType = (typeof categoryTypes)[number];

export const frequencies = ["weekly", "biweekly", "monthly", "yearly"] as const;
export type Frequency = (typeof frequencies)[number];

export const expenseFrequencies = ["weekly", "monthly", "yearly"] as const;
export type ExpenseFrequency = (typeof expenseFrequencies)[number];

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type", { enum: categoryTypes }).notNull().default("custom"),
  color: text("color").notNull().default("#2F5D50"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const recurringExpenses = sqliteTable("recurring_expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  amount: real("amount").notNull(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id),
  frequency: text("frequency", { enum: expenseFrequencies }).notNull(),
  /** Day of month (1-31) for monthly/yearly, or weekday (0=Sun..6=Sat) for weekly */
  payDay: integer("pay_day").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  notes: text("notes"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const fixedIncomes = sqliteTable("fixed_incomes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  frequency: text("frequency", { enum: frequencies }).notNull(),
  payDay: integer("pay_day").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  grossAmount: real("gross_amount"),
  takeHomeAmount: real("take_home_amount").notNull(),
  notes: text("notes"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(),
  amount: real("amount").notNull(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id),
  note: text("note"),
  merchant: text("merchant"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  currency: text("currency").notNull().default("USD"),
  weekStart: integer("week_start").notNull().default(1),
  displayName: text("display_name").notNull().default("My Finances"),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  recurringExpenses: many(recurringExpenses),
  transactions: many(transactions),
}));

export const recurringExpensesRelations = relations(
  recurringExpenses,
  ({ one }) => ({
    category: one(categories, {
      fields: [recurringExpenses.categoryId],
      references: [categories.id],
    }),
  }),
);

export const transactionsRelations = relations(transactions, ({ one }) => ({
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
}));

export type Category = typeof categories.$inferSelect;
export type RecurringExpense = typeof recurringExpenses.$inferSelect;
export type FixedIncome = typeof fixedIncomes.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Settings = typeof settings.$inferSelect;
