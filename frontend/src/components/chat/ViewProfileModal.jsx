import { FiX, FiGithub, FiLinkedin, FiBookOpen, FiHash } from "react-icons/fi";
import { assetUrl } from "../../services/api";

export default function ViewProfileModal({ user, onClose }) {
  if (!user) return null;

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header banner */}
        <div
          className="h-24 w-full"
          style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}
        />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition"
          aria-label="Close"
        >
          <FiX size={16} />
        </button>

        {/* Avatar */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2">
          <div
            className="w-24 h-24 rounded-full overflow-hidden border-4 flex items-center justify-center text-2xl font-bold text-white"
            style={{ borderColor: "var(--surface)", background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
          >
            {user.profileImage ? (
              <img
                src={assetUrl(user.profileImage)}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              user.name?.charAt(0).toUpperCase()
            )}
          </div>
        </div>

        {/* Body */}
        <div className="pt-16 pb-6 px-6 text-center">
          <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>{user.name}</h2>

          <div className="mt-3 space-y-1.5 text-sm" style={{ color: "var(--text-muted)" }}>
            {user.department && (
              <div className="flex items-center justify-center gap-1.5">
                <FiBookOpen size={13} />
                <span>{user.department}</span>
              </div>
            )}
            {user.rollNumber && (
              <div className="flex items-center justify-center gap-1.5">
                <FiHash size={13} />
                <span>{user.rollNumber}</span>
              </div>
            )}
            {memberSince && (
              <p className="text-xs mt-1">Member since {memberSince}</p>
            )}
          </div>

          {/* Social links */}
          {(user.github || user.linkedin) && (
            <div className="flex items-center justify-center gap-3 mt-4">
              {user.github && (
                <a
                  href={user.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl border transition hover:opacity-80"
                  style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                  title="GitHub"
                >
                  <FiGithub size={16} />
                </a>
              )}
              {user.linkedin && (
                <a
                  href={user.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl border transition hover:opacity-80"
                  style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                  title="LinkedIn"
                >
                  <FiLinkedin size={16} />
                </a>
              )}
            </div>
          )}

          {/* Read-only notice */}
          <p
            className="mt-5 text-xs px-3 py-2 rounded-xl"
            style={{ background: "var(--surface-elevated)", color: "var(--text-muted)" }}
          >
            👁 View only — you cannot edit this profile
          </p>
        </div>
      </div>
    </div>
  );
}
