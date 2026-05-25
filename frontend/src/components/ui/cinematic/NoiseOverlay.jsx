import { memo } from "react";

function NoiseOverlay({ opacity = 0.045 }) {
  return (
    <div
      className="home-cinematic-layer absolute inset-0 z-20 pointer-events-none mix-blend-overlay"
      style={{ opacity }}
      aria-hidden
    >
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <filter id="home-cinematic-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="4"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#home-cinematic-noise)" />
      </svg>
    </div>
  );
}

export default memo(NoiseOverlay);
