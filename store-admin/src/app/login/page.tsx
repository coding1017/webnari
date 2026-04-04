"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) { setError(authError.message); setLoading(false); return; }
      if (!data.user) { setError("Login failed"); setLoading(false); return; }

      const { data: storeAccess, error: accessError } = await supabase
        .from("store_admins")
        .select("store_id, role")
        .eq("user_id", data.user.id);

      if (accessError || !storeAccess?.length) {
        setError("No store access found for this account");
        setLoading(false);
        return;
      }

      router.push(`/${storeAccess[0].store_id}/dashboard`);
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl" style={{ background: "linear-gradient(145deg, #B8892A, #D4A63A)", boxShadow: "0 4px 16px rgba(184,137,42,0.3)" }}>
            W
          </div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>Store Admin</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Sign in to manage your store</p>
        </div>

        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl text-sm font-medium" style={{ background: "var(--danger-light)", color: "var(--danger)" }}>
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>

            <div>
              <label htmlFor="password">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" required />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
              style={loading ? { background: "var(--muted)", cursor: "not-allowed" } : {}}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[11px] font-medium" style={{ color: "var(--muted)" }}>
          Powered by Webnari
        </p>
      </div>
    </div>
  );
}
