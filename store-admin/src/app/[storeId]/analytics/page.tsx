"use client";

import dynamic from "next/dynamic";

const AnalyticsContent = dynamic(() => import("./analytics-content"), {
  ssr: false,
  loading: () => (
    <div className="fade-in">
      <div style={{ marginBottom: "28px" }}>
        <h1 className="heading-lg">Analytics</h1>
        <p style={{ fontSize: "14px", color: "var(--text-tertiary)", marginTop: "4px" }}>
          Track your store performance
        </p>
      </div>
      <div style={{ textAlign: "center", padding: "60px", color: "var(--text-tertiary)" }}>Loading analytics...</div>
    </div>
  ),
});

export default function AnalyticsPage() {
  return <AnalyticsContent />;
}
