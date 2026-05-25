import { memo } from "react";

function MouseGlow({ isDark, glowRef, reduced }) {
  if (reduced) return null;

  return (
    <div
      ref={glowRef}
      className="home-cinematic-layer absolute top-0 left-0 z-10 w-[440px] h-[440px] rounded-full pointer-events-none"
      style={{
        background: isDark
          ? "radial-gradient(circle, rgba(124,58,237,0.14) 0%, rgba(6,182,212,0.06) 35%, transparent 70%)"
          : "radial-gradient(circle, rgba(199,210,254,0.35) 0%, rgba(186,230,253,0.15) 40%, transparent 70%)",
        willChange: "transform",
      }}
      aria-hidden
    />
  );
}

export default memo(MouseGlow);
