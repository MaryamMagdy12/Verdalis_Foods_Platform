import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

export function AdminPageHeader({ title, breadcrumb, actionLabel, actionTo, onAction, actionIcon = faPlus }) {
  return (
    <header className="admin-dash-header">
      <div className="admin-dash-header-text">
        <h1 className="admin-dash-title">{title}</h1>
        <p className="admin-dash-breadcrumb">
          <Link to="/admin/analytics">Dashboard</Link>
          {breadcrumb ? (
            <>
              <span aria-hidden> &gt; </span>
              <span>{breadcrumb}</span>
            </>
          ) : (
            <>
              <span aria-hidden> &gt; </span>
              <span>{title}</span>
            </>
          )}
        </p>
      </div>
      {(actionLabel && (actionTo || onAction)) && (
        actionTo ? (
          <Link to={actionTo} className="admin-btn-primary admin-dash-header-action">
            <FontAwesomeIcon icon={actionIcon} /> {actionLabel}
          </Link>
        ) : (
          <button type="button" className="admin-btn-primary admin-dash-header-action" onClick={onAction}>
            <FontAwesomeIcon icon={actionIcon} /> {actionLabel}
          </button>
        )
      )}
    </header>
  );
}
