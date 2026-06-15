import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeLeft, fadeRight, sectionEntrance } from "../../animations/motionPresets";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import aboutPhoto from "../../assets/images/ChatGPT Image May 18, 2026, 06_43_27 AM.png";

const stats = [
  { icon: "fa-solid fa-seedling", value: "15+", label: "Years Experience" },
  { icon: "fa-solid fa-handshake", value: "500+", label: "Partners" },
  { icon: "fa-solid fa-box-open", value: "1000+", label: "Products" },
  { icon: "fa-solid fa-earth-americas", value: "2", label: "Countries Served" },
];

const aboutBody =
  "Verdalis Foods connects authentic producers with retailers and distributors through dependable supply, rigorous quality, and relationships built to last.";

export function HomeAboutPrime({ reduce }) {
  const [ref, isInView] = useScrollReveal();
  const show = reduce || isInView;

  return (
    <motion.section
      ref={ref}
      className="hp-about cream-section"
      id="about-verdalis"
      initial={reduce ? false : "hidden"}
      animate={show ? "show" : "hidden"}
      variants={reduce ? undefined : sectionEntrance}
    >
      <div className="section-content">
        <div className="hp-about-grid">
          <motion.div variants={reduce ? undefined : fadeLeft}>
            <p className="hp-about-kicker">
              <i className="fa-solid fa-leaf" aria-hidden="true" /> About Verdalis
            </p>
            <h2 className="hp-about-title">
              More Than Products.
              <br />
              We Build <span className="hp-grad">Partnerships.</span>
            </h2>
            <p className="hp-about-text">{aboutBody}</p>
            <div className="hp-hero-actions">
              <Link to="/about" className="hp-btn hp-btn--primary">
                Learn More
                <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </Link>
              <Link to="/contact" className="hp-btn hp-btn--ghost">
                Contact Us
                <i className="fa-solid fa-envelope" aria-hidden="true" />
              </Link>
            </div>
          </motion.div>

          <motion.div className="hp-about-visual" variants={reduce ? undefined : fadeRight}>
            {/* <span className="hp-about-badge">Quality you can trust</span> */}
            <img src={aboutPhoto} alt="Hands holding fresh olives" loading="lazy" />
          </motion.div>
        </div>

        <div className="hp-about-stats">
          {stats.map((item) => (
            <div key={item.label} className="hp-stat-card">
              <i className={item.icon} aria-hidden="true" />
              <span className="hp-stat-value">{item.value}</span>
              <span className="hp-stat-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
