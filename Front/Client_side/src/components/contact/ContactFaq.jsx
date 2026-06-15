import React from "react";
import { motion } from "framer-motion";
import { fadeUp, fadeDown, fadeLeft, fadeRight, staggerContainer } from "../../animations/motionPresets";
import { useScrollReveal } from "../../hooks/useScrollReveal";

export function ContactFaq({ reduce, faqItems, openFaq, setOpenFaq }) {
  const [ref, isInView] = useScrollReveal();
  const show = reduce || isInView;
  return (
    <motion.div
      ref={ref}
      className="contact-faq-wrap"
      initial={reduce ? false : "hidden"}
      animate={show ? "show" : "hidden"}
      variants={reduce ? undefined : staggerContainer(0.06, 0.05)}
    >
      <motion.h2 className="contact-faq-heading" variants={reduce ? undefined : fadeDown}>
        FAQ
      </motion.h2>
      <motion.p className="contact-faq-subheading" variants={reduce ? undefined : fadeLeft}>
        Common Questions
      </motion.p>
      <motion.div
        className="contact-faq-list"
        variants={reduce ? undefined : { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
      >
        {faqItems.map((item, i) => (
          <motion.div
            key={i}
            className={`contact-faq-item ${openFaq === i ? "contact-faq-item-open" : ""}`}
            onClick={() => setOpenFaq(openFaq === i ? null : i)}
            variants={reduce ? undefined : [fadeLeft, fadeRight, fadeUp, fadeDown][i % 4]}
          >
            <span className="contact-faq-question">{item.q}</span>
            <i className="fa-solid fa-chevron-down contact-faq-icon" aria-hidden="true" />
            {openFaq === i && <p className="contact-faq-answer">{item.a}</p>}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

