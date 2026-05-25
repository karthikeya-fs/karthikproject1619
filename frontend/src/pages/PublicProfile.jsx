import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowLeft, FiUser, FiPhone, FiBookOpen, FiHash,
  FiMail, FiCheckCircle, FiShield, FiActivity, FiAward,
  FiGithub, FiLinkedin,
} from "react-icons/fi";
import { Package, CheckCircle2, TrendingUp, Award } from "lucide-react";
import API, { assetUrl } from "../services/api.jsx";
import AnimatedBackground from "../components/ui/AnimatedBackground";

function StatCard({ label, value, color, icon: Icon }) {
  return (
    <div className="glass-card-premium rounded-2xl p-4">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
        style={{ background: `${color}15`, border: `1px solid ${color}25` }}
      >
        <Icon size={15} style={{ color }} />
      </div>
      <p className="text-2xl font-black" style={{ color }}>{value}</p>
      <p className="text-[11px] font-semibold uppercase tracking-wider mt-1" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
    </div>
  );
}

function ReadField({ label, value, icon: Icon, verified }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-widest mb-2 block" style={{ color: "var(--text-muted)" }}>
        {label}
      </label>
      <div className="cosmic-input flex items-center gap-3 px-4 py-3">
        <Icon className="text-base flex-shrink-0" style={{ color: "var(--muted)" }} />
        <span className="text-sm flex-1" style={{ color: value ? "var(--text)" : "var(--muted-light)" }}>
          {value || `No ${label.toLowerCase()}`}
        </span>
        {verified && <FiCheckCircle className="flex-shrink-0" style={{ color: "#10b981" }} />}
      </div>
    </div>
  );
}

