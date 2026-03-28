import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProductForm } from "@/components/admin/ProductForm";
import { DeleteProductButton } from "./DeleteProductButton";

async function getProduct(id: string) {
  const supabase = createAdminClient();
  const { data, error } = (await supabase
    .from("products")
    .select(
      "*, product_images(url, sort_order), variants(id, name, color, price, in_stock, sort_order, variant_images(url, sort_order)), reviews(id, name, text, rating, date, approved)"
    )
    .eq("id", id)
    .single()) as { data: any; error: any };

  if (error || !data) return null;
  return data;
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-head text-2xl font-bold text-ww-white">
            Edit Product
          </h1>
          <p className="text-sm text-ww-muted mt-0.5">{product.name}</p>
        </div>
        <DeleteProductButton productId={product.id} productName={product.name} />
      </div>

      <ProductForm product={product} mode="edit" />

      {/* Variants Section */}
      {product.variants?.length > 0 && (
        <div className="bg-ww-dark border border-ww-border rounded-lg p-5 max-w-2xl">
          <h2 className="font-head font-semibold text-ww-white mb-4">
            Variants ({product.variants.length})
          </h2>
          <div className="space-y-3">
            {product.variants
              .sort((a: any, b: any) => a.sort_order - b.sort_order)
              .map((variant: any) => (
                <div
                  key={variant.id}
                  className="flex items-center justify-between py-2 px-3 bg-ww-surface rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full border border-ww-border"
                      style={{ backgroundColor: variant.color }}
                    />
                    <div>
                      <p className="text-sm font-medium text-ww-white">
                        {variant.name}
                      </p>
                      <p className="text-xs text-ww-muted">
                        ${(variant.price / 100).toFixed(2)}
                        {!variant.in_stock && " · Out of stock"}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-ww-muted">{variant.id}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      {product.reviews?.length > 0 && (
        <div className="bg-ww-dark border border-ww-border rounded-lg p-5 max-w-2xl">
          <h2 className="font-head font-semibold text-ww-white mb-4">
            Reviews ({product.reviews.length})
          </h2>
          <div className="space-y-3">
            {product.reviews.map((review: any) => (
              <div
                key={review.id}
                className="py-2 px-3 bg-ww-surface rounded-lg"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-ww-white">
                    {review.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-yellow-400">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </span>
                    <span
                      className={`text-xs ${review.approved ? "text-green-400" : "text-yellow-400"}`}
                    >
                      {review.approved ? "Approved" : "Pending"}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-ww-muted">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
