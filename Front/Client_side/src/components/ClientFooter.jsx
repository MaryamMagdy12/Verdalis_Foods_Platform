import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useReduceMotion } from "../hooks/useReduceMotion";
import { fadeUp, staggerContainer, sectionEntrance } from "../animations/motionPresets";
import { useScrollReveal } from "../hooks/useScrollReveal";
import "../assets/css/ClientFooter.css";
import logo from "../assets/images/verdalis-foods-logo.png";

const FEATURES = [
  { icon: "fa-award", label: "Premium Quality" },
  { icon: "fa-earth-americas", label: "Global Sourcing" },
  { icon: "fa-truck-fast", label: "Reliable Delivery" },
  { icon: "fa-handshake", label: "Trusted Partner" },
];

export function ClientFooter() {
  const reduce = useReduceMotion();
  const [ref, isInView] = useScrollReveal();
  const show = reduce || isInView;

  return (
    <motion.footer
      ref={ref}
      className="client-footer"
      initial={reduce ? false : "hidden"}
      animate={show ? "show" : "hidden"}
      variants={reduce ? undefined : sectionEntrance}
    >
      <div className="client-footer-glow" aria-hidden="true" />
      <motion.div className="client-footer-inner" variants={reduce ? undefined : staggerContainer(0.06, 0)}>
        <motion.div className="client-footer-col client-footer-brand" variants={reduce ? undefined : fadeUp}>
          <span className="client-footer-logo-text">
            {/* <img className="client-footer-logo-img" src={logo} alt="Verdalis Foods"  /> */}
            <i className="fa-solid fa-leaf client-footer-logo-icon" aria-hidden="true" />
            Verdalis Foods
          </span>
          <p className="client-footer-tagline">
            Premium imported foods for retailers and distributors across North America.
          </p>
          <ul className="client-footer-features">
            {FEATURES.map((f) => (
              <li key={f.label}>
                <i className={`fa-solid ${f.icon}`} aria-hidden="true" />
                <span>{f.label}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div className="client-footer-col" variants={reduce ? undefined : fadeUp}>
          <h4 className="client-footer-heading">Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/products">Partners</Link>
          <Link to="/find-a-store">Find a Store</Link>
          <Link to="/contact">Contact</Link>
        </motion.div>

        <motion.div className="client-footer-col" variants={reduce ? undefined : fadeUp}>
          <h4 className="client-footer-heading">Products</h4>
          <Link to="/products">Catalog</Link>
          <Link to="/products">Olive Oil</Link>
          <Link to="/products">Grains &amp; Rice</Link>
          <Link to="/products">Spices</Link>
          <Link to="/products">All Products</Link>
        </motion.div>

        <motion.div className="client-footer-col client-footer-contact" variants={reduce ? undefined : fadeUp}>
          <h4 className="client-footer-heading">Contact</h4>
          <p>
            <i className="fa-solid fa-envelope" aria-hidden="true" />
            info@verdalisfoods.com
          </p>
          <p>
            <i className="fa-solid fa-phone" aria-hidden="true" />
            01286179824
          </p>
          <p>
            <i className="fa-solid fa-location-dot" aria-hidden="true" />
            North America
          </p>
          <div className="client-footer-socials">
            <a
              className="client-footer-social"
              href="https://www.facebook.com/share/16wo6bv2yA/?mibextid=wwXIfr"
              aria-label="Facebook"
              title="Facebook"
            >
              <i className="fa-brands fa-facebook-f" aria-hidden="true" />
            </a>
            <a
              className="client-footer-social"
              href="https://www.instagram.com/verdalisfoods"
              aria-label="Instagram"
              title="Instagram"
            >
              <i className="fa-brands fa-instagram" aria-hidden="true" />
            </a>
            <a
              className="client-footer-social"
              href="https://www.linkedin.com"
              aria-label="LinkedIn"
              title="LinkedIn"
              rel="noopener noreferrer"
            >
              <i className="fa-brands fa-linkedin-in" aria-hidden="true" />
            </a>
          </div>
        </motion.div>

        <motion.div className="client-footer-bottom" variants={reduce ? undefined : fadeUp}>
          <span>© {new Date().getFullYear()} Verdalis Foods. All rights reserved.</span>
        </motion.div>
      </motion.div>
    </motion.footer>
  );
}
