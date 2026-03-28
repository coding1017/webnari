import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { EmptyState } from "@/components/admin/ui/EmptyState";

async function getOrders() {
  const supabase = createAdminClient();
  const { data } = (await supabase
    .from("orders")
    .select("*, order_items(id)")
    .order("created_at", { ascending: false })) as { data: any[] | null };

  return data ?? [];
}

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-head text-2xl font-bold text-ww-white">Orders</h1>
        <p className="text-sm text-ww-muted mt-0.5">
          {orders.length} total order{orders.length !== 1 ? "s" : ""}
        </p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          }
          title="No orders yet"
          description="Orders will appear here once customers start purchasing through Stripe."
        />
      ) : (
        <div className="bg-ww-dark border border-ww-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ww-border">
                <th className="text-left text-xs font-medium text-ww-muted uppercase px-4 py-3">Order</th>
                <th className="text-left text-xs font-medium text-ww-muted uppercase px-4 py-3">Customer</th>
                <th className="text-left text-xs font-medium text-ww-muted uppercase px-4 py-3">Items</th>
                <th className="text-left text-xs font-medium text-ww-muted uppercase px-4 py-3">Status</th>
                <th className="text-right text-xs font-medium text-ww-muted uppercase px-4 py-3">Total</th>
                <th className="text-right text-xs font-medium text-ww-muted uppercase px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => (
                <tr key={order.id} className="border-b border-ww-border/50 last:border-0 hover:bg-ww-surface/30 transition-colors">
                  <td className="px-4 py-3 text-sm text-ww-white font-mono">
                    {order.id.slice(0, 8)}...
                  </td>
                  <td className="px-4 py-3 text-sm text-ww-text">
                    {order.customer_email}
                  </td>
                  <td className="px-4 py-3 text-sm text-ww-text">
                    {order.order_items?.length || 0}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-ww-text text-right">
                    {formatPrice(order.total / 100)}
                  </td>
                  <td className="px-4 py-3 text-sm text-ww-muted text-right">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
