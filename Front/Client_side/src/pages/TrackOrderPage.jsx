import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiGet, apiGetAuth } from "../api/client";
import { useAuth } from "../context/AuthContext";
import "../assets/css/TrackOrderPage.css";

export function TrackOrderPage() {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const initialOrder = searchParams.get("order") || "";
  const initialToken = searchParams.get("token") || "";
  const [orderNumber, setOrderNumber] = useState(initialOrder);
  const [trackingToken, setTrackingToken] = useState(initialToken);
  const [phoneLast4, setPhoneLast4] = useState("");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const track = async (e, number = orderNumber) => {
    e?.preventDefault();
    const trimmed = (number || orderNumber).trim();
    if (!trimmed) return;

    if (!isAuthenticated) {
      if (!trackingToken.trim() || phoneLast4.trim().length !== 4) {
        setError("Enter your order number, tracking token, and the last 4 digits of your phone number.");
        return;
      }
    }

    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const params = { order_number: trimmed };
      if (trackingToken.trim()) params.tracking_token = trackingToken.trim();
      if (phoneLast4.trim()) params.phone_last4 = phoneLast4.trim();

      let res;
      if (isAuthenticated) {
        try {
          res = await apiGetAuth("orders/track", params);
        } catch (err) {
          if (err.status !== 401 && err.status !== 403) throw err;
          res = await apiGet("orders/track", params);
        }
      } else {
        res = await apiGet("orders/track", params);
      }
      setOrder(res.data);
    } catch {
      setError("Order not found. Check your order number, tracking token, and phone details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialOrder || !isAuthenticated) return;
    track(null, initialOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="track-page">
      <div className="track-page__inner">
        <h1 className="track-page__title">Track your order</h1>
        <div className="track-page__divider" aria-hidden="true">
          <i className="fa-solid fa-leaf" />
        </div>
        <p className="track-page__lede">
          Enter your order number, tracking token, and phone last 4 digits from your confirmation email.
        </p>

        <form className="track-search" onSubmit={track}>
          <span className="track-search__icon" aria-hidden="true">
            <i className="fa-solid fa-box" />
          </span>
          <input
            className="track-search__input"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="PRM-2026-XXXXXX"
            required
            aria-label="Order number"
          />
          <input
            className="track-search__input"
            value={trackingToken}
            onChange={(e) => setTrackingToken(e.target.value)}
            placeholder="Tracking token (from email)"
            aria-label="Tracking token"
            required={!isAuthenticated}
          />
          <input
            className="track-search__input"
            value={phoneLast4}
            onChange={(e) => setPhoneLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="Phone last 4 digits"
            aria-label="Phone last four digits"
            maxLength={4}
            required={!isAuthenticated}
          />
          <button type="submit" className="track-search__btn" disabled={loading}>
            {loading ? "Tracking…" : "Track"}
            <span className="track-search__btn-arrow" aria-hidden="true">
              <i className="fa-solid fa-arrow-right" />
            </span>
          </button>
        </form>

        {error && (
          <p className="track-page__error" role="alert">
            {error}
          </p>
        )}

        {order && (
          <div className="track-result">
            <h2>{order.order_number}</h2>
            <p className="track-result__meta">
              Status: <strong>{order.status?.replace(/_/g, " ")}</strong>
            </p>
            {order.estimated_delivery && (
              <p className="track-result__meta">{order.estimated_delivery}</p>
            )}

            <ol className="track-timeline">
              {(order.status_steps || []).map((s) => (
                <li key={s.key} className={s.done ? "done" : ""} data-current={s.current}>
                  {s.label}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}
