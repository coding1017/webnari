"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

// Helper to get a typed-as-any supabase client for mutations
function db() {
  return createAdminClient() as any;
}

export async function createProduct(
  _prevState: { error: string },
  formData: FormData
) {
  await requireAdmin();

  const id = (formData.get("id") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();
  const category = formData.get("category") as string;
  const price = Math.round(parseFloat(formData.get("price") as string) * 100);
  const description = (formData.get("description") as string) || "";
  const badge = (formData.get("badge") as string) || null;
  const inStock = formData.get("in_stock") === "on";
  const isCollection = formData.get("is_collection") === "on";
  const sortOrder = parseInt(formData.get("sort_order") as string) || 0;

  if (!id || !name || !category || isNaN(price)) {
    return { error: "Name, ID, category, and price are required" };
  }

  const { error } = await db().from("products").insert({
    id, name, category, price, description, badge,
    in_stock: inStock, is_collection: isCollection, sort_order: sortOrder,
  });

  if (error) return { error: error.message };

  const imageUrls = formData.getAll("image_urls") as string[];
  if (imageUrls.length > 0) {
    const images = imageUrls.filter((url) => url.trim()).map((url, i) => ({
      product_id: id, url: url.trim(), sort_order: i,
    }));
    if (images.length > 0) await db().from("product_images").insert(images);
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function updateProduct(
  _prevState: { error: string },
  formData: FormData
) {
  await requireAdmin();

  const id = formData.get("id") as string;
  const name = (formData.get("name") as string)?.trim();
  const category = formData.get("category") as string;
  const price = Math.round(parseFloat(formData.get("price") as string) * 100);
  const description = (formData.get("description") as string) || "";
  const badge = (formData.get("badge") as string) || null;
  const inStock = formData.get("in_stock") === "on";
  const isCollection = formData.get("is_collection") === "on";
  const sortOrder = parseInt(formData.get("sort_order") as string) || 0;

  if (!name || !category || isNaN(price)) {
    return { error: "Name, category, and price are required" };
  }

  const { error } = await db().from("products").update({
    name, category, price, description, badge,
    in_stock: inStock, is_collection: isCollection, sort_order: sortOrder,
  }).eq("id", id);

  if (error) return { error: error.message };

  const imageUrls = formData.getAll("image_urls") as string[];
  await db().from("product_images").delete().eq("product_id", id);
  if (imageUrls.length > 0) {
    const images = imageUrls.filter((url) => url.trim()).map((url, i) => ({
      product_id: id, url: url.trim(), sort_order: i,
    }));
    if (images.length > 0) await db().from("product_images").insert(images);
  }

  revalidatePath("/admin/products");
  revalidatePath(`/product/${id}`);
  revalidatePath("/shop");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const { error } = await db().from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
}

export async function toggleProductStock(id: string, inStock: boolean) {
  await requireAdmin();
  await db().from("products").update({ in_stock: inStock }).eq("id", id);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function deleteProducts(ids: string[]) {
  await requireAdmin();
  await db().from("products").delete().in("id", ids);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
}

// --- Variant Actions ---

export async function createVariant(
  _prevState: { error: string },
  formData: FormData
) {
  await requireAdmin();

  const id = (formData.get("id") as string)?.trim();
  const productId = formData.get("product_id") as string;
  const name = (formData.get("name") as string)?.trim();
  const color = (formData.get("color") as string) || "#A855F7";
  const price = Math.round(parseFloat(formData.get("price") as string) * 100);
  const inStock = formData.get("in_stock") === "on";
  const sortOrder = parseInt(formData.get("sort_order") as string) || 0;

  if (!id || !name || isNaN(price)) {
    return { error: "ID, name, and price are required" };
  }

  const { error } = await db().from("variants").insert({
    id, product_id: productId, name, color, price,
    in_stock: inStock, sort_order: sortOrder,
  });

  if (error) return { error: error.message };

  const imageUrls = formData.getAll("image_urls") as string[];
  if (imageUrls.length > 0) {
    const images = imageUrls.filter((url) => url.trim()).map((url, i) => ({
      variant_id: id, url: url.trim(), sort_order: i,
    }));
    if (images.length > 0) await db().from("variant_images").insert(images);
  }

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath(`/product/${productId}`);
  return { error: "" };
}

export async function deleteVariant(variantId: string, productId: string) {
  await requireAdmin();
  await db().from("variants").delete().eq("id", variantId);
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath(`/product/${productId}`);
  revalidatePath("/shop");
}
