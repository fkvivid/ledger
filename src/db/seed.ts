import { count } from "drizzle-orm";
import { db } from "./index";
import { categories, settings } from "./schema";

const defaultCategories = [
  { name: "Rent", type: "essential" as const, color: "#2F5D50" },
  { name: "Subscriptions", type: "extra" as const, color: "#4A7C6F" },
  { name: "Insurance", type: "essential" as const, color: "#3D6B5E" },
  { name: "Loan", type: "essential" as const, color: "#1E3D36" },
  { name: "Salary", type: "custom" as const, color: "#C4A574" },
  { name: "Essential", type: "essential" as const, color: "#2F5D50" },
  { name: "Extra", type: "extra" as const, color: "#8B7355" },
  { name: "Transport", type: "transport" as const, color: "#5B7C99" },
  { name: "Food", type: "food" as const, color: "#A67C52" },
  { name: "Luxury", type: "luxury" as const, color: "#9B6B7A" },
];

export async function ensureSeeded() {
  const [{ value: settingsCount }] = await db
    .select({ value: count() })
    .from(settings);

  if (settingsCount === 0) {
    await db.insert(settings).values({
      currency: "USD",
      weekStart: 1,
      displayName: "My Finances",
    });
  }

  const [{ value: categoryCount }] = await db
    .select({ value: count() })
    .from(categories);

  if (categoryCount === 0) {
    await db.insert(categories).values(defaultCategories);
  }
}
