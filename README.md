# Ledger — single-user finance tracker

Open-source, local-first money tracker for one person. Track take-home income, recurring bills (rent, subscriptions, insurance, loans), and day-to-day spending by category. No bank sync, no cloud account.

## Features

- **Overview dashboard** — leftover for this week/month after take-home − committed bills − logged spend
- **Recurring expenses** — frequency, pay day, start/end or ongoing
- **Fixed income** — weekly / biweekly / monthly / yearly, gross (optional) + take-home
- **Variable expenses** — category chips (essential, extra, transport, food, luxury, custom)
- **Categories** — manage labels and colors
- **SQLite** — all data stays on your machine

## Quick start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Schema and default categories are created automatically on first launch.

Optional explicit setup:

```bash
pnpm db:setup
```

## Scripts

| Command | What it does |
|---------|----------------|
| `pnpm dev` | Dev server |
| `pnpm build` / `pnpm start` | Production |
| `pnpm test` | Unit tests (period math, money formatting) |
| `pnpm db:push` | Apply schema to SQLite |
| `pnpm db:seed` | Seed default categories & settings |
| `pnpm db:setup` | Push + seed |

Database file: `data/finance.db` (gitignored).

## Docker

```bash
docker compose up --build
```

App on port `3000`. SQLite persists in a named volume.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · Drizzle ORM · better-sqlite3 · Recharts

## License

MIT
