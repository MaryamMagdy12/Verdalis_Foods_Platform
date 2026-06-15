import React from "react";

const items = [
  { icon: "fa-solid fa-lock", title: "Secure Payments", sub: "Safe checkout" },
  { icon: "fa-solid fa-certificate", title: "Certified Quality", sub: "Audited suppliers" },
  { icon: "fa-solid fa-headset", title: "24/7 Support", sub: "We're here to help" },
  { icon: "fa-solid fa-rotate-left", title: "Easy Returns", sub: "Hassle-free process" },
];

export function ProductsTrustBar() {
  return (
    <section className="pp-trust" aria-label="Trust highlights">
      <div className="pp-container pp-trust__grid">
        {items.map((item) => (
          <div key={item.title} className="pp-trust__item">
            <span className="pp-trust__icon">
              <i className={item.icon} aria-hidden="true" />
            </span>
            <div>
              <strong>{item.title}</strong>
              <span>{item.sub}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
