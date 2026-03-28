import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { ProductStockToggle } from "./ProductStockToggle";

async function getProducts() {
  const supabase = createAdminClient();
  const { data, error } = (await supabase
    .from("products")
    .select(
      "*, product_images(url, sort_order), variants(id, name, in_stock)"
    )
    .order("sort_order")) as { data: any[] | null; error: any };

  if (error) throw new Error(error.message);
  return data ?? [];
}

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-head text-2xl font-bold text-ww-white">
            Products
          </h1>
          <p className="text-sm text-ww-muted mt-0.5">
            {products.length} product{products.length !== 1 ? "s" : ""} in your
            catalog
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 bg-ww-purple hover:bg-ww-purple/80 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Add Product
        </Link>
      </div>

      {/* Product List */}
      {products.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          }
          title="No products yet"
          description="Create your first product listing to get started."
          action={
            <Link
              href="/admin/products/new"
              className="px-4 py-2 bg-ww-purple hover:bg-ww-purple/80 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Add Product
            </Link>
          }
        />
      ) : (
        <div className="bg-ww-dark border border-ww-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ww-border">
                <th className="text-left text-xs font-medium text-ww-muted uppercase tracking-wider px-4 py-3">
                  Product
                </th>
                <th className="text-left text-xs font-medium text-ww-muted uppercase tracking-wider px-4 py-3">
                  Category
                </th>
                <th className="text-left text-xs font-medium text-ww-muted uppercase tracking-wider px-4 py-3">
                  Price
                </th>
                <th className="text-left text-xs font-medium text-ww-muted uppercase tracking-wider px-4 py-3">
                  Badge
                </th>
                <th className="text-left text-xs font-medium text-ww-muted uppercase tracking-wider px-4 py-3">
                  Variants
                </th>
                <th className="text-center text-xs font-medium text-ww-muted uppercase tracking-wider px-4 py-3">
                  In Stock
                </th>
                <th className="text-right text-xs font-medium text-ww-muted uppercase tracking-wider px-4 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product: any) => {
                const primaryImage = product.product_images
                  ?.sort(
                    (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
                  )
                  ?.[0]?.url;

                return (
                  <tr
                    key={product.id}
                    className="border-b border-ww-border/50 last:border-0 hover:bg-ww-surface/30 transition-colors"
                  >
                    {/* Product */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {primaryImage ? (
                          <img
                            src={primaryImage}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover bg-ww-surface"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-ww-surface flex items-center justify-center text-ww-muted">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v13.5a1.5 1.5 0 001.5 1.5z" />
                            </svg>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-ww-white">
                            {product.name}
                          </p>
                          <p className="text-xs text-ww-muted">{product.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 text-sm text-ww-text capitalize">
                      {product.category}
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3 text-sm text-ww-text">
                      {formatPrice(product.price / 100)}
                    </td>

                    {/* Badge */}
                    <td className="px-4 py-3">
                      {product.badge ? (
                        <StatusBadge status={product.badge} />
                      ) : (
                        <span className="text-xs text-ww-muted">—</span>
                      )}
                    </td>

                    {/* Variants */}
                    <td className="px-4 py-3 text-sm text-ww-text">
                      {product.variants?.length || 0}
                    </td>

                    {/* Stock Toggle */}
                    <td className="px-4 py-3 text-center">
                      <ProductStockToggle
                        productId={product.id}
                        inStock={product.in_stock}
                      />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-xs text-ww-purple hover:text-ww-purple/80 font-medium transition-colors"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
