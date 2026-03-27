import { Product } from '@/types/product';

export const products: Product[] = [
  {
    id: 'pouch-checker-pink', name: 'Pink Checker Pouch Set', category: 'pouches', price: 45, badge: 'new', inStock: true,
    img: '/images/pink-checker-1.jpg',
    imgs: ['/images/pink-checker-1.jpg', '/images/pink-checker-2.jpg', '/images/pink-checker-3.jpg'],
    desc: 'Warped pink and white checkerboard with hot pink binding and rounded edges. Includes matching display mat and snap-closure wallet. Hand-cut, hand-sewn, one of a kind.',
    rating: 4.9, reviewCount: 8,
    reviews: [
      { name: 'brookimats', text: 'Those rounded edges go so hard. Beautifully done!', rating: 5, date: '2025-09-20' },
      { name: 'dripping_wet_paint', text: 'You know I need that. Absolute heater set.', rating: 5, date: '2025-08-16' },
      { name: 'pups.and.flowers', text: 'Heater set! The pink is perfect.', rating: 5, date: '2025-08-16' },
    ],
  },
  {
    id: 'bag-crossbody-denim', name: 'Sashiko Denim Crossbody', category: 'bags', price: 85, badge: 'oneofone', inStock: true,
    img: '/images/denim-crossbody-1.jpg',
    imgs: ['/images/denim-crossbody-1.jpg', '/images/denim-crossbody-2.jpg'],
    desc: 'Cut & sew color-block crossbody with hand-stitched sashiko denim patchwork front panel. Waxed canvas body, adjustable strap, zippered main compartment. Built to last for years.',
    rating: 4.8, reviewCount: 6,
    reviews: [
      { name: 'hesh4hash', text: 'Best bags, been running mine for years!!! Absolute fire quality.', rating: 5, date: '2025-12-10' },
      { name: 'ebakerboy', text: 'So clean! Great craftsmanship on the sashiko.', rating: 5, date: '2025-12-05' },
      { name: 'norcal_heady', text: 'Great job on this one. The denim detail is next level.', rating: 4, date: '2025-12-05' },
    ],
  },
  {
    id: 'mat-psychedelic-swirl', name: 'Psychedelic Display Mats', category: 'mats', price: 45, badge: 'collection', inStock: true,
    img: '/images/display-mats-1.jpg',
    imgs: ['/images/display-mats-1.jpg', '/images/display-mats-2.jpg'],
    desc: 'Square display mats in vivid psychedelic prints -- donut circles, marbled swirls, geometric color blocks, and abstract waves. Navy and purple felt borders with woven label. Perfect for showcasing your prized possessions.',
    rating: 5.0, reviewCount: 11,
    reviews: [
      { name: 'ebakerboy', text: 'Dibs B! These are absolutely insane.', rating: 5, date: '2026-03-23' },
      { name: 'spiritanimalglass', text: 'Makes me want donuts. This cut is getting to me.', rating: 5, date: '2026-03-23' },
      { name: 'carranzajr.mike', text: 'I wanted C! The color block one is fire.', rating: 5, date: '2026-03-23' },
    ],
    isCollection: true,
    variants: [
      { id: 'mat-A-donut-circles', name: 'A - Donut Circles', color: '#E63946', imgs: ['/images/display-mat-A.jpg'], price: 45, inStock: true },
      { id: 'mat-B-marbled-swirl', name: 'B - Marbled Swirl', color: '#7C3AED', imgs: ['/images/display-mat-B.jpg'], price: 45, inStock: true },
      { id: 'mat-C-color-block', name: 'C - Color Block', color: '#3B82F6', imgs: ['/images/display-mat-C.jpg'], price: 45, inStock: true },
      { id: 'mat-D-abstract-wave', name: 'D - Abstract Wave', color: '#F97316', imgs: ['/images/display-mat-D.jpg'], price: 45, inStock: true },
    ],
  },
  {
    id: 'mat-buddy-blobs', name: 'Buddy Display Mats', category: 'mats', price: 42, badge: 'collection', inStock: true,
    img: '/images/buddy-mats-1.jpg',
    imgs: ['/images/buddy-mats-1.jpg'],
    desc: 'Organic blob-shaped display mats in fun psychedelic fabrics with contrast-color felt binding. Each one is a unique shape with its own personality. Laid flat for display or hang on the wall.',
    rating: 4.9, reviewCount: 14,
    reviews: [
      { name: 'dripping_wet_paint', text: 'A is me! Love the shapes and colors.', rating: 5, date: '2025-08-13' },
      { name: 'nocountryformids', text: 'Crushing these new designs. So unique.', rating: 5, date: '2025-08-13' },
      { name: 'momof4cats_', text: 'I love the shapes! Each one has its own personality.', rating: 5, date: '2025-08-13' },
    ],
    isCollection: true,
    variants: [
      { id: 'buddy-mat-A-blue-psych', name: 'A - Blue Psychedelic', color: '#3B82F6', imgs: ['/images/buddy-mat-A.jpg'], price: 42, inStock: true },
      { id: 'buddy-mat-B-floral', name: 'B - Floral Burst', color: '#22C55E', imgs: ['/images/buddy-mat-B.jpg'], price: 42, inStock: true },
      { id: 'buddy-mat-C-rainbow', name: 'C - Rainbow Flowers', color: '#FACC15', imgs: ['/images/buddy-mat-C.jpg'], price: 42, inStock: true },
      { id: 'buddy-mat-D-swirl', name: 'D - Pink Swirl', color: '#EC4899', imgs: ['/images/buddy-mat-D.jpg'], price: 42, inStock: true },
      { id: 'buddy-mat-E-paisley', name: 'E - Paisley Mix', color: '#A855F7', imgs: ['/images/buddy-mat-E.jpg'], price: 42, inStock: true },
      { id: 'buddy-mat-F-green-checker', name: 'F - Green Checker', color: '#0D9488', imgs: ['/images/buddy-mat-F.jpg'], price: 42, inStock: true },
    ],
  },
  {
    id: 'bag-backpack-gray', name: 'Tie-Dye Canvas Backpack', category: 'bags', price: 150, badge: 'sold', inStock: false,
    img: '/images/backpack-1.jpg',
    imgs: ['/images/backpack-1.jpg', '/images/backpack-2.jpg', '/images/backpack-3.jpg'],
    desc: 'Collab with @jhudson_tiedye. Gray waxed canvas backpack with removable tie-dye pouch, matching zippered insulated pocket, checkerboard strap, and woven rainbow trim. Hundreds of hours of love in every stitch.',
    rating: 5.0, reviewCount: 67,
    reviews: [
      { name: 'allhailkirkngail', text: 'Fabulous bag! The tie-dye pockets are incredible.', rating: 5, date: '2024-11-27' },
      { name: 'shop_freespirited', text: 'Sick bag!! The checkerboard strap detail is everything.', rating: 5, date: '2024-11-27' },
    ],
  },
  {
    id: 'bag-collab-capsule', name: 'Trevymetal x Wook Wear Capsule', category: 'bags', price: 75, badge: 'oneofone', inStock: true,
    img: '/images/collab-capsule-1.jpg',
    imgs: ['/images/collab-capsule-1.jpg'],
    desc: '1/1 bag capsule with @trevymetal. Trevy t-shirts and screen prints from back pockets, cut, collaged & sewn into five functional pieces. Crossbody sling, fanny pack, wallet, and more.',
    rating: 4.9, reviewCount: 22,
    reviews: [
      { name: '420blazeitbro_', text: 'Clean. The screen print collage work is next level.', rating: 5, date: '2025-10-27' },
      { name: 'ebakerboy', text: 'Super fun pattern! Great work on this collab.', rating: 5, date: '2025-10-27' },
    ],
  },
  {
    id: 'collection-pouches-spring', name: 'Spring Prized Possession Drop', category: 'pouches', price: 38, badge: 'collection', inStock: true,
    img: '/images/pouches-circle-1.jpg',
    imgs: ['/images/pouches-circle-1.jpg'],
    desc: 'Happy #wookwearwednesday! Prized possession pouches made with some of my favorite fabrics. All bright and beautiful. Stickers included with each pouch.',
    rating: 4.8, reviewCount: 6,
    reviews: [
      { name: 'ewokglass', text: 'Fire fire fire! Every color is a winner.', rating: 5, date: '2025-05-07' },
      { name: 'terpknock', text: 'Dibs C and D if not sold. Beautiful fabrics.', rating: 5, date: '2025-05-07' },
    ],
    isCollection: true,
    variants: [
      { id: 'pouch-A-teal-checker', name: 'Teal Checker', color: '#0D9488', imgs: ['/images/pouch-A-1.jpg', '/images/pouch-A-2.jpg'], price: 38, inStock: true },
      { id: 'pouch-B-maroon-checker', name: 'Maroon Checker', color: '#9F1239', imgs: ['/images/pouch-B-1.jpg', '/images/pouch-B-2.jpg'], price: 38, inStock: false },
      { id: 'pouch-C-coral-hex', name: 'Coral Honeycomb', color: '#F97316', imgs: ['/images/pouch-C-1.jpg', '/images/pouch-C-2.jpg'], price: 38, inStock: true },
      { id: 'pouch-D-purple-swirl', name: 'Purple Kaleidoscope', color: '#7C3AED', imgs: ['/images/pouch-D-1.jpg', '/images/pouch-D-2.jpg'], price: 38, inStock: false },
      { id: 'pouch-E-green-checker', name: 'Green Checker', color: '#22C55E', imgs: ['/images/pouch-E-1.jpg', '/images/pouch-E-2.jpg'], price: 38, inStock: true },
      { id: 'pouch-F-pink-swirl', name: 'Pink Marble', color: '#EC4899', imgs: ['/images/pouch-F-1.jpg', '/images/pouch-F-2.jpg'], price: 38, inStock: false },
      { id: 'pouch-G-green-abstract', name: 'Green Abstract', color: '#16A34A', imgs: ['/images/pouch-G-1.jpg', '/images/pouch-G-2.jpg'], price: 40, inStock: true },
    ],
  },
  {
    id: 'buddy-orange-fuzzy', name: 'Orange Sherpa Buddy Pouch', category: 'buddy', price: 55, badge: null, inStock: true,
    img: '/images/orange-buddy.jpg',
    imgs: ['/images/orange-buddy.jpg'],
    desc: 'Say hello to your new little friend! Fuzzy orange sherpa front with psychedelic patchwork back panel. Button-snap eyes, periwinkle felt trim, and that signature Wook Wear personality.',
    rating: 4.9, reviewCount: 5,
    reviews: [
      { name: 'nocountryformids', text: 'Say hello to my little friend! So cute and well made.', rating: 5, date: '2026-01-02' },
    ],
  },
];

export function getProductById(id: string): Product | null {
  for (const product of products) {
    if (product.id === id) return product;
    if (product.variants) {
      for (const variant of product.variants) {
        if (variant.id === id) return product;
      }
    }
  }
  return null;
}

export function getVariantById(id: string) {
  for (const product of products) {
    if (product.variants) {
      const variant = product.variants.find(v => v.id === id);
      if (variant) return { product, variant };
    }
  }
  return null;
}

export function getFeaturedProducts(count = 4): Product[] {
  return products.filter(p => p.inStock).slice(0, count);
}
