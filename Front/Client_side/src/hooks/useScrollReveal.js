import { useEffect, useRef, useState } from "react";

const DEFAULT_OPTIONS = {
  threshold: 0.05,
  rootMargin: "0px 0px 50px 0px",
  triggerOnce: false
};

/**
 * Uses native IntersectionObserver for reliable scroll-triggered reveal.
 * Returns [ref, isInView]. Attach ref to element, use isInView for animate prop.
 */
export function useScrollReveal(options = {}) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const opts = { ...DEFAULT_OPTIONS, ...options };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (opts.triggerOnce) observer.disconnect();
        } else if (!opts.triggerOnce) {
          setIsInView(false);
        }
      },
      { threshold: opts.threshold, rootMargin: opts.rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [opts.threshold, opts.rootMargin, opts.triggerOnce]);

  return [ref, isInView];
}
