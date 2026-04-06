"use server";

import { CommerceClient } from "@/lib/commerce";

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
