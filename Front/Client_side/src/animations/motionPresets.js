export const eases = {
  easeOut: [0.16, 1, 0.3, 1],
  easeInOut: [0.65, 0, 0.35, 1]
};

export const durations = {
  fast: 0.25,
  base: 0.7,
  slow: 1.05
};

export const revealViewport = { once: true, amount: 0.08, margin: "0px 0px 40px 0px" };
export const revealViewportOnce = { once: true, amount: 0.08, margin: "0px 0px 40px 0px" };

export const sectionEntrance = {
  hidden: { opacity: 0, y: 36 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease: eases.easeOut,
      staggerChildren: 0.1,
      delayChildren: 0.12
    }
  }
};

export const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: durations.slow, ease: eases.easeOut } }
};

export const fadeDown = {
  hidden: { opacity: 0, y: -22 },
  show: { opacity: 1, y: 0, transition: { duration: durations.slow, ease: eases.easeOut } }
};

export const fadeLeft = {
  hidden: { opacity: 0, x: -28 },
  show: { opacity: 1, x: 0, transition: { duration: durations.slow, ease: eases.easeOut } }
};

export const fadeRight = {
  hidden: { opacity: 0, x: 28 },
  show: { opacity: 1, x: 0, transition: { duration: durations.slow, ease: eases.easeOut } }
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: durations.slow, ease: eases.easeOut } }
};

export const staggerContainer = (stagger = 0.08, delayChildren = 0.05) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: stagger,
      delayChildren
    }
  }
});

export const linesToTextWord = {
  hidden: { opacity: 0, scaleX: 0, transformOrigin: "left center" },
  show: {
    opacity: 1,
    scaleX: 1,
    transformOrigin: "left center",
    transition: { duration: 0.6, ease: eases.easeOut }
  }
};
