'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getProducts, getLowestPrice, getAvailableSizes } from '@/lib/data';
import { formatPrice, cn } from '@/lib/utils';

export default function AdminProductsPage() {
  const products = getProducts();
  const [search, setSearch] = useState('');
  const [filterBrand, setFilterBrand] = useState('');

  const filtered = products.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterBrand && p.brand.slug !== filterBrand) return false;
    return true;
  });

  const uniqueBrands = [...new Set(products.map(p => p.brand))].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase">Products</h1>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 bg-bcs-teal text-bcs-black font-bold text-sm uppercase rounded-lg hover:bg-bcs-teal2 transition-colors font-[family-name:var(--font-barlow-condensed)]"
        >
          + Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2.5 bg-bcs-surface border border-bcs-border rounded-lg text-sm text-bcs-white placeholder:text-bcs-muted focus:outline-none focus:border-bcs-teal"
        />
        <select
          value={filterBrand}
          onChange={e => setFilterBrand(e.target.value)}
          className="px-4 py-2.5 bg-bcs-surface border border-bcs-border rounded-lg text-sm text-bcs-white focus:outline-none focus:border-bcs-teal"
        >
          <option value="">All Brands</option>
          {uniqueBrands.map(b => (
            <option key={b.id} value={b.slug}>{b.name}</option>
          ))}
        </select>
      </div>

      <p className="text-sm text-bcs-muted mb-4">{filtered.length} products</p>

      {/* Product List */}
      <div className="space-y-3">
        {filtered.map(p => {
          const sizes = getAvailableSizes(p);
          const totalUnits = p.inventory.filter(i => i.isActive).reduce((s, i) => s + i.quantity, 0);

          return (
            <div key={p.id} className="bg-bcs-surface rounded-xl border border-bcs-border p-4 flex gap-4 items-center hover:border-bcs-border2 transition-colors">
              {/* Image */}
              <div className="w-16 h-16 rounded-lg bg-bcs-surface2 overflow-hidden flex-shrink-0">
                {p.images[0] && (
                  <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium truncate">{p.name}</p>
                  {p.isFeatured && <span className="text-[10px] px-1.5 py-0.5 bg-bcs-teal/20 text-bcs-teal rounded-full flex-shrink-0">Featured</span>}
                  {p.isNewDrop && <span className="text-[10px] px-1.5 py-0.5 bg-bcs-gold/20 text-bcs-gold rounded-full flex-shrink-0">New Drop</span>}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-bcs-muted">
                  <span>{p.brand.name}</span>
                  <span>{p.category.name}</span>
                  <span>{sizes.length} sizes</span>
                  <span>{totalUnits} units</span>
                  <span>From {formatPrice(getLowestPrice(p))}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0">
                <Link
                  href={`/product/${p.slug}`}
                  className="px-3 py-1.5 text-xs bg-bcs-surface2 rounded-lg hover:bg-bcs-border transition-colors"
                >
                  View
                </Link>
                <Link
                  href={`/admin/products/${p.id}`}
                  className="px-3 py-1.5 text-xs bg-bcs-teal/10 text-bcs-teal rounded-lg hover:bg-bcs-teal/20 transition-colors"
                >
                  Edit
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
