import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiCheck, FiMinus, FiImage } from "react-icons/fi";

function FieldRow({ field }) {
  const ok = field.matched;
  const partial = !ok && field.score >= 45;
  const Icon = ok ? FiCheck : FiMinus;
  const iconCls = ok
    ? "text-emerald-400 bg-emerald-500/15"
    : partial
      ? "text-amber-400 bg-amber-500/15"
      : "text-red-400/80 bg-red-500/10";

  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2 min-w-0">
        <span className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${iconCls}`}>
          <Icon size={12} />
        </span>
        <span className="text-xs text-gray-300 truncate">{field.label}</span>
      </div>
      <span className="text-[10px] font-mono text-white/40 tabular-nums">{field.score}%</span>
    </div>
  );
}

export default function VerificationInsights({
  matchedFields = [],
  imageVerification,
  aiSummary,
  aiRecommendation,
  defaultOpen = false,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition-colors"
      >
        <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
          Similarity Analysis
        </span>
        <FiChevronDown
          size={14}
          className={`text-white/50 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {aiSummary && (
                <p className="text-xs text-gray-400 leading-relaxed border-l-2 border-cyan-500/40 pl-3">
                  {aiSummary}
                </p>
              )}
              {matchedFields.length > 0 && (
                <div>
                  {matchedFields.map((f, i) => (
                    <FieldRow key={`${f.label}-${i}`} field={f} />
                  ))}
                </div>
              )}
              {imageVerification?.placeholder && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-white/5 border border-dashed border-white/10">
                  <FiImage className="text-cyan-400 shrink-0 mt-0.5" size={14} />
                  <p className="text-[10px] text-gray-500 leading-relaxed">
                    {imageVerification.note}
                  </p>
                </div>
              )}
              {aiRecommendation && (
                <p className="text-[10px] text-indigo-300/90 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-3 py-2">
                  {aiRecommendation}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
