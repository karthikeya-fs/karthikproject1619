import { useEffect, useRef } from "react";

const SMOOTH = 0.07;

/**
 * Smooth cursor-follow glow + normalized parallax coords (refs only, no React re-renders).
 */
export function useMouseGlow(enabled = true) {
  const glowRef = useRef(null);
  const parallaxRef = useRef({ x: 0.5, y: 0.5 });
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const raf = useRef(0);

  useEffect(() => {
    if (!enabled) return undefined;

    const onMove = (e) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      parallaxRef.current.x = e.clientX / window.innerWidth;
      parallaxRef.current.y = e.clientY / window.innerHeight;
    };

    const tick = () => {
      const el = glowRef.current;
      current.current.x += (target.current.x - current.current.x) * SMOOTH;
      current.current.y += (target.current.y - current.current.y) * SMOOTH;
      if (el) {
        el.style.transform = `translate3d(${current.current.x - 220}px, ${current.current.y - 220}px, 0)`;
      }
      raf.current = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf.current);
    };
  }, [enabled]);

  return { glowRef, parallaxRef };
}
