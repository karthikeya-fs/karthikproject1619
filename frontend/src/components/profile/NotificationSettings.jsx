import { motion } from "framer-motion";
import { Mail, Smartphone, Calendar } from "lucide-react";

const TOGGLES = [
  { title: "Email Alerts",        key: "emailAlerts",       icon: Mail,        desc: "Receive email notifications",          color: "#7c3aed" },
  { title: "Push Notifications",  key: "pushNotifications", icon: Smartphone,  desc: "Get push notifications on your device", color: "#3b82f6" },
  { title: "Weekly Summary",      key: "weeklySummary",     icon: Calendar,    desc: "Weekly digest of your activity",        color: "#22d3ee" },
];

function NeonToggle({ checked, color, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="relative flex-shrink-0 w-12 h-6 rounded-full transition-all duration-300 focus:outline-none"
      style={{
        background: checked
          ? `linear-gradient(135deg, ${color}, ${color}cc)`
          : "var(--toggle-off-bg)",
        border: `1px solid ${checked ? color + "60" : "var(--toggle-off-border)"}`,
        boxShadow: checked ? `0 0 16px ${color}40` : "none",
      }}
    >
      <motion.div
        animate={{ x: checked ? 24 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white"
        style={{ boxShadow: checked ? `0 0 8px ${color}80` : "0 1px 3px rgba(0,0,0,0.3)" }}
      />
    </button>
  );
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const rowAnim = {
  hidden: { y: 14, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 26 } },
};

export default function NotificationSettings({ notifications, onToggle }) {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
      {TOGGLES.map((t) => {
        const active = notifications[t.key];
        return (
          <motion.div
            key={t.key}
            variants={rowAnim}
            whileHover={{ x: 2 }}
            className="flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-200 group glass-card-premium"
            onClick={() => onToggle(t.key)}
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Icon badge */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
                style={{
                  background: active ? `${t.color}15` : "var(--icon-badge-bg)",
                  border: `1px solid ${active ? t.color + "25" : "var(--icon-badge-border)"}`,
                  boxShadow: active ? `0 0 14px ${t.color}25` : "none",
                }}
              >
                <t.icon size={15} style={{ color: active ? t.color : "var(--text-muted)" }} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{t.title}</p>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>{t.desc}</p>
              </div>
            </div>

            <NeonToggle checked={active} color={t.color} onChange={() => onToggle(t.key)} />
          </motion.div>
        );
      })}
      <p className="text-[11px] text-center pt-2" style={{ color: "var(--text-muted)" }}>
        Preferences are saved on this device.
      </p>
    </motion.div>
  );
}
