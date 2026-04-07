"use server";

import { CommerceClient } from "@/lib/commerce";
import Anthropic from "@anthropic-ai/sdk";

// ── AI Product Scanner ──────────────────────────────────────

export interface ScanResult {
  name: string;
  description: string;
  category: string | null;
  color: string | null;
  material: string | null;
  suggestedPrice: string | null;
  badge: string | null;
  dimensions: {
    width: string | null;
    height: string | null;
    depth: string | null;
    unit: "in" | "cm";
    referenceObjectUsed: boolean;
  } | null;
  confidence: number;
  rawAnalysis: string;
}

export async function scanProduct(formData: FormData): Promise<ScanResult> {
  const imageFile = formData.get("image") as File;
  if (!imageFile) throw new Error("No image provided");

  const categoriesJson = formData.get("categories") as string;
  let categoryList = "pouches, bags, mats, buddy, shoes, sneakers, clothing, accessories, hats, shirts, pants, jackets, socks";
  if (categoriesJson) {
    try {
      const cats = JSON.parse(categoriesJson) as { slug: string; name: string }[];
      categoryList = cats.map(c => c.slug).join(", ");
    } catch {}
  }

  // Convert file to base64
  const arrayBuffer = await imageFile.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const mediaType = imageFile.type as "image/jpeg" | "image/png" | "image/webp" | "image/gif";

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = `You are a product cataloging assistant for an e-commerce store. Analyze this product photo and extract structured data for a product listing.

AVAILABLE CATEGORIES (use the slug value): ${categoryList}

AVAILABLE COLORS: Black, White, Pink, Red, Blue, Green, Tie-Dye, Rainbow, Orange, Purple, Yellow, Brown, Gray, Gold, Silver, Teal, Coral, Maroon, Navy

REFERENCE OBJECT: If you see a credit card, debit card, ID card, or coin next to the product, use it to estimate real dimensions. A standard credit card is 3.375 x 2.125 inches (85.6 x 53.98 mm). A US quarter is 0.955 inches (24.26 mm) diameter.

Respond ONLY with valid JSON (no markdown, no code fences) matching this schema:
{
  "name": "concise product name, e.g. 'Tie-Dye Crossbody Pouch'",
  "description": "1-2 sentence product description for an online store listing",
  "category": "one of the category slugs listed above, or null if uncertain",
  "color": "primary color from the AVAILABLE COLORS list, or a descriptive color name if not in the list, or null",
  "material": "detected material/fabric/texture, e.g. 'cotton canvas', 'leather', 'polyester blend', or null if unclear",
  "suggestedPrice": "estimated retail price in dollars (just the number, e.g. '29.99') based on product type, size, and apparent quality, or null if too uncertain",
  "badge": "'NEW' if the product looks new/unused, null otherwise",
  "dimensions": {
    "width": "estimated width with unit, e.g. '8 inches', or null",
    "height": "estimated height with unit, or null",
    "depth": "estimated depth with unit, or null",
    "unit": "in",
    "referenceObjectUsed": true or false
  },
  "confidence": 0.0 to 1.0 representing overall confidence in the analysis,
  "rawAnalysis": "brief explanation of what you see and your reasoning for each field"
}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
          { type: "text", text: prompt },
        ],
      }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    // Parse JSON — handle potential markdown fences
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned) as ScanResult;

    return {
      name: parsed.name || "",
      description: parsed.description || "",
      category: parsed.category || null,
      color: parsed.color || null,
      material: parsed.material || null,
      suggestedPrice: parsed.suggestedPrice || null,
      badge: parsed.badge || null,
      dimensions: parsed.dimensions || null,
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
      rawAnalysis: parsed.rawAnalysis || "",
    };
  } catch (err) {
    throw new Error(`Scan failed: ${(err as Error).message}`);
  }
}

export async function getCartRecoveryStats(storeId: string) {
  const client = new CommerceClient(storeId);
  return client.getCartRecoveryStats();
}

export async function createProduct(storeId: string, data: Record<string, unknown>) {
  const client = new CommerceClient(storeId);
  return client.createProduct(data);
}

export async function updateProduct(storeId: string, productId: string, data: Record<string, unknown>) {
  const client = new CommerceClient(storeId);
  return client.updateProduct(productId, data);
}

export async function deleteProduct(storeId: string, productId: string) {
  const client = new CommerceClient(storeId);
  return client.deleteProduct(productId);
}

export async function updateOrder(storeId: string, orderId: string, data: Record<string, unknown>) {
  const client = new CommerceClient(storeId);
  return client.updateOrder(orderId, data);
}

export async function updateInventory(storeId: string, productId: string, data: Record<string, unknown>) {
  const client = new CommerceClient(storeId);
  return client.updateInventory(productId, data);
}

export async function updateReview(storeId: string, reviewId: string, data: { approved: boolean }) {
  const client = new CommerceClient(storeId);
  return client.updateReview(reviewId, data);
}

export async function deleteReview(storeId: string, reviewId: string) {
  const client = new CommerceClient(storeId);
  return client.deleteReview(reviewId);
}

export async function updateStore(storeId: string, data: Record<string, unknown>) {
  const client = new CommerceClient(storeId);
  return client.updateStore(data);
}

export async function upsertTaxRate(storeId: string, data: { state: string; rate: number; label?: string }) {
  const client = new CommerceClient(storeId);
  return client.upsertTaxRate(data);
}

export async function getProducts(storeId: string, params?: { search?: string; category?: string }) {
  const client = new CommerceClient(storeId);
  return client.getProducts(params);
}

export async function getOrders(storeId: string, params?: { status?: string; limit?: number }) {
  const client = new CommerceClient(storeId);
  return client.getOrders(params);
}

export async function getOrder(storeId: string, orderId: string) {
  const client = new CommerceClient(storeId);
  return client.getOrder(orderId);
}

export async function getReviews(storeId: string) {
  const client = new CommerceClient(storeId);
  return client.getReviews();
}

export async function getLowStock(storeId: string) {
  const client = new CommerceClient(storeId);
  return client.getLowStock();
}

export async function getStoreConfig(storeId: string) {
  const client = new CommerceClient(storeId);
  return client.getStoreConfig();
}

export async function getCategories(storeId: string) {
  const client = new CommerceClient(storeId);
  return client.getCategories();
}

export async function createCategory(storeId: string, data: { name: string; slug?: string; sort_order?: number }) {
  const client = new CommerceClient(storeId);
  return client.createCategory(data);
}

export async function updateCategory(storeId: string, categoryId: string, data: Record<string, unknown>) {
  const client = new CommerceClient(storeId);
  return client.updateCategory(categoryId, data);
}

export async function deleteCategory(storeId: string, categoryId: string) {
  const client = new CommerceClient(storeId);
  return client.deleteCategory(categoryId);
}

export async function getProduct(storeId: string, productId: string) {
  const client = new CommerceClient(storeId);
  return client.getProduct(productId);
}

export async function getDiscounts(storeId: string) {
  const client = new CommerceClient(storeId);
  return client.getDiscounts();
}

export async function createDiscount(storeId: string, data: Record<string, unknown>) {
  const client = new CommerceClient(storeId);
  return client.createDiscount(data);
}

export async function updateDiscount(storeId: string, discountId: string, data: Record<string, unknown>) {
  const client = new CommerceClient(storeId);
  return client.updateDiscount(discountId, data);
}

export async function deleteDiscount(storeId: string, discountId: string) {
  const client = new CommerceClient(storeId);
  return client.deleteDiscount(discountId);
}

export async function getAnalytics(storeId: string, range?: string) {
  const client = new CommerceClient(storeId);
  return client.getAnalytics(range ? { range } : undefined);
}

export async function getCustomers(storeId: string) {
  const client = new CommerceClient(storeId);
  return client.getCustomers();
}

export async function exportProductsCSV(storeId: string) {
  const client = new CommerceClient(storeId);
  return client.exportProductsCSV();
}

export async function importProductsCSV(storeId: string, rows: Record<string, string>[]) {
  const client = new CommerceClient(storeId);
  return client.importProductsCSV(rows);
}

export async function getBlogPosts(storeId: string) {
  const client = new CommerceClient(storeId);
  return client.getBlogPosts();
}

export async function createBlogPost(storeId: string, data: Record<string, unknown>) {
  const client = new CommerceClient(storeId);
  return client.createBlogPost(data);
}

export async function updateBlogPost(storeId: string, postId: string, data: Record<string, unknown>) {
  const client = new CommerceClient(storeId);
  return client.updateBlogPost(postId, data);
}

export async function deleteBlogPost(storeId: string, postId: string) {
  const client = new CommerceClient(storeId);
  return client.deleteBlogPost(postId);
}

export async function getGiftCards(storeId: string) {
  const client = new CommerceClient(storeId);
  return client.getGiftCards();
}

export async function createGiftCard(storeId: string, data: Record<string, unknown>) {
  const client = new CommerceClient(storeId);
  return client.createGiftCard(data);
}

export async function updateGiftCard(storeId: string, cardId: string, data: Record<string, unknown>) {
  const client = new CommerceClient(storeId);
  return client.updateGiftCard(cardId, data);
}

export async function getGlossary(storeId: string) {
  const client = new CommerceClient(storeId);
  return client.getGlossary();
}

export async function createGlossaryTerm(storeId: string, data: Record<string, unknown>) {
  const client = new CommerceClient(storeId);
  return client.createGlossaryTerm(data);
}

export async function updateGlossaryTerm(storeId: string, termId: string, data: Record<string, unknown>) {
  const client = new CommerceClient(storeId);
  return client.updateGlossaryTerm(termId, data);
}

export async function deleteGlossaryTerm(storeId: string, termId: string) {
  const client = new CommerceClient(storeId);
  return client.deleteGlossaryTerm(termId);
}

// ── Integrations ──────────────────────────────────────────

export async function getIntegrations(storeId: string) {
  const client = new CommerceClient(storeId);
  return client.getIntegrations();
}

export async function connectSquare(storeId: string) {
  const client = new CommerceClient(storeId);
  return client.connectSquare();
}

export async function disconnectSquare(storeId: string) {
  const client = new CommerceClient(storeId);
  return client.disconnectSquare();
}

export async function syncSquare(storeId: string) {
  const client = new CommerceClient(storeId);
  return client.syncSquare();
}

export async function syncSquareImages(storeId: string, offset?: number) {
  const client = new CommerceClient(storeId);
  return client.syncSquareImages(offset);
}

export async function getSquareLocations(storeId: string) {
  const client = new CommerceClient(storeId);
  return client.getSquareLocations();
}

export async function setSquareLocation(storeId: string, locationId: string) {
  const client = new CommerceClient(storeId);
  return client.setSquareLocation(locationId);
}

export async function getProductMappings(storeId: string) {
  const client = new CommerceClient(storeId);
  return client.getProductMappings();
}

export async function createProductMapping(storeId: string, data: Record<string, unknown>) {
  const client = new CommerceClient(storeId);
  return client.createProductMapping(data);
}

export async function deleteProductMapping(storeId: string, mappingId: string) {
  const client = new CommerceClient(storeId);
  return client.deleteProductMapping(mappingId);
}

export async function deleteAllProductMappings(storeId: string) {
  const client = new CommerceClient(storeId);
  return client.deleteAllProductMappings();
}

export async function getSyncLog(storeId: string) {
  const client = new CommerceClient(storeId);
  return client.getSyncLog();
}

export async function connectQuickBooks(storeId: string) {
  const client = new CommerceClient(storeId);
  return client.connectQuickBooks();
}

export async function disconnectQuickBooks(storeId: string) {
  const client = new CommerceClient(storeId);
  return client.disconnectQuickBooks();
}

export async function testQuickBooks(storeId: string) {
  const client = new CommerceClient(storeId);
  return client.testQuickBooks();
}

export async function getQuickBooksSyncLog(storeId: string) {
  const client = new CommerceClient(storeId);
  return client.getQuickBooksSyncLog();
}

// ── Stripe Connect ────────────────────────────────────

export async function connectStripe(storeId: string) {
  const client = new CommerceClient(storeId);
  return client.connectStripe();
}

export async function disconnectStripe(storeId: string) {
  const client = new CommerceClient(storeId);
  return client.disconnectStripe();
}

export async function testStripe(storeId: string) {
  const client = new CommerceClient(storeId);
  return client.testStripe();
}

export async function getStripeStatus(storeId: string) {
  const client = new CommerceClient(storeId);
  return client.getStripeStatus();
}

export async function syncStripeProducts(storeId: string, options?: { fresh?: boolean }) {
  const client = new CommerceClient(storeId);
  return client.syncStripeProducts(options);
}

// ── GA4 ──────────────────────────────────────────────

export async function configureGA4(storeId: string, data: { measurement_id: string; api_secret: string }) {
  const client = new CommerceClient(storeId);
  return client.configureGA4(data);
}

export async function disconnectGA4(storeId: string) {
  const client = new CommerceClient(storeId);
  return client.disconnectGA4();
}

export async function testGA4(storeId: string) {
  const client = new CommerceClient(storeId);
  return client.testGA4();
}

// ── Twilio SMS ───────────────────────────────────────

export async function configureTwilio(storeId: string, data: { account_sid: string; auth_token: string; from_number: string; owner_phone: string; notify_events?: string[] }) {
  const client = new CommerceClient(storeId);
  return client.configureTwilio(data);
}

export async function disconnectTwilio(storeId: string) {
  const client = new CommerceClient(storeId);
  return client.disconnectTwilio();
}

export async function testTwilio(storeId: string) {
  const client = new CommerceClient(storeId);
  return client.testTwilio();
}

export async function updateTwilioSettings(storeId: string, data: { notify_events?: string[]; owner_phone?: string }) {
  const client = new CommerceClient(storeId);
  return client.updateTwilioSettings(data);
}

// ── Apps ─────────────────────────────────────────────

export async function getApps(storeId: string) {
  const client = new CommerceClient(storeId);
  return client.getApps();
}

// ── Webhooks ─────────────────────────────────────────

export async function getWebhooks(storeId: string) {
  const client = new CommerceClient(storeId);
  return client.getWebhooks();
}

export async function createWebhook(storeId: string, data: { url: string; events: string[]; description?: string }) {
  const client = new CommerceClient(storeId);
  return client.createWebhook(data);
}

export async function getWebhook(storeId: string, id: string) {
  const client = new CommerceClient(storeId);
  return client.getWebhook(id);
}

export async function updateWebhook(storeId: string, id: string, data: Record<string, unknown>) {
  const client = new CommerceClient(storeId);
  return client.updateWebhook(id, data);
}

export async function deleteWebhook(storeId: string, id: string) {
  const client = new CommerceClient(storeId);
  return client.deleteWebhook(id);
}

export async function getWebhookDeliveries(storeId: string, id: string, params?: { limit?: number; offset?: number }) {
  const client = new CommerceClient(storeId);
  return client.getWebhookDeliveries(id, params);
}

export async function testWebhook(storeId: string, id: string) {
  const client = new CommerceClient(storeId);
  return client.testWebhook(id);
}

export async function getWebhookEvents(storeId: string) {
  const client = new CommerceClient(storeId);
  return client.getWebhookEvents();
}

// ── Tax Lookup ──────────────────────────────────────────────

export async function calculateTax(storeId: string, subtotal: number, toZip: string) {
  const client = new CommerceClient(storeId);
  return client.calculateTax(subtotal, toZip);
}

// ── Fulfillment ──────────────────────────────────────────────

export async function getUnfulfilledOrders(storeId: string) {
  const client = new CommerceClient(storeId);
  return client.getUnfulfilledOrders();
}

export async function getShippedOrders(storeId: string) {
  const client = new CommerceClient(storeId);
  return client.getShippedOrders();
}

// ── Store ────────────────────────────────────────────────────

export async function getStoreSettings(storeId: string) {
  const client = new CommerceClient(storeId);
  return client.getStore();
}

// ── SEO ──────────────────────────────────────────────────────

export async function getSeoHealth(storeId: string) {
  const client = new CommerceClient(storeId);
  return client.getSeoHealth();
}
