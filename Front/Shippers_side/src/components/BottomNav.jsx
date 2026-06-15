import React from "react";
import "../assets/css/ShipperBottomNav.css";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/", icon: "fa-house", label: "Home", end: true },
  { to: "/orders", icon: "fa-clipboard-list", label: "Orders" },
  { to: "/scan", icon: "fa-qrcode", label: "Scan" },
  { to: "/route", icon: "fa-route", label: "Route" },
  { to: "/profile", icon: "fa-user", label: "Profile" },
];

export function BottomNav() {
  return (
    <nav className="sp-bottom-nav" aria-label="Shipper navigation">
      {items.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => (isActive ? "active" : "")}>
          <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
