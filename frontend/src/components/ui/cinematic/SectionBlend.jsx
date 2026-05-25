import { memo } from "react";

/** Soft gradient bridge between home page sections */
function SectionBlend() {
  return (
    <div
      className="relative z-20 h-16 sm:h-20 pointer-events-none -my-4"
      aria-hidden
      style={{
        background: `linear-gradient(
          180deg,
          transparent 0%,
          color-mix(in srgb, var(--accent) 4%, transparent) 50%,
          transparent 100%
        )`,
      }}
    />
  );
}

export default memo(SectionBlend);
