import { useState, useEffect, useCallback, useRef } from "react";
import {
  FiUser, FiMail, FiPhone, FiBookOpen, FiBell,
  FiEdit2, FiSave, FiX, FiCheckCircle, FiArrowLeft,
  FiGithub, FiLinkedin, FiShield, FiActivity, FiHash,
  FiRefreshCw, FiCopy, FiUserCheck, FiAward,
} from "react-icons/fi";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import API, { assetUrl } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { updateStoredUserProfile } from "../utils/authStorage";
import SocialLink from "../components/SocialLink";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileStats from "../components/profile/ProfileStats";
import ActivityTimeline from "../components/profile/ActivityTimeline";
import NotificationSettings from "../components/profile/NotificationSettings";
import AnimatedBackground from "../components/ui/AnimatedBackground";

const GITHUB_REGEX = /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9._-]+\/?$/;
const LINKEDIN_REGEX = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9._-]+\/?$/;
const EMPTY_USER = { name: "", rollNumber: "", email: "", department: "", phone: "", github: "", linkedin: "", postCount: 0, createdAt: null };
const TOAST_ID = "profile-fetch";
const MAX_RETRIES = 3;

/* ── Skeleton ───────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="min-h-screen relative overflow-hidden isolate" style={{ backgroundColor: "var(--bg-deep)" }}>
      <AnimatedBackground />
      <div className="p-6 space-y-6 relative z-10 animate-pulse pt-16">
        <div className="h-64 rounded-3xl bg-gray-200/60 dark:bg-white/[0.03] backdrop-blur-xl" />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="h-80 rounded-3xl bg-gray-200/60 dark:bg-white/[0.03] backdrop-blur-xl" />
            <div className="h-40 rounded-3xl bg-gray-200/60 dark:bg-white/[0.03] backdrop-blur-xl" />
            <div className="h-64 rounded-3xl bg-gray-200/60 dark:bg-white/[0.03] backdrop-blur-xl" />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 rounded-3xl bg-gray-200/60 dark:bg-white/[0.03] backdrop-blur-xl" />
            <div className="h-64 rounded-3xl bg-gray-200/60 dark:bg-white/[0.03] backdrop-blur-xl" />
            <div className="h-56 rounded-3xl bg-gray-200/60 dark:bg-white/[0.03] backdrop-blur-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Background blobs ────────────────────────────────────────────── */
function BackgroundBlobs() {
  return <AnimatedBackground />;
}

/* ── Form Field ──────────────────────────────────────────────────── */
function FormField({ label, name, icon: Icon, value, editing, placeholder, onChange }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-widest mb-2 block" style={{ color: "var(--text-muted)" }}>
        {label}
      </label>
      <div className="cosmic-input flex items-center gap-3 px-4 py-3">
        <Icon className="text-base flex-shrink-0" style={{ color: "var(--muted)" }} />
        {editing ? (
          <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            className="bg-transparent outline-none w-full text-sm"
            style={{ color: "var(--text)" }}
            placeholder={placeholder}
          />
        ) : (
          <span className="text-sm" style={{ color: value ? "var(--text)" : "var(--muted-light)" }}>
            {value || `No ${label.toLowerCase()}`}
          </span>
        )}
        {!editing && name === "email" && <FiCheckCircle className="ml-auto flex-shrink-0" style={{ color: "#10b981" }} />}
      </div>
    </div>
  );
}

/* ── Social Edit Field ───────────────────────────────────────────── */
function SocialEditField({ label, name, icon: Icon, value, regex, placeholder, onChange }) {
  const showError = value.trim().length > 0 && !regex.test(value.trim());
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-widest mb-2 block" style={{ color: "var(--text-muted)" }}>
        {label} URL
      </label>
      <div
        className="cosmic-input flex items-center gap-3 px-4 py-3"
        style={showError ? { borderColor: "rgba(239,68,68,0.5)" } : {}}
      >
        <Icon className="text-base flex-shrink-0" style={{ color: showError ? "#f87171" : "var(--muted)" }} />
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          className="bg-transparent outline-none w-full text-sm"
          style={{ color: "var(--text)" }}
          placeholder={placeholder}
        />
      </div>
      {showError && (
        <p className="text-xs mt-1.5 ml-1" style={{ color: "#f87171" }}>
          Must start with https://{name === "github" ? "github.com/username" : "linkedin.com/in/username"}
        </p>
      )}
    </div>
  );
}

