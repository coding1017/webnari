'use client';

import { useState } from 'react';
import { getProducts, getConditionById } from '@/lib/data';
import { formatPrice } from '@/lib/utils';

export default function AdminInventoryPage() {
  const products = getProducts();
  const [search, setSearch] = useState('');
  const [filterCondition, setFilterCondition] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);

  // Flatten all inventory items with product info
  const allInventory = products.flatMap(p =>
    p.inventory.filter(i => i.isActive).map(i => ({
      ...i,
      product: p,
      condition: getConditionById(i.conditionId),
    }))
  );

  const filtered = allInventory.filter(item => {
    if (search && !item.product.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCondition && item.condition?.slug !== filterCondition) return false;
    if (showLowStock && item.quantity > 1) return false;
    return true;
  });

  const totalUnits = filtered.reduce((sum, i) => sum + i.quantity, 0);
  const totalValue = filtered.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div>
      <h1 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase mb-6">Inventory</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-bcs-surface rounded-xl border border-bcs-border p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-bcs-muted">SKUs</p>
          <p className="text-xl font-bold text-bcs-teal">{filtered.length}</p>
        </div>
        <div className="bg-bcs-surface rounded-xl border border-bcs-border p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-bcs-muted">Total Units</p>
          <p className="text-xl font-bold text-bcs-teal">{totalUnits}</p>
        </div>
        <div className="bg-bcs-surface rounded-xl border border-bcs-border p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-bcs-muted">Total Value</p>
          <p className="text-xl font-bold text-bcs-gold">{formatPrice(totalValue)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2.5 bg-bcs-surface border border-bcs-border rounded-lg text-sm text-bcs-white placeholder:text-bcs-muted focus:outline-none focus:border-bcs-teal"
        />
        <select
          value={filterCondition}
          onChange={e => setFilterCondition(e.target.value)}
          className="px-4 py-2.5 bg-bcs-surface border border-bcs-border rounded-lg text-sm text-bcs-white focus:outline-none focus:border-bcs-teal"
        >
          <option value="">All Conditions</option>
          <option value="new">New</option>
          <option value="like-new">Like New</option>
          <option value="excellent">Excellent</option>
          <option value="very-good">Very Good</option>
          <option value="good">Good</option>
        </select>
        <button
          onClick={() => setShowLowStock(!showLowStock)}
          className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${showLowStock ? 'bg-bcs-red/10 border-bcs-red text-bcs-red' : 'bg-bcs-surface border-bcs-border text-bcs-text hover:border-bcs-border2'}`}
        >
          Low Stock
        </button>
      </div>

      {/* Table */}
      <div className="bg-bcs-surface rounded-xl border border-bcs-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-bcs-muted uppercase tracking-wider bg-bcs-surface2">
                <th className="p-3">Product</th>
                <th className="p-3">Size</th>
                <th className="p-3">Condition</th>
                <th className="p-3">Price</th>
                <th className="p-3">Qty</th>
                <th className="p-3">Value</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id} className="border-t border-bcs-border/50 hover:bg-bcs-surface2/30 transition-colors">
                  <td className="p-3">
                    <p className="font-medium truncate max-w-[250px]">{item.product.name}</p>
                    <p className="text-xs text-bcs-muted">{item.product.brand.name}</p>
                  </td>
                  <td className="p-3 font-medium">{item.size}</td>
                  <td className="p-3">
                    {item.condition && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: item.condition.color + '22', color: item.condition.color }}>
                        {item.condition.name}
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-medium">{formatPrice(item.price)}</td>
                  <td className="p-3">
                    <span className={item.quantity <= 1 ? 'text-bcs-red font-bold' : ''}>
                      {item.quantity}
                    </span>
                  </td>
                  <td className="p-3 text-bcs-text">{formatPrice(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
