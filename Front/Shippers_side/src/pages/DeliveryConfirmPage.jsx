import React, { useEffect, useState } from "react";
import "../assets/css/ShipperDeliveryPage.css";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getLocation, shipperApi } from "../api";
import { formatAddress, paymentLabel, statusMeta } from "../utils/shipperOrders";

const OTP_LEN = 6;

export function DeliveryConfirmPage() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [otp, setOtp] = useState(Array(OTP_LEN).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    shipperApi
      .getOrder(orderNumber)
      .then((res) => {
        setOrder(res.data);
        if (res.client_email && res.delivery_otp_sent) {
          setResendMsg(`Delivery code emailed to ${res.client_email}.`);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingOrder(false));
  }, [orderNumber]);

  const otpValue = otp.join("");

  const handleOtp = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < OTP_LEN - 1) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LEN);
    if (!digits) return;
    e.preventDefault();
    const next = Array(OTP_LEN).fill("");
    digits.split("").forEach((d, i) => { next[i] = d; });
    setOtp(next);
  };

  const resendOtp = async () => {
    setResending(true);
    setResendMsg("");
    setError("");
    try {
      const res = await shipperApi.resendDeliveryOtp(orderNumber);
      setResendMsg(res.message || "Delivery code sent to client email.");
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const loc = await getLocation();
      const body = new FormData();
      body.append("order_number", orderNumber);
      body.append("otp", otpValue);
      body.append("latitude", String(loc.latitude));
      body.append("longitude", String(loc.longitude));
      if (loc.accuracy != null) body.append("accuracy", String(loc.accuracy));
      await shipperApi.deliver(body);
      setDone(true);
      setTimeout(() => navigate("/"), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="sp-page">
        <div className="sp-success-screen">
          <div className="sp-success-screen__icon"><i className="fa-solid fa-check" aria-hidden /></div>
          <h1>Delivery Completed!</h1>
          <p>{orderNumber}</p>
          <Link to="/" className="sp-btn sp-btn--outline" style={{ marginTop: "1.5rem", color: "#fff", borderColor: "#fff" }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (loadingOrder) {
    return <div className="sp-page"><p className="sp-empty">Loading order…</p></div>;
  }

  if (!order) {
    return (
      <div className="sp-page">
        <p className="sp-error">{error || "Order not found"}</p>
        <Link to="/orders" className="sp-btn sp-btn--outline">Back to Orders</Link>
      </div>
    );
  }

  const meta = statusMeta(order.status);

  return (
    <div className="sp-page">
      <header className="sp-page-header sp-page-header--row">
        <div>
          <Link to="/orders" style={{ fontSize: "0.85rem", color: "var(--sp-green-dark)" }}>← Back</Link>
          <h1 style={{ marginTop: "0.35rem" }}>Delivery Confirmation</h1>
          <p>Complete the delivery securely</p>
        </div>
        <span className="sp-badge sp-badge--picked"><i className="fa-solid fa-shield-halved" aria-hidden /> Secure Delivery</span>
      </header>

      <form onSubmit={submit} className="sp-delivery-grid">
        <div className="sp-delivery-col">
          <div className="sp-panel">
            <div className="sp-panel__head-row">
              <h2>Order Details</h2>
              <span className={`sp-badge sp-badge--${meta.variant === "way" ? "way" : meta.variant}`}>{meta.label}</span>
            </div>
            <p><strong>{order.order_number}</strong></p>
            <p style={{ margin: "0.35rem 0", color: "var(--sp-muted)", fontSize: "0.85rem" }}>
              <i className="fa-solid fa-location-dot" aria-hidden /> {formatAddress(order.address)}
            </p>
            <div className="sp-detail-grid">
              <div><span className="sp-detail-label">Items</span><strong>{order.item_count || 0}</strong></div>
              <div><span className="sp-detail-label">Amount</span><strong>${Number(order.total || 0).toFixed(2)}</strong></div>
              <div><span className="sp-detail-label">Payment</span><strong className="is-up">{paymentLabel(order)}</strong></div>
            </div>
            {order.items?.length > 0 && (
              <ul style={{ fontSize: "0.85rem", marginTop: "0.75rem", paddingLeft: "1.1rem" }}>
                {order.items.map((item, i) => (
                  <li key={i}>{item.quantity}× {item.product_name}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="sp-panel">
            <h2 style={{ margin: "0 0 0.75rem", fontSize: "1rem" }}>Client Information</h2>
            <p style={{ fontSize: "0.85rem", margin: "0.35rem 0" }}><strong>Contact:</strong> {order.client_name || "—"}</p>
            {order.client_email && (
              <p style={{ fontSize: "0.85rem", margin: "0.35rem 0" }}>
                <strong>Email:</strong> {order.client_email}
              </p>
            )}
            {order.client_phone && (
              <p style={{ fontSize: "0.85rem", margin: "0.35rem 0" }}>
                <strong>Phone:</strong> <a href={`tel:${order.client_phone}`}>{order.client_phone}</a>
              </p>
            )}
            {order.notes && (
              <p style={{ fontSize: "0.85rem", margin: "0.35rem 0", color: "var(--sp-muted)" }}>
                Notes: {order.notes}
              </p>
            )}
          </div>
        </div>

        <div className="sp-delivery-col">
          <div className="sp-panel">
            <h2 style={{ margin: "0 0 1rem", fontSize: "1rem" }}>Verification Required</h2>
            {error && <p className="sp-error">{error}</p>}

            <div className="sp-step">
              <h3><span className="sp-step__num">1</span> Order Reference</h3>
              <input type="text" readOnly value={order.order_number} style={{ width: "100%", padding: "0.65rem" }} />
            </div>

            <div className="sp-step">
              <h3><span className="sp-step__num">2</span> Client OTP Verification (6 digits)</h3>
              <p style={{ fontSize: "0.8rem", color: "var(--sp-muted)", marginBottom: "0.5rem" }}>
                Ask the client for the delivery code sent to their email.
              </p>
              <button
                type="button"
                className="sp-btn sp-btn--outline sp-btn--sm sp-btn--block"
                style={{ marginBottom: "0.65rem" }}
                onClick={resendOtp}
                disabled={resending}
              >
                {resending ? "Sending…" : "Resend code to client email"}
              </button>
              {resendMsg && (
                <p style={{ fontSize: "0.8rem", color: "var(--sp-green-dark)", marginBottom: "0.5rem" }}>{resendMsg}</p>
              )}
              <div className="sp-otp-row" onPaste={handleOtpPaste}>
                {otp.map((d, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleOtp(i, e.target.value)}
                    required
                  />
                ))}
              </div>
            </div>

            <div className="sp-step">
              <h3><span className="sp-step__num">3</span> Location Verification</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--sp-green-dark)" }}>
                <i className="fa-solid fa-circle-check" aria-hidden /> GPS captured on confirm
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button type="submit" className="sp-btn sp-btn--primary sp-btn--block" disabled={loading || otpValue.length < OTP_LEN}>
                {loading ? "Verifying…" : "Confirm Delivered"}
              </button>
              <Link to={`/failed/${orderNumber}`} className="sp-btn sp-btn--danger sp-btn--block">
                Failed Delivery
              </Link>
            </div>
          </div>
        </div>

        <div className="sp-delivery-col">
          <div className="sp-panel">
            <h2 style={{ margin: "0 0 0.75rem", fontSize: "1rem" }}>Security Checklist</h2>
            <ul className="sp-checklist">
              <li><i className="fa-solid fa-circle-check" aria-hidden /> Order Verified</li>
              <li><i className={`fa-solid ${otpValue.length === OTP_LEN ? "fa-circle-check" : "fa-circle"}`} aria-hidden /> OTP Entered</li>
              <li><i className="fa-solid fa-circle-check" aria-hidden /> Location Verified</li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
}
