import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheckCircle } from "react-icons/fi";
import AIVerificationCard from "./AIVerificationCard";

export default function ClaimVerificationModal({ open, verification, claim, onClose, onContinue }) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-sm px-4"
        onClick={(e) => e.target === e.currentTarget && onClose?.()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
          className="w-full max-w-lg rounded-2xl border overflow-hidden"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border)",
            boxShadow: "0 25px 80px rgba(0,0,0,0.5)",
          }}
        >
          <div
            className="flex items-center justify-between px-5 py-4 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2">
              <FiCheckCircle className="text-emerald-400" size={20} />
              <h3 className="font-bold text-lg" style={{ color: "var(--text)" }}>
                Verification Complete
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              style={{ color: "var(--text-muted)" }}
              aria-label="Close"
            >
              <FiX size={18} />
            </button>
          </div>

          <div className="p-4 max-h-[70vh] overflow-y-auto">
            <AIVerificationCard verification={verification} claim={claim} />
          </div>

          <div className="px-5 py-4 border-t flex gap-3" style={{ borderColor: "var(--border)" }}>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
            >
              Close
            </button>
            <button
              type="button"
              onClick={onContinue || onClose}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Done
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
