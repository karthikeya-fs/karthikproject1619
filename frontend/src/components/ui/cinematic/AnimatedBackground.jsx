import { memo } from "react";
import { useThemeMode, useReducedMotion } from "../../../hooks/useThemeMode";
import { useMouseGlow } from "../../../hooks/useMouseGlow";
import MeshGradient from "./MeshGradient";
import AuroraLayer from "./AuroraLayer";
import ParticleField from "./ParticleField";
import GridOverlay from "./GridOverlay";
import MouseGlow from "./MouseGlow";
import GlassShapes from "./GlassShapes";
import NoiseOverlay from "./NoiseOverlay";
import "./home-cinematic.css";

function SectionFade({ position = "bottom" }) {
  const isTop = position === "top";
  return (
    <div
      className={`home-cinematic-layer absolute inset-x-0 ${isTop ? "top-0 h-24" : "bottom-0 h-32"} z-20 pointer-events-none`}
      style={{
        background: isTop
          ? "linear-gradient(to bottom, var(--bg) 0%, transparent 100%)"
          : "linear-gradient(to top, var(--bg) 0%, transparent 100%)",
      }}
      aria-hidden
    />
  );
}

function AnimatedBackground({
  isDark: isDarkProp,
  reduced: reducedProp,
  glowRef: glowRefProp,
  parallaxRef: parallaxRefProp,
}) {
  const isDarkInternal = useThemeMode();
  const reducedInternal = useReducedMotion();
  const isDark = isDarkProp ?? isDarkInternal;
  const reduced = reducedProp ?? reducedInternal;

  const internalMouse = useMouseGlow(!reduced && !glowRefProp);
  const glowRef = glowRefProp ?? internalMouse.glowRef;
  const parallaxRef = parallaxRefProp ?? internalMouse.parallaxRef;

  return (
    <div
      className="home-cinematic-root fixed inset-0 overflow-hidden pointer-events-none z-0"
      aria-hidden
    >
      <MeshGradient isDark={isDark} />
      <AuroraLayer isDark={isDark} reduced={reduced} />
      {isDark ? (
        <GridOverlay reduced={reduced} />
      ) : (
        <GlassShapes reduced={reduced} />
      )}
      <ParticleField isDark={isDark} reduced={reduced} parallaxRef={parallaxRef} />
      <MouseGlow isDark={isDark} glowRef={glowRef} reduced={reduced} />
      <NoiseOverlay opacity={isDark ? 0.05 : 0.035} />
      <SectionFade position="top" />
      <SectionFade position="bottom" />
    </div>
  );
}

export default memo(AnimatedBackground);

export { SectionFade };
