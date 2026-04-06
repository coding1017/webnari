import ProductForm from "@/components/ProductForm";

export default async function NewProductPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: "28px" }}>
        <h1 className="heading-lg">Add Product</h1>
        <p style={{ fontSize: "14px", color: "var(--text-tertiary)", marginTop: "4px" }}>
          Create a new product for your store
        </p>
      </div>
      <ProductForm storeId={storeId} />
    </div>
  );
}
