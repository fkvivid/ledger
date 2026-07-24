import { ReactNode } from "react";

export function Card({
  children,
  className = "",
  flat = false,
}: {
  children: ReactNode;
  className?: string;
  flat?: boolean;
}) {
  return (
    <div className={`${flat ? "card-flat" : "card"} ${className}`}>
      {children}
    </div>
  );
}

export function SectionTitle({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-3">
      <h2 className="font-display text-xl text-ink sm:text-2xl">{title}</h2>
      {action}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="animate-rise rounded-2xl border border-dashed border-line-strong bg-surface/60 px-6 py-14 text-center">
      <h3 className="font-display text-2xl text-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl text-ink sm:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-1.5 max-w-xl text-sm text-ink-muted">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
        {label}
      </span>
      {children}
      {hint ? (
        <span className="block text-xs text-ink-muted">{hint}</span>
      ) : null}
    </label>
  );
}

export const inputClass =
  "w-full min-h-[46px] rounded-xl border border-line-strong bg-surface px-3.5 py-2.5 text-base text-ink outline-none transition placeholder:text-ink-muted/70 focus:border-brand focus:ring-2 focus:ring-brand/25";

export const btnPrimary =
  "btn-primary inline-flex min-h-[46px] items-center justify-center rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-deep active:scale-[0.98]";

export const btnGhost =
  "inline-flex min-h-[46px] items-center justify-center rounded-full border border-line-strong bg-surface px-4 py-2 text-sm font-medium text-ink-soft transition hover:border-brand/50 hover:text-brand-deep active:scale-[0.98]";

export const btnDanger =
  "inline-flex min-h-[40px] items-center justify-center rounded-full px-3.5 py-1.5 text-sm font-medium text-neg transition hover:bg-neg-soft";

export const btnEdit =
  "inline-flex min-h-[40px] items-center justify-center rounded-full border border-line-strong bg-surface px-3.5 py-1.5 text-sm font-medium text-ink-soft transition hover:border-brand/50 hover:text-brand-deep";
