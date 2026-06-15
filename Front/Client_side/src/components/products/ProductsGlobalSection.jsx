import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeUp, sectionEntrance } from "../../animations/motionPresets";
import driverImg from "../../assets/images/products-quote-driver.png";

const stats = [
  { value: "15+", label: "Supply Regions" },
  { value: "120+", label: "Products" },
  { value: "25+", label: "Distribution Partners" },
  { value: "99%", label: "On-time Delivery" },
];

export function ProductsGlobalSection({ reduce, productCount = 0 }) {
  const displayCount = productCount > 0 ? `${productCount}+` : "120+";

  return (
    <motion.section
      className="pp-global"
      initial={reduce ? false : "hidden"}
      whileInView={reduce ? undefined : "show"}
      viewport={{ once: true, margin: "-60px" }}
      variants={reduce ? undefined : sectionEntrance}
    >
      <div className="pp-container pp-global__grid">
        <motion.article className="pp-global__map-card" variants={reduce ? undefined : fadeUp}>
          <h3 className="pp-global__map-title">Our Global Footprint</h3>
          <motion.div className="pp-global__map" aria-hidden="true">
            {/* <i className="fa-solid fa-earth-americas pp-global__map-icon" /> */}
          </motion.div>
          <div className="pp-global__stats">
            {stats.map((s, i) => (
              <div key={s.label} className="pp-global__stat">
                <strong>{i === 1 ? displayCount : s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </motion.article>

        <motion.article className="pp-global__cta-card" variants={reduce ? undefined : fadeUp}>
          <img src={driverImg} alt="" className="pp-global__cta-img" loading="lazy" />
          <div className="pp-global__cta-overlay">
            <h3>Looking for something specific?</h3>
            <p>We&apos;re here to help your business grow.</p>
            <Link to="/contact" className="pp-btn pp-btn--lime">
              Request a Quote
              <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </Link>
          </div>
        </motion.article>
      </div>
    </motion.section>
  );
}
