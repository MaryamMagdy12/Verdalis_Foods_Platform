import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { apiGet } from "../../api/client";
import { fadeUp, staggerContainer } from "../../animations/motionPresets";
import grainsImg from "../../assets/images/home-category-grains.png";
import olivesImg from "../../assets/images/home-category-olives.png";
import spicesImg from "../../assets/images/home-category-spices.png";

const FALLBACK_BY_INDEX = [olivesImg, grainsImg, spicesImg];

const STATIC_CATEGORIES = [
  { category_id: "dairy", title: "Dairy Products" },
  { category_id: "grains", title: "Grain & Legume Products" },
  { category_id: "rice", title: "Rice" },
];

function categoryLinkParam(cat) {
  if (cat.slug) return cat.slug;
  if (cat.category_id != null) return String(cat.category_id);
  if (cat.id != null) return String(cat.id);
  return null;
}

function displayTitle(title) {
  if (!title) return "PRODUCTS";
  const upper = title.toUpperCase();
  if (upper.includes("DAIRY")) return "DAIRY PRODUCTS";
  if (upper.includes("GRAIN") || upper.includes("LEGUME")) return "GRAIN & LEGUME PRODUCTS";
  if (upper.includes("RICE")) return "RICE";
  return upper;
}

export function HomeFeaturedCategories({ reduce }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("products/home-catalog", { limit: 6 })
      .then((res) => setItems((res.data || []).slice(0, 3)))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const displayItems =
    items.length > 0
      ? items
      : STATIC_CATEGORIES.map((c, i) => ({ ...c, image: null, id: c.category_id }));

  return (
    <section className="hp-mock-fc" aria-labelledby="hp-mock-fc-title">
      <header className="hp-mock-fc__header">
        <p className="hp-mock-fc__kicker">Shop by category</p>
        <h2 id="hp-mock-fc-title" className="hp-mock-fc__title">
          Featured Categories
        </h2>
        <p className="hp-mock-fc__lede">
          Premium wholesale staples — rice, oils, grains, dairy, and more.
        </p>
      </header>

      <motion.div
        className="hp-mock-fc__grid"
        initial={reduce ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={reduce ? undefined : staggerContainer(0.08, 0.12)}
      >
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="hp-mock-fc__skeleton" />
            ))
          : displayItems.map((cat, index) => {
              const imgSrc = cat.image || FALLBACK_BY_INDEX[index];
              return (
              <motion.div key={cat.category_id ?? cat.id ?? index} variants={reduce ? undefined : fadeUp}>
                <Link
                  to={
                    categoryLinkParam(cat)
                      ? `/products?category=${encodeURIComponent(categoryLinkParam(cat))}`
                      : "/products"
                  }
                  className="hp-mock-cat-card"
                >
                  <div className="hp-mock-cat-card__visual">
                    {imgSrc ? (
                      <img src={imgSrc} alt="" loading="lazy" />
                    ) : (
                      <div className="hp-mock-cat-card__placeholder" aria-hidden="true" />
                    )}
                    <span className="hp-mock-cat-card__brand">
                      <i className="fa-solid fa-leaf" aria-hidden="true" />
                      Verdalis Foods
                    </span>
                    <h3 className="hp-mock-cat-card__hero-title">
                      {displayTitle(cat.title)}
                    </h3>
                    <span className="hp-mock-cat-card__go" aria-hidden="true">
                      <i className="fa-solid fa-arrow-right" />
                    </span>
                  </div>
                  <span className="hp-mock-cat-card__label">{cat.title}</span>
                </Link>
              </motion.div>
            );
            })}
      </motion.div>

      <div className="hp-mock-fc__cta-wrap">
        <Link to="/products" className="hp-mock-fc__cta">
          View all products
          <i className="fa-solid fa-arrow-right" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
