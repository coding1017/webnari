"use client";

import { useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface ImageUploaderProps {
  storeId: string;
  images: string[];
  onChange: (images: string[]) => void;
  folder?: string; // e.g. "products/beany" or "variants/abc123"
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
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    // Check max
    if (images.length + fileArray.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Validate types
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const invalid = fileArray.find(f => !validTypes.includes(f.type));
    if (invalid) {
      setError("Only JPEG, PNG, WebP, and GIF files are allowed");
      return;
    }

    // Validate sizes (5MB max each)
    const tooBig = fileArray.find(f => f.size > 5 * 1024 * 1024);
    if (tooBig) {
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
        .upload(fileName, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        setError(`Upload failed: ${uploadError.message}`);
        continue;
      }

      // Get public URL
      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      if (data?.publicUrl) {
        newUrls.push(data.publicUrl);
      }
    }

    if (newUrls.length > 0) {
      onChange([...images, ...newUrls]);
    }

    setUploading(false);
  }, [images, onChange, storeId, folder, maxImages]);

  // Drag handlers
  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
      uploadFiles(e.dataTransfer.files);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      uploadFiles(e.target.files);
    }
    // Reset so the same file can be selected again
    e.target.value = "";
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function moveImage(from: number, to: number) {
    if (to < 0 || to >= images.length) return;
    const updated = [...images];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    onChange(updated);
  }

  return (
    <div className="space-y-3">
      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((url, i) => (
            <div key={i} className="relative group rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
              <img src={url} alt="" className="w-full h-24 object-cover" />

              {/* Overlay controls */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                {/* Move left */}
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(i, i - 1)}
                    className="w-6 h-6 rounded flex items-center justify-center text-white text-xs"
                    style={{ background: "rgba(255,255,255,0.2)" }}
                  >
                    &larr;
                  </button>
                )}

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="w-6 h-6 rounded flex items-center justify-center text-white text-xs"
                  style={{ background: "var(--red)" }}
                >
                  x
                </button>

                {/* Move right */}
                {i < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveImage(i, i + 1)}
                    className="w-6 h-6 rounded flex items-center justify-center text-white text-xs"
                    style={{ background: "rgba(255,255,255,0.2)" }}
                  >
                    &rarr;
                  </button>
                )}
              </div>

              {/* First image badge */}
              {i === 0 && (
                <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-white" style={{ background: "var(--blue)" }}>
                  Main
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {images.length < maxImages && (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="rounded-xl py-4 px-6 text-center cursor-pointer transition-all"
          style={{
            border: `2px dashed ${dragActive ? "var(--blue)" : "var(--border)"}`,
            background: dragActive ? "var(--blue-light)" : "var(--bg-grouped)",
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
            <div>
              <div className="w-8 h-8 mx-auto mb-2 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--blue)", borderTopColor: "transparent" }} />
              <p className="text-sm" style={{ color: "var(--blue)" }}>Uploading...</p>
            </div>
          ) : (
            <>
              <svg className="w-5 h-5 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke={dragActive ? "var(--blue)" : "var(--text-tertiary)"} strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0l-3 3m3-3l3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
              </svg>
              <p className="text-xs font-medium" style={{ color: dragActive ? "var(--blue)" : "var(--text-primary)" }}>
                {dragActive ? "Drop images here" : "Drag & drop, or click to browse"}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                JPEG, PNG, WebP, GIF up to 5MB
              </p>
            </>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs" style={{ color: "var(--red)" }}>{error}</p>
      )}
    </div>
  );
}
