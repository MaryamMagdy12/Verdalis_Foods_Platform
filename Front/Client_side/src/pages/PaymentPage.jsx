import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { OrderSummary } from "../components/checkout/OrderSummary";
import { CompleteProfileModal } from "../components/checkout/CompleteProfileModal";
import { cartTotals, formatCad } from "../utils/checkout";
import { isProfileReadyForCheckout } from "../utils/profile";
import { apiGetAuth, apiPostAuth } from "../api/client";
import "../assets/css/checkout-pages.css";

let pageBg = "";
try {
  pageBg = new URL("../assets/images/checkout-page-bg.png", import.meta.url).href;
} catch (_) {}

const PAYMENT_METHODS = [
  { id: "online", label: "Online Payment Request", icon: "fa-credit-card" },
  { id: "cod", label: "Cash on Delivery", icon: "fa-money-bill" },
  { id: "bank_transfer", label: "Bank Transfer", icon: "fa-building-columns" },
];

export function PaymentPage() {
  const navigate = useNavigate();
  const { items, clearCart, isRetailerPricing } = useCart();
  const { isAuthenticated, user, refreshUser } = useAuth();
  const { total } = cartTotals(items, isRetailerPricing);
  const [method, setMethod] = useState("online");
  const [placed, setPlaced] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [trackingToken, setTrackingToken] = useState("");
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [shippingAddress, setShippingAddress] = useState(null);
  const [profileReady, setProfileReady] = useState(false);

  const pageStyle = pageBg ? { "--ck-page-bg": `url("${pageBg}")` } : {};

  useEffect(() => {
    setProfileReady(isProfileReadyForCheckout(user));
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated || !isProfileReadyForCheckout(user)) return;
    apiGetAuth("addresses")
      .then((res) => {
        const list = res.data || [];
        setShippingAddress(list.find((a) => a.is_default) || list[0] || null);
      })
      .catch(() => setShippingAddress(null));
  }, [isAuthenticated, user, profileReady]);

  if (!isAuthenticated) {
    return (
      <div className="ck-page ck-page--checkout" style={pageStyle}>
        <div className="ck-container ck-checkout-gate">
          <p>Please sign in to complete your purchase.</p>
          <Link to="/login" state={{ from: "/checkout" }} className="ck-btn ck-btn--primary">
            Sign In
          </Link>
          <Link to="/cart" className="ck-back-link">Back to Cart</Link>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !placed) {
    return (
      <div className="ck-page ck-page--checkout" style={pageStyle}>
        <div className="ck-container ck-checkout-gate">
          <p>Your cart is empty.</p>
          <Link to="/products" className="ck-btn ck-btn--primary">Browse Products</Link>
        </div>
      </div>
    );
  }

  if (!profileReady && !placed) {
    return (
      <div className="ck-page ck-page--checkout" style={pageStyle}>
        <CompleteProfileModal
          user={user}
          onComplete={async (data) => {
            await refreshUser();
            setProfileReady(isProfileReadyForCheckout(data));
          }}
          onClose={() => navigate("/cart")}
        />
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!shippingAddress) {
        setError("Please add a delivery address before placing your order.");
        setLoading(false);
        return;
      }

      const shipping_address = {
        line1: shippingAddress.line1,
        line2: shippingAddress.line2 || undefined,
        city: shippingAddress.city,
        province: shippingAddress.province || undefined,
        postal_code: shippingAddress.postal_code,
        country: shippingAddress.country || "CA",
        latitude: shippingAddress.latitude,
        longitude: shippingAddress.longitude,
      };

      const orderRes = await apiPostAuth("orders", {
        items: items.map((i) => ({
          product_id: Number(i.product?.id || i.productId),
          quantity: i.qty || 1,
        })),
        payment_method: method,
        address_id: shippingAddress.id,
        shipping_address,
      });

      const order = orderRes.data;
      setOrderNumber(order?.order_number || "");
      setTrackingToken(orderRes.tracking_token || "");

      if (method === "online" && order?.payment_status !== "paid") {
        const checkout = await apiPostAuth(`orders/${order.id}/checkout-session`, {});
        if (checkout.data?.checkout_url) {
          setCheckoutUrl(checkout.data.checkout_url);
          window.location.href = checkout.data.checkout_url;
          return;
        }
      }

      setPlaced(true);
      clearCart();
      setTimeout(() => navigate("/dashboard/orders", { replace: true }), 3200);
    } catch (err) {
      const msg = err.body?.message || err.message || "Could not place order. Please try again.";
      setError(msg);
      if (String(msg).toLowerCase().includes("complete your profile")) {
        setProfileReady(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const deliveryLabel = shippingAddress
    ? [shippingAddress.line1, shippingAddress.city, shippingAddress.postal_code].filter(Boolean).join(", ")
    : "No address on file";

  const successMessage =
    method === "online"
      ? "Order placed — complete online payment to confirm."
      : method === "bank_transfer"
        ? "Order placed — awaiting payment confirmation."
        : orderNumber
          ? `Order ${orderNumber} placed successfully!`
          : "Order placed successfully!";

  return (
    <div className="ck-page ck-page--checkout" style={pageStyle}>
      {placed && (
        <div className="ck-pay-success" role="status">
          <p>
            <i className="fa-solid fa-circle-check" aria-hidden="true" />
            {successMessage}
          </p>
          {trackingToken && (
            <p className="ck-login-card__hint">
              Save your tracking token to follow this order on the Track page.
            </p>
          )}
        </div>
      )}

      <section className="ck-checkout-head">
        <div className="ck-container">
          <Link to="/cart" className="ck-back-link">
            <i className="fa-solid fa-arrow-left" aria-hidden="true" />
            Back to Cart
          </Link>
          <h1 className="ck-checkout-head__title">
            Secure <span>Checkout</span>
          </h1>
          <p className="ck-checkout-head__sub">
            <i className="fa-solid fa-lock" aria-hidden="true" />
            Prices and totals are confirmed by our server when you place the order
          </p>
        </div>
      </section>

      <section className="ck-main ck-main--checkout">
        <div className="ck-container ck-checkout-grid">
          <form className="ck-payment-form" onSubmit={handlePlaceOrder}>
            {error && <p className="ck-login-error" role="alert">{error}</p>}

            <section className="ck-form-block">
              <h2>
                <span className="ck-step">1</span>
                Payment Method
              </h2>
              <div className="ck-pay-methods">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={`ck-pay-method ${method === m.id ? "ck-pay-method--active" : ""}`}
                    onClick={() => setMethod(m.id)}
                  >
                    <i className={`fa-solid ${m.icon}`} aria-hidden="true" />
                    <span>{m.label}</span>
                    {method === m.id && <i className="fa-solid fa-circle-check ck-pay-method__check" aria-hidden="true" />}
                  </button>
                ))}
              </div>
              {method === "online" && (
                <p className="ck-login-card__hint">You will be redirected to our secure payment page. Fulfillment starts after payment is verified.</p>
              )}
              {method === "bank_transfer" && (
                <p className="ck-login-card__hint">Your order will be held until our team confirms your bank transfer.</p>
              )}
            </section>

            <section className="ck-form-block">
              <h2>
                <span className="ck-step">2</span>
                Delivery
              </h2>
              <p className="ck-login-card__hint">{deliveryLabel}</p>
              {!shippingAddress && (
                <p className="ck-login-error" role="alert">Add a delivery address in your dashboard before checkout.</p>
              )}
            </section>

            <button type="submit" className="ck-btn ck-btn--primary ck-pay-submit" disabled={loading || placed || !shippingAddress}>
              {loading ? "Processing…" : `Place Order ${formatCad(total)}`}
              <i className="fa-solid fa-lock" aria-hidden="true" />
            </button>
            {checkoutUrl && (
              <p className="ck-login-card__hint">
                <a href={checkoutUrl}>Continue to payment</a>
              </p>
            )}
            <p className="ck-legal">
              By placing your order you agree to our{" "}
              <Link to="/contact">Terms &amp; Conditions</Link> and{" "}
              <Link to="/contact">Privacy Policy</Link>.
            </p>
          </form>

          <div className="ck-checkout-aside">
            <div className="ck-secure-badge">
              <i className="fa-solid fa-shield-halved" aria-hidden="true" />
              <div>
                <strong>Secure Checkout</strong>
                <p>Payment status updates only after gateway or admin confirmation.</p>
              </div>
            </div>
            <OrderSummary showCheckoutButton={false} showPaymentLogos={false} showConfidence={false} />
          </div>
        </div>
      </section>
    </div>
  );
}
