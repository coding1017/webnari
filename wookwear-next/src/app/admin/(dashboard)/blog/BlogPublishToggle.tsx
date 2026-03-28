"use client";

import { useTransition } from "react";
import { togglePostPublished } from "@/app/admin/_actions/content";

export function BlogPublishToggle({ postId, published }: { postId: string; published: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => togglePostPublished(postId, !published))}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${published ? "bg-green-500" : "bg-ww-border"}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${published ? "translate-x-4.5" : "translate-x-0.5"}`} />
    </button>
  );
}
