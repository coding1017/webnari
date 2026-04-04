import { CommerceClient } from "@/lib/commerce";
import Link from "next/link";

function formatCents(cents: number) { return `$${(cents / 100).toFixed(2)}`; }

export default async function ProductsPage({
  params, searchParams,
}: {
  params: Promise<{ storeId: string }>;
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const { storeId } = await params;
  const sp = await searchParams;
  const client = new CommerceClient(storeId);
  let products = [];
  try { products = await client.getProducts({ search: sp.search, category: sp.category }); } catch {}

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="text-xl sm:text-2xl font-bold" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Products</h1>
        <Link href={`/${storeId}/products/new`} className="btn btn-primary text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add Product
        </Link>
      </div>

      <form className="mb-6 flex gap-3 flex-wrap" action={`/${storeId}/products`}>
        <input name="search" defaultValue={sp.search || ""} placeholder="Search products..." className="max-w-sm" style={{ maxWidth: "320px" }} />
        <button type="submit" className="btn btn-secondary text-sm">Search</button>
        {sp.search && <Link href={`/${storeId}/products`} className="btn btn-secondary text-sm">Clear</Link>}
      </form>

      <div className="table-card">
        {products.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th className="hide-mobile">Category</th>
                <th className="text-right">Price</th>
                <th className="text-center hide-mobile">Stock</th>
                <th className="text-center hide-mobile">Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: { id: string; name: string; category: string; price: number; stock_quantity: number; in_stock: boolean; variantCount: number; thumbnail: string | null }) => (
                <tr key={p.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl shrink-0 overflow-hidden" style={{ background: "var(--bg-grouped)", border: "1px solid var(--border)" }}>
                        {p.thumbnail ? (
                          <img src={p.thumbnail} alt="" className="w-10 h-10 object-cover" />
                        ) : (
                          <div className="w-10 h-10 flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="var(--text-tertiary)" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{p.name}</span>
                        {p.variantCount > 0 && <div className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{p.variantCount} variant{p.variantCount !== 1 ? "s" : ""}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="text-sm capitalize hide-mobile">{p.category || "—"}</td>
                  <td className="text-sm text-right font-semibold" style={{ color: "var(--text-primary)" }}>{formatCents(p.price)}</td>
                  <td className="text-sm text-center hide-mobile">
                    <span style={{ color: p.stock_quantity <= 5 ? "var(--orange)" : "var(--text-secondary)" }}>{p.stock_quantity}</span>
                  </td>
                  <td className="text-center hide-mobile">
                    <span className={`badge ${p.in_stock ? "badge-green" : "badge-red"}`}>
                      {p.in_stock ? "In Stock" : "Out"}
                    </span>
                  </td>
                  <td className="text-right">
                    <Link href={`/${storeId}/products/${p.id}`} className="text-xs font-semibold" style={{ color: "var(--gold)" }}>Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="var(--border-strong)" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            <p className="text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>No products yet</p>
            <p className="text-xs mb-4" style={{ color: "var(--text-tertiary)" }}>Add your first product to get started</p>
            <Link href={`/${storeId}/products/new`} className="btn btn-primary text-sm">Add Product</Link>
          </div>
        )}
      </div>
    </div>
  );
}
