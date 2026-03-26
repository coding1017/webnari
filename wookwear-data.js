/**
 * Wook Wear — Shared Data Layer
 * Imported by all Wook Wear pages via <script src="wookwear-data.js">
 * Provides: product catalog, cart, export/import, cross-tab sync
 * Only global: window.WookWearData
 */
(function() {
  'use strict';

  // Constants
  var STORAGE_KEY_PRODUCTS = 'ww_products';
  var STORAGE_KEY_CART = 'ww_cart';
  var CATEGORIES = ['pouches', 'bags', 'mats', 'buddy'];
  var BADGES = [null, 'new', 'sold', 'oneofone', 'collection'];

  // Canonical product catalog
  var DEFAULT_PRODUCTS = [
    { id: 'pouch-checker-pink', name: 'Pink Checker Pouch Set', category: 'pouches', price: 45, badge: 'new', inStock: true,
      img: 'images/wookwear/pink-checker-1.jpg',
      imgs: ['images/wookwear/pink-checker-1.jpg', 'images/wookwear/pink-checker-2.jpg', 'images/wookwear/pink-checker-3.jpg'],
      desc: 'Warped pink and white checkerboard with hot pink binding and rounded edges. Includes matching display mat and snap-closure wallet. Hand-cut, hand-sewn, one of a kind.' },

    { id: 'bag-crossbody-denim', name: 'Sashiko Denim Crossbody', category: 'bags', price: 85, badge: 'oneofone', inStock: true,
      img: 'images/wookwear/denim-crossbody-1.jpg',
      imgs: ['images/wookwear/denim-crossbody-1.jpg', 'images/wookwear/denim-crossbody-2.jpg'],
      desc: 'Cut & sew color-block crossbody with hand-stitched sashiko denim patchwork front panel. Waxed canvas body, adjustable strap, zippered main compartment. Built to last for years.' },

    { id: 'mat-psychedelic-swirl', name: 'Psychedelic Display Mats', category: 'mats', price: 45, badge: 'collection', inStock: true,
      img: 'images/wookwear/display-mats-1.jpg',
      imgs: ['images/wookwear/display-mats-1.jpg', 'images/wookwear/display-mats-2.jpg'],
      desc: 'Square display mats in vivid psychedelic prints -- donut circles, marbled swirls, geometric color blocks, and abstract waves. Navy and purple felt borders with woven label. Perfect for showcasing your prized possessions.',
      isCollection: true,
      variants: [
        { id: 'mat-A-donut-circles', name: 'A - Donut Circles', color: '#E63946', imgs: ['images/wookwear/display-mat-A.jpg'], price: 45, inStock: true },
        { id: 'mat-B-marbled-swirl', name: 'B - Marbled Swirl', color: '#7C3AED', imgs: ['images/wookwear/display-mat-B.jpg'], price: 45, inStock: true },
        { id: 'mat-C-color-block', name: 'C - Color Block', color: '#3B82F6', imgs: ['images/wookwear/display-mat-C.jpg'], price: 45, inStock: true },
        { id: 'mat-D-abstract-wave', name: 'D - Abstract Wave', color: '#F97316', imgs: ['images/wookwear/display-mat-D.jpg'], price: 45, inStock: true }
      ]
    },

    { id: 'mat-buddy-blobs', name: 'Buddy Display Mats', category: 'mats', price: 42, badge: 'collection', inStock: true,
      img: 'images/wookwear/buddy-mats-1.jpg',
      imgs: ['images/wookwear/buddy-mats-1.jpg'],
      desc: 'Organic blob-shaped display mats in fun psychedelic fabrics with contrast-color felt binding. Each one is a unique shape with its own personality. Laid flat for display or hang on the wall.',
      isCollection: true,
      variants: [
        { id: 'buddy-mat-A-blue-psych', name: 'A - Blue Psychedelic', color: '#3B82F6', imgs: ['images/wookwear/buddy-mat-A.jpg'], price: 42, inStock: true },
        { id: 'buddy-mat-B-floral', name: 'B - Floral Burst', color: '#22C55E', imgs: ['images/wookwear/buddy-mat-B.jpg'], price: 42, inStock: true },
        { id: 'buddy-mat-C-rainbow', name: 'C - Rainbow Flowers', color: '#FACC15', imgs: ['images/wookwear/buddy-mat-C.jpg'], price: 42, inStock: true },
        { id: 'buddy-mat-D-swirl', name: 'D - Pink Swirl', color: '#EC4899', imgs: ['images/wookwear/buddy-mat-D.jpg'], price: 42, inStock: true },
        { id: 'buddy-mat-E-paisley', name: 'E - Paisley Mix', color: '#A855F7', imgs: ['images/wookwear/buddy-mat-E.jpg'], price: 42, inStock: true },
        { id: 'buddy-mat-F-green-checker', name: 'F - Green Checker', color: '#0D9488', imgs: ['images/wookwear/buddy-mat-F.jpg'], price: 42, inStock: true }
      ]
    },

    { id: 'bag-backpack-gray', name: 'Tie-Dye Canvas Backpack', category: 'bags', price: 150, badge: 'sold', inStock: false,
      img: 'images/wookwear/backpack-1.jpg',
      imgs: ['images/wookwear/backpack-1.jpg', 'images/wookwear/backpack-2.jpg', 'images/wookwear/backpack-3.jpg'],
      desc: 'Collab with @jhudson_tiedye. Gray waxed canvas backpack with removable tie-dye pouch, matching zippered insulated pocket, checkerboard strap, and woven rainbow trim. Hundreds of hours of love in every stitch.' },

    { id: 'bag-collab-capsule', name: 'Trevymetal x Wook Wear Capsule', category: 'bags', price: 75, badge: 'oneofone', inStock: true,
      img: 'images/wookwear/collab-capsule-1.jpg',
      imgs: ['images/wookwear/collab-capsule-1.jpg'],
      desc: '1/1 bag capsule with @trevymetal. Trevy t-shirts and screen prints from back pockets, cut, collaged & sewn into five functional pieces. Crossbody sling, fanny pack, wallet, and more.' },

    { id: 'collection-pouches-spring', name: 'Spring Prized Possession Drop', category: 'pouches', price: 38, badge: 'collection', inStock: true,
      img: 'images/wookwear/pouches-circle-1.jpg',
      imgs: ['images/wookwear/pouches-circle-1.jpg'],
      desc: 'Happy #wookwearwednesday! Prized possession pouches made with some of my favorite fabrics. All bright and beautiful. Stickers included with each pouch.',
      isCollection: true,
      variants: [
        { id: 'pouch-A-teal-checker', name: 'Teal Checker', color: '#0D9488', imgs: ['images/wookwear/pouch-A-1.jpg', 'images/wookwear/pouch-A-2.jpg'], price: 38, inStock: true },
        { id: 'pouch-B-maroon-checker', name: 'Maroon Checker', color: '#9F1239', imgs: ['images/wookwear/pouch-B-1.jpg', 'images/wookwear/pouch-B-2.jpg'], price: 38, inStock: false },
        { id: 'pouch-C-coral-hex', name: 'Coral Honeycomb', color: '#F97316', imgs: ['images/wookwear/pouch-C-1.jpg', 'images/wookwear/pouch-C-2.jpg'], price: 38, inStock: true },
        { id: 'pouch-D-purple-swirl', name: 'Purple Kaleidoscope', color: '#7C3AED', imgs: ['images/wookwear/pouch-D-1.jpg', 'images/wookwear/pouch-D-2.jpg'], price: 38, inStock: false },
        { id: 'pouch-E-green-checker', name: 'Green Checker', color: '#22C55E', imgs: ['images/wookwear/pouch-E-1.jpg', 'images/wookwear/pouch-E-2.jpg'], price: 38, inStock: true },
        { id: 'pouch-F-pink-swirl', name: 'Pink Marble', color: '#EC4899', imgs: ['images/wookwear/pouch-F-1.jpg', 'images/wookwear/pouch-F-2.jpg'], price: 38, inStock: false },
        { id: 'pouch-G-green-abstract', name: 'Green Abstract', color: '#16A34A', imgs: ['images/wookwear/pouch-G-1.jpg', 'images/wookwear/pouch-G-2.jpg'], price: 40, inStock: true }
      ]
    },

    { id: 'buddy-orange-fuzzy', name: 'Orange Sherpa Buddy Pouch', category: 'buddy', price: 55, badge: null, inStock: true,
      img: 'images/wookwear/orange-buddy.jpg',
      imgs: ['images/wookwear/orange-buddy.jpg'],
      desc: 'Say hello to your new little friend! Fuzzy orange sherpa front with psychedelic patchwork back panel. Button-snap eyes, periwinkle felt trim, and that signature Wook Wear personality.' }
  ];

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }

  // ---------------------------------------------------------------------------
  // Product functions
  // ---------------------------------------------------------------------------

  function getProducts() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (stored) {
        var parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch(e) {}
    return deepClone(DEFAULT_PRODUCTS);
  }

  function saveProducts(products) {
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    } catch(e) {
      if (e.name === 'QuotaExceededError') {
        throw new Error('Storage full! Try removing some product images or old products.');
      }
      throw e;
    }
  }

  function getProductById(id) {
    var products = getProducts();
    for (var i = 0; i < products.length; i++) {
      if (products[i].id === id) return products[i];
      // Also search variants
      if (products[i].variants) {
        for (var v = 0; v < products[i].variants.length; v++) {
          if (products[i].variants[v].id === id) return products[i].variants[v];
        }
      }
    }
    return null;
  }

  function generateId(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
  }

  // ---------------------------------------------------------------------------
  // Cart functions
  // ---------------------------------------------------------------------------

  function getCart() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY_CART)) || []; }
    catch(e) { return []; }
  }

  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(cart));
  }

  function addToCart(id) {
    var cart = getCart();
    var found = false;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id === id) { cart[i].qty++; found = true; break; }
    }
    if (!found) cart.push({ id: id, qty: 1 });
    saveCart(cart);
    return getProductById(id);
  }

  function removeFromCart(id) {
    saveCart(getCart().filter(function(item) { return item.id !== id; }));
  }

  function updateQty(id, delta) {
    var cart = getCart();
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id === id) {
        cart[i].qty = Math.max(1, cart[i].qty + delta);
        break;
      }
    }
    saveCart(cart);
  }

  function getCartCount() {
    var cart = getCart(), count = 0;
    for (var i = 0; i < cart.length; i++) count += cart[i].qty;
    return count;
  }

  function getCartTotal() {
    var cart = getCart(), products = getProducts(), total = 0;
    for (var i = 0; i < cart.length; i++) {
      for (var j = 0; j < products.length; j++) {
        if (products[j].id === cart[i].id) { total += products[j].price * cart[i].qty; break; }
        // Check variants too
        if (products[j].variants) {
          for (var v = 0; v < products[j].variants.length; v++) {
            if (products[j].variants[v].id === cart[i].id) {
              total += products[j].variants[v].price * cart[i].qty;
            }
          }
        }
      }
    }
    return total;
  }

  // ---------------------------------------------------------------------------
  // Export / Import
  // ---------------------------------------------------------------------------

  function exportJSON() {
    return JSON.stringify(getProducts(), null, 2);
  }

  function importJSON(jsonStr) {
    var parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) throw new Error('Expected an array of products');
    for (var i = 0; i < parsed.length; i++) {
      if (!parsed[i].id || !parsed[i].name) throw new Error('Product at index ' + i + ' missing id or name');
    }
    saveProducts(parsed);
    return parsed.length;
  }

  function resetToDefaults() {
    localStorage.removeItem(STORAGE_KEY_PRODUCTS);
  }

  function getStorageSize() {
    var products = localStorage.getItem(STORAGE_KEY_PRODUCTS) || '';
    var cart = localStorage.getItem(STORAGE_KEY_CART) || '';
    return { products: products.length, cart: cart.length, total: products.length + cart.length };
  }

  // ---------------------------------------------------------------------------
  // Image resize utility (for admin uploads)
  // ---------------------------------------------------------------------------

  function resizeImage(dataUri, maxWidth, callback) {
    var img = new Image();
    img.onload = function() {
      if (img.width <= maxWidth) { callback(dataUri); return; }
      var canvas = document.createElement('canvas');
      var ratio = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = Math.round(img.height * ratio);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      callback(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.src = dataUri;
  }

  // ---------------------------------------------------------------------------
  // Cross-tab sync
  // ---------------------------------------------------------------------------

  window.addEventListener('storage', function(e) {
    if (e.key === STORAGE_KEY_CART || e.key === STORAGE_KEY_PRODUCTS) {
      if (typeof window.WookWearData.onSync === 'function') {
        window.WookWearData.onSync(e.key, e.newValue);
      }
    }
  });

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  window.WookWearData = {
    DEFAULT_PRODUCTS: DEFAULT_PRODUCTS,
    CATEGORIES: CATEGORIES,
    BADGES: BADGES,
    getProducts: getProducts,
    saveProducts: saveProducts,
    getProductById: getProductById,
    generateId: generateId,
    getCart: getCart,
    saveCart: saveCart,
    addToCart: addToCart,
    removeFromCart: removeFromCart,
    updateQty: updateQty,
    getCartCount: getCartCount,
    getCartTotal: getCartTotal,
    exportJSON: exportJSON,
    importJSON: importJSON,
    resetToDefaults: resetToDefaults,
    getStorageSize: getStorageSize,
    resizeImage: resizeImage,
    onSync: null
  };
})();
