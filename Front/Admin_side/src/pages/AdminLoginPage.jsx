import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "../animations/motionPresets";
import { useReduceMotion } from "../hooks/useReduceMotion";
import { apiPost } from "../api/admin";
import { useAdminAuth } from "../context/AdminAuthContext";
import "../assets/css/pages/AdminLoginPage.css";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const reduce = useReduceMotion();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { markAuthenticated } = useAdminAuth();
  const from = location.state?.from?.pathname || "/admin/analytics";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiPost("admin/login", { email, password });
      if (!res.authenticated) throw new Error("Login failed.");
      markAuthenticated();
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || err.body?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-bg-pattern" aria-hidden />
      <motion.div
        className="admin-login-card"
        initial={reduce ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          initial={reduce ? false : "hidden"}
          animate="show"
          variants={reduce ? undefined : staggerContainer(0.06, 0.1)}
        >
          <motion.h1 className="admin-login-title" variants={reduce ? undefined : fadeUp}>
            Admin Login
          </motion.h1>
          <form onSubmit={handleSubmit}>
            {error && (
              <motion.p className="admin-login-error" role="alert" variants={reduce ? undefined : fadeUp}>
                {error}
              </motion.p>
            )}
            <motion.div className="admin-login-field" variants={reduce ? undefined : fadeUp}>
              <label className="admin-login-label" htmlFor="admin-login-email">
                Email
              </label>
              <input
                id="admin-login-email"
                type="email"
                className="admin-login-input"
                placeholder="Email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </motion.div>
            <motion.div className="admin-login-field" variants={reduce ? undefined : fadeUp}>
              <label className="admin-login-label" htmlFor="admin-login-password">
                Password
              </label>
              <input
                id="admin-login-password"
                type="password"
                className="admin-login-input"
                placeholder="Password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </motion.div>
            <motion.div variants={reduce ? undefined : fadeUp}>
              <button type="submit" className="admin-login-btn" disabled={loading}>
                {loading ? "Signing in…" : "Login"}
              </button>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
