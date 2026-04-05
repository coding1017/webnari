"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/app/[storeId]/actions/commerce-actions";

interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  productCount: number;
}

export default function CategoriesPage() {
  const params = useParams();
  const storeId = params.storeId as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [acting, setActing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, [storeId]);

  async function load() {
    try {
      const data = await getCategories(storeId);
      setCategories(data);
    } catch {
      // empty
    }
  }

  async function handleAdd() {
    if (!newName.trim()) return;
    setAdding(true);
    setError("");
    try {
      await createCategory(storeId, { name: newName.trim() });
      setNewName("");
      setShowCreate(false);
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
    setAdding(false);
  }

  async function handleUpdate(id: string) {
    if (!editName.trim()) return;
    setActing(true);
    try {
      await updateCategory(storeId, id, { name: editName.trim(), slug: editName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") });
      setEditing(null);
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
    setActing(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete category "${name}"? Products in this category won't be deleted, but they'll lose their category.`)) return;
    setActing(true);
    try {
      await deleteCategory(storeId, id);
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
    setActing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent, action: () => void) {
    if (e.key === "Enter") action();
  }

  const totalProducts = categories.reduce((sum, c) => sum + c.productCount, 0);

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between" style={{ marginBottom: "28px" }}>
        <div>
          <h1 className="heading-lg">Categories</h1>
          <p style={{ fontSize: "14px", color: "var(--text-tertiary)", marginTop: "4px" }}>
            Organize products into browsable groups
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add Category
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: "20px", borderRadius: "var(--radius-sm)" }}>
          {error}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-5" style={{ marginBottom: "24px" }}>
        {[
          { label: "CATEGORIES", value: categories.length, accent: "#5856d6" },
          { label: "PRODUCTS ORGANIZED", value: totalProducts, accent: "#34c759" },
          { label: "AVG PER CATEGORY", value: categories.length ? Math.round(totalProducts / categories.length) : 0, accent: "#ff9500" },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white relative overflow-hidden" style={{ borderRadius: "var(--radius-lg)", padding: "20px", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-sm)" }}>
            <div className="absolute top-0 left-0 right-0" style={{ height: "3px", background: kpi.accent }} />
            <div className="label-caps" style={{ marginBottom: "8px" }}>{kpi.label}</div>
            <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="card fade-in" style={{ marginBottom: "24px" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: "20px" }}>
            <h2 className="heading-sm">New Category</h2>
            <button onClick={() => { setShowCreate(false); setNewName(""); }} style={{ color: "var(--text-tertiary)", fontSize: "13px", background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
          </div>
          <div className="flex gap-3">
            <div style={{ flex: 1 }}>
              <label>Category Name</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, handleAdd)}
                placeholder="e.g. Pouches, Bags, Accessories"
                autoFocus
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAdd}
                disabled={adding || !newName.trim()}
                className="btn btn-primary"
                style={{ fontSize: "13px" }}
              >
                {adding ? "Adding..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories table */}
      <div className="card-section">
        {categories.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th className="hide-mobile">Slug</th>
                <th className="text-center">Products</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td>
                    {editing === cat.id ? (
                      <div className="flex gap-2 items-center">
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, () => handleUpdate(cat.id))}
                          style={{ minHeight: "36px", padding: "6px 10px", maxWidth: "240px" }}
                          autoFocus
                        />
                        <button
                          onClick={() => handleUpdate(cat.id)}
                          disabled={acting}
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: "12px", minHeight: "36px" }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: "12px", minHeight: "36px" }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{cat.name}</span>
                    )}
                  </td>
                  <td className="hide-mobile" style={{ fontSize: "12px", color: "var(--text-tertiary)", fontFamily: "monospace" }}>/{cat.slug}</td>
                  <td className="text-center">
                    <span className="badge badge-blue" style={{ fontSize: "11px" }}>
                      {cat.productCount}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => { setEditing(cat.id); setEditName(cat.name); }}
                        className="text-link"
                        style={{ fontSize: "12px" }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        style={{ fontSize: "12px", fontWeight: 600, color: "var(--red)", background: "none", border: "none", cursor: "pointer" }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <svg className="mx-auto" style={{ width: "48px", height: "48px", marginBottom: "12px" }} fill="none" viewBox="0 0 24 24" stroke="var(--border-strong)" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)" }}>No categories yet</p>
            <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "4px", marginBottom: "16px" }}>Add categories above to organize your products</p>
            <button onClick={() => setShowCreate(true)} className="btn btn-primary" style={{ fontSize: "13px" }}>Add a Category</button>
          </div>
        )}
      </div>
    </div>
  );
}
