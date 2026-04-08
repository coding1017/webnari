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

  async getCartRecoveryStats() {
    return this.fetch('/api/admin/cart-recovery/stats');
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

  async getUnfulfilledOrders() {
    return this.fetch('/api/admin/orders?status=confirmed,processing&limit=50');
  }

  async getShippedOrders() {
    return this.fetch('/api/admin/orders?status=shipped&limit=20');
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

  async syncSquareImages(offset?: number) {
    return this.fetch('/api/admin/integrations/square/sync-images', {
      method: 'POST',
      body: JSON.stringify(offset ? { skip: offset } : {}),
    });
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

  async connectQuickBooks() {
    return this.fetch('/api/admin/integrations/quickbooks/connect', { method: 'POST' });
  }

  async disconnectQuickBooks() {
    return this.fetch('/api/admin/integrations/quickbooks/disconnect', { method: 'DELETE' });
  }

  async testQuickBooks() {
    return this.fetch('/api/admin/integrations/quickbooks/test', { method: 'POST' });
  }

  async getQuickBooksSyncLog() {
    return this.fetch('/api/admin/integrations/quickbooks/sync-log');
  }

  // ── Stripe Connect ────────────────────────────────────

  async connectStripe() {
    return this.fetch('/api/admin/integrations/stripe/connect', { method: 'POST' });
  }

  async disconnectStripe() {
    return this.fetch('/api/admin/integrations/stripe/disconnect', { method: 'DELETE' });
  }

  async testStripe() {
    return this.fetch('/api/admin/integrations/stripe/test', { method: 'POST' });
  }

  async getStripeStatus() {
    return this.fetch('/api/admin/integrations/stripe/status');
  }

  async syncStripeProducts(options?: { fresh?: boolean }) {
    return this.fetch('/api/admin/integrations/stripe/sync', {
      method: 'POST',
      body: options ? JSON.stringify(options) : undefined,
    });
  }

  // ── GA4 ───────────────────────────────────────────────
  async configureGA4(data: { measurement_id: string; api_secret: string }) {
    return this.fetch('/api/admin/integrations/ga4/configure', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async disconnectGA4() {
    return this.fetch('/api/admin/integrations/ga4/disconnect', { method: 'DELETE' });
  }

  async testGA4() {
    return this.fetch('/api/admin/integrations/ga4/test', { method: 'POST' });
  }

  // ── Twilio SMS ────────────────────────────────────────
  async configureTwilio(data: { account_sid: string; auth_token: string; from_number: string; owner_phone: string; notify_events?: string[] }) {
    return this.fetch('/api/admin/integrations/twilio/configure', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async disconnectTwilio() {
    return this.fetch('/api/admin/integrations/twilio/disconnect', { method: 'DELETE' });
  }

  async testTwilio() {
    return this.fetch('/api/admin/integrations/twilio/test', { method: 'POST' });
  }

  async updateTwilioSettings(data: { notify_events?: string[]; owner_phone?: string }) {
    return this.fetch('/api/admin/integrations/twilio/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // ── Apps ──────────────────────────────────────────────
  async getApps() {
    return this.fetch('/api/admin/apps');
  }

  // ── Webhooks ──────────────────────────────────────────
  async getWebhooks() {
    return this.fetch('/api/admin/webhooks');
  }

  async createWebhook(data: { url: string; events: string[]; description?: string }) {
    return this.fetch('/api/admin/webhooks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWebhook(id: string) {
    return this.fetch(`/api/admin/webhooks/${id}`);
  }

  async updateWebhook(id: string, data: Record<string, unknown>) {
    return this.fetch(`/api/admin/webhooks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteWebhook(id: string) {
    return this.fetch(`/api/admin/webhooks/${id}`, { method: 'DELETE' });
  }

  async getWebhookDeliveries(id: string, params?: { limit?: number; offset?: number }) {
    const qs = new URLSearchParams();
    if (params?.limit) qs.set('limit', params.limit.toString());
    if (params?.offset) qs.set('offset', params.offset.toString());
    const query = qs.toString();
    return this.fetch(`/api/admin/webhooks/${id}/deliveries${query ? `?${query}` : ''}`);
  }

  async testWebhook(id: string) {
    return this.fetch(`/api/admin/webhooks/${id}/test`, { method: 'POST' });
  }

  async getWebhookEvents() {
    return this.fetch('/api/admin/webhook-events');
  }

  // ── Store ─────────────────────────────────────────────
  async getStore() {
    return this.fetch('/api/admin/store');
  }

  // ── SEO ───────────────────────────────────────────────
  async getSeoHealth() {
    return this.fetch('/api/admin/seo/health');
  }

  // ── Shipping ──────────────────────────────────────────
  async calculateShipping(subtotal: number) {
    return this.fetch('/api/shipping/calculate', {
      method: 'POST',
      body: JSON.stringify({ subtotal }),
    });
  }

  async calculateTax(subtotal: number, toZip: string) {
    return this.fetch('/api/tax/calculate', {
      method: 'POST',
      body: JSON.stringify({ subtotal, zip: toZip }),
    });
  }

  // ── Tags ─────────────────────────────────────────────
  async getTags() {
    return this.fetch('/api/admin/tags');
  }

  async setProductTags(productId: string, tags: string[]) {
    return this.fetch(`/api/admin/products/${productId}/tags`, {
      method: 'POST',
      body: JSON.stringify({ tags }),
    });
  }

  // ── Draft / Manual Orders ────────────────────────────
  async createOrder(data: Record<string, unknown>) {
    return this.fetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ── Shipping Labels ──────────────────────────────────
  async purchaseLabel(orderId: string, rateId: string) {
    return this.fetch(`/api/orders/${orderId}/label`, {
      method: 'POST',
      body: JSON.stringify({ rate_id: rateId }),
    });
  }

  async getShippingRates(data: { toZip: string; items: Array<{ productId: string; variantId?: string; quantity: number }> }) {
    return this.fetch('/api/shipping/rates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ── Staff / RBAC ─────────────────────────────────────
  async getStaff() {
    return this.fetch('/api/admin/staff');
  }

  async createStaff(data: { name: string; email: string; role?: string; permissions?: string[] }) {
    return this.fetch('/api/admin/staff', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStaff(staffId: string, data: Record<string, unknown>) {
    return this.fetch(`/api/admin/staff/${staffId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteStaff(staffId: string) {
    return this.fetch(`/api/admin/staff/${staffId}`, { method: 'DELETE' });
  }

  // ── Partial Refund ───────────────────────────────────
  async refundOrder(orderId: string, data: { refund_amount?: number; refund_items?: Array<{ order_item_id: string; quantity: number }> }) {
    return this.fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: data.refund_amount ? undefined : 'refunded', ...data }),
    });
  }

  // ── Fulfillments (split fulfillment) ─────────────────
  async getFulfillments(orderId: string) {
    return this.fetch(`/api/orders/${orderId}/fulfillments`);
  }

  async createFulfillment(orderId: string, data: { items: Array<{ order_item_id: string; quantity: number }>; tracking_number?: string; tracking_url?: string; carrier?: string }) {
    return this.fetch(`/api/orders/${orderId}/fulfillments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFulfillment(fulfillmentId: string, data: Record<string, unknown>) {
    return this.fetch(`/api/fulfillments/${fulfillmentId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // ── URL Redirects ─────────────────────────────────────
  async getRedirects() {
    return this.fetch('/api/admin/redirects');
  }
  async createRedirect(data: { from_path: string; to_path: string; status_code?: number }) {
    return this.fetch('/api/admin/redirects', { method: 'POST', body: JSON.stringify(data) });
  }
  async deleteRedirect(id: string) {
    return this.fetch(`/api/admin/redirects/${id}`, { method: 'DELETE' });
  }

  // ── Email Templates ───────────────────────────────────
  async getEmailTemplates() {
    return this.fetch('/api/admin/email-templates');
  }
  async upsertEmailTemplate(data: { template_key: string; subject: string; html_body: string; active?: boolean }) {
    return this.fetch('/api/admin/email-templates', { method: 'POST', body: JSON.stringify(data) });
  }
  async deleteEmailTemplate(id: string) {
    return this.fetch(`/api/admin/email-templates/${id}`, { method: 'DELETE' });
  }

  // ── Customer Segments ─────────────────────────────────
  async getSegments() {
    return this.fetch('/api/admin/segments');
  }
  async createSegment(data: { name: string; color?: string }) {
    return this.fetch('/api/admin/segments', { method: 'POST', body: JSON.stringify(data) });
  }
  async updateSegment(id: string, data: Record<string, unknown>) {
    return this.fetch(`/api/admin/segments/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }
  async deleteSegment(id: string) {
    return this.fetch(`/api/admin/segments/${id}`, { method: 'DELETE' });
  }
  async addSegmentMember(segmentId: string, customerId: string) {
    return this.fetch(`/api/admin/segments/${segmentId}/members`, { method: 'POST', body: JSON.stringify({ customer_id: customerId }) });
  }
  async removeSegmentMember(segmentId: string, customerId: string) {
    return this.fetch(`/api/admin/segments/${segmentId}/members/${customerId}`, { method: 'DELETE' });
  }
}

export function getCommerceClient(storeId: string) {
  return new CommerceClient(storeId);
}
