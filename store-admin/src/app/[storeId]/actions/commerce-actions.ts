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

export async function getProduct(storeId: string, productId: string) {
  const client = new CommerceClient(storeId);
  return client.getProduct(productId);
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

export async function getAnalytics(storeId: string, range: string = '30d') {
  const client = new CommerceClient(storeId);
  return client.getAnalytics(range);
}
