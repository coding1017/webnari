"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost } from "@/app/[storeId]/actions/commerce-actions";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  read_time: number;
  image_url: string;
  published: boolean;
  created_at: string;
}

export default function BlogAdminPage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [readTime, setReadTime] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [published, setPublished] = useState(false);

  useEffect(() => { load(); }, [storeId]);

  async function load() {
    try { setPosts(await getBlogPosts(storeId)); } catch {}
  }

  function resetForm() {
    setTitle(""); setSlug(""); setExcerpt(""); setContent("");
    setCategory(""); setReadTime(""); setImageUrl(""); setPublished(false);
    setShowCreate(false); setEditingId(null);
  }

  function editPost(p: BlogPost) {
    setEditingId(p.id); setShowCreate(true);
    setTitle(p.title); setSlug(p.slug); setExcerpt(p.excerpt || "");
    setContent(p.content || ""); setCategory(p.category || "");
    setReadTime(p.read_time ? String(p.read_time) : ""); setImageUrl(p.image_url || "");
    setPublished(p.published);
  }

  async function handleSave() {
    if (!title.trim()) { setMessage("Title required"); return; }
    setSaving(true); setMessage("");
    const data = {
      title, slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      excerpt: excerpt || null, content: content || null, category: category || null,
      read_time: readTime ? parseInt(readTime) : null, image_url: imageUrl || null, published,
    };
    try {
      if (editingId) { await updateBlogPost(storeId, editingId, data); }
      else { await createBlogPost(storeId, data); }
      resetForm(); await load();
      setMessage(editingId ? "Post updated" : "Post created");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) { setMessage((err as Error).message); }
    setSaving(false);
  }

  async function handleDelete(id: string, postTitle: string) {
    if (!confirm(`Delete "${postTitle}"?`)) return;
    try { await deleteBlogPost(storeId, id); await load(); } catch {}
  }

  async function handleTogglePublish(p: BlogPost) {
    try { await updateBlogPost(storeId, p.id, { published: !p.published }); await load(); } catch {}
  }

  const publishedCount = posts.filter(p => p.published).length;
  const draftCount = posts.filter(p => !p.published).length;
  const blogCategories = Array.from(new Set(posts.map(p => p.category).filter(Boolean)));

  const filtered = posts.filter(p => {
    if (filterStatus === "published") return p.published;
    if (filterStatus === "draft") return !p.published;
    return true;
  });

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between" style={{ marginBottom: "28px" }}>
        <div>
          <h1 className="heading-lg">Blog</h1>
          <p style={{ fontSize: "14px", color: "var(--text-tertiary)", marginTop: "4px" }}>
            Manage blog posts for your store
          </p>
        </div>
        <button onClick={() => { resetForm(); setShowCreate(true); }} className="btn btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          New Post
        </button>
      </div>

      {message && (
        <div className={`alert ${message.includes("created") || message.includes("updated") ? "alert-success" : "alert-error"}`} style={{ marginBottom: "20px", borderRadius: "var(--radius-sm)" }}>
          {message}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5" style={{ marginBottom: "24px" }}>
        {[
          { label: "TOTAL POSTS", value: posts.length, accent: "#5856d6" },
          { label: "PUBLISHED", value: publishedCount, accent: "#34c759" },
          { label: "DRAFTS", value: draftCount, accent: "#ff9500" },
          { label: "CATEGORIES", value: blogCategories.length, accent: "#007aff" },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white relative overflow-hidden" style={{ borderRadius: "var(--radius-lg)", padding: "20px", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-sm)" }}>
            <div className="absolute top-0 left-0 right-0" style={{ height: "3px", background: kpi.accent }} />
            <div className="label-caps" style={{ marginBottom: "8px" }}>{kpi.label}</div>
            <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Create/Edit Form */}
      {showCreate && (
        <div className="card fade-in" style={{ marginBottom: "24px" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: "20px" }}>
            <h2 className="heading-sm">{editingId ? "Edit Post" : "New Post"}</h2>
            <button onClick={resetForm} style={{ color: "var(--text-tertiary)", fontSize: "13px", background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ marginBottom: "16px" }}>
            <div>
              <label>Title</label>
              <input value={title} onChange={(e) => { setTitle(e.target.value); if (!editingId) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-")); }} placeholder="Post title" />
            </div>
            <div>
              <label>Slug</label>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-generated" style={{ fontFamily: "monospace" }} />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label>Excerpt</label>
            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} placeholder="Brief summary for listings..." />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label>Content (HTML)</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={10} placeholder="<h2>...</h2><p>...</p>" style={{ fontFamily: "monospace", fontSize: "13px" }} />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginBottom: "16px" }}>
            <div>
              <label>Category</label>
              <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. techniques" />
            </div>
            <div>
              <label>Read Time (min)</label>
              <input type="number" min="1" value={readTime} onChange={(e) => setReadTime(e.target.value)} placeholder="5" />
            </div>
            <div>
              <label>Cover Image URL</label>
              <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer" style={{ marginBottom: 0 }}>
                <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
                <span style={{ fontSize: "13px", fontWeight: 500 }}>Published</span>
              </label>
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ fontSize: "13px" }}>
            {saving ? "Saving..." : editingId ? "Update Post" : "Create Post"}
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2" style={{ marginBottom: "16px" }}>
        <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Filter:</span>
        {([
          { key: "all", label: "All" },
          { key: "published", label: "Published" },
          { key: "draft", label: "Drafts" },
        ] as const).map(f => (
          <button
            key={f.key}
            onClick={() => setFilterStatus(f.key)}
            className={`badge ${filterStatus === f.key ? "badge-gold" : "badge-gray"}`}
            style={{ cursor: "pointer", border: "none" }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Posts table */}
      <div className="card-section">
        {filtered.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th className="hide-mobile">Category</th>
                <th className="text-center">Status</th>
                <th className="hide-mobile">Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{p.title}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "monospace" }}>/{p.slug}</div>
                  </td>
                  <td className="hide-mobile" style={{ fontSize: "13px", textTransform: "capitalize" }}>{p.category || "\u2014"}</td>
                  <td className="text-center">
                    <button onClick={() => handleTogglePublish(p)} className={`badge ${p.published ? "badge-green" : "badge-gray"}`} style={{ cursor: "pointer", border: "none" }}>
                      {p.published ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td className="hide-mobile" style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                      <button onClick={() => editPost(p)} className="text-link" style={{ fontSize: "12px" }}>Edit</button>
                      <button onClick={() => handleDelete(p.id, p.title)} style={{ fontSize: "12px", fontWeight: 600, color: "var(--red)", background: "none", border: "none", cursor: "pointer" }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <svg className="mx-auto" style={{ width: "48px", height: "48px", marginBottom: "12px" }} fill="none" viewBox="0 0 24 24" stroke="var(--border-strong)" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)" }}>No blog posts yet</p>
            <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "4px", marginBottom: "16px" }}>Write your first post to engage your customers</p>
            <button onClick={() => setShowCreate(true)} className="btn btn-primary" style={{ fontSize: "13px" }}>Write a Post</button>
          </div>
        )}
      </div>
    </div>
  );
}
