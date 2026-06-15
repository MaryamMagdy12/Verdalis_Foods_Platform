import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTag, faCircleCheck, faImage, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { apiGet, apiDelete, apiPut } from "../api/admin";
import { ConfirmModal } from "../components/shared/ConfirmModal";
import { AdminPageShell } from "../components/dashboard/AdminPageShell";
import { AdminPageHeader } from "../components/dashboard/AdminPageHeader";
import { AdminKpiRow } from "../components/dashboard/AdminKpiRow";
import { AdminFilterBar } from "../components/dashboard/AdminFilterBar";
import { AdminDataTable, AdminTablePagination } from "../components/dashboard/AdminDataTable";
import { AdminStatusBadge } from "../components/dashboard/AdminStatusBadge";

export function CategoryDashboardPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiGet("admin/categories");
      setCategories(res.data || []);
    } catch (e) {
      setError(e.message || "Failed to load categories.");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.slug?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
    );
  }, [categories, search]);

  const activeCount = categories.filter((c) => c.is_active).length;

  const doDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiDelete(`admin/categories/${deleteTarget.id}`);
      setDeleteTarget(null);
      loadCategories();
    } catch (e) {
      alert(e.message || "Delete failed.");
    }
  };

  const toggleActive = async (cat) => {
    try {
      await apiPut(`admin/categories/${cat.id}`, { is_active: !cat.is_active });
      loadCategories();
    } catch (e) {
      alert(e.message || "Update failed.");
    }
  };

  return (
    <AdminPageShell>
      <AdminPageHeader title="Categories" actionLabel="Add Category" actionTo="/admin/add-category" />

      {error && <p className="admin-alert-error" role="alert">{error}</p>}

      <AdminKpiRow
        cards={[
          { label: "Total Categories", value: String(categories.length), icon: faTag, iconVariant: "green" },
          { label: "Active", value: String(activeCount), icon: faCircleCheck, iconVariant: "blue" },
          { label: "Inactive", value: String(categories.length - activeCount), icon: faTag, iconVariant: "orange" },
          { label: "Showing", value: String(filtered.length), icon: faTag, iconVariant: "yellow" },
        ]}
      />

      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, slug, or description…"
      />

      <AdminDataTable loading={loading} loadingMessage="Loading categories…">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Slug</th>
            <th>Description</th>
            <th>Sort</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={7}>
                {search ? "No categories match your search." : "No categories yet. Add your first category."}
              </td>
            </tr>
          ) : (
            filtered.map((row) => (
              <tr key={row.id}>
                <td>
                  {row.image_url ? (
                    <img src={row.image_url} alt="" className="admin-table-img" />
                  ) : (
                    <div className="admin-table-img" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FontAwesomeIcon icon={faImage} style={{ color: "var(--admin-gray-500)" }} />
                    </div>
                  )}
                </td>
                <td className="admin-table-client-name">{row.name}</td>
                <td>{row.slug || "—"}</td>
                <td style={{ maxWidth: 200 }}>{row.description || "—"}</td>
                <td>{row.sort_order ?? "—"}</td>
                <td>
                  <button type="button" onClick={() => toggleActive(row)} style={{ border: "none", background: "none", padding: 0, cursor: "pointer" }}>
                    <AdminStatusBadge status={row.is_active ? "active" : "pending"} label={row.is_active ? "Active" : "Inactive"} />
                  </button>
                </td>
                <td>
                  <div className="admin-table-actions">
                    <button type="button" className="admin-table-action-edit" onClick={() => navigate(`/admin/add-category?edit=${row.id}`)} aria-label="Edit">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button type="button" className="admin-table-action-delete" onClick={() => setDeleteTarget(row)} aria-label="Delete">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </AdminDataTable>

      <AdminTablePagination showing="categories" total={filtered.length} />

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={doDelete}
        title="Delete category"
        message={deleteTarget ? `Delete "${deleteTarget.name}"? Products in this category may be affected.` : ""}
        confirmLabel="Delete"
        variant="danger"
      />
    </AdminPageShell>
  );
}
