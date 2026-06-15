export const STATUS = {
  ready_for_pickup: "ready_for_pickup",
  picked_up: "picked_up",
  out_for_delivery: "out_for_delivery",
  delivered: "delivered",
  failed_delivery: "failed_delivery",
};

export function statusMeta(status) {
  const map = {
    ready_for_pickup: { label: "Assigned", variant: "assigned" },
    picked_up: { label: "Picked Up", variant: "picked" },
    out_for_delivery: { label: "On The Way", variant: "way" },
    delivered: { label: "Delivered", variant: "delivered" },
    failed_delivery: { label: "Failed", variant: "failed" },
    cancelled: { label: "Cancelled", variant: "failed" },
  };
  return map[status] || { label: status?.replace(/_/g, " ") || "—", variant: "pending" };
}

export function formatAddress(address) {
  if (!address) return "—";
  if (typeof address === "string") return address;
  return [address.line1, address.line2, address.city, address.province, address.postal_code]
    .filter(Boolean)
    .join(", ");
}

export function mapsUrl(address) {
  const q = encodeURIComponent(formatAddress(address));
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function computeStats(orders = [], performance = null) {
  const assigned = orders.filter((o) => o.status === "ready_for_pickup").length;
  const pickedUp = orders.filter((o) => o.status === "picked_up").length;
  const onWay = orders.filter((o) => o.status === "out_for_delivery").length;
  const pending = assigned;
  const delivered = performance?.delivered_today ?? orders.filter((o) => o.status === "delivered").length;
  const failed = performance?.failed_total ?? orders.filter((o) => o.status === "failed_delivery").length;
  const active = orders.filter((o) =>
    ["ready_for_pickup", "picked_up", "out_for_delivery"].includes(o.status)
  ).length;
  const total = active + delivered + failed;

  return {
    assigned: active,
    pickedUp,
    onWay,
    delivered,
    pending,
    failed,
    completed: delivered + failed,
    total: total || orders.length,
    successRate: performance?.success_rate ?? (delivered + failed > 0 ? Math.round((delivered / (delivered + failed)) * 100) : 100),
  };
}

export function filterOrders(orders, tab, search) {
  let list = [...orders];
  if (tab === "assigned") list = list.filter((o) => o.status === STATUS.ready_for_pickup);
  else if (tab === "picked_up") list = list.filter((o) => o.status === STATUS.picked_up);
  else if (tab === "way") list = list.filter((o) => o.status === STATUS.out_for_delivery);
  else if (tab === "delivered") list = list.filter((o) => o.status === STATUS.delivered);
  else if (tab === "failed") list = list.filter((o) => o.status === STATUS.failed_delivery);

  const q = search?.trim().toLowerCase();
  if (q) {
    list = list.filter((o) =>
      [o.order_number, o.client_name, formatAddress(o.address)].some(
        (v) => v && String(v).toLowerCase().includes(q)
      )
    );
  }
  return list;
}

export function paymentLabel(order) {
  if (order?.payment_status === "paid") return "Prepaid";
  if (order?.payment_method === "cod") return "Cash on Delivery";
  return order?.payment_status || "Pending";
}
