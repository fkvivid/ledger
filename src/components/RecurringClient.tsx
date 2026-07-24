"use client";

import { DeleteButton, RecurringForm } from "@/components/forms";
import { btnEdit, Card, EmptyState } from "@/components/ui";
import {
  createRecurring,
  deleteRecurring,
  updateRecurring,
} from "@/lib/actions";
import { formatMoney, formatShortDate } from "@/lib/format";
import { weekdayLabel } from "@/lib/period";
import { useState } from "react";

type Row = {
  id: number;
  name: string;
  amount: number;
  categoryId: number;
  frequency: string;
  payDay: number;
  startDate: string;
  endDate: string | null;
  notes: string | null;
  categoryName: string | null;
  categoryColor: string | null;
};

export function RecurringClient({
  rows,
  categories,
  currency,
}: {
  rows: Row[];
  categories: { id: number; name: string }[];
  currency: string;
}) {
  const [editing, setEditing] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);

  const monthlyish = rows.reduce((s, r) => {
    const factor =
      r.frequency === "weekly" ? 52 / 12 : r.frequency === "yearly" ? 1 / 12 : 1;
    return s + r.amount * factor;
  }, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          <span className="font-semibold text-ink">{rows.length}</span> bills ·
          approx{" "}
          <span className="font-semibold text-ink">
            {formatMoney(monthlyish, currency)}
          </span>
          /mo
        </p>
        <button
          type="button"
          onClick={() => {
            setShowNew((v) => !v);
            setEditing(null);
          }}
          className="btn-primary inline-flex min-h-[46px] items-center rounded-full bg-brand px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-deep active:scale-[0.98]"
        >
          {showNew ? "Close" : "+ Add recurring"}
        </button>
      </div>

      {showNew ? (
        <Card className="animate-rise p-5">
          <h2 className="mb-4 font-display text-xl text-ink">
            New recurring expense
          </h2>
          <RecurringForm
            categories={categories}
            submitLabel="Add"
            action={async (fd) => {
              await createRecurring(fd);
              setShowNew(false);
            }}
            onCancel={() => setShowNew(false)}
            initial={{
              name: "",
              amount: 0,
              categoryId: categories[0]?.id ?? 1,
              frequency: "monthly",
              payDay: 1,
              startDate: new Date().toISOString().slice(0, 10),
              endDate: null,
              notes: null,
            }}
          />
        </Card>
      ) : null}

      {rows.length === 0 ? (
        <EmptyState
          title="No recurring expenses yet"
          description="Add rent, subscriptions, insurance, or loans with a pay date and optional end date."
        />
      ) : (
        <ul className="space-y-2.5">
          {rows.map((row) => (
            <li key={row.id}>
              {editing === row.id ? (
                <Card className="animate-rise p-4">
                  <RecurringForm
                    categories={categories}
                    submitLabel="Update"
                    initial={row}
                    action={async (fd) => {
                      await updateRecurring(row.id, fd);
                      setEditing(null);
                    }}
                    onCancel={() => setEditing(null)}
                  />
                </Card>
              ) : (
                <Card className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        className="mt-1 h-3 w-3 shrink-0 rounded-full"
                        style={{ background: row.categoryColor ?? "#1f6b57" }}
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-ink">{row.name}</p>
                        <p className="text-sm text-ink-muted">
                          {formatMoney(row.amount, currency)} · {row.frequency} ·{" "}
                          {row.frequency === "weekly"
                            ? weekdayLabel(row.payDay)
                            : `day ${row.payDay}`}{" "}
                          · {row.categoryName}
                        </p>
                        <p className="text-xs text-ink-muted">
                          {formatShortDate(row.startDate)}
                          {row.endDate
                            ? ` → ${formatShortDate(row.endDate)}`
                            : " → ongoing"}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 font-semibold tabular-nums text-ink">
                      {formatMoney(row.amount, currency)}
                    </span>
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
                        await deleteRecurring(row.id);
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
