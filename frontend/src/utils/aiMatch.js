/** Client helpers for AI verification UI (mirrors backend thresholds). */

export function getMatchTier(percentage) {
  const p = Number(percentage) || 0;
  if (p >= 90) return "excellent";
  if (p >= 70) return "good";
  if (p >= 50) return "moderate";
  return "low";
}

export function getMatchColors(percentage) {
  const tier = getMatchTier(percentage);
  const map = {
    excellent: {
      ring: "from-emerald-400 via-cyan-400 to-teal-400",
      glow: "rgba(6,182,212,0.45)",
      text: "text-cyan-400",
      badge: "bg-cyan-500/15 border-cyan-500/30 text-cyan-300",
    },
    good: {
      ring: "from-blue-400 via-indigo-400 to-purple-400",
      glow: "rgba(99,102,241,0.4)",
      text: "text-indigo-400",
      badge: "bg-indigo-500/15 border-indigo-500/30 text-indigo-300",
    },
    moderate: {
      ring: "from-amber-400 via-orange-400 to-amber-500",
      glow: "rgba(245,158,11,0.35)",
      text: "text-amber-400",
      badge: "bg-amber-500/15 border-amber-500/30 text-amber-300",
    },
    low: {
      ring: "from-red-400 via-rose-500 to-red-600",
      glow: "rgba(239,68,68,0.35)",
      text: "text-red-400",
      badge: "bg-red-500/15 border-red-500/30 text-red-300",
    },
  };
  return map[tier];
}

export function confidenceLabel(level) {
  const labels = {
    high: "High Confidence",
    medium: "Medium Confidence",
    low: "Low Confidence",
    very_low: "Very Low Confidence",
  };
  return labels[level] || "Pending Analysis";
}

export function verificationStatusLabel(status) {
  const labels = {
    auto_verified: "AI Verified",
    high_confidence: "High Confidence",
    needs_review: "Manual Review",
    low_match: "Low Match",
  };
  return labels[status] || "Pending";
}
