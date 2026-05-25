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
import API from "../services/api";
import { getSocketBaseUrl } from "../services/socket";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);

  const recalcUnread = useCallback((list) => {
    setUnreadCount(list.filter((n) => !n.isRead).length);
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await API.get("/notifications");
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount ?? 0);
    } catch {
      // silently fail — non-critical
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, fetchNotifications]);

  // Real-time socket for notifications
  useEffect(() => {
    if (!isAuthenticated) return undefined;
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

    socket.on("newNotification", (notification) => {
      setNotifications((prev) => {
        const updated = [notification, ...prev];
        recalcUnread(updated);
        return updated;
      });
    });

    return () => {
      socket.off("newNotification");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, recalcUnread]);

  const markAsRead = useCallback(async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications((prev) => {
        const updated = prev.map((n) => (n._id === id ? { ...n, isRead: true } : n));
        recalcUnread(updated);
        return updated;
      });
    } catch {
      // ignore
    }
  }, [recalcUnread]);

  const markAllAsRead = useCallback(async () => {
    try {
      await API.put("/notifications/read-all");
      setNotifications((prev) => {
        const updated = prev.map((n) => ({ ...n, isRead: true }));
        recalcUnread(updated);
        return updated;
      });
    } catch {
      // ignore
    }
  }, [recalcUnread]);

  const deleteNotification = useCallback(async (id) => {
    try {
      await API.delete(`/notifications/${id}`);
      setNotifications((prev) => {
        const updated = prev.filter((n) => n._id !== id);
        recalcUnread(updated);
        return updated;
      });
    } catch {
      // ignore
    }
  }, [recalcUnread]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
    }),
    [notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead, deleteNotification]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
