import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Package, CheckCircle2, TrendingUp, Award } from "lucide-react";

function Counter({ target, suffix = "" }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) { setVal(0); return; }
    const steps = 40;
    const inc = target / steps;
    let cur = 0;
    const t = setInterval(() => {
      cur += inc;
      if (cur >= target) { setVal(target); clearInterval(t); }
      else setVal(Math.round(cur));
    }, 1000 / steps);
    return () => clearInterval(t);
  }, [target]);
  return <>{val}{suffix}</>;
}

function Sparkline({ color }) {
  const pts = [3, 7, 5, 9, 6, 11, 8, 13, 10, 14, 12, 16];
  const max = Math.max(...pts);
  const w = 64, h = 22;
  const coords = pts.map((p, i) => `${(i / (pts.length - 1)) * w},${h - (p / max) * h}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="opacity-50">
      <defs>
        <linearGradient id={`spark-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={coords} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points={`0,${h} ${coords} ${w},${h}`} fill={`url(#spark-${color.replace("#","")})`} />
    </svg>
  );
}

function StatCard({ stat, index }) {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 250, damping: 25 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), { stiffness: 250, damping: 25 });

  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => { mx.set(0); my.set(0); };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 * index, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative rounded-2xl p-4 overflow-hidden cursor-default group glass-card-premium"
      whileHover={{ y: -4 }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 0%, ${stat.from}15, transparent 70%)` }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
            style={{
              background: `${stat.from}12`,
              border: `1px solid ${stat.from}20`,
              boxShadow: `0 0 15px ${stat.from}10`,
            }}
          >
            <stat.icon size={16} style={{ color: stat.from }} />
          </div>
          <Sparkline color={stat.from} />
        </div>

        <p
          className="text-2xl font-black tracking-tight leading-none mb-1"
          style={{
            background: `linear-gradient(135deg, ${stat.from}, ${stat.to})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          <Counter target={typeof stat.value === "string" ? parseInt(stat.value) : stat.value} suffix={stat.suffix || ""} />
        </p>

        <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          {stat.label}
        </p>
      </div>
    </motion.div>
  );
}

export default function ProfileStats({ postCount = 0 }) {
  const stats = [
    { label: "Total Posts",  value: postCount,                                          icon: Package,      from: "#7c3aed", to: "#22d3ee", suffix: "" },
    { label: "Resolved",     value: Math.max(0, Math.round(postCount * 0.4)),           icon: CheckCircle2, from: "#10b981", to: "#34d399", suffix: "" },
    { label: "Reputation",   value: Math.max(0, 120 + postCount * 5),                  icon: TrendingUp,   from: "#3b82f6", to: "#60a5fa", suffix: "" },
    { label: "Success Rate", value: postCount > 0 ? Math.round(0.4 * 100) : 0,         icon: Award,        from: "#f59e0b", to: "#fbbf24", suffix: "%" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((s, i) => <StatCard key={s.label} stat={s} index={i} />)}
    </div>
  );
}
