import React from "react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer, sectionEntrance } from "../../animations/motionPresets";
import { useScrollReveal } from "../../hooks/useScrollReveal";

const values = [
  {
    icon: "fa-solid fa-award",
    title: "Quality",
    desc: "Premium sourcing and consistent standards across every shipment.",
  },
  {
    icon: "fa-solid fa-scale-balanced",
    title: "Integrity",
    desc: "Transparent relationships built on honesty and long-term trust.",
  },
  {
    icon: "fa-solid fa-truck-fast",
    title: "Reliability",
    desc: "Predictable logistics and dependable supply for busy operations.",
  },
  {
    icon: "fa-solid fa-headset",
    title: "Dedicated Support",
    desc: "Responsive partners who understand your business and timelines.",
  },
  {
    icon: "fa-solid fa-carrot",
    title: "Freshness",
    desc: "Careful handling and respect for product integrity from dock to shelf.",
  },
];

export function AboutValues({ reduce }) {
  const [ref, isInView] = useScrollReveal({ triggerOnce: true });
  const show = reduce || isInView;

  return (
    <motion.section
      ref={ref}
      className="about-values-section"
      initial={reduce ? false : "hidden"}
      animate={show ? "show" : "hidden"}
      variants={reduce ? undefined : sectionEntrance}
      aria-labelledby="about-values-heading"
    >
      <div className="about-values-blobs" aria-hidden="true">
        <span className="about-values-blob about-values-blob--1" />
        <span className="about-values-blob about-values-blob--2" />
      </div>
      <div className="about-values-inner">
        <motion.h2 id="about-values-heading" className="about-values-heading" variants={reduce ? undefined : fadeUp}>
          The Values That <span className="about-values-heading-accent">Drive Everything</span> We Do
        </motion.h2>
        <motion.div
          className="about-values-grid"
          variants={reduce ? undefined : staggerContainer(0.08, 0.05)}
        >
          {values.map((v) => (
            <motion.div key={v.title} className="about-values-card" variants={reduce ? undefined : fadeUp}>
              <div className="about-values-icon-wrap">
                <i className={v.icon} aria-hidden="true" />
              </div>
              <h3 className="about-values-title">{v.title}</h3>
              <p className="about-values-desc">{v.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
