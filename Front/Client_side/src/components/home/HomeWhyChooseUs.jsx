import React from "react";
import { motion } from "framer-motion";
import { fadeDown, fadeUp, staggerContainer, sectionEntrance } from "../../animations/motionPresets";
import { useScrollReveal } from "../../hooks/useScrollReveal";

const features = [
  {
    icon: "fa-solid fa-shield-halved",
    title: "Consistent Quality",
    desc: "Every product meets international standards and strict quality checks.",
  },
  {
    icon: "fa-solid fa-circle-nodes",
    title: "Reliable Supply Chain",
    desc: "Strong global network ensures uninterrupted supply and availability.",
  },
  {
    icon: "fa-solid fa-handshake",
    title: "Long-Term Partnerships",
    desc: "We grow together with our partners through trust and transparency.",
  },
  {
    icon: "fa-solid fa-truck",
    title: "Fast Distribution",
    desc: "Efficient logistics and timely delivery across countries.",
  },
];

function WhyCard({ item, reduce }) {
  return (
    <motion.article className="hp-why-card" variants={reduce ? undefined : fadeUp} whileHover={reduce ? undefined : { y: -4 }}>
      <motion.div className="hp-why-card-icon" variants={reduce ? undefined : fadeUp}>
        <i className={item.icon} aria-hidden="true" />
      </motion.div>
      <h3>{item.title}</h3>
      <p>{item.desc}</p>
    </motion.article>
  );
}

export function HomeWhyChooseUs({ reduce }) {
  const [ref, isInView] = useScrollReveal({ triggerOnce: true });
  const show = reduce || isInView;

  return (
    <motion.section
      ref={ref}
      className="hp-why green-section"
      id="why-us"
      initial={reduce ? false : "hidden"}
      animate={show ? "show" : "hidden"}
      variants={reduce ? undefined : sectionEntrance}
    >
      <motion.div className="section-content">
        <div className="hp-why-head">
          <motion.p className="hp-why-kicker" variants={reduce ? undefined : fadeDown}>
            <i className="fa-solid fa-leaf" aria-hidden="true" /> Why businesses choose Verdalis
          </motion.p>
          <motion.h2 className="hp-why-title" variants={reduce ? undefined : fadeDown}>
            Built on <span className="hp-why-accent">Trust</span>. Driven by{" "}
            <span className="hp-why-accent">Quality</span>.
          </motion.h2>
        </div>

        <motion.div className="hp-why-grid" variants={reduce ? undefined : staggerContainer(0.08, 0.06)}>
          {features.map((item) => (
            <WhyCard key={item.title} item={item} reduce={reduce} />
          ))}
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
