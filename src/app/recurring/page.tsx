import { RecurringClient } from "@/components/RecurringClient";
import { PageHeader } from "@/components/ui";
import {
  getCategories,
  getRecurringExpenses,
  getSettings,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function RecurringPage() {
  const [rows, categories, settings] = await Promise.all([
    getRecurringExpenses(),
    getCategories(),
    getSettings(),
  ]);

  return (
    <>
      <PageHeader
        title="Recurring"
        description="Rent, subscriptions, insurance, loans — with start date, optional end date, and pay day."
      />
      <RecurringClient
        rows={rows}
        categories={categories}
        currency={settings.currency}
      />
    </>
  );
}
