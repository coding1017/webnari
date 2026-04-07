"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct, deleteProduct, getCategories } from "@/app/[storeId]/actions/commerce-actions";
import type { ScanResult } from "@/app/[storeId]/actions/commerce-actions";
import ImageUploader from "./ImageUploader";
import ProductScanner from "./ProductScanner";
import { supabase } from "@/lib/supabase";

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

// SKU auto-generation helpers — format: CATEGORY-STYLE-COLOR-NUMBER
const STYLE_PRESETS = ["CROSS", "MINI", "LRG", "DISP", "SET", "CSTM"];
const COLOR_PRESETS = ["BLK", "WHT", "PNK", "RED", "BLU", "GRN", "TIE", "RNB", "ORG", "PRP"];

// Bi-directional color name ↔ code mapping
const COLOR_NAME_TO_CODE: Record<string, string> = {
  black: "BLK", white: "WHT", pink: "PNK", red: "RED", blue: "BLU",
  green: "GRN", "tie-dye": "TIE", tiedye: "TIE", rainbow: "RNB",
  orange: "ORG", purple: "PRP", yellow: "YLW", brown: "BRN",
  gray: "GRY", grey: "GRY", gold: "GLD", silver: "SLV",
  teal: "TEL", coral: "CRL", maroon: "MRN", navy: "NVY",
};
const COLOR_CODE_TO_NAME: Record<string, string> = {
  BLK: "Black", WHT: "White", PNK: "Pink", RED: "Red", BLU: "Blue",
  GRN: "Green", TIE: "Tie-Dye", RNB: "Rainbow", ORG: "Orange", PRP: "Purple",
  YLW: "Yellow", BRN: "Brown", GRY: "Gray", GLD: "Gold", SLV: "Silver",
  TEL: "Teal", CRL: "Coral", MRN: "Maroon", NVY: "Navy",
};

function colorToCode(name: string): string {
  const key = name.toLowerCase().trim().replace(/\s+/g, "");
  return COLOR_NAME_TO_CODE[key] || name.slice(0, 3).toUpperCase();
}

function codeToColorName(code: string): string {
  return COLOR_CODE_TO_NAME[code.toUpperCase()] || "";
}

function categoryCode(cat: string): string {
  const map: Record<string, string> = {
    pouches: "PCH", bags: "BAG", mats: "MAT", buddy: "BDY",
    shoes: "SHO", sneakers: "SNK", clothing: "CLO", accessories: "ACC",
    hats: "HAT", shirts: "SHR", pants: "PNT", jackets: "JKT",
    socks: "SOX",
  };
  const slug = cat.toLowerCase().replace(/[^a-z]/g, "");
  return map[slug] || slug.slice(0, 3).toUpperCase() || "GEN";
}

function buildSku(cat: string, style: string, color: string, num: string): string {
  const parts = [categoryCode(cat)];
  if (style.trim()) parts.push(style.trim().toUpperCase());
  if (color.trim()) parts.push(color.trim().toUpperCase());
  parts.push(num.padStart(3, "0"));
  return parts.join("-");
}

