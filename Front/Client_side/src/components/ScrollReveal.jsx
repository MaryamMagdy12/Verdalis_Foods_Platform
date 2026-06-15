import React, { useEffect, useRef, useState } from "react";

const DEFAULT_OPTIONS = {
  threshold: 0.08,
  rootMargin: "0px 0px -24px 0px"
};

/**
 * Wraps content and adds a class when it scrolls into view so CSS can run entrance animation.
 * Respects prefers-reduced-motion when reduce prop is true.
 */
export function ScrollReveal({
  children,
  as: Tag = "section",
  className = "",
  reduce = false,
  viewportOptions
}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const opts = viewportOptions ?? DEFAULT_OPTIONS;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      opts
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduce, viewportOptions]);

  const inViewClass = reduce || inView ? " scroll-reveal-in-view" : "";
  const fullClass = "scroll-reveal" + inViewClass + (className ? " " + className : "");

  return (
    <Tag ref={ref} className={fullClass}>
      {children}
    </Tag>
  );
}
