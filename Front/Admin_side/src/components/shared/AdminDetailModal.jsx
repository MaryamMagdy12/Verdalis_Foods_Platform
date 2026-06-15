import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import "../../assets/css/components/AdminModal.css";

export function AdminDetailModal({
  open,
  onClose,
  title,
  subtitle = null,
  tabs = null,
  activeTab,
  onTabChange,
  children,
  loading = false,
  wide = false,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="admin-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="admin-modal-title" onClick={onClose}>
      <div
        className={`admin-modal ${wide ? "admin-modal--wide" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-modal__header">
          <div className="admin-modal__header-text">
            <h2 id="admin-modal-title" className="admin-modal__title">{title}</h2>
            {subtitle && <p className="admin-modal__subtitle">{subtitle}</p>}
          </div>
          <button type="button" className="admin-modal__close" onClick={onClose} aria-label="Close">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {tabs && tabs.length > 0 && (
          <div className="admin-modal__tabs" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`admin-modal__tab ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => onTabChange(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        <div className="admin-modal__body">
          {loading ? <div className="admin-modal__loading">Loading details…</div> : children}
        </div>
      </div>
    </div>,
    document.body
  );
}

export function AdminDetailGrid({ rows }) {
  return (
    <dl className="admin-detail-grid">
      {rows.map(({ label, value }) => (
        <div key={label} className="admin-detail-row">
          <dt>{label}</dt>
          <dd>{formatDetailValue(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

export function formatDetailValue(value) {
  if (value == null || value === "") return "—";
  if (typeof value === "object") {
    const addr = value.line1 || value.street || value.address;
    const parts = [addr, value.city, value.state, value.postal_code, value.country].filter(Boolean);
    if (parts.length) return parts.join(", ");
    return JSON.stringify(value);
  }
  return value;
}
