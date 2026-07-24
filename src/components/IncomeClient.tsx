"use client";

import { DeleteButton, IncomeForm } from "@/components/forms";
import { btnEdit, Card, EmptyState } from "@/components/ui";
import { createIncome, deleteIncome, updateIncome } from "@/lib/actions";
import { formatMoney, formatShortDate } from "@/lib/format";
import { weekdayLabel } from "@/lib/period";
import { useState } from "react";

type Row = {
  id: number;
  name: string;
  frequency: string;
  payDay: number;
  startDate: string;
  endDate: string | null;
  grossAmount: number | null;
  takeHomeAmount: number;
  notes: string | null;
};

export function IncomeClient({
  rows,
  currency,
}: {
  rows: Row[];
  currency: string;
}) {
  const [editing, setEditing] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);

  const monthlyish = rows.reduce((s, r) => {
    const factor =
      r.frequency === "weekly"
        ? 52 / 12
        : r.frequency === "biweekly"
          ? 26 / 12
          : r.frequency === "yearly"
            ? 1 / 12
            : 1;
    return s + r.takeHomeAmount * factor;
  }, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          <span className="font-semibold text-ink">{rows.length}</span> sources ·
          approx{" "}
          <span className="font-semibold text-pos">
            {formatMoney(monthlyish, currency)}
          </span>
          /mo take-home
        </p>
        <button
          type="button"
          onClick={() => {
            setShowNew((v) => !v);
            setEditing(null);
          }}
          className="inline-flex min-h-[46px] items-center rounded-full bg-brand px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-deep active:scale-[0.98]"
        >
          {showNew ? "Close" : "+ Add income"}
        </button>
      </div>

      {showNew ? (
        <Card className="animate-rise p-5">
          <h2 className="mb-4 font-display text-xl text-ink">
            New fixed income
          </h2>
          <IncomeForm
            submitLabel="Add"
            action={async (fd) => {
              await createIncome(fd);
              setShowNew(false);
            }}
            onCancel={() => setShowNew(false)}
            initial={{
              name: "",
              frequency: "monthly",
              payDay: 1,
              startDate: new Date().toISOString().slice(0, 10),
              endDate: null,
              grossAmount: null,
              takeHomeAmount: 0,
              notes: null,
            }}
          />
        </Card>
      ) : null}

      {rows.length === 0 ? (
        <EmptyState
          title="No fixed income yet"
          description="Add salary or other recurring pay with take-home (and optional gross)."
        />
      ) : (
        <ul className="space-y-2.5">
          {rows.map((row) => (
            <li key={row.id}>
              {editing === row.id ? (
                <Card className="animate-rise p-4">
                  <IncomeForm
                    submitLabel="Update"
                    initial={row}
                    action={async (fd) => {
                      await updateIncome(row.id, fd);
                      setEditing(null);
                    }}
                    onCancel={() => setEditing(null)}
                  />
                </Card>
              ) : (
                <Card className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-ink">{row.name}</p>
                      <p className="text-sm text-ink-muted">
                        {row.frequency} ·{" "}
                        {row.frequency === "weekly" ||
                        row.frequency === "biweekly"
                          ? weekdayLabel(row.payDay)
                          : `day ${row.payDay}`}
                        {row.grossAmount != null
                          ? ` · gross ${formatMoney(row.grossAmount, currency)}`
                          : ""}
                      </p>
                      <p className="text-xs text-ink-muted">
                        {formatShortDate(row.startDate)}
                        {row.endDate
                          ? ` → ${formatShortDate(row.endDate)}`
                          : " → ongoing"}
                      </p>
                    </div>
                    <span className="shrink-0 font-semibold tabular-nums text-pos">
                      {formatMoney(row.takeHomeAmount, currency)}
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
                        await deleteIncome(row.id);
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
