import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiSend } from "react-icons/fi";
import toast from "react-hot-toast";
import API from "../../services/api";
import { useChat } from "../../context/ChatContext";
import { getStoredUserId } from "../../utils/authStorage";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import ViewProfileModal from "./ViewProfileModal";

export default function ChatWindow({ roomId, onBackMobile, onAfterRead }) {
  const { getSocket, connected, joinRoom, leaveRoom, emitTyping, emitStopTyping } =
    useChat();
  const navigate = useNavigate();
  const [meta, setMeta] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typingName, setTypingName] = useState("");
  const [viewingProfile, setViewingProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const bottomRef = useRef(null);
  const typingDebounce = useRef(null);
  const isSendingRef = useRef(false);
  // Keep a ref to the roomId that is currently loaded so async responses
  // from a previous room cannot overwrite state after the user has switched.
  const loadedRoomRef = useRef(null);
  const myId = getStoredUserId();

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, []);

  const appendMessage = useCallback((newMsg) => {
    setMessages((prev) => {
      if (prev.some((m) => String(m._id) === String(newMsg._id))) return prev;
      return [...prev, newMsg];
    });
  }, []);

  const replaceOptimistic = useCallback((tempId, serverMsg) => {
    setMessages((prev) => {
      const withoutTemp = prev.filter((m) => m._id !== tempId);
      if (withoutTemp.some((m) => String(m._id) === String(serverMsg._id))) {
        return withoutTemp;
      }
      return [...withoutTemp, serverMsg];
    });
  }, []);

  useEffect(() => {
    // Clear messages immediately when the room changes so stale messages
    // from the previous conversation are never visible in the new one.
    setMessages([]);
    setMeta(null);
    setTypingName("");
    loadedRoomRef.current = null;

    if (!roomId) return;

    // Capture which room this effect run is for.
    const targetRoom = roomId;
    let cancelled = false;

    const load = async () => {
      try {
        const [roomRes, msgRes] = await Promise.all([
          API.get(`/chat/${targetRoom}`),
          API.get(`/chat/messages/${targetRoom}`),
        ]);

        // If the user switched rooms while the request was in-flight, discard.
        if (cancelled) return;

        setMeta(roomRes.data);
        // Only accept messages that actually belong to this room.
        const fetched = (msgRes.data.messages || []).filter(
          (m) => String(m.chatRoomId) === String(targetRoom)
        );
        setMessages(fetched);
        loadedRoomRef.current = targetRoom;
        scrollToBottom();

        await API.post(`/chat/mark-read/${targetRoom}`);
        if (!cancelled) onAfterRead?.();
      } catch (e) {
        if (!cancelled) {
          toast.error(e.response?.data?.message || e.message || "Could not load chat");
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  // onAfterRead is intentionally excluded — it changes on every parent render
  // and must not re-trigger a full reload. We call it manually inside load().
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, scrollToBottom]);

  useEffect(() => {
    if (!roomId || !connected) return undefined;
    joinRoom(roomId);
    return () => leaveRoom(roomId);
  }, [roomId, connected, joinRoom, leaveRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingName, scrollToBottom]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !roomId) return undefined;

    const onReceive = (msg) => {
      // Reject messages that don't belong to the currently open room.
      // Compare as strings because msg.chatRoomId may be an ObjectId object.
      if (String(msg.chatRoomId) !== String(roomId)) return;
      // Own messages are handled via optimistic update + send ack — skip socket echo.
      const senderId = msg.sender?._id || msg.senderId;
      if (myId && senderId && String(senderId) === String(myId)) return;
      appendMessage(msg);
      const rid = msg.receiverId || msg.receiver?._id;
      if (rid && myId && String(rid) === String(myId)) {
        socket.emit("seenMessage", { roomId, messageIds: [msg._id] });
      }
      scrollToBottom();
    };

    const onTyping = (payload) => {
      if (String(payload.roomId) !== String(roomId)) return;
      if (String(payload.userId) === String(myId)) return;
      setTypingName(payload.userName || "Someone");
    };

    const onStop = (payload) => {
      if (String(payload.roomId) !== String(roomId)) return;
      setTypingName("");
    };

    const onDelivered = (payload) => {
      if (String(payload.chatRoomId) !== String(roomId)) return;
      setMessages((prev) =>
        prev.map((m) =>
          String(m._id) === String(payload.messageId)
            ? { ...m, deliveryStatus: payload.deliveryStatus || "delivered" }
            : m
        )
      );
    };

    const onSeen = (payload) => {
      if (String(payload.chatRoomId) !== String(roomId)) return;
      setMessages((prev) =>
        prev.map((m) =>
          String(m.senderId) === String(myId) || String(m.sender?._id) === String(myId)
            ? { ...m, deliveryStatus: "read", isSeen: true }
            : m
        )
      );
    };

    socket.on("receiveMessage", onReceive);
    socket.on("typing", onTyping);
    socket.on("stopTyping", onStop);
    socket.on("messageDelivered", onDelivered);
    socket.on("messagesSeen", onSeen);

    return () => {
      socket.off("receiveMessage", onReceive);
      socket.off("typing", onTyping);
      socket.off("stopTyping", onStop);
      socket.off("messageDelivered", onDelivered);
      socket.off("messagesSeen", onSeen);
    };
  }, [getSocket, roomId, myId, scrollToBottom, appendMessage]);

  const send = async () => {
    const raw = input.trim();
    if (!raw || !roomId || isSendingRef.current) return;
    isSendingRef.current = true;
    setInput("");
    emitStopTyping(roomId);

    // Optimistic update — show message immediately, scoped to this room.
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      _id: tempId,
      chatRoomId: roomId,   // explicit room scope so dedup checks work
      senderId: myId,
      text: raw,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      deliveryStatus: "sent",
      isSeen: false,
      sender: { _id: myId },
      receiver: null,
    };
    appendMessage(optimistic);

    const finishSend = () => {
      isSendingRef.current = false;
    };

    const socket = getSocket();
    if (socket && connected) {
      socket.emit("sendMessage", { roomId, text: raw }, (ack) => {
        finishSend();
        if (ack instanceof Error) {
          setMessages((prev) => prev.filter((m) => m._id !== tempId));
          toast.error(ack.message || "Send failed");
          return;
        }
        if (!ack?.ok) {
          setMessages((prev) => prev.filter((m) => m._id !== tempId));
          toast.error(ack?.message || "Send failed");
          return;
        }
        if (ack.data) {
          if (String(ack.data.chatRoomId) !== String(roomId)) return;
          replaceOptimistic(tempId, ack.data);
        }
      });
    } else {
      try {
        const res = await API.post("/chat/send", { chatRoomId: roomId, text: raw });
        const data = res.data?.data;
        if (data && String(data.chatRoomId) === String(roomId)) {
          replaceOptimistic(tempId, data);
        }
      } catch (e) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === tempId ? { ...m, deliveryStatus: "failed" } : m
          )
        );
        toast.error(e.response?.data?.message || e.message || "Send failed");
      } finally {
        finishSend();
      }
    }
  };

  const onInputChange = (e) => {
    setInput(e.target.value);
    if (!roomId) return;
    emitTyping(roomId);
    if (typingDebounce.current) clearTimeout(typingDebounce.current);
    typingDebounce.current = setTimeout(() => emitStopTyping(roomId), 1200);
  };

  const handleAvatarClick = async (sender) => {
    if (!sender?._id) return;
    setProfileLoading(true);
    try {
      const res = await API.get(`/auth/profile/${sender._id}`);
      setViewingProfile(res.data);
    } catch {
      toast.error("Could not load profile");
    } finally {
      setProfileLoading(false);
    }
  };

  if (!roomId) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-[var(--text-muted)] text-center">
        Select a conversation or start one from an item page.
      </div>
    );
  }

  const other = meta?.otherUser;

  return (
    <section className="flex flex-col flex-1 min-h-0 min-w-0 bg-[var(--bg)]">
      <header className="shrink-0 flex items-center gap-3 px-3 py-3 border-b border-[var(--border)] bg-[var(--surface)]">
        <button
          type="button"
          className="md:hidden p-2 rounded-xl lm-hover-surface hover:bg-gray-100 dark:hover:bg-white/10 text-[var(--text)]"
          onClick={onBackMobile}
          aria-label="Back to list"
        >
          <FiArrowLeft />
        </button>

        {/* Clickable profile area */}
        <button
          type="button"
          className="flex items-center gap-3 min-w-0 flex-1 text-left hover:opacity-80 transition-opacity"
          onClick={() => other?._id && navigate(`/profile/${other._id}`)}
          title="View profile"
        >
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-sm font-bold"
            style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)", color: "#fff" }}>
            {other?.profileImage ? (
              <img
                src={other.profileImage.startsWith("http") ? other.profileImage : `${window.location.origin}${other.profileImage}`}
                alt={other.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{other?.name?.charAt(0).toUpperCase() ?? "?"}</span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-[var(--text)] truncate">{other?.name || "Chat"}</h1>
              {other?._id && (
                <span className="text-[10px] text-cyan-400 shrink-0">↗</span>
              )}
            </div>
            <p className="text-xs text-[var(--text-muted)] truncate">
              {meta?.item?.title || "Campus Lost & Found"}
              {!connected ? " · reconnecting…" : ""}
            </p>
          </div>
        </button>

        <Link
          to={`/item/${meta?.room?.lostItemId || meta?.item?._id || ""}`}
          className="text-xs text-cyan-400 hover:underline shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          View item
        </Link>
      </header>

      <div className="flex-1 overflow-y-auto min-h-0 px-3 py-4 space-y-1">
        {messages.map((m) => (
          <MessageBubble
            key={m._id}
            message={m}
            isOwn={String(m.sender?._id || m.senderId) === String(myId)}
            onAvatarClick={handleAvatarClick}
          />
        ))}
        {typingName ? <TypingIndicator name={typingName} /> : null}
        <div ref={bottomRef} />
      </div>

      <footer className="shrink-0 p-3 border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="flex gap-2 items-end max-w-4xl mx-auto">
          <textarea
            rows={1}
            value={input}
            onChange={onInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Type a message…"
            className="flex-1 resize-none rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-cyan-500/40 max-h-32"
          />
          <button
            type="button"
            onClick={send}
            className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-black font-bold shadow-lg hover:opacity-90 transition-opacity"
            aria-label="Send"
          >
            <FiSend />
          </button>
        </div>
      </footer>

      {viewingProfile && (
        <ViewProfileModal user={viewingProfile} onClose={() => setViewingProfile(null)} />
      )}
      {profileLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="text-white text-sm">Loading profile…</div>
        </div>
      )}
    </section>
  );
}
