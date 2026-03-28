"use client";

import { useTransition } from "react";
import { toggleProductStock } from "@/app/admin/_actions/products";

export function ProductStockToggle({
  productId,
  inStock,
}: {
  productId: string;
  inStock: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(() => toggleProductStock(productId, !inStock))
      }
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${
        inStock ? "bg-green-500" : "bg-ww-border"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
          inStock ? "translate-x-4.5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
