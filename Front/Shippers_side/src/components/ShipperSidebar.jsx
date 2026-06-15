import React, { useEffect, useState } from "react";
import "../assets/css/ShipperSidebar.css";
import { NavLink, useNavigate } from "react-router-dom";
import { getUser, setToken, shipperApi } from "../api";
import logo from "../assets/images/verdalis-foods-logo.png";

const NAV = [
  { to: "/", label: "Dashboard", icon: "fa-gauge-high", end: true },
  { to: "/orders", label: "Assigned Orders", icon: "fa-clipboard-list" },
  { to: "/scan", label: "Scan QR Code", icon: "fa-qrcode" },
  { to: "/route", label: "Route & Map", icon: "fa-route" },
  { to: "/history", label: "History", icon: "fa-clock-rotate-left" },
  { to: "/profile", label: "Profile", icon: "fa-user" },
];

export function ShipperSidebar() {
  const navigate = useNavigate();
  const [user, setUserState] = useState(getUser());

  useEffect(() => {
    const sync = () => setUserState(getUser());
    sync();
    window.addEventListener("shipper-user-updated", sync);
    return () => window.removeEventListener("shipper-user-updated", sync);
  }, []);

  const logout = async () => {
    try {
      await shipperApi.logout();
    } catch {
      /* clear local session even if API fails */
    }
    setToken(null);
    navigate("/login");
  };

  return (
    <aside className="sp-sidebar" aria-label="Shipper navigation">
      <div className="sp-sidebar__brand">
        <div className="sp-sidebar__logo" aria-hidden>
          {/* <i className="fa-solid fa-leaf" /> */}
          <img src={logo} alt="Verdalis Foods" style={{ width: "100%", height: "100%" }} />
        </div>
        <div>
          <strong>VERDALIS FOODS</strong>
          <span>Wholesale &amp; Distribution</span>
        </div>
      </div>

      <div className="sp-sidebar__profile">
        {user?.photo_url || user?.photo ? (
          <img
            src={user.photo_url || user.photo}
            alt=""
            className="sp-sidebar__avatar-img"
            style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
          />
        ) : (
          <div className="sp-sidebar__avatar" aria-hidden />
        )}
        <div>
          <strong style={{ fontSize: "0.88rem" }}>{user?.name || "Shipper"}</strong>
          <span className="sp-sidebar__role">Shipper</span>
          {user?.phone && <span style={{ display: "block", fontSize: "0.72rem", opacity: 0.7 }}>{user.phone}</span>}
          <span className="sp-sidebar__online is-on">
            {/* <span className="sp-dot" /> Online */}
          </span>
        </div>
      </div>

      <nav className="sp-sidebar__nav">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `sp-sidebar__link${isActive ? " is-active" : ""}`}
          >
            <i className={`fa-solid ${item.icon}`} aria-hidden />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* <div className="sp-sidebar__vehicle">
        <div className="sp-sidebar__truck" aria-hidden>
          <i className="fa-solid fa-truck" />
        </div>
        <strong>Vehicle Info</strong>
        <p style={{ margin: "0.25rem 0", opacity: 0.85 }}>Toyota Hiace · ABC-1234</p>
        <span className="sp-badge sp-badge--delivered" style={{ marginTop: "0.35rem" }}>Active</span>
      </div> */}

      <button type="button" className="sp-sidebar__logout" onClick={logout}>
        <i className="fa-solid fa-right-from-bracket" aria-hidden /> Logout
      </button>

      <p style={{ margin: "0.75rem 0.35rem 0", fontSize: "0.65rem", opacity: 0.45, textAlign: "center" }}>
        © Verdalis Foods
      </p>
    </aside>
  );
}
