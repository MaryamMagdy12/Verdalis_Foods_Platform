import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { faTruck, faCircleCheck, faClock, faMapLocationDot } from "@fortawesome/free-solid-svg-icons";
import { apiGet, apiDelete } from "../api/admin";
import { AdminPageShell } from "../components/dashboard/AdminPageShell";
import { AdminPageHeader } from "../components/dashboard/AdminPageHeader";
import { AdminKpiRow } from "../components/dashboard/AdminKpiRow";
import { AdminFilterBar, AdminFilterSelect } from "../components/dashboard/AdminFilterBar";
import { AdminDataTable, AdminTablePagination } from "../components/dashboard/AdminDataTable";
import { AdminStatusBadge } from "../components/dashboard/AdminStatusBadge";
import { AdminRowActions } from "../components/shared/AdminRowActions";
import { AdminDetailModal, AdminDetailGrid } from "../components/shared/AdminDetailModal";
import { ConfirmModal } from "../components/shared/ConfirmModal";

function initials(name) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export function ShippersDashboardPage() {
  const navigate = useNavigate();
  const [shippers, setShippers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewTarget, setViewTarget] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    setLoading(true);
    apiGet("admin/shippers", search ? { search } : {})
      .then((r) => setShippers(r.data || []))
      .catch(() => setShippers([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, [search]);

  const filtered = shippers.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !q || [s.name, s.email, s.phone].some((v) => v && String(v).toLowerCase().includes(q));
    const matchStatus = !statusFilter || (statusFilter === "verified" ? s.has_pin : !s.has_pin);
    return matchSearch && matchStatus;
  });

  const verified = shippers.filter((s) => s.has_pin).length;

  const openView = async (row) => {
    setViewTarget(row);
    setDetailLoading(true);
    try {
      const res = await apiGet(`admin/shippers/${row.id}`);
      setDetail(res.data);
    } catch (_) {
      setDetail(row);
    } finally {
      setDetailLoading(false);
    }
  };

  const doDelete = async () => {
    if (!deleteTarget) return;
    await apiDelete(`admin/shippers/${deleteTarget.id}`);
    setDeleteTarget(null);
    load();
  };
  

  return (
    <AdminPageShell>
      <AdminPageHeader title="Shippers" actionLabel="Add Shipper" actionTo="/admin/add-shipper" />

      <AdminKpiRow
        cards={[
          { label: "Total Shippers", value: String(shippers.length), icon: faTruck, iconVariant: "green" },
          { label: "Verified", value: String(verified), icon: faCircleCheck, iconVariant: "blue" },
          { label: "Not Verified", value: String(shippers.length - verified), icon: faClock, iconVariant: "orange" },
          { label: "Active Routes", value: String(shippers.length), icon: faMapLocationDot, iconVariant: "green" },
        ]}
      />

      <AdminFilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search shippers…" onFilter={() => {}} onExport={() => {}}>
        <AdminFilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Verification">
          <option value="">All Verification</option>
          <option value="verified">Verified</option>
          <option value="unverified">Not Verified</option>
        </AdminFilterSelect>
      </AdminFilterBar>

      <AdminDataTable loading={loading}>
        <thead>
          <tr><th>Shipper</th><th>Email</th><th>Phone</th><th>Address</th><th>Verification</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td colSpan={6}>No shippers found.</td></tr>
          ) : (
            filtered.map((s) => (
              <tr key={s.id}>
                <td>
                  <div className="admin-table-client">
                    {s.photo_url ? (
                      <img src={s.photo_url} alt="" className="admin-table-avatar" style={{ objectFit: "cover" }} />
                    ) : (
                      <span className="admin-table-avatar">{initials(s.name)}</span>
                    )}
                    <span className="admin-table-client-name">{s.name}</span>
                  </div>
                </td>
                <td>{s.email}</td>
                <td>{s.phone || "—"}</td>
                <td>{s.address || "—"}</td>
                <td>
                  <AdminStatusBadge status={s.has_pin ? "verified" : "pending"} label={s.has_pin ? "Verified" : "Not Verified"} />
                </td>
                <td>
                  <AdminRowActions
                    onView={() => openView(s)}
                    onEdit={() => navigate(`/admin/add-shipper?edit=${s.id}`)}
                    onDelete={() => setDeleteTarget(s)}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </AdminDataTable>

      <AdminTablePagination showing="shippers" total={filtered.length} />

      <AdminDetailModal
        open={!!viewTarget}
        onClose={() => { setViewTarget(null); setDetail(null); }}
        title={detail?.name || "Shipper details"}
        loading={detailLoading}
        wide
      >
        <AdminDetailGrid rows={[
          { label: "Name", value: detail?.name },
          { label: "Email", value: detail?.email },
          { label: "Phone", value: detail?.phone },
          { label: "Address", value: detail?.address },
          { label: "Company PIN", value: detail?.pin_is_hashed ? "Re-enter in Edit shipper" : (detail?.shipper_pin || "—") },
          { label: "PIN set", value: detail?.has_pin ? "Yes" : "No" },
          { label: "Joined", value: detail?.created_at ? new Date(detail.created_at).toLocaleString() : "—" },
        ]} />
        {detail?.photo_url && (
          <div style={{ marginTop: "1rem" }}>
            <p style={{ margin: "0 0 0.35rem", fontSize: "0.85rem", fontWeight: 600 }}>Profile photo</p>
            <img src={detail.photo_url} alt="" style={{ maxWidth: "120px", borderRadius: 8 }} />
          </div>
        )}
        {detail?.shipper_identity_url && (
          <p style={{ marginTop: "1rem" }}>
            <a href={detail.shipper_identity_url} target="_blank" rel="noreferrer" className="admin-btn-outline" style={{ display: "inline-block" }}>
              View identity document
            </a>
          </p>
        )}
        {detail?.shipper_certificate_urls?.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            <p style={{ margin: "0 0 0.35rem", fontSize: "0.85rem", fontWeight: 600 }}>Certificates</p>
            <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
              {detail.shipper_certificate_urls.map((url, i) => (
                <li key={url}>
                  <a href={url} target="_blank" rel="noreferrer">Certificate {i + 1}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </AdminDetailModal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={doDelete}
        title="Delete shipper?"
        message={`Remove ${deleteTarget?.name || "this shipper"}?`}
        confirmLabel="Delete"
        variant="danger"
      />
    </AdminPageShell>
  );
}
