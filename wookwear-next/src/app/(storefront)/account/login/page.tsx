"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const API_BASE = process.env.NEXT_PUBLIC_COMMERCE_API_URL || "https://webnari.io/commerce";
const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID || "wookwear";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Store-ID": STORE_ID },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid email or password");
        setLoading(false);
        return;
      }
      // Store token + customer info
      localStorage.setItem("ww_customer_token", data.token);
      localStorage.setItem("ww_customer", JSON.stringify(data.customer));
      router.push("/account");
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);

    try {
      await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Store-ID": STORE_ID },
        body: JSON.stringify({ email: forgotEmail }),
      });
      setForgotSent(true);
    } catch {
      // Show success even on error to not leak email existence
      setForgotSent(true);
    }
    setForgotLoading(false);
  }

  return (
    <div className="min-h-screen pt-[120px] pb-24 max-md:pt-[100px] max-md:pb-16">
      <div className="max-w-[440px] mx-auto px-10 max-md:px-5">
        <ScrollReveal>
          <div className="text-center mb-10">
            <div className="flex items-center gap-3 justify-center font-head text-[11px] font-bold tracking-[0.2em] uppercase text-ww-pink mb-5">
              <span className="w-8 h-0.5 bg-[image:var(--gradient)] flex-shrink-0" />
              Account
            </div>
            <h1 className="font-head font-black text-[clamp(32px,5vw,44px)] leading-[1.05] text-ww-white mb-3">
              Welcome <span className="gradient-text">Back</span>
            </h1>
            <p className="text-ww-text text-sm">
              Sign in to view orders, manage addresses, and more.
            </p>
          </div>
        </ScrollReveal>

        {!showForgot ? (
          <ScrollReveal delay={1}>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-head font-bold tracking-[0.1em] uppercase text-ww-muted mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-ww-surface border border-ww-border rounded-[12px] text-ww-white placeholder:text-ww-muted/50 focus:outline-none focus:border-ww-purple transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-head font-bold tracking-[0.1em] uppercase text-ww-muted mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full px-4 py-3 bg-ww-surface border border-ww-border rounded-[12px] text-ww-white placeholder:text-ww-muted/50 focus:outline-none focus:border-ww-purple transition-colors"
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-[rgba(255,59,48,0.08)] border border-[rgba(255,59,48,0.2)] rounded-[12px] text-sm text-[#FF6B6B]">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[image:var(--gradient)] text-ww-white font-head text-sm font-extrabold tracking-[0.1em] uppercase rounded-[12px] border-none cursor-pointer hover:shadow-[0_0_32px_rgba(255,45,155,0.3)] transition-all disabled:opacity-40"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

              <div className="flex items-center justify-between text-sm pt-2">
                <button
                  type="button"
                  onClick={() => { setShowForgot(true); setForgotEmail(email); }}
                  className="text-ww-muted hover:text-ww-purple transition-colors"
                >
                  Forgot password?
                </button>
                <Link href="/account/register" className="text-ww-pink hover:text-ww-purple transition-colors font-medium">
                  Create account
                </Link>
              </div>
            </form>
          </ScrollReveal>
        ) : (
          <ScrollReveal delay={1}>
            {!forgotSent ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <p className="text-sm text-ww-text mb-4">
                  Enter your email and we&apos;ll send you a link to reset your password.
                </p>
                <div>
                  <label className="block text-xs font-head font-bold tracking-[0.1em] uppercase text-ww-muted mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 bg-ww-surface border border-ww-border rounded-[12px] text-ww-white placeholder:text-ww-muted/50 focus:outline-none focus:border-ww-purple transition-colors"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-4 bg-[image:var(--gradient)] text-ww-white font-head text-sm font-extrabold tracking-[0.1em] uppercase rounded-[12px] border-none cursor-pointer hover:shadow-[0_0_32px_rgba(255,45,155,0.3)] transition-all disabled:opacity-40"
                >
                  {forgotLoading ? "Sending..." : "Send Reset Link"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForgot(false)}
                  className="w-full text-sm text-ww-muted hover:text-ww-pink transition-colors"
                >
                  &larr; Back to sign in
                </button>
              </form>
            ) : (
              <div className="text-center p-8 bg-ww-surface border border-ww-border rounded-[20px]">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-[rgba(52,199,89,0.12)]">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#34C759" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="font-head text-lg font-bold text-ww-white mb-2">Check Your Email</h2>
                <p className="text-sm text-ww-text mb-4">
                  If an account exists for <span className="text-ww-purple2">{forgotEmail}</span>, you&apos;ll receive a password reset link.
                </p>
                <button
                  onClick={() => { setShowForgot(false); setForgotSent(false); }}
                  className="text-sm text-ww-pink hover:text-ww-purple transition-colors"
                >
                  Back to sign in
                </button>
              </div>
            )}
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}
