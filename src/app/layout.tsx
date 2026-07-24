import { MobileTabBar, Nav } from "@/components/Nav";
import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ledger — Finance Tracker",
  description:
    "Single-user open-source tracker for income, recurring bills, and expenses.",
};

export const viewport: Viewport = {
  themeColor: "#1f6b57",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans text-ink">
        <Nav />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-28 sm:px-6 sm:py-10 md:pb-10">
          {children}
        </main>
        <footer className="mx-auto hidden max-w-6xl px-6 pb-10 text-xs text-ink-muted md:block">
          Ledger · local-only · your data stays in SQLite on this machine
        </footer>
        <MobileTabBar />
      </body>
    </html>
  );
}
