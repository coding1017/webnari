"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct, deleteProduct, getCategories } from "@/app/[storeId]/actions/commerce-actions";
import ImageUploader from "./ImageUploader";

interface Variant {
  id?: string;
  name: string;
  sku: string;
  color: string;
  size: string;
  price: string;
  stock_quantity: number;
  in_stock: boolean;
  images?: string[];
}

interface ProductFormProps {
  storeId: string;
  product?: {
    id: string;
    name: string;
    sku: string | null;
    slug: string;
    category: string;
    description: string;
    price: number;
    compare_at_price: number | null;
    badge: string;
    in_stock: boolean;
    track_inventory: boolean;
    stock_quantity: number;
    low_stock_threshold: number;
    images: { url: string; alt: string }[];
    variants: Variant[];
  };
}

// SKU auto-generation helpers
const STYLE_PRESETS = ["CROSS", "MINI", "LRG", "DISP", "SET", "CSTM"];

function categoryCode(cat: string): string {
  // Common mappings, fallback to first 3 letters
  const map: Record<string, string> = {
    pouches: "PCH", bags: "BAG", mats: "MAT", buddy: "BDY",
    shoes: "SHO", sneakers: "SNK", clothing: "CLO", accessories: "ACC",
    hats: "HAT", shirts: "SHR", pants: "PNT", jackets: "JKT",
  };
  const slug = cat.toLowerCase().replace(/[^a-z]/g, "");
  return map[slug] || slug.slice(0, 3).toUpperCase() || "GEN";
}

function buildSku(cat: string, style: string, num: string): string {
  const parts = [categoryCode(cat)];
  if (style.trim()) parts.push(style.trim().toUpperCase());
  parts.push(num.padStart(3, "0"));
  return parts.join("-");
}

