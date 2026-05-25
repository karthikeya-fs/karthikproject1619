import { memo } from "react";

function AuroraLayer({ isDark, reduced }) {
  if (reduced) return null;

  if (isDark) {
    return (
      <div className="home-cinematic-layer absolute inset-0 z-10 overflow-hidden pointer-events-none" aria-hidden>
        <div
          className="absolute -top-48 -left-48 w-[min(800px,120vw)] h-[min(800px,120vw)] rounded-full animate-aurora-1 home-cinematic-blur-lg"
          style={{
            background: "radial-gradient(circle, rgba(124,58,237,0.35) 0%, rgba(59,130,246,0.15) 40%, transparent 65%)",
            filter: "blur(72px)",
          }}
        />
        <div
          className="absolute -top-32 right-0 w-[min(700px,100vw)] h-[min(700px,100vw)] rounded-full animate-aurora-2 home-cinematic-blur-lg"
          style={{
            background: "radial-gradient(circle, rgba(6,182,212,0.28) 0%, rgba(99,102,241,0.12) 40%, transparent 65%)",
            filter: "blur(80px)",
            animationDelay: "3s",
          }}
        />
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[min(900px,140vw)] h-[min(500px,60vh)] rounded-full animate-aurora-3 home-cinematic-blur-lg"
          style={{
            background: "radial-gradient(ellipse, rgba(168,85,247,0.22) 0%, rgba(59,130,246,0.08) 45%, transparent 70%)",
            filter: "blur(88px)",
          }}
        />
        {/* Ambient light beams */}
        <div
          className="absolute top-0 left-1/4 w-[40%] h-[120%] home-beam-drift origin-top opacity-20"
          style={{
            background: "linear-gradient(180deg, rgba(34,211,238,0.25) 0%, transparent 55%)",
            filter: "blur(24px)",
          }}
        />
        <div
          className="absolute top-0 right-1/5 w-[35%] h-full home-beam-drift opacity-15"
          style={{
            background: "linear-gradient(165deg, rgba(139,92,246,0.3) 0%, transparent 50%)",
            filter: "blur(28px)",
            animationDelay: "-5s",
          }}
        />
        {/* Floating blur orbs */}
        <div
          className="absolute top-1/3 left-[15%] w-48 h-48 rounded-full animate-cosmic-float home-cinematic-blur-md"
          style={{ background: "rgba(6,182,212,0.12)", filter: "blur(40px)" }}
        />
        <div
          className="absolute top-2/3 right-[10%] w-56 h-56 rounded-full animate-cosmic-float-delayed home-cinematic-blur-md"
          style={{ background: "rgba(124,58,237,0.14)", filter: "blur(44px)" }}
        />
      </div>
    );
  }

  return (
    <div className="home-cinematic-layer absolute inset-0 z-10 overflow-hidden pointer-events-none" aria-hidden>
      <div
        className="absolute -top-24 left-1/4 w-[min(600px,90vw)] h-[min(400px,50vh)] rounded-full animate-aurora-1 home-cinematic-blur-lg opacity-70"
        style={{
          background: "radial-gradient(ellipse, rgba(199,210,254,0.55) 0%, transparent 70%)",
          filter: "blur(64px)",
        }}
      />
      <div
        className="absolute top-1/3 -right-20 w-[min(500px,80vw)] h-[min(450px,55vh)] rounded-full animate-aurora-2 home-cinematic-blur-lg opacity-60"
        style={{
          background: "radial-gradient(ellipse, rgba(186,230,253,0.5) 0%, transparent 68%)",
          filter: "blur(72px)",
          animationDelay: "4s",
        }}
      />
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[min(700px,100vw)] h-64 rounded-full animate-aurora-3 home-cinematic-blur-md opacity-50"
        style={{
          background: "radial-gradient(ellipse, rgba(224,231,255,0.6) 0%, transparent 70%)",
          filter: "blur(56px)",
        }}
      />
    </div>
  );
}

export default memo(AuroraLayer);
