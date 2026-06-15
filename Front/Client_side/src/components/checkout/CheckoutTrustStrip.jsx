import React from "react";

const TRUST_ITEMS = [
  { icon: "fa-shield-halved", title: "Secure Checkout", sub: "100% Protected" },
  { icon: "fa-leaf", title: "Premium Quality", sub: "Carefully Sourced" },
  { icon: "fa-truck", title: "Fast Delivery", sub: "On-time & Reliable" },
  { icon: "fa-rotate-left", title: "Easy Returns", sub: "Hassle Free" },
];

export function CheckoutTrustStrip({ className = "" }) {
  return (
    <ul className={`ck-trust-strip ${className}`.trim()}>
      {TRUST_ITEMS.map((item) => (
        <li key={item.title} className="ck-trust-strip__item">
          <span className="ck-trust-strip__icon" aria-hidden="true">
            <i className={`fa-solid ${item.icon}`} />
          </span>
          <span className="ck-trust-strip__text">
            <strong>{item.title}</strong>
            <span>{item.sub}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
