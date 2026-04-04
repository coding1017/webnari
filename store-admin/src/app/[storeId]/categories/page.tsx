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

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-8" style={{ color: "var(--text-primary)" }}>Categories</h1>

      {error && (
        <div className="p-3 rounded-lg text-sm mb-4" style={{ background: "#ef444420", color: "var(--red)" }}>
          {error}
        </div>
      )}

      {/* Add new category */}
      <div className="flex gap-3 mb-6">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, handleAdd)}
          placeholder="New category name..."
          className="flex-1"
        />
        <button
          onClick={handleAdd}
          disabled={adding || !newName.trim()}
          className="px-5 py-2.5 rounded-lg text-sm font-medium text-white shrink-0"
          style={{ background: adding ? "var(--text-tertiary)" : "var(--blue)" }}
        >
          {adding ? "Adding..." : "Add Category"}
        </button>
      </div>

      {/* Categories list */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        {categories.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--bg-elevated)" }}>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)", borderBottom: "1px solid var(--border)" }}>Category</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)", borderBottom: "1px solid var(--border)" }}>Slug</th>
                <th className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)", borderBottom: "1px solid var(--border)" }}>Products</th>
                <th className="px-5 py-3" style={{ borderBottom: "1px solid var(--border)" }}></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td className="px-5 py-3.5">
                    {editing === cat.id ? (
                      <div className="flex gap-2">
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, () => handleUpdate(cat.id))}
                          className="text-sm"
                          autoFocus
                        />
                        <button
                          onClick={() => handleUpdate(cat.id)}
                          disabled={acting}
                          className="text-xs font-medium px-2 py-1 rounded"
                          style={{ background: "var(--blue)", color: "white" }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          className="text-xs"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{cat.name}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: "var(--text-tertiary)" }}>{cat.slug}</td>
                  <td className="px-5 py-3.5 text-sm text-center">
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs" style={{ background: "var(--bg-grouped)", color: "var(--text-primary)" }}>
                      {cat.productCount}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => { setEditing(cat.id); setEditName(cat.name); }}
                        className="text-xs font-medium"
                        style={{ color: "var(--gold)" }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="text-xs font-medium"
                        style={{ color: "var(--red)" }}
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
          <div className="p-12 text-center">
            <svg className="w-10 h-10 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="var(--text-tertiary)" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>No categories yet</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>Add categories above to organize your products</p>
          </div>
        )}
      </div>
    </div>
  );
}
