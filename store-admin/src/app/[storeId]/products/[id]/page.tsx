import ProductForm from "@/components/ProductForm";
import { CommerceClient } from "@/lib/commerce";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ storeId: string; id: string }>;
}) {
  const { storeId, id } = await params;
  const client = new CommerceClient(storeId);

  let product;
  try {
    product = await client.getProduct(id);
  } catch {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>Product Not Found</h1>
        <p style={{ color: "var(--text-tertiary)" }}>This product doesn&apos;t exist or couldn&apos;t be loaded.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8" style={{ color: "var(--text-primary)" }}>Edit: {product.name}</h1>
      <ProductForm storeId={storeId} product={product} />
    </div>
  );
}
