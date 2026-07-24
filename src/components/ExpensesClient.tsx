"use client";

import { DeleteButton, TransactionForm } from "@/components/forms";
import { btnEdit, Card, EmptyState, inputClass } from "@/components/ui";
import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from "@/lib/actions";
import { formatMoney, formatShortDate, todayISO } from "@/lib/format";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Row = {
  id: number;
  date: string;
  amount: number;
  categoryId: number;
  note: string | null;
  merchant: string | null;
  categoryName: string | null;
  categoryColor: string | null;
  categoryType: string | null;
};

export function ExpensesClient({
  rows,
  categories,
  currency,
  from,
  to,
  categoryId,
  openAdd = false,
}: {
  rows: Row[];
  categories: { id: number; name: string; type: string }[];
  currency: string;
  from?: string;
  to?: string;
  categoryId?: number;
  openAdd?: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(openAdd);
  const [quickCat, setQuickCat] = useState<number | null>(
    categories.find((c) => c.type === "food")?.id ?? categories[0]?.id ?? null,
  );

  const total = rows.reduce((s, r) => s + r.amount, 0);

  function applyFilters(next: {
    from?: string;
    to?: string;
    categoryId?: string;
  }) {
    const params = new URLSearchParams();
    if (next.from) params.set("from", next.from);
    if (next.to) params.set("to", next.to);
    if (next.categoryId) params.set("categoryId", next.categoryId);
    router.push(`/expenses?${params.toString()}`);
  }

  return (
    <div className="space-y-5">
      {/* Quick add — always one tap on mobile */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          <span className="font-semibold text-ink">{rows.length}</span>{" "}
          {rows.length === 1 ? "entry" : "entries"} ·{" "}
          <span className="font-semibold text-ink">
            {formatMoney(total, currency)}
          </span>
        </p>
        <button
          type="button"
          onClick={() => {
            setShowNew((v) => !v);
            setEditing(null);
          }}
          className="inline-flex min-h-[46px] items-center gap-1.5 rounded-full bg-brand px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-deep active:scale-[0.98]"
        >
          {showNew ? "Close" : "+ Add expense"}
        </button>
      </div>

      {/* Category quick chips */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              setQuickCat(c.id);
              setShowNew(true);
            }}
            data-active={quickCat === c.id && showNew}
            className="chip shrink-0"
          >
            {c.name}
          </button>
        ))}
      </div>

      {showNew ? (
        <Card className="animate-rise p-5">
          <h2 className="mb-4 font-display text-xl text-ink">Log an expense</h2>
          <TransactionForm
            categories={categories}
            submitLabel="Add"
            action={async (fd) => {
              await createTransaction(fd);
              setShowNew(false);
            }}
            onCancel={() => setShowNew(false)}
            initial={{
              date: todayISO(),
              amount: 0,
              categoryId: quickCat ?? categories[0]?.id ?? 1,
              note: null,
              merchant: null,
            }}
          />
        </Card>
      ) : null}

      {/* Filters */}
      <Card flat className="p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              From
            </span>
            <input
              type="date"
              className={inputClass}
              defaultValue={from ?? ""}
              onChange={(e) =>
                applyFilters({
                  from: e.target.value,
                  to,
                  categoryId: categoryId ? String(categoryId) : undefined,
                })
              }
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              To
            </span>
            <input
              type="date"
              className={inputClass}
              defaultValue={to ?? ""}
              onChange={(e) =>
                applyFilters({
                  from,
                  to: e.target.value,
                  categoryId: categoryId ? String(categoryId) : undefined,
                })
              }
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Category
            </span>
            <select
              className={inputClass}
              defaultValue={categoryId ? String(categoryId) : ""}
              onChange={(e) =>
                applyFilters({
                  from,
                  to,
                  categoryId: e.target.value || undefined,
                })
              }
            >
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      {rows.length === 0 ? (
        <EmptyState
          title="No expenses in this range"
          description="Log food, gas, travel, or anything else — tag it essential, extra, transport, food, or luxury."
        />
      ) : (
        <ul className="space-y-2.5">
          {rows.map((row) => (
            <li key={row.id}>
              {editing === row.id ? (
                <Card className="animate-rise p-4">
                  <TransactionForm
                    categories={categories}
                    submitLabel="Update"
                    initial={row}
                    action={async (fd) => {
                      await updateTransaction(row.id, fd);
                      setEditing(null);
                    }}
                    onCancel={() => setEditing(null)}
                  />
                </Card>
              ) : (
                <Card className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        className="mt-1 h-3 w-3 shrink-0 rounded-full"
                        style={{ background: row.categoryColor ?? "#1f6b57" }}
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink">
                          {row.merchant || row.note || row.categoryName}
                        </p>
                        <p className="text-sm text-ink-muted">
                          {formatShortDate(row.date)} · {row.categoryName}
                          {row.note && row.merchant ? ` · ${row.note}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="font-semibold tabular-nums text-ink">
                        {formatMoney(row.amount, currency)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end gap-2 border-t border-line pt-3">
                    <button
                      type="button"
                      onClick={() => setEditing(row.id)}
                      className={btnEdit}
                    >
                      Edit
                    </button>
                    <DeleteButton
                      action={async () => {
                        await deleteTransaction(row.id);
                      }}
                    />
                  </div>
                </Card>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
