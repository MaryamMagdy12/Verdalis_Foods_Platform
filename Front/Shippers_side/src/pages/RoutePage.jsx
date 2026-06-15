import React from "react";
import "../assets/css/ShipperRoutePage.css";
import { Link } from "react-router-dom";
import { StatusBadge } from "../components/StatusBadge";
import { DeliveryRouteMap } from "../components/DeliveryRouteMap";
import { useShipperDashboard } from "../hooks/useShipperDashboard";
import { formatAddress, mapsUrl } from "../utils/shipperOrders";

export function RoutePage() {
  const { orders, performance, loading } = useShipperDashboard();

  const active = orders.filter((o) => ["picked_up", "out_for_delivery"].includes(o.status));
  const deliveredToday = performance?.delivered_today ?? 0;
  const stopCount = active.length;
  const totalActive = stopCount + deliveredToday;

  return (
    <div className="sp-page">
      <div className="sp-route-grid">
        <div className="sp-route-grid__main">
          <div className="sp-panel sp-route-summary">
            <div className="sp-route-summary__head">
              <div style={{ display: "flex", gap: "0.65rem", alignItems: "center" }}>
                <div className="sp-stat__icon sp-stat__icon--green"><i className="fa-solid fa-route" aria-hidden /></div>
                <div>
                  <strong className="sp-route-summary__title">Today&apos;s Route</strong>
                  <p className="sp-route-summary__sub">
                    {stopCount} active stop{stopCount !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <span className="sp-badge sp-badge--way">{stopCount > 0 ? "In Progress" : "Idle"}</span>
            </div>
            <div className="sp-route-summary__metrics">
              <div>
                <span className="sp-route-summary__metric-label">Active stops</span>
                <span className="sp-route-summary__metric-value">{stopCount}</span>
              </div>
              <div>
                <span className="sp-route-summary__metric-label">Delivered today</span>
                <span className="sp-route-summary__metric-value">{deliveredToday}</span>
              </div>
              <div>
                <span className="sp-route-summary__metric-label">Success rate</span>
                <span className="sp-route-summary__metric-value">{performance?.success_rate ?? 100}%</span>
              </div>
            </div>
          </div>

          <div className="sp-panel">
            <h2>Delivery Stops</h2>
            {loading ? (
              <p className="sp-route-empty">Loading route…</p>
            ) : stopCount === 0 ? (
              <p className="sp-route-empty">No stops on your route. Pick up orders from the warehouse first.</p>
            ) : (
              <ul className="sp-stop-list">
                {active.map((o, i) => (
                  <li key={o.id} className="sp-stop-list__row">
                    <span>
                      Stop {i + 1}: {o.client_name}
                      <br />
                      <small style={{ opacity: 0.7 }}>{formatAddress(o.address)}</small>
                    </span>
                    <StatusBadge status={o.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {active[0] && (
            <div className="sp-route-banner">
              <span>Next: {active[0].client_name}</span>
              <a href={mapsUrl(active[0].address)} target="_blank" rel="noreferrer" className="sp-btn sp-btn--primary">
                Open in Google Maps
              </a>
            </div>
          )}
        </div>

        <aside className="sp-panel sp-route-map-panel">
          <h2>Route Map</h2>
          <DeliveryRouteMap stops={active} tall />
          {active[0] ? (
            <Link
              to={`/deliver/${active[0].order_number}`}
              className="sp-btn sp-btn--primary sp-btn--block sp-route-map-panel__cta"
            >
              Confirm Delivery — {active[0].client_name}
            </Link>
          ) : (
            <Link to="/scan" className="sp-btn sp-btn--outline sp-btn--block sp-route-map-panel__cta">
              Pick up orders
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}
