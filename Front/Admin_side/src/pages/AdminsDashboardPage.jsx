import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { faUserShield, faUsers, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { apiGet, apiDelete } from "../api/admin";
import { AdminPageShell } from "../components/dashboard/AdminPageShell";
import { AdminPageHeader } from "../components/dashboard/AdminPageHeader";
import { AdminKpiRow } from "../components/dashboard/AdminKpiRow";
import { AdminFilterBar } from "../components/dashboard/AdminFilterBar";
import { AdminDataTable, AdminTablePagination } from "../components/dashboard/AdminDataTable";
import { AdminStatusBadge } from "../components/dashboard/AdminStatusBadge";
import { AdminRowActions } from "../components/shared/AdminRowActions";
import { AdminDetailModal, AdminDetailGrid } from "../components/shared/AdminDetailModal";
import { ConfirmModal } from "../components/shared/ConfirmModal";

function initials(name) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export function AdminsDashboardPage() {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [viewTarget, setViewTarget] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    setLoading(true);
    apiGet("admin/admins", search ? { search } : {})
      .then((r) => {
        setAdmins(r.data || []);
        setTotal(r.meta?.total ?? (r.data?.length || 0));
      })
      .catch(() => {
        setAdmins([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [search]);

  const openView = async (row) => {
    setViewTarget(row);
    setDetailLoading(true);
    try {
      const res = await apiGet(`admin/admins/${row.id}`);
      setDetail(res.data);
    } catch (_) {
      setDetail(row);
    } finally {
      setDetailLoading(false);
    }
  };

  const doDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiDelete(`admin/admins/${deleteTarget.id}`);
      setDeleteTarget(null);
      load();
    } catch (e) {
      alert(e.message || "Delete failed.");
    }
  };

  return (
    <AdminPageShell>
      <AdminPageHeader title="Admins" actionLabel="Add Admin" actionTo="/admin/add-admin" />

      <AdminKpiRow
        cards={[
          { label: "Total Admins", value: String(total), icon: faUserShield, iconVariant: "green" },
          { label: "Active Accounts", value: String(total), icon: faUsers, iconVariant: "blue" },
          { label: "Super Admins", value: String(total), icon: faUserShield, iconVariant: "yellow" },
          { label: "Showing", value: String(admins.length), icon: faEnvelope, iconVariant: "green" },
        ]}
      />

      <AdminFilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search by name or email…" />

      <AdminDataTable loading={loading} loadingMessage="Loading admins…">
        <thead>
          <tr><th>Admin</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {admins.length === 0 ? (
            <tr><td colSpan={6}>No admin accounts found.</td></tr>
          ) : (
            admins.map((a) => (
              <tr key={a.id}>
                <td>
                  <div className="admin-table-client">
                    <span className="admin-table-avatar">{initials(a.name)}</span>
                    <span className="admin-table-client-name">{a.name}</span>
                  </div>
                </td>
                <td>{a.email}</td>
                <td>{a.role || "admin"}</td>
                <td>{a.created_at ? new Date(a.created_at).toLocaleString() : "—"}</td>
                <td><AdminStatusBadge status="active" label="Active" /></td>
                <td>
                  <AdminRowActions
                    onView={() => openView(a)}
                    onEdit={() => navigate(`/admin/add-admin?edit=${a.id}`)}
                    onDelete={() => setDeleteTarget(a)}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </AdminDataTable>

      <AdminTablePagination showing="admins" total={total || admins.length} />

      <AdminDetailModal
        open={!!viewTarget}
        onClose={() => { setViewTarget(null); setDetail(null); }}
        title={detail?.name || "Admin details"}
        loading={detailLoading}
      >
        <AdminDetailGrid rows={[
          { label: "Name", value: detail?.name },
          { label: "Email", value: detail?.email },
          { label: "Role", value: detail?.role || "admin" },
          { label: "Joined", value: detail?.created_at ? new Date(detail.created_at).toLocaleString() : "—" },
        ]} />
      </AdminDetailModal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={doDelete}
        title="Delete admin?"
        message={`Remove ${deleteTarget?.name || "this admin"}?`}
        confirmLabel="Delete"
        variant="danger"
      />
    </AdminPageShell>
  );
}
