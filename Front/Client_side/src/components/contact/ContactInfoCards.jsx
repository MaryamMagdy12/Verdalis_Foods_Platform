import React from "react";
import { motion } from "framer-motion";
import { fadeUp, fadeDown, fadeLeft, fadeRight, staggerContainer } from "../../animations/motionPresets";
import { useScrollReveal } from "../../hooks/useScrollReveal";

export function ContactInfoCards({ reduce }) {
  const [ref, isInView] = useScrollReveal();
  const show = reduce || isInView;
  return (
    <motion.div
      ref={ref}
      className="contact-info-cards"
      initial={reduce ? false : "hidden"}
      animate={show ? "show" : "hidden"}
      variants={reduce ? undefined : staggerContainer(0.08, 0.05)}
    >
      <motion.div className="contact-info-card" variants={reduce ? undefined : fadeLeft}>
        <i className="fa-solid fa-phone" aria-hidden="true" />
        <span className="contact-info-label">Phone:</span>
        <span>123-456-7890</span>
      </motion.div>
      <motion.div className="contact-info-card" variants={reduce ? undefined : fadeUp}>
        <i className="fa-solid fa-envelope" aria-hidden="true" />
        <span className="contact-info-label">Email:</span>
        <span>info@company.com</span>
      </motion.div>
      <motion.div className="contact-info-card" variants={reduce ? undefined : fadeRight}>
        <i className="fa-solid fa-building" aria-hidden="true" />
        <span className="contact-info-label">Address:</span>
        <span>123 Farm Lane, AgriVille</span>
      </motion.div>
    </motion.div>
  );
}

