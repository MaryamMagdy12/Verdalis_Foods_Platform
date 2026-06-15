import React, { useEffect, useState } from "react";
import { faUsers, faStore, faClock, faChartLine } from "@fortawesome/free-solid-svg-icons";
import { apiGet, apiDelete, apiPost } from "../api/admin";
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

function formatDate(iso) {
  return iso ? new Date(iso).toLocaleString() : "—";
}

function ClientDetailContent({ detail, tab }) {
  if (!detail) return null;

  if (tab === "profile") {
    const rows = [
      { label: "Name", value: detail.name },
      { label: "Email", value: detail.email },
      { label: "Phone", value: detail.phone },
      { label: "Address", value: detail.address || detail.personal_address },
      { label: "Role", value: detail.role },
      { label: "Company", value: detail.company_name },
      { label: "Store", value: detail.store_name },
      { label: "Retailer status", value: detail.retailer_status },
      { label: "Profile complete", value: detail.profile_complete ? "Yes" : "No" },
      { label: "Joined", value: formatDate(detail.created_at) },
    ];
    return <AdminDetailGrid rows={rows} />;
  }

  if (tab === "orders") {
    const orders = detail.orders || [];
    if (!orders.length) return <p>No orders yet.</p>;
    return (
      <table className="admin-detail-table">
        <thead>
          <tr><th>Order #</th><th>Status</th><th>Total</th><th>Date</th></tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.order_number}</td>
              <td>{o.status}</td>
              <td>${Number(o.total).toFixed(2)}</td>
              <td>{formatDate(o.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  const payments = detail.payments || [];
  if (!payments.length) return <p>No payments yet.</p>;
  return (
    <table className="admin-detail-table">
      <thead>
        <tr><th>Order #</th><th>Method</th><th>Status</th><th>Total</th><th>Paid</th></tr>
      </thead>
      <tbody>
        {payments.map((p) => (
          <tr key={p.order_id}>
            <td>{p.order_number}</td>
            <td>{p.payment_method || "—"}</td>
            <td>{p.payment_status}</td>
            <td>${Number(p.total).toFixed(2)}</td>
            <td>{formatDate(p.paid_at)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ClientsDashboardPage() {
  const [tab, setTab] = useState("clients");
  const [clients, setClients] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [search, setSearch] = useState("");
  const [retailerFilter, setRetailerFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewTarget, setViewTarget] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailTab, setDetailTab] = useState("profile");
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    setLoading(true);
    const promise =
      tab === "clients"
        ? apiGet("admin/clients").then((r) => setClients(r.data || []))
        : apiGet("admin/retailers", { status: retailerFilter || undefined }).then((r) => setRetailers(r.data || []));
    promise.finally(() => setLoading(false));
  };

  useEffect(load, [tab, retailerFilter]);

  const verify = async (id, action) => {
    await apiPost(`admin/retailers/${id}/${action}`);
    load();
  };

  const openView = async (row) => {
    setViewTarget(row);
    setDetailTab("profile");
    setDetailLoading(true);
    try {
      const res = await apiGet(`admin/clients/${row.id}`);
      setDetail(res.data);
    } catch (_) {
      setDetail(row);
    } finally {
      setDetailLoading(false);
    }
  };

  const doDelete = async () => {
    if (!deleteTarget) return;
    const path = tab === "clients" ? `admin/clients/${deleteTarget.id}` : `admin/retailers/${deleteTarget.id}`;
    await apiDelete(path);
    setDeleteTarget(null);
    load();
  };

  const rows = tab === "clients" ? clients : retailers;
  const filtered = search
    ? rows.filter((r) =>
        [r.name, r.email, r.company_name, r.phone].some((v) =>
          v && String(v).toLowerCase().includes(search.toLowerCase())
        )
      )
    : rows;

  const pendingRetailers = retailers.filter((r) => r.retailer_status === "pending").length;

  return (
    <AdminPageShell>
      <AdminPageHeader title="Clients" actionLabel="Add Client" onAction={() => {}} />

      <AdminKpiRow
        cards={[
          { label: "Total Clients", value: String(clients.length), trend: "+12.6%", icon: faUsers, iconVariant: "green" },
          { label: "Verified Retailers", value: String(retailers.filter((r) => r.retailer_status === "approved").length), trend: "+5.2%", icon: faStore, iconVariant: "blue" },
          { label: "Pending Verification", value: String(pendingRetailers), trend: "+2.1%", icon: faClock, iconVariant: "orange" },
          { label: "Active This Month", value: String(clients.length), trend: "+8.7%", icon: faChartLine, iconVariant: "green" },
        ]}
      />

      <div className="admin-tabs">
        <button type="button" className={tab === "clients" ? "active" : ""} onClick={() => setTab("clients")}>Normal Clients</button>
        <button type="button" className={tab === "retailers" ? "active" : ""} onClick={() => setTab("retailers")}>Retailers &amp; Verification</button>
      </div>

      <AdminFilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search clients…" onFilter={() => {}}>
        {tab === "retailers" && (
          <AdminFilterSelect value={retailerFilter} onChange={(e) => setRetailerFilter(e.target.value)} aria-label="Retailer status">
            <option value="">All statuses</option>
            <option value="pending">Pending approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </AdminFilterSelect>
        )}
      </AdminFilterBar>

      <AdminDataTable loading={loading}>
        {tab === "clients" ? (
          <>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6}>No clients found.</td></tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="admin-table-client">
                        <span className="admin-table-avatar">{initials(c.name)}</span>
                        <div>
                          <span className="admin-table-client-name">{c.name}</span>
                          <span className="admin-table-client-sub">Client</span>
                        </div>
                      </div>
                    </td>
                    <td>{c.email}</td>
                    <td>{c.phone || "—"}</td>
                    <td>{formatDate(c.created_at)}</td>
                    <td><AdminStatusBadge status="active" label="Active" /></td>
                    <td>
                      <AdminRowActions
                        onView={() => openView(c)}
                        onDelete={() => setDeleteTarget(c)}
                        showEdit={false}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </>
        ) : (
          <>
            <thead>
              <tr><th>Company</th><th>Contact</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={4}>No retailers found.</td></tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="admin-table-client">
                        <span className="admin-table-avatar">{initials(r.company_name || r.name)}</span>
                        <div>
                          <span className="admin-table-client-name">{r.company_name || "—"}</span>
                          <span className="admin-table-client-sub">Retailer</span>
                        </div>
                      </div>
                    </td>
                    <td>{r.name}<br /><span className="admin-table-client-sub">{r.email}</span></td>
                    <td><AdminStatusBadge status={r.retailer_status === "approved" ? "approved" : r.retailer_status} /></td>
                    <td>
                      <div className="admin-table-actions">
                        <AdminRowActions
                          onView={() => openView(r)}
                          onDelete={() => setDeleteTarget(r)}
                          showEdit={false}
                        />
                        {r.retailer_status === "pending" && (
                          <>
                            <button type="button" className="admin-btn-outline admin-btn-sm" onClick={() => verify(r.id, "approve")}>Approve</button>
                            <button type="button" className="admin-btn-outline admin-btn-sm" onClick={() => verify(r.id, "reject")}>Reject</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </>
        )}
      </AdminDataTable>

      <AdminTablePagination showing={tab === "clients" ? "clients" : "retailers"} total={filtered.length} />

      <AdminDetailModal
        open={!!viewTarget}
        onClose={() => { setViewTarget(null); setDetail(null); }}
        title={detail?.name || viewTarget?.name || "Client details"}
        tabs={[
          { id: "profile", label: "Profile" },
          { id: "orders", label: "Orders" },
          { id: "payments", label: "Payments" },
        ]}
        activeTab={detailTab}
        onTabChange={setDetailTab}
        loading={detailLoading}
        wide
      >
        <ClientDetailContent detail={detail} tab={detailTab} />
      </AdminDetailModal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={doDelete}
        title="Delete client?"
        message={`Remove ${deleteTarget?.name || "this account"}? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </AdminPageShell>
  );
}
