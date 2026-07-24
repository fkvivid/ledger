"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

const links = [
  { href: "/", label: "Overview", icon: HomeIcon },
  { href: "/recurring", label: "Recurring", icon: RepeatIcon },
  { href: "/income", label: "Income", icon: WalletIcon },
  { href: "/expenses", label: "Expenses", icon: ReceiptIcon },
  { href: "/categories", label: "Categories", icon: TagIcon },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 sm:py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white shadow-sm">
            <LeafIcon />
          </span>
          <span>
            <span className="block font-display text-xl leading-none tracking-tight text-brand-deep">
              Ledger
            </span>
            <span className="hidden text-xs text-ink-muted sm:block">
              income · commitments · spending
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-brand text-white shadow-sm"
                    : "text-ink-soft hover:bg-brand-soft hover:text-brand-deep"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Categories shortcut on mobile (not in bottom bar) */}
        <Link
          href="/categories"
          className={`flex h-10 w-10 items-center justify-center rounded-full border transition md:hidden ${
            isActive(pathname, "/categories")
              ? "border-brand bg-brand text-white"
              : "border-line-strong bg-surface text-ink-soft"
          }`}
          aria-label="Categories"
        >
          <TagIcon />
        </Link>
      </div>
    </header>
  );
}

export function MobileTabBar() {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = links.slice(0, 4); // Overview, Recurring, Income, Expenses

  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pt-1.5">
        {tabs.slice(0, 2).map((tab) => (
          <TabButton
            key={tab.href}
            href={tab.href}
            label={tab.label}
            active={isActive(pathname, tab.href)}
            icon={<tab.icon />}
          />
        ))}

        {/* Center Add — jumps straight to expense entry */}
        <button
          type="button"
          onClick={() => router.push("/expenses?add=1")}
          className="relative -mt-6 flex flex-col items-center justify-center"
          aria-label="Add expense"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-[0_10px_24px_rgba(15,66,52,0.4)] transition active:scale-95">
            <PlusIcon />
          </span>
          <span className="mt-1 text-[11px] font-medium text-ink-muted">
            Add
          </span>
        </button>

        {tabs.slice(2, 4).map((tab) => (
          <TabButton
            key={tab.href}
            href={tab.href}
            label={tab.label}
            active={isActive(pathname, tab.href)}
            icon={<tab.icon />}
          />
        ))}
      </div>
    </nav>
  );
}

function TabButton({
  href,
  label,
  active,
  icon,
}: {
  href: string;
  label: string;
  active: boolean;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex min-w-[56px] flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[11px] font-medium transition ${
        active ? "text-brand-deep" : "text-ink-muted"
      }`}
    >
      <span
        className={`flex h-6 items-center justify-center ${
          active ? "text-brand" : "text-ink-muted"
        }`}
      >
        {icon}
      </span>
      {label}
    </Link>
  );
}

/* ---------- icons ---------- */

function LeafIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 20c0-8 6-14 16-14 0 10-6 14-14 14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 15c3-3 6-4 9-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function RepeatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 8h11a4 4 0 0 1 4 4M20 16H9a4 4 0 0 1-4-4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m16 5 3 3-3 3M8 19l-3-3 3-3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function WalletIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="6"
        width="18"
        height="13"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="16.5" cy="14.5" r="1.2" fill="currentColor" />
    </svg>
  );
}
function ReceiptIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 3h12v18l-3-1.5L12 21l-3-1.5L6 21z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M9 8h6M9 12h6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
function TagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 12V5a1 1 0 0 1 1-1h7l8 8-8 8z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="8.5" cy="8.5" r="1.3" fill="currentColor" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
