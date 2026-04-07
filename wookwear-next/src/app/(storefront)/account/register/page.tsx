"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const API_BASE = process.env.NEXT_PUBLIC_COMMERCE_API_URL || "https://webnari.io/commerce";
const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID || "wookwear";

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Store-ID": STORE_ID },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }
      // Auto-login after registration
      localStorage.setItem("ww_customer_token", data.token);
      localStorage.setItem("ww_customer", JSON.stringify(data.customer));
      router.push("/account");
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen pt-[120px] pb-24 max-md:pt-[100px] max-md:pb-16">
      <div className="max-w-[440px] mx-auto px-10 max-md:px-5">
        <ScrollReveal>
          <div className="text-center mb-10">
            <div className="flex items-center gap-3 justify-center font-head text-[11px] font-bold tracking-[0.2em] uppercase text-ww-pink mb-5">
              <span className="w-8 h-0.5 bg-[image:var(--gradient)] flex-shrink-0" />
              Join the Fam
            </div>
            <h1 className="font-head font-black text-[clamp(32px,5vw,44px)] leading-[1.05] text-ww-white mb-3">
              Create Your <span className="gradient-text">Account</span>
            </h1>
            <p className="text-ww-text text-sm">
              Track orders, save addresses, and get first dibs on new drops.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={1}>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-head font-bold tracking-[0.1em] uppercase text-ww-muted mb-2">
                  First Name
                </label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First"
                  className="w-full px-4 py-3 bg-ww-surface border border-ww-border rounded-[12px] text-ww-white placeholder:text-ww-muted/50 focus:outline-none focus:border-ww-purple transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-head font-bold tracking-[0.1em] uppercase text-ww-muted mb-2">
                  Last Name
                </label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last"
                  className="w-full px-4 py-3 bg-ww-surface border border-ww-border rounded-[12px] text-ww-white placeholder:text-ww-muted/50 focus:outline-none focus:border-ww-purple transition-colors"
                  required
                />
              </div>
            </div>
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
                placeholder="At least 8 characters"
                className="w-full px-4 py-3 bg-ww-surface border border-ww-border rounded-[12px] text-ww-white placeholder:text-ww-muted/50 focus:outline-none focus:border-ww-purple transition-colors"
                required
                minLength={8}
              />
            </div>
            <div>
              <label className="block text-xs font-head font-bold tracking-[0.1em] uppercase text-ww-muted mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
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
              {loading ? "Creating account..." : "Create Account"}
            </button>

            <div className="text-center text-sm pt-2">
              <span className="text-ww-muted">Already have an account? </span>
              <Link href="/account/login" className="text-ww-pink hover:text-ww-purple transition-colors font-medium">
                Sign in
              </Link>
            </div>
          </form>
        </ScrollReveal>
      </div>
    </div>
  );
}
