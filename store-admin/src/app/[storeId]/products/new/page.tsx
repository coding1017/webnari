import ProductForm from "@/components/ProductForm";
import { CommerceClient } from "@/lib/commerce";

export default async function NewProductPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;

  // Load store config to get custom field definitions (e.g. hemp fields for Leaflyx)
  const client = new CommerceClient(storeId);
  let customFieldDefs: { key: string; label: string; type: "text" | "number" | "url" | "textarea" | "select" | "multiselect" | "checkbox"; required?: boolean; options?: string[]; placeholder?: string; group?: string }[] = [];
  try {
    const store = await client.getStore();
    customFieldDefs = store?.settings?.custom_product_fields || [];
  } catch {}

  return (
    <div className="fade-in">
      <div style={{ marginBottom: "28px" }}>
        <h1 className="heading-lg">Add Product</h1>
        <p style={{ fontSize: "14px", color: "var(--text-tertiary)", marginTop: "4px" }}>
          Create a new product for your store
        </p>
      </div>
      <ProductForm storeId={storeId} customFieldDefs={customFieldDefs} />
    </div>
  );
}
