import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStore, faMapMarkerAlt, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { apiGet, apiDelete } from "../api/admin";
import { ConfirmModal } from "../components/shared/ConfirmModal";
import { AdminPageShell } from "../components/dashboard/AdminPageShell";
import { AdminPageHeader } from "../components/dashboard/AdminPageHeader";
import { AdminKpiRow } from "../components/dashboard/AdminKpiRow";
import { AdminFilterBar } from "../components/dashboard/AdminFilterBar";

export function StoreDashboardPage() {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiGet("admin/stores");
      setStores(res.data || []);
    } catch (e) {
      setError(e.message || "Failed to load stores.");
      setStores([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const doDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiDelete(`admin/stores/${deleteTarget.id}`);
      setDeleteTarget(null);
      load();
    } catch (e) {
      alert(e.message || "Delete failed.");
    }
  };

  const filtered = search
    ? stores.filter((s) => (s.name + " " + (s.address || "")).toLowerCase().includes(search.toLowerCase()))
    : stores;

  return (
    <AdminPageShell>
      <AdminPageHeader title="Stores" actionLabel="Add Store" actionTo="/admin/add-store" />

      {error && <p className="admin-alert-error" role="alert">{error}</p>}

      <AdminKpiRow
        cards={[
          { label: "Total Stores", value: String(stores.length), icon: faStore, iconVariant: "green" },
          { label: "Locations", value: String(stores.length), icon: faMapMarkerAlt, iconVariant: "blue" },
          { label: "Showing", value: String(filtered.length), icon: faStore, iconVariant: "yellow" },
          { label: "Regions", value: "—", icon: faMapMarkerAlt, iconVariant: "orange" },
        ]}
      />

      <AdminFilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search stores…" />

      {loading ? (
        <p className="admin-loading">Loading stores…</p>
      ) : filtered.length === 0 ? (
        <p className="admin-loading">No stores found.</p>
      ) : (
        <div className="admin-card-grid">
          {filtered.map((s) => (
            <article key={s.id} className="admin-list-card">
              <div className="admin-list-card-header">
                <FontAwesomeIcon icon={faStore} className="admin-list-card-icon" />
                <div>
                  <strong>{s.name}</strong>
                  <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "var(--admin-gray-500)" }}>
                    <FontAwesomeIcon icon={faMapMarkerAlt} style={{ marginRight: "0.35rem" }} />
                    {s.address || "No address"}
                  </p>
                </div>
              </div>
              <div className="admin-list-card-actions">
                <button type="button" className="admin-btn-outline admin-btn-sm" onClick={() => navigate(`/admin/add-store?edit=${s.id}`)}>
                  <FontAwesomeIcon icon={faEdit} /> Edit
                </button>
                <button type="button" className="admin-btn-outline admin-btn-sm" onClick={() => setDeleteTarget(s)} style={{ borderColor: "#dc2626", color: "#dc2626" }}>
                  <FontAwesomeIcon icon={faTrash} /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={doDelete}
        title="Delete store"
        message={deleteTarget ? `Are you sure you want to delete "${deleteTarget.name}"?` : ""}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />
    </AdminPageShell>
  );
}
