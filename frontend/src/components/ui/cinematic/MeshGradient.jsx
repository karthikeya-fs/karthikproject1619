import { memo } from "react";

function MeshGradient({ isDark }) {
  if (isDark) {
    return (
      <div className="home-cinematic-layer absolute inset-0 z-0" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 20% 10%, rgba(30,27,75,0.9) 0%, transparent 55%),
              radial-gradient(ellipse 70% 60% at 85% 20%, rgba(15,23,42,0.85) 0%, transparent 50%),
              linear-gradient(180deg, #050816 0%, #0f172a 45%, #050816 100%)
            `,
          }}
        />
      </div>
    );
  }

  return (
    <div className="home-cinematic-layer absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0 home-mesh-drift"
        style={{
          background: `
            radial-gradient(ellipse 90% 70% at 10% 0%, #eef2ff 0%, transparent 50%),
            radial-gradient(ellipse 80% 60% at 90% 10%, #dbeafe 0%, transparent 45%),
            radial-gradient(ellipse 70% 50% at 50% 100%, #e0e7ff 0%, transparent 55%),
            linear-gradient(165deg, #f4f7fb 0%, #eef2ff 40%, #f8fafc 100%)
          `,
        }}
      />
      <div
        className="absolute -right-1/4 top-1/4 w-[70%] h-[60%] rounded-full home-mesh-drift home-cinematic-blur-lg opacity-60"
        style={{
          background: "radial-gradient(circle, rgba(199,210,254,0.5) 0%, transparent 70%)",
          filter: "blur(64px)",
          animationDelay: "-4s",
        }}
      />
      <div
        className="absolute -left-1/4 bottom-0 w-[60%] h-[50%] rounded-full home-mesh-drift home-cinematic-blur-md opacity-50"
        style={{
          background: "radial-gradient(circle, rgba(186,230,253,0.45) 0%, transparent 70%)",
          filter: "blur(56px)",
          animationDelay: "-8s",
        }}
      />
    </div>
  );
}

export default memo(MeshGradient);
