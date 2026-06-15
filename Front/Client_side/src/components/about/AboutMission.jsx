import React from "react";
import { motion } from "framer-motion";
import { fadeUp, fadeLeft, fadeRight, sectionEntrance, staggerContainer } from "../../animations/motionPresets";
import { useScrollReveal } from "../../hooks/useScrollReveal";

export function AboutMission({ reduce }) {
  const [ref, isInView] = useScrollReveal({ triggerOnce: true });
  const show = reduce || isInView;

  return (
    <motion.section
      ref={ref}
      className="about-mvv-section"
      initial={reduce ? false : "hidden"}
      animate={show ? "show" : "hidden"}
      variants={reduce ? undefined : sectionEntrance}
      aria-labelledby="about-mvv-heading"
    >
      <div className="about-mvv-wrap">
        <h2 id="about-mvv-heading" className="about-mvv-sr-only">
          Mission, vision, and trust
        </h2>
        <motion.div
          className="about-mvv-card"
          variants={reduce ? undefined : staggerContainer(0.1, 0.06)}
        >
          <motion.div className="about-mvv-col" variants={reduce ? undefined : fadeLeft}>
            <div className="about-mvv-col-head">
              <i className="fa-solid fa-leaf about-mvv-col-icon" aria-hidden="true" />
              <h3 className="about-mvv-title">Our Mission</h3>
            </div>
            <p className="about-mvv-text">
              To connect cultures through food by sourcing premium products from trusted producers around the world and
              delivering them with professionalism, care, and consistency to our partners every day.
            </p>
          </motion.div>

          <motion.div className="about-mvv-col about-mvv-col--center" variants={reduce ? undefined : fadeUp}>
            <div className="about-mvv-col-head">
              <i className="fa-solid fa-users about-mvv-col-icon" aria-hidden="true" />
              <h3 className="about-mvv-title">Our Vision</h3>
            </div>
            <p className="about-mvv-text">
              To become the trusted name food businesses turn to for authentic Middle Eastern and international products
              across North America — known for quality, consistency, and genuine partnership.
            </p>
          </motion.div>

          <motion.div className="about-mvv-col" variants={reduce ? undefined : fadeRight}>
            <div className="about-mvv-col-head">
              <i className="fa-solid fa-store about-mvv-col-icon" aria-hidden="true" />
              <h3 className="about-mvv-title">Why Retailers Trust Us</h3>
            </div>
            <div className="about-mvv-tags">
              <span className="about-mvv-tag">Quality</span>
              <span className="about-mvv-tag">Integrity</span>
              <span className="about-mvv-tag">Reliability</span>
              <span className="about-mvv-tag">Dedicated Support</span>
              <span className="about-mvv-tag">Freshness</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
