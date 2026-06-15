import { useEffect, useState } from "react";

/**
 * Returns true when animations should be reduced.
 * Override: localStorage.setItem('verdalisForceAnimations', '1') then refresh to enable animations.
 */
export function useReduceMotion() {
  const [reduce, setReduce] = useState(() => {
    if (typeof window === "undefined") return false;
    if (localStorage?.getItem("verdalisForceAnimations") === "1") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  });

  useEffect(() => {
    if (localStorage?.getItem("verdalisForceAnimations") === "1") {
      setReduce(false);
      return;
    }
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const handler = () => setReduce(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduce;
}
