import React, { useEffect, useState } from "react";
import { faWallet, faCircleCheck, faClock, faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { apiGet } from "../api/admin";
import { AdminPageShell } from "../components/dashboard/AdminPageShell";
import { AdminPageHeader } from "../components/dashboard/AdminPageHeader";
import { AdminKpiRow } from "../components/dashboard/AdminKpiRow";
import { AdminFilterBar, AdminFilterSelect } from "../components/dashboard/AdminFilterBar";
import { AdminDataTable, AdminTablePagination } from "../components/dashboard/AdminDataTable";
import { AdminStatusBadge } from "../components/dashboard/AdminStatusBadge";
import { AdminRowActions } from "../components/shared/AdminRowActions";
import { AdminDetailModal, AdminDetailGrid } from "../components/shared/AdminDetailModal";

function clientInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function normalizeItems(items) {
  if (!items) return [];
  if (Array.isArray(items)) return items;
  if (Array.isArray(items.data)) return items.data;
  return [];
}

function buildOrderRows(paymentRow, orderDetail) {
  const clientName = orderDetail?.user?.name || paymentRow?.client_name;
  const clientEmail = orderDetail?.user?.email || paymentRow?.client_email;

  return [
    { label: "Order #", value: orderDetail?.order_number || paymentRow?.order_number },
    { label: "Client", value: clientName },
    { label: "Email", value: clientEmail },
    { label: "Payment status", value: orderDetail?.payment_status || paymentRow?.payment_status },
    { label: "Method", value: orderDetail?.payment_method || paymentRow?.payment_method },
    { label: "Delivery status", value: orderDetail?.status || paymentRow?.status },
    { label: "Subtotal", value: orderDetail ? `$${Number(orderDetail.subtotal || 0).toFixed(2)}` : null },
    { label: "Tax", value: orderDetail ? `$${Number(orderDetail.tax || 0).toFixed(2)}` : null },
    { label: "Shipping", value: orderDetail ? `$${Number(orderDetail.shipping || 0).toFixed(2)}` : null },
    { label: "Discount", value: orderDetail?.discount ? `$${Number(orderDetail.discount).toFixed(2)}` : null },
    { label: "Total", value: `$${Number(orderDetail?.total ?? paymentRow?.total ?? 0).toFixed(2)}` },
    { label: "Shipper", value: orderDetail?.shipper?.name },
    { label: "Shipper email", value: orderDetail?.shipper?.email },
    { label: "Shipper phone", value: orderDetail?.shipper?.phone },
    { label: "Address", value: orderDetail?.shipping_address_text || orderDetail?.shipping_address },
    {
      label: "Paid at",
      value: orderDetail?.paid_at || paymentRow?.paid_at
        ? new Date(orderDetail?.paid_at || paymentRow?.paid_at).toLocaleString()
        : null,
    },
    {
      label: "Created",
      value: (orderDetail?.created_at || paymentRow?.created_at)
        ? new Date(orderDetail?.created_at || paymentRow?.created_at).toLocaleString()
        : null,
    },
  ];
}

export function PaymentsDashboardPage() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ payment_status: "" });
  const [loading, setLoading] = useState(true);
  const [viewTarget, setViewTarget] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  useEffect(() => {
    setLoading(true);
    apiGet("admin/payments", filters)
      .then((res) => setRows(res.data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [filters]);

  const openOrder = async (row) => {
    setViewTarget(row);
    setOrderDetail(null);
    setDetailError("");
    setDetailLoading(true);
    try {
      const res = await apiGet(`admin/orders/${row.id}`);
      setOrderDetail(res.data || null);
      if (!res.data) setDetailError("Order details could not be loaded.");
    } catch (e) {
      setOrderDetail(null);
      setDetailError(e.message || "Failed to load order details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setViewTarget(null);
    setOrderDetail(null);
    setDetailError("");
  };

  const filtered = search
    ? rows.filter((o) =>
        [o.order_number, o.client_name, o.client_email].some((v) =>
          v && String(v).toLowerCase().includes(search.toLowerCase())
        )
      )
    : rows;

  const totalAmount = filtered.reduce((s, o) => s + Number(o.total || 0), 0);
  const paid = filtered.filter((o) => o.payment_status === "paid").length;
  const pending = filtered.filter((o) => o.payment_status === "pending").length;
  const items = normalizeItems(orderDetail?.items);

  return (
    <AdminPageShell>
      <AdminPageHeader title="Payments" />

      <AdminKpiRow
        cards={[
          { label: "Total Payments", value: `$${totalAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: faWallet, iconVariant: "green" },
          { label: "Paid", value: String(paid), icon: faCircleCheck, iconVariant: "blue" },
          { label: "Pending", value: String(pending), icon: faClock, iconVariant: "orange" },
          { label: "Refunded", value: String(filtered.filter((o) => o.payment_status === "refunded").length), icon: faRotateLeft, iconVariant: "yellow" },
        ]}
      />

      <AdminFilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search order, client or email…" onExport={() => {}}>
        <AdminFilterSelect value={filters.payment_status} onChange={(e) => setFilters({ payment_status: e.target.value })} aria-label="Payment status">
          <option value="">All Payment Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </AdminFilterSelect>
      </AdminFilterBar>

      <AdminDataTable loading={loading} loadingMessage="Loading payments…">
        <thead>
          <tr><th>Order #</th><th>Client</th><th>Method</th><th>Status</th><th>Total</th><th>Order Status</th><th>Date</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td colSpan={8}>No payment records.</td></tr>
          ) : (
            filtered.map((o) => (
              <tr key={o.id}>
                <td><strong>{o.order_number}</strong></td>
                <td>
                  <div className="admin-table-client">
                    <span className="admin-table-avatar">{clientInitials(o.client_name)}</span>
                    <div>
                      <span className="admin-table-client-name">{o.client_name || "—"}</span>
                      <span className="admin-table-client-sub">{o.client_email}</span>
                    </div>
                  </div>
                </td>
                <td>{o.payment_method || "—"}</td>
                <td><AdminStatusBadge status={o.payment_status} /></td>
                <td className="admin-table-price">${Number(o.total).toFixed(2)}</td>
                <td><AdminStatusBadge status={o.status} /></td>
                <td>
                  {o.created_at ? (
                    <>
                      {new Date(o.created_at).toLocaleDateString()}
                      <br />
                      <span className="admin-table-client-sub">{new Date(o.created_at).toLocaleTimeString()}</span>
                    </>
                  ) : "—"}
                </td>
                <td>
                  <AdminRowActions onView={() => openOrder(o)} showEdit={false} viewLabel="View order" />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </AdminDataTable>

      <AdminTablePagination showing="payments" total={filtered.length} />

      <AdminDetailModal
        open={!!viewTarget}
        onClose={closeModal}
        title={viewTarget?.order_number ? `Order ${viewTarget.order_number}` : "Order details"}
        subtitle={viewTarget?.client_name ? `Client: ${viewTarget.client_name}` : null}
        loading={detailLoading}
        wide
      >
        {!detailLoading && viewTarget && (
          <>
            {detailError && (
              <p className="admin-alert-error" role="alert" style={{ marginBottom: "1rem" }}>
                {detailError} Showing payment summary only.
              </p>
            )}
            <AdminDetailGrid rows={buildOrderRows(viewTarget, orderDetail)} />
            {items.length > 0 ? (
              <table className="admin-detail-table" style={{ marginTop: "1rem" }}>
                <thead>
                  <tr><th>Product</th><th>SKU</th><th>Qty</th><th>Unit</th><th>Line total</th></tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item.id ?? i}>
                      <td>{item.product_name}</td>
                      <td>{item.sku || "—"}</td>
                      <td>{item.quantity}</td>
                      <td>${Number(item.unit_price || 0).toFixed(2)}</td>
                      <td>${Number(item.line_total || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : !detailError ? (
              <p style={{ marginTop: "1rem", color: "var(--admin-gray-500)", fontSize: "0.85rem" }}>No line items.</p>
            ) : null}
          </>
        )}
      </AdminDetailModal>
    </AdminPageShell>
  );
}
