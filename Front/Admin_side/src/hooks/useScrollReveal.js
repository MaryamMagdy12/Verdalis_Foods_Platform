import { useState, useEffect, useRef } from "react";

/**
 * Triggers when element enters viewport. With once: false, every time the element
 * scrolls into view it reports inView true (and when it leaves, false), so
 * entrance animations can re-run on each scroll.
 */
export function useScrollReveal(options = {}) {
  const {
    threshold = 0.05,
    rootMargin = "0px 0px 50px 0px",
    once = false,
  } = options;
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const intersecting = entry.isIntersecting;
        setInView(intersecting);
        if (intersecting) {
          setHasAnimated(true);
        } else if (!once) {
          setHasAnimated(false);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  const shouldAnimate = once ? hasAnimated && inView : inView;
  return { ref, inView: shouldAnimate };
}
