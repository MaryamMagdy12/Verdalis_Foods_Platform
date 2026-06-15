/** Min order qty for client vs approved retailer. */
export function minQuantity(product, isRetailer = false) {
  if (isRetailer && product?.wholesale_min_quantity != null) {
    return Math.max(1, Number(product.wholesale_min_quantity));
  }
  return Math.max(1, Number(product?.min_quantity ?? 1));
}

/** Max qty allowed from stock. */
export function maxQuantity(product) {
  const stock = Number(product?.stock);
  if (Number.isFinite(stock) && stock >= 0) return stock;
  return 99;
}

export function clampQuantity(qty, product, isRetailer = false) {
  const min = minQuantity(product, isRetailer);
  const max = Math.max(min, maxQuantity(product));
  return Math.max(min, Math.min(max, qty));
}

export function quantityHint(product, isRetailer = false) {
  const min = minQuantity(product, isRetailer);
  const max = maxQuantity(product);
  if (max <= 0) return "Out of stock";
  if (min > 1) return `Min ${min} · Max ${max} in stock`;
  if (max < 99) return `Max ${max} in stock`;
  return null;
}
