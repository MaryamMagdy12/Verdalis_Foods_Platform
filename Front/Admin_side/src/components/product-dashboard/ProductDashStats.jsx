import React from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faBox } from "@fortawesome/free-solid-svg-icons";
import { ScrollReveal } from "../shared/ScrollReveal";
import { AnimatedText } from "../shared/AnimatedText";
import { staggerContainer, fadeUp } from "../../animations/motionPresets";
import "../../assets/css/components/ProductDashStats.css";

const stats = [
  { label: "Total Products", value: "100000", type: "white", icon: faBox },
  { label: "Low Stock", value: "8", type: "green", icon: faChevronDown },
  { label: "Out of Stock", value: "0", type: "red", icon: faChevronDown },
  { label: "Active Products", value: "Products", type: "green", icon: faChevronDown },
];

export function ProductDashStats() {
  return (
    <ScrollReveal as={motion.div} variants={staggerContainer(0.08, 0.05)} once={false}>
      <div className="product-dash-stats">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={fadeUp}
            className={`product-dash-stat-card ${stat.type}`}
          >
            <div className="product-dash-stat-label">
              <AnimatedText>{stat.label}</AnimatedText>
            </div>
            <div className="product-dash-stat-value">
              <AnimatedText>{stat.value}</AnimatedText>
              <FontAwesomeIcon icon={stat.icon} className="product-dash-stat-icon" />
            </div>
          </motion.div>
        ))}
      </div>
    </ScrollReveal>
  );
}
