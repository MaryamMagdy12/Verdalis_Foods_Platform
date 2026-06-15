import React, { useEffect, useState } from "react";
import "../assets/css/ShipperScanPage.css";
import { useNavigate } from "react-router-dom";
import { QrScanner } from "../components/QrScanner";
import { getLocation, shipperApi } from "../api";

export function ScanPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("qr");
  const [qrPayload, setQrPayload] = useState("");
  const [pickupOrders, setPickupOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [truckNumber, setTruckNumber] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [serial, setSerial] = useState("");
  const [serialSent, setSerialSent] = useState(false);
  const [sentToEmail, setSentToEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [scannerKey, setScannerKey] = useState(0);
  const [scannerPaused, setScannerPaused] = useState(false);

  useEffect(() => {
    shipperApi
      .todayOrders()
      .then((res) => setPickupOrders((res.data || []).filter((o) => o.status === "ready_for_pickup")))
      .catch(() => setPickupOrders([]));
  }, []);

  const resetManual = () => {
    setSelectedOrder(null);
    setTruckNumber("");
    setPassword("");
    setPin("");
    setSerial("");
    setSerialSent(false);
    setSentToEmail("");
    setError("");
    setSuccess("");
  };

  const selectOrder = (order) => {
    setSelectedOrder(order);
    setSerialSent(false);
    setSerial("");
    setError("");
    setSuccess("");
  };

  const handleQrScan = (text) => {
    setQrPayload(text);
    setScannerPaused(true);
    setError("");
    setSuccess("QR code scanned — confirm pickup below");
  };

  const restartScanner = () => {
    setQrPayload("");
    setScannerPaused(false);
    setScannerKey((k) => k + 1);
    setSuccess("");
    setError("");
  };

  const confirmQrPickup = async (e) => {
    e.preventDefault();
    if (!qrPayload) {
      setError("Scan the order QR code to confirm pickup.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const loc = await getLocation();
      const body = new FormData();
      body.append("qr_payload", qrPayload);
      body.append("latitude", String(loc.latitude));
      body.append("longitude", String(loc.longitude));
      if (loc.accuracy != null) body.append("accuracy", String(loc.accuracy));
      await shipperApi.pickup(body);
      navigate("/route");
    } catch (err) {
      setError(err.body?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const requestManualSerial = async (e) => {
    e.preventDefault();
    if (!selectedOrder) {
      setError("Select an order first.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await shipperApi.requestManualPickup({
        order_number: selectedOrder.order_number,
        truck_number: truckNumber.trim(),
        password,
        pin,
      });
      setSerialSent(true);
      setSentToEmail(res.email || "your shipper email");
      setSuccess(res.message || "Pickup serial sent to your email.");
      setPassword("");
      setPin("");
    } catch (err) {
      setError(err.body?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmManualPickup = async (e) => {
    e.preventDefault();
    if (!selectedOrder || !serialSent) {
      setError("Request a pickup serial first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const loc = await getLocation();
      const body = new FormData();
      body.append("order_number", selectedOrder.order_number);
      body.append("serial", serial.trim().toUpperCase());
      body.append("latitude", String(loc.latitude));
      body.append("longitude", String(loc.longitude));
      if (loc.accuracy != null) body.append("accuracy", String(loc.accuracy));
      await shipperApi.confirmManualPickup(body);
      navigate("/route");
    } catch (err) {
      setError(err.body?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sp-page sp-page--scan">
      <header className="sp-page-header">
        <h1>Confirm Pickup</h1>
        <p>Scan the warehouse QR or use manual confirmation if the camera is unavailable.</p>
      </header>

      <div className="sp-scan-actions" style={{ marginBottom: "1rem" }}>
        <button
          type="button"
          className={`sp-btn sp-btn--pill ${mode === "qr" ? "sp-btn--primary" : "sp-btn--outline"}`}
          onClick={() => {
            setMode("qr");
            resetManual();
          }}
        >
          Scan QR
        </button>
        <button
          type="button"
          className={`sp-btn sp-btn--pill ${mode === "manual" ? "sp-btn--primary" : "sp-btn--outline"}`}
          onClick={() => {
            setMode("manual");
            restartScanner();
          }}
        >
          Manual confirm
        </button>
      </div>

      {pickupOrders.length > 0 && (
        <div className="sp-panel" style={{ marginBottom: "1rem" }}>
          <h2 style={{ margin: "0 0 0.75rem", fontSize: "1rem" }}>Assigned — Ready for Pickup</h2>
          <ul className="sp-stop-list">
            {pickupOrders.map((o) => (
              <li key={o.id} className="sp-stop-list__row">
                {mode === "manual" ? (
                  <button
                    type="button"
                    className={`sp-manual-order-btn${selectedOrder?.id === o.id ? " sp-manual-order-btn--active" : ""}`}
                    onClick={() => selectOrder(o)}
                  >
                    {o.order_number} — {o.client_name}
                  </button>
                ) : (
                  <span>
                    {o.order_number} — {o.client_name}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {mode === "qr" ? (
        <>
          <div className="sp-scan-stage">
            <QrScanner key={scannerKey} onScan={handleQrScan} paused={scannerPaused} />
            {scannerPaused && (
              <button type="button" className="sp-btn sp-btn--outline sp-btn--pill" onClick={restartScanner}>
                Scan again
              </button>
            )}
          </div>

          {qrPayload && (
            <form className="sp-scan-manual" onSubmit={confirmQrPickup}>
              {success && <p className="sp-scan-success">{success}</p>}
              {error && <p className="sp-error">{error}</p>}
              <button type="submit" className="sp-btn sp-btn--primary sp-btn--block" disabled={loading}>
                {loading ? "Confirming…" : "Confirm Pickup"}
              </button>
            </form>
          )}
        </>
      ) : (
        <form className="sp-scan-manual sp-scan-manual--wide" onSubmit={serialSent ? confirmManualPickup : requestManualSerial}>
          <p className="sp-scan-manual__hint">
            Select an order, enter your truck number, password, and company PIN. A one-time serial will be emailed to you.
          </p>

          {selectedOrder && (
            <p className="sp-scan-success">
              Selected: <strong>{selectedOrder.order_number}</strong>
            </p>
          )}

          <label className="sp-field">
            <span>Truck number</span>
            <input
              value={truckNumber}
              onChange={(e) => setTruckNumber(e.target.value)}
              placeholder="e.g. TRK-1042"
              required
              disabled={!selectedOrder}
            />
          </label>

          {!serialSent && (
            <>
              <label className="sp-field">
                <span>Shipper password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  disabled={!selectedOrder}
                />
              </label>
              <label className="sp-field">
                <span>Company PIN</span>
                <input
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                  disabled={!selectedOrder}
                />
              </label>
            </>
          )}

          {serialSent && (
            <label className="sp-field">
              <span>One-time pickup serial</span>
              <input
                value={serial}
                onChange={(e) => setSerial(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8))}
                placeholder="8-character code from email"
                maxLength={8}
                required
              />
            </label>
          )}

          {success && <p className="sp-scan-success">{success}{sentToEmail ? ` (${sentToEmail})` : ""}</p>}
          {error && <p className="sp-error">{error}</p>}

          <button type="submit" className="sp-btn sp-btn--primary sp-btn--block" disabled={loading || !selectedOrder}>
            {loading
              ? "Please wait…"
              : serialSent
                ? "Confirm Pickup"
                : "Send pickup serial to email"}
          </button>

          {serialSent && (
            <button
              type="button"
              className="sp-btn sp-btn--outline sp-btn--block"
              onClick={() => {
                setSerialSent(false);
                setSerial("");
                setSuccess("");
              }}
            >
              Request new serial
            </button>
          )}
        </form>
      )}
    </div>
  );
}
