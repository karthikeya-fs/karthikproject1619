import { useEffect, useRef } from "react";
import { Bell, Check, CheckCheck, Trash2, X } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const TYPE_PILL = {
  item_claimed:   "bg-cyan-500/15 text-cyan-600 dark:text-cyan-300",
  claim_approved: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  claim_rejected: "bg-red-500/15 text-red-600 dark:text-red-300",
  new_message:    "bg-blue-500/15 text-blue-600 dark:text-blue-300",
  ai_high_match:  "bg-cyan-500/15 text-cyan-600 dark:text-cyan-300",
  ai_medium_match: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300",
  ai_low_match:   "bg-amber-500/15 text-amber-600 dark:text-amber-300",
  ai_verification_complete: "bg-purple-500/15 text-purple-600 dark:text-purple-300",
};

const TYPE_LABEL = {
  item_claimed:   "Claimed",
  claim_approved: "Approved",
  claim_rejected: "Rejected",
  new_message:    "Message",
  ai_high_match:  "AI High Match",
  ai_medium_match: "AI Match",
  ai_low_match:   "AI Review",
  ai_verification_complete: "AI Verified",
};

export default function NotificationDropdown({ onClose }) {
  const { notifications, loading, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications();
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border z-50 overflow-hidden"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--border)",
        boxShadow: "var(--shadow-xl)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-cyan-500" />
          <span className="font-semibold text-sm" style={{ color: "var(--text)" }}>
            Notifications
          </span>
          {notifications.filter((n) => !n.isRead).length > 0 && (
            <span className="text-[10px] font-bold bg-cyan-500 text-white rounded-full px-1.5 py-0.5">
              {notifications.filter((n) => !n.isRead).length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {notifications.some((n) => !n.isRead) && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors hover:bg-[var(--surface-strong)]"
              style={{ color: "var(--text-muted)" }}
            >
              <CheckCheck size={12} />
              All read
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg transition-colors hover:bg-[var(--surface-strong)]"
            style={{ color: "var(--text-muted)" }}
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div
              className="w-5 h-5 border-2 rounded-full animate-spin"
              style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
            />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Bell size={28} style={{ color: "var(--muted)" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              No notifications yet
            </p>
          </div>
        ) : (
          <ul>
            {notifications.map((n) => (
              <li
                key={n._id}
                className="group relative flex gap-3 px-4 py-3 border-b transition-colors hover:bg-[var(--surface-strong)]"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: !n.isRead ? "var(--accent-soft)" : undefined,
                }}
              >
                {!n.isRead && (
                  <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-500" />
                )}

                <div className="flex-1 min-w-0 pl-1">
                  <p
                    className={`text-xs leading-relaxed ${!n.isRead ? "font-semibold" : ""}`}
                    style={{ color: "var(--text)" }}
                  >
                    {n.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${TYPE_PILL[n.notificationType] || ""}`}>
                      {TYPE_LABEL[n.notificationType] || n.notificationType}
                    </span>
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {!n.isRead && (
                    <button
                      type="button"
                      onClick={() => markAsRead(n._id)}
                      title="Mark as read"
                      className="p-1 rounded-lg transition-colors hover:bg-[var(--surface-strong)] text-cyan-500"
                    >
                      <Check size={12} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteNotification(n._id)}
                    title="Delete"
                    className="p-1 rounded-lg transition-colors hover:bg-[var(--surface-strong)] text-red-500"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
