const API_BASE = process.env.NEXT_PUBLIC_COMMERCE_API_URL || 'https://webnari-commerce.webnari.workers.dev';

export class CommerceClient {
  private storeId: string;
  private adminKey: string;

  constructor(storeId: string, adminKey?: string) {
    this.storeId = storeId;
    this.adminKey = adminKey || process.env.COMMERCE_ADMIN_KEY || '';
  }

  private async fetch(path: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Store-ID': this.storeId,
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.adminKey) {
      headers['Authorization'] = `Bearer ${this.adminKey}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      cache: 'no-store',
    });

    if (res.headers.get('content-type')?.includes('text/csv')) {
      return res.text();
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `API error: ${res.status}`);
    return data;
  }

  // ── Stats ─────────────────────────────────────────────
  async getStats() {
    return this.fetch('/api/admin/stats');
  }

  // ── Products ──────────────────────────────────────────
  async getProducts(params?: { search?: string; category?: string }) {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.category) qs.set('category', params.category);
    const query = qs.toString();
    return this.fetch(`/api/admin/products${query ? `?${query}` : ''}`);
  }

  async getProduct(id: string) {
    return this.fetch(`/api/admin/products/${id}`);
  }

  async createProduct(data: Record<string, unknown>) {
    return this.fetch('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: Record<string, unknown>) {
    return this.fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string) {
    return this.fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
  }

  // ── Variants ──────────────────────────────────────────
  async createVariant(data: Record<string, unknown>) {
    return this.fetch('/api/admin/variants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateVariant(id: string, data: Record<string, unknown>) {
    return this.fetch(`/api/admin/variants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteVariant(id: string) {
    return this.fetch(`/api/admin/variants/${id}`, { method: 'DELETE' });
  }

  // ── Orders ────────────────────────────────────────────
  async getOrders(params?: { status?: string; limit?: number }) {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.limit) qs.set('limit', params.limit.toString());
    const query = qs.toString();
    return this.fetch(`/api/orders${query ? `?${query}` : ''}`);
  }

  async getOrder(id: string) {
    return this.fetch(`/api/orders/${id}`);
  }

