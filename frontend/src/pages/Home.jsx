import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  ShieldCheck,
  MessageCircle,
  Users,
  CheckCircle2,
  LayoutGrid,
  ArrowRight,
  Zap,
  TrendingUp,
} from "lucide-react";
import API from "../services/api";
import ItemCard from "../components/ItemCard";
import { FloatingPaths } from "../components/ui/background-paths";
import { useThemeMode, useReducedMotion } from "../hooks/useThemeMode";
import { useMouseGlow } from "../hooks/useMouseGlow";

// ─── Fade/slide variants ────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay },
});

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.6, delay },
});

// ─── Stats data ──────────────────────────────────────────────────────────────
const STAT_ICONS = [
  { key: "itemsReturned", label: "Returned",  icon: CheckCircle2, color: "text-emerald-500" },
  { key: "totalItems",    label: "Total Posts", icon: LayoutGrid,   color: "text-cyan-500"    },
  { key: "openItems",     label: "Open Cases",  icon: TrendingUp,   color: "text-amber-500"   },
  { key: "totalUsers",    label: "Community",   icon: Users,        color: "text-violet-500"  },
];

// ─── Feature cards ───────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: ShieldCheck,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    title: "Secure Claim Verification",
    desc: "AI-powered questions and OTP verification ensure only the real owner can claim an item.",
  },
  {
    icon: MessageCircle,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    title: "Real-time Messaging",
    desc: "Chat directly with the finder or claimant through our built-in secure messaging system.",
  },
  {
    icon: Search,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    title: "Fast Smart Search",
    desc: "Filter by category, location, and date to find your item in seconds.",
  },
  {
    icon: Users,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    title: "Campus Community",
    desc: "A trusted network of students helping each other recover lost belongings every day.",
  },
];

