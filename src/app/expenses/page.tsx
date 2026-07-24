import { ExpensesClient } from "@/components/ExpensesClient";
import { PageHeader } from "@/components/ui";
import {
  getCategories,
  getSettings,
  getTransactions,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{
    from?: string;
    to?: string;
    categoryId?: string;
    add?: string;
  }>;
}) {
  const params = await searchParams;
  const categoryId = params.categoryId
    ? Number(params.categoryId)
    : undefined;

  const [rows, categories, settings] = await Promise.all([
    getTransactions({
      from: params.from,
      to: params.to,
      categoryId:
        categoryId && !Number.isNaN(categoryId) ? categoryId : undefined,
    }),
    getCategories(),
    getSettings(),
  ]);

  return (
    <>
      <PageHeader
        title="Expenses"
        description="Weekly and monthly spending — food, gas, travel, stuff. Tag essential, extra, transport, food, or luxury."
      />
      <ExpensesClient
        rows={rows}
        categories={categories}
        currency={settings.currency}
        from={params.from}
        to={params.to}
        categoryId={
          categoryId && !Number.isNaN(categoryId) ? categoryId : undefined
        }
        openAdd={params.add === "1"}
      />
    </>
  );
}
