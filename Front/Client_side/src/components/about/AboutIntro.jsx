import React from "react";
import { motion } from "framer-motion";
import { fadeUp, fadeDown, fadeLeft, fadeRight, fadeIn, sectionEntrance, staggerContainer } from "../../animations/motionPresets";
import { useScrollReveal } from "../../hooks/useScrollReveal";

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

export function AboutIntro({ reduce }) {
  const [ref, isInView] = useScrollReveal({ triggerOnce: true });
  const show = reduce || isInView;
  return (
    <motion.section
      ref={ref}
      className="about-content-section about-story-section"
      initial={reduce ? false : "hidden"}
      animate={show ? "show" : "hidden"}
      variants={reduce ? undefined : sectionEntrance}
    >
      <div className="about-content-inner about-story-inner">
        <motion.p className="about-story-eyebrow" variants={reduce ? undefined : fadeDown}>
          ABOUT US
        </motion.p>
        <motion.h2 className="about-story-headline" variants={reduce ? undefined : fadeDown}>
          Our <span className="about-story-headline-accent">Story.</span> Our{" "}
          <span className="about-story-headline-accent">Promise.</span>
        </motion.h2>
        <motion.div
          className="about-content-two-col about-story-grid"
          variants={reduce ? undefined : staggerContainer(0.15, 0.08)}
        >
          <motion.div
            className="about-content-col about-content-col-left"
            variants={reduce ? undefined : cardVariants}
            whileHover={reduce ? undefined : { y: -4, transition: { duration: 0.25 } }}
          >
            <motion.p className="about-content-text" variants={reduce ? undefined : fadeLeft}>
              At Verdalis Foods, food is more than a product — it’s culture, memory, and connection. We started with a simple belief: the flavors people grow up with should never feel out of reach. As demand for authentic Middle Eastern, halal, and international foods grew across Canada and the United States, we saw an opportunity to bridge worlds — connecting trusted producers abroad with food businesses here at home.
            </motion.p>
            <motion.p className="about-content-text about-content-support-heading" variants={reduce ? undefined : fadeLeft}>
              We proudly support:
            </motion.p>
            <ul className="about-content-list">
              <motion.li variants={reduce ? undefined : fadeUp}>Wholesalers and distributors</motion.li>
              <motion.li variants={reduce ? undefined : fadeUp}>Retailers and supermarkets</motion.li>
              <motion.li variants={reduce ? undefined : fadeUp}>Restaurants and food service providers</motion.li>
            </ul>
          </motion.div>
          <motion.div className="about-content-leaf about-story-timeline" aria-hidden="true" variants={reduce ? undefined : fadeIn}>
            <span className="about-story-timeline-line about-story-timeline-line--top" />
            <i className="fa-solid fa-leaf about-story-timeline-icon" />
            <span className="about-story-timeline-line" />
            <i className="fa-solid fa-handshake about-story-timeline-icon" />
            <span className="about-story-timeline-line" />
            <i className="fa-solid fa-seedling about-story-timeline-icon" />
            <span className="about-story-timeline-line about-story-timeline-line--bottom" />
          </motion.div>
          <motion.div
            className="about-content-col about-content-col-right"
            variants={reduce ? undefined : cardVariants}
            whileHover={reduce ? undefined : { y: -4, transition: { duration: 0.25 } }}
          >
            <motion.p className="about-content-text" variants={reduce ? undefined : fadeRight}>
              That’s how Verdalis Foods was built: not just as a distributor, but as a partner. Through direct relationships with carefully selected global producers, we source products that stay true to their origins — ingredients made with the same traditions, standards, and care that families have trusted for generations. Every item we import carries a story, and we work hard to deliver it exactly as it was meant to be experienced.
            </motion.p>
            <motion.p className="about-content-text" variants={reduce ? undefined : fadeRight}>
              We understand the day-to-day realities of running a food business — tight timelines, consistent supply, dependable pricing. That’s why reliability isn’t just a promise for us; it’s our responsibility. When our partners succeed, we succeed.
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}

