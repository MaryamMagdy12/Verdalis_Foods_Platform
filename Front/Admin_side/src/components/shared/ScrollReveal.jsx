import React from "react";
import { motion } from "framer-motion";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { useReduceMotion } from "../../hooks/useReduceMotion";
import { fadeUp } from "../../animations/motionPresets";

/**
 * Wraps content and runs animation every time it scrolls into view (not just the first scroll).
 * Uses once: false by default so when you scroll away and back, the animation runs again.
 * Respects prefers-reduced-motion.
 */
export function ScrollReveal({
  children,
  as: Component = motion.div,
  variants = fadeUp,
  className,
  once = false,
  ...rest
}) {
  const reduce = useReduceMotion();
  const { ref, inView } = useScrollReveal({ once });
  const show = reduce || inView;
  return (
    <Component
      ref={ref}
      initial={reduce ? false : "hidden"}
      animate={reduce ? { opacity: 1 } : (show ? "show" : "hidden")}
      variants={reduce ? undefined : variants}
      className={className}
      {...rest}
    >
      {children}
    </Component>
  );
}
