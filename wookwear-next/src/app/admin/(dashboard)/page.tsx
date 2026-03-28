import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { StatsCard } from "@/components/admin/ui/StatsCard";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { formatPrice } from "@/lib/utils";

async function getDashboardStats() {
  const supabase = createAdminClient();

  const [products, outOfStock, orders, subscribers, reviews] =
    await Promise.all([
      supabase
        .from("products")
        .select("id", { count: "exact", head: true }) as any,
      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("in_stock", false) as any,
      supabase
        .from("orders")
        .select("id, total, status, customer_email, created_at")
        .order("created_at", { ascending: false })
        .limit(10) as any,
      supabase
        .from("newsletter_subscribers")
        .select("id", { count: "exact", head: true }) as any,
      supabase
        .from("reviews")
        .select("id", { count: "exact", head: true })
        .eq("approved", false) as any,
    ]);

  const totalRevenue =
    orders.data?.reduce(
      (sum: number, o: { total: number }) => sum + (o.total || 0),
      0
    ) ?? 0;

  return {
    totalProducts: products.count ?? 0,
    outOfStockCount: outOfStock.count ?? 0,
    totalOrders: orders.data?.length ?? 0,
    recentOrders: orders.data ?? [],
    totalRevenue,
    subscriberCount: subscribers.count ?? 0,
    pendingReviews: reviews.count ?? 0,
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-head text-2xl font-bold text-ww-white">
            Dashboard
          </h1>
          <p className="text-sm text-ww-muted mt-0.5">
            Welcome back. Here&apos;s what&apos;s happening with your store.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 bg-ww-purple hover:bg-ww-purple/80 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Add Product
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Products"
          value={stats.totalProducts}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          }
        />
        <StatsCard
          label="Total Orders"
          value={stats.totalOrders}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          }
        />
        <StatsCard
          label="Revenue"
          value={formatPrice(stats.totalRevenue / 100)}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          label="Subscribers"
          value={stats.subscriberCount}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          }
        />
      </div>

      {/* Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Out of Stock Alert */}
        {stats.outOfStockCount > 0 && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-red-400">
                  {stats.outOfStockCount} product{stats.outOfStockCount !== 1 ? "s" : ""} out of stock
                </p>
                <Link
                  href="/admin/products"
                  className="text-xs text-red-400/70 hover:text-red-400 transition-colors"
                >
                  View products &rarr;
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Pending Reviews */}
        {stats.pendingReviews > 0 && (
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-400">
                  {stats.pendingReviews} review{stats.pendingReviews !== 1 ? "s" : ""} pending approval
                </p>
                <Link
                  href="/admin/reviews"
                  className="text-xs text-yellow-400/70 hover:text-yellow-400 transition-colors"
                >
                  Moderate reviews &rarr;
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-ww-dark border border-ww-border rounded-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-ww-border">
          <h2 className="font-head font-semibold text-ww-white">
            Recent Orders
          </h2>
          <Link
            href="/admin/orders"
            className="text-xs text-ww-purple hover:text-ww-purple/80 transition-colors"
          >
            View all &rarr;
          </Link>
        </div>
        {stats.recentOrders.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-ww-muted">
              No orders yet. They&apos;ll appear here once customers start
              ordering.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-ww-border/50">
                <th className="text-left text-xs font-medium text-ww-muted uppercase px-5 py-2.5">
                  Customer
                </th>
                <th className="text-left text-xs font-medium text-ww-muted uppercase px-5 py-2.5">
                  Status
                </th>
                <th className="text-right text-xs font-medium text-ww-muted uppercase px-5 py-2.5">
                  Total
                </th>
                <th className="text-right text-xs font-medium text-ww-muted uppercase px-5 py-2.5">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map(
                (order: {
                  id: string;
                  customer_email: string;
                  status: string;
                  total: number;
                  created_at: string;
                }) => (
                  <tr
                    key={order.id}
                    className="border-b border-ww-border/30 last:border-0"
                  >
                    <td className="px-5 py-3 text-sm text-ww-text">
                      {order.customer_email}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-3 text-sm text-ww-text text-right">
                      {formatPrice(order.total / 100)}
                    </td>
                    <td className="px-5 py-3 text-sm text-ww-muted text-right">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/products/new"
          className="flex items-center gap-3 bg-ww-dark border border-ww-border rounded-lg p-4 hover:border-ww-purple/30 transition-colors group"
        >
          <div className="w-10 h-10 rounded-lg bg-ww-purple/10 flex items-center justify-center text-ww-purple group-hover:bg-ww-purple/20 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-ww-white">Add Product</p>
            <p className="text-xs text-ww-muted">Create a new listing</p>
          </div>
        </Link>

        <Link
          href="/admin/blog/new"
          className="flex items-center gap-3 bg-ww-dark border border-ww-border rounded-lg p-4 hover:border-ww-purple/30 transition-colors group"
        >
          <div className="w-10 h-10 rounded-lg bg-ww-cyan/10 flex items-center justify-center text-ww-cyan group-hover:bg-ww-cyan/20 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-ww-white">Write Post</p>
            <p className="text-xs text-ww-muted">Create a blog entry</p>
          </div>
        </Link>

        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 bg-ww-dark border border-ww-border rounded-lg p-4 hover:border-ww-purple/30 transition-colors group"
        >
          <div className="w-10 h-10 rounded-lg bg-ww-pink/10 flex items-center justify-center text-ww-pink group-hover:bg-ww-pink/20 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-ww-white">View Store</p>
            <p className="text-xs text-ww-muted">Open storefront</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
