import { CommerceClient } from "@/lib/commerce";
import Link from "next/link";

function formatCents(cents: number) { return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`; }
function formatDate(d: string) { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }); }

const STATUS_MAP: Record<string, { badge: string; label: string }> = {
  pending:    { badge: "badge-orange", label: "Pending" },
  confirmed:  { badge: "badge-blue",   label: "Confirmed" },
  processing: { badge: "badge-blue",   label: "Processing" },
  shipped:    { badge: "badge-green",  label: "Shipped" },
  delivered:  { badge: "badge-green",  label: "Delivered" },
  cancelled:  { badge: "badge-gray",   label: "Cancelled" },
  refunded:   { badge: "badge-red",    label: "Refunded" },
};

export default async function DashboardPage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  const client = new CommerceClient(storeId);

  let stats;
  try { stats = await client.getStats(); }
  catch { return <div className="card"><p style={{ color: "var(--red)" }}>Failed to load dashboard. Check your API connection.</p></div>; }

  const kpis = [
    { label: "MONTHLY REVENUE", value: formatCents(stats.revenueThisMonth), sub: `${formatCents(stats.totalRevenue)} total`, icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", accent: "#34c759" },
    { label: "ORDERS", value: stats.totalOrders, sub: `${stats.ordersThisMonth} this month`, icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", accent: "#007aff" },
    { label: "PRODUCTS", value: stats.totalProducts, sub: `${stats.outOfStockCount} out of stock`, icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", accent: "#5856d6" },
    { label: "LOW STOCK", value: stats.lowStockCount, sub: stats.lowStockCount > 0 ? "Items need restock" : "All stocked", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z", accent: stats.lowStockCount > 0 ? "#ff9500" : "#34c759" },
  ];

  return (
    <div className="fade-in">
      {/* ── Header ────────────────────────────────────── */}
      <div className="flex items-center justify-between" style={{ marginBottom: "32px" }}>
        <div>
          <h1 className="heading-lg">Dashboard</h1>
          <p style={{ fontSize: "14px", color: "var(--text-tertiary)", marginTop: "4px" }}>Welcome back. Here&apos;s what&apos;s happening with your store.</p>
        </div>
        <Link href={`/${storeId}/products/new`} className="btn btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </Link>
      </div>

      {/* ── KPI Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5" style={{ marginBottom: "32px" }}>
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white relative overflow-hidden"
            style={{
              borderRadius: "var(--radius-lg)",
              padding: "24px",
              border: "1px solid var(--border-subtle)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            {/* Accent bar */}
            <div className="absolute top-0 left-0 right-0" style={{ height: "3px", background: kpi.accent }} />

            {/* Icon + label row */}
            <div className="flex items-center justify-between" style={{ marginBottom: "16px" }}>
              <span className="label-caps">{kpi.label}</span>
              <div
                className="flex items-center justify-center"
                style={{
                  width: "32px", height: "32px",
                  borderRadius: "var(--radius-sm)",
                  background: `${kpi.accent}12`,
                }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke={kpi.accent} strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={kpi.icon} />
                </svg>
              </div>
            </div>

            {/* Value */}
            <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: "6px", fontVariantNumeric: "tabular-nums" }}>
              {kpi.value}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Alerts ─────────────────────────────────────── */}
      {stats.pendingReviews > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: "24px", borderRadius: "var(--radius-md)" }}>
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="flex-1">{stats.pendingReviews} review{stats.pendingReviews !== 1 ? "s" : ""} pending approval</span>
          <Link href={`/${storeId}/reviews`} className="text-link" style={{ fontSize: "12px" }}>Review &rarr;</Link>
        </div>
      )}

      {/* ── Recent Orders ──────────────────────────────── */}
      <div className="card-section">
        <div className="card-section-header">
          <h2 className="heading-sm">Recent Orders</h2>
          <Link href={`/${storeId}/orders`} className="text-link" style={{ fontSize: "12px" }}>View all &rarr;</Link>
        </div>

        {stats.recentOrders?.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th className="hide-mobile">Customer</th>
                <th>Status</th>
                <th className="text-right">Total</th>
                <th className="text-right hide-mobile">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((o: { id: string; orderNumber: string; customerName: string; customerEmail: string; status: string; total: number; createdAt: string }) => {
                const s = STATUS_MAP[o.status] || STATUS_MAP.pending;
                return (
                  <tr key={o.id}>
                    <td><Link href={`/${storeId}/orders/${o.id}`} className="text-link">{o.orderNumber}</Link></td>
                    <td className="hide-mobile" style={{ color: "var(--text-secondary)" }}>{o.customerName || o.customerEmail}</td>
                    <td><span className={`badge ${s.badge}`}>{s.label}</span></td>
                    <td className="text-right" style={{ fontWeight: 600, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>{formatCents(o.total)}</td>
                    <td className="text-right hide-mobile" style={{ color: "var(--text-tertiary)", fontSize: "13px" }}>{formatDate(o.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <svg className="mx-auto" style={{ width: "48px", height: "48px", marginBottom: "12px" }} fill="none" viewBox="0 0 24 24" stroke="var(--border-strong)" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-tertiary)" }}>No orders yet</p>
            <p style={{ fontSize: "12px", color: "var(--text-quaternary)", marginTop: "4px" }}>Orders will appear here once customers start buying</p>
          </div>
        )}
      </div>
    </div>
  );
}
