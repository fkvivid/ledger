"use client";

import {
  btnDanger,
  btnGhost,
  btnPrimary,
  Field,
  inputClass,
} from "@/components/ui";
import { weekdayLabel } from "@/lib/period";
import { useState } from "react";

type CategoryOption = { id: number; name: string };

export function RecurringForm({
  categories,
  action,
  initial,
  onCancel,
  submitLabel = "Save",
}: {
  categories: CategoryOption[];
  action: (formData: FormData) => Promise<void>;
  initial?: {
    name: string;
    amount: number;
    categoryId: number;
    frequency: string;
    payDay: number;
    startDate: string;
    endDate: string | null;
    notes: string | null;
  };
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const [frequency, setFrequency] = useState(initial?.frequency ?? "monthly");
  const isWeekly = frequency === "weekly";

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <Field label="Name">
        <input
          name="name"
          required
          defaultValue={initial?.name}
          placeholder="Rent"
          className={inputClass}
        />
      </Field>
      <Field label="Amount">
        <input
          name="amount"
          type="number"
          step="0.01"
          min="0"
          required
          defaultValue={initial?.amount}
          className={inputClass}
        />
      </Field>
      <Field label="Category" hint="Optional — defaults to Essential">
        <select
          name="categoryId"
          defaultValue={initial?.categoryId ?? ""}
          className={inputClass}
        >
          <option value="">Essential (default)</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Frequency">
        <select
          name="frequency"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          className={inputClass}
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </Field>
      <Field
        label={isWeekly ? "Pay weekday" : "Pay day of month"}
        hint={
          isWeekly
            ? "0 = Sunday … 6 = Saturday"
            : "Clamped to last day of short months"
        }
      >
        {isWeekly ? (
          <select
            name="payDay"
            defaultValue={initial?.payDay ?? 1}
            className={inputClass}
          >
            {[0, 1, 2, 3, 4, 5, 6].map((d) => (
              <option key={d} value={d}>
                {weekdayLabel(d)}
              </option>
            ))}
          </select>
        ) : (
          <input
            name="payDay"
            type="number"
            min={1}
            max={31}
            required
            defaultValue={initial?.payDay ?? 1}
            className={inputClass}
          />
        )}
      </Field>
      <Field label="Start date">
        <input
          name="startDate"
          type="date"
          required
          defaultValue={initial?.startDate}
          className={inputClass}
        />
      </Field>
      <Field label="End date" hint="Leave blank if ongoing">
        <input
          name="endDate"
          type="date"
          defaultValue={initial?.endDate ?? ""}
          className={inputClass}
        />
      </Field>
      <Field label="Notes">
        <input
          name="notes"
          defaultValue={initial?.notes ?? ""}
          className={inputClass}
          placeholder="Optional"
        />
      </Field>
      <div className="flex flex-wrap gap-2 sm:col-span-2">
        <button type="submit" className={btnPrimary}>
          {submitLabel}
        </button>
        {onCancel ? (
          <button type="button" onClick={onCancel} className={btnGhost}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

export function DeleteButton({
  action,
  label = "Delete",
}: {
  action: () => Promise<void>;
  label?: string;
}) {
  return (
    <form action={action}>
      <button type="submit" className={btnDanger}>
        {label}
      </button>
    </form>
  );
}

export function IncomeForm({
  action,
  initial,
  onCancel,
  submitLabel = "Save",
}: {
  action: (formData: FormData) => Promise<void>;
  initial?: {
    name: string;
    frequency: string;
    payDay: number;
    startDate: string;
    endDate: string | null;
    grossAmount: number | null;
    takeHomeAmount: number;
    notes: string | null;
  };
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const [frequency, setFrequency] = useState(initial?.frequency ?? "monthly");
  const isWeekBased = frequency === "weekly" || frequency === "biweekly";

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <Field label="Name">
        <input
          name="name"
          required
          defaultValue={initial?.name}
          placeholder="Salary"
          className={inputClass}
        />
      </Field>
      <Field label="Frequency">
        <select
          name="frequency"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          className={inputClass}
        >
          <option value="weekly">Weekly</option>
          <option value="biweekly">Biweekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </Field>
      <Field
        label={isWeekBased ? "Pay weekday" : "Pay day of month"}
        hint={isWeekBased ? "0 = Sunday … 6 = Saturday" : undefined}
      >
        {isWeekBased ? (
          <select
            name="payDay"
            defaultValue={initial?.payDay ?? 5}
            className={inputClass}
          >
            {[0, 1, 2, 3, 4, 5, 6].map((d) => (
              <option key={d} value={d}>
                {weekdayLabel(d)}
              </option>
            ))}
          </select>
        ) : (
          <input
            name="payDay"
            type="number"
            min={1}
            max={31}
            required
            defaultValue={initial?.payDay ?? 1}
            className={inputClass}
          />
        )}
      </Field>
      <Field label="Take-home" hint="After tax / what hits your account">
        <input
          name="takeHomeAmount"
          type="number"
          step="0.01"
          min="0"
          required
          defaultValue={initial?.takeHomeAmount}
          className={inputClass}
        />
      </Field>
      <Field label="Gross (optional)">
        <input
          name="grossAmount"
          type="number"
          step="0.01"
          min="0"
          defaultValue={initial?.grossAmount ?? ""}
          className={inputClass}
        />
      </Field>
      <Field label="Start date">
        <input
          name="startDate"
          type="date"
          required
          defaultValue={initial?.startDate}
          className={inputClass}
        />
      </Field>
      <Field label="End date" hint="Leave blank if ongoing">
        <input
          name="endDate"
          type="date"
          defaultValue={initial?.endDate ?? ""}
          className={inputClass}
        />
      </Field>
      <Field label="Notes">
        <input
          name="notes"
          defaultValue={initial?.notes ?? ""}
          className={inputClass}
        />
      </Field>
      <div className="flex flex-wrap gap-2 sm:col-span-2">
        <button type="submit" className={btnPrimary}>
          {submitLabel}
        </button>
        {onCancel ? (
          <button type="button" onClick={onCancel} className={btnGhost}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

export function TransactionForm({
  categories,
  action,
  initial,
  onCancel,
  submitLabel = "Add expense",
}: {
  categories: CategoryOption[];
  action: (formData: FormData) => Promise<void>;
  initial?: {
    date: string;
    amount: number;
    categoryId: number;
    note: string | null;
    merchant: string | null;
  };
  onCancel?: () => void;
  submitLabel?: string;
}) {
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <Field label="Date">
        <input
          name="date"
          type="date"
          required
          defaultValue={initial?.date}
          className={inputClass}
        />
      </Field>
      <Field label="Amount">
        <input
          name="amount"
          type="number"
          step="0.01"
          min="0"
          required
          defaultValue={initial?.amount}
          className={inputClass}
        />
      </Field>
      <Field label="Category" hint="Optional — defaults to Essential">
        <select
          name="categoryId"
          defaultValue={initial?.categoryId ?? ""}
          className={inputClass}
        >
          <option value="">Essential (default)</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Merchant">
        <input
          name="merchant"
          defaultValue={initial?.merchant ?? ""}
          placeholder="Store or place"
          className={inputClass}
        />
      </Field>
      <Field label="Note">
        <input
          name="note"
          defaultValue={initial?.note ?? ""}
          className={inputClass}
        />
      </Field>
      <div className="flex flex-wrap items-end gap-2">
        <button type="submit" className={btnPrimary}>
          {submitLabel}
        </button>
        {onCancel ? (
          <button type="button" onClick={onCancel} className={btnGhost}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

export function CategoryForm({
  action,
  initial,
  onCancel,
  submitLabel = "Save",
}: {
  action: (formData: FormData) => Promise<void>;
  initial?: { name: string; type: string; color: string };
  onCancel?: () => void;
  submitLabel?: string;
}) {
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-3">
      <Field label="Name">
        <input
          name="name"
          required
          defaultValue={initial?.name}
          className={inputClass}
        />
      </Field>
      <Field label="Type">
        <select
          name="type"
          defaultValue={initial?.type ?? "custom"}
          className={inputClass}
        >
          <option value="essential">Essential</option>
          <option value="extra">Extra</option>
          <option value="transport">Transport</option>
          <option value="food">Food</option>
          <option value="luxury">Luxury</option>
          <option value="custom">Custom</option>
        </select>
      </Field>
      <Field label="Color">
        <input
          name="color"
          type="color"
          defaultValue={initial?.color ?? "#2F5D50"}
          className="h-[46px] w-full cursor-pointer rounded-xl border border-line-strong bg-surface px-2"
        />
      </Field>
      <div className="flex flex-wrap gap-2 sm:col-span-3">
        <button type="submit" className={btnPrimary}>
          {submitLabel}
        </button>
        {onCancel ? (
          <button type="button" onClick={onCancel} className={btnGhost}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
