import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { apiGetAuth } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import emptyIllustration from "../../assets/images/ChatGPT Image May 31, 2026, 10_13_38 PM.png";

function formatAddress(addr) {
  if (!addr) return "—";
  const parts = [addr.line1, addr.line2, addr.city, addr.province, addr.postal_code, addr.country].filter(Boolean);
  return parts.join(", ");
}

export function DashboardOrders() {
  const { user } = useAuth();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const showRetailerPending =
    location.state?.retailerPending ||
    (user?.role === "retailer" && user?.retailer_status !== "approved");

  useEffect(() => {
    apiGetAuth("orders")
      .then((res) => setOrders(res.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const openOrder = async (orderId) => {
    setDetailLoading(true);
    setDetail(null);
    try {
      const res = await apiGetAuth(`orders/${orderId}`);
      setDetail(res.data);
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => setDetail(null);

  if (loading) {
    return <div className="vf-account-loading" aria-busy="true" aria-label="Loading orders" />;
  }

  if (!orders.length) {
    return (
      <div className="vf-account-empty">
        <img
          className="vf-account-empty__img"
          src={emptyIllustration}
          alt=""
          loading="lazy"
          decoding="async"
        />
        <h1>No orders yet</h1>
        <p>
          Looks like you haven&apos;t placed any orders yet. Explore our wide range of premium products.
        </p>
        <Link to="/products" className="vf-account-empty__cta">
          <i className="fa-solid fa-bag-shopping" aria-hidden="true" />
          Shop now
          <span className="vf-account-empty__cta-arrow" aria-hidden="true">
            <i className="fa-solid fa-arrow-right" />
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {showRetailerPending && (
        <p className="ck-login-card__hint" role="status" style={{ marginBottom: "1rem" }}>
          Your retailer application is <strong>{user?.retailer_status || "pending"}</strong>. Wholesale ordering unlocks after admin approval.
        </p>
      )}
      <h1 className="vf-account-title">Orders</h1>
      <ul className="vf-account-orders">
        {orders.map((o) => (
          <li key={o.id}>
            <button type="button" className="vf-account-order vf-account-order--clickable" onClick={() => openOrder(o.id)}>
              <div>
                <strong>{o.order_number}</strong>
                <p className="vf-account-order__meta">
                  {new Date(o.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                  {" · "}
                  {o.item_count ?? o.items?.length ?? 0} items
                </p>
                <span className="vf-account-order__hint">View details</span>
              </div>
              <div className="vf-account-order__right">
                <span className="vf-account-order__status">{o.status?.replace(/_/g, " ")}</span>
                <span className="vf-account-order__total">${Number(o.total).toFixed(2)}</span>
              </div>
            </button>
          </li>
        ))}
      </ul>

      {(detailLoading || detail) && (
        <div className="vf-order-detail-backdrop" onClick={closeDetail} role="presentation">
          <div
            className="vf-order-detail"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vf-order-detail-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="vf-order-detail__close" onClick={closeDetail} aria-label="Close">
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>

            {detailLoading && !detail && (
              <div className="vf-account-loading" aria-busy="true" aria-label="Loading order details" />
            )}

            {detail && (
              <>
                <h2 id="vf-order-detail-title">{detail.order_number}</h2>
                <p className="vf-order-detail__meta">
                  Placed{" "}
                  {new Date(detail.created_at).toLocaleString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
                <div className="vf-order-detail__badges">
                  <span className="vf-account-order__status">{detail.status?.replace(/_/g, " ")}</span>
                  <span className="vf-order-detail__payment">
                    {detail.payment_method?.toUpperCase()} · {detail.payment_status?.replace(/_/g, " ")}
                  </span>
                </div>

                <h3 className="vf-order-detail__section">Items</h3>
                <ul className="vf-order-detail__items">
                  {(detail.items || []).map((item) => (
                    <li key={item.id ?? `${item.product_id}-${item.product_name}`}>
                      <span>
                        {item.product_name} × {item.quantity}
                      </span>
                      <span>${Number(item.line_total).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>

                <dl className="vf-order-detail__totals">
                  <div>
                    <dt>Subtotal</dt>
                    <dd>${Number(detail.subtotal).toFixed(2)}</dd>
                  </div>
                  {Number(detail.discount) > 0 && (
                    <div>
                      <dt>Discount</dt>
                      <dd>-${Number(detail.discount).toFixed(2)}</dd>
                    </div>
                  )}
                  <div>
                    <dt>Tax</dt>
                    <dd>${Number(detail.tax).toFixed(2)}</dd>
                  </div>
                  <div>
                    <dt>Shipping</dt>
                    <dd>{Number(detail.shipping) > 0 ? `$${Number(detail.shipping).toFixed(2)}` : "Free"}</dd>
                  </div>
                  <div className="vf-order-detail__total-row">
                    <dt>Total</dt>
                    <dd>${Number(detail.total).toFixed(2)}</dd>
                  </div>
                </dl>

                {detail.shipping_address && (
                  <>
                    <h3 className="vf-order-detail__section">Shipping address</h3>
                    <p className="vf-order-detail__address">{formatAddress(detail.shipping_address)}</p>
                  </>
                )}

                {detail.tracking_token && (
                  <p className="vf-order-detail__track">
                    <Link
                      to={`/track-order?order=${encodeURIComponent(detail.order_number)}&token=${encodeURIComponent(detail.tracking_token)}`}
                    >
                      Track this order
                    </Link>
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
