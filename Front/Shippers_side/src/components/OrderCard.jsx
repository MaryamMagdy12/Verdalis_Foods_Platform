import React from "react";
import "../assets/css/ShipperOrderCard.css";
import { Link } from "react-router-dom";
import { StatusBadge } from "./StatusBadge";
import { formatAddress, statusMeta } from "../utils/shipperOrders";

export function OrderCard({ order, showPayment = true, compact = false }) {
  const addr = formatAddress(order.address);
  const meta = statusMeta(order.status);
  const iconClass = `sp-order-card__icon--${meta.variant === "way" ? "way" : meta.variant}`;

  return (
    <article className={`sp-order-card${compact ? " sp-order-card--compact" : ""}`}>
      <div className="sp-order-card__head">
        <div className={`sp-order-card__icon ${iconClass}`}>
          <i
            className={`fa-solid ${
              order.status === "ready_for_pickup"
                ? "fa-clipboard-list"
                : order.status === "failed_delivery"
                  ? "fa-circle-xmark"
                  : "fa-box"
            }`}
            aria-hidden
          />
        </div>
        <div className="sp-order-card__title-row">
          <div>
            <div className="sp-order-card__id">{order.order_number}</div>
            <p className="sp-order-card__client">{order.client_name || "Client"}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </div>
      {!compact && (
        <p className="sp-order-card__addr">
          <i className="fa-solid fa-location-dot" aria-hidden />
          {addr}
        </p>
      )}
      {compact && (
        <p className="sp-order-card__addr sp-order-card__addr--compact">{addr}</p>
      )}
      <div className="sp-order-card__meta">
        <span><i className="fa-solid fa-box" aria-hidden /> {order.item_count || 0} items</span>
        <span><i className="fa-solid fa-dollar-sign" aria-hidden /> ${Number(order.total || 0).toFixed(2)}</span>
        {showPayment && (
          <span className="sp-order-card__pay">
            {order.payment_status === "paid" ? "Prepaid" : order.payment_status === "pending" ? "COD" : order.payment_status}
          </span>
        )}
      </div>
      {!compact && (
        <div className="sp-order-card__actions">
          {order.status === "ready_for_pickup" && (
            <Link to="/scan" state={{ orderNumber: order.order_number, qrPayload: order.qr_payload }} className="sp-btn sp-btn--primary" onClick={(e) => e.stopPropagation()}>
              Start Pickup
            </Link>
          )}
          {["picked_up", "out_for_delivery"].includes(order.status) && (
            <>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`}
                target="_blank"
                rel="noreferrer"
                className="sp-btn sp-btn--outline"
                onClick={(e) => e.stopPropagation()}
              >
                <i className="fa-solid fa-location-arrow" aria-hidden /> Navigate
              </a>
              {order.client_phone && (
                <a href={`tel:${order.client_phone}`} className="sp-btn sp-btn--ghost" onClick={(e) => e.stopPropagation()}>
                  <i className="fa-solid fa-phone" aria-hidden /> Call
                </a>
              )}
              <Link to={`/deliver/${order.order_number}`} className="sp-btn sp-btn--primary" onClick={(e) => e.stopPropagation()}>
                Confirm Delivery
              </Link>
            </>
          )}
          {["picked_up", "out_for_delivery"].includes(order.status) && (
            <Link to={`/failed/${order.order_number}`} className="sp-btn sp-btn--danger" onClick={(e) => e.stopPropagation()}>
              Failed
            </Link>
          )}
        </div>
      )}
    </article>
  );
}
