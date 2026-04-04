import ProductForm from "@/components/ProductForm";

export default async function NewProductPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8" style={{ color: "var(--text-primary)" }}>Add Product</h1>
      <ProductForm storeId={storeId} />
    </div>
  );
}
