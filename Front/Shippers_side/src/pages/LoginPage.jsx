import React, { useState } from "react";
import "../assets/css/ShipperLoginPage.css";
import { useNavigate } from "react-router-dom";
import { shipperApi, setUser } from "../api";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await shipperApi.login({ email, password, pin });
      if (res.user) setUser(res.user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sp-login">
      <div className="sp-login__hero">
        <div className="sp-login__brand">
          <i className="fa-solid fa-leaf" aria-hidden />
          <h1>Verdalis Foods</h1>
          <p>Wholesale &amp; Distribution</p>
        </div>

        <form className="sp-login__form" onSubmit={submit}>
          <h2>Welcome Back!</h2>
          {error && <p className="sp-error">{error}</p>}

          <div className="sp-field sp-field--icon">
            <label htmlFor="shipper-email">Email</label>
            <i className="fa-solid fa-envelope" aria-hidden />
            <input
              id="shipper-email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="sp-field sp-field--icon">
            <label htmlFor="shipper-password">Password</label>
            <i className="fa-solid fa-lock" aria-hidden />
            <input
              id="shipper-password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="sp-field">
            <label htmlFor="shipper-pin">Company ID (PIN)</label>
            <input
              id="shipper-pin"
              type="text"
              required
              placeholder="Company PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
          </div>

          <button type="submit" className="sp-btn sp-btn--primary sp-btn--block" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>

      <div className="sp-login__footer-img">
        <i className="fa-solid fa-truck-fast" style={{ fontSize: "2rem", marginRight: "0.5rem" }} aria-hidden />
        Delivering quality across your route
      </div>
    </div>
  );
}
