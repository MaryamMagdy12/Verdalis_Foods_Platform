import React from "react";
import { NavLink, Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import sidebarArt from "../../assets/images/ChatGPT Image May 31, 2026, 10_11_12 PM.png";
import "../../assets/css/Dashboard.css";

const links = [
  { to: "/dashboard/orders", label: "Orders", icon: "fa-clipboard-list" },
  { to: "/dashboard/profile", label: "Profile", icon: "fa-user" },
];

function accountRoleLabel(role) {
  if (role === "shipper") return "Shipper Account";
  if (role === "retailer") return "Retailer Account";
  return "Client Account";
}

export function DashboardLayout() {
  const { user } = useAuth();
  const location = useLocation();

  if (location.pathname === "/dashboard" || location.pathname === "/dashboard/") {
    return <Navigate to="/dashboard/orders" replace />;
  }

  const firstName = user?.name?.split(" ")[0] || "Account";
  const isVerified = user?.role !== "retailer" || user?.retailer_status === "approved";

  return (
    <div className="vf-account-page">
      <div className="vf-account-shell">
        <aside className="vf-account-sidebar">
          <div className="vf-account-profile">
            <div className="vf-account-profile__avatar" aria-hidden="true">
              <i className="fa-solid fa-user" />
            </div>
            <h2 className="vf-account-profile__name">{firstName}</h2>
            <p className="vf-account-profile__role">{accountRoleLabel(user?.role)}</p>
            {isVerified && (
              <span className="vf-account-profile__badge">
                <i className="fa-solid fa-circle-check" aria-hidden="true" />
                Verified
              </span>
            )}
          </div>

          <nav className="vf-account-nav" aria-label="Account">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? "active" : "")}>
                <i className={`fa-solid ${l.icon}`} aria-hidden="true" />
                {l.label}
              </NavLink>
            ))}
          </nav>
{/* 
          <div className="vf-account-sidebar__art" aria-hidden="true">
            <img src={sidebarArt} alt="" loading="lazy" decoding="async" />
          </div> */}
        </aside>

        <div className="vf-account-main">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
