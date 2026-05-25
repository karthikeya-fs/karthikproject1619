import { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiLogIn,
  FiLogOut,
  FiUser,
  FiMoon,
  FiSun,
  FiMessageCircle,
  FiShield,
} from "react-icons/fi";
import { Menu } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useMessageCount } from "../context/MessageContext";
import NotificationBell from "./notifications/NotificationBell";
import ConnectionStatus from "./ConnectionStatus";
import NavMenu from "./NavMenu";

function Navbar() {
  const location = useLocation();
  const { isAuthenticated, isAdmin, logout, loading } = useAuth();
  const { totalUnread } = useMessageCount();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const initialDark = savedTheme ? savedTheme === "dark" : prefersDark;
    setIsDarkMode(initialDark);
    document.documentElement.classList.toggle("theme-dark", initialDark);
    document.documentElement.classList.toggle("theme-light", !initialDark);
    document.documentElement.classList.toggle("dark", initialDark);
    document.documentElement.classList.toggle("light", !initialDark);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    localStorage.setItem("theme", nextDark ? "dark" : "light");
    document.documentElement.classList.toggle("theme-dark", nextDark);
    document.documentElement.classList.toggle("theme-light", !nextDark);
    document.documentElement.classList.toggle("dark", nextDark);
    document.documentElement.classList.toggle("light", !nextDark);
  };

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const isActive = (path) =>
    path === "/messages"
      ? location.pathname === "/messages" || location.pathname.startsWith("/messages/")
      : location.pathname === path;

  const loggedIn = !loading && isAuthenticated;
  const showAdmin = loggedIn && isAdmin();

  // Use gray-* (not slate-900) in light mode — @theme remaps slate-900 to var(--surface) (near-white).
  const iconBtn = (active) =>
    `nav-icon-btn relative flex items-center justify-center w-9 h-9 rounded-xl border transition-all duration-200 ${
      active
        ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 dark:border-cyan-500/40 dark:bg-cyan-500/15 dark:shadow-[0_0_12px_rgba(6,182,212,0.15)]"
        : "border-gray-200 bg-gray-100/70 text-gray-600 hover:text-[#111111] hover:bg-[#f0f0f0] dark:border-white/10 dark:bg-white/[0.06] dark:text-white/60 dark:hover:text-white dark:hover:bg-white/[0.1]"
    }`;

  return (
    <>
      <nav
        className="fixed top-0 left-0 w-full z-50 border-b backdrop-blur-xl"
        style={{
          backgroundColor: "var(--navbar)",
          borderColor: "var(--navbar-border)",
          boxShadow: isDarkMode
            ? "0 1px 20px rgba(0,0,0,0.3), 0 0 40px rgba(124,58,237,0.03)"
            : "0 1px 20px rgba(0,0,0,0.05), 0 0 40px rgba(99,102,241,0.02)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">

          {/* ── Left: Hamburger + Logo ── */}
          <div className="flex items-center gap-2 shrink-0">
            {loggedIn && (
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className={`${iconBtn(menuOpen)} shrink-0`}
                aria-label="Open navigation menu"
                aria-expanded={menuOpen}
              >
                <Menu size={16} />
              </button>
            )}

            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-400 rounded-xl blur-md opacity-30 group-hover:opacity-60 transition duration-300" />
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="relative w-8 h-8 rounded-xl shadow object-cover bg-white p-0.5 transform group-hover:scale-105 transition duration-300"
                />
              </div>
              <div className="hidden sm:block leading-none">
                <span
                  className="text-sm font-extrabold tracking-tight"
                  style={{ color: "var(--text)" }}
                >
                  Lost<span className="text-cyan-500"> & </span>Found
                </span>
                <p
                  className="text-[8px] tracking-[0.25em] uppercase font-semibold mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  Campus Network
                </p>
              </div>
            </Link>
          </div>

          {/* ── Right: action icons ── */}
          <div className="flex items-center gap-1.5">

            {loggedIn && (
              <>
                <Link
                  to="/home"
                  className={iconBtn(isActive("/home"))}
                  aria-label="Home"
                >
                  <FiHome size={15} />
                </Link>

                <Link
                  to="/messages"
                  className={iconBtn(isActive("/messages"))}
                  aria-label="Messages"
                >
                  <FiMessageCircle size={15} />
                  {totalUnread > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-cyan-500 text-white text-[9px] font-bold px-1 shadow">
                      {totalUnread > 99 ? "99+" : totalUnread}
                    </span>
                  )}
                </Link>

                <NotificationBell />

                {showAdmin && (
                  <Link
                    to="/admin"
                    className={iconBtn(isActive("/admin"))}
                    aria-label="Admin"
                  >
                    <FiShield size={15} />
                  </Link>
                )}
              </>
            )}

            <div className="hidden sm:flex items-center px-1">
              <ConnectionStatus />
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className={iconBtn(false)}
              aria-label="Toggle theme"
            >
              {isDarkMode
                ? <FiSun size={15} className="text-amber-400" />
                : <FiMoon size={15} className="text-slate-500" />
              }
            </button>

            {loggedIn ? (
              <>
                <Link
                  to="/profile"
                  className={iconBtn(isActive("/profile"))}
                  aria-label="Profile"
                >
                  <FiUser size={15} />
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="nav-icon-btn flex items-center justify-center w-9 h-9 rounded-xl border transition-all duration-200 border-gray-200 bg-gray-100/70 text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/60 dark:hover:text-red-400 dark:hover:bg-red-500/10 dark:hover:border-red-500/20"
                  aria-label="Log out"
                >
                  <FiLogOut size={15} />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className={iconBtn(isActive("/login"))}
                aria-label="Login"
              >
                <FiLogIn size={15} />
              </Link>
            )}
          </div>
        </div>
      </nav>

      <NavMenu open={menuOpen} onClose={closeMenu} />
    </>
  );
}

export default Navbar;
