"use client";

import { CategoryForm, DeleteButton } from "@/components/forms";
import { btnEdit, Card, EmptyState } from "@/components/ui";
import { createCategory, deleteCategory, updateCategory } from "@/lib/actions";
import { typeMeta } from "@/lib/constants";
import { useState } from "react";

type Row = {
  id: number;
  name: string;
  type: string;
  color: string;
};

export function CategoriesClient({ rows }: { rows: Row[] }) {
  const [editing, setEditing] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          <span className="font-semibold text-ink">{rows.length}</span>{" "}
          categories
        </p>
        <button
          type="button"
          onClick={() => {
            setShowNew((v) => !v);
            setEditing(null);
          }}
          className="inline-flex min-h-[46px] items-center rounded-full bg-brand px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-deep active:scale-[0.98]"
        >
          {showNew ? "Close" : "+ Add category"}
        </button>
      </div>

      {showNew ? (
        <Card className="animate-rise p-5">
          <h2 className="mb-4 font-display text-xl text-ink">New category</h2>
          <CategoryForm
            submitLabel="Add"
            action={async (fd) => {
              await createCategory(fd);
              setShowNew(false);
            }}
            onCancel={() => setShowNew(false)}
          />
        </Card>
      ) : null}

      {rows.length === 0 ? (
        <EmptyState
          title="No categories"
          description="Categories help you split essential, extra, transport, food, and luxury spend."
        />
      ) : (
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {rows.map((row) => (
            <li key={row.id}>
              {editing === row.id ? (
                <Card className="animate-rise p-4">
                  <CategoryForm
                    submitLabel="Update"
                    initial={row}
                    action={async (fd) => {
                      await updateCategory(row.id, fd);
                      setEditing(null);
                    }}
                    onCancel={() => setEditing(null)}
                  />
                </Card>
              ) : (
                <Card className="flex items-center justify-between gap-3 p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="h-9 w-9 shrink-0 rounded-full"
                      style={{ background: row.color }}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">
                        {row.name}
                      </p>
                      <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                        {typeMeta(row.type).label}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing(row.id)}
                      className={btnEdit}
                    >
                      Edit
                    </button>
                    <DeleteButton
                      action={async () => {
                        await deleteCategory(row.id);
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
