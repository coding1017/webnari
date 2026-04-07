"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  getProducts,
  getProduct,
  getCategories,
  updateProduct,
  deleteProduct,
  exportProductsCSV,
  importProductsCSV,
} from "@/app/[storeId]/actions/commerce-actions";
import ImageUploader from "@/components/ImageUploader";

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

// SKU helpers (shared with ProductForm)
const STYLE_PRESETS = ["CROSS", "MINI", "LRG", "DISP", "SET", "CSTM"];
const COLOR_PRESETS = ["BLK", "WHT", "PNK", "RED", "BLU", "GRN", "TIE", "RNB", "ORG", "PRP"];
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
function categoryCode(cat: string): string {
  const map: Record<string, string> = {
    pouches: "PCH", bags: "BAG", mats: "MAT", buddy: "BDY",
    shoes: "SHO", sneakers: "SNK", clothing: "CLO", accessories: "ACC",
    hats: "HAT", shirts: "SHR", pants: "PNT", jackets: "JKT", socks: "SOX",
  };
  const slug = cat.toLowerCase().replace(/[^a-z]/g, "");
  return map[slug] || slug.slice(0, 3).toUpperCase() || "GEN";
}
function colorToCode(name: string): string {
  const key = name.toLowerCase().trim().replace(/\s+/g, "");
  return COLOR_NAME_TO_CODE[key] || name.slice(0, 3).toUpperCase();
}
function buildSku(cat: string, style: string, color: string, num: string): string {
  const parts = [categoryCode(cat)];
  if (style.trim()) parts.push(style.trim().toUpperCase());
  if (color.trim()) parts.push(color.trim().toUpperCase());
  parts.push(num.padStart(3, "0"));
  return parts.join("-");
}

interface Product {
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
  variantCount: number;
  thumbnail: string | null;
  images?: { url: string }[];
  meta_title?: string;
  meta_description?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ProductsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const storeId = params.storeId as string;
  const searchQuery = searchParams.get("search") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState(searchQuery);

