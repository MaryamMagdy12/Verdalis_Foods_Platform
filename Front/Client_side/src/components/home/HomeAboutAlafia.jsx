import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeLeft, fadeRight, staggerContainer, sectionEntrance } from "../../animations/motionPresets";
import { useScrollReveal } from "../../hooks/useScrollReveal";

let aboutImageAlafia = "";
try {
  aboutImageAlafia = new URL("../../assets/images/POSTSS NEWW-05.png", import.meta.url).href;
} catch (_) {}

export function HomeAboutAlafia({ reduce }) {
  const [ref, isInView] = useScrollReveal();
  const show = reduce || isInView;
  return (
    <motion.section
      ref={ref}
      className="home-about-alafia-section"
      id="about-alafia"
      initial={reduce ? false : "hidden"}
      animate={show ? "show" : "hidden"}
      variants={reduce ? undefined : sectionEntrance}
    >
      <motion.div
        className="home-about-alafia-inner"
        initial={reduce ? false : "hidden"}
        animate={show ? "show" : "hidden"}
        variants={reduce ? undefined : staggerContainer(0.12, 0.05)}
      >
        {aboutImageAlafia && (
          <motion.div className="home-about-alafia-image-wrap" variants={reduce ? undefined : fadeLeft}>
            <img src={aboutImageAlafia} alt="About Alafia" className="home-about-alafia-image" loading="lazy" />
          </motion.div>
        )}
        <motion.div className="home-about-alafia-content" variants={reduce ? undefined : fadeRight}>
          <h2 className="home-about-alafia-heading">OUR BRAND ALAFIA</h2>
          <p className="home-about-alafia-text">
          Al Afia is the heart of our product line — a brand created 
          to celebrate the rich flavors, traditions, and culinary 
          heritage of the Middle East. Carefully sourced and produced
           with the highest standards of quality, every Al Afia product reflects authenticity, consistency, and care. It’s our promise to deliver the tastes people know and love, crafted with integrity and trusted by food businesses across North America.
          </p>
          <Link to="/products" className="home-about-alafia-cta">
            Explore More
          </Link>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
