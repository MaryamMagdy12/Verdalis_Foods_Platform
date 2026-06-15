import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { cartTotals, formatCad, lineTotal } from "../../utils/checkout";

export function OrderSummary({
  checkoutHref = "/checkout",
  checkoutLabel = "Proceed to Checkout",
  showPaymentLogos = true,
  showConfidence = true,
  showCheckoutButton = true,
}) {
  const { items, isRetailerPricing } = useCart();
  const { isAuthenticated } = useAuth();
  const { subtotal, shipping, tax, total, itemCount, promoSavings } = cartTotals(items, isRetailerPricing);
  const payHref = isAuthenticated ? checkoutHref : "/login";
  const payState = isAuthenticated ? undefined : { from: checkoutHref };

  return (
    <aside className="ck-summary">
      <header className="ck-summary__head">
        <i className="fa-solid fa-receipt" aria-hidden="true" />
        <h2>Order Summary</h2>
      </header>

      {isRetailerPricing && items.length > 0 && (
        <p className="ck-summary__savings" style={{ marginBottom: "0.75rem" }}>
          <i className="fa-solid fa-store" aria-hidden="true" /> Retailer wholesale pricing applied
        </p>
      )}

      {items.length > 0 && (
        <ul className="ck-summary__lines">
          {items.map((item) => (
            <li key={item.product.id} className="ck-summary__item">
              <div className="ck-summary__thumb">
                {item.product.image ? (
                  <img src={item.product.image} alt="" />
                ) : (
                  <span className="ck-summary__thumb-ph" aria-hidden="true" />
                )}
              </div>
              <div className="ck-summary__item-meta">
                <span className="ck-summary__item-name">{item.product.name}</span>
                <span className="ck-summary__item-qty">Qty: {item.qty}</span>
                <span className="ck-summary__item-price">{formatCad(lineTotal(item, isRetailerPricing))}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <dl className="ck-summary__totals">
        <div className="ck-summary__row">
          <dt>Subtotal ({itemCount} items)</dt>
          <dd>{formatCad(subtotal)}</dd>
        </div>
        <div className="ck-summary__row">
          <dt>
            Shipping
            <i className="fa-solid fa-circle-info" title="Flat rate shipping" aria-hidden="true" />
          </dt>
          <dd>{shipping === 0 ? "Free" : formatCad(shipping)}</dd>
        </div>
        <div className="ck-summary__row">
          <dt>Tax (13%)</dt>
          <dd>{formatCad(tax)}</dd>
        </div>
      </dl>

      <div className="ck-summary__grand">
        <span>Total (CAD)</span>
        <strong>{formatCad(total)}</strong>
      </div>

      {promoSavings > 0 && items.length > 0 && (
        <p className="ck-summary__savings">
          <i className="fa-solid fa-tags" aria-hidden="true" />
          You&apos;re saving {formatCad(promoSavings)} on this order!
        </p>
      )}

      {showCheckoutButton && (
        <>
          <Link to={payHref} state={payState} className="ck-btn ck-btn--primary ck-summary__checkout">
            {checkoutLabel}
            <i className="fa-solid fa-lock" aria-hidden="true" />
          </Link>
          <p className="ck-summary__secure-note">
            <i className="fa-solid fa-shield-halved" aria-hidden="true" />
            100% Secure Checkout
          </p>
        </>
      )}

      {showPaymentLogos && (
        <div className="ck-summary__payments" aria-label="Accepted payment methods">
          <span>Visa</span>
          <span>Mastercard</span>
          <span>Amex</span>
          <span>PayPal</span>
        </div>
      )}

      {showConfidence && (
        <div className="ck-summary__confidence">
          <i className="fa-solid fa-leaf ck-summary__confidence-leaf" aria-hidden="true" />
          <ul>
            <li><i className="fa-solid fa-check" aria-hidden="true" /> Secure payments</li>
            <li><i className="fa-solid fa-check" aria-hidden="true" /> Encrypted transactions</li>
            <li><i className="fa-solid fa-check" aria-hidden="true" /> Your data is protected</li>
            <li><i className="fa-solid fa-check" aria-hidden="true" /> 24/7 Customer support</li>
          </ul>
        </div>
      )}
    </aside>
  );
}
