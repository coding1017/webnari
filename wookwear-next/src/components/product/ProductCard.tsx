"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import { BadgePill } from "./BadgePill";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { ReviewStars } from "./ReviewStars";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <div className="group relative bg-ww-surface border border-ww-border rounded-[20px] overflow-hidden transition-all duration-300 hover:border-transparent hover:-translate-y-1.5 hover:shadow-[0_12px_48px_rgba(168,85,247,0.2),0_0_0_1px_var(--color-ww-purple)]">
      <Link href={`/product/${product.id}`} className="block">
        <div className="aspect-square overflow-hidden relative">
          <BadgePill badge={product.badge} variantCount={product.variants?.length} />
          <div className="absolute top-2.5 right-2.5 z-10 opacity-0 group-hover:opacity-100 max-md:opacity-100 transition-opacity">
            <WishlistButton productId={product.id} />
          </div>
          {product.img ? (
            <Image
              src={product.img}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 280px"
              className="object-cover transition-transform duration-400 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[linear-gradient(135deg,#FF2D9B,#A855F7)]">
              <span className="font-head text-[13px] font-bold tracking-[0.1em] uppercase text-white/30">
                Coming Soon
              </span>
            </div>
          )}
        </div>
        <div className="p-4 px-[18px] pb-5 max-md:p-3 max-md:px-3.5 max-md:pb-4">
          <div className="font-head font-bold text-base text-ww-white mb-1 max-md:text-sm">{product.name}</div>
          {product.rating > 0 && (
            <div className="flex items-center gap-1.5 mb-1.5">
              <ReviewStars rating={product.rating} />
              <span className="text-xs text-ww-muted">({product.reviewCount})</span>
            </div>
          )}
          <div className="text-sm text-ww-purple2 font-semibold">{formatPrice(product.price)}</div>
        </div>
      </Link>
      <div className="px-[18px] pb-5 max-md:px-3.5 max-md:pb-4">
        {product.isCollection ? (
          <Link
            href={`/product/${product.id}`}
            className="block w-full py-2.5 text-center bg-[rgba(168,85,247,0.08)] border border-[rgba(168,85,247,0.2)] text-ww-purple2 font-head text-xs font-bold tracking-[0.1em] uppercase rounded-[12px] hover:bg-[rgba(168,85,247,0.15)] hover:border-ww-purple hover:text-ww-white transition-all max-md:py-2 max-md:text-[11px]"
          >
            Select Style
          </Link>
        ) : (
          <button
            onClick={() => product.inStock && addItem(product.id)}
            disabled={!product.inStock}
            className="w-full py-2.5 bg-[rgba(168,85,247,0.08)] border border-[rgba(168,85,247,0.2)] text-ww-purple2 font-head text-xs font-bold tracking-[0.1em] uppercase rounded-[12px] cursor-pointer hover:bg-[rgba(168,85,247,0.15)] hover:border-ww-purple hover:text-ww-white transition-all disabled:opacity-40 disabled:cursor-not-allowed max-md:py-2 max-md:text-[11px]"
          >
            {product.inStock ? "Add to Cart" : "Sold Out"}
          </button>
        )}
      </div>
    </div>
  );
}
