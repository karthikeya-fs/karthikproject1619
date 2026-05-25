import { useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { FiUser, FiCamera, FiCalendar, FiShield } from "react-icons/fi";
import { Sparkles, Zap } from "lucide-react";

function CompletionRing({ percent }) {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <div className="relative w-[96px] h-[96px] flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" className="completion-ring-track" stroke="rgba(255,255,255,0.04)" strokeWidth="5" />
        <motion.circle
          cx="48" cy="48" r={r} fill="none"
          stroke="url(#cRingGrad)" strokeWidth="5" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 2, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
        />
        <motion.circle
          cx="48" cy="48" r={r} fill="none"
          stroke="rgba(124,58,237,0.3)" strokeWidth="5" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 2, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          style={{ filter: "blur(6px)" }}
        />
        <defs>
          <linearGradient id="cRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="completion-percent text-lg font-black text-gray-900 dark:text-white leading-none">{percent}%</span>
        <span className="completion-sub text-[9px] text-gray-400 dark:text-white/30 font-medium mt-0.5 uppercase tracking-widest">done</span>
      </div>
    </div>
  );
}

function TiltCard({ children, className = "" }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [5, -5]), { stiffness: 250, damping: 25 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-5, 5]), { stiffness: 250, damping: 25 });

  const handleMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function ProfileHeader({ user, profileImage, onImageUpload, greeting, uploadingImage }) {
  const completion = (() => {
    const fields = [user.name, user.rollNumber, user.department, user.phone, user.github, user.linkedin];
    return Math.round((fields.filter((f) => f?.trim()).length / 6) * 100);
  })();

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })
    : null;

  return (
    <div className="relative">
      {/* Cosmic hero banner */}
      <div className="relative h-56 sm:h-64 lg:h-72 overflow-hidden isolate">
        {/* Base */}
        <div className="absolute inset-0" style={{ backgroundColor: "var(--bg-deep)" }} />

        {/* Aurora layers */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-1/2 -left-1/4 w-[140%] h-[200%] animate-aurora-1"
            style={{ background: "radial-gradient(ellipse at 30% 40%, rgba(124,58,237,0.3) 0%, transparent 60%)", filter: "blur(50px)" }}
          />
          <div
            className="absolute -top-1/4 right-0 w-[120%] h-[180%] animate-aurora-2"
            style={{ background: "radial-gradient(ellipse at 70% 30%, rgba(6,182,212,0.2) 0%, transparent 55%)", filter: "blur(60px)" }}
          />
          <div
            className="absolute bottom-0 left-1/3 w-[90%] h-[140%] animate-aurora-3"
            style={{ background: "radial-gradient(ellipse at 50% 80%, rgba(59,130,246,0.15) 0%, transparent 60%)", filter: "blur(70px)" }}
          />
          <div
            className="absolute top-1/2 left-0 w-full h-px"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.5), rgba(6,182,212,0.5), transparent)",
              backgroundSize: "200% 100%",
              animation: "shimmer 3s linear infinite",
              filter: "blur(1px)",
            }}
          />
        </div>

        {/* Dot-grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Bottom fade - reduced height, softer transition */}
        <div className="absolute inset-x-0 bottom-0 h-16" style={{ background: "linear-gradient(to bottom, transparent, var(--bg-deep))" }} />

        {/* Greeting chip */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="absolute top-5 left-5 sm:left-8 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xl"
          style={{
            background: "rgba(124,58,237,0.1)",
            border: "1px solid rgba(124,58,237,0.2)",
            color: "rgba(196,181,253,0.8)",
          }}
        >
          <Sparkles size={11} className="text-purple-400" />
          {greeting}
        </motion.div>
      </div>

      {/* Avatar + info row */}
      <div className="relative px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-end sm:gap-8">

          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative group flex-shrink-0"
          >
            {/* Outer glow rings */}
            <div className="absolute -inset-4 rounded-full animate-pulse-glow-soft pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)",
              }}
            />
            <div className="absolute -inset-[4px] rounded-full animate-spin-slow pointer-events-none"
              style={{
                background: "conic-gradient(from 0deg, #7c3aed, #06b6d4, #3b82f6, #7c3aed)",
                filter: "blur(3px)",
              }}
            />
            <div className="absolute -inset-[3px] rounded-full pointer-events-none"
              style={{
                background: "conic-gradient(from 90deg, #7c3aed, #a78bfa, #22d3ee, #7c3aed)",
                filter: "blur(2px)", opacity: 0.6,
              }}
            />
            {/* Avatar shell */}
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full p-[3px] z-10"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #3b82f6, #06b6d4)",
                boxShadow: "0 0 40px rgba(124,58,237,0.25), 0 0 80px rgba(124,58,237,0.1)",
              }}
            >
              <div className="w-full h-full rounded-full overflow-hidden" style={{ backgroundColor: "#080e1a" }}>
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0c0124, #080e1a)" }}>
                    <FiUser className="text-4xl" style={{ color: "rgba(255,255,255,0.2)" }} />
                  </div>
                )}
              </div>
            </div>

            {/* Camera overlay */}
            <label className="absolute inset-0 rounded-full z-20 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all duration-300"
              style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
            >
              <FiCamera className="text-xl text-white" />
              <input type="file" hidden accept="image/*" onChange={onImageUpload} />
            </label>

            {/* Online dot with enhanced glow */}
            <div className="absolute -bottom-0.5 -right-0.5 z-30 flex items-center justify-center w-7 h-7 rounded-full" style={{ backgroundColor: "var(--bg-deep)" }}>
              <div className="w-[18px] h-[18px] rounded-full bg-emerald-400"
                style={{ boxShadow: "0 0 10px rgba(52,211,153,0.8), 0 0 20px rgba(52,211,153,0.4)" }}
              >
                <div className="w-full h-full rounded-full bg-emerald-400 animate-ping opacity-60" />
              </div>
            </div>
          </motion.div>

          {/* Name + badges */}
          <motion.div
            initial={{ y: 25, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-center sm:text-left flex-1 min-w-0 pb-2"
          >
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight truncate neon-text">
              {user.name || "Your Name"}
            </h1>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-3">
              {/* Verified badge */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold backdrop-blur-xl"
                style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)", color: "#a78bfa" }}
              >
                <FiShield size={10} /> Verified
              </span>

              {/* Online */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold backdrop-blur-xl"
                style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", color: "#34d399" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ boxShadow: "0 0 6px rgba(52,211,153,0.8)" }} />
                Online
              </span>

              {/* Member since */}
              {memberSince && (
                <span className="inline-flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
                  <FiCalendar size={10} /> Since {memberSince}
                </span>
              )}
            </div>
          </motion.div>

          {/* Completion card */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <TiltCard
              className="profile-completion flex items-center gap-3.5 px-5 py-4 rounded-2xl cursor-default border border-gray-200 bg-gray-100 dark:border-transparent dark:bg-transparent glass-card-premium"
            >
              <CompletionRing percent={completion} />
              <div className="hidden sm:block">
                <p className="completion-muted text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-white/30">Profile</p>
                <p className="text-sm font-bold mt-0.5" style={{ color: "var(--text)" }}>Completion</p>
                <div className="flex items-center gap-1 mt-1.5">
                  <Zap size={10} className="text-purple-400" />
                  <span className="completion-muted text-[10px] text-gray-500 dark:text-white/30">
                    {completion < 100 ? "Fill all fields" : "Complete!"}
                  </span>
                </div>
              </div>
            </TiltCard>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
