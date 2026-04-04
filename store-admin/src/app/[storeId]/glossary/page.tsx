"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getGlossary, createGlossaryTerm, updateGlossaryTerm, deleteGlossaryTerm } from "@/app/[storeId]/actions/commerce-actions";

interface GlossaryTerm {
  id: string;
  term: string;
  slug: string;
  definition: string;
  category: string;
  image_url: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
}

export default function GlossaryAdminPage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Form state
  const [term, setTerm] = useState("");
  const [slug, setSlug] = useState("");
  const [definition, setDefinition] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  useEffect(() => { load(); }, [storeId]);

  async function load() {
    try { setTerms(await getGlossary(storeId)); } catch {}
  }

  function resetForm() {
    setTerm(""); setSlug(""); setDefinition(""); setCategory("");
    setImageUrl(""); setSortOrder(""); setIsPublished(true);
    setShowCreate(false); setEditingId(null);
  }

  function editTerm(t: GlossaryTerm) {
    setEditingId(t.id); setShowCreate(true);
    setTerm(t.term); setSlug(t.slug || ""); setDefinition(t.definition);
    setCategory(t.category || ""); setImageUrl(t.image_url || "");
    setSortOrder(t.sort_order ? String(t.sort_order) : "");
    setIsPublished(t.is_published);
  }

  async function handleSave() {
    if (!term.trim()) { setMessage("Term is required"); return; }
    if (!definition.trim()) { setMessage("Definition is required"); return; }
    setSaving(true); setMessage("");
    const data = {
      term,
      slug: slug || term.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      definition,
      category: category || null,
      image_url: imageUrl || null,
      sort_order: sortOrder ? parseInt(sortOrder) : 0,
      is_published: isPublished,
    };
    try {
      if (editingId) { await updateGlossaryTerm(storeId, editingId, data); }
      else { await createGlossaryTerm(storeId, data); }
      resetForm(); await load();
      setMessage(editingId ? "Term updated" : "Term created");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) { setMessage((err as Error).message); }
    setSaving(false);
  }

  async function handleDelete(id: string, termName: string) {
    if (!confirm(`Delete "${termName}"?`)) return;
    try { await deleteGlossaryTerm(storeId, id); await load(); } catch {}
  }

  async function handleTogglePublish(t: GlossaryTerm) {
    try { await updateGlossaryTerm(storeId, t.id, { is_published: !t.is_published }); await load(); } catch {}
  }

  // Derive unique categories for filter
  const categories = Array.from(new Set(terms.map(t => t.category).filter(Boolean)));
  const filtered = filterCategory === "all" ? terms : terms.filter(t => t.category === filterCategory);

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between" style={{ marginBottom: "28px" }}>
        <div>
          <h1 className="heading-lg">Glossary</h1>
          <p style={{ fontSize: "14px", color: "var(--text-tertiary)", marginTop: "4px" }}>
            Define terms, materials, and techniques for your store
          </p>
        </div>
        <button onClick={() => { resetForm(); setShowCreate(true); }} className="btn btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          New Term
        </button>
      </div>

      {message && (
        <div className={`alert ${message.includes("created") || message.includes("updated") ? "alert-success" : "alert-error"}`} style={{ marginBottom: "20px", borderRadius: "var(--radius-sm)" }}>
          {message}
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-5" style={{ marginBottom: "24px" }}>
        {[
          { label: "TOTAL TERMS", value: terms.length, accent: "#5856d6" },
          { label: "PUBLISHED", value: terms.filter(t => t.is_published).length, accent: "#34c759" },
          { label: "CATEGORIES", value: categories.length, accent: "#ff9500" },
        ].map(kpi => (
          <div key={kpi.label} style={{ background: "var(--bg-elevated)", borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--border)" }}>
            <div style={{ height: "3px", background: kpi.accent }} />
            <div style={{ padding: "20px 24px" }}>
              <div className="label-caps" style={{ marginBottom: "8px" }}>{kpi.label}</div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)" }}>{kpi.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Form */}
      {showCreate && (
        <div className="card fade-in" style={{ marginBottom: "24px" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: "20px" }}>
            <h2 className="heading-sm">{editingId ? "Edit Term" : "New Term"}</h2>
            <button onClick={resetForm} style={{ color: "var(--text-tertiary)", fontSize: "13px", background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ marginBottom: "16px" }}>
            <div>
              <label>Term</label>
              <input value={term} onChange={(e) => { setTerm(e.target.value); if (!editingId) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-")); }} placeholder="e.g. Warp and Weft" />
            </div>
            <div>
              <label>Slug</label>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-generated" style={{ fontFamily: "monospace" }} />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label>Definition</label>
            <textarea value={definition} onChange={(e) => setDefinition(e.target.value)} rows={4} placeholder="What this term means..." />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginBottom: "16px" }}>
            <div>
              <label>Category</label>
              <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. materials" />
            </div>
            <div>
              <label>Sort Order</label>
              <input type="number" min="0" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label>Image URL</label>
              <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer" style={{ marginBottom: 0 }}>
                <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
                <span style={{ fontSize: "13px", fontWeight: 500 }}>Published</span>
              </label>
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ fontSize: "13px" }}>
            {saving ? "Saving..." : editingId ? "Update Term" : "Create Term"}
          </button>
        </div>
      )}

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2" style={{ marginBottom: "16px" }}>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Filter:</span>
          <button
            onClick={() => setFilterCategory("all")}
            className={`badge ${filterCategory === "all" ? "badge-gold" : "badge-gray"}`}
            style={{ cursor: "pointer", border: "none" }}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`badge ${filterCategory === cat ? "badge-gold" : "badge-gray"}`}
              style={{ cursor: "pointer", border: "none", textTransform: "capitalize" }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Terms table */}
      <div className="card-section">
        {filtered.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Term</th>
                <th className="hide-mobile">Category</th>
                <th className="text-center">Status</th>
                <th className="hide-mobile">Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{t.term}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "2px", maxWidth: "400px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t.definition}
                    </div>
                  </td>
                  <td className="hide-mobile" style={{ fontSize: "13px", textTransform: "capitalize" }}>{t.category || "\u2014"}</td>
                  <td className="text-center">
                    <button onClick={() => handleTogglePublish(t)} className={`badge ${t.is_published ? "badge-green" : "badge-gray"}`} style={{ cursor: "pointer", border: "none" }}>
                      {t.is_published ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td className="hide-mobile" style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                    {new Date(t.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                      <button onClick={() => editTerm(t)} className="text-link" style={{ fontSize: "12px" }}>Edit</button>
                      <button onClick={() => handleDelete(t.id, t.term)} style={{ fontSize: "12px", fontWeight: 600, color: "var(--red)", background: "none", border: "none", cursor: "pointer" }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <svg className="mx-auto" style={{ width: "48px", height: "48px", marginBottom: "12px" }} fill="none" viewBox="0 0 24 24" stroke="var(--border-strong)" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)" }}>No glossary terms yet</p>
            <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "4px", marginBottom: "16px" }}>Add terms to help customers understand your products</p>
            <button onClick={() => setShowCreate(true)} className="btn btn-primary" style={{ fontSize: "13px" }}>Add a Term</button>
          </div>
        )}
      </div>
    </div>
  );
}
