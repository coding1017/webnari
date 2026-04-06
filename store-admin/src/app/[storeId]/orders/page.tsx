import { CommerceClient } from "@/lib/commerce";
import Link from "next/link";

function formatCents(cents: number) { return `$${(cents / 100).toFixed(2)}`; }

const STATUS_BADGE: Record<string, string> = {
  pending: "badge-orange",
  confirmed: "badge-blue",
  processing: "badge-blue",
  shipped: "badge-green",
  delivered: "badge-green",
  cancelled: "badge-gray",
  refunded: "badge-red",
};

export default async function OrdersPage({
  params, searchParams,
}: {
  params: Promise<{ storeId: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { storeId } = await params;
  const sp = await searchParams;
  const client = new CommerceClient(storeId);
  let orders: { id: string; order_number: string; customer_name: string; customer_email: string; status: string; total: number; created_at: string }[] = [];
  try { orders = await client.getOrders({ status: sp.status, limit: 100 }); } catch {}

  const statuses = ["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];
  const activeFilter = sp.status || "all";

  // KPI stats
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const pendingCount = orders.filter(o => o.status === "pending").length;
  const shippedCount = orders.filter(o => o.status === "shipped" || o.status === "delivered").length;

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between" style={{ marginBottom: "28px" }}>
        <div>
          <h1 className="heading-lg">Orders</h1>
          <p style={{ fontSize: "14px", color: "var(--text-tertiary)", marginTop: "4px" }}>
            Manage and track customer orders
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5" style={{ marginBottom: "24px" }}>
        {[
          { label: "TOTAL ORDERS", value: totalOrders.toString(), accent: "#5856d6" },
          { label: "REVENUE", value: formatCents(totalRevenue), accent: "#34c759" },
          { label: "PENDING", value: pendingCount.toString(), accent: "#ff9500" },
          { label: "SHIPPED", value: shippedCount.toString(), accent: "#007aff" },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white relative overflow-hidden" style={{ borderRadius: "var(--radius-lg)", padding: "20px", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-sm)" }}>
            <div className="absolute top-0 left-0 right-0" style={{ height: "3px", background: kpi.accent }} />
            <div className="label-caps" style={{ marginBottom: "8px" }}>{kpi.label}</div>
            <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2" style={{ marginBottom: "16px" }}>
        <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Filter:</span>
        {statuses.map((s) => (
          <Link
            key={s}
            href={s === "all" ? `/${storeId}/orders` : `/${storeId}/orders?status=${s}`}
            className={`badge ${activeFilter === s ? "badge-gold" : "badge-gray"}`}
            style={{ textDecoration: "none", cursor: "pointer" }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Link>
        ))}
      </div>

      {/* Orders table */}
      <div className="card-section">
        {orders.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th className="text-center">Status</th>
                <th className="text-right">Total</th>
                <th className="text-right hide-mobile">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link href={`/${storeId}/orders/${order.id}`} style={{ fontWeight: 600, color: "var(--gold)", textDecoration: "none" }}>
                      {order.order_number}
                    </Link>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, color: "var(--text-primary)", fontSize: "13px" }}>{order.customer_name || "—"}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginTop: "1px" }}>{order.customer_email}</div>
                  </td>
                  <td className="text-center">
                    <span className={`badge ${STATUS_BADGE[order.status] || "badge-gray"}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="text-right" style={{ fontWeight: 600, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
                    {formatCents(order.total)}
                  </td>
                  <td className="text-right hide-mobile" style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <svg className="mx-auto" style={{ width: "48px", height: "48px", marginBottom: "12px" }} fill="none" viewBox="0 0 24 24" stroke="var(--border-strong)" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)" }}>No orders found</p>
            <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "4px" }}>
              {activeFilter !== "all" ? "Try a different filter" : "Orders will appear here as customers place them"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
