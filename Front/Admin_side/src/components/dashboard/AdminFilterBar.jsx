import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faFilter, faDownload } from "@fortawesome/free-solid-svg-icons";

export function AdminFilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  children,
  onFilter,
  onExport,
  exportLabel = "Export",
}) {
  return (
    <div className="admin-filter-bar">
      <div className="admin-filter-bar-main">
        {onSearchChange != null && (
          <label className="admin-filter-search">
            <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden />
            <input
              type="search"
              placeholder={searchPlaceholder}
              value={search ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </label>
        )}
        {children}
      </div>
      <div className="admin-filter-bar-actions">
        {onFilter && (
          <button type="button" className="admin-btn-outline admin-btn-sm" onClick={onFilter}>
            <FontAwesomeIcon icon={faFilter} /> Filter
          </button>
        )}
        {onExport && (
          <button type="button" className="admin-btn-outline admin-btn-sm" onClick={onExport}>
            <FontAwesomeIcon icon={faDownload} /> {exportLabel}
          </button>
        )}
      </div>
    </div>
  );
}

export function AdminFilterSelect({ value, onChange, children, "aria-label": ariaLabel }) {
  return (
    <select className="admin-filter-select" value={value} onChange={onChange} aria-label={ariaLabel}>
      {children}
    </select>
  );
}
