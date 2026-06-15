import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { CheckoutTrustStrip } from "../components/checkout/CheckoutTrustStrip";
import { CheckoutTrustCards } from "../components/checkout/CheckoutTrustCards";
import { OrderSummary } from "../components/checkout/OrderSummary";
import { cartTotals, formatCad, lineTotal, resolveUnitPrice } from "../utils/checkout";
import { maxQuantity, minQuantity, quantityHint } from "../utils/productQuantity";
import "../assets/css/checkout-pages.css";

let cartHeroBasket = "";
let pageBg = "";
try {
  cartHeroBasket = new URL("../assets/images/cart-hero-basket.png", import.meta.url).href;
  pageBg = new URL("../assets/images/checkout-page-bg.png", import.meta.url).href;
} catch (_) {}

export function CartPage() {
  const { items, setQty, removeItem, isRetailerPricing, cartError } = useCart();
  const totals = cartTotals(items, isRetailerPricing);
  const pageStyle = {
    ...(pageBg ? { "--ck-page-bg": `url("${pageBg}")` } : {}),
    // ...(cartHeroBasket ? { "--ck-cart-hero-img": `url("${cartHeroBasket}")` } : {}),
  };

  return (
    <div className="ck-page ck-page--cart" style={pageStyle}>
      <section className="ck-hero ck-hero--cart">
        <div className="ck-container ck-hero__inner">
          <div className="ck-hero__copy">
            <nav className="ck-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span aria-hidden="true">&gt;</span>
              <span aria-current="page">Your Cart</span>
            </nav>
            <h1 className="ck-hero__title">Your Cart</h1>
            <p className="ck-hero__sub">Review your selected items and proceed to secure checkout.</p>
          </div>
          <div className="ck-hero__visual" aria-hidden="true" />
        </div>
        <CheckoutTrustStrip className="ck-hero__trust" />
      </section>

      <section className="ck-main">
        <div className="ck-container ck-main__grid">
          <div className="ck-panel ck-cart-panel">
            {items.length === 0 ? (
              <div className="ck-cart-empty">
                <i className="fa-solid fa-cart-shopping" aria-hidden="true" />
                <h2>Your cart is empty</h2>
                <p>Add products from our catalog to get started.</p>
                <Link to="/products" className="ck-btn ck-btn--primary">
                  Browse Products
                </Link>
              </div>
            ) : (
              <>
                <header className="ck-cart-panel__head">
                  <i className="fa-solid fa-cart-shopping" aria-hidden="true" />
                  <h2>Cart Items ({totals.itemCount})</h2>
                </header>
                {cartError && (
                  <p className="ck-login-error" role="alert" style={{ marginBottom: "1rem" }}>
                    {cartError}
                  </p>
                )}
                <div className="ck-cart-table" role="table" aria-label="Cart items">
                  <div className="ck-cart-table__head" role="row">
                    <span role="columnheader">Product</span>
                    <span role="columnheader">Price</span>
                    <span role="columnheader">Quantity</span>
                    <span role="columnheader">Total</span>
                    <span className="ck-cart-table__sr" role="columnheader">Remove</span>
                  </div>
                  {items.map((item) => {
                    const unit = item.unitPrice ?? resolveUnitPrice(item.product, isRetailerPricing);
                    const minQ = minQuantity(item.product, isRetailerPricing);
                    const maxQ = maxQuantity(item.product);
                    const hint = quantityHint(item.product, isRetailerPricing);
                    return (
                      <article key={item.product.id} className="ck-cart-row" role="row">
                        <div className="ck-cart-row__product" role="cell">
                          <div className="ck-cart-row__thumb">
                            {item.product.image ? (
                              <img src={item.product.image} alt="" />
                            ) : (
                              <span className="ck-cart-row__ph" />
                            )}
                          </div>
                          <div>
                            <h3>{item.product.name}</h3>
                            <p>{item.product.description?.slice(0, 40) || "Premium Quality"}</p>
                            {hint && <span className="ck-tag">{hint}</span>}
                          </div>
                        </div>
                        <span className="ck-cart-row__price" role="cell">{formatCad(unit)}</span>
                        <div className="ck-qty" role="cell">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            disabled={item.qty <= minQ}
                            onClick={() => setQty(item.product.id, item.qty - 1)}
                          >
                            −
                          </button>
                          <span>{item.qty}</span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            disabled={item.qty >= maxQ}
                            onClick={() => setQty(item.product.id, item.qty + 1)}
                          >
                            +
                          </button>
                        </div>
                        <span className="ck-cart-row__total" role="cell">{formatCad(lineTotal(item, isRetailerPricing))}</span>
                        <button
                          type="button"
                          className="ck-cart-row__remove"
                          aria-label={`Remove ${item.product.name}`}
                          onClick={() => removeItem(item.product.id)}
                        >
                          <i className="fa-solid fa-xmark" aria-hidden="true" />
                        </button>
                      </article>
                    );
                  })}
                </div>

                {totals.freeShippingGap > 0 && (
                  <div className="ck-shipping-banner">
                    <i className="fa-solid fa-leaf" aria-hidden="true" />
                    <div>
                      <p>Free shipping on orders over $150.</p>
                      <p className="ck-shipping-banner__hint">
                        Add {formatCad(totals.freeShippingGap)} more to get free shipping!
                      </p>
                      <div className="ck-shipping-banner__bar">
                        <span style={{ width: `${totals.freeShippingProgress}%` }} />
                      </div>
                    </div>
                    <i className="fa-solid fa-truck" aria-hidden="true" />
                  </div>
                )}

                <footer className="ck-cart-panel__foot">
                  <Link to="/products" className="ck-btn ck-btn--outline">
                    Continue Shopping
                  </Link>
                  <button type="button" className="ck-btn ck-btn--outline ck-btn--ghost">
                    <i className="fa-solid fa-rotate" aria-hidden="true" />
                    Update Cart
                  </button>
                </footer>
              </>
            )}
          </div>

          {items.length > 0 && (
            <OrderSummary checkoutHref="/checkout" checkoutLabel="Proceed to Checkout" />
          )}
        </div>
      </section>

      <CheckoutTrustCards />
    </div>
  );
}
