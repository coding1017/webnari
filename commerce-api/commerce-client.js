// ═══════════════════════════════════════════════════════════════
// Webnari Commerce Client — Drop-in frontend SDK
// Works with any static HTML or JS framework.
//
// Usage:
//   <script src="https://webnari.io/commerce-client.js"></script>
//   <script>
//     const shop = new WebnariCommerce('wookwear');
//     // ... use shop.checkout(), shop.getShipping(), etc.
//   </script>
// ═══════════════════════════════════════════════════════════════

class WebnariCommerce {
  constructor(storeId, options = {}) {
    this.storeId = storeId;
    this.apiBase = options.apiBase || 'https://commerce.webnari.io';
    this.cartKey = options.cartKey || `${storeId}_cart`;
    this.storeConfig = null;
  }

  // ── Internal fetch wrapper ──────────────────────────────
  async _fetch(path, options = {}) {
    const res = await fetch(`${this.apiBase}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Store-ID': this.storeId,
        ...(options.headers || {}),
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `API error: ${res.status}`);
    return data;
  }


  // ═════════════════════════════════════════════════════════
  //  STORE CONFIG
  // ═════════════════════════════════════════════════════════

  async getConfig() {
    if (!this.storeConfig) {
      this.storeConfig = await this._fetch('/api/store/config');
    }
    return this.storeConfig;
  }


  // ═════════════════════════════════════════════════════════
  //  CART (localStorage)
  // ═════════════════════════════════════════════════════════

  getCart() {
    try {
      return JSON.parse(localStorage.getItem(this.cartKey)) || [];
    } catch {
      return [];
    }
  }

  saveCart(items) {
    localStorage.setItem(this.cartKey, JSON.stringify(items));
    this._dispatchCartEvent(items);
  }

  addToCart(productId, variantId = null, quantity = 1) {
    const cart = this.getCart();
    const key = variantId ? `${productId}:${variantId}` : productId;
    const existing = cart.find(i => (i.variantId ? `${i.productId}:${i.variantId}` : i.productId) === key);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ productId, variantId, quantity });
    }

    this.saveCart(cart);
    return cart;
  }

  removeFromCart(productId, variantId = null) {
    let cart = this.getCart();
    cart = cart.filter(i => {
      if (variantId) return !(i.productId === productId && i.variantId === variantId);
      return i.productId !== productId;
    });
    this.saveCart(cart);
    return cart;
  }

  updateQuantity(productId, variantId = null, quantity) {
    const cart = this.getCart();
    const item = cart.find(i => {
      if (variantId) return i.productId === productId && i.variantId === variantId;
      return i.productId === productId;
    });
    if (item) {
      if (quantity <= 0) {
        return this.removeFromCart(productId, variantId);
      }
      item.quantity = quantity;
    }
    this.saveCart(cart);
    return cart;
  }

  clearCart() {
    localStorage.removeItem(this.cartKey);
    this._dispatchCartEvent([]);
  }

  getCartCount() {
    return this.getCart().reduce((sum, i) => sum + i.quantity, 0);
  }

  _dispatchCartEvent(items) {
    window.dispatchEvent(new CustomEvent('cart-updated', {
      detail: { items, count: items.reduce((s, i) => s + i.quantity, 0) },
    }));
  }


  // ═════════════════════════════════════════════════════════
  //  DISCOUNTS
  // ═════════════════════════════════════════════════════════

  /**
   * Validate a discount code and get the savings amount.
   * @param {string} code - The discount code
   * @param {number} subtotal - Cart subtotal in cents
   * @param {string} customerEmail - Customer's email (for per-customer limits)
   * @returns {{ valid, code?, type?, value?, amountOff?, description?, reason? }}
   */
  async validateDiscount(code, subtotal, customerEmail = '') {
    return this._fetch('/api/discount/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal, customerEmail }),
    });
  }


  // ═════════════════════════════════════════════════════════
  //  PRODUCTS (Storefront)
  // ═════════════════════════════════════════════════════════

  /**
   * Get all products for this store.
   * @param {Object} params - { category?, search?, sort?, in_stock?, limit? }
   */
  async getProducts(params = {}) {
    const qs = new URLSearchParams();
    if (params.category) qs.set('category', params.category);
    if (params.search) qs.set('search', params.search);
    if (params.sort) qs.set('sort', params.sort);
    if (params.in_stock) qs.set('in_stock', 'true');
    if (params.limit) qs.set('limit', params.limit.toString());
    const query = qs.toString();
    return this._fetch(`/api/products${query ? `?${query}` : ''}`);
  }

  /**
   * Get a single product by ID or slug.
   */
  async getProduct(idOrSlug) {
    return this._fetch(`/api/products/${idOrSlug}`);
  }

  /**
   * Get featured (in-stock) products.
   * @param {number} limit - Number of products to return
   */
  async getFeaturedProducts(limit = 8) {
    return this._fetch(`/api/products/featured?limit=${limit}`);
  }

  /**
   * Get categories for this store.
   */
  async getCategories() {
    return this._fetch('/api/categories');
  }


  // ═════════════════════════════════════════════════════════
  //  CHECKOUT
  // ═════════════════════════════════════════════════════════

  /**
   * Create a checkout session and redirect to payment.
   * @param {Object} customer - { email, name, phone? }
   * @param {string} shippingState - 2-letter state code (e.g., 'FL')
   * @param {Object} options - { provider?, successUrl?, cancelUrl? }
   */
  async checkout(customer, shippingState, options = {}) {
    const items = this.getCart();
    if (!items.length) throw new Error('Cart is empty');

    const data = await this._fetch('/api/checkout/create', {
      method: 'POST',
      body: JSON.stringify({
        items,
        customer,
        shippingState,
        provider: options.provider,
        successUrl: options.successUrl || `${window.location.origin}?checkout=success`,
        cancelUrl: options.cancelUrl || `${window.location.origin}?checkout=cancelled`,
      }),
    });

    // Redirect to payment page
    if (data.url) {
      window.location.href = data.url;
    }

    return data;
  }


  // ═════════════════════════════════════════════════════════
  //  SHIPPING & TAX
  // ═════════════════════════════════════════════════════════

  async calculateShipping(subtotal) {
    return this._fetch('/api/shipping/calculate', {
      method: 'POST',
      body: JSON.stringify({ subtotal }),
    });
  }

  async calculateTax(subtotal, state) {
    return this._fetch('/api/tax/calculate', {
      method: 'POST',
      body: JSON.stringify({ subtotal, state }),
    });
  }

  /**
   * Calculate full order totals (subtotal + shipping + tax).
   * @param {number} subtotal - in cents
   * @param {string} state - 2-letter state code
   */
  async calculateTotals(subtotal, state) {
    const [shipping, tax] = await Promise.all([
      this.calculateShipping(subtotal),
      this.calculateTax(subtotal, state),
    ]);

    return {
      subtotal,
      shippingCost: shipping.shippingCost,
      taxAmount: tax.taxAmount,
      taxRate: tax.rate,
      taxLabel: tax.label,
      total: subtotal + shipping.shippingCost + tax.taxAmount,
    };
  }


  // ═════════════════════════════════════════════════════════
  //  ORDERS
  // ═════════════════════════════════════════════════════════

  async getOrder(orderId, email) {
    const params = email ? `?email=${encodeURIComponent(email)}` : '';
    return this._fetch(`/api/orders/${orderId}${params}`);
  }

  async listOrders(email) {
    return this._fetch(`/api/orders?email=${encodeURIComponent(email)}`);
  }


  // ═════════════════════════════════════════════════════════
  //  INVENTORY
  // ═════════════════════════════════════════════════════════

  async getInventory(productId) {
    return this._fetch(`/api/inventory/${productId}`);
  }


  // ═════════════════════════════════════════════════════════
  //  CHECKOUT SUCCESS HANDLER
  // ═════════════════════════════════════════════════════════

  /**
   * Call this on your success page to clear the cart and show confirmation.
   * Returns true if this was a checkout redirect.
   */
  handleCheckoutReturn() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
      this.clearCart();
      return true;
    }
    if (params.get('checkout') === 'cancelled') {
      return false;
    }
    return null;
  }
}

// Export for both module and script tag usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WebnariCommerce;
}
if (typeof window !== 'undefined') {
  window.WebnariCommerce = WebnariCommerce;
}
