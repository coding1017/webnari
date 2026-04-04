"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCustomers } from "@/app/[storeId]/actions/commerce-actions";

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

  useEffect(() => {
    getCustomers(storeId).then(setCustomers).catch(() => {});
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
    </div>
  );
}
