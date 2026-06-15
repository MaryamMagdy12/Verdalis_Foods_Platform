import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useReduceMotion } from "../hooks/useReduceMotion";
import { fadeDown, staggerContainer } from "../animations/motionPresets";
import "../assets/css/ClientNav.css";

const DEFAULT_LOGO_SRC = new URL("../assets/images/verdalis-foods-logo.png", import.meta.url).href;

const navItems = [
  { path: "/", label: "Home", icon: "fa-solid fa-house" },
  { path: "/products", label: "Shop", icon: "fa-solid fa-box" },
  { path: "/track-order", label: "Track", icon: "fa-solid fa-location-dot" },
  { path: "/about", label: "About", icon: "fa-solid fa-circle-info" },
  { path: "/contact", label: "Contact", icon: "fa-solid fa-envelope" },
];

function profileInitials(name) {
  if (!name?.trim()) return "?";
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ClientNav({ logoSrc } = {}) {
  const reduce = useReduceMotion();
  const { count } = useCart();
  const { isAuthenticated, logout, user, loading } = useAuth();
  const cartTo = "/cart";
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const logo = logoSrc ?? DEFAULT_LOGO_SRC;
  const closeMenu = () => setMenuOpen(false);

  return (
    <motion.header
      className={`client-nav ${menuOpen ? "client-nav-menu-open" : ""}`}
      initial={reduce ? false : "hidden"}
      animate={reduce ? undefined : "show"}
      variants={reduce ? undefined : fadeDown}
    >
      <div className="client-nav-bar">
        <Link to="/" className="client-nav-brand" onClick={closeMenu}>
          {logo ? <img src={logo} alt="" className="client-nav-logo-img" /> : null}
          <span className="client-nav-brand-text">
            <span className="client-nav-brand-name">Verdalis Foods</span>
            <span className="client-nav-brand-tag">Wholesale &amp; Logistics</span>
          </span>
        </Link>

        <motion.nav
          className="client-nav-links client-nav-links-desk"
          initial={reduce ? false : "hidden"}
          animate={reduce ? undefined : "show"}
          variants={reduce ? undefined : staggerContainer(0.05, 0.12)}
        >
          {navItems.map(({ path, label, icon }) => (
            <motion.div key={path} variants={reduce ? undefined : fadeDown}>
              <Link
                to={path}
                className={`client-nav-link ${location.pathname === path ? "client-nav-link-active" : ""}`}
              >
                <i className={icon} aria-hidden="true" />
                <span>{label}</span>
              </Link>
            </motion.div>
          ))}
        </motion.nav>

        <div className="client-nav-actions">
          <Link
            to={cartTo}
            className={`client-nav-cart ${location.pathname === "/cart" ? "client-nav-cart--active" : ""}`}
            onClick={closeMenu}
            aria-label={count ? `Cart, ${count} items` : "Cart"}
          >
            <i className="fa-solid fa-cart-shopping" aria-hidden="true" />
            {count > 0 && <span className="client-nav-cart-badge">{count > 9 ? "9+" : count}</span>}
          </Link>
          {isAuthenticated && !loading ? (
            <>
              <Link
                to="/dashboard/profile"
                className={`client-nav-profile ${location.pathname.startsWith("/dashboard") ? "client-nav-profile--active" : ""}`}
                onClick={closeMenu}
                aria-label={user?.name ? `Profile, ${user.name}` : "My profile"}
                title={user?.name || "My profile"}
              >
                {user?.photo_url ? (
                  <img src={user.photo_url} alt="" className="client-nav-profile__photo" />
                ) : (
                  <span className="client-nav-profile__initials" aria-hidden="true">
                    {profileInitials(user?.name)}
                  </span>
                )}
              </Link>
              <Link
                to="/dashboard/profile"
                className="client-nav-account-pill client-nav-account-pill--desk"
                onClick={closeMenu}
              >
                <span className="client-nav-account-pill__icon" aria-hidden="true">
                  <i className="fa-solid fa-user" />
                </span>
                <span className="client-nav-account-pill__name">{user?.name?.split(" ")[0] || "Account"}</span>
                <i className="fa-solid fa-chevron-down client-nav-account-pill__chev" aria-hidden="true" />
              </Link>
              <button type="button" className="client-nav-signout-desk" onClick={() => { logout(); closeMenu(); }}>
                Sign out
              </button>
            </>
          ) : !loading ? (
            <Link to="/login" className="client-nav-cta-desk" onClick={closeMenu}>
              Sign in
            </Link>
          ) : null}
        </div>

        <button
          type="button"
          className="client-nav-toggle"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="client-nav-toggle-bar" />
          <span className="client-nav-toggle-bar" />
          <span className="client-nav-toggle-bar" />
        </button>
      </div>

      <div className="client-nav-overlay" aria-hidden={!menuOpen}>
        <div className="client-nav-overlay-backdrop" onClick={closeMenu} />
        <motion.nav
          className="client-nav-panel"
          initial={reduce ? false : "hidden"}
          animate={reduce ? undefined : "show"}
          variants={reduce ? undefined : staggerContainer(0.06, 0.12)}
        >
          <div className="client-nav-overlay-header">
            <span className="client-nav-overlay-title">Menu</span>
            <button type="button" className="client-nav-overlay-close" aria-label="Close menu" onClick={closeMenu}>
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          </div>
          <div className="client-nav-overlay-links">
            {navItems.map(({ path, label, icon }) => (
              <motion.div key={path} variants={reduce ? undefined : fadeDown}>
                <Link to={path} className="client-nav-link-pill" onClick={closeMenu}>
                  <i className={icon} aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              </motion.div>
            ))}
            <motion.div variants={reduce ? undefined : fadeDown}>
              <Link to={cartTo} className="client-nav-link-pill" onClick={closeMenu}>
                <i className="fa-solid fa-cart-shopping" aria-hidden="true" />
                <span>Cart{count > 0 ? ` (${count})` : ""}</span>
              </Link>
            </motion.div>
            <motion.div variants={reduce ? undefined : fadeDown}>
              {isAuthenticated && !loading ? (
                <>
                  <Link to="/dashboard/profile" className="client-nav-link-pill" onClick={closeMenu}>
                    <i className="fa-solid fa-user" aria-hidden="true" />
                    <span>Profile{user?.name ? ` (${user.name.split(" ")[0]})` : ""}</span>
                  </Link>
                  <Link to="/dashboard/orders" className="client-nav-link-pill" onClick={closeMenu}>
                    <i className="fa-solid fa-box" aria-hidden="true" />
                    <span>My orders</span>
                  </Link>
                  <button type="button" className="client-nav-link-pill" onClick={() => { logout(); closeMenu(); }}>
                    <i className="fa-solid fa-right-from-bracket" aria-hidden="true" />
                    <span>Sign out</span>
                  </button>
                </>
              ) : !loading ? (
                <Link to="/login" className="client-nav-cta-mobile" onClick={closeMenu}>
                  Sign in
                  <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                </Link>
              ) : null}
            </motion.div>
          </div>
        </motion.nav>
      </div>
    </motion.header>
  );
}
