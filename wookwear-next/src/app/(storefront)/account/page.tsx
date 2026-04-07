"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const API_BASE = process.env.NEXT_PUBLIC_COMMERCE_API_URL || "https://webnari.io/commerce";
const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID || "wookwear";

interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
}

interface Address {
  id: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
  is_default: boolean;
}

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ first_name: "", last_name: "", phone: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({ label: "Home", line1: "", line2: "", city: "", state: "", zip: "" });
  const [addressSaving, setAddressSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  function getToken() {
    return localStorage.getItem("ww_customer_token");
  }

  function showMsg(msg: string, type: "success" | "error" = "success") {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  }

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/account/login");
      return;
    }
    loadData(token);
  }, [router]);

  async function loadData(token: string) {
    try {
      const [profileRes, addressRes] = await Promise.all([
        fetch(`${API_BASE}/api/account/profile`, {
          headers: { "X-Store-ID": STORE_ID, Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/account/addresses`, {
          headers: { "X-Store-ID": STORE_ID, Authorization: `Bearer ${token}` },
        }),
      ]);

      if (profileRes.status === 401) {
        localStorage.removeItem("ww_customer_token");
        localStorage.removeItem("ww_customer");
        router.push("/account/login");
        return;
      }

      const profileData = await profileRes.json();
      setProfile(profileData);
      setProfileForm({
        first_name: profileData.first_name || "",
        last_name: profileData.last_name || "",
        phone: profileData.phone || "",
      });

      const addressData = await addressRes.json();
      setAddresses(Array.isArray(addressData) ? addressData : []);
    } catch {
      showMsg("Failed to load account data", "error");
    }
    setLoading(false);
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setProfileSaving(true);

    try {
      const res = await fetch(`${API_BASE}/api/account/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-Store-ID": STORE_ID, Authorization: `Bearer ${token}` },
        body: JSON.stringify(profileForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setEditingProfile(false);
        showMsg("Profile updated");
      } else {
        showMsg("Failed to update profile", "error");
      }
    } catch {
      showMsg("Something went wrong", "error");
    }
    setProfileSaving(false);
  }

  async function handleAddAddress(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setAddressSaving(true);

    try {
      const res = await fetch(`${API_BASE}/api/account/addresses`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Store-ID": STORE_ID, Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...addressForm, country: "US" }),
      });
      if (res.ok) {
        const newAddr = await res.json();
        setAddresses((prev) => [...prev, newAddr]);
        setShowAddAddress(false);
        setAddressForm({ label: "Home", line1: "", line2: "", city: "", state: "", zip: "" });
        showMsg("Address added");
      } else {
        showMsg("Failed to add address", "error");
      }
    } catch {
      showMsg("Something went wrong", "error");
    }
    setAddressSaving(false);
  }

  async function handleDeleteAddress(id: string) {
    const token = getToken();
    if (!token) return;

    try {
      await fetch(`${API_BASE}/api/account/addresses/${id}`, {
        method: "DELETE",
        headers: { "X-Store-ID": STORE_ID, Authorization: `Bearer ${token}` },
      });
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      showMsg("Address removed");
    } catch {
      showMsg("Failed to remove address", "error");
    }
  }

  function handleLogout() {
    localStorage.removeItem("ww_customer_token");
    localStorage.removeItem("ww_customer");
    router.push("/account/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-[120px] pb-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-ww-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-[120px] pb-24 max-md:pt-[100px] max-md:pb-16">
      <div className="max-w-[680px] mx-auto px-10 max-md:px-5">
        {/* Header */}
        <ScrollReveal>
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-3 font-head text-[11px] font-bold tracking-[0.2em] uppercase text-ww-pink mb-3">
                <span className="w-8 h-0.5 bg-[image:var(--gradient)] flex-shrink-0" />
                My Account
              </div>
              <h1 className="font-head font-black text-[clamp(28px,4vw,40px)] leading-[1.05] text-ww-white">
                Hey, <span className="gradient-text">{profile?.first_name || "there"}</span>
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs font-head font-bold tracking-[0.1em] uppercase text-ww-muted hover:text-ww-pink transition-colors px-4 py-2 border border-ww-border rounded-[10px] hover:border-ww-pink/30"
            >
              Sign Out
            </button>
          </div>
        </ScrollReveal>

        {/* Message */}
        {message && (
          <div
            className={`p-3 rounded-[12px] text-sm mb-6 border ${
              messageType === "success"
                ? "bg-[rgba(52,199,89,0.08)] border-[rgba(52,199,89,0.2)] text-[#34C759]"
                : "bg-[rgba(255,59,48,0.08)] border-[rgba(255,59,48,0.2)] text-[#FF6B6B]"
            }`}
          >
            {message}
          </div>
        )}

        {/* Quick Nav */}
        <ScrollReveal delay={1}>
          <div className="grid grid-cols-2 gap-3 mb-8">
            <Link
              href="/account/orders"
              className="p-5 bg-ww-surface border border-ww-border rounded-[16px] hover:border-ww-purple/40 transition-all group"
            >
              <svg className="w-6 h-6 text-ww-purple mb-3 group-hover:text-ww-pink transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <div className="font-head text-sm font-bold text-ww-white">Order History</div>
              <div className="text-xs text-ww-muted mt-1">View past orders & tracking</div>
            </Link>
            <Link
              href="/wishlist"
              className="p-5 bg-ww-surface border border-ww-border rounded-[16px] hover:border-ww-purple/40 transition-all group"
            >
              <svg className="w-6 h-6 text-ww-purple mb-3 group-hover:text-ww-pink transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <div className="font-head text-sm font-bold text-ww-white">Wishlist</div>
              <div className="text-xs text-ww-muted mt-1">Saved items for later</div>
            </Link>
          </div>
        </ScrollReveal>

        {/* Profile Section */}
        <ScrollReveal delay={2}>
          <div className="bg-ww-surface border border-ww-border rounded-[20px] overflow-hidden mb-6">
            <div className="flex items-center justify-between p-6 border-b border-ww-border">
              <h2 className="font-head text-xs font-bold tracking-[0.15em] uppercase text-ww-muted">Profile</h2>
              {!editingProfile && (
                <button onClick={() => setEditingProfile(true)} className="text-xs text-ww-purple hover:text-ww-pink transition-colors font-medium">
                  Edit
                </button>
              )}
            </div>
            {!editingProfile ? (
              <div className="p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-ww-muted">Name</span>
                  <span className="text-ww-white">{profile?.first_name} {profile?.last_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ww-muted">Email</span>
                  <span className="text-ww-white">{profile?.email}</span>
                </div>
                {profile?.phone && (
                  <div className="flex justify-between text-sm">
                    <span className="text-ww-muted">Phone</span>
                    <span className="text-ww-white">{profile.phone}</span>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-head font-bold tracking-[0.1em] uppercase text-ww-muted mb-2">First Name</label>
                    <input value={profileForm.first_name} onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })} className="w-full px-4 py-3 bg-ww-dark border border-ww-border rounded-[12px] text-ww-white focus:outline-none focus:border-ww-purple transition-colors text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-head font-bold tracking-[0.1em] uppercase text-ww-muted mb-2">Last Name</label>
                    <input value={profileForm.last_name} onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })} className="w-full px-4 py-3 bg-ww-dark border border-ww-border rounded-[12px] text-ww-white focus:outline-none focus:border-ww-purple transition-colors text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-head font-bold tracking-[0.1em] uppercase text-ww-muted mb-2">Phone (optional)</label>
                  <input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="(555) 555-0100" className="w-full px-4 py-3 bg-ww-dark border border-ww-border rounded-[12px] text-ww-white placeholder:text-ww-muted/50 focus:outline-none focus:border-ww-purple transition-colors text-sm" />
                </div>
                <div className="flex items-center gap-3">
                  <button type="submit" disabled={profileSaving} className="px-6 py-3 bg-[image:var(--gradient)] text-white font-head text-xs font-bold tracking-[0.1em] uppercase rounded-[10px] hover:shadow-[0_0_20px_rgba(255,45,155,0.3)] transition-all disabled:opacity-40">
                    {profileSaving ? "Saving..." : "Save Changes"}
                  </button>
                  <button type="button" onClick={() => setEditingProfile(false)} className="text-xs text-ww-muted hover:text-ww-pink transition-colors">Cancel</button>
                </div>
              </form>
            )}
          </div>
        </ScrollReveal>

        {/* Addresses Section */}
        <ScrollReveal delay={3}>
          <div className="bg-ww-surface border border-ww-border rounded-[20px] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-ww-border">
              <h2 className="font-head text-xs font-bold tracking-[0.15em] uppercase text-ww-muted">Saved Addresses</h2>
              {!showAddAddress && (
                <button onClick={() => setShowAddAddress(true)} className="text-xs text-ww-purple hover:text-ww-pink transition-colors font-medium">
                  + Add
                </button>
              )}
            </div>

            {showAddAddress && (
              <form onSubmit={handleAddAddress} className="p-6 border-b border-ww-border space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-head font-bold tracking-[0.1em] uppercase text-ww-muted mb-2">Label</label>
                    <select value={addressForm.label} onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })} className="w-full px-4 py-3 bg-ww-dark border border-ww-border rounded-[12px] text-ww-white focus:outline-none focus:border-ww-purple transition-colors text-sm">
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-head font-bold tracking-[0.1em] uppercase text-ww-muted mb-2">ZIP</label>
                    <input value={addressForm.zip} onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })} placeholder="33444" className="w-full px-4 py-3 bg-ww-dark border border-ww-border rounded-[12px] text-ww-white placeholder:text-ww-muted/50 focus:outline-none focus:border-ww-purple transition-colors text-sm" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-head font-bold tracking-[0.1em] uppercase text-ww-muted mb-2">Address Line 1</label>
                  <input value={addressForm.line1} onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })} placeholder="123 Main St" className="w-full px-4 py-3 bg-ww-dark border border-ww-border rounded-[12px] text-ww-white placeholder:text-ww-muted/50 focus:outline-none focus:border-ww-purple transition-colors text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-head font-bold tracking-[0.1em] uppercase text-ww-muted mb-2">Address Line 2 (optional)</label>
                  <input value={addressForm.line2} onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })} placeholder="Apt, Suite, etc." className="w-full px-4 py-3 bg-ww-dark border border-ww-border rounded-[12px] text-ww-white placeholder:text-ww-muted/50 focus:outline-none focus:border-ww-purple transition-colors text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-head font-bold tracking-[0.1em] uppercase text-ww-muted mb-2">City</label>
                    <input value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} placeholder="Miami" className="w-full px-4 py-3 bg-ww-dark border border-ww-border rounded-[12px] text-ww-white placeholder:text-ww-muted/50 focus:outline-none focus:border-ww-purple transition-colors text-sm" required />
                  </div>
                  <div>
                    <label className="block text-xs font-head font-bold tracking-[0.1em] uppercase text-ww-muted mb-2">State</label>
                    <input value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} placeholder="FL" maxLength={2} className="w-full px-4 py-3 bg-ww-dark border border-ww-border rounded-[12px] text-ww-white placeholder:text-ww-muted/50 focus:outline-none focus:border-ww-purple transition-colors text-sm uppercase" required />
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button type="submit" disabled={addressSaving} className="px-6 py-3 bg-[image:var(--gradient)] text-white font-head text-xs font-bold tracking-[0.1em] uppercase rounded-[10px] hover:shadow-[0_0_20px_rgba(255,45,155,0.3)] transition-all disabled:opacity-40">
                    {addressSaving ? "Saving..." : "Add Address"}
                  </button>
                  <button type="button" onClick={() => setShowAddAddress(false)} className="text-xs text-ww-muted hover:text-ww-pink transition-colors">Cancel</button>
                </div>
              </form>
            )}

            {addresses.length === 0 && !showAddAddress ? (
              <div className="p-8 text-center">
                <div className="text-sm text-ww-muted">No saved addresses yet</div>
              </div>
            ) : (
              addresses.map((addr) => (
                <div key={addr.id} className="flex items-start justify-between p-6 border-b border-ww-border last:border-0">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-ww-white">{addr.label}</span>
                      {addr.is_default && (
                        <span className="text-[10px] font-head font-bold tracking-wider uppercase px-2 py-0.5 bg-ww-purple/20 text-ww-purple2 rounded-full">Default</span>
                      )}
                    </div>
                    <div className="text-xs text-ww-text leading-relaxed">
                      <div>{addr.line1}</div>
                      {addr.line2 && <div>{addr.line2}</div>}
                      <div>{addr.city}, {addr.state} {addr.zip}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="text-xs text-ww-muted hover:text-[#FF3B30] transition-colors flex-shrink-0 ml-4"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
