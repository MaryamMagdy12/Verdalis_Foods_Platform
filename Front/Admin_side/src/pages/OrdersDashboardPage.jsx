import React, { useEffect, useState } from "react";
import {
  faClipboardList,
  faDollarSign,
  faClock,
  faTruck,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { apiGet, apiPatch } from "../api/admin";
import { AdminPageShell } from "../components/dashboard/AdminPageShell";
import { AdminPageHeader } from "../components/dashboard/AdminPageHeader";
import { AdminKpiRow } from "../components/dashboard/AdminKpiRow";
import { AdminFilterBar, AdminFilterSelect } from "../components/dashboard/AdminFilterBar";
import { AdminDataTable, AdminTablePagination } from "../components/dashboard/AdminDataTable";
import { AdminStatusBadge } from "../components/dashboard/AdminStatusBadge";

const STATUS_OPTIONS = [
  "pending_payment", "paid", "preparing", "ready_for_pickup", "picked_up",
  "out_for_delivery", "delivered", "cancelled", "failed_delivery",
];

function clientInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export function OrdersDashboardPage() {
  const [orders, setOrders] = useState([]);
  const [shippers, setShippers] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ status: "", payment_status: "", client_type: "" });
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(null);

  const loadOrders = () => {
    setLoading(true);
    apiGet("admin/orders", filters)
      .then((res) => setOrders(res.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, [filters]);

  useEffect(() => {
    apiGet("admin/shippers")
      .then((res) => setShippers(res.data || []))
      .catch(() => setShippers([]));
  }, []);

  const assignShipper = async (orderId, shipperId) => {
    if (!shipperId) return;
    setAssigning(orderId);
    try {
      await apiPatch(`admin/orders/${orderId}/assign-shipper`, { shipper_id: Number(shipperId) });
      loadOrders();
    } catch (_) {}
    setAssigning(null);
  };

  const filtered = search
    ? orders.filter((o) =>
        [o.order_number, o.user?.name, o.user?.email].some((v) =>
          v && String(v).toLowerCase().includes(search.toLowerCase())
        )
      )
    : orders;

  const totalRevenue = filtered.reduce((s, o) => s + Number(o.total || 0), 0);
  const pending = filtered.filter((o) => o.payment_status === "pending").length;
  const delivered = filtered.filter((o) => o.status === "delivered").length;

  return (
    <AdminPageShell>
      <AdminPageHeader title="Orders" />

      <AdminKpiRow
        cards={[
          { label: "Total Orders", value: String(filtered.length), trend: "+12.6%", icon: faClipboardList, iconVariant: "green" },
          { label: "Total Revenue", value: `$${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, trend: "+16.4%", icon: faDollarSign, iconVariant: "blue" },
          { label: "Pending Orders", value: String(pending), trend: "-3.2%", trendUp: false, icon: faClock, iconVariant: "orange" },
          { label: "Delivered", value: String(delivered), trend: "+8.7%", icon: faTruck, iconVariant: "green" },
        ]}
      />

      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search order, client or ID…"
        onExport={() => {}}
      >
        <AdminFilterSelect value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} aria-label="Status">
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </AdminFilterSelect>
        <AdminFilterSelect value={filters.payment_status} onChange={(e) => setFilters({ ...filters, payment_status: e.target.value })} aria-label="Payment">
          <option value="">All Payments</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </AdminFilterSelect>
        <AdminFilterSelect value={filters.client_type} onChange={(e) => setFilters({ ...filters, client_type: e.target.value })} aria-label="Client type">
          <option value="">All Client Types</option>
          <option value="client">Normal clients</option>
          <option value="retailer">Retailers</option>
        </AdminFilterSelect>
      </AdminFilterBar>

      <AdminDataTable loading={loading} loadingMessage="Loading orders…">
        <thead>
          <tr>
            <th>Order #</th>
            <th>Client</th>
            <th>Total</th>
            <th>Payment</th>
            <th>Delivery status</th>
            <th>Shipper</th>
            <th>Shipper Name</th>
            <th>Date</th> 
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td colSpan={7}>No orders found.</td></tr>
          ) : (
            filtered.map((o) => (
              <tr key={o.id}>
                <td><strong>{o.order_number}</strong></td>
                <td>
                  <div className="admin-table-client">
                    <span className="admin-table-avatar">{clientInitials(o.user?.name)}</span>
                    <div>
                      <span className="admin-table-client-name">{o.user?.name || "—"}</span>
                      <span className="admin-table-client-sub">{o.user?.email}</span>
                    </div>
                  </div>
                </td>
                <td className="admin-table-price">${Number(o.total).toFixed(2)}</td>
                <td><AdminStatusBadge status={o.payment_status} /></td>
                <td><AdminStatusBadge status={o.status} /></td>
                <td>
                  <select
                    value={o.shipper_id || ""}
                    disabled={assigning === o.id}
                    className="admin-table-select-shipper"
                    onChange={(e) => assignShipper(o.id, e.target.value)}
                    aria-label={`Assign shipper for ${o.order_number}`}
                    style={{ minWidth: "10rem" }}
                  >
                    <option value="">Assign shipper…</option>
                    {shippers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  {/* {o.shipper?.name && <span className="admin-table-client-sub">{o.shipper.name}</span>} */}
                </td>
                <td>{o.shipper?.name || "—"}</td>
                <td>{o.created_at ? new Date(o.created_at).toLocaleDateString() : "—"}</td>
              </tr>
            ))
          )}
        </tbody>
      </AdminDataTable>

      <AdminTablePagination showing="orders" total={filtered.length} />
    </AdminPageShell>
  );
}
