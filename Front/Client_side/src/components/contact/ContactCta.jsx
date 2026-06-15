import React from "react";
import { motion } from "framer-motion";
import { fadeRight } from "../../animations/motionPresets";
import { useScrollReveal } from "../../hooks/useScrollReveal";

export function ContactCta({ reduce }) {
  const [ref, isInView] = useScrollReveal();
  const show = reduce || isInView;
  return (
    <motion.div
      ref={ref}
      className="contact-cta-wrap"
      initial={reduce ? false : "hidden"}
      animate={show ? "show" : "hidden"}
      variants={reduce ? undefined : fadeRight}
    >
      <div className="contact-cta-card">
        <span className="contact-cta-text">Ready to Connect?</span>
        <button type="button" className="contact-cta-btn">
          Schedule a Call
        </button>
      </div>
    </motion.div>
  );
}

