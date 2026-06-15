import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeDown, fadeUp, staggerContainer } from "../../animations/motionPresets";

let aboutHeroImgUrl = "";
try {
  aboutHeroImgUrl = new URL("../../assets/images/ChatGPT Image May 12, 2026, 01_48_17 AM.png", import.meta.url).href;
} catch (_) {}

const waveFeatures = [
  { icon: "fa-solid fa-award", title: "Quality", desc: "Premium products you can trust." },
  { icon: "fa-solid fa-leaf", title: "Integrity", desc: "True flavors from the source." },
  { icon: "fa-solid fa-truck", title: "Reliability", desc: "On-time delivery, every time." },
  { icon: "fa-solid fa-handshake", title: "Dedicated Support", desc: "We're here for you." },
];

export function AboutHero({ reduce }) {
  return (
    <section className="about-hero about-hero-premium" aria-labelledby="about-hero-heading">
      <div className="about-hero-premium__split">
        <div className="about-hero-premium__copy">
          <div className="about-hero-premium__copy-blobs" aria-hidden="true">
            <span className="about-hero-premium__copy-blob about-hero-premium__copy-blob--a" />
            <span className="about-hero-premium__copy-blob about-hero-premium__copy-blob--b" />
            <span className="about-hero-premium__copy-blob about-hero-premium__copy-blob--c" />
          </div>
          <div className="about-hero-premium__copy-leaves" aria-hidden="true">
            <i className="fa-solid fa-leaf about-hero-premium__copy-leaf about-hero-premium__copy-leaf--1" />
            <i className="fa-solid fa-leaf about-hero-premium__copy-leaf about-hero-premium__copy-leaf--2" />
            <i className="fa-solid fa-leaf about-hero-premium__copy-leaf about-hero-premium__copy-leaf--3" />
          </div>

          <motion.div
            className="about-hero-premium__copy-inner"
            initial={reduce ? false : "hidden"}
            animate="show"
            variants={reduce ? undefined : staggerContainer(0.08, 0.06)}
          >
            <motion.p className="about-hero-premium__kicker" variants={reduce ? undefined : fadeDown}>
              <i className="fa-solid fa-seedling" aria-hidden="true" /> ROOTED IN QUALITY
            </motion.p>
            <motion.h1 id="about-hero-heading" className="about-hero-premium__title" variants={reduce ? undefined : fadeUp}>
              Good Food.
              <br />
              Strong Connections.
              <br />
              <span className="about-hero-premium__title-accent">Better Together.</span>
            </motion.h1>
            <motion.div className="about-hero-premium__lead-block" variants={reduce ? undefined : fadeUp}>
              <i className="fa-solid fa-leaf about-hero-premium__lead-icon" aria-hidden="true" />
              <p className="about-hero-premium__lead">
                We connect trusted producers with food businesses worldwide.
              </p>
            </motion.div>
            <motion.div variants={reduce ? undefined : fadeUp}>
              <Link to="/products" className="about-hero-premium__cta">
                <span>Explore Our Products</span>
                <span className="about-hero-premium__cta-icon" aria-hidden="true">
                  <i className="fa-solid fa-leaf" />
                </span>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <div className="about-hero-premium__visual">
          {aboutHeroImgUrl ? (
            <img src={aboutHeroImgUrl} alt="" className="about-hero-premium__visual-img" loading="eager" />
          ) : (
            <div className="about-hero-premium__visual-fallback" aria-hidden="true" />
          )}
          <div className="about-hero-premium__visual-grade" aria-hidden="true" />
        </div>
      </div>

      <div className="about-hero-premium__wave-zone">
        <svg
          className="about-hero-premium__wave-svg"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            fill="var(--vd-deep, #1E4D2B)"
            d="M0,80 C180,20 360,100 540,55 C720,10 900,90 1080,48 C1260,6 1380,40 1440,25 L1440,120 L0,120 Z"
          />
          <path
            fill="var(--vd-mid, #2F6B3D)"
            opacity="0.55"
            d="M0,95 C200,55 400,115 600,70 C800,25 1000,105 1200,62 C1320,35 1400,55 1440,45 L1440,120 L0,120 Z"
          />
        </svg>
        <div className="about-hero-premium__wave-inner">
          <div className="about-hero-premium__wave-leaves" aria-hidden="true">
            <i className="fa-solid fa-leaf" />
            <i className="fa-solid fa-leaf" />
            <i className="fa-solid fa-leaf" />
          </div>
          <div className="about-hero-premium__features">
            {waveFeatures.map((item) => (
              <div key={item.title} className="about-hero-premium__feature">
                <div className="about-hero-premium__feature-glass">
                  <i className={item.icon} aria-hidden="true" />
                </div>
                <p className="about-hero-premium__feature-title">{item.title}</p>
                <p className="about-hero-premium__feature-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
