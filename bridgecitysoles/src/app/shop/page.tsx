'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { filterProducts, getAllSizesInUse } from '@/lib/data';
import { brands } from '@/data/brands';
import { categories } from '@/data/categories';
import { conditions } from '@/data/conditions';
import { ProductCard } from '@/components/product/ProductCard';
import { cn } from '@/lib/utils';
import type { SortOption } from '@/types/product';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name-az', label: 'Name: A–Z' },
  { value: 'name-za', label: 'Name: Z–A' },
];

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-20 text-center text-bcs-muted">Loading...</div>}>
      <ShopContent />
    </Suspense>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const initialBrand = searchParams.get('brand');
  const initialCategory = searchParams.get('category');
  const initialSort = (searchParams.get('sort') as SortOption) || 'newest';

  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialBrand ? [initialBrand] : []);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>(initialSort);
  const [search, setSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const allSizes = useMemo(() => getAllSizesInUse(), []);

  const products = useMemo(() => filterProducts({
    brands: selectedBrands,
    categories: selectedCategories,
    sizes: selectedSizes,
    conditions: selectedConditions,
    sort,
    search: search || undefined,
  }), [selectedBrands, selectedCategories, selectedSizes, selectedConditions, sort, search]);

  const toggleFilter = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const clearAll = () => {
    setSelectedBrands([]);
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedConditions([]);
    setSearch('');
    setSort('newest');
  };

  const hasFilters = selectedBrands.length > 0 || selectedCategories.length > 0 || selectedSizes.length > 0 || selectedConditions.length > 0 || search;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="font-[family-name:var(--font-barlow-condensed)] text-3xl sm:text-4xl font-black uppercase tracking-tight">
            Shop <span className="text-bcs-teal">All</span>
          </h1>
          <p className="text-sm text-bcs-muted mt-1">{products.length} products</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="lg:hidden flex items-center gap-2 px-3 py-2 bg-bcs-surface border border-bcs-border rounded-lg text-sm hover:border-bcs-border2 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
            </svg>
            Filters
          </button>
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortOption)}
            className="px-3 py-2 bg-bcs-surface border border-bcs-border rounded-lg text-sm text-bcs-white focus:outline-none focus:border-bcs-teal"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <aside className={cn(
          'w-64 flex-shrink-0 space-y-6',
          'max-lg:fixed max-lg:inset-0 max-lg:z-40 max-lg:bg-bcs-black/95 max-lg:p-6 max-lg:overflow-y-auto max-lg:w-full',
          filtersOpen ? 'max-lg:block' : 'max-lg:hidden',
          'lg:block'
        )}>
          {/* Mobile close */}
          <div className="lg:hidden flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Filters</h2>
            <button onClick={() => setFiltersOpen(false)} className="p-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-bcs-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search sneakers..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-bcs-surface border border-bcs-border rounded-lg text-sm text-bcs-white placeholder:text-bcs-muted focus:outline-none focus:border-bcs-teal"
              />
            </div>
          </div>

          {/* Brands */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-bcs-muted mb-3">Brand</h3>
            <div className="space-y-2">
              {brands.map(brand => (
                <label key={brand.id} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand.slug)}
                    onChange={() => toggleFilter(selectedBrands, brand.slug, setSelectedBrands)}
                    className="filter-checkbox"
                  />
                  <span className="text-sm text-bcs-text group-hover:text-bcs-white transition-colors">{brand.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-bcs-muted mb-3">Category</h3>
            <div className="space-y-2">
              {categories.map(cat => (
                <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.slug)}
                    onChange={() => toggleFilter(selectedCategories, cat.slug, setSelectedCategories)}
                    className="filter-checkbox"
                  />
                  <span className="text-sm text-bcs-text group-hover:text-bcs-white transition-colors">{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Size */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-bcs-muted mb-3">Size</h3>
            <div className="flex flex-wrap gap-1.5">
              {allSizes.map(size => (
                <button
                  key={size}
                  onClick={() => toggleFilter(selectedSizes, size, setSelectedSizes)}
                  className={cn(
                    'px-2.5 py-1.5 rounded text-xs font-medium transition-all border',
                    selectedSizes.includes(size)
                      ? 'bg-bcs-teal text-bcs-black border-bcs-teal'
                      : 'bg-bcs-surface border-bcs-border text-bcs-text hover:border-bcs-border2'
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Condition */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-bcs-muted mb-3">Condition</h3>
            <div className="space-y-2">
              {conditions.map(cond => (
                <label key={cond.id} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedConditions.includes(cond.slug)}
                    onChange={() => toggleFilter(selectedConditions, cond.slug, setSelectedConditions)}
                    className="filter-checkbox"
                  />
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cond.color }} />
                    <span className="text-sm text-bcs-text group-hover:text-bcs-white transition-colors">{cond.name}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Clear */}
          {hasFilters && (
            <button
              onClick={clearAll}
              className="w-full py-2 text-sm text-bcs-muted hover:text-bcs-white transition-colors underline"
            >
              Clear all filters
            </button>
          )}

          {/* Mobile apply */}
          <button
            onClick={() => setFiltersOpen(false)}
            className="lg:hidden w-full py-3 bg-bcs-teal text-bcs-black font-bold rounded-lg"
          >
            Show {products.length} results
          </button>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-20">
              <svg className="mx-auto mb-4 w-16 h-16 text-bcs-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-bcs-muted mb-4">Try adjusting your filters</p>
              <button onClick={clearAll} className="text-bcs-teal hover:text-bcs-teal2 transition-colors underline">
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
