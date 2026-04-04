"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  getProducts,
  getCategories,
  updateProduct,
  deleteProduct,
} from "@/app/[storeId]/actions/commerce-actions";
import ImageUploader from "@/components/ImageUploader";

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

interface Product {
  id: string;
  name: string;
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
  const [editBadge, setEditBadge] = useState("");
  const [editInStock, setEditInStock] = useState(true);
  const [editStockQty, setEditStockQty] = useState(0);
  const [editLowThreshold, setEditLowThreshold] = useState(5);
  const [editImages, setEditImages] = useState<string[]>([]);

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

  function expandProduct(p: Product) {
    if (expandedId === p.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(p.id);
    setEditName(p.name);
    setEditPrice((p.price / 100).toFixed(2));
    setEditCategory(p.category || "");
    setEditDescription(p.description || "");
    setEditBadge(p.badge || "");
    setEditInStock(p.in_stock);
    setEditStockQty(p.stock_quantity);
    setEditLowThreshold(p.low_stock_threshold);
    setEditImages(p.images?.map((i) => i.url) || (p.thumbnail ? [p.thumbnail] : []));
    setMessage("");
  }

  async function handleSave(productId: string) {
    setSaving(true);
    setMessage("");
    try {
      await updateProduct(storeId, productId, {
        name: editName,
        price: Math.round(parseFloat(editPrice || "0") * 100),
        category: editCategory || null,
        description: editDescription,
        badge: editBadge || null,
        in_stock: editInStock,
        stock_quantity: editStockQty,
        low_stock_threshold: editLowThreshold,
        images: editImages.map((url) => ({ url, alt: editName })),
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
        <Link href={`/${storeId}/products/new`} className="btn btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </Link>
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
                gridTemplateColumns: "1fr 120px 100px 80px 90px 50px",
                gap: "12px",
                padding: "12px 24px",
                background: "var(--bg-grouped)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <span className="label-caps">Product</span>
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
                      gridTemplateColumns: "1fr 120px 100px 80px 90px 50px",
                      gap: "12px",
                      padding: "16px 24px",
                      alignItems: "center",
                      cursor: "pointer",
                      background: isExpanded ? "var(--bg-hover)" : "transparent",
                    }}
                  >
                    {/* Product name + thumb */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl shrink-0 overflow-hidden"
                        style={{ background: "var(--bg-grouped)", border: "1px solid var(--border)" }}
                      >
                        {p.thumbnail ? (
                          <img src={p.thumbnail} alt="" className="w-10 h-10 object-cover" />
                        ) : (
                          <div className="w-10 h-10 flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="var(--text-tertiary)" strokeWidth={1}>
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
                      {message && (
                        <div
                          className={`alert ${message === "Saved" ? "alert-success" : "alert-error"}`}
                          style={{ marginBottom: "20px", borderRadius: "var(--radius-sm)" }}
                        >
                          {message}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" style={{ marginBottom: "20px" }}>
                        <div>
                          <label>Name</label>
                          <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                        </div>
                        <div>
                          <label>Price ($)</label>
                          <input type="number" step="0.01" min="0" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
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
                          <label>Badge</label>
                          <select value={editBadge} onChange={(e) => setEditBadge(e.target.value)}>
                            <option value="">None</option>
                            <option value="NEW">New</option>
                            <option value="SOLD OUT">Sold Out</option>
                            <option value="LIMITED">Limited</option>
                            <option value="SALE">Sale</option>
                          </select>
                        </div>
                        <div>
                          <label>Stock Quantity</label>
                          <input type="number" min="0" value={editStockQty} onChange={(e) => setEditStockQty(parseInt(e.target.value) || 0)} />
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
