import React from "react";

export function AdminDataTable({ children, loading, loadingMessage = "Loading…", emptyMessage, isEmpty }) {
  return (
    <div className="admin-table-card">
      {loading ? (
        <p className="admin-table-loading">{loadingMessage}</p>
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            {children}
          </table>
          {isEmpty && emptyMessage && (
            <p className="admin-table-empty-msg">{emptyMessage}</p>
          )}
        </div>
      )}
    </div>
  );
}

export function AdminTablePagination({ showing, total, page = 1, pageSize = 10 }) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="admin-table-pagination">
      <span className="admin-table-pagination-info">
        Showing {from} to {to} of {total} {showing}
      </span>
      <div className="admin-table-pagination-pages">
        <button type="button" className="admin-page-btn" disabled={page <= 1} aria-label="Previous page">
          ‹
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((n) => (
          <button key={n} type="button" className={`admin-page-btn ${n === page ? "is-active" : ""}`}>
            {n}
          </button>
        ))}
        <button type="button" className="admin-page-btn" disabled={page >= totalPages} aria-label="Next page">
          ›
        </button>
      </div>
      <label className="admin-table-page-size">
        <select defaultValue={pageSize} aria-label="Rows per page">
          <option value={10}>10 / page</option>
          <option value={25}>25 / page</option>
          <option value={50}>50 / page</option>
        </select>
      </label>
    </div>
  );
}
