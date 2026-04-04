"use client";

import { useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface ImageUploaderProps {
  storeId: string;
  images: string[];
  onChange: (images: string[]) => void;
  folder?: string;
  maxImages?: number;
}

export default function ImageUploader({
  storeId,
  images,
  onChange,
  folder = "products",
  maxImages = 10,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (!fileArray.length) return;
    if (images.length + fileArray.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (fileArray.find(f => !validTypes.includes(f.type))) {
      setError("Only JPEG, PNG, WebP, and GIF allowed");
      return;
    }
    if (fileArray.find(f => f.size > 5 * 1024 * 1024)) {
      setError("Each file must be under 5MB");
      return;
    }

    setUploading(true);
    setError("");
    const newUrls: string[] = [];

    for (const file of fileArray) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${storeId}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, file, { contentType: file.type, upsert: false });
      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`);
        continue;
      }
      const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
      if (data?.publicUrl) newUrls.push(data.publicUrl);
    }

    if (newUrls.length > 0) onChange([...images, ...newUrls]);
    setUploading(false);
  }, [images, onChange, storeId, folder, maxImages]);

  // ── File drop zone handlers ────────────────
  function handleZoneDragEnter(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    // Only activate for files, not image reorder
    if (e.dataTransfer.types.includes("Files")) setDragActive(true);
  }
  function handleZoneDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }
  function handleZoneDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }
  function handleZoneDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
  }
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) uploadFiles(e.target.files);
    e.target.value = "";
  }

  // ── Image reorder drag handlers ────────────
  function handleImageDragStart(e: React.DragEvent, idx: number) {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = "move";
    // Set a tiny transparent drag image so browser doesn't show the full image
    const el = e.currentTarget as HTMLElement;
    e.dataTransfer.setDragImage(el, 40, 40);
  }
  function handleImageDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIdx(idx);
  }
  function handleImageDragEnd() {
    if (dragIdx !== null && dragOverIdx !== null && dragIdx !== dragOverIdx) {
      const updated = [...images];
      const [moved] = updated.splice(dragIdx, 1);
      updated.splice(dragOverIdx, 0, moved);
      onChange(updated);
    }
    setDragIdx(null);
    setDragOverIdx(null);
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Image grid — drag to reorder */}
      {images.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: "10px" }}>
          {images.map((url, i) => (
            <div
              key={`${url}-${i}`}
              draggable
              onDragStart={(e) => handleImageDragStart(e, i)}
              onDragOver={(e) => handleImageDragOver(e, i)}
              onDragEnd={handleImageDragEnd}
              className="relative group"
              style={{
                borderRadius: "var(--radius-sm)",
                overflow: "hidden",
                border: dragOverIdx === i ? "2px solid var(--gold)" : "1px solid var(--border)",
                opacity: dragIdx === i ? 0.4 : 1,
                cursor: "grab",
                aspectRatio: "1",
                transition: "border-color 0.15s, opacity 0.15s",
              }}
            >
              <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />

              {/* Delete button */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  background: "var(--red)",
                  color: "white",
                  border: "none",
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                x
              </button>

              {/* Main badge */}
              {i === 0 && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "4px",
                    left: "4px",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontSize: "9px",
                    fontWeight: 700,
                    color: "white",
                    background: "var(--gold)",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Main
                </div>
              )}

              {/* Drag hint */}
              <div
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  position: "absolute",
                  top: "4px",
                  left: "4px",
                  width: "20px",
                  height: "20px",
                  borderRadius: "4px",
                  background: "rgba(0,0,0,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
                  <circle cx="3" cy="2" r="1" /><circle cx="7" cy="2" r="1" />
                  <circle cx="3" cy="5" r="1" /><circle cx="7" cy="5" r="1" />
                  <circle cx="3" cy="8" r="1" /><circle cx="7" cy="8" r="1" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload drop zone */}
      {images.length < maxImages && (
        <div
          onDragEnter={handleZoneDragEnter}
          onDragLeave={handleZoneDragLeave}
          onDragOver={handleZoneDragOver}
          onDrop={handleZoneDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragActive ? "var(--gold)" : "var(--border)"}`,
            borderRadius: "var(--radius-md)",
            padding: "16px",
            textAlign: "center",
            cursor: "pointer",
            background: dragActive ? "var(--gold-light)" : "var(--bg-grouped)",
            transition: "all 0.2s",
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
          {uploading ? (
            <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--gold)" }}>Uploading...</div>
          ) : (
            <>
              <svg style={{ width: "20px", height: "20px", margin: "0 auto 4px" }} fill="none" viewBox="0 0 24 24" stroke={dragActive ? "var(--gold)" : "var(--text-tertiary)"} strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0l-3 3m3-3l3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
              </svg>
              <div style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)" }}>
                Drag & drop, or click to browse
              </div>
              <div style={{ fontSize: "10px", color: "var(--text-tertiary)", marginTop: "2px" }}>
                JPEG, PNG, WebP, GIF up to 5MB. Drag images above to reorder.
              </div>
            </>
          )}
        </div>
      )}

      {error && (
        <div style={{ fontSize: "12px", color: "var(--red)" }}>{error}</div>
      )}
    </div>
  );
}