  async updateOrder(id: string, data: Record<string, unknown>) {
    return this.fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // ── Inventory ─────────────────────────────────────────
  async getInventory(productId: string) {
    return this.fetch(`/api/inventory/${productId}`);
  }

  async updateInventory(productId: string, data: Record<string, unknown>) {
    return this.fetch(`/api/inventory/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getLowStock() {
    return this.fetch('/api/inventory/low-stock');
  }

  // ── Reviews ───────────────────────────────────────────
  async getReviews() {
    return this.fetch('/api/admin/reviews');
  }

  async updateReview(id: string, data: { approved: boolean }) {
    return this.fetch(`/api/admin/reviews/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteReview(id: string) {
    return this.fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
  }

  // ── Subscribers ───────────────────────────────────────
  async getSubscribers() {
    return this.fetch('/api/admin/subscribers');
  }

  async exportSubscribers() {
    return this.fetch('/api/admin/subscribers/export');
  }

  // ── Store Config ──────────────────────────────────────
  async getStoreConfig() {
    return this.fetch('/api/store/config');
  }

  async updateStore(data: Record<string, unknown>) {
    return this.fetch('/api/admin/store', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // ── Tax Rates ─────────────────────────────────────────
  async upsertTaxRate(data: { state: string; rate: number; label?: string }) {
    return this.fetch('/api/admin/tax-rates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteTaxRate(id: string) {
    return this.fetch(`/api/admin/tax-rates/${id}`, { method: 'DELETE' });
  }

  // ── Categories ─────────────────────────────────────────
  async getCategories() {
    return this.fetch('/api/admin/categories');
  }

  async createCategory(data: { name: string; slug?: string; sort_order?: number }) {
    return this.fetch('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: Record<string, unknown>) {
    return this.fetch(`/api/admin/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string) {
    return this.fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
  }

  // ── Discounts ─────────────────────────────────────────
  async getDiscounts() {
    return this.fetch('/api/admin/discounts');
  }

  async createDiscount(data: Record<string, unknown>) {
    return this.fetch('/api/admin/discounts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDiscount(id: string, data: Record<string, unknown>) {
    return this.fetch(`/api/admin/discounts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteDiscount(id: string) {
    return this.fetch(`/api/admin/discounts/${id}`, { method: 'DELETE' });
  }

  // ── Analytics ─────────────────────────────────────────
  async getAnalytics(params?: { range?: string }) {
    const qs = new URLSearchParams();
    if (params?.range) qs.set('range', params.range);
    const query = qs.toString();
    return this.fetch(`/api/admin/analytics${query ? `?${query}` : ''}`);
  }

  // ── Customers ─────────────────────────────────────────
  async getCustomers() {
    return this.fetch('/api/admin/customers');
  }

  // ── CSV Import/Export ─────────────────────────────────
  async exportProductsCSV() {
    return this.fetch('/api/admin/products/export');
  }

  async importProductsCSV(rows: Record<string, string>[]) {
    return this.fetch('/api/admin/products/import', {
      method: 'POST',
      body: JSON.stringify({ rows }),
    });
  }

  // ── Blog ──────────────────────────────────────────────
  async getBlogPosts() {
    return this.fetch('/api/admin/blog');
  }

  async createBlogPost(data: Record<string, unknown>) {
    return this.fetch('/api/admin/blog', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBlogPost(id: string, data: Record<string, unknown>) {
    return this.fetch(`/api/admin/blog/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteBlogPost(id: string) {
    return this.fetch(`/api/admin/blog/${id}`, { method: 'DELETE' });
  }

  // ── Gift Cards ───────────────────────────────────────
  async getGiftCards() {
    return this.fetch('/api/admin/gift-cards');
  }

  async createGiftCard(data: Record<string, unknown>) {
    return this.fetch('/api/admin/gift-cards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGiftCard(id: string, data: Record<string, unknown>) {
    return this.fetch(`/api/admin/gift-cards/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // ── Glossary ──────────────────────────────────────────
  async getGlossary() {
    return this.fetch('/api/admin/glossary');
  }

  async createGlossaryTerm(data: Record<string, unknown>) {
    return this.fetch('/api/admin/glossary', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGlossaryTerm(id: string, data: Record<string, unknown>) {
    return this.fetch(`/api/admin/glossary/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteGlossaryTerm(id: string) {
    return this.fetch(`/api/admin/glossary/${id}`, { method: 'DELETE' });
  }

  // ── Integrations ──────────────────────────────────────
  async getIntegrations() {
    return this.fetch('/api/admin/integrations');
  }

  async connectSquare() {
    return this.fetch('/api/admin/integrations/square/connect', { method: 'POST' });
  }

  async disconnectSquare() {
    return this.fetch('/api/admin/integrations/square/disconnect', { method: 'DELETE' });
  }

  async syncSquare() {
    return this.fetch('/api/admin/integrations/square/sync', { method: 'POST' });
  }

  async getSquareLocations() {
    return this.fetch('/api/admin/integrations/square/locations');
  }

  async setSquareLocation(locationId: string) {
    return this.fetch('/api/admin/integrations/square/location', {
      method: 'PATCH',
      body: JSON.stringify({ location_id: locationId }),
    });
  }

  async getProductMappings() {
    return this.fetch('/api/admin/integrations/mappings');
  }

  async createProductMapping(data: Record<string, unknown>) {
    return this.fetch('/api/admin/integrations/mappings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteProductMapping(id: string) {
    return this.fetch(`/api/admin/integrations/mappings/${id}`, { method: 'DELETE' });
  }

  async deleteAllProductMappings() {
    return this.fetch('/api/admin/integrations/mappings', { method: 'DELETE' });
  }

  async getSyncLog() {
    return this.fetch('/api/admin/integrations/sync-log');
  }

  // ── Shipping ──────────────────────────────────────────
  async calculateShipping(subtotal: number) {
    return this.fetch('/api/shipping/calculate', {
      method: 'POST',
      body: JSON.stringify({ subtotal }),
    });
  }

  async calculateTax(subtotal: number, state: string) {
    return this.fetch('/api/tax/calculate', {
      method: 'POST',
      body: JSON.stringify({ subtotal, state }),
    });
  }
}

export function getCommerceClient(storeId: string) {
  return new CommerceClient(storeId);
}
