import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../services/api";
import ChatList from "../components/chat/ChatList";
import ChatWindow from "../components/chat/ChatWindow";
import { useMessageCount } from "../context/MessageContext";

export default function Messages() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { fetchUnread } = useMessageCount();

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get("/chat/my-rooms");
      setRooms(res.data.rooms || []);
      fetchUnread();
    } catch (err) {
      setRooms([]);
      const message = err.response?.data?.message || "Failed to load conversations.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  // fetchUnread comes from context and is stable (wrapped in useCallback there),
  // but we list it to satisfy the linter without causing re-render loops.
  }, [fetchUnread]);

  // Stable ref so ChatWindow's useEffect dependency on onAfterRead never
  // causes an unintended re-fetch when the parent re-renders.
  const fetchRoomsRef = useRef(fetchRooms);
  useEffect(() => { fetchRoomsRef.current = fetchRooms; }, [fetchRooms]);
  const stableFetchRooms = useCallback(() => fetchRoomsRef.current(), []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return (
    <div className="min-h-screen theme-bg pt-20 md:pt-24 pb-6 px-3 md:px-6">
      <div className="max-w-6xl mx-auto h-[calc(100vh-5.5rem)] md:h-[calc(100vh-7rem)] flex rounded-2xl overflow-hidden border border-[var(--border)] shadow-xl bg-[var(--surface)]">
        <div className="flex flex-1 min-h-0 min-w-0">
          {/* Mobile: list OR chat; Desktop: both */}
          <div
            className={`${
              roomId ? "hidden md:flex" : "flex"
            } w-full md:w-80 shrink-0 min-h-0 flex-col border-r border-[var(--border)]`}
          >
            {error && !loading && (
              <div className="p-4 border-b border-[var(--border)]">
                <p className="text-sm text-red-400 mb-2">{error}</p>
                <button
                  type="button"
                  onClick={fetchRooms}
                  className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] lm-hover-surface hover:bg-gray-100 dark:hover:bg-white/5 transition"
                >
                  Retry
                </button>
              </div>
            )}
            <ChatList rooms={rooms} loading={loading} selectedRoomId={roomId} />
          </div>
          <div
            className={`${
              !roomId ? "hidden md:flex" : "flex"
            } flex-1 min-h-0 flex-col`}
          >
            <ChatWindow
              roomId={roomId}
              onBackMobile={() => navigate("/messages")}
              onAfterRead={stableFetchRooms}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
