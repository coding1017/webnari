import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-head text-2xl font-bold text-ww-white">
          Add Product
        </h1>
        <p className="text-sm text-ww-muted mt-0.5">
          Create a new product listing
        </p>
      </div>
      <ProductForm mode="create" />
    </div>
  );
}
