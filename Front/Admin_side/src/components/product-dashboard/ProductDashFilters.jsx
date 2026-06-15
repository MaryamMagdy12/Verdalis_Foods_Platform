import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faFilter } from "@fortawesome/free-solid-svg-icons";
import { AdminFilterBar, AdminFilterSelect } from "../dashboard/AdminFilterBar";

export function ProductDashFilters({
  categories = [],
  categoryId,
  search = "",
  onCategoryChange,
  onSearchChange,
}) {
  return (
    <AdminFilterBar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Filter by product name, SKU or category…"
      onFilter={() => {}}
    >
      <AdminFilterSelect
        value={categoryId}
        onChange={(e) => onCategoryChange?.(e.target.value)}
        aria-label="Filter by category"
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </AdminFilterSelect>
      <button type="button" className="admin-btn-outline admin-btn-sm">
        <FontAwesomeIcon icon={faFilter} /> Filter
      </button>
    </AdminFilterBar>
  );
}
