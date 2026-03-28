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

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.desc,
    image: product.img,
    brand: { "@type": "Brand", name: "Wook Wear" },
    offers: {
      "@type": "Offer",
      price: product.price.toFixed(2),
      priceCurrency: "USD",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    ...(product.rating > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating.toFixed(1),
        reviewCount: product.reviewCount,
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail product={product} relatedProducts={related} />
    </>
  );
}
