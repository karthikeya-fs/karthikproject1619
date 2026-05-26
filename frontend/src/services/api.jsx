import axios from "axios";

const baseURL = (() => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.DEV) return "/api";

  // VITE_API_URL must be set in Vercel dashboard for production builds
  console.error("[api] VITE_API_URL is not set — all API calls will fail. Set it in Vercel dashboard.");

  return "";
})();

console.log("API URL:", baseURL);

const API = axios.create({
  baseURL,
  timeout: 30000,
});

// Attach JWT to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response interceptor — handle 401 globally (no spamming toasts)
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config._retry) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("userRole");
    }
    return Promise.reject(err);
  }
);

/**
 * Check backend health.
 * Returns `{ alive: true, port }` or `{ alive: false }`.
 * Never throws — always resolves.
 */
export async function checkHealth() {
  try {
    const res = await API.get("/health", { timeout: 4000 });
    return { alive: true, port: res.data.port, uptime: res.data.uptime };
  } catch {
    return { alive: false };
  }
}

export const API_ORIGIN = (() => {
  const base = API.defaults.baseURL || "";
  if (base.startsWith("http://") || base.startsWith("https://")) {
    try { return new URL(base).origin; } catch {}
  }
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:5000";
})();

export function assetUrl(storedPath) {
  if (!storedPath || typeof storedPath !== "string") return "";
  if (storedPath.startsWith("http://") || storedPath.startsWith("https://")) {
    return storedPath;
  }
  const p = storedPath.startsWith("/") ? storedPath : `/${storedPath}`;
  return `${API_ORIGIN}${p}`;
}

export default API;