export default function ProductForm({ storeId, product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!product;

  const [name, setName] = useState(product?.name || "");
  const [slug, setSlug] = useState(product?.slug || "");
  const [category, setCategory] = useState(product?.category || "");

  // SKU auto-generator state
  const existingSku = product?.sku || "";
  const [skuStyle, setSkuStyle] = useState(() => {
    if (!existingSku) return "";
    const parts = existingSku.split("-");
    return parts.length >= 3 ? parts.slice(1, -1).join("-") : "";
  });
  const [skuNumber, setSkuNumber] = useState(() => {
    if (!existingSku) return "001";
    const parts = existingSku.split("-");
    return parts[parts.length - 1] || "001";
  });
  const [skuManual, setSkuManual] = useState(existingSku);
  const [skuMode, setSkuMode] = useState<"auto" | "manual">(existingSku ? "manual" : "auto");
  const generatedSku = skuMode === "auto" ? buildSku(category, skuStyle, skuNumber) : skuManual;
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(product ? (product.price / 100).toFixed(2) : "");
  const [comparePrice, setComparePrice] = useState(product?.compare_at_price ? (product.compare_at_price / 100).toFixed(2) : "");
  const [badge, setBadge] = useState(product?.badge || "");
  const [inStock, setInStock] = useState(product?.in_stock ?? true);
  const [trackInventory, setTrackInventory] = useState(product?.track_inventory ?? true);
  const [stockQty, setStockQty] = useState(product?.stock_quantity ?? 0);
  const [lowStockThreshold, setLowStockThreshold] = useState(product?.low_stock_threshold ?? 5);
  const [imageUrls, setImageUrls] = useState<string[]>(product?.images?.map(i => i.url) || []);
  const [variants, setVariants] = useState<Variant[]>(product?.variants || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [dbCategories, setDbCategories] = useState<{ id: string; name: string; slug: string }[]>([]);

  useEffect(() => {
    getCategories(storeId).then(setDbCategories).catch(() => {});
  }, [storeId]);

  function autoSlug(val: string) {
    return val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function addVariant() {
    setVariants([...variants, { name: "", sku: "", color: "", size: "", price: "", stock_quantity: 0, in_stock: true, images: [] }]);
  }

  function updateVariant(i: number, field: keyof Variant, value: string | number | boolean) {
    const updated = [...variants];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (updated[i] as any)[field] = value;
    setVariants(updated);
  }

  function removeVariant(i: number) {
    setVariants(variants.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const data = {
      name,
      sku: generatedSku || null,
      slug: slug || autoSlug(name),
      category,
      description,
      price: Math.round(parseFloat(price || "0") * 100),
      compare_at_price: comparePrice ? Math.round(parseFloat(comparePrice) * 100) : null,
      badge: badge || null,
      in_stock: inStock,
      track_inventory: trackInventory,
      stock_quantity: stockQty,
      low_stock_threshold: lowStockThreshold,
      images: imageUrls.map(url => ({ url, alt: name })),
      variants: variants.map(v => ({
        ...v,
        price: v.price ? Math.round(parseFloat(String(v.price)) * 100) : null,
        images: (v.images || []).map(url => ({ url })),
      })),
    };

    try {
      if (isEdit) {
        await updateProduct(storeId, product.id, data);
      } else {
        await createProduct(storeId, data);
      }
      window.location.href = `/${storeId}/products`;
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await deleteProduct(storeId, product!.id);
      window.location.href = `/${storeId}/products`;
    } catch (err) {
      setError((err as Error).message);
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      {error && (
        <div className="p-3 rounded-lg text-sm" style={{ background: "#ef444420", color: "var(--red)" }}>{error}</div>
      )}

      {/* Basic Info */}
      <section className="rounded-xl p-6 space-y-4" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Basic Info</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Name</label>
            <input value={name} onChange={(e) => { setName(e.target.value); if (!isEdit) setSlug(autoSlug(e.target.value)); }} required placeholder="Product name" />
          </div>
          <div>
            <label>Slug</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-generated" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label>Price ($)</label>
            <input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="0.00" />
          </div>
          <div>
            <label>Compare at ($)</label>
            <input type="number" step="0.01" min="0" value={comparePrice} onChange={(e) => setComparePrice(e.target.value)} placeholder="Was price" />
          </div>
          <div>
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Select category</option>
              {dbCategories.map((cat) => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Product description..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Badge</label>
            <select value={badge} onChange={(e) => setBadge(e.target.value)}>
              <option value="">None</option>
              <option value="NEW">New</option>
              <option value="SOLD OUT">Sold Out</option>
              <option value="LIMITED">Limited</option>
              <option value="SALE">Sale</option>
            </select>
          </div>
          <div className="flex items-end gap-4 pb-1">
            <label className="flex items-center gap-2 cursor-pointer mb-0">
              <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="w-4 h-4" />
              <span className="text-sm">In Stock</span>
            </label>
          </div>
        </div>
      </section>

      {/* SKU Generator */}
      <section className="rounded-xl p-6 space-y-4" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>SKU</h2>
          <button
            type="button"
            onClick={() => {
              if (skuMode === "auto") {
                setSkuManual(generatedSku);
                setSkuMode("manual");
              } else {
                setSkuMode("auto");
              }
            }}
            className="text-xs font-medium"
            style={{ color: "var(--blue)" }}
          >
            {skuMode === "auto" ? "Edit manually" : "Use generator"}
          </button>
        </div>

        {skuMode === "auto" ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label>Category Code</label>
                <div className="px-3 py-2 rounded-lg text-sm font-mono" style={{ background: "var(--bg-grouped)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                  {category ? categoryCode(category) : "—"}
                </div>
                <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>Auto from category</p>
              </div>
              <div>
                <label>Style (optional)</label>
                <input
                  value={skuStyle}
                  onChange={(e) => setSkuStyle(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                  placeholder="CROSS"
                  maxLength={6}
                  style={{ textTransform: "uppercase" }}
                />
              </div>
              <div>
                <label>Number</label>
                <input
                  value={skuNumber}
                  onChange={(e) => setSkuNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
                  placeholder="001"
                  maxLength={4}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {STYLE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setSkuStyle(preset)}
                  className="px-2.5 py-1 text-xs rounded-md"
                  style={{
                    background: skuStyle === preset ? "rgba(59,130,246,0.15)" : "var(--bg-grouped)",
                    border: `1px solid ${skuStyle === preset ? "var(--blue)" : "var(--border)"}`,
                    color: skuStyle === preset ? "var(--blue)" : "var(--text-tertiary)",
                  }}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <label>SKU</label>
            <input
              value={skuManual}
              onChange={(e) => setSkuManual(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ""))}
              placeholder="PCH-CROSS-001"
              style={{ textTransform: "uppercase", fontFamily: "monospace" }}
            />
          </div>
        )}

        {/* Preview */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg" style={{ background: "var(--bg-grouped)", border: "1px solid var(--border)" }}>
          <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>Generated SKU:</span>
          <span className="text-sm font-semibold font-mono tracking-wider" style={{ color: "var(--blue)" }}>
            {generatedSku || "—"}
          </span>
        </div>
      </section>

      {/* Inventory */}
      <section className="rounded-xl p-6 space-y-4" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Inventory</h2>
          <label className="flex items-center gap-2 cursor-pointer mb-0">
            <input type="checkbox" checked={trackInventory} onChange={(e) => setTrackInventory(e.target.checked)} className="w-4 h-4" />
            <span className="text-xs">Track inventory</span>
          </label>
        </div>

        {trackInventory && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Stock Quantity</label>
              <input type="number" min="0" value={stockQty} onChange={(e) => setStockQty(parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <label>Low Stock Alert At</label>
              <input type="number" min="0" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 0)} />
            </div>
          </div>
        )}
      </section>

      {/* Images */}
      <section className="rounded-xl p-6 space-y-4" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Images</h2>
        <ImageUploader
          storeId={storeId}
          images={imageUrls}
          onChange={setImageUrls}
          folder={`products/${slug || "new"}`}
          maxImages={10}
        />
      </section>

      {/* Variants */}
      <section className="rounded-xl p-6 space-y-4" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Variants</h2>
          <button type="button" onClick={addVariant} className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{ background: "var(--bg-grouped)", color: "var(--blue)", border: "1px solid var(--border)" }}>
            + Add Variant
          </button>
        </div>

        {variants.map((v, i) => (
          <div key={i} className="p-4 rounded-lg space-y-3" style={{ background: "var(--bg-grouped)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>Variant {i + 1}</span>
              <button type="button" onClick={() => removeVariant(i)} className="text-xs" style={{ color: "var(--red)" }}>Remove</button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label>Name</label>
                <input value={v.name} onChange={(e) => updateVariant(i, "name", e.target.value)} placeholder="e.g. Red / Large" />
              </div>
              <div>
                <label>SKU</label>
                <input value={v.sku} onChange={(e) => updateVariant(i, "sku", e.target.value)} placeholder="Optional" />
              </div>
              <div>
                <label>Price ($)</label>
                <input type="number" step="0.01" value={v.price} onChange={(e) => updateVariant(i, "price", e.target.value)} placeholder="Override" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label>Color</label>
                <input value={v.color} onChange={(e) => updateVariant(i, "color", e.target.value)} placeholder="Optional" />
              </div>
              <div>
                <label>Size</label>
                <input value={v.size} onChange={(e) => updateVariant(i, "size", e.target.value)} placeholder="Optional" />
              </div>
              <div>
                <label>Stock</label>
                <input type="number" min="0" value={v.stock_quantity} onChange={(e) => updateVariant(i, "stock_quantity", parseInt(e.target.value) || 0)} />
              </div>
            </div>
            <div>
              <label>Variant Images</label>
              <ImageUploader
                storeId={storeId}
                images={v.images || []}
                onChange={(newImages) => {
                  const updated = [...variants];
                  updated[i] = { ...updated[i], images: newImages };
                  setVariants(updated);
                }}
                folder={`variants/${v.name || `variant-${i}`}`}
                maxImages={5}
              />
            </div>
          </div>
        ))}

        {variants.length === 0 && (
          <p className="text-xs text-center py-4" style={{ color: "var(--text-tertiary)" }}>No variants. Add variants for different sizes, colors, etc.</p>
        )}
      </section>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-lg text-sm font-medium text-white"
          style={{ background: saving ? "var(--text-tertiary)" : "var(--blue)" }}
        >
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Product"}
        </button>
        <button type="button" onClick={() => router.back()} className="px-6 py-2.5 rounded-lg text-sm font-medium" style={{ color: "var(--text-tertiary)" }}>
          Cancel
        </button>
        {isEdit && (
          <button type="button" onClick={handleDelete} disabled={deleting} className="ml-auto px-4 py-2.5 rounded-lg text-sm font-medium" style={{ color: "var(--red)" }}>
            {deleting ? "Deleting..." : "Delete Product"}
          </button>
        )}
      </div>
    </form>
  );
}
