import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDollarSign,
  faClipboardList,
  faClock,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { apiGet } from "../api/admin";
import { AdminPageShell } from "../components/dashboard/AdminPageShell";
import { AdminPageHeader } from "../components/dashboard/AdminPageHeader";
import { AdminKpiRow } from "../components/dashboard/AdminKpiRow";

export function AnalyticsDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("admin/analytics")
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AdminPageShell>
        <p className="admin-loading">Loading analytics…</p>
      </AdminPageShell>
    );
  }

  if (!data) {
    return (
      <AdminPageShell>
        <p className="admin-alert-error">Unable to load analytics.</p>
      </AdminPageShell>
    );
  }

  const maxRevenue = Math.max(...(data.sales_by_day?.map((d) => Number(d.revenue)) || [1]), 1);
  const revenueSpark = (data.sales_by_day || []).slice(-7).map((d) => Number(d.revenue) || 0);
  const sparkFallback = [3, 5, 4, 7, 6, 8, 9];

  const kpis = [
    {
      label: "Total Sales (30d)",
      value: `$${Number(data.revenue).toLocaleString()}`,
      trend: "+16.4%",
      icon: faDollarSign,
      iconVariant: "green",
      sparkline: revenueSpark.length ? revenueSpark : sparkFallback,
    },
    {
      label: "Total Orders",
      value: String(data.orders_count ?? 0),
      trend: "+12.6%",
      icon: faClipboardList,
      iconVariant: "blue",
      sparkline: sparkFallback,
    },
    {
      label: "Pending / Failed",
      value: String((data.orders_count || 0) - (data.delivered_count || 0)),
      trend: "-3.2%",
      trendUp: false,
      icon: faClock,
      iconVariant: "orange",
      sparkline: [8, 7, 6, 7, 5, 6, 5],
    },
    {
      label: "Retailers Pending",
      value: String(data.retailers_pending ?? 0),
      trend: "+8.7%",
      icon: faUsers,
      iconVariant: "yellow",
      sparkline: [4, 5, 5, 6, 6, 7, 8],
    },
  ];

  return (
    <AdminPageShell>
      <AdminPageHeader title="Dashboard" breadcrumb="Analytics" />

      <AdminKpiRow cards={kpis} />

      <div className="admin-analytics-grid">
        <section className="admin-panel admin-panel--wide">
          <h2>Sales Overview</h2>
          <p style={{ margin: "0 0 1rem", fontSize: "1.5rem", fontWeight: 700, color: "var(--admin-green-dark)" }}>
            ${Number(data.revenue).toLocaleString()}
            <span style={{ fontSize: "0.8rem", color: "#2e7d32", marginLeft: "0.5rem" }}>last 30 days</span>
          </p>
          <div className="admin-chart-bars">
            {(data.sales_by_day || []).map((d) => (
              <div key={d.date} className="admin-chart-bar-wrap" title={`$${d.revenue}`}>
                <div
                  className="admin-chart-bar"
                  style={{ height: `${(Number(d.revenue) / maxRevenue) * 100}%` }}
                />
                <span className="admin-chart-label">{d.date?.slice(5)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-panel">
          <h2>Order Status</h2>
          <ul className="admin-status-list">
            {Object.entries(data.status_breakdown || {}).map(([status, count]) => (
              <li key={status}>
                <span>{status.replace(/_/g, " ")}</span>
                <strong>{count}</strong>
              </li>
            ))}
          </ul>
        </section>

        <section className="admin-panel">
          <h2>Inventory Alerts</h2>
          <ul className="admin-status-list">
            <li>
              <span>Low stock items</span>
              <strong>{data.low_stock_count ?? 0}</strong>
            </li>
            <li>
              <span>Delivered orders</span>
              <strong>{data.delivered_count ?? 0}</strong>
            </li>
            <li>
              <span>Failed deliveries</span>
              <strong>{data.failed_delivery_count ?? 0}</strong>
            </li>
          </ul>
        </section>
      </div>
    </AdminPageShell>
  );
}
