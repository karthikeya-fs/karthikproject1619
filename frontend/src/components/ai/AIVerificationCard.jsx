import { motion } from "framer-motion";
import { FiCpu, FiZap } from "react-icons/fi";
import MatchPercentageRing from "./MatchPercentageRing";
import AIConfidenceBadge from "./AIConfidenceBadge";
import VerificationInsights from "./VerificationInsights";

export default function AIVerificationCard({ verification, claim, compact = false }) {
  if (!verification && !claim?.aiMatchPercentage && claim?.aiMatchPercentage !== 0) {
    return null;
  }

  const data = verification || {
    aiMatchPercentage: claim.aiMatchPercentage,
    confidenceLevel: claim.confidenceLevel,
    verificationStatus: claim.verificationStatus,
    aiSummary: claim.aiSummary,
    aiRecommendation: claim.aiRecommendation,
    matchedFields: claim.matchedFields || [],
    imageVerification: claim.imageVerification,
  };

  const pct = data.aiMatchPercentage ?? 0;

  if (compact) {
    return (
      <div className="flex items-center gap-4 p-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/5">
        <MatchPercentageRing percentage={pct} size={72} stroke={6} />
        <div className="min-w-0 flex-1">
          <AIConfidenceBadge
            confidenceLevel={data.confidenceLevel}
            verificationStatus={data.verificationStatus}
            percentage={pct}
          />
          <p className="text-xs text-gray-400 mt-2 line-clamp-2">{data.aiSummary}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-2xl border border-cyan-500/25 overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(99,102,241,0.06) 50%, rgba(0,0,0,0.2) 100%)",
        boxShadow: "0 0 40px rgba(6,182,212,0.08), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-1/2 -right-1/4 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      <div className="relative p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <motion.span
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400"
            animate={{ boxShadow: ["0 0 0 rgba(6,182,212,0)", "0 0 20px rgba(6,182,212,0.4)", "0 0 0 rgba(6,182,212,0)"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <FiCpu size={16} />
          </motion.span>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              AI Verification
              <FiZap size={12} className="text-amber-400" />
            </h4>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Smart Match Engine</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <MatchPercentageRing percentage={pct} size={128} />
          <div className="flex-1 w-full space-y-3 text-center sm:text-left">
            <AIConfidenceBadge
              confidenceLevel={data.confidenceLevel}
              verificationStatus={data.verificationStatus}
              percentage={pct}
            />
            <p className="text-sm text-gray-300 leading-relaxed">{data.aiSummary}</p>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="rounded-lg bg-white/5 border border-white/10 px-2 py-1.5">
                <span className="text-gray-500 block">Match Strength</span>
                <span className="text-white font-bold">{pct}%</span>
              </div>
              <div className="rounded-lg bg-white/5 border border-white/10 px-2 py-1.5">
                <span className="text-gray-500 block">Status</span>
                <span className="text-cyan-400 font-bold capitalize">
                  {data.verificationStatus?.replace(/_/g, " ") || "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <VerificationInsights
            matchedFields={data.matchedFields}
            imageVerification={data.imageVerification}
            aiSummary={null}
            aiRecommendation={data.aiRecommendation}
            defaultOpen={pct < 85}
          />
        </div>
      </div>
    </motion.div>
  );
}