/* ── Error info ──────────────────────────────────────────────────── */
function deriveErrorInfo(err) {
  if (!err.response) {
    return { title: "Connection Error", message: "Unable to connect to profile service. Please check your connection and try again.", recoverable: true };
  }
  const status = err.response.status;
  if (status === 401) return { title: "Session Expired", message: "Your session has expired. Please log in again.", recoverable: false, redirectTo: "/login" };
  if (status === 404) return { title: "Profile Not Found", message: "Your profile is being prepared… If this persists, please contact support.", recoverable: true };
  if (status === 503) return { title: "Service Unavailable", message: "Profile service is temporarily unavailable. Please try again.", recoverable: true };
  const serverMsg = err.response?.data?.message;
  return { title: "Profile Error", message: serverMsg || "An unexpected error occurred. Please refresh or try again.", recoverable: true };
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

/* ── Main Profile Page ───────────────────────────────────────────── */
function Profile() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [profileImage, setProfileImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [user, setUser] = useState(EMPTY_USER);
  const [editData, setEditData] = useState({ name: "", rollNumber: "", department: "", phone: "", github: "", linkedin: "" });
  const [notifications, setNotifications] = useState(() => {
    try { return JSON.parse(localStorage.getItem("notifications")) || { emailAlerts: true, pushNotifications: false, weeklySummary: true }; }
    catch { return { emailAlerts: true, pushNotifications: false, weeklySummary: true }; }
  });
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);
  const [errorInfo, setErrorInfo] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const mountedRef = useRef(true);
  const abortRef = useRef(null);

  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);
  useEffect(() => { localStorage.setItem("notifications", JSON.stringify(notifications)); }, [notifications]);

  const applyUserData = useCallback((data) => {
    setUser({
      name: data.name || "", rollNumber: data.rollNumber || "", email: data.email || "",
      department: data.department || "", phone: data.phone || "",
      github: data.github || "", linkedin: data.linkedin || "",
      postCount: data.postCount || 0, createdAt: data.createdAt || null,
    });
    setEditData({
      name: data.name || "", rollNumber: data.rollNumber || "", department: data.department || "",
      phone: data.phone || "", github: data.github || "", linkedin: data.linkedin || "",
    });
    // Restore saved profile image from the server (persists across refreshes)
    if (data.profileImage) {
      setProfileImage(assetUrl(data.profileImage));
    }
  }, []);

  const fetchProfile = useCallback(async (isRetry = false) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    if (!isRetry) setLoading(true);
    setFetching(true);
    setError(null);
    setErrorInfo(null);

    let lastErr = null;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (!mountedRef.current) return;
      if (attempt > 0) { const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000); await sleep(delay); if (!mountedRef.current) return; }
      try {
        const res = await API.get("/auth/profile", { signal: controller.signal });
        if (!mountedRef.current) return;
        applyUserData(res.data);
        setFetching(false);
        setLoading(false);
        return;
      } catch (err) {
        if (err.name === "CanceledError" || err.name === "AbortError") return;
        lastErr = err;
        const info = deriveErrorInfo(err);
        if (!info.recoverable) break;
        if (attempt < MAX_RETRIES) continue;
      }
    }
    if (!mountedRef.current) return;
    const info = deriveErrorInfo(lastErr);
    setError(lastErr);
    setErrorInfo(info);
    setFetching(false);
    setLoading(false);
    if (info.redirectTo) { toast.dismiss(TOAST_ID); setTimeout(() => navigate(info.redirectTo, { replace: true }), 1500); }
    else { toast.error(info.message, { id: TOAST_ID }); }
  }, [navigate, applyUserData]);

  useEffect(() => {
    fetchProfile(false);
    return () => { if (abortRef.current) abortRef.current.abort(); };
  }, [fetchProfile]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setProfileImage(localUrl);
    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("profileImage", file);

      const res = await API.put("/auth/profile/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Replace local blob URL with the permanent server-stored URL
      const savedUrl = assetUrl(res.data.profileImage);
      setProfileImage(savedUrl);

      // Keep AuthContext in sync so any navbar avatar also updates
      updateUser({ profileImage: res.data.profileImage });

      toast.success("Profile image updated!");
    } catch (err) {
      console.error("Image upload failed:", err);
      toast.error(err.response?.data?.message || "Failed to upload image");
      // Revert to whatever was saved before (null if first upload)
      setProfileImage((prev) => (prev === localUrl ? null : prev));
    } finally {
      setUploadingImage(false);
      // Release the temporary object URL to free memory
      URL.revokeObjectURL(localUrl);
    }
  };

  const handleInputChange = (e) => { setEditData((prev) => ({ ...prev, [e.target.name]: e.target.value })); };

  const validateSocialUrl = (name, value) => {
    const trimmed = value.trim();
    if (!trimmed) return { valid: true };
    const regex = name === "github" ? GITHUB_REGEX : LINKEDIN_REGEX;
    return regex.test(trimmed) ? { valid: true } : { valid: false, message: `Invalid ${name === "github" ? "GitHub" : "LinkedIn"} URL format` };
  };

  const handleSave = async () => {
    const errors = ["github", "linkedin"].reduce((acc, n) => {
      const r = validateSocialUrl(n, editData[n] || "");
      if (!r.valid) acc.push(r.message);
      return acc;
    }, []);
    if (errors.length > 0) { errors.forEach((m) => toast.error(m)); return; }
    try {
      setSaving(true);
      const payload = { ...editData, github: (editData.github || "").trim(), linkedin: (editData.linkedin || "").trim() };
      const res = await API.put("/auth/profile", payload);
      applyUserData(res.data);
      updateStoredUserProfile({ name: res.data.name, email: res.data.email });
      toast.success("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      console.error("updateProfile error:", err);
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally { setSaving(false); }
  };

  const toggleNotification = (key) => { setNotifications((prev) => ({ ...prev, [key]: !prev[key] })); };

  const handleCopyProfileLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); toast.success("Profile link copied!", { id: "copy-link" }); }
    catch { toast.error("Failed to copy link"); }
  };

  const handleRetry = () => { toast.dismiss(TOAST_ID); fetchProfile(false); };

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? "Good Morning" : h < 18 ? "Good Afternoon" : "Good Evening";
  })();

  const achievements = [
    { label: "Trusted Finder", color: "#22d3ee", glow: "rgba(6,182,212,0.3)" },
    { label: "Verified User",  color: "#a78bfa", glow: "rgba(124,58,237,0.3)" },
    { label: "Early Adopter",  color: "#34d399", glow: "rgba(52,211,153,0.3)" },
  ];

  const pageVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  if (loading) return <Skeleton />;

  if (error) {
    return (
      <div className="min-h-screen relative flex items-center justify-center px-6 overflow-hidden isolate" style={{ backgroundColor: "var(--bg-deep)" }}>
        <BackgroundBlobs />
        <div className="noise-overlay" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card-premium p-10 max-w-md text-center relative z-10 mt-16"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: errorInfo?.redirectTo ? "rgba(251,191,36,0.1)" : "rgba(239,68,68,0.1)" }}>
            {errorInfo?.redirectTo ? (
              <FiUserCheck className="text-2xl" style={{ color: "#f59e0b" }} />
            ) : (
              <FiShield className="text-2xl" style={{ color: "#f87171" }} />
            )}
          </div>
          <p className="font-semibold text-lg mb-2" style={{ color: errorInfo?.redirectTo ? "#f59e0b" : "#f87171" }}>
            {errorInfo?.title || "Profile Error"}
          </p>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            {errorInfo?.message || "An unexpected error occurred."}
          </p>
          {errorInfo?.recoverable && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handleRetry} disabled={fetching}
              className="cosmic-btn px-6 py-2.5 rounded-xl text-white font-semibold transition-all duration-200 disabled:opacity-50 inline-flex items-center gap-2 shadow-lg"
              style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
            >
              <FiRefreshCw className={`text-sm ${fetching ? "animate-spin" : ""}`} />
              {fetching ? "Retrying…" : "Retry"}
            </motion.button>
          )}
          {!errorInfo?.recoverable && !errorInfo?.redirectTo && (
            <button onClick={handleRetry}
              className="cosmic-btn px-6 py-2.5 rounded-xl text-white font-semibold transition-all duration-200 shadow-lg"
              style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
            >
              Try Again
            </button>
          )}
          {errorInfo?.redirectTo && (
            <p className="text-xs mt-4" style={{ color: "var(--text-muted)" }}>Redirecting to login…</p>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden isolate" style={{ backgroundColor: "var(--bg-deep)" }}>
      <BackgroundBlobs />
      <div className="noise-overlay" />

      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 min-h-screen overflow-x-hidden pt-16 pb-12"
      >
        {/* Back button */}
        <div className="px-4 sm:px-6 mb-4">
          <motion.div whileHover={{ x: -2 }} whileTap={{ scale: 0.95 }}>
            <Link to="/home"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm backdrop-blur-xl border transition-all duration-200"
              style={{
                background: "var(--glass-bg)",
                borderColor: "var(--glass-border)",
                color: "var(--text-muted)",
              }}
            >
              <FiArrowLeft className="text-xs" /> Back
            </Link>
          </motion.div>
        </div>

        <ProfileHeader user={user} profileImage={profileImage} onImageUpload={handleImageUpload} greeting={greeting} uploadingImage={uploadingImage} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">

            {/* ── Left Column ─────────────────────────────────────── */}
            <div className="space-y-6">
              {/* Analytics */}
              <div className="glass-card-premium p-5">
                <div className="flex items-center gap-2 mb-4">
                  <FiActivity className="text-sm" style={{ color: "#a78bfa" }} />
                  <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    Analytics
                  </h2>
                </div>
                <ProfileStats postCount={user.postCount} />
              </div>

              {/* Achievements */}
              <div className="glass-card-premium p-5">
                <div className="flex items-center gap-2 mb-4">
                  <FiAward className="text-sm" style={{ color: "#a78bfa" }} />
                  <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    Achievements
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {achievements.map((badge) => (
                    <motion.span
                      key={badge.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      whileHover={{ scale: 1.08 }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium backdrop-blur-sm transition-all duration-200"
                      style={{
                        background: `${badge.color}12`,
                        border: `1px solid ${badge.color}20`,
                        color: badge.color,
                        boxShadow: `0 0 12px ${badge.glow}`,
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: badge.color }} />
                      {badge.label}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="glass-card-premium p-5">
                <div className="flex items-center gap-2 mb-5">
                  <FiActivity className="text-sm" style={{ color: "#a78bfa" }} />
                  <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    Recent Activity
                  </h2>
                </div>
                <ActivityTimeline />
              </div>
            </div>

            {/* ── Right Column ────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Details */}
              <div className="glass-card-premium p-6 sm:p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight neon-text">Profile Details</h2>
                    <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Manage your personal information</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCopyProfileLink}
                      className="p-2.5 rounded-xl border transition-all duration-200"
                      style={{
                        background: "var(--glass-bg)",
                        borderColor: "var(--glass-border)",
                        color: "var(--muted)",
                      }}
                      title="Copy profile link"
                    >
                      <FiCopy className="text-sm" />
                    </motion.button>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                      {editing ? (
                        <div className="flex gap-2">
                          <button onClick={() => setEditing(false)}
                            className="p-2.5 rounded-xl border transition-all duration-200"
                            style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)", color: "var(--muted)" }}
                          >
                            <FiX className="text-sm" />
                          </button>
                          <button onClick={handleSave} disabled={saving}
                            className="px-4 py-2.5 rounded-xl text-white font-semibold text-sm flex items-center gap-2 transition-all duration-200 disabled:opacity-50 shadow-lg"
                            style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
                          >
                            <FiSave className="text-sm" /> {saving ? "Saving..." : "Save"}
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setEditing(true)}
                          className="px-4 py-2.5 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all duration-200 hover:opacity-80"
                          style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)", color: "var(--text)" }}
                        >
                          <FiEdit2 className="text-sm" /> Edit
                        </button>
                      )}
                    </motion.div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <FormField label="Full Name" name="name" icon={FiUser} value={editing ? editData.name : user.name} editing={editing} placeholder="Enter your name" onChange={handleInputChange} />
                  <FormField label="Phone" name="phone" icon={FiPhone} value={editing ? editData.phone : user.phone} editing={editing} placeholder="Enter phone number" onChange={handleInputChange} />
                  <FormField label="Department" name="department" icon={FiBookOpen} value={editing ? editData.department : user.department} editing={editing} placeholder="Enter department" onChange={handleInputChange} />
                  <FormField label="Roll Number" name="rollNumber" icon={FiHash} value={editing ? editData.rollNumber : user.rollNumber} editing={editing} placeholder="Enter roll number" onChange={handleInputChange} />
                </div>

                <div className="mt-5">
                  <FormField label="Email" name="email" icon={FiMail} value={user.email} editing={false} onChange={() => {}} />
                </div>

                <div className="mt-8 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
                  {editing ? (
                    <div className="grid md:grid-cols-2 gap-5">
                      <SocialEditField label="GitHub" name="github" icon={FiGithub} value={editData.github || ""} regex={GITHUB_REGEX} placeholder="https://github.com/username" onChange={handleInputChange} />
                      <SocialEditField label="LinkedIn" name="linkedin" icon={FiLinkedin} value={editData.linkedin || ""} regex={LINKEDIN_REGEX} placeholder="https://linkedin.com/in/username" onChange={handleInputChange} />
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-widest mb-3 block" style={{ color: "var(--text-muted)" }}>
                        Social Profiles
                      </label>
                      <div className="flex items-center gap-3">
                        <SocialLink url={user.github} icon={FiGithub} label="GitHub" />
                        <SocialLink url={user.linkedin} icon={FiLinkedin} label="LinkedIn" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notifications */}
              <div className="glass-card-premium p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <FiBell className="text-sm" style={{ color: "#a78bfa" }} />
                  <h2 className="text-xl font-bold tracking-tight neon-text">Notifications</h2>
                </div>
                <NotificationSettings notifications={notifications} onToggle={toggleNotification} />
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Profile;
