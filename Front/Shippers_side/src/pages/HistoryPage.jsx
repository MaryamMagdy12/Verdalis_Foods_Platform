import React, { useEffect, useState, useMemo } from "react";
import "../assets/css/ShipperHistoryPage.css";
import { shipperApi } from "../api";
import { StatusBadge } from "../components/StatusBadge";
import { formatAddress } from "../utils/shipperOrders";

const TABS = [
  { id: "all", label: "All" },
  { id: "delivered", label: "Delivered" },
  { id: "failed", label: "Failed" },
];

export function HistoryPage() {
  const [orders, setOrders] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([shipperApi.history(), shipperApi.performance()])
      .then(([historyRes, perfRes]) => {
        setOrders(historyRes.data || []);
        setPerformance(perfRes.data || null);
      })
      .catch(() => {
        setOrders([]);
        setPerformance(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = [...orders];
    if (tab === "delivered") list = list.filter((o) => o.status === "delivered");
    if (tab === "failed") list = list.filter((o) => o.status === "failed_delivery");
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((o) =>
        [o.order_number, o.client_name, formatAddress(o.address)].some(
          (v) => v && String(v).toLowerCase().includes(q)
        )
      );
    }
    return list;
  }, [orders, tab, search]);

  const delivered = performance?.delivered_total ?? orders.filter((o) => o.status === "delivered").length;
  const failed = performance?.failed_total ?? orders.filter((o) => o.status === "failed_delivery").length;
  const rate = performance?.success_rate ?? (orders.length ? Math.round((delivered / (delivered + failed || 1)) * 1000) / 10 : 100);

  return (
    <div className="sp-page">
      <div className="sp-stats sp-stats--4">
        <div className="sp-stat">
          <div className="sp-stat__icon sp-stat__icon--green"><i className="fa-solid fa-box" aria-hidden /></div>
          <strong>{delivered + failed}</strong>
          <span>Total Deliveries</span>
        </div>
        <div className="sp-stat">
          <div className="sp-stat__icon sp-stat__icon--green"><i className="fa-solid fa-circle-check" aria-hidden /></div>
          <strong>{delivered}</strong>
          <span>Delivered</span>
        </div>
        <div className="sp-stat">
          <div className="sp-stat__icon sp-stat__icon--orange"><i className="fa-solid fa-triangle-exclamation" aria-hidden /></div>
          <strong>{failed}</strong>
          <span>Failed</span>
        </div>
        <div className="sp-stat">
          <div className="sp-stat__icon sp-stat__icon--green"><i className="fa-solid fa-chart-line" aria-hidden /></div>
          <strong>{rate}%</strong>
          <span>Success Rate</span>
        </div>
      </div>

      <div className="sp-history-layout">
        <section>
          <div className="sp-tabs">
            {TABS.map((t) => (
              <button key={t.id} type="button" className={tab === t.id ? "is-active" : ""} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          <label className="sp-search" style={{ display: "flex", marginBottom: "1.25rem" }}>
            <i className="fa-solid fa-magnifying-glass" aria-hidden />
            <input type="search" placeholder="Search by order ID, client or address…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </label>

          {loading ? (
            <p className="sp-empty">Loading history…</p>
          ) : filtered.length === 0 ? (
            <div className="sp-empty">
              <i className="fa-solid fa-clock-rotate-left" aria-hidden />
              <p>No history yet</p>
            </div>
          ) : (
            filtered.map((o) => (
              <article key={o.id} className="sp-history-row">
                <div className={`sp-order-card__icon sp-order-card__icon--${o.status === "delivered" ? "picked" : "failed"}`}>
                  <i className={`fa-solid ${o.status === "delivered" ? "fa-circle-check" : "fa-circle-xmark"}`} aria-hidden />
                </div>
                <div className="sp-history-row__body">
                  <div className="sp-history-row__top">
                    <strong>{o.order_number}</strong>
                    <StatusBadge status={o.status} />
                  </div>
                  <p className="sp-history-row__client">{o.client_name}</p>
                  <p className="sp-history-row__addr"><i className="fa-solid fa-location-dot" aria-hidden /> {formatAddress(o.address)}</p>
                  <div className="sp-history-row__meta">
                    <span>
                      <i className="fa-regular fa-calendar" aria-hidden />{" "}
                      {o.delivered_at ? new Date(o.delivered_at).toLocaleString() : o.created_at ? new Date(o.created_at).toLocaleDateString() : "—"}
                    </span>
                    <strong>${Number(o.total || 0).toFixed(2)}</strong>
                  </div>
                </div>
              </article>
            ))
          )}

          <p className="sp-pagination-info">Showing {filtered.length} deliver{filtered.length !== 1 ? "ies" : "y"}</p>
        </section>

        <aside className="sp-panel">
          <h2>Delivery Performance</h2>
          <div className="sp-mini-metrics" style={{ marginTop: "1rem" }}>
            <div><span>Delivered Today</span><strong>{performance?.delivered_today ?? 0}</strong></div>
            <div><span>Total Delivered</span><strong>{delivered}</strong></div>
            <div><span>Success Rate</span><strong>{rate}%</strong></div>
          </div>
          <h3 style={{ margin: "1.25rem 0 0.75rem", fontSize: "0.95rem" }}>Status Breakdown</h3>
          <div className="sp-donut-placeholder"><span>{delivered + failed} Total</span></div>
        </aside>
      </div>
    </div>
  );
}
