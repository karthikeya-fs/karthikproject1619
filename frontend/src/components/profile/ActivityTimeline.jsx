import { motion } from "framer-motion";
import { Package, Edit2, CheckCircle2, Clock, Bell } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";

const TYPE_CONFIG = {
  item_claimed: {
    icon: Package,
    color: "#7c3aed",
    tag: "Claimed",
  },
  claim_approved: {
    icon: CheckCircle2,
    color: "#10b981",
    tag: "Approved",
  },
  claim_rejected: {
    icon: Clock,
    color: "#ef4444",
    tag: "Rejected",
  },
  new_message: {
    icon: Edit2,
    color: "#3b82f6",
    tag: "Message",
  },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const row = {
  hidden: { x: -20, opacity: 0 },
  show: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 260, damping: 24 } },
};

export default function ActivityTimeline() {
  const { notifications, loading } = useNotifications();

  const activities = notifications.slice(0, 12).map((n) => {
    const config = TYPE_CONFIG[n.notificationType] || {
      icon: Bell,
      color: "#94a3b8",
      tag: "Update",
    };
    return {
      id: n._id,
      icon: config.icon,
      color: config.color,
      glow: `${config.color}66`,
      title: n.message,
      time: timeAgo(n.createdAt),
      tag: config.tag,
    };
  });

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div
          className="w-6 h-6 border-2 rounded-full animate-spin"
          style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div
        className="rounded-2xl border px-4 py-8 text-center glass-card-premium"
        style={{ borderColor: "var(--border)" }}
      >
        <Bell size={24} className="mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
        <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
          No activity yet
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          Post items, submit claims, or receive messages to see updates here.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        className="absolute left-[21px] top-4 bottom-4 w-[2px]"
        style={{
          background: "linear-gradient(to bottom, rgba(124,58,237,0.6), rgba(59,130,246,0.3), transparent)",
          boxShadow: "0 0 6px rgba(124,58,237,0.3)",
        }}
      />

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        {activities.map((a) => (
          <motion.div key={a.id} variants={row} className="relative flex items-start gap-3 group">
            <div className="relative z-10 flex-shrink-0">
              <motion.div
                whileHover={{ scale: 1.15, boxShadow: `0 0 16px ${a.glow}` }}
                className="w-[42px] h-[42px] rounded-xl flex items-center justify-center transition-all duration-200"
                style={{
                  background: `${a.color}12`,
                  border: `1px solid ${a.color}20`,
                  backdropFilter: "blur(12px)",
                }}
              >
                <a.icon size={15} style={{ color: a.color }} />
              </motion.div>
            </div>

            <motion.div
              whileHover={{ x: 3 }}
              className="flex-1 min-w-0 rounded-xl px-4 py-3 transition-all duration-300 glass-card-premium"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold leading-snug" style={{ color: "var(--text)" }}>
                  {a.title}
                </p>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 uppercase tracking-wider backdrop-blur-sm"
                  style={{ background: `${a.color}15`, color: a.color, border: `1px solid ${a.color}20` }}
                >
                  {a.tag}
                </span>
              </div>
              <p className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>{a.time}</p>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
