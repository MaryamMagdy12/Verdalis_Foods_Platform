import React from "react";
import { Link } from "react-router-dom";
import "../../assets/css/home-sections.css";

const benefits = [
  { icon: "fa-tags", title: "Wholesale Pricing", desc: "Special rates after admin approval." },
  { icon: "fa-file-invoice", title: "Quotations & Invoices", desc: "Request quotes for large orders." },
  { icon: "fa-boxes-stacked", title: "Bulk Quantities", desc: "Higher minimums, better value." },
  { icon: "fa-chart-line", title: "Business Dashboard", desc: "Orders, pricing, and account tools." },
];

export function HomeRetailerBenefits() {
  return (
    <section className="hp-ref-benefits" aria-labelledby="retailer-benefits-title">
      <div className="hp-ref-benefits__leaf hp-ref-benefits__leaf--l" aria-hidden="true" />
      <div className="hp-ref-benefits__leaf hp-ref-benefits__leaf--r" aria-hidden="true" />
      <div className="vf-container">
        <header className="hp-ref-benefits__header">
          <p className="hp-ref-benefits__kicker">For businesses —</p>
          <h2 id="retailer-benefits-title" className="hp-ref-benefits__title">
            Retailer Benefits
          </h2>
          <div className="hp-ref-benefits__ornament" aria-hidden="true">
            <span />
            <i className="fa-solid fa-leaf" />
            <span />
          </div>
        </header>

        <div className="hp-ref-benefits__grid">
          {benefits.map((b) => (
            <article key={b.title} className="hp-ref-benefits__card">
              <span className="hp-ref-benefits__card-icon">
                <i className={`fa-solid ${b.icon}`} aria-hidden="true" />
              </span>
              <h3>{b.title}</h3>
              <p>{b.desc}</p>
              <span className="hp-ref-benefits__card-rule" aria-hidden="true" />
            </article>
          ))}
        </div>

        <div className="hp-ref-benefits__cta">
          <Link to="/register/retailer" className="hp-ref-benefits__btn">
            Learn More
            <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
