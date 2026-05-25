import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import { getSocketBaseUrl } from "../services/socket";

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return undefined;

    const url = getSocketBaseUrl();
    const socket = io(url, {
      path: "/socket.io",
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 8,
      reconnectionDelay: 800,
    });

    socketRef.current = socket;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, []);

  const joinRoom = useCallback((roomId) => {
    const s = socketRef.current;
    if (!s || !roomId) return;
    s.emit("joinRoom", roomId, (ack) => {
      if (ack && !ack.ok) {
        console.warn("joinRoom failed:", ack.message);
      }
    });
  }, []);

  const leaveRoom = useCallback((roomId) => {
    const s = socketRef.current;
    if (!s || !roomId) return;
    s.emit("leaveRoom", roomId);
  }, []);

  const emitTyping = useCallback((roomId) => {
    socketRef.current?.emit("typing", { roomId });
  }, []);

  const emitStopTyping = useCallback((roomId) => {
    socketRef.current?.emit("stopTyping", { roomId });
  }, []);

  const value = useMemo(
    () => ({
      getSocket: () => socketRef.current,
      connected,
      joinRoom,
      leaveRoom,
      emitTyping,
      emitStopTyping,
    }),
    [connected, joinRoom, leaveRoom, emitTyping, emitStopTyping]
  );

  return (
    <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return ctx;
}