  // Inline edit state
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editMetaTitle, setEditMetaTitle] = useState("");
  const [editMetaDesc, setEditMetaDesc] = useState("");
  const [editBadge, setEditBadge] = useState("");
  const [editInStock, setEditInStock] = useState(true);
  const [editStockQty, setEditStockQty] = useState(0);
  const [editLowThreshold, setEditLowThreshold] = useState(5);
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editSku, setEditSku] = useState("");
  const [editSkuStyle, setEditSkuStyle] = useState("");
  const [editSkuColor, setEditSkuColor] = useState("");
  const [editSkuNumber, setEditSkuNumber] = useState("001");
  const [editSkuMode, setEditSkuMode] = useState<"auto" | "manual">("manual");
  const editGeneratedSku = editSkuMode === "auto" ? buildSku(editCategory, editSkuStyle, editSkuColor, editSkuNumber) : editSku;
  const [editColor, setEditColor] = useState("");
  const [editComparePrice, setEditComparePrice] = useState("");
  const [editVariants, setEditVariants] = useState<{ id?: string; name: string; color: string; price: string; stock_quantity: number; in_stock: boolean; images: string[] }[]>([]);
  const [expandedVariantImg, setExpandedVariantImg] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const [prods, cats] = await Promise.all([
        getProducts(storeId, { search: search || undefined }),
        getCategories(storeId),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch {}
  }, [storeId, search]);

  useEffect(() => {
    load();
  }, [load]);

  async function expandProduct(p: Product) {
    if (expandedId === p.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(p.id);
    setEditName(p.name);
    const sku = p.sku || "";
    setEditSku(sku);
    // Parse SKU into segments for the builder
    const skuParts = sku.split("-");
    if (skuParts.length >= 4) {
      setEditSkuStyle(skuParts[1]);
      setEditSkuColor(skuParts[2]);
      setEditSkuNumber(skuParts[skuParts.length - 1]);
      setEditSkuMode("auto");
    } else if (skuParts.length === 3) {
      setEditSkuStyle("");
      setEditSkuColor(skuParts[1]);
      setEditSkuNumber(skuParts[2]);
      setEditSkuMode("auto");
    } else {
      setEditSkuStyle("");
      setEditSkuColor("");
      setEditSkuNumber("001");
      setEditSkuMode(sku ? "manual" : "auto");
    }
    setEditColor((p as any).color || "");
    setEditPrice((p.price / 100).toFixed(2));
    setEditComparePrice((p as any).compare_at_price ? ((p as any).compare_at_price / 100).toFixed(2) : "");
    setEditCategory(p.category || "");
    setEditDescription(p.description || "");
    // Auto-fill SEO from product data if not already set
    setEditMetaTitle(p.meta_title || p.name || "");
    setEditMetaDesc(p.meta_description || (p.description ? p.description.slice(0, 160) : ""));
    setEditBadge(p.badge || "");
    setEditInStock(p.in_stock);
    setEditStockQty(p.stock_quantity);
    setEditLowThreshold(p.low_stock_threshold);
    setEditImages(p.thumbnail ? [p.thumbnail] : []);
    setEditVariants([]);
    setMessage("");

    // Fetch full product detail to get all images + variants
    try {
      const full = await getProduct(storeId, p.id);
      if (full?.images?.length) {
        setEditImages(full.images.map((i: { url: string }) => i.url));
      }
      if (full?.variants?.length) {
        setEditVariants(full.variants.map((v: { id: string; name: string; sku?: string; color: string; price: number; stock_quantity: number; in_stock: boolean; images?: { url: string }[]; imgs?: string[] }) => ({
          id: v.id,
          name: v.name,
          sku: v.sku || "",
          color: v.color || "",
          price: v.price ? (v.price / 100).toFixed(2) : "",
          stock_quantity: v.stock_quantity || 0,
          in_stock: v.in_stock,
          images: v.images?.map((i: { url: string }) => i.url) || v.imgs || [],
        })));
      }
    } catch {
      // Keep whatever we have
    }
  }

  async function handleSave(productId: string) {
    setSaving(true);
    setMessage("");
    try {
      await updateProduct(storeId, productId, {
        name: editName,
        sku: editGeneratedSku || null,
        color: editColor || null,
        price: Math.round(parseFloat(editPrice || "0") * 100),
        compare_at_price: editComparePrice ? Math.round(parseFloat(editComparePrice) * 100) : null,
        category: editCategory || null,
        description: editDescription,
        meta_title: editMetaTitle || null,
        meta_description: editMetaDesc || null,
        badge: editBadge || null,
        in_stock: editInStock,
        stock_quantity: editStockQty,
        low_stock_threshold: editLowThreshold,
        images: editImages.map((url) => ({ url, alt: editName })),
        variants: editVariants.map((v) => ({
          name: v.name,
          sku: (v as any).sku || null,
          color: v.color || null,
          price: v.price ? Math.round(parseFloat(v.price) * 100) : null,
          stock_quantity: v.stock_quantity,
          in_stock: v.in_stock,
          images: (v.images || []).map((url) => ({ url })),
        })),
      });
      setMessage("Saved");
      setTimeout(() => setMessage(""), 2000);
      await load();
    } catch (err) {
      setMessage((err as Error).message);
    }
    setSaving(false);
  }

  async function handleDelete(productId: string, productName: string) {
    if (!confirm(`Delete "${productName}"? This cannot be undone.`)) return;
    setDeleting(productId);
    try {
      await deleteProduct(storeId, productId);
      setExpandedId(null);
      await load();
    } catch (err) {
      setMessage((err as Error).message);
    }
    setDeleting(null);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    load();
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: "28px" }}>
        <div>
          <h1 className="heading-lg">Products</h1>
          <p style={{ fontSize: "14px", color: "var(--text-tertiary)", marginTop: "4px" }}>
            Click any product to edit inline
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={async () => {
              try {
                const csv = await exportProductsCSV(storeId);
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${storeId}-products.csv`;
                a.click();
                URL.revokeObjectURL(url);
              } catch {}
            }}
            className="btn btn-secondary"
            style={{ fontSize: "12px" }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
          <label
            className="btn btn-secondary"
            style={{ fontSize: "12px", cursor: "pointer" }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import CSV
            <input
              type="file"
              accept=".csv"
              style={{ display: "none" }}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const text = await file.text();
                const lines = text.split("\n").filter(Boolean);
                if (lines.length < 2) { setMessage("CSV file is empty"); return; }
                const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
                const rows = lines.slice(1).map(line => {
                  const values = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
                  const row: Record<string, string> = {};
                  headers.forEach((h, i) => { row[h] = values[i] || ""; });
                  return row;
                });
                try {
                  const result = await importProductsCSV(storeId, rows);
                  setMessage(`Imported: ${result.created} created, ${result.updated} updated${result.errors?.length ? `, ${result.errors.length} errors` : ""}`);
                  await load();
                } catch (err) {
                  setMessage((err as Error).message);
                }
                e.target.value = "";
              }}
            />
          </label>
          <Link href={`/${storeId}/products/new`} className="btn btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </Link>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 flex-wrap" style={{ marginBottom: "24px" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          style={{ maxWidth: "320px" }}
        />
        <button type="submit" className="btn btn-secondary" style={{ fontSize: "13px" }}>
          Search
        </button>
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setTimeout(load, 0);
            }}
            className="btn btn-ghost"
            style={{ fontSize: "13px" }}
          >
            Clear
          </button>
        )}
      </form>

      {/* Products */}
      <div className="card-section">
        {products.length > 0 ? (
          <div>
            {/* Table header */}
            <div
              className="hide-mobile"
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 110px 90px 80px 60px 70px 40px",
                gap: "8px",
                padding: "10px 20px",
                background: "var(--bg-grouped)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <span className="label-caps">Product</span>
              <span className="label-caps">SKU</span>
              <span className="label-caps">Category</span>
              <span className="label-caps text-right">Price</span>
              <span className="label-caps text-center">Stock</span>
              <span className="label-caps text-center">Status</span>
              <span></span>
            </div>

            {products.map((p) => {
              const isExpanded = expandedId === p.id;
              return (
                <div key={p.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  {/* Row */}
                  <div
                    onClick={() => expandProduct(p)}
                    className="transition-all"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 110px 90px 80px 60px 70px 40px",
                      gap: "8px",
                      padding: "10px 20px",
                      alignItems: "center",
                      cursor: "pointer",
                      background: isExpanded ? "var(--bg-hover)" : "transparent",
                    }}
                  >
                    {/* Product name + thumb */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg shrink-0 overflow-hidden"
                        style={{ background: "var(--bg-grouped)", border: "1px solid var(--border)" }}
                      >
                        {p.thumbnail ? (
                          <img src={p.thumbnail} alt="" className="w-8 h-8 object-cover" />
                        ) : (
                          <div className="w-8 h-8 flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="var(--text-tertiary)" strokeWidth={1}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{p.name}</span>
                        {p.variantCount > 0 && (
                          <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                            {p.variantCount} variant{p.variantCount !== 1 ? "s" : ""}
                          </div>
                        )}
                      </div>
                    </div>

                    <span className="hide-mobile" style={{ fontSize: "12px", fontFamily: "monospace", letterSpacing: "0.05em", color: p.sku ? "var(--blue)" : "var(--text-tertiary)" }}>
                      {p.sku || "—"}
                    </span>

                    <span className="capitalize hide-mobile" style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                      {p.category || "—"}
                    </span>

                    <span className="text-right" style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                      {formatCents(p.price)}
                    </span>

                    <span className="text-center hide-mobile" style={{ fontSize: "13px", color: p.stock_quantity <= 5 ? "var(--orange)" : "var(--text-secondary)" }}>
                      {p.stock_quantity}
                    </span>

                    <span className="text-center hide-mobile">
                      <span className={`badge ${p.in_stock ? "badge-green" : "badge-red"}`}>
                        {p.in_stock ? "In Stock" : "Out"}
                      </span>
                    </span>

                    <span className="text-right">
                      <svg
                        className="inline-block transition-transform"
                        style={{
                          width: "16px",
                          height: "16px",
                          color: "var(--text-tertiary)",
                          transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </div>

                  {/* Expanded inline edit panel */}
                  {isExpanded && (
                    <div
                      className="fade-in"
                      style={{
                        padding: "24px",
                        background: "var(--bg-grouped)",
                        borderTop: "1px solid var(--border)",
                      }}
                    >
                      {/* Row 1: Name, Category, Color */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" style={{ marginBottom: "16px" }}>
                        <div>
                          <label>Name</label>
                          <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                        </div>
                        <div>
                          <label>Category</label>
                          <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
                            <option value="">None</option>
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.slug}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label>Color</label>
                          <input value={editColor} onChange={(e) => { setEditColor(e.target.value); if (editSkuMode === "auto" && e.target.value.trim()) { setEditSkuColor(colorToCode(e.target.value)); } }} placeholder="e.g. Tie-Dye, Pink" />
                        </div>
                      </div>

                      {/* Row 2: SKU, Price, Badge */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" style={{ marginBottom: "0" }}>
                        <div>
                          <label>SKU {editSkuMode === "auto" && <span style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--blue)", marginLeft: "6px", letterSpacing: "0.05em" }}>{editGeneratedSku}</span>}</label>
                          {editSkuMode === "auto" ? (
                            <div className="grid grid-cols-3 gap-2">
                              <input value={editSkuStyle} onChange={(e) => setEditSkuStyle(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} placeholder="Style" maxLength={5} style={{ fontFamily: "monospace", fontWeight: 600, textTransform: "uppercase", fontSize: "12px" }} />
                              <input value={editSkuColor} onChange={(e) => { const v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""); setEditSkuColor(v); const n = COLOR_CODE_TO_NAME[v]; if (n) setEditColor(n); }} placeholder="Color" maxLength={4} style={{ fontFamily: "monospace", fontWeight: 600, textTransform: "uppercase", fontSize: "12px" }} />
                              <div className="flex gap-1">
                                <input value={editSkuNumber} onChange={(e) => setEditSkuNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))} placeholder="001" maxLength={4} style={{ fontFamily: "monospace", fontWeight: 600, fontSize: "12px", flex: 1 }} />
                                <button type="button" onClick={() => { setEditSku(editGeneratedSku); setEditSkuMode("manual"); }} className="px-1.5 shrink-0" style={{ color: "var(--blue)" }} title="Edit manually">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <input value={editSku} onChange={(e) => setEditSku(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ""))} placeholder="PCH-CROSS-TIE-001" style={{ fontFamily: "monospace", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", flex: 1 }} />
                              <button type="button" onClick={() => setEditSkuMode("auto")} className="px-1.5 shrink-0" style={{ color: "var(--blue)" }} title="Use auto-generator">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" /></svg>
                              </button>
                            </div>
                          )}
                        </div>
                        <div>
                          <label>Price ($)</label>
                          <input type="number" step="0.01" min="0" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
                        </div>
                        <div>
                          <label>Badge</label>
                          <select value={editBadge} onChange={(e) => setEditBadge(e.target.value)}>
                            <option value="">None</option>
                            <option value="NEW">New</option>
                            <option value="SOLD OUT">Sold Out</option>
                            <option value="LIMITED">Limited</option>
                            <option value="SALE">Sale</option>
                          </select>
                        </div>
                      </div>

                      {/* Quick-pick chips (right under SKU) */}
                      {editSkuMode === "auto" && (
                        <div style={{ marginBottom: "16px", marginTop: "8px", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                          <span className="text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>Style:</span>
                          {STYLE_PRESETS.map((p) => (
                            <button key={p} type="button" onClick={() => setEditSkuStyle(editSkuStyle === p ? "" : p)}
                              className="px-2 py-0.5 text-xs font-mono rounded"
                              style={{ background: editSkuStyle === p ? "rgba(59,130,246,0.12)" : "transparent", border: `1px solid ${editSkuStyle === p ? "var(--blue)" : "var(--border)"}`, color: editSkuStyle === p ? "var(--blue)" : "var(--text-tertiary)" }}
                            >{p}</button>
                          ))}
                          <span className="text-xs font-medium" style={{ color: "var(--text-tertiary)", marginLeft: "4px" }}>Color:</span>
                          {COLOR_PRESETS.map((c) => (
                            <button key={c} type="button" onClick={() => { const nv = editSkuColor === c ? "" : c; setEditSkuColor(nv); const n = COLOR_CODE_TO_NAME[nv]; if (n) setEditColor(n); else if (!nv) setEditColor(""); }}
                              className="px-2 py-0.5 text-xs font-mono rounded"
                              style={{ background: editSkuColor === c ? "rgba(59,130,246,0.12)" : "transparent", border: `1px solid ${editSkuColor === c ? "var(--blue)" : "var(--border)"}`, color: editSkuColor === c ? "var(--blue)" : "var(--text-tertiary)" }}
                            >{c}</button>
                          ))}
                        </div>
                      )}

                      {/* Row 3: Stock, Compare, Low Stock */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" style={{ marginBottom: "20px" }}>
                        <div>
                          <label>Stock Quantity</label>
                          <input type="number" min="0" value={editStockQty} onChange={(e) => setEditStockQty(parseInt(e.target.value) || 0)} />
                        </div>
                        <div>
                          <label>Compare at ($)</label>
                          <input type="number" step="0.01" min="0" value={editComparePrice} onChange={(e) => setEditComparePrice(e.target.value)} placeholder="Was price" />
                        </div>
                        <div>
                          <label>Low Stock Alert</label>
                          <input type="number" min="0" value={editLowThreshold} onChange={(e) => setEditLowThreshold(parseInt(e.target.value) || 0)} />
                        </div>
                      </div>

                      <div style={{ marginBottom: "20px" }}>
                        <label>Description</label>
                        <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} />
                      </div>

                      <div className="flex items-center gap-6" style={{ marginBottom: "20px" }}>
                        <label className="flex items-center gap-2 cursor-pointer" style={{ marginBottom: 0 }}>
                          <input type="checkbox" checked={editInStock} onChange={(e) => setEditInStock(e.target.checked)} />
                          <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)" }}>In Stock</span>
                        </label>
                      </div>

                      {/* SEO */}
                      <div style={{ padding: "16px", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", marginBottom: "20px" }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                          <svg style={{ width: "14px", height: "14px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                          SEO
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <label style={{ fontSize: "11px" }}>Meta Title <span style={{ color: "var(--text-tertiary)", fontWeight: 400 }}>(50-60 chars)</span></label>
                            <input value={editMetaTitle} onChange={(e) => setEditMetaTitle(e.target.value)} placeholder={editName || "Product name"} maxLength={70} />
                            <div style={{ fontSize: "10px", color: editMetaTitle.length > 60 ? "var(--red)" : "var(--text-tertiary)", marginTop: "2px" }}>{editMetaTitle.length}/60</div>
                          </div>
                          <div>
                            <label style={{ fontSize: "11px" }}>Meta Description <span style={{ color: "var(--text-tertiary)", fontWeight: 400 }}>(140-160 chars)</span></label>
                            <textarea value={editMetaDesc} onChange={(e) => setEditMetaDesc(e.target.value)} rows={2} placeholder="Brief description for search results..." maxLength={170} style={{ minHeight: "60px" }} />
                            <div style={{ fontSize: "10px", color: editMetaDesc.length > 160 ? "var(--red)" : "var(--text-tertiary)", marginTop: "2px" }}>{editMetaDesc.length}/160</div>
                          </div>
                        </div>
                      </div>

                      <div style={{ marginBottom: "20px" }}>
                        <label>Images</label>
                        <ImageUploader
                          storeId={storeId}
                          images={editImages}
                          onChange={setEditImages}
                          folder={`products/${p.slug || p.id}`}
                          maxImages={10}
                        />
                      </div>

                      {/* Variants */}
                      <div style={{ marginBottom: "20px" }}>
                        <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
                          <label style={{ marginBottom: 0, fontSize: "14px", fontWeight: 600 }}>Variants</label>
                          <button
                            type="button"
                            onClick={() => setEditVariants([...editVariants, { name: "", sku: "", color: "", price: "", stock_quantity: 0, in_stock: true, images: [] } as any])}
                            style={{
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "var(--blue)",
                              background: "var(--bg-elevated)",
                              border: "1px solid var(--border)",
                              borderRadius: "var(--radius-sm)",
                              padding: "6px 12px",
                              cursor: "pointer",
                            }}
                          >
                            + Add Variant
                          </button>
                        </div>

                        {editVariants.length > 0 ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {editVariants.map((v, vi) => (
                              <div key={vi} className="p-4 rounded-lg space-y-3" style={{ background: "rgba(0,0,0,0.02)", border: "1px solid var(--border)" }}>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>Variant {vi + 1}</span>
                                  <button type="button" onClick={() => setEditVariants(editVariants.filter((_, i) => i !== vi))} className="text-xs" style={{ color: "var(--red)" }}>Remove</button>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                  <div><label>Name</label><input value={v.name} onChange={(e) => { const u = [...editVariants]; u[vi] = { ...u[vi], name: e.target.value }; setEditVariants(u); }} placeholder="e.g. Red / Large" /></div>
                                  <div><label>SKU</label><input value={(v as any).sku || ""} onChange={(e) => { const u = [...editVariants]; u[vi] = { ...u[vi], sku: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "") } as any; setEditVariants(u); }} placeholder="Auto-generated" style={{ fontFamily: "monospace", textTransform: "uppercase" }} /></div>
                                  <div><label>Price ($)</label><input type="number" step="0.01" value={v.price} onChange={(e) => { const u = [...editVariants]; u[vi] = { ...u[vi], price: e.target.value }; setEditVariants(u); }} placeholder="Override" /></div>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                  <div><label>Color</label><input value={v.color} onChange={(e) => { const u = [...editVariants]; u[vi] = { ...u[vi], color: e.target.value }; setEditVariants(u); }} placeholder="Optional" /></div>
                                  <div><label>Size</label><input value={(v as any).size || ""} onChange={(e) => { const u = [...editVariants]; u[vi] = { ...u[vi], size: e.target.value } as any; setEditVariants(u); }} placeholder="Optional" /></div>
                                  <div><label>Stock</label><input type="number" min="0" value={v.stock_quantity} onChange={(e) => { const u = [...editVariants]; u[vi] = { ...u[vi], stock_quantity: parseInt(e.target.value) || 0 }; setEditVariants(u); }} /></div>
                                </div>
                                <div>
                                  <label>Variant Images</label>
                                  <ImageUploader storeId={storeId} images={v.images || []} onChange={(newImages) => { const u = [...editVariants]; u[vi] = { ...u[vi], images: newImages }; setEditVariants(u); }} folder={`variants/${p.slug || p.id}/${v.name || `v${vi}`}`} maxImages={5} />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-center py-3" style={{ color: "var(--text-tertiary)" }}>No variants yet</p>
                        )}
                      </div>

                      {/* Actions + message */}
                      {message && (
                        <div
                          className={`alert ${message === "Saved" ? "alert-success" : "alert-error"}`}
                          style={{ marginBottom: "12px", borderRadius: "var(--radius-sm)" }}
                        >
                          {message}
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleSave(p.id)}
                          disabled={saving}
                          className="btn btn-primary"
                          style={{ fontSize: "13px" }}
                        >
                          {saving ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          onClick={() => setExpandedId(null)}
                          className="btn btn-secondary"
                          style={{ fontSize: "13px" }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          disabled={deleting === p.id}
                          className="btn btn-danger"
                          style={{ fontSize: "13px", marginLeft: "auto" }}
                        >
                          {deleting === p.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <svg className="mx-auto" style={{ width: "48px", height: "48px", marginBottom: "12px" }} fill="none" viewBox="0 0 24 24" stroke="var(--border-strong)" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "4px" }}>No products yet</p>
            <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginBottom: "16px" }}>Add your first product to get started</p>
            <Link href={`/${storeId}/products/new`} className="btn btn-primary" style={{ fontSize: "13px" }}>
              Add Product
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
