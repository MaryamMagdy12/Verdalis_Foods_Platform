import React from "react";
import { motion } from "framer-motion";
import { fadeUp, fadeDown, sectionEntrance } from "../../animations/motionPresets";
import heroBg from "../../assets/images/products-hero-bg.png";
import heroProducts from "../../assets/images/products-hero-products.png";

const features = [
  { icon: "fa-solid fa-earth-americas", label: "Global Sourcing" },
  { icon: "fa-solid fa-award", label: "Premium Quality" },
  { icon: "fa-solid fa-truck-fast", label: "Reliable Supply" },
  { icon: "fa-solid fa-leaf", label: "Sustainable Choice" },
];

export function ProductsHero({ reduce }) {
  return (
    <motion.section
      className="pp-hero"
      style={{ "--pp-hero-bg": `url(${heroBg})` }}
      initial={reduce ? false : "hidden"}
      animate="show"
      variants={reduce ? undefined : sectionEntrance}
    >
      <motion.div className="pp-hero__inner">
        <motion.div className="pp-hero__copy" variants={reduce ? undefined : fadeDown}>
          <p className="pp-hero__kicker">Our products</p>
          <h1 className="pp-hero__title">
            Quality you can trust.
            <br />
            <span className="pp-hero__title-accent">Goodness you can taste.</span>
          </h1>
          <p className="pp-hero__lede">
            Discover premium food products sourced from trusted producers worldwide — curated for
            quality, consistency, and long-term partnerships.
          </p>
          <div className="pp-hero__actions">
            <a href="#pp-catalog" className="pp-btn pp-btn--lime">
              Explore Products
              <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </a>
            <a href="#pp-categories" className="pp-btn pp-btn--outline">
              <i className="fa-solid fa-grid-2" aria-hidden="true" />
              View Categories
            </a>
          </div>
        </motion.div>

        {/* <motion.div className="pp-hero__visual" variants={reduce ? undefined : fadeUp} aria-hidden="true">
          <img src={heroProducts} alt="" className="pp-hero__products-img" loading="eager" />
        </motion.div> */}
      </motion.div>

      <motion.div className="pp-hero__features" variants={reduce ? undefined : fadeUp}>
        {features.map((f) => (
          <motion.div key={f.label} className="pp-hero__feature">
            <i className={f.icon} aria-hidden="true" />
            <span>{f.label}</span>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
