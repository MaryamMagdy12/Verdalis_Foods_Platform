import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getLocation, shipperApi } from "../api";
import { formatAddress } from "../utils/shipperOrders";

const REASONS = [
  "Client not available",
  "Wrong address",
  "Refused delivery",
  "Access denied",
  "Other",
];

export function FailedDeliveryPage() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    shipperApi.getOrder(orderNumber).then((res) => setOrder(res.data)).catch(() => {});
  }, [orderNumber]);

  const submit = async (e) => {
    e.preventDefault();
    const finalReason = notes.trim() ? `${reason}${reason ? " — " : ""}${notes.trim()}` : reason;
    if (!finalReason.trim()) {
      setError("Please select or enter a reason.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const loc = await getLocation();
      await shipperApi.failed({
        order_number: orderNumber,
        reason: finalReason,
        latitude: loc.latitude,
        longitude: loc.longitude,
      });
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sp-page">
      <header className="sp-page-header">
        <Link to={`/deliver/${orderNumber}`} style={{ fontSize: "0.85rem", color: "var(--sp-green)" }}>← Back</Link>
        <h1>Failed Delivery</h1>
        <p>{orderNumber}</p>
        {order && (
          <p style={{ fontSize: "0.85rem", color: "var(--sp-muted)" }}>
            {order.client_name} · {formatAddress(order.address)}
          </p>
        )}
      </header>

      <form onSubmit={submit} className="sp-panel">
        {error && <p className="sp-error">{error}</p>}
        <div className="sp-field">
          <label htmlFor="fail-reason">Reason</label>
          <select id="fail-reason" value={reason} onChange={(e) => setReason(e.target.value)} required>
            <option value="">Select a reason</option>
            {REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div className="sp-field">
          <label htmlFor="fail-notes">Additional notes</label>
          <textarea
            id="fail-notes"
            rows={4}
            placeholder="Describe what happened…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <button type="submit" className="sp-btn sp-btn--danger sp-btn--block" disabled={loading}>
          {loading ? "Reporting…" : "Report Failed Delivery"}
        </button>
      </form>
    </div>
  );
}
