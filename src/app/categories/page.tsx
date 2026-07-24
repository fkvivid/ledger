import { CategoriesClient } from "@/components/CategoriesClient";
import { PageHeader } from "@/components/ui";
import { getCategories } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const rows = await getCategories();

  return (
    <>
      <PageHeader
        title="Categories"
        description="Organize spend and bills by type: essential, extra, transport, food, luxury, or custom."
      />
      <CategoriesClient rows={rows} />
    </>
  );
}
