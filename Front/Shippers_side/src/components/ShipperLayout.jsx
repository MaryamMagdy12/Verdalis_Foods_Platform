import React, { useState, useEffect } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { setUser, shipperApi } from "../api";
import { ShipperSidebar } from "./ShipperSidebar";
import { ShipperTopBar } from "./ShipperTopBar";
import { BottomNav } from "./BottomNav";

export function ShipperLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const isLogin = location.pathname === "/login";

  useEffect(() => {
    if (isLogin) {
      setAuthChecked(true);
      return;
    }
    shipperApi
      .me()
      .then((res) => {
        if (res.data) {
          setUser(res.data);
          setAuthenticated(true);
        }
      })
      .catch(() => setAuthenticated(false))
      .finally(() => setAuthChecked(true));
  }, [isLogin, location.pathname]);

  if (isLogin) {
    return authenticated ? <Navigate to="/" replace /> : <Outlet />;
  }

  if (!authChecked) {
    return <div className="sp-app sp-app--loading">Loading…</div>;
  }

  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const isScan = location.pathname === "/scan";

  return (
    <div className={`sp-app${isScan ? " sp-app--scan" : ""}${sidebarOpen ? " sp-sidebar-open" : ""}`}>
      <ShipperSidebar />
      {sidebarOpen && (
        <button
          type="button"
          className="sp-sidebar-overlay sp-ui-tablet-only"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="sp-app__body">
        <ShipperTopBar onMenuClick={() => setSidebarOpen((o) => !o)} />
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
