"use client";

import { useActionState } from "react";
import { signIn } from "../_actions/auth";

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(signIn, {
    error: "" as string,
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-ww-black p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-head text-3xl font-bold text-ww-white tracking-wide">
            WOOK WEAR
          </h1>
          <p className="text-ww-muted text-sm mt-1">Admin Panel</p>
        </div>

        {/* Login Card */}
        <form
          action={formAction}
          className="bg-ww-surface border border-ww-border rounded-lg p-6 space-y-5"
        >
          {state.error !== "" && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
              {state.error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-ww-text mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-3 py-2.5 bg-ww-dark border border-ww-border rounded-lg text-ww-white placeholder:text-ww-muted/50 focus:outline-none focus:border-ww-purple focus:ring-1 focus:ring-ww-purple transition-colors"
              placeholder="admin@wookwear.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-ww-text mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full px-3 py-2.5 bg-ww-dark border border-ww-border rounded-lg text-ww-white placeholder:text-ww-muted/50 focus:outline-none focus:border-ww-purple focus:ring-1 focus:ring-ww-purple transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 bg-ww-purple hover:bg-ww-purple/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {isPending ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-ww-muted/50 text-xs mt-6">
          &copy; {new Date().getFullYear()} Wook Wear. Admin access only.
        </p>
      </div>
    </div>
  );
}
