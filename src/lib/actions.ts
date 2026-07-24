"use server";

import { db } from "@/db";
import {
  categories,
  categoryTypes,
  expenseFrequencies,
  fixedIncomes,
  frequencies,
  recurringExpenses,
  transactions,
} from "@/db/schema";
import { getDefaultCategoryId, initDb } from "@/lib/queries";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

function money(v: unknown) {
  const n = typeof v === "string" ? Number(v) : Number(v);
  if (Number.isNaN(n) || n < 0) throw new Error("Invalid amount");
  return n;
}

/** Empty / missing category → default Essential (or first available). */
async function resolveCategoryId(raw: FormDataEntryValue | null) {
  const value = String(raw ?? "").trim();
  if (value) {
    const id = Number(value);
    if (!Number.isNaN(id) && id > 0) return id;
  }
  return getDefaultCategoryId();
}

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/recurring");
  revalidatePath("/income");
  revalidatePath("/expenses");
  revalidatePath("/categories");
}

const categorySchema = z.object({
  name: z.string().min(1).max(80),
  type: z.enum(categoryTypes),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

export async function createCategory(formData: FormData) {
  await initDb();
  const data = categorySchema.parse({
    name: formData.get("name"),
    type: formData.get("type") || "custom",
    color: formData.get("color") || "#1f6b57",
  });
  await db.insert(categories).values(data);
  revalidateAll();
}

export async function updateCategory(id: number, formData: FormData) {
  await initDb();
  const data = categorySchema.parse({
    name: formData.get("name"),
    type: formData.get("type") || "custom",
    color: formData.get("color") || "#1f6b57",
  });
  await db.update(categories).set(data).where(eq(categories.id, id));
  revalidateAll();
}

export async function deleteCategory(id: number) {
  await initDb();
  await db.delete(categories).where(eq(categories.id, id));
  revalidateAll();
}

const recurringSchema = z.object({
  name: z.string().min(1).max(120),
  amount: z.coerce.number().nonnegative(),
  categoryId: z.number().int().positive(),
  frequency: z.enum(expenseFrequencies),
  payDay: z.coerce.number().int().min(0).max(31),
  startDate: z.string().min(8),
  endDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function createRecurring(formData: FormData) {
  await initDb();
  const endRaw = String(formData.get("endDate") || "").trim();
  const data = recurringSchema.parse({
    name: formData.get("name"),
    amount: money(formData.get("amount")),
    categoryId: await resolveCategoryId(formData.get("categoryId")),
    frequency: formData.get("frequency"),
    payDay: formData.get("payDay"),
    startDate: formData.get("startDate"),
    endDate: endRaw || null,
    notes: String(formData.get("notes") || "").trim() || null,
  });
  await db.insert(recurringExpenses).values(data);
  revalidateAll();
}

export async function updateRecurring(id: number, formData: FormData) {
  await initDb();
  const endRaw = String(formData.get("endDate") || "").trim();
  const data = recurringSchema.parse({
    name: formData.get("name"),
    amount: money(formData.get("amount")),
    categoryId: await resolveCategoryId(formData.get("categoryId")),
    frequency: formData.get("frequency"),
    payDay: formData.get("payDay"),
    startDate: formData.get("startDate"),
    endDate: endRaw || null,
    notes: String(formData.get("notes") || "").trim() || null,
  });
  await db
    .update(recurringExpenses)
    .set(data)
    .where(eq(recurringExpenses.id, id));
  revalidateAll();
}

export async function deleteRecurring(id: number) {
  await initDb();
  await db.delete(recurringExpenses).where(eq(recurringExpenses.id, id));
  revalidateAll();
}

const incomeSchema = z.object({
  name: z.string().min(1).max(120),
  frequency: z.enum(frequencies),
  payDay: z.coerce.number().int().min(0).max(31),
  startDate: z.string().min(8),
  endDate: z.string().optional().nullable(),
  grossAmount: z.coerce.number().nonnegative().optional().nullable(),
  takeHomeAmount: z.coerce.number().nonnegative(),
  notes: z.string().optional().nullable(),
});

export async function createIncome(formData: FormData) {
  await initDb();
  const endRaw = String(formData.get("endDate") || "").trim();
  const grossRaw = String(formData.get("grossAmount") || "").trim();
  const data = incomeSchema.parse({
    name: formData.get("name"),
    frequency: formData.get("frequency"),
    payDay: formData.get("payDay"),
    startDate: formData.get("startDate"),
    endDate: endRaw || null,
    grossAmount: grossRaw ? money(grossRaw) : null,
    takeHomeAmount: money(formData.get("takeHomeAmount")),
    notes: String(formData.get("notes") || "").trim() || null,
  });
  await db.insert(fixedIncomes).values(data);
  revalidateAll();
}

export async function updateIncome(id: number, formData: FormData) {
  await initDb();
  const endRaw = String(formData.get("endDate") || "").trim();
  const grossRaw = String(formData.get("grossAmount") || "").trim();
  const data = incomeSchema.parse({
    name: formData.get("name"),
    frequency: formData.get("frequency"),
    payDay: formData.get("payDay"),
    startDate: formData.get("startDate"),
    endDate: endRaw || null,
    grossAmount: grossRaw ? money(grossRaw) : null,
    takeHomeAmount: money(formData.get("takeHomeAmount")),
    notes: String(formData.get("notes") || "").trim() || null,
  });
  await db.update(fixedIncomes).set(data).where(eq(fixedIncomes.id, id));
  revalidateAll();
}

export async function deleteIncome(id: number) {
  await initDb();
  await db.delete(fixedIncomes).where(eq(fixedIncomes.id, id));
  revalidateAll();
}

const txSchema = z.object({
  date: z.string().min(8),
  amount: z.coerce.number().nonnegative(),
  categoryId: z.number().int().positive(),
  note: z.string().optional().nullable(),
  merchant: z.string().optional().nullable(),
});

export async function createTransaction(formData: FormData) {
  await initDb();
  const data = txSchema.parse({
    date: formData.get("date"),
    amount: money(formData.get("amount")),
    categoryId: await resolveCategoryId(formData.get("categoryId")),
    note: String(formData.get("note") || "").trim() || null,
    merchant: String(formData.get("merchant") || "").trim() || null,
  });
  await db.insert(transactions).values(data);
  revalidateAll();
}

export async function updateTransaction(id: number, formData: FormData) {
  await initDb();
  const data = txSchema.parse({
    date: formData.get("date"),
    amount: money(formData.get("amount")),
    categoryId: await resolveCategoryId(formData.get("categoryId")),
    note: String(formData.get("note") || "").trim() || null,
    merchant: String(formData.get("merchant") || "").trim() || null,
  });
  await db.update(transactions).set(data).where(eq(transactions.id, id));
  revalidateAll();
}

export async function deleteTransaction(id: number) {
  await initDb();
  await db.delete(transactions).where(eq(transactions.id, id));
  revalidateAll();
}
