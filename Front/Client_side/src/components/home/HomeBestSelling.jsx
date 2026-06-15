import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeDown, staggerContainer, sectionEntrance } from "../../animations/motionPresets";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { apiGet } from "../../api/client";
import { useCart } from "../../context/CartContext";
import { ProductCard } from "../products/ProductCard";
import { ProductModal } from "../products/ProductModal";
import "../../assets/css/ProductsPage.css";

let bestsellingBg = "";
try {
  bestsellingBg = new URL("../../assets/images/home-bestselling-bg.png", import.meta.url).href;
} catch (_) {}

export function HomeBestSelling({ reduce }) {
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [viewMoreProduct, setViewMoreProduct] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiGet("products/highlighted", { limit: 4 });
        let list = res.data || [];
        if (list.length === 0) {
          const fallback = await apiGet("products/random", { limit: 4 });
          list = fallback.data || [];
        }
        if (!cancelled) setProducts(list);
      } catch (_) {
        if (!cancelled) setProducts([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (viewMoreProduct) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [viewMoreProduct]);

  const [ref, isInView] = useScrollReveal();
  const show = reduce || isInView;
  const sectionStyle = bestsellingBg ? { "--home-bestselling-bg": `url("${bestsellingBg}")` } : undefined;

  return (
    <motion.section
      ref={ref}
      className="home-products-section"
      id="products"
      style={sectionStyle}
      initial={reduce ? false : "hidden"}
      animate={show ? "show" : "hidden"}
      variants={reduce ? undefined : sectionEntrance}
    >
      <div className="home-products-inner">
        <header className="home-products-header">
          <div className="home-products-icon" aria-hidden="true">
            <i className="fa-solid fa-bag-shopping" />
            <i className="fa-solid fa-leaf home-products-icon-leaf" />
          </div>
          <motion.h2 className="home-products-heading" variants={reduce ? undefined : fadeDown}>
            <i className="fa-solid fa-leaf home-products-heading-leaf" aria-hidden="true" />
            <span className="home-products-heading-text">Best Selling Products</span>
            <i className="fa-solid fa-leaf home-products-heading-leaf" aria-hidden="true" />
          </motion.h2>
          <div className="home-products-heading-rule" aria-hidden="true">
            <span className="home-products-heading-line" />
            <i className="fa-solid fa-leaf home-products-rule-leaf" />
            <span className="home-products-heading-line" />
          </div>
          <motion.p className="home-products-sub" variants={reduce ? undefined : fadeDown}>
            Premium quality products, trusted by thousands.
          </motion.p>
        </header>
        <motion.div
          className="home-products-grid"
          variants={reduce ? undefined : staggerContainer(0.12, 0.05)}
        >
          {products.map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              variant="home"
              rowDir={i % 2 === 0 ? "left" : "right"}
              animationDelay={0.03 + i * 0.06}
              reduce={reduce}
              showTopRated={i === 0}
              onViewMore={setViewMoreProduct}
              onAddToCart={addItem}
            />
          ))}
        </motion.div>
        <motion.div variants={reduce ? undefined : fadeDown}>
          <Link to="/products" className="home-products-cta">
            Explore More
            <i className="fa-solid fa-arrow-right home-products-cta-arrow" aria-hidden="true" />
          </Link>
        </motion.div>
      </div>

      {viewMoreProduct && (
        <ProductModal
          product={viewMoreProduct}
          allProducts={products}
          onClose={() => setViewMoreProduct(null)}
          onAddToCart={(p) => {
            addItem(p ?? viewMoreProduct);
            setViewMoreProduct(null);
          }}
        />
      )}
    </motion.section>
  );
}
