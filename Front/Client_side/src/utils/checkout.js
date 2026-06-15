const SHIPPING_FLAT = 15;
const TAX_RATE = 0.13;
const FREE_SHIPPING_THRESHOLD = 150;
const PROMO_SAVINGS = 10;

/** Effective unit price for cart/checkout (retail vs approved retailer wholesale). */
export function resolveUnitPrice(product, isRetailer = false) {
  if (isRetailer && product?.wholesale_price != null && product.wholesale_price !== "") {
    return Number(product.wholesale_price);
  }
  if (product?.price != null && product.price !== "") {
    return Number(product.price);
  }
  if (product?.unitPrice != null) return Number(product.unitPrice);
  const id = Number(product?.id) || 0;
  const prices = [24.99, 9.99, 24.99, 7.99, 14.99, 19.99, 12.99, 29.99];
  return prices[Math.abs(id) % prices.length];
}

/** @deprecated use resolveUnitPrice */
export function estimateUnitPrice(product, isRetailer = false) {
  return resolveUnitPrice(product, isRetailer);
}

export function lineTotal(item, isRetailer = false) {
  const unit = item.unitPrice ?? resolveUnitPrice(item.product, isRetailer);
  return unit * (item.qty || 1);
}

export function cartSubtotal(items, isRetailer = false) {
  return items.reduce((sum, item) => sum + lineTotal(item, isRetailer), 0);
}

export function cartTotals(items, isRetailer = false) {
  const subtotal = cartSubtotal(items, isRetailer);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  const tax = (subtotal + shipping) * TAX_RATE;
  const total = subtotal + shipping + tax;
  const freeShippingGap = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return {
    subtotal,
    shipping,
    tax,
    total,
    itemCount: items.reduce((n, i) => n + (i.qty || 1), 0),
    freeShippingGap,
    freeShippingProgress,
    promoSavings: subtotal > 0 ? PROMO_SAVINGS : 0,
    isWholesale: isRetailer,
  };
}

export function formatCad(amount) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  }).format(amount);
}
