import { db } from "@/lib/db";
import { ShopContent } from "./ShopContent";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function ShopPage() {
  const products = await db.getProducts();

  return <ShopContent products={products} />;
}
