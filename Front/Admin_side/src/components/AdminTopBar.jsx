import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faMagnifyingGlass, faBell, faChevronDown, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { apiGet } from "../api/admin";
import "../assets/css/AdminTopBar.css";

const ALERT_SECTIONS = [
  { key: "low", label: "20 or less", variant: "orange" },
  { key: "half", label: "Half stock", variant: "yellow" },
  { key: "quarter", label: "Quarter stock", variant: "red" },
];

export function AdminTopBar({ onMenuClick }) {
  const [alerts, setAlerts] = useState({ low: [], half: [], quarter: [] });
  const [alertTotal, setAlertTotal] = useState(0);
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      apiGet("admin/stock-alerts")
        .then((res) => {
          if (cancelled) return;
          setAlerts(res.data || { low: [], half: [], quarter: [] });
          setAlertTotal(res.meta?.unique_count ?? res.meta?.total ?? 0);
        })
        .catch(() => {
          if (!cancelled) {
            setAlerts({ low: [], half: [], quarter: [] });
            setAlertTotal(0);
          }
        });
    };
    load();
    const timer = setInterval(load, 60000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <header className="admin-topbar">
      <button type="button" className="admin-topbar-menu-btn" onClick={onMenuClick} aria-label="Toggle menu">
        <FontAwesomeIcon icon={faBars} />
      </button>

      <label className="admin-topbar-search">
        <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden />
        <input type="search" placeholder="Search anything…" aria-label="Global search" />
      </label>

      <div className="admin-topbar-right">
        <div className="admin-topbar-alerts" ref={panelRef}>
          <button
            type="button"
            className="admin-topbar-bell"
            aria-label="Stock alerts"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <FontAwesomeIcon icon={faBell} />
            {alertTotal > 0 && <span className="admin-topbar-bell-badge">{alertTotal > 99 ? "99+" : alertTotal}</span>}
          </button>

          {open && (
            <div className="admin-topbar-alerts-panel" role="dialog" aria-label="Stock alerts">
              <div className="admin-topbar-alerts-header">
                <FontAwesomeIcon icon={faTriangleExclamation} />
                <strong>Stock alerts</strong>
                {alertTotal > 0 && <span className="admin-topbar-alerts-count">{alertTotal}</span>}
              </div>
              {alertTotal === 0 ? (
                <p className="admin-topbar-alerts-empty">All products are well stocked.</p>
              ) : (
                ALERT_SECTIONS.map(({ key, label, variant }) => {
                  const items = alerts[key] || [];
                  if (!items.length) return null;
                  return (
                    <div key={key} className={`admin-topbar-alerts-group admin-topbar-alerts-group--${variant}`}>
                      <p className="admin-topbar-alerts-group-title">{label} ({items.length})</p>
                      <ul>
                        {items.slice(0, 5).map((p) => (
                          <li key={`${key}-${p.id}`}>
                            <span>{p.name}</span>
                            <span className="admin-topbar-alerts-stock">{p.stock} left</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })
              )}
              <Link to="/admin/products" className="admin-topbar-alerts-link" onClick={() => setOpen(false)}>
                View products
              </Link>
            </div>
          )}
        </div>

        <div className="admin-topbar-profile">
          <div className="admin-topbar-avatar" aria-hidden />
          <div className="admin-topbar-profile-text">
            <span className="admin-topbar-profile-name">Admin User</span>
            <span className="admin-topbar-profile-role">Super Admin</span>
          </div>
          <FontAwesomeIcon icon={faChevronDown} className="admin-topbar-profile-chevron" />
        </div>
      </div>
    </header>
  );
}
