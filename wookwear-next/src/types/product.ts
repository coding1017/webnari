export interface Review {
  name: string;
  text: string;
  rating: number;
  date: string;
}

export interface Variant {
  id: string;
  name: string;
  color: string;
  imgs: string[];
  price: number;
  inStock: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: 'pouches' | 'bags' | 'mats' | 'buddy';
  price: number;
  badge: 'new' | 'sold' | 'oneofone' | 'collection' | null;
  inStock: boolean;
  img: string;
  imgs: string[];
  desc: string;
  rating: number;
  reviewCount: number;
  reviews: Review[];
  isCollection?: boolean;
  variants?: Variant[];
}

export interface CartItem {
  id: string;
  qty: number;
}

export type Category = 'pouches' | 'bags' | 'mats' | 'buddy';
export type Badge = 'new' | 'sold' | 'oneofone' | 'collection' | null;

export const CATEGORIES: Category[] = ['pouches', 'bags', 'mats', 'buddy'];

export const CATEGORY_LABELS: Record<Category, string> = {
  pouches: 'Pouches',
  bags: 'Bags',
  mats: 'Mats',
  buddy: 'Buddy Pouches',
};
