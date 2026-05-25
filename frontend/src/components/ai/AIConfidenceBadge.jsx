import { confidenceLabel, verificationStatusLabel, getMatchColors } from "../../utils/aiMatch";
import { FiCpu, FiShield, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";

const ICONS = {
  high: FiCheckCircle,
  medium: FiShield,
  low: FiAlertTriangle,
  very_low: FiAlertTriangle,
};

export default function AIConfidenceBadge({
  confidenceLevel,
  verificationStatus,
  percentage,
  compact = false,
}) {
  const colors = getMatchColors(percentage ?? 0);
  const Icon = ICONS[confidenceLevel] || FiCpu;

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${colors.badge}`}
      >
        <FiCpu size={10} />
        {percentage != null ? `${percentage}%` : confidenceLabel(confidenceLevel)}
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md ${colors.badge}`}
    >
      <Icon size={14} className="shrink-0" />
      <div className="leading-tight">
        <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">
          {verificationStatusLabel(verificationStatus)}
        </p>
        <p className="text-xs font-semibold">{confidenceLabel(confidenceLevel)}</p>
      </div>
    </div>
  );
}
