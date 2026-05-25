import { NavLink } from "react-router-dom";
import { FiMessageCircle } from "react-icons/fi";

export default function ChatList({ rooms, loading, selectedRoomId }) {
  return (
    <aside className="flex flex-col h-full min-h-0 border-r border-[var(--border)] bg-[var(--surface)] w-full md:w-80 shrink-0">
      <div className="p-4 border-b border-[var(--border)] flex items-center gap-2">
        <FiMessageCircle className="text-cyan-400 text-xl" />
        <h2 className="font-bold text-lg text-[var(--text)]">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading ? (
          <p className="p-4 text-[var(--text-muted)] text-sm">Loading…</p>
        ) : rooms.length === 0 ? (
          <p className="p-4 text-[var(--text-muted)] text-sm">
            No conversations yet. Open a chat from an item you posted or claimed (approved).
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {rooms.map((r) => (
              <li key={r._id}>
                <NavLink
                  to={`/messages/${r._id}`}
                  className={({ isActive }) =>
                    `block px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors ${
                      isActive || selectedRoomId === r._id ? "bg-cyan-500/10 border-l-4 border-cyan-400" : ""
                    }`
                  }
                >
                  <div className="flex justify-between gap-2 items-start">
                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--text)] truncate">
                        {r.otherUser?.name || "Campus user"}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] truncate">{r.itemTitle}</p>
                      {r.lastMessageText ? (
                        <p className="text-xs text-[var(--text-muted)] truncate mt-1">
                          {r.lastMessageText}
                        </p>
                      ) : null}
                    </div>
                    {r.unreadCount > 0 ? (
                      <span className="shrink-0 bg-cyan-500 text-black text-xs font-bold px-2 py-0.5 rounded-full min-w-[1.25rem] text-center">
                        {r.unreadCount > 99 ? "99+" : r.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
