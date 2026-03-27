import { Condition } from '@/types/product';

export const conditions: Condition[] = [
  { id: 'cn1', name: 'New', slug: 'new', color: '#4A7C59', description: 'Brand new, deadstock. Never worn, with original box and tags.' },
  { id: 'cn2', name: 'Like New', slug: 'like-new', color: '#4A90D9', description: 'Tried on only. No visible signs of wear, with original box.' },
  { id: 'cn3', name: 'Excellent', slug: 'excellent', color: '#8B6CC6', description: 'Worn 1-3 times. Minimal signs of wear, original box included.' },
  { id: 'cn4', name: 'Very Good', slug: 'very-good', color: '#D4A040', description: 'Light wear. Minor creasing, clean soles, may or may not include box.' },
  { id: 'cn5', name: 'Good', slug: 'good', color: '#D4622A', description: 'Moderate wear. Visible creasing, some sole wear, cleaned and presentable.' },
];

export const SNEAKER_SIZES = [
  '4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5',
  '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13', '14',
];

export const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
