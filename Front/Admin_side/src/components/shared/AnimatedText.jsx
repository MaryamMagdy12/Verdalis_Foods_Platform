import React from "react";
import { motion } from "framer-motion";
import { fadeUpText } from "../../animations/motionPresets";

/**
 * Use inside a ScrollReveal or motion parent so text gets its own smooth transition.
 * Inherits "show"/"hidden" from parent variants for staggered text animation.
 */
export function AnimatedText({ as: Tag = motion.span, children, className, variants = fadeUpText, ...rest }) {
  return (
    <Tag className={className} variants={variants} {...rest}>
      {children}
    </Tag>
  );
}
