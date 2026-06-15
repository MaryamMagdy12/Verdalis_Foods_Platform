import React from "react";

const VARIANT_MAP = {
  paid: "success",
  delivered: "success",
  active: "success",
  approved: "success",
  verified: "success",
  shipped: "info",
  processing: "warning",
  pending: "warning",
  pending_payment: "warning",
  failed: "danger",
  cancelled: "danger",
  rejected: "danger",
  refunded: "info",
};

export function AdminStatusBadge({ status, label }) {
  const key = (status || label || "").toLowerCase().replace(/\s+/g, "_");
  const variant = VARIANT_MAP[key] || "neutral";
  const text = label || (status ? String(status).replace(/_/g, " ") : "—");

  return <span className={`admin-badge admin-badge--${variant}`}>{text}</span>;
}
