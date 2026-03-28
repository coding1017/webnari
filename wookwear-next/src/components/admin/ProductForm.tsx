"use client";

import { useActionState, useState } from "react";
import { createProduct, updateProduct } from "@/app/admin/_actions/products";

interface ProductData {
  id: string;
  name: string;
  category: string;
  price: number; // cents
  description: string;
  badge: string | null;
  in_stock: boolean;
  is_collection: boolean;
  sort_order: number;
  product_images: { url: string; sort_order: number }[];
}

export function ProductForm({
  product,
  mode,
}: {
  product?: ProductData;
  mode: "create" | "edit";
}) {
  const action = mode === "create" ? createProduct : updateProduct;
  const [state, formAction, isPending] = useActionState(action, { error: "" });

  const [images, setImages] = useState<string[]>(
    product?.product_images
      ?.sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => img.url) ?? []
  );
  const [uploading, setUploading] = useState(false);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/admin/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const { url } = await res.json();
        setImages((prev) => [...prev, url]);
      }
    }
    setUploading(false);
    e.target.value = "";
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <form action={formAction} className="space-y-6 max-w-2xl">
      {state.error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
          {state.error}
        </div>
      )}

      {/* Hidden ID for edit mode */}
      {mode === "edit" && (
        <input type="hidden" name="id" value={product?.id} />
      )}

      {/* Basic Info */}
      <div className="bg-ww-dark border border-ww-border rounded-lg p-5 space-y-4">
        <h2 className="font-head font-semibold text-ww-white">Basic Info</h2>

        {mode === "create" && (
          <div>
            <label className="block text-sm font-medium text-ww-text mb-1.5">
              Product ID (slug)
            </label>
            <input
              name="id"
              type="text"
              required
              placeholder="e.g. pouch-checker-pink"
              className="w-full px-3 py-2.5 bg-ww-surface border border-ww-border rounded-lg text-ww-white placeholder:text-ww-muted/50 focus:outline-none focus:border-ww-purple transition-colors text-sm"
            />
            <p className="text-xs text-ww-muted mt-1">
              Used in URLs. Lowercase, hyphens only. Cannot be changed later.
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-ww-text mb-1.5">
            Name
          </label>
          <input
            name="name"
            type="text"
            required
            defaultValue={product?.name}
            placeholder="e.g. Pink Checker Pouch Set"
            className="w-full px-3 py-2.5 bg-ww-surface border border-ww-border rounded-lg text-ww-white placeholder:text-ww-muted/50 focus:outline-none focus:border-ww-purple transition-colors text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ww-text mb-1.5">
              Category
            </label>
            <select
              name="category"
              defaultValue={product?.category || "pouches"}
              className="w-full px-3 py-2.5 bg-ww-surface border border-ww-border rounded-lg text-ww-white focus:outline-none focus:border-ww-purple transition-colors text-sm"
            >
              <option value="pouches">Pouches</option>
              <option value="bags">Bags</option>
              <option value="mats">Mats</option>
              <option value="buddy">Buddy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-ww-text mb-1.5">
              Price ($)
            </label>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={product ? (product.price / 100).toFixed(2) : ""}
              placeholder="45.00"
              className="w-full px-3 py-2.5 bg-ww-surface border border-ww-border rounded-lg text-ww-white placeholder:text-ww-muted/50 focus:outline-none focus:border-ww-purple transition-colors text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ww-text mb-1.5">
            Description
          </label>
          <textarea
            name="description"
            rows={4}
            defaultValue={product?.description}
            placeholder="Describe the product..."
            className="w-full px-3 py-2.5 bg-ww-surface border border-ww-border rounded-lg text-ww-white placeholder:text-ww-muted/50 focus:outline-none focus:border-ww-purple transition-colors text-sm resize-none"
          />
        </div>
      </div>

      {/* Status */}
      <div className="bg-ww-dark border border-ww-border rounded-lg p-5 space-y-4">
        <h2 className="font-head font-semibold text-ww-white">Status</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ww-text mb-1.5">
              Badge
            </label>
            <select
              name="badge"
              defaultValue={product?.badge || ""}
              className="w-full px-3 py-2.5 bg-ww-surface border border-ww-border rounded-lg text-ww-white focus:outline-none focus:border-ww-purple transition-colors text-sm"
            >
              <option value="">None</option>
              <option value="new">New</option>
              <option value="sold">Sold Out</option>
              <option value="oneofone">One of One</option>
              <option value="collection">Collection</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-ww-text mb-1.5">
              Sort Order
            </label>
            <input
              name="sort_order"
              type="number"
              defaultValue={product?.sort_order ?? 0}
              className="w-full px-3 py-2.5 bg-ww-surface border border-ww-border rounded-lg text-ww-white focus:outline-none focus:border-ww-purple transition-colors text-sm"
            />
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-ww-text cursor-pointer">
            <input
              type="checkbox"
              name="in_stock"
              defaultChecked={product?.in_stock ?? true}
              className="w-4 h-4 rounded border-ww-border bg-ww-surface text-ww-purple focus:ring-ww-purple"
            />
            In Stock
          </label>

          <label className="flex items-center gap-2 text-sm text-ww-text cursor-pointer">
            <input
              type="checkbox"
              name="is_collection"
              defaultChecked={product?.is_collection ?? false}
              className="w-4 h-4 rounded border-ww-border bg-ww-surface text-ww-purple focus:ring-ww-purple"
            />
            Is Collection (has variants)
          </label>
        </div>
      </div>

      {/* Images */}
      <div className="bg-ww-dark border border-ww-border rounded-lg p-5 space-y-4">
        <h2 className="font-head font-semibold text-ww-white">Images</h2>

        {/* Image grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-4 gap-3">
            {images.map((url, i) => (
              <div key={i} className="relative group">
                <img
                  src={url}
                  alt={`Product ${i + 1}`}
                  className="w-full aspect-square object-cover rounded-lg bg-ww-surface"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <input type="hidden" name="image_urls" value={url} />
              </div>
            ))}
          </div>
        )}

        {/* Upload button */}
        <label className="flex items-center justify-center gap-2 w-full py-8 border-2 border-dashed border-ww-border rounded-lg cursor-pointer hover:border-ww-purple/50 transition-colors">
          {uploading ? (
            <span className="text-sm text-ww-muted">Uploading...</span>
          ) : (
            <>
              <svg className="w-5 h-5 text-ww-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
              </svg>
              <span className="text-sm text-ww-muted">
                Click to upload images
              </span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 bg-ww-purple hover:bg-ww-purple/80 disabled:opacity-50 text-white font-medium rounded-lg transition-colors text-sm"
        >
          {isPending
            ? "Saving..."
            : mode === "create"
              ? "Create Product"
              : "Save Changes"}
        </button>
        <a
          href="/admin/products"
          className="px-4 py-2.5 text-sm text-ww-muted hover:text-ww-white transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
