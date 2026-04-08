import ProductForm from "@/components/ProductForm";
import { CommerceClient } from "@/lib/commerce";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ storeId: string; id: string }>;
}) {
  const { storeId, id } = await params;
  const client = new CommerceClient(storeId);

  // Load store config + product in parallel
  let product;
  let customFieldDefs: { key: string; label: string; type: "text" | "number" | "url" | "textarea" | "select" | "multiselect" | "checkbox"; required?: boolean; options?: string[]; placeholder?: string; group?: string }[] = [];

  try {
    const [productData, store] = await Promise.all([
      client.getProduct(id),
      client.getStore().catch(() => null),
    ]);
    product = productData;
    customFieldDefs = store?.settings?.custom_product_fields || [];
  } catch {
    return (
      <div className="fade-in" style={{ textAlign: "center", padding: "60px" }}>
        <svg className="mx-auto" style={{ width: "48px", height: "48px", marginBottom: "12px" }} fill="none" viewBox="0 0 24 24" stroke="var(--border-strong)" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <h1 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>Product Not Found</h1>
        <p style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>This product doesn&apos;t exist or couldn&apos;t be loaded.</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div style={{ marginBottom: "28px" }}>
        <h1 className="heading-lg">Edit: {product.name}</h1>
        <p style={{ fontSize: "14px", color: "var(--text-tertiary)", marginTop: "4px" }}>
          Update product details, pricing, and variants
        </p>
      </div>
      <ProductForm storeId={storeId} product={product} customFieldDefs={customFieldDefs} />
    </div>
  );
}
