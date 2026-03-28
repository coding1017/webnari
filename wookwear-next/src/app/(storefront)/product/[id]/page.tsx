import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductDetail } from "./ProductDetail";
import { formatPrice } from "@/lib/utils";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await db.getProductById(id);
  if (!product) return { title: "Product Not Found" };

  return {
    title: `${product.name} | Wook Wear`,
    description: product.desc?.slice(0, 160) || `${product.name} — handmade by Meesh. ${formatPrice(product.price)}`,
    openGraph: {
      title: `${product.name} | Wook Wear`,
      description: product.desc?.slice(0, 160) || `Handmade by Meesh — ${formatPrice(product.price)}`,
      images: product.img ? [{ url: product.img, width: 800, height: 800 }] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await db.getProductById(id);

  if (!product) notFound();

  const allProducts = await db.getProducts();
  const related = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id && p.inStock)
    .slice(0, 4);

  return <ProductDetail product={product} relatedProducts={related} />;
}
