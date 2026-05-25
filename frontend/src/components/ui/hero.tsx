import { useEffect, useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { MeshGradient, PulsingBorder } from "@paper-design/shaders-react";
import { motion } from "framer-motion";
import { ArrowUpRight, Zap } from "lucide-react";

type ShaderShowcaseProps = {
  /** When true, hides demo header and fits under app Navbar */
  embedded?: boolean;
  children?: ReactNode;
};

export default function ShaderShowcase({ embedded = false, children }: ShaderShowcaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const onEnter = () => container.classList.add("shader-hero-active");
    const onLeave = () => container.classList.remove("shader-hero-active");
    container.addEventListener("mouseenter", onEnter);
    container.addEventListener("mouseleave", onLeave);
    return () => {
      container.removeEventListener("mouseenter", onEnter);
      container.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={
        embedded
          ? "relative min-h-[88vh] w-full bg-black overflow-hidden rounded-none"
          : "min-h-screen bg-black relative overflow-hidden"
      }
    >
      <svg className="absolute inset-0 w-0 h-0" aria-hidden>
        <defs>
          <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.005" numOctaves={1} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.02 0 1 0 0 0.02 0 0 1 0 0.05 0 0 0 0.9 0"
              result="tint"
            />
          </filter>
          <filter id="gooey-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
          <filter id="logo-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
          <filter id="text-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      <MeshGradient
        className="absolute inset-0 w-full h-full pointer-events-none"
        colors={["#000000", "#06b6d4", "#0891b2", "#164e63", "#6366f1"]}
        speed={0.3}
        backgroundColor="#000000"
      />
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-60 pointer-events-none"
        colors={["#000000", "#ffffff", "#06b6d4", "#818cf8"]}
        speed={0.2}
        wireframe
        backgroundColor="transparent"
      />

      {!embedded && (
        <header className="relative z-20 flex items-center justify-between p-6">
          <motion.div
            className="flex items-center gap-2 group cursor-pointer"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <img
              src="/logo.png"
              alt="Lost & Found"
              className="size-10 rounded-xl object-cover ring-2 ring-white/20"
            />
            <span className="text-white font-bold text-sm tracking-tight">Lost &amp; Found</span>
          </motion.div>

          <nav className="flex items-center space-x-2">
            <a
              href="#features"
              className="text-white/80 hover:text-white text-xs font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-white/80 hover:text-white text-xs font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200"
            >
              Community
            </a>
            <Link
              to="/found-items"
              className="text-white/80 hover:text-white text-xs font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200"
            >
              Browse
            </Link>
          </nav>

          <div
            id="gooey-btn"
            className="relative flex items-center group"
            style={{ filter: "url(#gooey-filter)" }}
          >
            <Link
              to="/login"
              className="absolute right-0 px-2.5 py-2 rounded-full bg-white text-black font-normal text-xs transition-all duration-300 hover:bg-white/90 h-8 flex items-center justify-center -translate-x-10 group-hover:-translate-x-19 z-0"
              aria-label="Go to login"
            >
              <ArrowUpRight className="w-3 h-3" strokeWidth={2} />
            </Link>
            <Link
              to="/login"
              className="px-6 py-2 rounded-full bg-white text-black font-normal text-xs transition-all duration-300 hover:bg-white/90 h-8 flex items-center z-10"
            >
              Login
            </Link>
          </div>
        </header>
      )}

      <main
        className={
          embedded
            ? "relative z-20 flex flex-col items-center justify-center px-4 pt-24 pb-20 min-h-[88vh]"
            : "absolute bottom-8 left-8 z-20 max-w-2xl"
        }
      >
        {children ?? (
          <div className={embedded ? "text-center max-w-3xl mx-auto" : "text-left"}>
            <motion.div
              className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm mb-6 relative border border-white/10"
              style={{ filter: "url(#glass-effect)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="absolute top-0 left-1 right-1 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent rounded-full" />
              <Zap className="w-3.5 h-3.5 text-cyan-400 mr-2" />
              <span className="text-white/90 text-sm font-medium relative z-10 tracking-wide">
                Campus Lost &amp; Found Network
              </span>
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-none tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <motion.span
                className="block font-light text-white/90 text-3xl sm:text-4xl md:text-5xl mb-2 tracking-wider bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #ffffff 0%, #06b6d4 30%, #818cf8 70%, #ffffff 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  filter: "url(#text-glow)",
                }}
              >
                Reconnect with
              </motion.span>
              <span className="block font-black text-white drop-shadow-2xl">what you</span>
              <span className="block font-light text-white/80 italic">lost</span>
            </motion.h1>

            <motion.p
              className="text-base sm:text-lg font-light text-white/70 mb-8 leading-relaxed max-w-xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              A smart, secure platform helping students recover lost belongings across campus —
              with verified claims and real-time messaging.
            </motion.p>

            <motion.div
              className="flex items-center justify-center gap-4 flex-wrap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <Link
                to="/found-items"
                className="px-8 py-3.5 rounded-full bg-transparent border-2 border-white/30 text-white font-medium text-sm transition-all duration-300 hover:bg-white/10 hover:border-cyan-400/50 hover:text-cyan-100 backdrop-blur-sm"
              >
                Explore Items
              </Link>
              <Link
                to="/post-item"
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold text-sm transition-all duration-300 hover:from-cyan-400 hover:to-indigo-500 shadow-lg hover:shadow-xl"
              >
                Post Found Item
              </Link>
            </motion.div>
          </div>
        )}
      </main>

      <div
        className={
          embedded
            ? "absolute bottom-6 right-6 z-30 hidden lg:block"
            : "absolute bottom-8 right-8 z-30"
        }
      >
        <div className="relative w-20 h-20 flex items-center justify-center">
          <PulsingBorder
            colors={["#06b6d4", "#0891b2", "#818cf8", "#34d399", "#ffffff"]}
            colorBack="#00000000"
            speed={1.5}
            roundness={1}
            thickness={0.1}
            softness={0.2}
            intensity={5}
            spotsPerColor={5}
            spotSize={0.1}
            pulse={0.1}
            smoke={0.5}
            smokeSize={4}
            scale={0.65}
            rotation={0}
            style={{ width: "60px", height: "60px", borderRadius: "50%" }}
          />
          <motion.svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{ transform: "scale(1.6)" }}
            aria-hidden
          >
            <defs>
              <path id="shader-hero-circle" d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
            </defs>
            <text className="text-[7px] fill-white/80 font-medium uppercase tracking-wider">
              <textPath href="#shader-hero-circle" startOffset="0%">
                Lost &amp; Found • Campus • Secure Claims • Reunite •
              </textPath>
            </text>
          </motion.svg>
        </div>
      </div>

      <div
        className="absolute inset-x-0 bottom-0 h-24 z-10 pointer-events-none bg-gradient-to-t from-[var(--bg)] to-transparent"
        aria-hidden
      />
    </div>
  );
}
