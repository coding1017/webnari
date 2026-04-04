"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";

export default function StoreShell({
  storeId,
  storeName,
  children,
}: {
  storeId: string;
  storeName: string;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      <Sidebar
        storeId={storeId}
        storeName={storeName}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* ── Mobile Top Bar ────────────────────────── */}
        <header
          className="lg:hidden sticky top-0 z-30 flex items-center gap-3 bg-white"
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid var(--border)",
            boxShadow: "var(--shadow-xs)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-xl"
            style={{ color: "var(--text-primary)", minHeight: "44px", minWidth: "44px", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shrink-0"
            style={{ fontSize: "13px", background: "linear-gradient(145deg, #B8892A, #D4A63A)" }}
          >
            {storeName.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
            {storeName}
          </span>
        </header>

        {/* ── Page Content ──────────────────────────── */}
        <main
          style={{
            flex: 1,
            padding: "32px 40px",
            maxWidth: "1180px",
            width: "100%",
          }}
          className="sm:px-8 max-sm:px-5 max-sm:py-6"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
