import { IncomeClient } from "@/components/IncomeClient";
import { PageHeader } from "@/components/ui";
import { getFixedIncomes, getSettings } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function IncomePage() {
  const [rows, settings] = await Promise.all([
    getFixedIncomes(),
    getSettings(),
  ]);

  return (
    <>
      <PageHeader
        title="Income"
        description="Salary and other fixed pay — enter take-home (required) and gross (optional)."
      />
      <IncomeClient rows={rows} currency={settings.currency} />
    </>
  );
}
