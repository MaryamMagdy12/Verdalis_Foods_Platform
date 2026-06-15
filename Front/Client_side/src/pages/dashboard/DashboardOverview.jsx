import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiGetAuth } from "../../api/client";

export function DashboardOverview() {
  const { user, isRetailer } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    apiGetAuth("orders", { per_page: 5 })
      .then((res) => setOrders(res.data || []))
      .catch(() => setOrders([]));
  }, []);

  return (
    <div>
      <h1 className="vf-title">Welcome, {user?.name}</h1>
      {user?.role === "retailer" && user?.retailer_status !== "approved" && (
        <p className="vf-card" style={{ padding: "1rem", marginTop: "1rem", background: "#fef3c7" }}>
          Your retailer account is <strong>{user.retailer_status || "pending"}</strong>. Wholesale pricing activates after admin approval.
        </p>
      )}
      <h2 style={{ marginTop: "2rem" }}>Recent orders</h2>
      {orders.length === 0 ? (
        <div className="vf-empty">
          <i className="fa-solid fa-box" />
          <p>No orders yet.</p>
          <Link to="/products" className="vf-btn vf-btn--primary">Start shopping</Link>
        </div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {orders.map((o) => (
            <li key={o.id} className="vf-card" style={{ padding: "1rem", marginBottom: "0.75rem" }}>
              <strong>{o.order_number}</strong> — {o.status} — ${Number(o.total).toFixed(2)}
            </li>
          ))}
        </ul>
      )}
      <Link to="/dashboard/orders">View all orders →</Link>
    </div>
  );
}
