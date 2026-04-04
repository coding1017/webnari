"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getAnalytics } from "@/app/[storeId]/actions/commerce-actions";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

function formatCents(cents: number) {
  return "$" + (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 });
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#ff9500",
  confirmed: "#007aff",
  processing: "#5856d6",
  shipped: "#34c759",
  delivered: "#30b0c7",
  cancelled: "#8e8e93",
  refunded: "#ff3b30",
};

const RANGES = [
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "90 Days" },
  { value: "all", label: "All Time" },
];

interface AnalyticsData {
  range: string;
  revenue: { total: number; previous: number; change: number };
  orders: { total: number; previous: number; change: number };
  customers: { total: number; new: number; returning: number };
  avgOrderValue: number;
  revenueByDay: { date: string; revenue: number; orders: number }[];
  statusBreakdown: Record<string, number>;
  topProducts: { name: string; revenue: number; quantity: number }[];
}

function ChangeIndicator({ value }: { value: number }) {
  if (value === 0) return <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>—</span>;
  const isPositive = value > 0;
  return (
    <span style={{ fontSize: "12px", fontWeight: 600, color: isPositive ? "var(--green)" : "var(--red)" }}>
      {isPositive ? "↑" : "↓"} {Math.abs(value)}%
    </span>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--bg-elevated)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-sm)",
      padding: "10px 14px",
      boxShadow: "var(--shadow-md)",
      fontSize: "13px",
    }}>
      <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>{formatShortDate(label)}</div>
      {payload.map((p: { name: string; value: number; color: string }, i: number) => (
        <div key={i} style={{ color: p.color, display: "flex", justifyContent: "space-between", gap: "16px" }}>
          <span>{p.name === "revenue" ? "Revenue" : "Orders"}</span>
          <span style={{ fontWeight: 600 }}>{p.name === "revenue" ? formatCents(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const params = useParams();
  const storeId = params.storeId as string;

  const [range, setRange] = useState("30d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAnalytics(storeId, range).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [storeId, range]);

  const statusData = data ? Object.entries(data.statusBreakdown).map(([name, value]) => ({ name, value })) : [];

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: "28px" }}>
        <div>
          <h1 className="heading-lg">Analytics</h1>
          <p style={{ fontSize: "14px", color: "var(--text-tertiary)", marginTop: "4px" }}>
            Track your store performance
          </p>
        </div>

        {/* Range selector */}
        <div style={{ display: "flex", gap: "4px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "3px" }}>
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              style={{
                padding: "6px 14px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                background: range === r.value ? "var(--gold)" : "transparent",
                color: range === r.value ? "white" : "var(--text-tertiary)",
                transition: "all 0.15s",
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-tertiary)" }}>Loading analytics...</div>
      ) : !data ? (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--red)" }}>Failed to load analytics data.</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5" style={{ marginBottom: "28px" }}>
            {[
              { label: "REVENUE", value: formatCents(data.revenue.total), change: data.revenue.change, accent: "#34c759" },
              { label: "ORDERS", value: data.orders.total.toString(), change: data.orders.change, accent: "#007aff" },
              { label: "CUSTOMERS", value: data.customers.total.toString(), sub: `${data.customers.new} new, ${data.customers.returning} returning`, accent: "#5856d6" },
              { label: "AVG ORDER", value: formatCents(data.avgOrderValue), accent: "#B8892A" },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="bg-white relative overflow-hidden"
                style={{ borderRadius: "var(--radius-lg)", padding: "20px", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-sm)" }}
              >
                <div className="absolute top-0 left-0 right-0" style={{ height: "3px", background: kpi.accent }} />
                <div className="label-caps" style={{ marginBottom: "8px" }}>{kpi.label}</div>
                <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
                  {kpi.value}
                </div>
                <div style={{ marginTop: "4px" }}>
                  {kpi.change !== undefined ? <ChangeIndicator value={kpi.change} /> : null}
                  {kpi.sub && <span style={{ fontSize: "12px", color: "var(--text-tertiary)", marginLeft: "8px" }}>{kpi.sub}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Revenue Chart */}
          <div className="card-section" style={{ marginBottom: "24px" }}>
            <div className="card-section-header">
              <h2 className="heading-sm">Revenue Over Time</h2>
            </div>
            <div style={{ padding: "20px 16px 12px" }}>
              {data.revenueByDay.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={data.revenueByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatShortDate}
                      tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
                      axisLine={{ stroke: "var(--border)" }}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tickFormatter={(v) => "$" + (v / 100).toFixed(0)}
                      tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
                      axisLine={false}
                      tickLine={false}
                      width={50}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#B8892A"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, fill: "#B8892A", strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--text-tertiary)", fontSize: "14px" }}>
                  No revenue data for this period
                </div>
              )}
            </div>
          </div>

          {/* Orders + Status Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" style={{ marginBottom: "24px" }}>
            {/* Orders per day */}
            <div className="card-section">
              <div className="card-section-header">
                <h2 className="heading-sm">Orders Per Day</h2>
              </div>
              <div style={{ padding: "20px 16px 12px" }}>
                {data.revenueByDay.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data.revenueByDay}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={formatShortDate}
                        tick={{ fontSize: 10, fill: "var(--text-tertiary)" }}
                        axisLine={{ stroke: "var(--border)" }}
                        tickLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "var(--text-tertiary)" }}
                        axisLine={false}
                        tickLine={false}
                        width={30}
                        allowDecimals={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="orders" fill="#B8892A" radius={[4, 4, 0, 0]} maxBarSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ textAlign: "center", padding: "40px", color: "var(--text-tertiary)", fontSize: "13px" }}>
                    No orders in this period
                  </div>
                )}
              </div>
            </div>

            {/* Status breakdown */}
            <div className="card-section">
              <div className="card-section-header">
                <h2 className="heading-sm">Order Status</h2>
              </div>
              <div style={{ padding: "20px", display: "flex", alignItems: "center", gap: "20px" }}>
                {statusData.length > 0 ? (
                  <>
                    <ResponsiveContainer width={140} height={140}>
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={65}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {statusData.map((entry, i) => (
                            <Cell key={i} fill={STATUS_COLORS[entry.name] || "#8e8e93"} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ flex: 1 }}>
                      {statusData.map((entry) => (
                        <div key={entry.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: STATUS_COLORS[entry.name] || "#8e8e93" }} />
                            <span style={{ fontSize: "13px", color: "var(--text-secondary)", textTransform: "capitalize" }}>{entry.name}</span>
                          </div>
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: "center", width: "100%", padding: "30px", color: "var(--text-tertiary)", fontSize: "13px" }}>
                    No orders to show
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Top Products */}
          {data.topProducts.length > 0 && (
            <div className="card-section">
              <div className="card-section-header">
                <h2 className="heading-sm">Top Products</h2>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th className="text-center">Sold</th>
                    <th className="text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topProducts.map((p, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>{p.name}</td>
                      <td className="text-center">{p.quantity}</td>
                      <td className="text-right" style={{ fontWeight: 600, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
                        {formatCents(p.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
