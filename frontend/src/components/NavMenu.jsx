import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  AlertTriangle,
  Search,
  CirclePlus,
  Pin,
  LogOut,
  X,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

// ─── Menu items definition ───────────────────────────────────────────────────
const MENU_ITEMS = [
  {
    label: "All Items",
    to: "/items",
    icon: Package,
    desc: "Browse all lost and found items",
    color: "text-cyan-500",
    activeBg: "bg-cyan-500/10 border-cyan-500/20",
  },
  {
    label: "Reported Lost Items",
    to: "/lost-reports",
    icon: AlertTriangle,
    desc: "Items reported as lost by students",
    color: "text-amber-500",
    activeBg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    label: "Found Items",
    to: "/found-items",
    icon: Search,
    desc: "Items found and waiting to be claimed",
    color: "text-emerald-500",
    activeBg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    label: "Post Lost Item",
    to: "/report-lost",
    icon: CirclePlus,
    desc: "Report something you have lost",
    color: "text-rose-500",
    activeBg: "bg-rose-500/10 border-rose-500/20",
  },
  {
    label: "Post Found Item",
    to: "/post-item",
    icon: Pin,
    desc: "Post an item you have found",
    color: "text-blue-500",
    activeBg: "bg-blue-500/10 border-blue-500/20",
  },
];

// ─── Animation variants ──────────────────────────────────────────────────────
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const drawerVariants = {
  hidden: { x: "-100%", opacity: 0.6 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 320, damping: 32, mass: 0.8 },
  },
  exit: {
    x: "-100%",
    opacity: 0.6,
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -14 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.06 + i * 0.055, duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function NavMenu({ open, onClose }) {
  const location = useLocation();
  const { logout, isAdmin } = useAuth();
  const drawerRef = useRef(null);

  // Close on route change
  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const isActive = (to) => location.pathname === to;

  const handleLogout = () => {
    onClose();
    logout();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60]"
            style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
            aria-hidden
          />

          {/* ── Drawer ── */}
          <motion.aside
            key="drawer"
            ref={drawerRef}
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 left-0 h-full w-72 z-[70] flex flex-col"
            style={{
              backgroundColor: "var(--surface)",
              borderRight: "1px solid var(--border)",
              boxShadow: "var(--shadow-xl)",
            }}
            aria-label="Navigation menu"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 border-b shrink-0"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="absolute inset-0 bg-cyan-400 rounded-xl blur-md opacity-30" />
                  <img
                    src="/logo.png"
                    alt="Logo"
                    className="relative w-8 h-8 rounded-xl object-cover bg-white p-0.5"
                  />
                </div>
                <div className="leading-none">
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
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex items-center justify-center w-8 h-8 rounded-xl border transition-all duration-200 hover:bg-[var(--surface-strong)]"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text-muted)",
                }}
                aria-label="Close menu"
              >
                <X size={15} />
              </button>
            </div>

            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {MENU_ITEMS.map((item, i) => {
                const active = isActive(item.to);
                return (
                  <motion.div
                    key={item.to}
                    custom={i}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Link
                      to={item.to}
                      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200 ${
                        active
                          ? item.activeBg
                          : "border-transparent hover:bg-[var(--surface-strong)] hover:border-[var(--border)]"
                      }`}
                    >
                      {/* Icon badge */}
                      <span
                        className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                          active ? item.activeBg : "bg-[var(--surface-strong)]"
                        }`}
                      >
                        <item.icon
                          size={15}
                          className={active ? item.color : `text-[var(--text-muted)] transition-colors duration-200`}
                          style={active ? {} : undefined}
                        />
                      </span>

                      {/* Text */}
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-semibold leading-none mb-0.5 ${
                            active ? item.color : ""
                          }`}
                          style={active ? {} : { color: "var(--text)" }}
                        >
                          {item.label}
                        </p>
                        <p className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>
                          {item.desc}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}

              {/* Admin link — only for admins */}
              {isAdmin?.() && (
                <motion.div
                  custom={MENU_ITEMS.length}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Link
                    to="/admin"
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200 ${
                      isActive("/admin")
                        ? "bg-violet-500/10 border-violet-500/20"
                        : "border-transparent hover:bg-[var(--surface-strong)] hover:border-[var(--border)]"
                    }`}
                  >
                    <span
                      className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                        isActive("/admin") ? "bg-violet-500/10" : "bg-[var(--surface-strong)]"
                      }`}
                    >
                      <ShieldCheck
                        size={15}
                        className={isActive("/admin") ? "text-violet-500" : "text-[var(--text-muted)]"}
                      />
                    </span>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-semibold leading-none mb-0.5 ${isActive("/admin") ? "text-violet-500" : ""}`}
                        style={isActive("/admin") ? {} : { color: "var(--text)" }}
                      >
                        Admin Panel
                      </p>
                      <p className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>
                        Manage users and content
                      </p>
                    </div>
                  </Link>
                </motion.div>
              )}
            </nav>

            {/* Footer — Logout */}
            <div
              className="px-3 py-4 border-t shrink-0"
              style={{ borderColor: "var(--border)" }}
            >
              <motion.div
                custom={MENU_ITEMS.length + 1}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
              >
                <button
                  type="button"
                  onClick={handleLogout}
                  className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent transition-all duration-200 hover:bg-red-500/8 hover:border-red-500/20"
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 bg-[var(--surface-strong)] transition-transform duration-200 group-hover:scale-110">
                    <LogOut size={15} className="text-[var(--text-muted)] group-hover:text-red-500 transition-colors" />
                  </span>
                  <div className="min-w-0 text-left">
                    <p className="text-sm font-semibold leading-none mb-0.5 group-hover:text-red-500 transition-colors" style={{ color: "var(--text)" }}>
                      Logout
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                      Sign out of your account
                    </p>
                  </div>
                </button>
              </motion.div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
