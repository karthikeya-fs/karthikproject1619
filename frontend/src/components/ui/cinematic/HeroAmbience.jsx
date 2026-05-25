import { memo, useRef, useEffect } from "react";
import { motion } from "framer-motion";

const FLOAT_CARDS = [
  { top: "8%", left: "6%", label: "Secure claims", rotate: -6, delay: 0 },
  { top: "18%", right: "5%", label: "Live chat", rotate: 5, delay: 0.15 },
  { bottom: "12%", left: "10%", label: "Smart search", rotate: 4, delay: 0.3 },
];

function HeroAmbience({ isDark, reduced, parallaxRef }) {
  const wrapRef = useRef(null);

  useEffect(() => {
    if (reduced || !parallaxRef) return undefined;
    let raf = 0;
    const tick = () => {
      const el = wrapRef.current;
      const p = parallaxRef.current;
      if (el && p) {
        const ox = (p.x - 0.5) * 12;
        const oy = (p.y - 0.5) * 8;
        el.style.transform = `translate3d(${ox}px, ${oy}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, parallaxRef]);

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0 overflow-hidden pointer-events-none z-[5]"
      aria-hidden
    >
      {/* Hero spotlight */}
      <div
        className="absolute top-1/2 left-1/2 w-[min(520px,90vw)] h-[min(320px,50vh)] home-hero-spotlight rounded-full"
        style={{
          background: isDark
            ? "radial-gradient(ellipse, rgba(124,58,237,0.25) 0%, rgba(6,182,212,0.08) 45%, transparent 70%)"
            : "radial-gradient(ellipse, rgba(199,210,254,0.5) 0%, rgba(255,255,255,0.2) 50%, transparent 72%)",
          filter: "blur(40px)",
        }}
      />

      {!reduced &&
        FLOAT_CARDS.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + card.delay, duration: 0.6 }}
            className="absolute hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-semibold tracking-wide uppercase"
            style={{
              top: card.top,
              left: card.left,
              right: card.right,
              bottom: card.bottom,
              rotate: `${card.rotate}deg`,
              background: isDark
                ? "rgba(15,23,42,0.55)"
                : "rgba(255,255,255,0.55)",
              borderColor: isDark
                ? "rgba(124,58,237,0.25)"
                : "rgba(199,210,254,0.6)",
              color: isDark ? "rgba(148,163,184,0.9)" : "rgba(71,85,105,0.85)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              boxShadow: isDark
                ? "0 8px 32px rgba(0,0,0,0.35)"
                : "0 8px 24px rgba(99,102,241,0.08)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: isDark ? "#22d3ee" : "#6366f1",
                boxShadow: isDark ? "0 0 8px #22d3ee" : "none",
              }}
            />
            {card.label}
          </motion.div>
        ))}
    </div>
  );
}

export default memo(HeroAmbience);
