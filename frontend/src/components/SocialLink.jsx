import { motion } from "framer-motion";

function SocialLink({ url, icon: Icon, label }) {
  const hasUrl = url && url.trim().length > 0;

  const sharedClasses =
    "p-3 rounded-xl block transition-all duration-300 backdrop-blur-xl";

  if (!hasUrl) {
    return (
      <div className="group relative">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`${sharedClasses} opacity-40 cursor-not-allowed border border-gray-200 bg-gray-50 dark:border-white/5 dark:bg-white/[0.02]`}
        >
          <Icon className="text-xl" style={{ color: "var(--muted)" }} />
        </motion.div>
        <div
          className="absolute -top-10 left-1/2 -translate-x-1/2 text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none z-50 shadow-lg backdrop-blur-xl"
          style={{
            backgroundColor: "rgba(15,23,42,0.9)",
            border: "1px solid rgba(255,255,255,0.06)",
            color: "var(--text-muted)",
          }}
        >
          Not added
        </div>
      </div>
    );
  }

  return (
    <div className="group relative">
      <motion.a
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${sharedClasses} border border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] dark:hover:border-white/20`}
        style={{ color: "var(--muted)" }}
      >
        <Icon className="text-xl transition-colors duration-200 group-hover:text-purple-400" />
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: "radial-gradient(circle at center, rgba(124,58,237,0.08) 0%, transparent 70%)",
          }}
        />
      </motion.a>
      <div
        className="absolute -top-10 left-1/2 -translate-x-1/2 text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none z-50 shadow-lg backdrop-blur-xl"
        style={{
          backgroundColor: "rgba(15,23,42,0.9)",
          border: "1px solid rgba(255,255,255,0.06)",
          color: "var(--text-muted)",
        }}
      >
        Open {label} Profile
      </div>
    </div>
  );
}

export default SocialLink;
