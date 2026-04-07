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
    // Auto-sync cart to server for abandoned cart recovery
    if (items.length) {
      this.saveCartForRecovery().catch(() => {});
    }
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
  //  ABANDONED CART TRACKING
  // ═════════════════════════════════════════════════════════

  /**
   * Save cart state for abandoned cart recovery.
   * Call this whenever the cart changes. Uses a session ID
   * stored in localStorage to track the cart.
   */
  async saveCartForRecovery(email = '') {
    const items = this.getCart();
    const sessionId = this._getSessionId();

    return this._fetch('/api/cart/save', {
      method: 'POST',
      body: JSON.stringify({
        sessionId,
        email,
        items: items.map(i => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity, name: i.name })),
        total: items.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0),
      }),
    });
  }

  /**
   * Auto-attach abandoned cart tracking to a checkout email input.
   * Saves the cart with the customer's email on blur + before unload.
   *
   * Usage: shop.attachCartRecovery('#checkout-email')
   *        shop.attachCartRecovery(document.getElementById('email'))
   *
   * @param {string|HTMLElement} emailInput - CSS selector or DOM element
   */
  attachCartRecovery(emailInput) {
    const el = typeof emailInput === 'string'
      ? document.querySelector(emailInput)
      : emailInput;
    if (!el) return;

    let lastEmail = '';

    const save = () => {
      const email = (el.value || '').trim();
      if (!email || email === lastEmail) return;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
      lastEmail = email;
      this.saveCartForRecovery(email).catch(() => {});
    };

    // Save when they tab/click out of the email field
    el.addEventListener('blur', save);

    // Save when they start typing in other fields (they've committed the email)
    el.form?.addEventListener('focusin', (e) => {
      if (e.target !== el) save();
    });

    // Last chance — save if they leave the page
    window.addEventListener('beforeunload', save);
  }

  _getSessionId() {
    let sid = localStorage.getItem(`${this.cartKey}_sid`);
    if (!sid) {
      sid = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
      localStorage.setItem(`${this.cartKey}_sid`, sid);
    }
    return sid;
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
        discountCode: options.discountCode || null,
        giftCardCode: options.giftCardCode || null,
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
  //  DISCOUNTS & GIFT CARDS
  // ═════════════════════════════════════════════════════════

  /**
   * Validate a discount code before checkout.
   * @param {string} code - Discount code
   * @param {number} subtotal - Cart subtotal in cents
   * @returns {Promise<{valid, code, type, value, discountAmount, label, id}>}
   */
  async validateDiscount(code, subtotal) {
    return this._fetch('/api/discount/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    });
  }

  /**
   * Check gift card balance.
   * @param {string} code - Gift card code
   * @returns {Promise<{balance, code}>}
   */
  async checkGiftCard(code) {
    return this._fetch(`/api/gift-cards/check?code=${encodeURIComponent(code)}`);
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

  /**
   * Get carrier-calculated shipping rates from EasyPost.
   * @param {string} toZip - destination zip code
   * @returns {Promise<{rates: Array<{carrier, service, rate, deliveryDays}>, shipmentId?}>}
   */
  async getShippingRates(toZip) {
    const items = this.getCart();
    if (!items.length) return { rates: [] };
    return this._fetch('/api/shipping/rates', {
      method: 'POST',
      body: JSON.stringify({
        toZip,
        items: items.map(i => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity, price: i.price })),
      }),
    });
  }

  /**
   * Calculate tax for the given subtotal.
   * Pass zip for municipal-level accuracy, or state as fallback.
   * @param {number} subtotal - in cents
   * @param {string} stateOrZip - 2-letter state code OR 5-digit zip
   */
  async calculateTax(subtotal, stateOrZip) {
    const isZip = /^\d{5}$/.test(stateOrZip);
    return this._fetch('/api/tax/calculate', {
      method: 'POST',
      body: JSON.stringify({
        subtotal,
        ...(isZip ? { zip: stateOrZip } : { state: stateOrZip }),
      }),
    });
  }

  /**
   * Calculate full order totals (subtotal + shipping + tax).
   * @param {number} subtotal - in cents
   * @param {string} stateOrZip - 2-letter state code OR 5-digit zip
   */
  async calculateTotals(subtotal, stateOrZip) {
    const [shipping, tax] = await Promise.all([
      this.calculateShipping(subtotal),
      this.calculateTax(subtotal, stateOrZip),
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


  // ═════════════════════════════════════════════════════════
  //  CUSTOMER AUTH
  // ═════════════════════════════════════════════════════════

  _getToken() {
    return localStorage.getItem(`${this.storeId}_auth_token`);
  }

  _setToken(token) {
    localStorage.setItem(`${this.storeId}_auth_token`, token);
  }

  _clearToken() {
    localStorage.removeItem(`${this.storeId}_auth_token`);
  }

  isLoggedIn() {
    return !!this._getToken();
  }

  async _authFetch(path, options = {}) {
    const token = this._getToken();
    if (!token) throw new Error('Not logged in');
    return this._fetch(path, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${token}` },
    });
  }

  /**
   * Register a new customer account.
   * @returns {{ token, customer: { id, email, name } }}
   */
  async register({ email, password, name, phone }) {
    const result = await this._fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, phone }),
    });
    if (result.token) this._setToken(result.token);
    return result;
  }

  /**
   * Log in with email and password.
   * @returns {{ token, customer: { id, email, name, phone } }}
   */
  async login(email, password) {
    const result = await this._fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (result.token) this._setToken(result.token);
    return result;
  }

  logout() {
    this._clearToken();
  }

  async forgotPassword(email) {
    return this._fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token, newPassword) {
    return this._fetch('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  // ═════════════════════════════════════════════════════════
  //  CUSTOMER ACCOUNT
  // ═════════════════════════════════════════════════════════

  async getProfile() {
    return this._authFetch('/api/account/profile');
  }

  async updateProfile(data) {
    return this._authFetch('/api/account/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getMyOrders() {
    return this._authFetch('/api/account/orders');
  }

  async getAddresses() {
    return this._authFetch('/api/account/addresses');
  }

  async addAddress(address) {
    return this._authFetch('/api/account/addresses', {
      method: 'POST',
      body: JSON.stringify(address),
    });
  }

  async deleteAddress(addressId) {
    return this._authFetch(`/api/account/addresses/${addressId}`, {
      method: 'DELETE',
    });
  }


  // ═════════════════════════════════════════════════════════
  //  SEO — Meta Tags, Structured Data, Auto-Apply
  // ═════════════════════════════════════════════════════════

  /**
   * Get meta tags for a page.
   * @param {'home'|'product'|'category'|'blog'|'page'} type - Page type
   * @param {string} [slug] - Product/category/blog/page slug (not needed for home)
   * @returns {Promise<{title, description, canonical, og, twitter}>}
   */
  async getMetaTags(type = 'home', slug = null) {
    const params = new URLSearchParams({ type });
    if (slug) params.set('slug', slug);
    return this._fetch(`/api/seo/meta?${params}`);
  }

  /**
   * Get JSON-LD structured data schemas for a page.
   * @param {'home'|'product'|'category'|'blog'|'faq'} type
   * @param {string} [slug]
   * @returns {Promise<Array>} Array of schema.org JSON-LD objects
   */
  async getStructuredData(type = 'home', slug = null) {
    const params = new URLSearchParams({ type });
    if (slug) params.set('slug', slug);
    return this._fetch(`/api/seo/structured-data?${params}`);
  }

  /**
   * Auto-apply meta tags and structured data to the current page.
   * Call this on page load — it sets <title>, meta tags, OG tags, and injects JSON-LD.
   * @param {'home'|'product'|'category'|'blog'|'page'|'faq'} type
   * @param {string} [slug]
   */
  async applySeo(type = 'home', slug = null) {
    try {
      const [meta, schemas] = await Promise.all([
        this.getMetaTags(type, slug),
        this.getStructuredData(type, slug),
      ]);

      // Set document title
      if (meta.title) document.title = meta.title;

      // Helper to set/create a meta tag
      const setMeta = (attr, key, value) => {
        if (!value) return;
        let el = document.querySelector(`meta[${attr}="${key}"]`);
        if (!el) {
          el = document.createElement('meta');
          el.setAttribute(attr, key);
          document.head.appendChild(el);
        }
        el.setAttribute('content', value);
      };

      // Standard meta
      setMeta('name', 'description', meta.description);

      // Canonical
      if (meta.canonical) {
        let link = document.querySelector('link[rel="canonical"]');
        if (!link) {
          link = document.createElement('link');
          link.setAttribute('rel', 'canonical');
          document.head.appendChild(link);
        }
        link.setAttribute('href', meta.canonical);
      }

      // Open Graph
      if (meta.og) {
        for (const [key, value] of Object.entries(meta.og)) {
          if (value) setMeta('property', `og:${key}`, value);
        }
      }

      // Twitter Cards
      if (meta.twitter) {
        for (const [key, value] of Object.entries(meta.twitter)) {
          if (value) setMeta('name', `twitter:${key}`, value);
        }
      }

      // Inject JSON-LD structured data
      if (schemas && schemas.length > 0) {
        // Remove any existing auto-injected LD+JSON
        document.querySelectorAll('script[data-seo="webnari"]').forEach(el => el.remove());
        for (const schema of schemas) {
          const script = document.createElement('script');
          script.type = 'application/ld+json';
          script.setAttribute('data-seo', 'webnari');
          script.textContent = JSON.stringify(schema);
          document.head.appendChild(script);
        }
      }

      return { meta, schemas };
    } catch (err) {
      console.warn('WebnariCommerce: SEO auto-apply failed:', err.message);
      return null;
    }
  }
}

// Export for both module and script tag usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WebnariCommerce;
}
if (typeof window !== 'undefined') {
  window.WebnariCommerce = WebnariCommerce;
}