export default function ProductForm({ storeId, product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!product;

  const [name, setName] = useState(product?.name || "");
  const [slug, setSlug] = useState(product?.slug || "");
  const [category, setCategory] = useState(product?.category || "");

  // SKU auto-generator state — format: CATEGORY-STYLE-COLOR-NUMBER
  const existingSku = product?.sku || "";
  const [skuStyle, setSkuStyle] = useState(() => {
    if (!existingSku) return "";
    const parts = existingSku.split("-");
    if (parts.length >= 4) return parts[1];
    return "";
  });
  const [skuColor, setSkuColor] = useState(() => {
    if (!existingSku) return "";
    const parts = existingSku.split("-");
    if (parts.length >= 4) return parts[2];
    if (parts.length === 3) return parts[1];
    return "";
  });
  const [skuNumber, setSkuNumber] = useState(() => {
    if (!existingSku) return "001";
    const parts = existingSku.split("-");
    return parts[parts.length - 1] || "001";
  });
  const [skuManual, setSkuManual] = useState(existingSku);
  const [skuMode, setSkuMode] = useState<"auto" | "manual">(existingSku ? "manual" : "auto");
  const generatedSku = skuMode === "auto" ? buildSku(category, skuStyle, skuColor, skuNumber) : skuManual;
  const [color, setColor] = useState((product as any)?.color || "");

  // Sync: Color field → SKU color code
  function handleColorChange(val: string) {
    setColor(val);
    if (skuMode === "auto" && val.trim()) {
      setSkuColor(colorToCode(val));
    }
  }

  // Sync: SKU color code → Color field
  function handleSkuColorChange(val: string) {
    const cleaned = val.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setSkuColor(cleaned);
    const name = codeToColorName(cleaned);
    if (name) setColor(name);
  }

  // Generate variant SKU from parent SKU
  function generateVariantSku(variantColor: string, variantIndex: number): string {
    const baseParts = generatedSku.split("-");
    // Remove the number (last part)
    const baseWithoutNum = baseParts.slice(0, -1);
    // Replace color segment if variant has different color
    const variantColorCode = variantColor ? colorToCode(variantColor) : skuColor;

    // Count how many variants share this same color
    const sameColorBefore = variants.slice(0, variantIndex).filter(v => {
      const vc = v.color ? colorToCode(v.color) : skuColor;
      return vc === variantColorCode;
    }).length;

    // If color differs from parent, number resets to 001 for that color
    const parentColorCode = skuColor;
    let num: string;
    if (variantColorCode !== parentColorCode) {
      num = String(sameColorBefore + 1).padStart(3, "0");
    } else {
      // Same color as parent — continue from parent number
      const parentNum = parseInt(skuNumber) || 1;
      num = String(parentNum + sameColorBefore + 1).padStart(3, "0");
    }

    // Build: CAT-STYLE-VARIANTCOLOR-NUM
    const parts = [categoryCode(category)];
    if (skuStyle) parts.push(skuStyle);
    if (variantColorCode) parts.push(variantColorCode);
    parts.push(num);
    return parts.join("-");
  }
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
  const [expandedVariantImg, setExpandedVariantImg] = useState<number | null>(null);
  const [dbCategories, setDbCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    getCategories(storeId).then(setDbCategories).catch(() => {});
  }, [storeId]);

  async function handleScanApply(result: ScanResult, imageFile: File) {
    if (result.name) { setName(result.name); if (!isEdit) setSlug(autoSlug(result.name)); }
    if (result.description) {
      const desc = result.material
        ? `${result.description} Material: ${result.material}.`
        : result.description;
      setDescription(desc);
    }
    if (result.category) setCategory(result.category);
    if (result.color) handleColorChange(result.color);
    if (result.suggestedPrice) setPrice(result.suggestedPrice);
    if (result.badge) setBadge(result.badge);
    if (result.dimensions) {
      const dims = [result.dimensions.width, result.dimensions.height, result.dimensions.depth].filter(Boolean).join(" x ");
      if (dims && result.description) {
        setDescription(prev => prev ? `${prev}\nDimensions: ${dims}` : `Dimensions: ${dims}`);
      }
    }

    // Upload the scanned image to Supabase as the first product image
    const currentSlug = slug || autoSlug(result.name || "product");
    const ext = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${storeId}/products/${currentSlug}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, imageFile, { contentType: imageFile.type, upsert: false });
    if (!uploadError) {
      const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
      if (data?.publicUrl) setImageUrls(prev => [data.publicUrl, ...prev]);
    }

    setShowScanner(false);
  }

  function autoSlug(val: string) {
    return val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function addVariant() {
    const newIndex = variants.length;
    const newVariant: Variant = { name: "", sku: "", color: "", size: "", price: "", stock_quantity: 0, in_stock: true, images: [] };
    const updated = [...variants, newVariant];
    // Auto-generate SKU: inherit parent, increment number
    const parentNum = parseInt(skuNumber) || 1;
    const num = String(parentNum + newIndex + 1).padStart(3, "0");
    const parts = [categoryCode(category)];
    if (skuStyle) parts.push(skuStyle);
    if (skuColor) parts.push(skuColor);
    parts.push(num);
    newVariant.sku = parts.join("-");
    setVariants(updated);
  }

  function updateVariant(i: number, field: keyof Variant, value: string | number | boolean) {
    const updated = [...variants];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (updated[i] as any)[field] = value;

    // If color changed on variant, regenerate its SKU with new color + reset number for that color
    if (field === "color" && typeof value === "string" && skuMode === "auto") {
      const variantColorCode = value ? colorToCode(value) : skuColor;
      // Count variants with same color before this one
      const sameColorBefore = updated.slice(0, i).filter(v => {
        const vc = v.color ? colorToCode(v.color) : skuColor;
        return vc === variantColorCode;
      }).length;
      const parentColorCode = skuColor;
      let num: string;
      if (variantColorCode !== parentColorCode) {
        num = String(sameColorBefore + 1).padStart(3, "0");
      } else {
        const parentNum = parseInt(skuNumber) || 1;
        num = String(parentNum + sameColorBefore + 1).padStart(3, "0");
      }
      const parts = [categoryCode(category)];
      if (variantColorCode) parts.push(variantColorCode);
      parts.push(num);
      updated[i].sku = parts.join("-");
    }

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
      color: color || null,
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
    <form onSubmit={handleSubmit} className="max-w-3xl">
      {error && (
        <div className="p-3 rounded-lg text-sm" style={{ background: "#ef444420", color: "var(--red)", marginBottom: "20px" }}>{error}</div>
      )}

      {/* Snap & Catalog Scanner */}
      {showScanner ? (
        <ProductScanner
          storeId={storeId}
          categories={dbCategories}
          onApply={handleScanApply}
          onCancel={() => setShowScanner(false)}
        />
      ) : !isEdit && (
        <button
          type="button"
          onClick={() => setShowScanner(true)}
          className="flex items-center justify-center gap-2 w-full text-sm font-semibold"
          style={{
            padding: "14px 20px",
            marginBottom: 16,
            borderRadius: 10,
            border: "1.5px dashed var(--border)",
            background: "linear-gradient(135deg, rgba(59,130,246,0.04), rgba(139,92,246,0.04))",
            color: "var(--blue)",
            cursor: "pointer",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          Snap & Catalog — AI Product Scanner
        </button>
      )}

      <div className="rounded-xl" style={{ background: "var(--bg-grouped)", border: "1px solid var(--border)", overflow: "hidden" }}>

        {/* Row 1: Name, Category, Color */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" style={{ padding: "24px 24px 16px" }}>
          <div>
            <label>Name</label>
            <input value={name} onChange={(e) => { setName(e.target.value); if (!isEdit) setSlug(autoSlug(e.target.value)); }} required placeholder="Product name" />
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
          <div>
            <label>Color</label>
            <input value={color} onChange={(e) => handleColorChange(e.target.value)} placeholder="e.g. Tie-Dye, Pink" />
          </div>
        </div>

        {/* Row 2: SKU */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" style={{ padding: "0 24px 0" }}>
          <div>
            <label>SKU {skuMode === "auto" && <span style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--blue)", marginLeft: "6px", letterSpacing: "0.05em" }}>{generatedSku}</span>}</label>
            {skuMode === "auto" ? (
              <div className="grid grid-cols-3 gap-2">
                <input value={skuStyle} onChange={(e) => setSkuStyle(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} placeholder="Style" maxLength={5} style={{ fontFamily: "monospace", fontWeight: 600, textTransform: "uppercase", fontSize: "12px" }} />
                <input value={skuColor} onChange={(e) => handleSkuColorChange(e.target.value)} placeholder="Color" maxLength={4} style={{ fontFamily: "monospace", fontWeight: 600, textTransform: "uppercase", fontSize: "12px" }} />
                <div className="flex gap-1">
                  <input value={skuNumber} onChange={(e) => setSkuNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))} placeholder="001" maxLength={4} style={{ fontFamily: "monospace", fontWeight: 600, fontSize: "12px", flex: 1 }} />
                  <button type="button" onClick={() => { setSkuManual(generatedSku); setSkuMode("manual"); }} className="px-1.5 shrink-0" style={{ color: "var(--blue)" }} title="Edit manually">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <input value={skuManual} onChange={(e) => setSkuManual(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ""))} placeholder="PCH-CROSS-TIE-001" style={{ fontFamily: "monospace", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", flex: 1 }} />
                <button type="button" onClick={() => setSkuMode("auto")} className="px-1.5 shrink-0" style={{ color: "var(--blue)" }} title="Use auto-generator">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" /></svg>
                </button>
              </div>
            )}
          </div>
          <div>
            <label>Price ($)</label>
            <input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="0.00" />
          </div>
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
        </div>

        {/* Quick-pick chips (right under SKU) */}
        {skuMode === "auto" && (
          <div style={{ padding: "8px 24px 16px", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <span className="text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>Style:</span>
            {STYLE_PRESETS.map((p) => (
              <button key={p} type="button" onClick={() => setSkuStyle(skuStyle === p ? "" : p)}
                className="px-2 py-0.5 text-xs font-mono rounded"
                style={{ background: skuStyle === p ? "rgba(59,130,246,0.12)" : "transparent", border: `1px solid ${skuStyle === p ? "var(--blue)" : "var(--border)"}`, color: skuStyle === p ? "var(--blue)" : "var(--text-tertiary)" }}
              >{p}</button>
            ))}
            <span className="text-xs font-medium" style={{ color: "var(--text-tertiary)", marginLeft: "4px" }}>Color:</span>
            {COLOR_PRESETS.map((c) => (
              <button key={c} type="button" onClick={() => { const newVal = skuColor === c ? "" : c; setSkuColor(newVal); const n = codeToColorName(newVal); if (n) setColor(n); else if (!newVal) setColor(""); }}
                className="px-2 py-0.5 text-xs font-mono rounded"
                style={{ background: skuColor === c ? "rgba(59,130,246,0.12)" : "transparent", border: `1px solid ${skuColor === c ? "var(--blue)" : "var(--border)"}`, color: skuColor === c ? "var(--blue)" : "var(--text-tertiary)" }}
              >{c}</button>
            ))}
          </div>
        )}

        {/* Row 3: Stock, Compare, Low Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" style={{ padding: "0 24px 24px", borderBottom: "1px solid var(--border)" }}>
          <div>
            <label>Stock Quantity</label>
            <input type="number" min="0" value={stockQty} onChange={(e) => setStockQty(parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <label>Compare at ($)</label>
            <input type="number" step="0.01" min="0" value={comparePrice} onChange={(e) => setComparePrice(e.target.value)} placeholder="Was price" />
          </div>
          <div>
            <label>Low Stock Alert</label>
            <input type="number" min="0" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 0)} />
          </div>
        </div>

        {/* Description */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Product description..." />
        </div>

        {/* In Stock */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)" }}>
          <label className="flex items-center gap-2 cursor-pointer" style={{ marginBottom: 0 }}>
            <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
            <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)" }}>In Stock</span>
          </label>
        </div>

        {/* Images */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
          <label style={{ marginBottom: "8px", display: "block" }}>Images</label>
          <ImageUploader
            storeId={storeId}
            images={imageUrls}
            onChange={setImageUrls}
            folder={`products/${slug || "new"}`}
            maxImages={10}
          />
        </div>

        {/* Variants */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: "12px" }}>
            <label style={{ marginBottom: 0, fontSize: "14px", fontWeight: 600 }}>Variants</label>
            <button
              type="button"
              onClick={addVariant}
              style={{ fontSize: "12px", fontWeight: 600, color: "var(--blue)", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "6px 12px", cursor: "pointer" }}
            >
              + Add Variant
            </button>
          </div>

          {variants.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {variants.map((v, i) => (
                <div key={i} className="p-4 rounded-lg space-y-3" style={{ background: "rgba(0,0,0,0.02)", border: "1px solid var(--border)" }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>Variant {i + 1}</span>
                    <button type="button" onClick={() => removeVariant(i)} className="text-xs" style={{ color: "var(--red)" }}>Remove</button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div><label>Name</label><input value={v.name} onChange={(e) => updateVariant(i, "name", e.target.value)} placeholder="e.g. Red / Large" /></div>
                    <div><label>SKU</label><input value={v.sku} onChange={(e) => updateVariant(i, "sku", e.target.value)} placeholder="Auto-generated" style={{ fontFamily: "monospace", textTransform: "uppercase" }} /></div>
                    <div><label>Price ($)</label><input type="number" step="0.01" value={v.price} onChange={(e) => updateVariant(i, "price", e.target.value)} placeholder="Override" /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div><label>Color</label><input value={v.color} onChange={(e) => updateVariant(i, "color", e.target.value)} placeholder="Optional" /></div>
                    <div><label>Size</label><input value={v.size} onChange={(e) => updateVariant(i, "size", e.target.value)} placeholder="Optional" /></div>
                    <div><label>Stock</label><input type="number" min="0" value={v.stock_quantity} onChange={(e) => updateVariant(i, "stock_quantity", parseInt(e.target.value) || 0)} /></div>
                  </div>
                  <div>
                    <label>Variant Images</label>
                    <ImageUploader storeId={storeId} images={v.images || []} onChange={(newImages) => { const updated = [...variants]; updated[i] = { ...updated[i], images: newImages }; setVariants(updated); }} folder={`variants/${v.name || `variant-${i}`}`} maxImages={5} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-center py-3" style={{ color: "var(--text-tertiary)" }}>No variants yet</p>
          )}
        </div>

        {/* Actions — inside panel */}
        <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            type="submit"
            disabled={saving}
            className="text-sm font-semibold text-white"
            style={{ background: saving ? "var(--text-tertiary)" : "var(--blue)", padding: "12px 32px", borderRadius: "var(--radius-sm)", flex: isEdit ? undefined : 1 }}
          >
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Product"}
          </button>
          <button type="button" onClick={() => router.back()} className="text-sm font-medium" style={{ color: "var(--text-tertiary)", padding: "12px 16px" }}>
            Cancel
          </button>
          {isEdit && (
            <button type="button" onClick={handleDelete} disabled={deleting} className="ml-auto text-sm font-medium" style={{ color: "var(--red)", padding: "12px 16px" }}>
              {deleting ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
