import { Outlet } from "react-router-dom";
import { ChatProvider } from "../context/ChatContext";

/**
 * Keeps a single Socket.io connection for both /messages and /messages/:roomId.
 */
export default function ChatLayout() {
  return (
    <ChatProvider>
      <Outlet />
    </ChatProvider>
  );
}
