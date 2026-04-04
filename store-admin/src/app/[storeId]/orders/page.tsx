import { CommerceClient } from "@/lib/commerce";
import Link from "next/link";

function formatCents(cents: number) { return `$${(cents / 100).toFixed(2)}`; }

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  pending: { bg: "var(--orange-light)", color: "#b36d00" },
  confirmed: { bg: "var(--blue-light)", color: "var(--gold)" },
  processing: { bg: "var(--blue-light)", color: "var(--gold)" },
  shipped: { bg: "var(--green-light)", color: "var(--green)" },
  delivered: { bg: "var(--green-light)", color: "var(--green)" },
  cancelled: { bg: "var(--bg-grouped)", color: "var(--text-tertiary)" },
  refunded: { bg: "var(--red-light)", color: "var(--red)" },
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
  let orders = [];
  try { orders = await client.getOrders({ status: sp.status, limit: 100 }); } catch {}

  const statuses = ["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="text-xl sm:text-2xl font-bold" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Orders</h1>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {statuses.map((s) => (
          <Link
            key={s}
            href={s === "all" ? `/${storeId}/orders` : `/${storeId}/orders?status=${s}`}
            className={`filter-pill ${(s === "all" && !sp.status) || sp.status === s ? "filter-pill-active" : ""}`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Link>
        ))}
      </div>

      <div className="table-card">
        {orders.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Status</th>
                <th className="text-right">Total</th>
                <th className="text-right hide-mobile">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: { id: string; order_number: string; customer_name: string; customer_email: string; status: string; total: number; created_at: string }) => {
                const s = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
                return (
                  <tr key={order.id}>
                    <td>
                      <Link href={`/${storeId}/orders/${order.id}`} className="text-sm font-semibold" style={{ color: "var(--gold)" }}>
                        {order.order_number}
                      </Link>
                    </td>
                    <td>
                      <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{order.customer_name || "—"}</div>
                      <div className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{order.customer_email}</div>
                    </td>
                    <td>
                      <span className="badge" style={{ background: s.bg, color: s.color }}>{order.status}</span>
                    </td>
                    <td className="text-sm text-right font-semibold" style={{ color: "var(--text-primary)" }}>{formatCents(order.total)}</td>
                    <td className="text-sm text-right hide-mobile" style={{ color: "var(--text-tertiary)" }}>{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="var(--border-strong)" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}
