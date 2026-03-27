'use client';

import { getProducts, getLowestPrice } from '@/lib/data';
import { formatPrice } from '@/lib/utils';

export default function AdminDashboard() {
  const products = getProducts();
  const totalProducts = products.length;
  const totalInventory = products.reduce((sum, p) => sum + p.inventory.filter(i => i.isActive && i.quantity > 0).length, 0);
  const totalUnits = products.reduce((sum, p) => sum + p.inventory.filter(i => i.isActive).reduce((s, i) => s + i.quantity, 0), 0);
  const totalValue = products.reduce((sum, p) => sum + p.inventory.filter(i => i.isActive).reduce((s, i) => s + i.price * i.quantity, 0), 0);
  const featuredCount = products.filter(p => p.isFeatured).length;
  const newDropCount = products.filter(p => p.isNewDrop).length;

  // Low stock items (1 unit left)
  const lowStock = products.flatMap(p =>
    p.inventory.filter(i => i.isActive && i.quantity === 1).map(i => ({ product: p, inv: i }))
  ).slice(0, 5);

  return (
    <div>
      <h1 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase mb-6">
        Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Products', value: totalProducts, color: '#6B3FA0' },
          { label: 'SKUs', value: totalInventory, color: '#3B82F6' },
          { label: 'Total Units', value: totalUnits, color: '#8B5CF6' },
          { label: 'Inventory Value', value: formatPrice(totalValue), color: '#D4A853' },
        ].map(stat => (
          <div key={stat.label} className="bg-bcs-surface rounded-xl border border-bcs-border p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-bcs-muted mb-1">{stat.label}</p>
            <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Stats */}
        <div className="bg-bcs-surface rounded-xl border border-bcs-border p-6">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-lg font-bold uppercase mb-4">Quick Stats</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-bcs-text">Featured Products</span>
              <span className="font-medium">{featuredCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-bcs-text">New Drops</span>
              <span className="font-medium">{newDropCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-bcs-text">Brands</span>
              <span className="font-medium">{new Set(products.map(p => p.brandId)).size}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-bcs-text">Avg Price</span>
              <span className="font-medium">{formatPrice(Math.round(products.reduce((s, p) => s + getLowestPrice(p), 0) / products.length))}</span>
            </div>
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-bcs-surface rounded-xl border border-bcs-border p-6">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-lg font-bold uppercase mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-bcs-red animate-pulse" />
            Low Stock Alert
          </h2>
          {lowStock.length === 0 ? (
            <p className="text-sm text-bcs-muted">No low stock items</p>
          ) : (
            <div className="space-y-3">
              {lowStock.map(({ product, inv }) => (
                <div key={inv.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-bcs-white font-medium truncate max-w-[200px]">{product.name}</p>
                    <p className="text-xs text-bcs-muted">Size {inv.size}</p>
                  </div>
                  <span className="text-bcs-red font-medium">1 left</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Products */}
      <div className="mt-6 bg-bcs-surface rounded-xl border border-bcs-border p-6">
        <h2 className="font-[family-name:var(--font-barlow-condensed)] text-lg font-bold uppercase mb-4">All Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-bcs-muted uppercase tracking-wider border-b border-bcs-border">
                <th className="pb-3 pr-4">Product</th>
                <th className="pb-3 pr-4">Brand</th>
                <th className="pb-3 pr-4">Category</th>
                <th className="pb-3 pr-4">Price From</th>
                <th className="pb-3 pr-4">SKUs</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-bcs-border/50 hover:bg-bcs-surface2/50 transition-colors">
                  <td className="py-3 pr-4">
                    <p className="font-medium truncate max-w-[250px]">{p.name}</p>
                    {p.styleCode && <p className="text-xs text-bcs-muted">{p.styleCode}</p>}
                  </td>
                  <td className="py-3 pr-4 text-bcs-text">{p.brand.name}</td>
                  <td className="py-3 pr-4 text-bcs-text">{p.category.name}</td>
                  <td className="py-3 pr-4 font-medium">{formatPrice(getLowestPrice(p))}</td>
                  <td className="py-3 pr-4 text-bcs-text">{p.inventory.filter(i => i.isActive).length}</td>
                  <td className="py-3">
                    <div className="flex gap-1">
                      {p.isFeatured && <span className="text-[10px] px-1.5 py-0.5 bg-bcs-teal/20 text-bcs-teal rounded-full">Featured</span>}
                      {p.isNewDrop && <span className="text-[10px] px-1.5 py-0.5 bg-bcs-gold/20 text-bcs-gold rounded-full">New</span>}
                      {!p.isFeatured && !p.isNewDrop && <span className="text-[10px] px-1.5 py-0.5 bg-bcs-surface2 text-bcs-muted rounded-full">Active</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
