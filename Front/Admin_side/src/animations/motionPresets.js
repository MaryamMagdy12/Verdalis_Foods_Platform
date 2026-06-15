export const eases = {
  easeOut: [0.16, 1, 0.3, 1],
  easeInOut: [0.65, 0, 0.35, 1],
};

/* Smooth but visible: not too fast, not too slow (eyes can see) */
export const durations = {
  fast: 0.28,
  base: 0.48,
  slow: 0.56,
  visible: 0.52,
};

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.slow, ease: eases.easeOut },
  },
};

export const fadeDown = {
  hidden: { opacity: 0, y: -16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.slow, ease: eases.easeOut },
  },
};

export const fadeLeft = {
  hidden: { opacity: 0, x: -20 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: durations.slow, ease: eases.easeOut },
  },
};

export const fadeRight = {
  hidden: { opacity: 0, x: 20 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: durations.slow, ease: eases.easeOut },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: durations.slow, ease: eases.easeOut },
  },
};

/* For text: subtle move + fade, smooth and visible */
export const fadeUpText = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.visible, ease: eases.easeOut },
  },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: durations.slow, ease: eases.easeOut },
  },
};

export const sectionEntrance = {
  hidden: { opacity: 0, y: 36 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease: eases.easeOut,
      staggerChildren: 0.1,
      delayChildren: 0.12,
    },
  },
};

export const staggerContainer = (stagger = 0.06, delayChildren = 0.04) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: stagger,
      delayChildren,
    },
  },
});