export default function PublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get(`/auth/profile/${userId}`)
      .then((res) => setUser(res.data.user ?? res.data))
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden isolate" style={{ backgroundColor: "var(--bg-deep)" }}>
        <AnimatedBackground />
        <div className="p-6 space-y-6 relative z-10 animate-pulse pt-20">
          <div className="h-64 rounded-3xl bg-gray-200/60 dark:bg-white/[0.03] backdrop-blur-xl" />
          <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
            <div className="h-80 rounded-3xl bg-gray-200/60 dark:bg-white/[0.03] backdrop-blur-xl" />
            <div className="lg:col-span-2 h-64 rounded-3xl bg-gray-200/60 dark:bg-white/[0.03] backdrop-blur-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg-deep)" }}>
        <div className="text-center">
          <p className="text-lg font-semibold mb-4" style={{ color: "#f87171" }}>{error || "User not found"}</p>
          <button onClick={() => navigate(-1)} className="text-sm underline" style={{ color: "var(--text-muted)" }}>Go back</button>
        </div>
      </div>
    );
  }

  const postCount = user.postCount ?? 0;
  const resolved = Math.max(0, Math.round(postCount * 0.4));
  const reputation = Math.max(0, 120 + postCount * 5);
  const successRate = postCount > 0 ? 40 : 0;

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  const avatarUrl = user.profileImage ? assetUrl(user.profileImage) : null;

  return (
    <div className="relative min-h-screen overflow-hidden isolate" style={{ backgroundColor: "var(--bg-deep)" }}>
      <AnimatedBackground />
      <div className="noise-overlay" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 pt-16 pb-12"
      >
        {/* Back button */}
        <div className="px-4 sm:px-6 mb-4">
          <Link
            to={-1}
            onClick={(e) => { e.preventDefault(); navigate(-1); }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm backdrop-blur-xl border transition-all duration-200"
            style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)", color: "var(--text-muted)" }}
          >
            <FiArrowLeft className="text-xs" /> Back
          </Link>
        </div>

        {/* ── HERO HEADER ── */}
        <div className="relative h-48 sm:h-56 overflow-hidden isolate mx-0">
          <div className="absolute inset-0" style={{ backgroundColor: "var(--bg-deep)" }} />
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -left-1/4 w-[140%] h-[200%]"
              style={{ background: "radial-gradient(ellipse at 30% 40%, rgba(124,58,237,0.25) 0%, transparent 60%)", filter: "blur(50px)" }} />
            <div className="absolute -top-1/4 right-0 w-[120%] h-[180%]"
              style={{ background: "radial-gradient(ellipse at 70% 30%, rgba(6,182,212,0.15) 0%, transparent 55%)", filter: "blur(60px)" }} />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-16" style={{ background: "linear-gradient(to bottom, transparent, var(--bg-deep))" }} />
        </div>

        {/* Avatar + info row */}
        <div className="relative px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-end sm:gap-8">

            {/* Avatar — no upload overlay */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex-shrink-0"
            >
              <div className="absolute -inset-[4px] rounded-full"
                style={{ background: "conic-gradient(from 0deg, #7c3aed, #06b6d4, #3b82f6, #7c3aed)", filter: "blur(3px)" }} />
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full p-[3px] z-10"
                style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6, #06b6d4)" }}>
                <div className="w-full h-full rounded-full overflow-hidden" style={{ backgroundColor: "#080e1a" }}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #0c0124, #080e1a)" }}>
                      <FiUser className="text-4xl" style={{ color: "rgba(255,255,255,0.2)" }} />
                    </div>
                  )}
                </div>
              </div>
              {user.isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 z-30 flex items-center justify-center w-7 h-7 rounded-full"
                  style={{ backgroundColor: "var(--bg-deep)" }}>
                  <div className="w-[18px] h-[18px] rounded-full bg-emerald-400"
                    style={{ boxShadow: "0 0 10px rgba(52,211,153,0.8)" }} />
                </div>
              )}
            </motion.div>

            {/* Name + badges */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-center sm:text-left flex-1 min-w-0 pb-2"
            >
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight truncate neon-text">
                {user.name}
              </h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-3">
                {user.isVerified && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold backdrop-blur-xl"
                    style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)", color: "#a78bfa" }}>
                    <FiShield size={10} /> Verified
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold backdrop-blur-xl"
                  style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)", color: "#22d3ee" }}>
                  👁 View Only
                </span>
                {memberSince && (
                  <span className="inline-flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
                    📅 Since {memberSince}
                  </span>
                )}
              </div>
            </motion.div>

            {/* Send Message button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/messages?userId=${userId}`)}
              className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm flex items-center gap-2 shadow-lg shrink-0"
              style={{ background: "linear-gradient(135deg, #1d9e75, #0d7a5a)" }}
            >
              💬 Send Message
            </motion.button>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">

            {/* LEFT — Analytics + Achievements */}
            <div className="space-y-6">
              <div className="glass-card-premium p-5">
                <div className="flex items-center gap-2 mb-4">
                  <FiActivity className="text-sm" style={{ color: "#a78bfa" }} />
                  <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    Analytics
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <StatCard label="Total Posts"  value={postCount}       color="#7c3aed" icon={Package} />
                  <StatCard label="Resolved"     value={resolved}        color="#10b981" icon={CheckCircle2} />
                  <StatCard label="Reputation"   value={reputation}      color="#3b82f6" icon={TrendingUp} />
                  <StatCard label="Success Rate" value={`${successRate}%`} color="#f59e0b" icon={Award} />
                </div>
              </div>

              {/* Static achievements */}
              <div className="glass-card-premium p-5">
                <div className="flex items-center gap-2 mb-4">
                  <FiAward className="text-sm" style={{ color: "#a78bfa" }} />
                  <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    Achievements
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Trusted Finder", color: "#22d3ee" },
                    { label: "Verified User",  color: "#a78bfa" },
                    { label: "Early Adopter",  color: "#34d399" },
                  ].map((badge) => (
                    <span key={badge.label}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
                      style={{ background: `${badge.color}12`, border: `1px solid ${badge.color}20`, color: badge.color }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: badge.color }} />
                      {badge.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT — Profile Details (read-only) */}
            <div className="lg:col-span-2">
              <div className="glass-card-premium p-6 sm:p-8">
                <div className="mb-8">
                  <h2 className="text-xl font-bold tracking-tight neon-text">Profile Details</h2>
                  <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Public profile information</p>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <ReadField label="Full Name"   value={user.name}         icon={FiUser} />
                  <ReadField label="Phone"       value={user.phone}        icon={FiPhone} />
                  <ReadField label="Department"  value={user.department}   icon={FiBookOpen} />
                  <ReadField label="Roll Number" value={user.rollNumber}   icon={FiHash} />
                </div>

                <div className="mt-5">
                  <ReadField label="Email" value={user.email} icon={FiMail} verified={user.isVerified} />
                </div>

                {(user.github || user.linkedin) && (
                  <div className="mt-8 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
                    <label className="text-xs font-semibold uppercase tracking-widest mb-3 block" style={{ color: "var(--text-muted)" }}>
                      Social Profiles
                    </label>
                    <div className="flex items-center gap-3">
                      {user.github && (
                        <a href={user.github} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
                          style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--text)" }}>
                          <FiGithub /> GitHub ↗
                        </a>
                      )}
                      {user.linkedin && (
                        <a href={user.linkedin} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
                          style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "#60a5fa" }}>
                          <FiLinkedin /> LinkedIn ↗
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
