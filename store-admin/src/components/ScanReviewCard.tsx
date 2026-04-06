"use client";

import { useState } from "react";
import type { ScanResult } from "@/app/[storeId]/actions/commerce-actions";

interface ScanReviewCardProps {
  result: ScanResult;
  imagePreview: string;
  categories: { id: string; name: string; slug: string }[];
  onApply: (edited: ScanResult) => void;
  onDiscard: () => void;
}

export default function ScanReviewCard({ result, imagePreview, categories, onApply, onDiscard }: ScanReviewCardProps) {
  const [edited, setEdited] = useState<ScanResult>(result);
  const [showReasoning, setShowReasoning] = useState(false);

  function update<K extends keyof ScanResult>(key: K, value: ScanResult[K]) {
    setEdited(prev => ({ ...prev, [key]: value }));
  }

  const confidenceColor = edited.confidence >= 0.8 ? "#22c55e" : edited.confidence >= 0.5 ? "#eab308" : "#ef4444";
  const confidenceLabel = edited.confidence >= 0.8 ? "High confidence" : edited.confidence >= 0.5 ? "Review suggested" : "Low confidence";

  return (
    <div className="rounded-lg" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", overflow: "hidden" }}>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" />
          </svg>
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Scan Results</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: `${confidenceColor}15`, color: confidenceColor }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: confidenceColor, display: "inline-block" }} />
          {confidenceLabel}
        </div>
      </div>

      <div style={{ padding: "16px", display: "flex", gap: "16px" }}>
        {/* Image preview */}
        <div className="shrink-0" style={{ width: 120, height: 120, borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)" }}>
          <img src={imagePreview} alt="Scanned product" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>

        {/* Fields */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
          <div>
            <label className="text-xs" style={{ color: "var(--text-tertiary)", marginBottom: 2, display: "block" }}>Name</label>
            <input value={edited.name} onChange={e => update("name", e.target.value)} className="text-sm" style={{ padding: "6px 8px" }} />
          </div>
          <div>
            <label className="text-xs" style={{ color: "var(--text-tertiary)", marginBottom: 2, display: "block" }}>Description</label>
            <textarea value={edited.description} onChange={e => update("description", e.target.value)} rows={2} className="text-sm" style={{ padding: "6px 8px" }} />
          </div>
        </div>
      </div>

      {/* Grid fields */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" style={{ padding: "0 16px 16px" }}>
        <div>
          <label className="text-xs" style={{ color: "var(--text-tertiary)", marginBottom: 2, display: "block" }}>Category</label>
          <select value={edited.category || ""} onChange={e => update("category", e.target.value || null)} className="text-sm" style={{ padding: "6px 8px" }}>
            <option value="">Unknown</option>
            {categories.map(c => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs" style={{ color: "var(--text-tertiary)", marginBottom: 2, display: "block" }}>Color</label>
          <input value={edited.color || ""} onChange={e => update("color", e.target.value || null)} className="text-sm" style={{ padding: "6px 8px" }} placeholder="Unknown" />
        </div>
        <div>
          <label className="text-xs" style={{ color: "var(--text-tertiary)", marginBottom: 2, display: "block" }}>Material</label>
          <input value={edited.material || ""} onChange={e => update("material", e.target.value || null)} className="text-sm" style={{ padding: "6px 8px" }} placeholder="Unknown" />
        </div>
        <div>
          <label className="text-xs" style={{ color: "var(--text-tertiary)", marginBottom: 2, display: "block" }}>Est. Price ($)</label>
          <input type="number" step="0.01" value={edited.suggestedPrice || ""} onChange={e => update("suggestedPrice", e.target.value || null)} className="text-sm" style={{ padding: "6px 8px" }} placeholder="--" />
        </div>
      </div>

      {/* Dimensions */}
      {edited.dimensions && (edited.dimensions.width || edited.dimensions.height || edited.dimensions.depth) && (
        <div style={{ padding: "0 16px 16px" }}>
          <label className="text-xs" style={{ color: "var(--text-tertiary)", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
            Dimensions
            {edited.dimensions.referenceObjectUsed && (
              <span className="px-1.5 py-0.5 rounded text-xs" style={{ background: "rgba(59,130,246,0.1)", color: "var(--blue)", fontSize: 10 }}>
                measured via reference
              </span>
            )}
          </label>
          <div className="flex gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            {edited.dimensions.width && <span>{edited.dimensions.width}</span>}
            {edited.dimensions.width && edited.dimensions.height && <span>x</span>}
            {edited.dimensions.height && <span>{edited.dimensions.height}</span>}
            {edited.dimensions.height && edited.dimensions.depth && <span>x</span>}
            {edited.dimensions.depth && <span>{edited.dimensions.depth}</span>}
          </div>
        </div>
      )}

      {/* AI Reasoning toggle */}
      {edited.rawAnalysis && (
        <div style={{ padding: "0 16px 12px" }}>
          <button type="button" onClick={() => setShowReasoning(!showReasoning)} className="text-xs" style={{ color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showReasoning ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s" }}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
            AI reasoning
          </button>
          {showReasoning && (
            <p className="text-xs mt-2" style={{ color: "var(--text-tertiary)", lineHeight: 1.5, padding: "8px", background: "rgba(0,0,0,0.03)", borderRadius: 6 }}>
              {edited.rawAnalysis}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3" style={{ padding: "12px 16px", borderTop: "1px solid var(--border)" }}>
        <button
          type="button"
          onClick={() => onApply(edited)}
          className="text-sm font-semibold text-white"
          style={{ background: "var(--blue)", padding: "10px 24px", borderRadius: "var(--radius-sm)", flex: 1 }}
        >
          Apply to Form
        </button>
        <button
          type="button"
          onClick={onDiscard}
          className="text-sm font-medium"
          style={{ color: "var(--text-tertiary)", padding: "10px 16px" }}
        >
          Discard
        </button>
      </div>
    </div>
  );
}
