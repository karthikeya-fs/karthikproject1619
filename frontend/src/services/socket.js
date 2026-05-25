/**
 * Base URL for Socket.io (no path — client uses path: "/socket.io").
 * - Dev: same origin as Vite so `/socket.io` is proxied to Express.
 * - Prod: derive origin from VITE_API_URL if set, else current window origin.
 */
export function getSocketBaseUrl() {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL.replace(/\/$/, "");
  }
  const api = import.meta.env.VITE_API_URL || "";
  if (typeof api === "string" && api.startsWith("http")) {
    try {
      return new URL(api).origin;
    } catch {
      /* fall through */
    }
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
}
