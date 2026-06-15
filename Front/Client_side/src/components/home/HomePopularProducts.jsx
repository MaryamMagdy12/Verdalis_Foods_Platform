import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, staggerContainer } from "../../animations/motionPresets";
import { cachedApiGet } from "../../utils/catalogCache";
import popularVisual from "../../assets/images/ChatGPT Image May 31, 2026, 11_42_31 PM.png";

const FEATURES = [
  { icon: "fa-shield-halved", label: "Premium Quality" },
  { icon: "fa-seedling", label: "Sourced Responsibly" },
  { icon: "fa-tags", label: "Bulk Savings" },
  { icon: "fa-bag-shopping", label: "Trusted by Businesses" },
];

const AUTO_SCROLL_MS = 4000;

export function HomePopularProducts({ reduce }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await cachedApiGet("products/highlighted", { limit: 8 });
        let list = res.data || [];
        if (list.length === 0) {
          const fallback = await cachedApiGet("products/random", { limit: 8 });
          list = fallback.data || [];
        }
        if (!cancelled) setProducts(list);
      } catch (_) {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const goTo = useCallback((index) => {
    if (!products.length) return;
    setActiveIndex(((index % products.length) + products.length) % products.length);
  }, [products.length]);

  useEffect(() => {
    if (reduce || paused || products.length <= 1) return undefined;
    const timer = setInterval(() => {
      setActiveIndex((i) => (i + 1) % products.length);
    }, AUTO_SCROLL_MS);
    return () => clearInterval(timer);
  }, [products.length, paused, reduce]);

  const activeProduct = products[activeIndex];

  return (
    <section className="hp-mock-pp" aria-labelledby="hp-mock-pp-title">
      <div className="hp-mock-pp__wave" aria-hidden="true" />

      <motion.div
        className="hp-mock-pp__inner"
        initial={reduce ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={reduce ? undefined : staggerContainer(0.1, 0.14)}
      >
        <motion.div className="hp-mock-pp__content" variants={reduce ? undefined : fadeUp}>
          <p className="hp-mock-pp__kicker">Best sellers</p>
          <h2 id="hp-mock-pp-title" className="hp-mock-pp__title">
            Popular Products
          </h2>
          <p className="hp-mock-pp__lede">
            Trusted staples for restaurants, retailers, and households.
          </p>

          <ul className="hp-mock-pp__features">
            {FEATURES.map((f) => (
              <li key={f.label}>
                <span className="hp-mock-pp__feat-icon" aria-hidden="true">
                  <i className={`fa-solid ${f.icon}`} />
                </span>
                {f.label}
              </li>
            ))}
          </ul>

          <div className="hp-mock-pp__actions">
            <Link to="/products" className="hp-mock-pp__btn">
              Explore all
            </Link>
            <Link to="/products" className="hp-mock-pp__btn-arrow" aria-label="Explore all products">
              <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </Link>
          </div>
        </motion.div>

        <motion.div className="hp-mock-pp__visual" variants={reduce ? undefined : fadeUp}>
          {loading ? (
            <div className="hp-mock-pp__skeleton" aria-hidden="true" />
          ) : products.length > 0 ? (
            <div
              className="hp-mock-pp__carousel"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onFocus={() => setPaused(true)}
              onBlur={() => setPaused(false)}
            >
              <div className="hp-mock-pp__carousel-viewport" aria-live="polite">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={activeProduct.id}
                    className="hp-mock-pp__carousel-slide"
                    initial={reduce ? false : { opacity: 0, x: 28 }}
                    animate={reduce ? undefined : { opacity: 1, x: 0 }}
                    exit={reduce ? undefined : { opacity: 0, x: -28 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link to={`/products/${activeProduct.id}`} className="hp-mock-pp__product-card">
                      {activeProduct.image ? (
                        <img src={activeProduct.image} alt={activeProduct.name} loading="lazy" decoding="async" />
                      ) : (
                        <div className="hp-mock-pp__product-placeholder" aria-hidden="true" />
                      )}
                      <div className="hp-mock-pp__product-info">
                        <span className="hp-mock-pp__product-name">{activeProduct.name}</span>
                        <span className="hp-mock-pp__product-price">${Number(activeProduct.price).toFixed(2)}</span>
                      </div>
                    </Link>
                  </motion.div>
                </AnimatePresence>
              </div>

              {products.length > 1 && (
                <div className="hp-mock-pp__carousel-controls">
                  <button
                    type="button"
                    className="hp-mock-pp__carousel-arrow"
                    onClick={() => goTo(activeIndex - 1)}
                    aria-label="Previous product"
                  >
                    <i className="fa-solid fa-chevron-left" aria-hidden="true" />
                  </button>

                  <div className="hp-mock-pp__carousel-dots" role="tablist" aria-label="Popular products">
                    {products.map((p, i) => (
                      <button
                        key={p.id}
                        type="button"
                        role="tab"
                        aria-selected={i === activeIndex}
                        aria-label={`Show ${p.name}`}
                        className={i === activeIndex ? "is-active" : ""}
                        onClick={() => goTo(i)}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    className="hp-mock-pp__carousel-arrow"
                    onClick={() => goTo(activeIndex + 1)}
                    aria-label="Next product"
                  >
                    <i className="fa-solid fa-chevron-right" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <img src={popularVisual} alt="" loading="lazy" decoding="async" />
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}
