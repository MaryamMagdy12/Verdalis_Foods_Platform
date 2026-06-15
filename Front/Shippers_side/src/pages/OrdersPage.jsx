import React, { useEffect, useState, useMemo } from "react";
import "../assets/css/ShipperOrdersPage.css";
import { Link } from "react-router-dom";
import { OrderCard } from "../components/OrderCard";
import { StatusBadge } from "../components/StatusBadge";
import { useShipperDashboard } from "../hooks/useShipperDashboard";
import { computeStats, filterOrders, formatAddress, mapsUrl, paymentLabel } from "../utils/shipperOrders";

const TABS = [
  { id: "all", label: "All" },
  { id: "assigned", label: "Assigned" },
  { id: "picked_up", label: "Picked Up" },
  { id: "way", label: "On The Way" },
];

export function OrdersPage() {
  const { orders, performance, loading } = useShipperDashboard();
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const stats = useMemo(() => computeStats(orders, performance), [orders, performance]);
  const filtered = useMemo(() => filterOrders(orders, tab, search), [orders, tab, search]);
  const selected = filtered.find((o) => o.id === selectedId) || filtered[0];

  useEffect(() => {
    if (filtered.length && !filtered.some((o) => o.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  const tabCounts = {
    all: orders.length,
    assigned: orders.filter((o) => o.status === "ready_for_pickup").length,
    picked_up: orders.filter((o) => o.status === "picked_up").length,
    way: orders.filter((o) => o.status === "out_for_delivery").length,
  };

  return (
    <div className="sp-page sp-page--orders">
      <div className="sp-stats sp-stats--4 sp-ui-desktop-only" style={{ marginBottom: "1rem" }}>
        <div className="sp-stat"><strong>{stats.assigned}</strong><span>Active Orders</span></div>
        <div className="sp-stat"><strong>${orders.reduce((s, o) => s + Number(o.total || 0), 0).toFixed(0)}</strong><span>Route Value</span></div>
        <div className="sp-stat"><strong>{stats.pending}</strong><span>Awaiting Pickup</span></div>
        <div className="sp-stat"><strong>{performance?.delivered_today ?? 0}</strong><span>Delivered Today</span></div>
      </div>

      <div className="sp-orders-layout">
        <section className="sp-orders-list">
          <div className="sp-tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={tab === t.id ? "is-active" : ""}
                onClick={() => setTab(t.id)}
              >
                {t.label} ({tabCounts[t.id] ?? 0})
              </button>
            ))}
          </div>

          <div className="sp-toolbar">
            <label className="sp-search">
              <i className="fa-solid fa-magnifying-glass" aria-hidden />
              <input
                type="search"
                placeholder="Search orders or clients…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          </div>

          {loading ? (
            <p className="sp-empty">Loading orders…</p>
          ) : filtered.length === 0 ? (
            <div className="sp-empty"><p>No orders found</p></div>
          ) : (
            filtered.map((o) => (
              <div
                key={o.id}
                role="button"
                tabIndex={0}
                className={`sp-order-row${selected?.id === o.id ? " is-selected" : ""}`}
                onClick={() => setSelectedId(o.id)}
                onKeyDown={(e) => e.key === "Enter" && setSelectedId(o.id)}
              >
                <OrderCard order={o} compact />
              </div>
            ))
          )}

          <p className="sp-pagination-info">
            Showing {filtered.length} order{filtered.length !== 1 ? "s" : ""}
          </p>
        </section>

        <aside className={`sp-detail-panel${selected ? "" : " is-empty"}`}>
          {selected ? (
            <>
              <div className="sp-detail-panel__head">
                <div>
                  <h2>{selected.order_number}</h2>
                  <StatusBadge status={selected.status} />
                </div>
                <button type="button" className="sp-detail-panel__close sp-ui-tablet-only" onClick={() => setSelectedId(null)} aria-label="Close">
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>

              <div className="sp-detail-grid">
                <div><span className="sp-detail-label">Client</span><strong>{selected.client_name}</strong></div>
                <div><span className="sp-detail-label">Items</span><strong>{selected.item_count || 0}</strong></div>
                <div><span className="sp-detail-label">Total</span><strong>${Number(selected.total || 0).toFixed(2)}</strong></div>
                <div><span className="sp-detail-label">Payment</span><strong>{paymentLabel(selected)}</strong></div>
              </div>

              <p className="sp-detail-address">
                <i className="fa-solid fa-location-dot" aria-hidden />
                {formatAddress(selected.address)}
              </p>

              {selected.items?.length > 0 && (
                <ul style={{ fontSize: "0.85rem", margin: "0.75rem 0", paddingLeft: "1.1rem" }}>
                  {selected.items.map((item, i) => (
                    <li key={i}>{item.quantity}× {item.product_name}</li>
                  ))}
                </ul>
              )}

              <div className="sp-detail-actions">
                <a href={mapsUrl(selected.address)} target="_blank" rel="noreferrer" className="sp-btn sp-btn--outline">
                  <i className="fa-solid fa-location-arrow" aria-hidden /> Navigate
                </a>
                {selected.client_phone && (
                  <a href={`tel:${selected.client_phone}`} className="sp-btn sp-btn--outline">
                    <i className="fa-solid fa-phone" aria-hidden /> Call Client
                  </a>
                )}
                {selected.status === "ready_for_pickup" && (
                  <Link to="/scan" state={{ orderNumber: selected.order_number, qrPayload: selected.qr_payload }} className="sp-btn sp-btn--primary sp-btn--block">
                    Start Pickup
                  </Link>
                )}
                {["picked_up", "out_for_delivery"].includes(selected.status) && (
                  <Link to={`/deliver/${selected.order_number}`} className="sp-btn sp-btn--primary sp-btn--block">
                    Confirm Delivery
                  </Link>
                )}
              </div>
            </>
          ) : (
            <p className="sp-empty">Select an order to view details</p>
          )}
        </aside>
      </div>
    </div>
  );
}
