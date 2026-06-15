import { useEffect, useRef } from "react";
import Lenis from "lenis";

function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Call with location.pathname - Lenis will resize & scroll to top when route changes. */
export function useLenis(pathname) {
  const lenisRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let lenis;
    let rafId = 0;
    try {
      lenis = new Lenis({ smoothWheel: true, smoothTouch: false, lerp: 0.1 });
      lenisRef.current = lenis;
      const raf = (time) => {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    } catch (_) {}
    return () => {
      lenisRef.current = null;
      if (rafId) cancelAnimationFrame(rafId);
      if (lenis && typeof lenis.destroy === "function") lenis.destroy();
    };
  }, []);

  useEffect(() => {
    if (pathname == null || prefersReducedMotion()) return;
    const lenis = lenisRef.current;
    if (!lenis) return;
    lenis.scrollTo(0, { immediate: true });
    let rafId = 0;
    let timeoutId = 0;
    rafId = requestAnimationFrame(() => {
      lenis.resize?.();
      timeoutId = setTimeout(() => lenis.resize?.(), 400);
    });
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [pathname]);
}
