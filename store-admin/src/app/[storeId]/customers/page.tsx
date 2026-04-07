"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCustomers, getAnalytics } from "@/app/[storeId]/actions/commerce-actions";

function formatCents(cents: number) { return "$" + (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 }); }

interface Customer {
  email: string;
  name: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: string;
  lastOrderStatus: string;
  firstOrderDate: string;
}

export default function CustomersPage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [analytics, setAnalytics] = useState<{
    customers?: { total: number; new: number; returning: number };
    revenueByDay?: { date: string; revenue: number; orders: number }[];
  } | null>(null);

  useEffect(() => {
    getCustomers(storeId).then(setCustomers).catch(() => {});
    getAnalytics(storeId).then(setAnalytics).catch(() => {});
  }, [storeId]);

  const filtered = search
    ? customers.filter(c => c.email.toLowerCase().includes(search.toLowerCase()) || c.name.toLowerCase().includes(search.toLowerCase()))
    : customers;

  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgLifetimeValue = totalCustomers > 0 ? Math.round(totalRevenue / totalCustomers) : 0;
  const repeatCustomers = customers.filter(c => c.orderCount > 1).length;

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between" style={{ marginBottom: "28px" }}>
        <div>
          <h1 className="heading-lg">Customers</h1>
          <p style={{ fontSize: "14px", color: "var(--text-tertiary)", marginTop: "4px" }}>
            {totalCustomers} total customers
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5" style={{ marginBottom: "24px" }}>
        {[
          { label: "TOTAL CUSTOMERS", value: totalCustomers, accent: "#5856d6" },
          { label: "TOTAL REVENUE", value: formatCents(totalRevenue), accent: "#34c759" },
          { label: "AVG LIFETIME VALUE", value: formatCents(avgLifetimeValue), accent: "#B8892A" },
          { label: "REPEAT CUSTOMERS", value: repeatCustomers, accent: "#007aff" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white relative overflow-hidden" style={{ borderRadius: "var(--radius-lg)", padding: "20px", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-sm)" }}>
            <div className="absolute top-0 left-0 right-0" style={{ height: "3px", background: kpi.accent }} />
            <div className="label-caps" style={{ marginBottom: "8px" }}>{kpi.label}</div>
            <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Customer Insights */}
      <div style={{ marginBottom: "24px" }}>
        <div className="label-caps" style={{ marginBottom: "12px", padding: "0 4px" }}>Customer Insights</div>
        <div className="grid grid-cols-3 gap-4">
          <div style={{ padding: "16px 18px", background: "var(--bg-grouped)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <div className="flex items-center gap-2" style={{ marginBottom: "6px" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px", color: "#34c759" }}>
                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
              </svg>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-tertiary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>New This Month</span>
            </div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{analytics?.customers?.new || 0}</div>
          </div>
          <div style={{ padding: "16px 18px", background: "var(--bg-grouped)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <div className="flex items-center gap-2" style={{ marginBottom: "6px" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px", color: "#007aff" }}>
                <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
              </svg>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-tertiary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Returning</span>
            </div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{analytics?.customers?.returning || 0}</div>
          </div>
          <div style={{ padding: "16px 18px", background: "var(--bg-grouped)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <div className="flex items-center gap-2" style={{ marginBottom: "6px" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px", color: "#B8892A" }}>
                <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
              </svg>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-tertiary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Active Rate</span>
            </div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{totalCustomers > 0 ? Math.round(((analytics?.customers?.returning || 0) / totalCustomers) * 100) : 0}%</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: "20px" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          style={{ maxWidth: "320px" }}
        />
      </div>

      {/* Table */}
      <div className="card-section">
        {filtered.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th className="text-center">Orders</th>
                <th className="text-right">Total Spent</th>
                <th className="hide-mobile">First Order</th>
                <th className="hide-mobile">Last Order</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.email}>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "14px" }}>{c.name || "—"}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{c.email}</div>
                    {c.phone && <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{c.phone}</div>}
                  </td>
                  <td className="text-center">
                    <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{c.orderCount}</span>
                    {c.orderCount > 1 && <span className="badge badge-blue" style={{ fontSize: "9px", marginLeft: "6px", padding: "1px 6px" }}>Repeat</span>}
                  </td>
                  <td className="text-right" style={{ fontWeight: 600, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
                    {formatCents(c.totalSpent)}
                  </td>
                  <td className="hide-mobile" style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                    {new Date(c.firstOrderDate).toLocaleDateString()}
                  </td>
                  <td className="hide-mobile" style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                    {new Date(c.lastOrderDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <svg className="mx-auto" style={{ width: "48px", height: "48px", marginBottom: "12px" }} fill="none" viewBox="0 0 24 24" stroke="var(--border-strong)" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)" }}>No customers yet</p>
            <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "4px" }}>Customers will appear here after their first order</p>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {customers.length > 0 && (
        <div className="card-section" style={{ marginTop: "24px" }}>
          <div className="card-section-header">
            <span className="heading-sm">Recent Activity</span>
          </div>
          <div style={{ padding: "4px 0" }}>
            {customers
              .filter(c => c.lastOrderDate)
              .sort((a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime())
              .slice(0, 8)
              .map((c, i) => (
                <div key={i} className="flex items-center gap-3" style={{ padding: "12px 24px", borderBottom: i < 7 ? "1px solid var(--border-subtle)" : "none" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--gradient-gold)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "12px", fontWeight: 700, flexShrink: 0 }}>
                    {(c.name || c.email).charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{c.name || c.email}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                      {c.orderCount} order{c.orderCount !== 1 ? "s" : ""} · {formatCents(c.totalSpent)} total
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                      {new Date(c.lastOrderDate).toLocaleDateString()}
                    </div>
                    <span className={`badge ${c.lastOrderStatus === 'delivered' ? 'badge-green' : c.lastOrderStatus === 'shipped' ? 'badge-blue' : 'badge-gray'}`} style={{ fontSize: "10px" }}>
                      {c.lastOrderStatus}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
