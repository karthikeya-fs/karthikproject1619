import { useState } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";
import NotificationDropdown from "./NotificationDropdown";

export default function NotificationBell() {
  const { unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="nav-icon-btn relative flex items-center justify-center w-9 h-9 rounded-xl border transition-all duration-200 border-gray-200 bg-gray-100/70 text-gray-600 hover:text-[#111111] hover:bg-[#f0f0f0] dark:border-white/10 dark:bg-white/[0.06] dark:text-white/60 dark:hover:text-white dark:hover:bg-white/[0.1]"
        aria-label="Notifications"
      >
        <Bell size={15} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-cyan-500 text-white text-[9px] font-bold px-1 shadow">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && <NotificationDropdown onClose={() => setOpen(false)} />}
    </div>
  );
}
