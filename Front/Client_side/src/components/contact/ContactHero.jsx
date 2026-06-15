import React from "react";
import { motion } from "framer-motion";
import { fadeDown, sectionEntrance } from "../../animations/motionPresets";

export function ContactHero({ reduce }) {
  return (
    <motion.section
      className="contact-hero"
      initial={reduce ? false : "hidden"}
      animate="show"
      variants={reduce ? undefined : sectionEntrance}
    >
      <motion.h1
        className="contact-hero-title"
        variants={reduce ? undefined : fadeDown}
        initial={reduce ? false : "hidden"}
        animate="show"
      >
        Get in Touch
      </motion.h1>
    </motion.section>
  );
}

