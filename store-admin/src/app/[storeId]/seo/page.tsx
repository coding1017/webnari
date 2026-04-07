"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  getSeoHealth,
  getStoreSettings,
  updateStore,
} from "@/app/[storeId]/actions/commerce-actions";

interface SeoHealth {
  score: number;
  grade: string;
  issues: string[];
  warnings: string[];
  summary: {
    totalProducts: number;
    productsWithMeta: number;
    productsWithSlug: number;
    productsWithImages: number;
    totalCategories: number;
    categoriesWithMeta: number;
    totalBlogPosts: number;
    blogPostsWithMeta: number;
    hasStoreTitle: boolean;
    hasStoreDescription: boolean;
    hasLogo: boolean;
    hasSocialImage: boolean;
    hasBusinessInfo: boolean;
  };
  sitemaps: Record<string, string>;
}

interface StoreData {
  seo_title?: string;
  seo_description?: string;
  social_image_url?: string;
  logo_url?: string;
  business_phone?: string;
  business_address?: string;
  business_type?: string;
  social_links?: Record<string, string>;
  domain?: string;
  name?: string;
}

export default function SeoPage() {
  const params = useParams();
  const storeId = params.storeId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [auditing, setAuditing] = useState(false);
  const [health, setHealth] = useState<SeoHealth | null>(null);
  const [store, setStore] = useState<StoreData>({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  // Form fields
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [socialImageUrl, setSocialImageUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [socialInstagram, setSocialInstagram] = useState("");
  const [socialFacebook, setSocialFacebook] = useState("");
  const [socialTwitter, setSocialTwitter] = useState("");
  const [socialYoutube, setSocialYoutube] = useState("");
  const [socialTiktok, setSocialTiktok] = useState("");

  const showMessage = useCallback((msg: string, type: "success" | "error") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 8000);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [storeData, healthData] = await Promise.all([
        getStoreSettings(storeId),
        getSeoHealth(storeId),
      ]);

      setStore(storeData);
      setHealth(healthData);

      // Populate form
      setSeoTitle(storeData.seo_title || "");
      setSeoDescription(storeData.seo_description || "");
      setSocialImageUrl(storeData.social_image_url || "");
      setLogoUrl(storeData.logo_url || "");
      setBusinessPhone(storeData.business_phone || "");
      setBusinessAddress(storeData.business_address || "");
      setBusinessType(storeData.business_type || "");
      const links = storeData.social_links || {};
      setSocialInstagram(links.instagram || "");
      setSocialFacebook(links.facebook || "");
      setSocialTwitter(links.twitter || "");
      setSocialYoutube(links.youtube || "");
      setSocialTiktok(links.tiktok || "");
    } catch (err) {
      showMessage(`Failed to load SEO data: ${(err as Error).message}`, "error");
    } finally {
      setLoading(false);
    }
  }, [storeId, showMessage]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleSave() {
    setSaving(true);
    try {
      const socialLinks: Record<string, string> = {};
      if (socialInstagram.trim()) socialLinks.instagram = socialInstagram.trim();
      if (socialFacebook.trim()) socialLinks.facebook = socialFacebook.trim();
      if (socialTwitter.trim()) socialLinks.twitter = socialTwitter.trim();
      if (socialYoutube.trim()) socialLinks.youtube = socialYoutube.trim();
      if (socialTiktok.trim()) socialLinks.tiktok = socialTiktok.trim();

      await updateStore(storeId, {
        seo_title: seoTitle.trim() || null,
        seo_description: seoDescription.trim() || null,
        social_image_url: socialImageUrl.trim() || null,
        logo_url: logoUrl.trim() || null,
        business_phone: businessPhone.trim() || null,
        business_address: businessAddress.trim() || null,
        business_type: businessType.trim() || null,
        social_links: Object.keys(socialLinks).length > 0 ? socialLinks : null,
      });

      showMessage("SEO settings saved", "success");
      // Refresh health after save
      const newHealth = await getSeoHealth(storeId);
      setHealth(newHealth);
    } catch (err) {
      showMessage(`Save failed: ${(err as Error).message}`, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleRunAudit() {
    setAuditing(true);
    try {
      const healthData = await getSeoHealth(storeId);
      setHealth(healthData);
      showMessage("Audit complete", "success");
    } catch (err) {
      showMessage(`Audit failed: ${(err as Error).message}`, "error");
    } finally {
      setAuditing(false);
    }
  }

  function getGradeColor(grade: string): string {
    switch (grade) {
      case "A": return "#22c55e";
      case "B": return "#84cc16";
      case "C": return "#eab308";
      case "D": return "#f97316";
      default: return "#ef4444";
    }
  }

  function getScoreBarColor(score: number): string {
    if (score >= 90) return "#22c55e";
    if (score >= 80) return "#84cc16";
    if (score >= 70) return "#eab308";
    if (score >= 60) return "#f97316";
    return "#ef4444";
  }

  if (loading) {
    return (
      <div style={{ padding: "60px 32px", textAlign: "center" }}>
        <div style={{ fontSize: "14px", color: "var(--text-tertiary)" }}>Loading SEO settings...</div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ maxWidth: "1100px" }}>
      {/* Message */}
      {message && (
        <div
          className={`alert ${messageType === "success" ? "alert-success" : "alert-error"}`}
          style={{ marginBottom: "20px" }}
        >
          {message}
          <button onClick={() => setMessage("")} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: "18px", lineHeight: 1 }}>
            x
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center" style={{ justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 className="heading-lg" style={{ marginBottom: "4px" }}>SEO Settings</h1>
          <p style={{ fontSize: "14px", color: "var(--text-tertiary)", margin: 0 }}>
            Optimize your store for search engines and social sharing
          </p>
        </div>
        <div className="flex" style={{ gap: "10px" }}>
          <button className="btn btn-secondary" onClick={handleRunAudit} disabled={auditing}>
            <svg style={{ width: "16px", height: "16px", marginRight: "6px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            {auditing ? "Running..." : "Run Audit"}
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>

      {/* Health Score Card */}
      {health && (
        <div className="card" style={{ padding: "28px", marginBottom: "24px" }}>
          <div className="flex items-center" style={{ gap: "24px", flexWrap: "wrap" }}>
            {/* Score Circle */}
            <div style={{ textAlign: "center", minWidth: "100px" }}>
              <div style={{
                width: "80px", height: "80px", borderRadius: "50%",
                border: `4px solid ${getGradeColor(health.grade)}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 8px",
              }}>
                <span style={{ fontSize: "28px", fontWeight: 800, color: getGradeColor(health.grade) }}>{health.grade}</span>
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>Score: {health.score}/100</div>
            </div>

            {/* Score Bar */}
            <div style={{ flex: 1, minWidth: "200px" }}>
              <div style={{ marginBottom: "16px" }}>
                <div style={{
                  height: "10px", borderRadius: "5px",
                  background: "var(--border)",
                  overflow: "hidden",
                }}>
                  <div style={{
                    width: `${health.score}%`, height: "100%",
                    borderRadius: "5px",
                    background: getScoreBarColor(health.score),
                    transition: "width 0.5s ease",
                  }} />
                </div>
              </div>

              {/* Quick Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
                {[
                  { label: "Products with meta", value: `${health.summary.productsWithMeta}/${health.summary.totalProducts}`, ok: health.summary.productsWithMeta === health.summary.totalProducts },
                  { label: "Products with images", value: `${health.summary.productsWithImages}/${health.summary.totalProducts}`, ok: health.summary.productsWithImages === health.summary.totalProducts },
                  { label: "Categories with meta", value: `${health.summary.categoriesWithMeta}/${health.summary.totalCategories}`, ok: health.summary.categoriesWithMeta === health.summary.totalCategories },
                  { label: "Blog posts with meta", value: `${health.summary.blogPostsWithMeta}/${health.summary.totalBlogPosts}`, ok: health.summary.blogPostsWithMeta === health.summary.totalBlogPosts },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center" style={{ gap: "6px" }}>
                    <div style={{
                      width: "8px", height: "8px", borderRadius: "50%",
                      background: stat.ok ? "#22c55e" : "#f59e0b",
                      flexShrink: 0,
                    }} />
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{stat.value}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Issues & Warnings */}
          {(health.issues.length > 0 || health.warnings.length > 0) && (
            <div style={{ marginTop: "20px", borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
              {health.issues.length > 0 && (
                <div style={{ marginBottom: health.warnings.length > 0 ? "16px" : 0 }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>
                    Issues ({health.issues.length})
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {health.issues.map((issue, i) => (
                      <div key={i} className="flex items-center" style={{ gap: "8px", fontSize: "13px", color: "var(--text-primary)" }}>
                        <svg style={{ width: "14px", height: "14px", color: "#ef4444", flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        {issue}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {health.warnings.length > 0 && (
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>
                    Warnings ({health.warnings.length})
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {health.warnings.map((warning, i) => (
                      <div key={i} className="flex items-center" style={{ gap: "8px", fontSize: "13px", color: "var(--text-primary)" }}>
                        <svg style={{ width: "14px", height: "14px", color: "#f59e0b", flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {warning}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

        {/* Homepage SEO */}
        <div className="card" style={{ padding: "28px" }}>
          <h2 className="heading-sm" style={{ marginBottom: "20px" }}>
            <span className="flex items-center" style={{ gap: "8px" }}>
              <svg style={{ width: "18px", height: "18px", color: "var(--gold)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Homepage SEO
            </span>
          </h2>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
              SEO Title
            </label>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder={`${store.name || "Store"} — Official Store`}
              maxLength={70}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border)", background: "var(--bg-elevated)", fontSize: "14px", color: "var(--text-primary)", outline: "none" }}
            />
            <div style={{ fontSize: "11px", color: seoTitle.length > 60 ? "#f59e0b" : "var(--text-quaternary)", marginTop: "4px", textAlign: "right" }}>
              {seoTitle.length}/70
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
              SEO Description
            </label>
            <textarea
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder="A compelling description of your store for search results..."
              maxLength={160}
              rows={3}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border)", background: "var(--bg-elevated)", fontSize: "14px", color: "var(--text-primary)", outline: "none", resize: "vertical" }}
            />
            <div style={{ fontSize: "11px", color: seoDescription.length > 155 ? "#f59e0b" : "var(--text-quaternary)", marginTop: "4px", textAlign: "right" }}>
              {seoDescription.length}/160
            </div>
          </div>

          {/* Live Preview */}
          <div style={{ padding: "16px", borderRadius: "var(--radius-md)", background: "var(--bg)", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-quaternary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "10px" }}>
              Google Preview
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 500, color: "#1a0dab", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {seoTitle || `${store.name || "Store"} — Official Store`}
              </div>
              <div style={{ fontSize: "12px", color: "#006621", marginBottom: "4px" }}>
                {store.domain ? `https://${store.domain}` : "https://yourstore.com"}
              </div>
              <div style={{ fontSize: "13px", color: "#545454", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                {seoDescription || `Shop ${store.name || "your store"}. Free shipping on qualifying orders.`}
              </div>
            </div>
          </div>
        </div>

        {/* Social / OG Images */}
        <div className="card" style={{ padding: "28px" }}>
          <h2 className="heading-sm" style={{ marginBottom: "20px" }}>
            <span className="flex items-center" style={{ gap: "8px" }}>
              <svg style={{ width: "18px", height: "18px", color: "#3b82f6" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Social Sharing
            </span>
          </h2>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
              Social / OG Image URL
            </label>
            <input
              type="url"
              value={socialImageUrl}
              onChange={(e) => setSocialImageUrl(e.target.value)}
              placeholder="https://example.com/og-image.jpg"
              style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border)", background: "var(--bg-elevated)", fontSize: "14px", color: "var(--text-primary)", outline: "none" }}
            />
            <div style={{ fontSize: "11px", color: "var(--text-quaternary)", marginTop: "4px" }}>
              Recommended: 1200x630px. Used for link previews on social media.
            </div>
          </div>

          {socialImageUrl && (
            <div style={{ marginBottom: "16px", borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border)", maxHeight: "200px" }}>
              <img
                src={socialImageUrl}
                alt="Social preview"
                style={{ width: "100%", height: "auto", display: "block", objectFit: "cover", maxHeight: "200px" }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          )}

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
              Logo URL
            </label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border)", background: "var(--bg-elevated)", fontSize: "14px", color: "var(--text-primary)", outline: "none" }}
            />
            <div style={{ fontSize: "11px", color: "var(--text-quaternary)", marginTop: "4px" }}>
              Used in structured data (JSON-LD) for Google Knowledge Panels.
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
              Business Type
            </label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border)", background: "var(--bg-elevated)", fontSize: "14px", color: "var(--text-primary)", outline: "none" }}
            >
              <option value="">Select type...</option>
              <option value="Store">Online Store</option>
              <option value="LocalBusiness">Local Business</option>
              <option value="Restaurant">Restaurant</option>
              <option value="ProfessionalService">Professional Service</option>
              <option value="Organization">Organization</option>
            </select>
            <div style={{ fontSize: "11px", color: "var(--text-quaternary)", marginTop: "4px" }}>
              Schema.org business type for structured data.
            </div>
          </div>
        </div>

        {/* Business Info */}
        <div className="card" style={{ padding: "28px" }}>
          <h2 className="heading-sm" style={{ marginBottom: "20px" }}>
            <span className="flex items-center" style={{ gap: "8px" }}>
              <svg style={{ width: "18px", height: "18px", color: "#8b5cf6" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Business Information
            </span>
          </h2>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
              Business Phone
            </label>
            <input
              type="tel"
              value={businessPhone}
              onChange={(e) => setBusinessPhone(e.target.value)}
              placeholder="(305) 555-0100"
              style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border)", background: "var(--bg-elevated)", fontSize: "14px", color: "var(--text-primary)", outline: "none" }}
            />
            <div style={{ fontSize: "11px", color: "var(--text-quaternary)", marginTop: "4px" }}>
              Boosts local SEO trust signals.
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
              Business Address
            </label>
            <textarea
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
              placeholder="123 Main St, Miami, FL 33101"
              rows={2}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border)", background: "var(--bg-elevated)", fontSize: "14px", color: "var(--text-primary)", outline: "none", resize: "vertical" }}
            />
            <div style={{ fontSize: "11px", color: "var(--text-quaternary)", marginTop: "4px" }}>
              Improves local search visibility and schema.org data.
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="card" style={{ padding: "28px" }}>
          <h2 className="heading-sm" style={{ marginBottom: "20px" }}>
            <span className="flex items-center" style={{ gap: "8px" }}>
              <svg style={{ width: "18px", height: "18px", color: "#ec4899" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
              Social Links
            </span>
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-tertiary)", marginBottom: "16px", marginTop: 0 }}>
            Added to schema.org sameAs property for search engine connections.
          </p>

          {[
            { label: "Instagram", value: socialInstagram, set: setSocialInstagram, placeholder: "https://instagram.com/yourstore" },
            { label: "Facebook", value: socialFacebook, set: setSocialFacebook, placeholder: "https://facebook.com/yourstore" },
            { label: "Twitter / X", value: socialTwitter, set: setSocialTwitter, placeholder: "https://x.com/yourstore" },
            { label: "YouTube", value: socialYoutube, set: setSocialYoutube, placeholder: "https://youtube.com/@yourstore" },
            { label: "TikTok", value: socialTiktok, set: setSocialTiktok, placeholder: "https://tiktok.com/@yourstore" },
          ].map((field, i, arr) => (
            <div key={field.label} style={{ marginBottom: i < arr.length - 1 ? "12px" : 0 }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                {field.label}
              </label>
              <input
                type="url"
                value={field.value}
                onChange={(e) => field.set(e.target.value)}
                placeholder={field.placeholder}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border)", background: "var(--bg-elevated)", fontSize: "14px", color: "var(--text-primary)", outline: "none" }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Sitemaps */}
      {health?.sitemaps && (
        <div className="card" style={{ padding: "28px", marginTop: "24px" }}>
          <h2 className="heading-sm" style={{ marginBottom: "16px" }}>
            <span className="flex items-center" style={{ gap: "8px" }}>
              <svg style={{ width: "18px", height: "18px", color: "#06b6d4" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              Sitemaps
            </span>
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-tertiary)", margin: "0 0 16px" }}>
            Auto-generated sitemaps for search engine crawlers. Submit these to Google Search Console.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "10px" }}>
            {Object.entries(health.sitemaps).map(([name, path]) => (
              <div key={name} className="flex items-center" style={{ gap: "10px", padding: "12px 16px", borderRadius: "var(--radius-sm)", background: "var(--bg)", border: "1px solid var(--border)" }}>
                <svg style={{ width: "14px", height: "14px", color: "#06b6d4", flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", textTransform: "capitalize" }}>{name}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-tertiary)", fontFamily: "monospace" }}>{path}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
