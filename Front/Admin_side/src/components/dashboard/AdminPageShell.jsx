import React from "react";
import "../../assets/css/AdminDashboard.css";

export function AdminPageShell({ children, className = "" }) {
  return (
    <div className={`admin-dash ${className}`.trim()}>
      <div className="admin-dash-deco admin-dash-deco--tr" aria-hidden />
      <div className="admin-dash-deco admin-dash-deco--bl" aria-hidden />
      {children}
    </div>
  );
}
