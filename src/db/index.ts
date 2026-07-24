import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "fs";
import path from "path";
import * as schema from "./schema";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "finance.db");

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS categories (
  id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  name text NOT NULL,
  type text DEFAULT 'custom' NOT NULL,
  color text DEFAULT '#2F5D50' NOT NULL,
  created_at text DEFAULT (datetime('now')) NOT NULL
);
CREATE TABLE IF NOT EXISTS fixed_incomes (
  id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  name text NOT NULL,
  frequency text NOT NULL,
  pay_day integer NOT NULL,
  start_date text NOT NULL,
  end_date text,
  gross_amount real,
  take_home_amount real NOT NULL,
  notes text,
  created_at text DEFAULT (datetime('now')) NOT NULL
);
CREATE TABLE IF NOT EXISTS recurring_expenses (
  id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  name text NOT NULL,
  amount real NOT NULL,
  category_id integer NOT NULL,
  frequency text NOT NULL,
  pay_day integer NOT NULL,
  start_date text NOT NULL,
  end_date text,
  notes text,
  created_at text DEFAULT (datetime('now')) NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON UPDATE no action ON DELETE no action
);
CREATE TABLE IF NOT EXISTS settings (
  id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  currency text DEFAULT 'USD' NOT NULL,
  week_start integer DEFAULT 1 NOT NULL,
  display_name text DEFAULT 'My Finances' NOT NULL
);
CREATE TABLE IF NOT EXISTS transactions (
  id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  date text NOT NULL,
  amount real NOT NULL,
  category_id integer NOT NULL,
  note text,
  merchant text,
  created_at text DEFAULT (datetime('now')) NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON UPDATE no action ON DELETE no action
);
`;

function createDb() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.exec(SCHEMA_SQL);

  const db = drizzle(sqlite, { schema });
  return { db, sqlite };
}

const globalForDb = globalThis as unknown as {
  __financeDb?: ReturnType<typeof createDb>;
};

const instance = globalForDb.__financeDb ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__financeDb = instance;
}

export const db = instance.db;
export const sqlite = instance.sqlite;
