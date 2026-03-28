"use client";

import { useWishlist } from "@/hooks/useWishlist";

export function WishlistButton({
  productId,
  variantId,
  size = "sm",
}: {
  productId: string;
  variantId?: string;
  size?: "sm" | "lg";
}) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const active = isWishlisted(productId, variantId);

  const iconSize = size === "lg" ? "w-6 h-6" : "w-4.5 h-4.5";
  const btnSize =
    size === "lg"
      ? "w-10 h-10"
      : "w-8 h-8";

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(productId, variantId);
      }}
      className={`${btnSize} flex items-center justify-center rounded-full transition-all ${
        active
          ? "bg-ww-pink/20 text-ww-pink scale-110"
          : "bg-ww-black/50 backdrop-blur-sm text-ww-muted hover:text-ww-pink hover:bg-ww-pink/10"
      }`}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
    >
      <svg
        className={`${iconSize} transition-transform ${active ? "scale-110" : ""}`}
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={active ? 0 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    </button>
  );
}