// ─── Main component ──────────────────────────────────────────────────────────
export default function Home() {
  const isDark = useThemeMode();
  const reduced = useReducedMotion();
  const { glowRef, parallaxRef } = useMouseGlow(!reduced);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [recentItems, setRecentItems] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [recentError, setRecentError] = useState(null);

  useEffect(() => {
    setStatsLoading(true);
    API.get("/stats/public")
      .then((r) => setStats(r.data))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));

    setRecentLoading(true);
    setRecentError(null);
    API.get("/items/search?type=found&sort=newest&limit=6&page=1")
      .then((r) => {
        setRecentItems(r.data?.items ?? []);
      })
      .catch((err) => {
        setRecentItems([]);
        setRecentError(err.response?.data?.message || "Could not load recent items.");
      })
      .finally(() => setRecentLoading(false));
  }, []);

  return (
    <div
      className="relative min-h-screen overflow-x-hidden bg-white dark:bg-black"
      style={{ color: "var(--text)" }}
    >
      <div className="relative z-30">
        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="relative min-h-[80vh] w-full flex items-center justify-center overflow-hidden pt-28 pb-16 px-4 bg-white dark:bg-black border-b border-gray-100 dark:border-white/5">
          <div className="absolute inset-0 z-0">
            <FloatingPaths position={1} />
            <FloatingPaths position={-1} />
          </div>
          
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            {/* Badge */}
            <motion.div {...fadeIn(0.1)} className="inline-flex items-center gap-2 mb-6">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
                style={{
                  backgroundColor: "var(--badge-bg)",
                  borderColor: "var(--badge-border)",
                  color: "var(--badge-text)",
                }}
              >
                <Zap size={11} />
                Campus Lost &amp; Found Network
              </span>
            </motion.div>

            {/* Heading — constrained, no overflow */}
            <motion.h1
              {...fadeUp(0.15)}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6"
              style={{ color: "var(--text)" }}
            >
              Reconnect with{" "}
              <span
                className="bg-clip-text text-transparent home-gradient-text"
                style={{
                  backgroundImage: isDark
                    ? "linear-gradient(135deg, #22d3ee, #818cf8, #a78bfa, #22d3ee)"
                    : "linear-gradient(135deg, var(--banner-from), var(--banner-via), var(--banner-to))",
                }}
              >
                what you lost
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              {...fadeUp(0.25)}
              className="text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-8 text-gray-500 dark:text-neutral-400"
            >
              A smart and secure platform helping students find lost belongings
              across campus quickly and safely.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              {...fadeUp(0.35)}
              className="flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <Link
                to="/found-items"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 shadow-lg"
                style={{
                  background: "linear-gradient(135deg, var(--banner-from), var(--banner-via))",
                  boxShadow: "0 4px 20px var(--glow-ring)",
                }}
              >
                Explore Lost Items
                <ArrowRight size={15} />
              </Link>
              <Link
                to="/post-item"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 border"
                style={{
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                Post Found Item
              </Link>
            </motion.div>
          </div>
        </section>


      {/* ── STATS ────────────────────────────────────────────────────────── */}
      {(statsLoading || stats) && (
        <section className="relative px-4 pb-16">
          <motion.div
            {...fadeUp(0.4)}
            className="max-w-3xl mx-auto rounded-2xl border p-6"
            style={{
              backgroundColor: "var(--glass-bg)",
              borderColor: "var(--glass-border)",
              backdropFilter: "blur(20px)",
              boxShadow: "var(--shadow)",
            }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {statsLoading ? (
                <div className="col-span-full flex justify-center py-4">
                  <div
                    className="w-8 h-8 border-2 rounded-full animate-spin"
                    style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
                  />
                </div>
              ) : (
                STAT_ICONS.map(({ key, label, icon: Icon, color }) => (
                  <div key={key} className="text-center group">
                    <div className="flex items-center justify-center mb-2">
                      <Icon size={20} className={color} />
                    </div>
                    <p className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--text)" }}>
                      {stats?.[key] ?? "—"}
                    </p>
                    <p className="text-xs mt-0.5 font-medium" style={{ color: "var(--text-muted)" }}>
                      {label}
                    </p>
                  </div>
                ))
              )}
            </div>
            {stats?.encouragement && (
              <p className="text-center text-xs mt-5 pt-4 border-t" style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}>
                {stats.encouragement}
              </p>
            )}
          </motion.div>
        </section>
      )}



      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section className="relative px-4 pb-20">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp(0.1)} className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3" style={{ color: "var(--text)" }}>
              Why use Lost &amp; Found?
            </h2>
            <p className="text-sm max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
              Built for students, by students — with the tools you need to recover what matters.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                {...fadeUp(0.08 * i)}
                className="group rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 cursor-default"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  boxShadow: "var(--shadow-sm)",
                }}
                whileHover={{ boxShadow: "var(--shadow-lg)" }}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.bg}`}>
                  <f.icon size={20} className={f.color} />
                </div>
                <h3 className="font-semibold text-sm mb-2" style={{ color: "var(--text)" }}>
                  {f.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* ── RECENT ITEMS ─────────────────────────────────────────────────── */}
      <section className="relative px-4 pb-20">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp(0.1)} className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1" style={{ color: "var(--text)" }}>
                Recently Posted
              </h2>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Latest found items waiting to be claimed
              </p>
            </div>
            <Link
              to="/found-items"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
              style={{ color: "var(--accent)" }}
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </motion.div>

          {recentLoading ? (
            <div className="flex justify-center py-16">
              <div
                className="w-10 h-10 border-2 rounded-full animate-spin"
                style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
              />
            </div>
          ) : recentError ? (
            <div
              className="rounded-2xl border px-6 py-10 text-center"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
            >
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>{recentError}</p>
              <Link
                to="/found-items"
                className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold"
                style={{ color: "var(--accent)" }}
              >
                Browse found items
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : recentItems.length === 0 ? (
            <div
              className="rounded-2xl border px-6 py-10 text-center"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
            >
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                No found items posted yet. Be the first to help someone reunite with their belongings.
              </p>
              <Link
                to="/post-item"
                className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold"
                style={{ color: "var(--accent)" }}
              >
                Post a found item
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentItems.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
          )}

          <div className="mt-6 text-center sm:hidden">
            <Link
              to="/found-items"
              className="inline-flex items-center gap-1.5 text-sm font-semibold"
              style={{ color: "var(--accent)" }}
            >
              View all items
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer
        className="relative border-t py-10 px-4 backdrop-blur-xl"
        style={{
          backgroundColor: "color-mix(in srgb, var(--surface) 85%, transparent)",
          borderColor: "var(--border)",
        }}
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-extrabold tracking-tight" style={{ color: "var(--text)" }}>
              Lost<span className="text-cyan-500"> &amp; </span>Found
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Making campuses smarter, safer, and more connected.
            </p>
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            © {new Date().getFullYear()} Campus Lost &amp; Found Network
          </p>
        </div>
      </footer>
      </div>
    </div>
  );
}
