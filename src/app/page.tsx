import { DashboardClient } from "@/components/DashboardClient";
import { getDashboard } from "@/lib/queries";
import type { PeriodKind } from "@/lib/period";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const params = await searchParams;
  const kind: PeriodKind = params.period === "week" ? "week" : "month";
  const data = await getDashboard(kind);

  return <DashboardClient data={data} />;
}
