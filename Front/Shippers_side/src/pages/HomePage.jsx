import React, { useMemo, useState } from "react";
import "../assets/css/ShipperHomePage.css";
import { Link } from "react-router-dom";
import { OrderCard } from "../components/OrderCard";
import { DeliveryRouteMap } from "../components/DeliveryRouteMap";
import { useShipperDashboard } from "../hooks/useShipperDashboard";
import { computeStats, filterOrders, formatAddress, mapsUrl, statusMeta } from "../utils/shipperOrders";

const TABS = [
  { id: "all", label: "All" },
  { id: "assigned", label: "Assigned" },
  { id: "picked_up", label: "Picked Up" },
  { id: "way", label: "On The Way" },
];

const KPI_CONFIG = [
  { key: "assigned", label: "Active Orders", icon: "green" },
  { key: "pickedUp", label: "Picked Up", icon: "blue" },
  { key: "delivered", label: "Delivered Today", icon: "green" },
  { key: "pending", label: "Awaiting Pickup", icon: "orange" },
  { key: "failed", label: "Failed (Total)", icon: "red" },
];

export function HomePage() {
  const { orders, performance, history, loading } = useShipperDashboard();
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  const stats = useMemo(() => computeStats(orders, performance), [orders, performance]);
  const filtered = useMemo(() => filterOrders(orders, tab, search), [orders, tab, search]);
  const progress = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;
  const routeOrders = orders.filter((o) => ["picked_up", "out_for_delivery"].includes(o.status));
  const recentActivity = history.slice(0, 3);

  return (
    <div className="sp-page">
      <div className="sp-stats sp-stats--5">
        {KPI_CONFIG.map((k) => (
          <div key={k.key} className="sp-stat">
            <div className={`sp-stat__icon sp-stat__icon--${k.icon}`}>
              <i className="fa-solid fa-chart-line" aria-hidden />
            </div>
            <strong>{stats[k.key] ?? 0}</strong>
            <span>{k.label}</span>
          </div>
        ))}
      </div>

      <div className="sp-progress-card">
        <h3>Today&apos;s Progress</h3>
        <div className="sp-progress-bar">
          <div className="sp-progress-bar__fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="sp-progress-meta">
          <span>{stats.completed} / {stats.total} orders completed</span>
          <span>{progress}%</span>
        </div>
      </div>

      <div className="sp-dash-grid sp-dash-grid--main">
        <section>
          <div className="sp-panel" style={{ marginBottom: "1rem" }}>
            <div className="sp-panel__head-row">
              <h2>Assigned Orders</h2>
              <Link to="/orders" className="sp-btn sp-btn--primary sp-btn--sm">View All</Link>
            </div>
            <div className="sp-toolbar" style={{ marginBottom: "0.75rem" }}>
              <label className="sp-search">
                <i className="fa-solid fa-magnifying-glass" aria-hidden />
                <input
                  type="search"
                  placeholder="Search order, client or ID…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
            </div>
            <div className="sp-tabs sp-tabs--inline">
              {TABS.map((t) => (
                <button key={t.id} type="button" className={tab === t.id ? "is-active" : ""} onClick={() => setTab(t.id)}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="sp-empty">Loading orders…</p>
          ) : filtered.length === 0 ? (
            <div className="sp-empty">
              <i className="fa-solid fa-inbox" aria-hidden />
              <p>No orders in this view</p>
            </div>
          ) : (
            filtered.slice(0, 6).map((o) => <OrderCard key={o.id} order={o} />)
          )}
        </section>

        <aside className="sp-panel">
          <h2>Today&apos;s Delivery Route</h2>
          <DeliveryRouteMap stops={routeOrders} tall />
          <ul className="sp-stop-list">
            {routeOrders.length === 0 ? (
              <li className="sp-stop-list__row"><span>No active stops</span></li>
            ) : (
              routeOrders.slice(0, 4).map((o, i) => (
                <li key={o.id} className="sp-stop-list__row">
                  <span>Stop {i + 1}: {o.client_name}</span>
                  <span className="sp-badge sp-badge--way">{statusMeta(o.status).label}</span>
                </li>
              ))
            )}
          </ul>
          {routeOrders[0] && (
            <a href={mapsUrl(routeOrders[0].address)} target="_blank" rel="noreferrer" className="sp-btn sp-btn--primary sp-btn--block" style={{ marginTop: "1rem" }}>
              Open Route in Google Maps
            </a>
          )}
        </aside>
      </div>

      <div className="sp-dash-widgets">
        <div className="sp-panel">
          <h2>Performance Overview</h2>
          <div className="sp-mini-metrics">
            <div><span>Delivered Today</span><strong>{performance?.delivered_today ?? 0}</strong></div>
            <div><span>Success Rate</span><strong>{stats.successRate}%</strong></div>
            <div><span>Total Completed</span><strong>{performance?.delivered_total ?? 0}</strong></div>
          </div>
        </div>
        <div className="sp-panel">
          <h2>Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <p className="sp-empty" style={{ padding: "1rem 0" }}>No recent deliveries</p>
          ) : (
            <ul className="sp-activity-list">
              {recentActivity.map((o) => (
                <li key={o.id}>
                  <i className={`fa-solid ${o.status === "delivered" ? "fa-circle-check" : "fa-circle-xmark"}`} aria-hidden />
                  <div>
                    <strong>{o.order_number} — {o.client_name}</strong>
                    <span>{formatAddress(o.address)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="sp-panel">
          <h2>Quick Actions</h2>
          <div style={{ display: "grid", gap: "0.5rem" }}>
            <Link to="/scan" className="sp-btn sp-btn--primary sp-btn--block">Scan Pickup QR</Link>
            <Link to="/route" className="sp-btn sp-btn--outline sp-btn--block">View Route</Link>
            <Link to="/history" className="sp-btn sp-btn--outline sp-btn--block">Delivery History</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
