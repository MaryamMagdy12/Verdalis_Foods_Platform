import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "../../animations/motionPresets";
import logisticsArt from "../../assets/images/ChatGPT Image May 19, 2026, 07_45_23 AM.png";
import "../../assets/css/home-sections.css";

const features = [
  { icon: "fa-qrcode", title: "Secure QR Handoff", desc: "Encrypted pickup tokens — not just order numbers." },
  { icon: "fa-location-crosshairs", title: "GPS Validation", desc: "Pickup and delivery verified by location." },
  { icon: "fa-shield-halved", title: "OTP Confirmation", desc: "Clients confirm delivery with a one-time code." },
  { icon: "fa-clock", title: "Live Tracking", desc: "Real-time status from warehouse to doorstep." },
];

export function HomeLogistics({ reduce }) {
  return (
    <section className="hp-ref-logistics" aria-labelledby="logistics-title">
      <div className="vf-container">
        <div className="hp-ref-logistics__grid">
          <motion.div
            className="hp-ref-logistics__copy"
            initial={reduce ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            variants={reduce ? undefined : staggerContainer(0.06, 0.1)}
          >
            <p className="hp-ref-logistics__kicker">Logistics &amp; delivery —</p>
            <motion.h2 id="logistics-title" className="hp-ref-logistics__title" variants={reduce ? undefined : fadeUp}>
              Enterprise-grade delivery operations
            </motion.h2>
            <motion.p className="hp-ref-logistics__text" variants={reduce ? undefined : fadeUp}>
              Verdalis Foods runs a secure shipper workflow — QR scanning, GPS proof, and anti-fraud checks at every
              step.
            </motion.p>
            <motion.div variants={reduce ? undefined : fadeUp}>
              <Link to="/track-order" className="hp-ref-logistics__btn">
                <i className="fa-solid fa-truck-fast" aria-hidden="true" />
                Track an Order
                <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </Link>
            </motion.div>
            <motion.div className="hp-ref-logistics__art" variants={reduce ? undefined : fadeUp} aria-hidden="true">
              <div className="hp-ref-logistics__globe" />
              <img src={logisticsArt} alt="" loading="lazy" />
            </motion.div>
          </motion.div>

          <motion.div
            className="hp-ref-logistics__cards"
            initial={reduce ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            variants={reduce ? undefined : staggerContainer(0.05, 0.1)}
          >
            {features.map((f) => (
              <motion.article key={f.title} className="hp-ref-logistics__card" variants={reduce ? undefined : fadeUp}>
                <span className="hp-ref-logistics__card-icon">
                  <i className={`fa-solid ${f.icon}`} aria-hidden="true" />
                </span>
                <h3>{f.title}</h3>
                <span className="hp-ref-logistics__card-rule" aria-hidden="true" />
                <p>{f.desc}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
