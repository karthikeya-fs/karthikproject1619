import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  FiX,
  FiUser,
  FiMail,
  FiHash,
  FiFileText,
  FiCpu,
  FiShield,
  FiCheckCircle,
  FiMessageSquare,
  FiRefreshCw,
  FiEdit2,
  FiSend,
} from "react-icons/fi";
import API from "../services/api";
import { getStoredUserProfile } from "../utils/authStorage";
import ClaimVerificationModal from "./ai/ClaimVerificationModal";

const STEPS = ["Details", "Verify", "OTP", "Done"];

const overlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const panel = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
  exit: { opacity: 0, scale: 0.95, y: 20 },
};

function ClaimModal({ item, onClose, onSuccess }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const [details, setDetails] = useState({ name: "", email: "", rollNumber: "", additionalDetails: "" });
  const [answers, setAnswers] = useState(["", ""]);
  const [editingQ, setEditingQ] = useState([false, false]);
  const [editedQuestions, setEditedQuestions] = useState(["", ""]);
  const [loadingAI, setLoadingAI] = useState(false);

  const [otp, setOtp] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const timerRef = useRef(null);
  const otpRefs = useRef([]);
  const otpContainerRef = useRef(null);

  const [busy, setBusy] = useState(false);
  const [claimVerification, setClaimVerification] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  useEffect(() => {
    const profile = getStoredUserProfile();
    if (profile) {
      setDetails((p) => ({
        ...p,
        name: profile.name || "",
        email: profile.email || "",
      }));
    }
  }, []);

  useEffect(() => {
    if (otpTimer > 0) {
      timerRef.current = setTimeout(() => setOtpTimer((t) => t - 1), 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [otpTimer]);

  // Auto-focus first OTP input when step reaches 2
  useEffect(() => {
    if (step === 2 && otpRefs.current[0]) {
      otpRefs.current[0].focus();
    }
  }, [step]);

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    if (!details.name.trim() || !details.email.trim() || !details.rollNumber.trim()) {
      return toast.error("Please fill all required fields.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) {
      return toast.error("Enter a valid email address.");
    }

    setLoadingAI(true);
    try {
      const res = await API.post("/ai/generate-questions", {
        description: item.description,
      });
      const qs = res.data.questions || [];
      setEditedQuestions([qs[0] || "", qs[1] || ""]);
      setAnswers(["", ""]);
      setStep(1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not generate questions.");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleAnswersSubmit = async (e) => {
    e.preventDefault();
    const filled = editedQuestions.filter((q) => q.trim()).length;
    if (filled > 0) {
      const unanswered = editedQuestions.some((q, i) => q.trim() && !answers[i].trim());
      if (unanswered) return toast.error("Please answer all verification questions.");
    }
    await sendOtp();
  };

  const sendOtp = useCallback(async () => {
    setBusy(true);
    try {
      await API.post("/claims/send-otp", {
        email: details.email,
        itemId: item._id,
      });
      setOtpTimer(60);
      setOtp("");
      setStep(2);
      toast.success("OTP sent to your email!");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send OTP.";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }, [details.email, item._id]);

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (otp.trim().length !== 6) return toast.error("Enter the 6-digit OTP.");

    setVerifying(true);
    try {
      await API.post("/claims/verify-otp", { email: details.email, otp: otp.trim() });

      const finalQuestions = editedQuestions.filter((q) => q.trim());
      const finalAnswers = answers.slice(0, finalQuestions.length);

      const createRes = await API.post("/claims/create", {
        itemId: item._id,
        message: details.additionalDetails.trim() || "Claim submitted via verification flow.",
        rollNumber: details.rollNumber.trim(),
        aiQuestions: finalQuestions,
        verificationAnswers: finalAnswers,
        otpVerified: true,
      });

      const verification =
        createRes.data?.verification ||
        (createRes.data?.claim
          ? {
              aiMatchPercentage: createRes.data.claim.aiMatchPercentage,
              confidenceLevel: createRes.data.claim.confidenceLevel,
              verificationStatus: createRes.data.claim.verificationStatus,
              aiSummary: createRes.data.claim.aiSummary,
              aiRecommendation: createRes.data.claim.aiRecommendation,
              matchedFields: createRes.data.claim.matchedFields,
              imageVerification: createRes.data.claim.imageVerification,
            }
          : null);
      setClaimVerification(verification);
      toast.success("Claim verified & submitted successfully!");
      setShowVerificationModal(true);
      setStep(3);
      onSuccess?.();
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || "Verification failed.";
      if (status === 400) {
        if (msg.toLowerCase().includes("expired")) {
          toast.error("OTP has expired. Please request a new one.");
        } else if (msg.toLowerCase().includes("not found")) {
          toast.error("OTP not found. Please request a new one.");
        } else {
          toast.error("Invalid OTP. Please check and try again.");
        }
      } else {
        toast.error(msg);
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = (e.clipboardData?.getData("text") || "").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      e.preventDefault();
      setOtp(pasted);
      otpRefs.current[5]?.focus();
    }
  };

  const handleOtpChange = (i, val) => {
    const digit = val.replace(/\D/, "");
    const arr = otp.split("");
    arr[i] = digit;
    const next = arr.join("").slice(0, 6);
    setOtp(next);
    if (digit && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      otpRefs.current[i - 1]?.focus();
    }
  };

  const openChat = async () => {
    setBusy(true);
    try {
      const res = await API.post("/chat/create-room", { itemId: item._id });
      const roomId = res.data?.room?._id;
      if (roomId) {
        onClose();
        navigate(`/messages/${roomId}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Chat not available yet — wait for finder approval.");
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    "w-full bg-[var(--input-bg)] border border-[var(--input-border)] focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none rounded-xl py-2.5 pl-10 pr-4 text-sm transition placeholder-gray-500";
  const btnPrimary =
    "w-full py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2 text-sm";
  const btnSecondary =
    "flex-1 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] text-sm transition";

  if (!item?._id) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="claim-overlay"
        variants={overlay}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          variants={panel}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-lg glass-card overflow-hidden"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 pt-6 pb-4"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <div>
              <h2 className="font-bold text-lg" style={{ color: "var(--text)" }}>Claim This Item</h2>
              <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "var(--text-muted)" }}>{item.title}</p>
            </div>
            <button onClick={onClose} className="p-1 transition" style={{ color: "var(--muted)" }}>
              <FiX size={20} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-1 px-6 py-3" style={{ backgroundColor: "var(--bg)" }}>
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-1 flex-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                    i < step
                      ? "bg-cyan-500 text-black"
                      : i === step
                      ? "bg-cyan-500/20 border border-cyan-500 text-cyan-400"
                      : "border text-gray-500"
                  }`}
                  style={i > step ? { backgroundColor: "var(--input-bg)", borderColor: "var(--border)" } : {}}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={`text-[10px] font-semibold ${i === step ? "text-cyan-400" : ""}`}
                  style={i !== step ? { color: "var(--text-muted)" } : {}}>
                  {label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-1 ${i < step ? "bg-cyan-500/50" : ""}`}
                    style={i >= step ? { backgroundColor: "var(--border)" } : {}} />
                )}
              </div>
            ))}
          </div>

          {/* Step content */}
          <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
            {/* ── STEP 0: Claimant Details ── */}
            {step === 0 && (
              <form onSubmit={handleDetailsSubmit} className="space-y-4">
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Fill in your details to start the claim process.</p>

                <div className="relative">
                  <FiUser className="absolute top-1/2 left-3 -translate-y-1/2 text-cyan-400 text-sm" />
                  <input type="text" placeholder="Full Name *" value={details.name}
                    onChange={(e) => setDetails((p) => ({ ...p, name: e.target.value }))} required className={inputCls}
                    style={{ color: "var(--text)" }} />
                </div>

                <div className="relative">
                  <FiMail className="absolute top-1/2 left-3 -translate-y-1/2 text-cyan-400 text-sm" />
                  <input type="email" placeholder="Student Email *" value={details.email}
                    onChange={(e) => setDetails((p) => ({ ...p, email: e.target.value }))} required className={inputCls}
                    style={{ color: "var(--text)" }} />
                </div>

                <div className="relative">
                  <FiHash className="absolute top-1/2 left-3 -translate-y-1/2 text-cyan-400 text-sm" />
                  <input type="text" placeholder="Roll Number *" value={details.rollNumber}
                    onChange={(e) => setDetails((p) => ({ ...p, rollNumber: e.target.value }))} required className={inputCls}
                    style={{ color: "var(--text)" }} />
                </div>

                <div className="relative">
                  <FiFileText className="absolute top-3 left-3 text-cyan-400 text-sm" />
                  <textarea placeholder="Additional details (optional) — e.g. unique marks, what's inside..."
                    value={details.additionalDetails}
                    onChange={(e) => setDetails((p) => ({ ...p, additionalDetails: e.target.value }))}
                    rows={3} className={inputCls.replace("pl-10", "pl-10")} style={{ color: "var(--text)", resize: "none" }} />
                </div>

                <button type="submit" disabled={loadingAI} className={btnPrimary}>
                  {loadingAI ? (
                    <><FiCpu className="animate-spin" /> Generating AI Questions...</>
                  ) : (
                    <><FiCpu /> Continue to Verification</>
                  )}
                </button>
              </form>
            )}

            {/* ── STEP 1: AI Verification Questions ── */}
            {step === 1 && (
              <form onSubmit={handleAnswersSubmit} className="space-y-5">
                <div className="flex items-start gap-2 rounded-xl p-3"
                  style={{ backgroundColor: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.2)" }}>
                  <FiShield className="text-cyan-400 mt-0.5 shrink-0" />
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Answer these AI-generated questions to prove ownership. Only the real owner would know these details.
                  </p>
                </div>

                {editedQuestions.map((q, i) =>
                  q.trim() ? (
                    <div key={i} className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold text-xs mt-0.5 shrink-0">Q{i + 1}.</span>
                        {editingQ[i] ? (
                          <input type="text" value={editedQuestions[i]}
                            onChange={(e) => {
                              const updated = [...editedQuestions];
                              updated[i] = e.target.value;
                              setEditedQuestions(updated);
                            }}
                            onBlur={() => { const u = [...editingQ]; u[i] = false; setEditingQ(u); }}
                            autoFocus
                            className="flex-1 rounded-lg px-3 py-1.5 text-xs outline-none"
                            style={{ backgroundColor: "var(--surface-strong)", border: "1px solid rgba(6,182,212,0.4)", color: "var(--text)" }} />
                        ) : (
                          <span className="flex-1 text-sm" style={{ color: "var(--text)" }}>{editedQuestions[i]}</span>
                        )}
                        <button type="button" title="Edit question"
                          onClick={() => { const u = [...editingQ]; u[i] = !u[i]; setEditingQ(u); }}
                          className="shrink-0 transition" style={{ color: "var(--muted)" }}>
                          <FiEdit2 size={13} />
                        </button>
                      </div>

                      <input type="text" placeholder="Your answer..." value={answers[i]}
                        onChange={(e) => { const u = [...answers]; u[i] = e.target.value; setAnswers(u); }}
                        required className="w-full rounded-xl py-2.5 px-4 text-sm outline-none transition placeholder-gray-500"
                        style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--text)" }} />
                    </div>
                  ) : null
                )}

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setStep(0)} className={btnSecondary}>Back</button>
                  <button type="submit" disabled={busy} className={btnPrimary}>
                    {busy ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <><FiSend size={14} /> Send OTP</>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* ── STEP 2: OTP Verification ── */}
            {step === 2 && (
              <form onSubmit={handleOtpSubmit} className="space-y-5">
                <div className="text-center space-y-1">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
                    style={{ backgroundColor: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.3)" }}>
                    <FiMail className="text-cyan-400 text-2xl" />
                  </div>
                  <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>Check your email</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    A 6-digit OTP was sent to <span className="text-cyan-400">{details.email}</span>
                  </p>
                </div>

                {/* OTP input — 6 individual boxes with paste support */}
                <div
                  ref={otpContainerRef}
                  className="flex justify-center gap-2"
                  onPaste={handleOtpPaste}
                >
                  {Array.from({ length: 6 }).map((_, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otp[i] || ""}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      autoComplete="one-time-code"
                      className="w-11 h-13 sm:w-12 sm:h-14 text-center text-lg font-bold rounded-xl outline-none transition-all duration-150"
                      style={{
                        backgroundColor: "var(--input-bg)",
                        border: `2px solid ${otp[i] ? "var(--accent)" : "var(--input-border)"}`,
                        color: "var(--text)",
                        caretColor: "var(--accent)",
                      }}
                    />
                  ))}
                </div>

                {/* Resend */}
                <div className="text-center">
                  {otpTimer > 0 ? (
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Resend in {otpTimer}s</p>
                  ) : (
                    <button type="button" onClick={sendOtp} disabled={busy}
                      className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center gap-1 mx-auto transition">
                      <FiRefreshCw size={12} /> Resend OTP
                    </button>
                  )}
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className={btnSecondary}>Back</button>
                  <button type="submit" disabled={verifying || otp.length < 6} className={btnPrimary}>
                    {verifying ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <><FiShield size={14} /> Verify & Submit</>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* ── STEP 3: Success ── */}
            {step === 3 && (
              <div className="text-center space-y-5 py-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                  style={{ backgroundColor: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)" }}
                >
                  <FiCheckCircle className="text-emerald-400 text-4xl" />
                </motion.div>

                <div>
                  <h3 className="font-bold text-lg" style={{ color: "var(--text)" }}>Claim Submitted!</h3>
                  <p className="text-xs mt-1 max-w-xs mx-auto" style={{ color: "var(--text-muted)" }}>
                    Your claim is pending review by the finder. You'll be notified once it's approved.
                    After approval, you can chat securely with the finder.
                  </p>
                </div>

                {claimVerification && (
                  <button
                    type="button"
                    onClick={() => setShowVerificationModal(true)}
                    className="w-full py-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm font-semibold hover:bg-cyan-500/15 transition"
                  >
                    View AI Match ({claimVerification.aiMatchPercentage}%)
                  </button>
                )}

                <div className="flex flex-col gap-3">
                  <button type="button" onClick={openChat} disabled={busy}
                    className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2 text-sm">
                    <FiMessageSquare size={14} /> Open Secure Chat
                  </button>
                  <button type="button" onClick={onClose}
                    className="w-full py-2.5 rounded-xl border text-sm transition"
                    style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      <ClaimVerificationModal
        open={showVerificationModal}
        verification={claimVerification}
        onClose={() => setShowVerificationModal(false)}
        onContinue={() => {
          setShowVerificationModal(false);
          onClose();
        }}
      />
    </AnimatePresence>
  );
}

export default ClaimModal;
