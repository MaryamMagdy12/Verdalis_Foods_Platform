import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "../../animations/motionPresets";

const trustCards = [
  { icon: "fa-solid fa-award", title: "Premium Quality", sub: "Imported standards" },
  { icon: "fa-solid fa-truck-fast", title: "Reliable Supply", sub: "Nationwide logistics" },
  { icon: "fa-solid fa-bolt", title: "Fast Distribution", sub: "Built for scale" },
  { icon: "fa-solid fa-handshake", title: "Trusted Partnerships", sub: "Long-term focus" },
];

const badges = [
  { text: "Fast delivery network", icon: "fa-solid fa-circle-check" },
  { text: "Secure QR handoff", icon: "fa-solid fa-circle-check" },
  { text: "Wholesale & retail pricing", icon: "fa-solid fa-circle-check" },
];

export function HomeHero({ reduce }) {
  return (
    <section className="hp-hero-shell">
      <motion.div
        className="hp-hero"
        initial={reduce ? false : "hidden"}
        animate="show"
        variants={reduce ? undefined : staggerContainer(0.06, 0.04)}
      >
        <motion.div className="hp-hero-copy">
          <motion.p className="hp-hero-kicker" variants={reduce ? undefined : fadeUp}>
            Verdalis Foods · Premium wholesale
          </motion.p>
          <motion.h1 className="hp-hero-title" variants={reduce ? undefined : fadeUp}>
            Wholesale Quality. <span className="hp-grad">Smart Logistics.</span>
            <br />
            Delivered With <span className="hp-grad">Confidence.</span>
          </motion.h1>
          <motion.p className="hp-hero-lede" variants={reduce ? undefined : fadeUp}>
            B2B and B2C food distribution with secure QR delivery, real-time tracking, and wholesale pricing for approved retailers.
          </motion.p>
          <motion.div className="hp-hero-actions" variants={reduce ? undefined : fadeUp}>
            <Link to="/products" className="hp-btn hp-btn--primary">
              Shop Wholesale
              <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </Link>
            <Link to="/register/retailer" className="hp-btn hp-btn--ghost">
              Retailer account
              <i className="fa-solid fa-store" aria-hidden="true" />
            </Link>
          </motion.div>
          <motion.div className="hp-hero-badges" variants={reduce ? undefined : fadeUp}>
            {badges.map((b) => (
              <span key={b.text} className="hp-hero-badge">
                <i className={b.icon} aria-hidden="true" />
                {b.text}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div className="hp-hero-trust-wrap" variants={reduce ? undefined : fadeUp}>
        <div className="hp-hero-trust-strip">
          {trustCards.map((t) => (
            <motion.div key={t.title} className="hp-hero-trust-card" variants={reduce ? undefined : fadeUp}>
              <i className={t.icon} aria-hidden="true" />
              <strong>{t.title}</strong>
              <span>{t.sub}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
