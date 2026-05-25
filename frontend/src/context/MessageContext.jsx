import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import API from "../services/api";
import { useAuth } from "./AuthContext";

const MessageContext = createContext(null);

export function MessageProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [totalUnread, setTotalUnread] = useState(0);

  const fetchUnread = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await API.get("/chat/my-rooms");
      const rooms = res.data.rooms || [];
      const count = rooms.reduce((sum, r) => sum + (r.unreadCount || 0), 0);
      setTotalUnread(count);
    } catch {
      // silently fail
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnread();
      // Poll every 30s as a fallback
      const interval = setInterval(fetchUnread, 30000);
      return () => clearInterval(interval);
    } else {
      setTotalUnread(0);
    }
  }, [isAuthenticated, fetchUnread]);

  const value = useMemo(
    () => ({ totalUnread, setTotalUnread, fetchUnread }),
    [totalUnread, fetchUnread]
  );

  return (
    <MessageContext.Provider value={value}>{children}</MessageContext.Provider>
  );
}

export function useMessageCount() {
  const ctx = useContext(MessageContext);
  if (!ctx) throw new Error("useMessageCount must be used within MessageProvider");
  return ctx;
}
