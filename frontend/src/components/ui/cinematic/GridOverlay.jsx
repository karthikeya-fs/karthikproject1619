import { memo } from "react";

function GridOverlay({ reduced }) {
  if (reduced) return null;

  return (
    <div className="home-cinematic-layer absolute inset-0 z-10 pointer-events-none" aria-hidden>
      <div
        className="absolute inset-0 cosmic-grid opacity-40"
        style={{
          maskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
        }}
      />
      {/* Scan line */}
      <div
        className="absolute left-0 right-0 h-px home-scan-line"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.5), transparent)",
          boxShadow: "0 0 20px rgba(34,211,238,0.3)",
        }}
      />
      {/* Glowing intersections */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "radial-gradient(circle at center, rgba(34,211,238,0.15) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)",
        }}
      />
    </div>
  );
}

export default memo(GridOverlay);
