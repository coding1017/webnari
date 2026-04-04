const API_BASE = 'https://webnari.io/commerce';

function getAdminKey(): string {
  try {
    return process.env.NEXT_PUBLIC_COMMERCE_ADMIN_KEY || '';
  } catch {
    return '';
  }
}

export class CommerceClient {
  private storeId: string;
  private adminKey: string;

  constructor(storeId: string, adminKey?: string) {
    this.storeId = storeId;
    this.adminKey = adminKey || getAdminKey();
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

  // ── Discounts ─────────────────────────────────────────
  async getDiscounts() {
    return this.fetch('/api/admin/discounts');
  }

  async getDiscount(id: string) {
    return this.fetch(`/api/admin/discounts/${id}`);
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
  async getAnalytics(range: string = '30d') {
    return this.fetch(`/api/admin/analytics?range=${range}`);
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
