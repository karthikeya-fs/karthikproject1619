import { memo } from "react";

const SHAPES = [
  { top: "12%", left: "8%", w: 120, h: 120, delay: 0, isCircle: true },
  { top: "55%", left: "85%", w: 96, h: 96, delay: 2, isCircle: false },
  { top: "72%", left: "18%", w: 140, h: 88, delay: 4, isCircle: false },
  { top: "28%", left: "78%", w: 80, h: 80, delay: 1, isCircle: true },
];

function GlassShapes({ reduced }) {
  if (reduced) return null;

  return (
    <div className="home-cinematic-layer absolute inset-0 z-10 overflow-hidden pointer-events-none" aria-hidden>
      {SHAPES.map((s, i) => (
        <div
          key={i}
          className={`absolute border animate-cosmic-float ${
            i % 2 === 0 ? "" : "animate-cosmic-float-delayed"
          }`}
          style={{
            top: s.top,
            left: s.left,
            width: s.w,
            height: s.h,
            borderRadius: s.isCircle ? "50%" : "1.5rem",
            animationDelay: `${s.delay}s`,
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.15) 100%)",
            borderColor: "rgba(255, 255, 255, 0.55)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxShadow: "0 8px 32px 0 rgba(99, 102, 241, 0.06), inset 0 1px 1px 0 rgba(255, 255, 255, 0.3)",
            transform: "translateZ(0)",
          }}
        />
      ))}
    </div>
  );
}

export default memo(GlassShapes);
