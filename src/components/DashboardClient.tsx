"use client";

import { Card, SectionTitle } from "@/components/ui";
import { formatMoney, formatShortDate } from "@/lib/format";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DashboardData = {
  settings: { currency: string; displayName: string };
  period: { kind: string; label: string; start: string; end: string };
  takeHome: number;
  committed: number;
  spent: number;
  leftover: number;
  outflow: number;
  savingsRate: number;
  categoryBreakdown: {
    id: number;
    name: string;
    type: string;
    color: string;
    amount: number;
  }[];
  spendByType: { type: string; label: string; color: string; amount: number }[];
  trend: { label: string; out: number; income: number }[];
  upcoming: {
    date: string;
    amount: number;
    name: string;
    categoryName: string | null | undefined;
    categoryColor: string | null | undefined;
  }[];
  recent: {
    id: number;
    date: string;
    amount: number;
    merchant: string | null;
    note: string | null;
    categoryName: string | null;
    categoryColor: string | null;
  }[];
};

export function DashboardClient({ data }: { data: DashboardData }) {
  const router = useRouter();
  const { currency } = data.settings;
  const positive = data.leftover >= 0;
  const hasData =
    data.takeHome > 0 || data.outflow > 0 || data.categoryBreakdown.length > 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero */}
      <Card className="relative overflow-hidden p-5 sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-brand-soft blur-2xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-ink-muted">
              {data.settings.displayName}
              <span className="text-line-strong">·</span>
              {data.period.label}
            </div>
            <p className="mt-4 text-sm font-medium text-ink-muted">
              Leftover this {data.period.kind}
            </p>
            <h1
              className={`animate-count font-display text-5xl leading-none tracking-tight sm:text-6xl ${
                positive ? "text-pos" : "text-neg"
              }`}
            >
              {formatMoney(data.leftover, currency)}
            </h1>
            <p className="mt-3 max-w-md text-sm text-ink-soft">
              {positive
                ? "After take-home, recurring bills, and logged spend."
                : "You’re over for this period — ease up or check upcoming bills."}
            </p>
          </div>

          <div className="flex items-center gap-5">
            <SavingsRing rate={data.savingsRate} positive={positive} />
            <div className="seg self-start">
              {(["week", "month"] as const).map((kind) => (
                <button
                  key={kind}
                  type="button"
                  data-active={data.period.kind === kind}
                  onClick={() => router.push(`/?period=${kind}`)}
                  className="seg-item capitalize"
                >
                  {kind}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stat strip */}
        <div className="relative mt-7 grid grid-cols-2 gap-4 border-t border-line pt-6 lg:grid-cols-4">
          <Stat label="Take-home" value={formatMoney(data.takeHome, currency)} tone="pos" />
          <Stat label="Committed" value={formatMoney(data.committed, currency)} />
          <Stat label="Spent" value={formatMoney(data.spent, currency)} />
          <Stat
            label="Savings rate"
            value={`${data.savingsRate}%`}
            tone={positive ? "pos" : "neg"}
          />
        </div>
      </Card>

      {!hasData ? (
        <Card className="p-8 text-center sm:p-12">
          <h3 className="font-display text-2xl text-ink">Let’s set things up</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
            Add your salary and a few recurring bills, then log daily spend. Your
            leftover and charts update as you go.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link
              href="/income"
              className="inline-flex min-h-[46px] items-center rounded-full bg-brand px-5 text-sm font-semibold text-white"
            >
              Add income
            </Link>
            <Link
              href="/recurring"
              className="inline-flex min-h-[46px] items-center rounded-full border border-line-strong bg-surface px-5 text-sm font-medium text-ink-soft"
            >
              Add recurring bill
            </Link>
          </div>
        </Card>
      ) : (
        <>
          {/* Rich desktop: cash-flow trend + In vs Out */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="hidden p-5 md:block lg:col-span-2">
              <SectionTitle title="Cash flow this period" />
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data.trend}
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="outFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c0492f" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#c0492f" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--line)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      minTickGap={20}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={54}
                      tickFormatter={(v) =>
                        formatMoney(Number(v), currency).replace(/\.00$/, "")
                      }
                    />
                    <Tooltip
                      formatter={(value, name) => [
                        formatMoney(Number(value ?? 0), currency),
                        name === "out" ? "Outflow" : "Income",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="out"
                      stroke="#c0492f"
                      strokeWidth={2.5}
                      fill="url(#outFill)"
                    />
                    <Line
                      type="monotone"
                      dataKey="income"
                      stroke="#1c7a4d"
                      strokeWidth={2.5}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 flex gap-5 text-xs text-ink-muted">
                <Legend color="#1c7a4d" label="Cumulative income" />
                <Legend color="#c0492f" label="Cumulative outflow" />
              </div>
            </Card>

            <Card className="p-5">
              <SectionTitle title="In vs out" />
              <InOutBars
                takeHome={data.takeHome}
                committed={data.committed}
                spent={data.spent}
                currency={currency}
              />
            </Card>
          </div>

          {/* Category donut + spend by type */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-5">
              <SectionTitle
                title="By category"
                action={
                  <Link
                    href="/expenses"
                    className="text-sm font-medium text-brand hover:text-brand-deep"
                  >
                    Expenses
                  </Link>
                }
              />
              {data.categoryBreakdown.length === 0 ? (
                <Placeholder text="No outflow in this period yet." />
              ) : (
                <div className="grid items-center gap-4 sm:grid-cols-2">
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.categoryBreakdown}
                          dataKey="amount"
                          nameKey="name"
                          innerRadius={52}
                          outerRadius={82}
                          paddingAngle={2}
                          stroke="var(--surface)"
                          strokeWidth={2}
                        >
                          {data.categoryBreakdown.map((entry) => (
                            <Cell key={entry.id} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) =>
                            formatMoney(Number(value ?? 0), currency)
                          }
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="space-y-2.5">
                    {data.categoryBreakdown.slice(0, 6).map((c) => (
                      <li
                        key={c.id}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <span className="flex items-center gap-2 text-ink-soft">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ background: c.color }}
                          />
                          {c.name}
                        </span>
                        <span className="font-medium tabular-nums text-ink">
                          {formatMoney(c.amount, currency)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>

            <Card className="p-5">
              <SectionTitle title="Spend by type" />
              {data.spendByType.length === 0 ? (
                <Placeholder text="Tag expenses to see essential vs luxury split." />
              ) : (
                <TypeBars data={data.spendByType} currency={currency} />
              )}
            </Card>
          </div>

          {/* Upcoming + recent */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-5">
              <SectionTitle
                title="Upcoming bills"
                action={
                  <Link
                    href="/recurring"
                    className="text-sm font-medium text-brand hover:text-brand-deep"
                  >
                    Manage
                  </Link>
                }
              />
              {data.upcoming.length === 0 ? (
                <Placeholder text="Nothing due in the next 14 days." />
              ) : (
                <ul>
                  {data.upcoming.slice(0, 6).map((bill, idx) => (
                    <li
                      key={`${bill.name}-${bill.date}-${idx}`}
                      className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: bill.categoryColor ?? "#1f6b57" }}
                        />
                        <div>
                          <p className="text-sm font-medium text-ink">
                            {bill.name}
                          </p>
                          <p className="text-xs text-ink-muted">
                            {formatShortDate(bill.date)}
                            {bill.categoryName ? ` · ${bill.categoryName}` : ""}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-medium tabular-nums text-ink">
                        {formatMoney(bill.amount, currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card className="p-5">
              <SectionTitle
                title="Recent spending"
                action={
                  <Link
                    href="/expenses"
                    className="text-sm font-medium text-brand hover:text-brand-deep"
                  >
                    All
                  </Link>
                }
              />
              {data.recent.length === 0 ? (
                <Placeholder text="Log your first grocery run or gas fill-up." />
              ) : (
                <ul>
                  {data.recent.map((tx) => (
                    <li
                      key={tx.id}
                      className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: tx.categoryColor ?? "#1f6b57" }}
                        />
                        <div>
                          <p className="text-sm font-medium text-ink">
                            {tx.merchant || tx.note || tx.categoryName}
                          </p>
                          <p className="text-xs text-ink-muted">
                            {formatShortDate(tx.date)} · {tx.categoryName}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-medium tabular-nums text-ink">
                        {formatMoney(tx.amount, currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "pos" | "neg";
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
        {label}
      </p>
      <p
        className={`mt-1 font-display text-2xl tabular-nums ${
          tone === "pos"
            ? "text-pos"
            : tone === "neg"
              ? "text-neg"
              : "text-ink"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}

function Placeholder({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-dashed border-line-strong px-4 py-10 text-center text-sm text-ink-muted">
      {text}
    </p>
  );
}

function SavingsRing({
  rate,
  positive,
}: {
  rate: number;
  positive: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, rate));
  const r = 34;
  const circ = 2 * Math.PI * r;
  const dash = (clamped / 100) * circ;
  const color = positive ? "#1c7a4d" : "#c0492f";

  return (
    <div className="relative hidden h-24 w-24 shrink-0 sm:block">
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="var(--line)"
          strokeWidth="8"
        />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-lg text-ink">{rate}%</span>
        <span className="text-[10px] uppercase tracking-wide text-ink-muted">
          saved
        </span>
      </div>
    </div>
  );
}

function InOutBars({
  takeHome,
  committed,
  spent,
  currency,
}: {
  takeHome: number;
  committed: number;
  spent: number;
  currency: string;
}) {
  const out = committed + spent;
  const max = Math.max(takeHome, out, 1);

  return (
    <div className="space-y-5 pt-1">
      <div>
        <div className="mb-1.5 flex justify-between text-sm">
          <span className="font-medium text-ink-soft">In</span>
          <span className="font-medium tabular-nums text-pos">
            {formatMoney(takeHome, currency)}
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-pos"
            style={{ width: `${(takeHome / max) * 100}%` }}
          />
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex justify-between text-sm">
          <span className="font-medium text-ink-soft">Out</span>
          <span className="font-medium tabular-nums text-neg">
            {formatMoney(out, currency)}
          </span>
        </div>
        <div className="flex h-3 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full bg-brand"
            style={{ width: `${(committed / max) * 100}%` }}
            title="Committed"
          />
          <div
            className="h-full bg-accent"
            style={{ width: `${(spent / max) * 100}%` }}
            title="Spent"
          />
        </div>
        <div className="mt-2 flex gap-4 text-xs text-ink-muted">
          <Legend color="var(--brand)" label="Committed bills" />
          <Legend color="var(--accent)" label="Variable spend" />
        </div>
      </div>
    </div>
  );
}

function TypeBars({
  data,
  currency,
}: {
  data: { type: string; label: string; color: string; amount: number }[];
  currency: string;
}) {
  const total = data.reduce((s, d) => s + d.amount, 0) || 1;
  return (
    <ul className="space-y-3.5 pt-1">
      {data.map((d) => (
        <li key={d.type}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium text-ink-soft">{d.label}</span>
            <span className="tabular-nums text-ink-muted">
              {formatMoney(d.amount, currency)}
              <span className="ml-1.5 text-xs text-ink-muted">
                {Math.round((d.amount / total) * 100)}%
              </span>
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(d.amount / total) * 100}%`,
                background: d.color,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
