"use client";

import { useState, useRef } from "react";
import { scanProduct } from "@/app/[storeId]/actions/commerce-actions";
import type { ScanResult } from "@/app/[storeId]/actions/commerce-actions";
import ScanReviewCard from "./ScanReviewCard";

interface ProductScannerProps {
  storeId: string;
  categories: { id: string; name: string; slug: string }[];
  onApply: (result: ScanResult, imageFile: File) => void;
  onCancel: () => void;
}

type ScanState = "idle" | "scanning" | "review" | "error";

export default function ProductScanner({ storeId, categories, onApply, onCancel }: ProductScannerProps) {
  const [state, setState] = useState<ScanState>("idle");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select an image file");
      setState("error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("Image must be under 10MB");
      setState("error");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setState("scanning");
    setErrorMsg("");

    // Resize image before sending (max 1500px on longest side for speed)
    const resizedFile = await resizeImage(file, 1500);

    const formData = new FormData();
    formData.append("image", resizedFile);
    formData.append("categories", JSON.stringify(categories));

    try {
      const scanResult = await scanProduct(formData);
      setResult(scanResult);
      setState("review");
    } catch (err) {
      setErrorMsg((err as Error).message);
      setState("error");
    }
  }

  function handleRetake() {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setResult(null);
    setImageFile(null);
    setImagePreview("");
    setState("idle");
    setErrorMsg("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleApply(edited: ScanResult) {
    if (imageFile) {
      onApply(edited, imageFile);
    }
    if (imagePreview) URL.revokeObjectURL(imagePreview);
  }

  return (
    <div className="rounded-xl" style={{ background: "var(--bg-grouped)", border: "1px solid var(--border)", overflow: "hidden", marginBottom: 20 }}>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3">
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)", margin: 0 }}>Snap & Catalog</h3>
            <p className="text-xs" style={{ color: "var(--text-tertiary)", margin: 0 }}>AI-powered product scanner</p>
          </div>
        </div>
        <button type="button" onClick={onCancel} style={{ color: "var(--text-tertiary)", padding: 4 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div style={{ padding: "20px" }}>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileCapture}
          style={{ display: "none" }}
        />

        {/* IDLE STATE */}
        {state === "idle" && (
          <div style={{ textAlign: "center" }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="font-semibold text-white"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                padding: "14px 32px",
                borderRadius: 10,
                fontSize: 14,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                border: "none",
                width: "100%",
                justifyContent: "center",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              Take Photo of Product
            </button>

            {/* Tip */}
            <div className="flex items-center gap-3 mt-4" style={{ padding: "12px 16px", background: "rgba(59,130,246,0.06)", borderRadius: 8, textAlign: "left" }}>
              <div className="shrink-0" style={{ width: 40, height: 28, borderRadius: 4, border: "1.5px dashed var(--blue)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="12" viewBox="0 0 24 16" fill="none" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="1" width="22" height="14" rx="2" />
                  <line x1="5" y1="5" x2="10" y2="5" />
                  <line x1="5" y1="8" x2="8" y2="8" />
                </svg>
              </div>
              <p className="text-xs" style={{ color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                <strong style={{ color: "var(--blue)" }}>Pro tip:</strong> Place a credit card next to the product for accurate size measurements
              </p>
            </div>
          </div>
        )}

        {/* SCANNING STATE */}
        {state === "scanning" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ position: "relative", width: 200, height: 200, margin: "0 auto 16px", borderRadius: 12, overflow: "hidden", border: "2px solid var(--blue)" }}>
              <img src={imagePreview} alt="Scanning..." style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {/* Shimmer overlay */}
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.15) 50%, transparent 100%)",
                backgroundSize: "200% 100%",
                animation: "scanShimmer 1.5s ease-in-out infinite",
              }} />
              {/* Scan line */}
              <div style={{
                position: "absolute", left: 0, right: 0, height: 2,
                background: "var(--blue)",
                boxShadow: "0 0 12px var(--blue)",
                animation: "scanLine 2s ease-in-out infinite",
              }} />
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Analyzing product...
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
              Detecting colors, materials, dimensions
            </p>
            <style>{`
              @keyframes scanShimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
              }
              @keyframes scanLine {
                0% { top: 0%; opacity: 1; }
                50% { top: 95%; opacity: 0.7; }
                100% { top: 0%; opacity: 1; }
              }
            `}</style>
          </div>
        )}

        {/* REVIEW STATE */}
        {state === "review" && result && (
          <ScanReviewCard
            result={result}
            imagePreview={imagePreview}
            categories={categories}
            onApply={handleApply}
            onDiscard={handleRetake}
          />
        )}

        {/* ERROR STATE */}
        {state === "error" && (
          <div style={{ textAlign: "center" }}>
            <div className="rounded-lg p-4 mb-3" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <p className="text-sm" style={{ color: "var(--red)", margin: 0 }}>{errorMsg}</p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={handleRetake}
                className="text-sm font-semibold text-white"
                style={{ background: "var(--blue)", padding: "10px 24px", borderRadius: "var(--radius-sm)" }}
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="text-sm font-medium"
                style={{ color: "var(--text-tertiary)", padding: "10px 16px" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Resize image client-side to max dimension for faster upload + processing */
async function resizeImage(file: File, maxDim: number): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width <= maxDim && height <= maxDim) {
        resolve(file);
        return;
      }
      const ratio = Math.min(maxDim / width, maxDim / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(new File([blob], file.name, { type: "image/jpeg" }));
        } else {
          resolve(file);
        }
      }, "image/jpeg", 0.85);
    };
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
}
