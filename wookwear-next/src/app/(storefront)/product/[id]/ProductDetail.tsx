"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product, Variant } from "@/types/product";
import { useCart } from "@/hooks/useCart";
import { formatPrice, cn } from "@/lib/utils";
import { BadgePill } from "@/components/product/BadgePill";
import { ReviewStars } from "@/components/product/ReviewStars";
import { ProductCard } from "@/components/product/ProductCard";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ReviewForm } from "@/components/product/ReviewForm";
import { ShareButtons } from "@/components/product/ShareButtons";
import { RecentlyViewed, trackRecentlyViewed } from "@/components/product/RecentlyViewed";

export function ProductDetail({
  product,
  relatedProducts,
}: {
  product: Product;
  relatedProducts: Product[];
}) {
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.variants?.[0] || null
  );
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    trackRecentlyViewed(product.id);
  }, [product.id]);

  const currentImages = selectedVariant ? selectedVariant.imgs : product.imgs;
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentInStock = selectedVariant ? selectedVariant.inStock : product.inStock;
  const currentId = selectedVariant ? selectedVariant.id : product.id;

  function handleVariantChange(variant: Variant) {
    setSelectedVariant(variant);
    setActiveImgIndex(0);
  }

  return (
    <div className="min-h-screen pt-[100px] pb-24 max-md:pt-[84px] max-md:pb-16">
      <div className="max-w-[1200px] mx-auto px-10 max-md:px-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-ww-muted mb-8">
          <Link href="/shop" className="hover:text-ww-pink transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-ww-text">{product.name}</span>
        </div>

        {/* Product Layout */}
        <div className="grid grid-cols-2 gap-16 max-lg:grid-cols-1 max-lg:gap-10">
          {/* Gallery */}
          <div>
            <button
              onClick={() => setLightboxOpen(true)}
              className="relative aspect-square rounded-[20px] overflow-hidden bg-ww-surface border border-ww-border mb-4 w-full cursor-zoom-in group/zoom"
            >
              <BadgePill badge={product.badge} variantCount={product.variants?.length} />
              <Image
                src={currentImages[activeImgIndex] || product.img}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
              <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-ww-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/zoom:opacity-100 transition-opacity">
                <svg className="w-4 h-4 text-ww-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                </svg>
              </div>
            </button>
            {currentImages.length > 1 && (
              <div className="flex gap-3">
                {currentImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImgIndex(i)}
                    className={cn(
                      "relative w-20 h-20 rounded-[12px] overflow-hidden border-2 transition-all",
                      i === activeImgIndex ? "border-ww-purple" : "border-ww-border hover:border-ww-purple/50"
                    )}
                  >
                    <Image src={img} alt={`${product.name} ${i + 1}`} fill sizes="80px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex items-start justify-between gap-3 mb-3">
              <h1 className="font-head font-black text-[clamp(28px,4vw,42px)] leading-[1.1] text-ww-white">
                {product.name}
              </h1>
              <WishlistButton productId={product.id} size="lg" />
            </div>

            {product.rating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <ReviewStars rating={product.rating} />
                <span className="text-sm text-ww-muted">({product.reviewCount} reviews)</span>
              </div>
            )}

            <div className="text-2xl font-head font-bold text-ww-purple2 mb-6">
              {formatPrice(currentPrice)}
            </div>

            <p className="text-ww-text text-base leading-[1.7] mb-8">{product.desc}</p>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-8">
                <div className="font-head text-xs font-bold tracking-[0.15em] uppercase text-ww-muted mb-3">
                  Select Style {selectedVariant && <span className="text-ww-white ml-2">{selectedVariant.name}</span>}
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => handleVariantChange(variant)}
                      className={cn(
                        "w-10 h-10 rounded-full border-2 transition-all relative",
                        selectedVariant?.id === variant.id
                          ? "border-ww-white scale-110 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                          : "border-ww-border hover:border-ww-purple/50",
                        !variant.inStock && "opacity-40"
                      )}
                      style={{ backgroundColor: variant.color }}
                      title={variant.name}
                    >
                      {!variant.inStock && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-0.5 bg-ww-white/60 rotate-45" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <button
              onClick={() => currentInStock && addItem(currentId)}
              disabled={!currentInStock}
              className="w-full py-4 bg-[image:var(--gradient)] text-ww-white font-head text-sm font-extrabold tracking-[0.1em] uppercase rounded-[12px] border-none cursor-pointer hover:shadow-[0_0_32px_rgba(255,45,155,0.3)] transition-all disabled:opacity-40 disabled:cursor-not-allowed mb-4"
            >
              {currentInStock ? "Add to Cart" : "Sold Out"}
            </button>

            {/* Shipping Info */}
            <div className="flex flex-col gap-3 py-6 border-t border-ww-border text-sm text-ww-muted">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-ww-purple2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
                Ships from the PNW
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-ww-purple2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                Handmade, one of a kind
              </div>
            </div>

            <ShareButtons
              name={product.name}
              url={typeof window !== "undefined" ? window.location.href : `/product/${product.id}`}
            />
          </div>
        </div>

        {/* Reviews */}
        {product.reviews.length > 0 && (
          <section className="mt-20">
            <ScrollReveal>
              <h2 className="font-head font-black text-2xl text-ww-white mb-8">
                Reviews <span className="text-ww-muted font-normal text-lg">({product.reviewCount})</span>
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 gap-4">
              {product.reviews.map((review, i) => (
                <ScrollReveal key={i} delay={i + 1}>
                  <div className="bg-ww-surface border border-ww-border rounded-[16px] p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-[image:var(--gradient)] flex items-center justify-center font-head text-xs font-extrabold text-ww-white">
                        {review.name[0].toUpperCase()}
                      </div>
                      <div>
                        <span className="font-head text-sm font-bold text-ww-white">@{review.name}</span>
                        <span className="text-xs text-ww-muted ml-3">{review.date}</span>
                      </div>
                      <div className="ml-auto">
                        <ReviewStars rating={review.rating} />
                      </div>
                    </div>
                    <p className="text-ww-text text-sm leading-relaxed">{review.text}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
            <ReviewForm productId={product.id} />
          </section>
        )}

        {/* No reviews yet — still show the form */}
        {product.reviews.length === 0 && (
          <section className="mt-20">
            <ScrollReveal>
              <h2 className="font-head font-black text-2xl text-ww-white mb-4">
                Reviews
              </h2>
              <p className="text-sm text-ww-muted mb-4">Be the first to review this product.</p>
            </ScrollReveal>
            <ReviewForm productId={product.id} />
          </section>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <ScrollReveal>
              <h2 className="font-head font-black text-2xl text-ww-white mb-8">
                You Might Also <span className="gradient-text">Like</span>
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-4 gap-6 max-lg:grid-cols-2 max-md:gap-3.5">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Recently Viewed */}
        <RecentlyViewed excludeId={product.id} />
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[3000] bg-ww-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-ww-surface/50 flex items-center justify-center text-ww-muted hover:text-ww-white transition-colors z-10"
            aria-label="Close lightbox"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {currentImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImgIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length);
                }}
                className="absolute left-4 w-10 h-10 rounded-full bg-ww-surface/50 flex items-center justify-center text-ww-muted hover:text-ww-white transition-colors z-10"
                aria-label="Previous image"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImgIndex((prev) => (prev + 1) % currentImages.length);
                }}
                className="absolute right-4 w-10 h-10 rounded-full bg-ww-surface/50 flex items-center justify-center text-ww-muted hover:text-ww-white transition-colors z-10"
                aria-label="Next image"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </>
          )}

          <div
            className="relative max-w-[85vh] max-h-[85vh] w-full aspect-square"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={currentImages[activeImgIndex] || product.img}
              alt={product.name}
              fill
              sizes="85vh"
              className="object-contain"
              quality={90}
            />
          </div>

          {currentImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {currentImages.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImgIndex(i);
                  }}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    i === activeImgIndex ? "bg-ww-white w-6" : "bg-ww-muted/50 hover:bg-ww-muted"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
