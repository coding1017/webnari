import { products } from '@/data/products';
import { brands } from '@/data/brands';
import { categories } from '@/data/categories';
import { conditions } from '@/data/conditions';
import type { Product, ProductWithDetails, ProductFilters, Brand, Category, Condition } from '@/types/product';

// ── Brands ──
export function getBrands(): Brand[] {
  return brands;
}

export function getBrandById(id: string): Brand | undefined {
  return brands.find(b => b.id === id);
}

export function getBrandBySlug(slug: string): Brand | undefined {
  return brands.find(b => b.slug === slug);
}

// ── Categories ──
export function getCategories(): Category[] {
  return categories;
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find(c => c.id === id);
}

// ── Conditions ──
export function getConditions(): Condition[] {
  return conditions;
}

export function getConditionById(id: string): Condition | undefined {
  return conditions.find(c => c.id === id);
}

// ── Products ──
function enrichProduct(p: Product): ProductWithDetails {
  return {
    ...p,
    brand: getBrandById(p.brandId)!,
    category: getCategoryById(p.categoryId)!,
  };
}

export function getProducts(): ProductWithDetails[] {
  return products.filter(p => p.isActive).map(enrichProduct);
}

export function getProductBySlug(slug: string): ProductWithDetails | undefined {
  const p = products.find(p => p.slug === slug && p.isActive);
  return p ? enrichProduct(p) : undefined;
}

export function getProductById(id: string): ProductWithDetails | undefined {
  const p = products.find(p => p.id === id);
  return p ? enrichProduct(p) : undefined;
}

export function getFeaturedProducts(): ProductWithDetails[] {
  return products.filter(p => p.isFeatured && p.isActive).map(enrichProduct);
}

export function getNewDrops(): ProductWithDetails[] {
  return products.filter(p => p.isNewDrop && p.isActive).map(enrichProduct);
}

export function getLowestPrice(product: Product): number {
  const active = product.inventory.filter(i => i.isActive && i.quantity > 0);
  if (active.length === 0) return 0;
  return Math.min(...active.map(i => i.price));
}

export function getAvailableSizes(product: Product): string[] {
  return [...new Set(
    product.inventory
      .filter(i => i.isActive && i.quantity > 0)
      .map(i => i.size)
  )].sort((a, b) => {
    const na = parseFloat(a);
    const nb = parseFloat(b);
    if (isNaN(na) || isNaN(nb)) return a.localeCompare(b);
    return na - nb;
  });
}

export function filterProducts(filters: Partial<ProductFilters>): ProductWithDetails[] {
  let result = getProducts();

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.name.toLowerCase().includes(q) ||
      p.colorway?.toLowerCase().includes(q) ||
      p.styleCode?.toLowerCase().includes(q)
    );
  }

  if (filters.brands && filters.brands.length > 0) {
    result = result.filter(p => filters.brands!.includes(p.brand.slug));
  }

  if (filters.categories && filters.categories.length > 0) {
    result = result.filter(p => filters.categories!.includes(p.category.slug));
  }

  if (filters.sizes && filters.sizes.length > 0) {
    result = result.filter(p =>
      p.inventory.some(i => i.isActive && i.quantity > 0 && filters.sizes!.includes(i.size))
    );
  }

  if (filters.conditions && filters.conditions.length > 0) {
    result = result.filter(p =>
      p.inventory.some(i => {
        const cond = getConditionById(i.conditionId);
        return i.isActive && i.quantity > 0 && cond && filters.conditions!.includes(cond.slug);
      })
    );
  }

  if (filters.priceMin !== undefined) {
    result = result.filter(p => getLowestPrice(p) >= filters.priceMin!);
  }

  if (filters.priceMax !== undefined) {
    result = result.filter(p => getLowestPrice(p) <= filters.priceMax!);
  }

  // Sort
  switch (filters.sort) {
    case 'price-low':
      result.sort((a, b) => getLowestPrice(a) - getLowestPrice(b));
      break;
    case 'price-high':
      result.sort((a, b) => getLowestPrice(b) - getLowestPrice(a));
      break;
    case 'name-az':
      result.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-za':
      result.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'newest':
    default:
      // Featured first, then by release date
      result.sort((a, b) => {
        if (a.isNewDrop !== b.isNewDrop) return b.isNewDrop ? 1 : -1;
        const da = a.releaseDate || '2000-01-01';
        const db = b.releaseDate || '2000-01-01';
        return db.localeCompare(da);
      });
      break;
  }

  return result;
}

export function getAllSizesInUse(): string[] {
  const sizes = new Set<string>();
  products.forEach(p => {
    p.inventory.forEach(i => {
      if (i.isActive && i.quantity > 0) sizes.add(i.size);
    });
  });
  return [...sizes].sort((a, b) => {
    const na = parseFloat(a);
    const nb = parseFloat(b);
    if (isNaN(na) || isNaN(nb)) return a.localeCompare(b);
    return na - nb;
  });
}
