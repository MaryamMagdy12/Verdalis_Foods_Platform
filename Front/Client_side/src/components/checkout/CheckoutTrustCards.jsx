import React from "react";

const CARDS = [
  { icon: "fa-leaf", title: "Premium Quality", text: "Carefully sourced products." },
  { icon: "fa-truck", title: "Reliable Delivery", text: "On-time delivery you can count on." },
  { icon: "fa-lock", title: "Secure Payments", text: "100% safe and encrypted." },
  { icon: "fa-headset", title: "Dedicated Support", text: "We're here to help you anytime." },
];

export function CheckoutTrustCards() {
  return (
    <section className="ck-trust-cards" aria-label="Why shop with us">
      <div className="ck-container">
        <ul className="ck-trust-cards__grid">
          {CARDS.map((c) => (
            <li key={c.title} className="ck-trust-cards__card">
              <span className="ck-trust-cards__icon" aria-hidden="true">
                <i className={`fa-solid ${c.icon}`} />
              </span>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
