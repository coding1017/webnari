"use client";

import { useActionState, useRef, useEffect } from "react";
import { subscribe } from "@/app/(storefront)/_actions/newsletter";

export function NewsletterForm({ variant = "inline" }: { variant?: "inline" | "hero" }) {
  const [state, formAction, isPending] = useActionState(subscribe, {
    status: "idle",
    message: "",
  });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  const isHero = variant === "hero";

  return (
    <div>
      <form ref={formRef} action={formAction} className={`flex gap-3 ${isHero ? "max-w-md mx-auto" : ""}`}>
        <input
          type="email"
          name="email"
          required
          placeholder="your@email.com"
          className={`flex-1 px-4 py-3 bg-ww-surface border border-ww-border rounded-[12px] text-sm text-ww-white placeholder:text-ww-muted/50 focus:outline-none focus:border-ww-purple transition-colors ${isHero ? "py-3.5" : ""}`}
        />
        <button
          type="submit"
          disabled={isPending}
          className={`px-6 py-3 bg-[image:var(--gradient)] text-white font-head text-xs font-bold tracking-[0.1em] uppercase rounded-[12px] hover:shadow-[0_0_24px_rgba(255,45,155,0.2)] transition-all disabled:opacity-50 whitespace-nowrap ${isHero ? "py-3.5 px-8" : ""}`}
        >
          {isPending ? "..." : "Subscribe"}
        </button>
      </form>

      {state.status !== "idle" && (
        <p
          className={`text-sm mt-2.5 ${isHero ? "text-center" : ""} ${
            state.status === "success"
              ? "text-green-400"
              : state.status === "duplicate"
                ? "text-ww-cyan"
                : "text-red-400"
          }`}
        >
          {state.message}
        </p>
      )}
    </div>
  );
}
