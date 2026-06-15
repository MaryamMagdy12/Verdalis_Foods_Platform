import React from "react";
import { motion } from "framer-motion";
import { fadeLeft, fadeRight, sectionEntrance } from "../../animations/motionPresets";

const steps = [
  { icon: "fa-solid fa-seedling", label: "Sourced Responsibly" },
  { icon: "fa-solid fa-magnifying-glass", label: "Inspected Carefully" },
  { icon: "fa-solid fa-box", label: "Packed Hygienically" },
  { icon: "fa-solid fa-truck", label: "Delivered Reliably" },
];

export function ProductsQualitySection({ reduce }) {
  return (
    <motion.section
      className="pp-quality"
      initial={reduce ? false : "hidden"}
      whileInView={reduce ? undefined : "show"}
      viewport={{ once: true, margin: "-60px" }}
      variants={reduce ? undefined : sectionEntrance}
    >
      <div className="pp-container pp-quality__inner">
        <motion.div className="pp-quality__copy" variants={reduce ? undefined : fadeLeft}>
          <h2 className="pp-quality__title">
            Curated quality.
            <br />
            Crafted for excellence.
          </h2>
          <p className="pp-quality__text">
            From responsible sourcing to careful inspection and reliable delivery — every step is
            designed to protect quality and build lasting trust with our partners.
          </p>
        </motion.div>
        <motion.div className="pp-quality__steps" variants={reduce ? undefined : fadeRight}>
          {steps.map((step, i) => (
            <React.Fragment key={step.label}>
              {i > 0 && <span className="pp-quality__connector" aria-hidden="true" />}
              <motion.div className="pp-quality__step">
                <span className="pp-quality__step-icon">
                  <i className={step.icon} aria-hidden="true" />
                </span>
                <span className="pp-quality__step-label">{step.label}</span>
              </motion.div>
            </React.Fragment>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
