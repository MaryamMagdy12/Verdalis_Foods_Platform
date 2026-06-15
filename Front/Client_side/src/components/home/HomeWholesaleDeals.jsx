import React from "react";
import { Link } from "react-router-dom";
import olivesDecor from "../../assets/images/home-category-olives.png";
import "../../assets/css/home-sections.css";

export function HomeWholesaleDeals() {
  return (
    <section className="hp-ref-wholesale" aria-labelledby="wholesale-deals-title">
      <div className="vf-container">
        <div className="hp-ref-wholesale__banner">
          <div className="hp-ref-wholesale__pattern" aria-hidden="true" />
          {/* <img src={olivesDecor} alt="" className="hp-ref-wholesale__decor" loading="lazy" /> */}
          <div className="hp-ref-wholesale__main">
            <div className="hp-ref-wholesale__copy">
              <span className="hp-ref-wholesale__badge">
                <i className="fa-solid fa-tag" aria-hidden="true" />
                Wholesale deals
              </span>
              <h2 id="wholesale-deals-title" className="hp-ref-wholesale__title">
                Bulk pricing for approved retailers
              </h2>
              <p className="hp-ref-wholesale__text">
                Register your business for wholesale rates, bulk minimums, quotations, and invoice billing.
              </p>
            </div>
            <div className="hp-ref-wholesale__actions">
              <Link to="/register/retailer" className="hp-ref-wholesale__btn hp-ref-wholesale__btn--solid">
                <i className="fa-solid fa-store" aria-hidden="true" />
                Apply for Wholesale
                <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </Link>
              <Link to="/products" className="hp-ref-wholesale__btn hp-ref-wholesale__btn--outline">
                <i className="fa-solid fa-book-open" aria-hidden="true" />
                Browse Catalog
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
