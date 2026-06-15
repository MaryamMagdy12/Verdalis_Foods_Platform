import React from "react";
import "../assets/css/ShipperTopBar.css";
import { useLocation } from "react-router-dom";

const TITLES = {
  "/": { title: "Dashboard", sub: "Welcome back! Here's your delivery overview." },
  "/orders": { title: "Assigned Orders", sub: "Manage and complete your assigned deliveries." },
  "/scan": { title: "Scan QR Code", sub: "Scan warehouse QR to confirm pickup." },
  "/route": { title: "Delivery Route", sub: "Follow your route and complete deliveries." },
  "/history": { title: "Delivery History", sub: "Track your past deliveries and performance." },
  "/profile": { title: "My Profile", sub: "Manage your profile and account settings." },
};

export function ShipperTopBar({ onMenuClick }) {
  const { pathname } = useLocation();
  const base = pathname.startsWith("/deliver") ? null : pathname.startsWith("/failed") ? null : pathname;
  const meta = TITLES[base] || { title: "Shipper", sub: "" };
  const today = new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

  if (pathname.startsWith("/deliver") || pathname.startsWith("/failed") || pathname === "/login") {
    return null;
  }

  return (
    <header className="sp-topbar">
      <button type="button" className="sp-topbar__menu sp-ui-tablet-only" onClick={onMenuClick} aria-label="Open menu">
        <i className="fa-solid fa-bars" aria-hidden />
      </button>
      <div className="sp-topbar__titles">
        <h1>{meta.title}</h1>
        {meta.sub && <p>{meta.sub}</p>}
      </div>
      <div className="sp-topbar__actions">
        <label className="sp-topbar__date">
          <i className="fa-regular fa-calendar" aria-hidden />
          <span>{today}</span>
          <i className="fa-solid fa-chevron-down" aria-hidden style={{ fontSize: "0.65rem" }} />
        </label>
        <button type="button" className="sp-topbar__icon-btn" aria-label="Notifications">
          <i className="fa-regular fa-bell" aria-hidden />
          <span className="sp-topbar__badge">3</span>
        </button>
      </div>
    </header>
  );
}
