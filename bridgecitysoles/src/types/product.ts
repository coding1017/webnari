export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Condition {
  id: string;
  name: string;
  slug: string;
  color: string;
  description: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface InventoryItem {
  id: string;
  productId: string;
  conditionId: string;
  size: string;
  price: number;
  quantity: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  brandId: string;
  categoryId: string;
  name: string;
  slug: string;
  sku?: string;
  colorway?: string;
  retailPrice?: number;
  description?: string;
  styleCode?: string;
  releaseDate?: string;
  isFeatured: boolean;
  isNewDrop: boolean;
  isActive: boolean;
  images: ProductImage[];
  inventory: InventoryItem[];
}

export interface ProductWithDetails extends Product {
  brand: Brand;
  category: Category;
}

export type SortOption = 'newest' | 'price-low' | 'price-high' | 'name-az' | 'name-za';

export interface ProductFilters {
  brands: string[];
  categories: string[];
  sizes: string[];
  conditions: string[];
  priceMin?: number;
  priceMax?: number;
  sort: SortOption;
  search?: string;
}
