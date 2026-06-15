import React from "react";
import { statusMeta } from "../utils/shipperOrders";

export function StatusBadge({ status }) {
  const { label, variant } = statusMeta(status);
  return <span className={`sp-badge sp-badge--${variant}`}>{label}</span>;
}
