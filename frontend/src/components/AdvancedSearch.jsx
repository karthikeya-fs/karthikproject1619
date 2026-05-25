import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, SlidersHorizontal, Tag, MapPin, Calendar,
  CircleCheck, Palette, ArrowUpDown, X, ChevronDown,
} from "lucide-react";

// ─── Static option lists ──────────────────────────────────────────────────────

const CATEGORIES = [
  "Electronics", "Wallet", "ID Card", "Keys",
  "Books", "Bags", "Clothing", "Others",
];

const LOCATIONS = [
  "Library", "Cafeteria", "Main Block", "Hostel",
  "Auditorium", "Parking Area", "Sports Complex",
  "Science Block", "Engineering Block", "Administration Building",
];

const DATE_RANGES = [
  { value: "today",   label: "Today" },
  { value: "7days",   label: "Last 7 days" },
  { value: "30days",  label: "Last 30 days" },
  { value: "custom",  label: "Custom range" },
];

const ITEM_TYPES = [
  { value: "lost",  label: "Lost" },
  { value: "found", label: "Found" },
];

const COLORS = [
  { value: "Black",  dot: "#1e293b" },
  { value: "White",  dot: "#f1f5f9" },
  { value: "Blue",   dot: "#3b82f6" },
  { value: "Red",    dot: "#ef4444" },
  { value: "Green",  dot: "#22c55e" },
  { value: "Yellow", dot: "#eab308" },
  { value: "Other",  dot: "linear-gradient(135deg,#a855f7,#06b6d4)" },
];

const STATUSES = [
  { value: "open",     label: "Open" },
  { value: "claimed",  label: "Claimed" },
  { value: "resolved", label: "Returned" },
];

const SORT_OPTIONS = [
  { value: "newest",  label: "Newest first" },
  { value: "oldest",  label: "Oldest first" },
  { value: "updated", label: "Recently updated" },
  { value: "claimed", label: "Most claimed" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Thin wrapper for a labelled filter row */
function FilterGroup({ icon: Icon, label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-400 dark:text-white/35">
        <Icon size={10} />
        {label}
      </label>
      {children}
    </div>
  );
}

/** Custom animated dropdown menu — rendered in a portal so overflow:hidden ancestors never clip it */
function SelectMenu({ value, onChange, placeholder, options, className = "" }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Recalculate position on scroll/resize while open
  useEffect(() => {
    if (!open) return;
    const reposition = () => {
      if (!triggerRef.current) return;
      const r = triggerRef.current.getBoundingClientRect();
      setCoords({ top: r.bottom + 6, left: r.left, width: r.width });
    };
    reposition();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open]);

  const openMenu = () => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setCoords({ top: r.bottom + 6, left: r.left, width: r.width });
    setOpen(true);
  };

  const getLabel = (opt) => (typeof opt === "string" ? opt : opt.label);
  const getValue = (opt) => (typeof opt === "string" ? opt : opt.value);

  const selected = options.find((o) => getValue(o) === value);
  const display = selected ? getLabel(selected) : placeholder;

  return (
    <div ref={triggerRef}>
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openMenu())}
        className={`w-full flex items-center justify-between gap-1 bg-white/70 dark:bg-white/[0.06] border border-gray-200/80 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-gray-700 dark:text-white/85 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/25 transition-all cursor-pointer ${className}`}
      >
        <span className="truncate">{display}</span>
        <ChevronDown
          size={13}
          className={`shrink-0 text-gray-400 dark:text-white/30 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && createPortal(
        <AnimatePresence>
          <motion.div
            ref={menuRef}
            key="select-menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: coords.width,
              zIndex: 9999,
              maxHeight: "min(260px, 50vh)",
            }}
            className="rounded-xl border bg-white dark:bg-[#080c1a] border-gray-200 dark:border-white/[0.08] shadow-[0_16px_48px_-8px_rgba(0,0,0,0.18),0_0_30px_rgba(59,130,246,0.04)] dark:shadow-[0_16px_48px_-8px_rgba(0,0,0,0.7)] overflow-y-auto py-1"
          >
            {options.map((opt) => {
              const val = getValue(opt);
              const label = getLabel(opt);
              const isSelected = val === value;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => { onChange(val); setOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 text-sm transition-all ${
                    isSelected
                      ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 font-medium"
                      : "text-gray-700 dark:text-slate-300 hover:bg-blue-500/10 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * AdvancedSearch
 *
 * Props:
 *   filters        — current filter state from useItemSearch
 *   updateFilter   — (key, value) => void
 *   resetFilters   — () => void
 *   hasActiveFilters — boolean
 *   total          — number of results
 *   loading        — boolean
 *   hideTypeFilter — hide the type dropdown (e.g. on FoundItems page)
 */
export default function AdvancedSearch({
  filters,
  updateFilter,
  resetFilters,
  hasActiveFilters,
  total,
  loading,
  hideTypeFilter = false,
}) {
  const [expanded, setExpanded] = useState(false);
  const [showCustomDate, setShowCustomDate] = useState(false);
  const inputRef = useRef(null);

  const handleDateRange = useCallback(
    (val) => {
      updateFilter("dateRange", val);
      setShowCustomDate(val === "custom");
      if (val !== "custom") {
        updateFilter("dateFrom", "");
        updateFilter("dateTo", "");
      }
    },
    [updateFilter]
  );

  const handleReset = useCallback(() => {
    resetFilters();
    setShowCustomDate(false);
    inputRef.current?.focus();
  }, [resetFilters]);

  const activeCount = Object.entries(filters).filter(
    ([k, v]) => k !== "sort" && v !== ""
  ).length;

  return (
    <div className="w-full space-y-3">
      {/* ── Search bar row ─────────────────────────────────────────────── */}
      <div className="flex gap-2">
        {/* Main search input */}
        <div className="relative flex-1 group">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/30 group-focus-within:text-cyan-500 dark:group-focus-within:text-cyan-400 group-focus-within:drop-shadow-[0_0_6px_rgba(34,211,238,0.4)] transition-all pointer-events-none"
          />
          <input
            ref={inputRef}
            type="text"
            value={filters.keyword}
            onChange={(e) => updateFilter("keyword", e.target.value)}
            placeholder="Search items by name, category, description or location..."
            className="w-full bg-white/90 dark:bg-white/[0.06] border border-gray-200/80 dark:border-white/10 rounded-xl pl-11 pr-11 py-3.5 text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-white/25 focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-all"
          />
          {filters.keyword && (
            <button
              type="button"
              onClick={() => updateFilter("keyword", "")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/70 transition-colors"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filters toggle button */}
        <motion.button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          whileTap={{ scale: 0.96 }}
          className={`relative flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
            expanded || activeCount > 0
              ? "bg-cyan-100 dark:bg-cyan-500/20 border-cyan-300 dark:border-cyan-500/50 text-cyan-700 dark:text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.08)]"
              : "bg-white/80 dark:bg-white/[0.04] border-gray-200/80 dark:border-white/10 text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/[0.08] hover:text-gray-900 dark:hover:text-white/90 hover:border-gray-300 dark:hover:border-white/20"
          }`}
          aria-expanded={expanded}
          aria-label="Toggle filters"
        >
          <SlidersHorizontal
            size={15}
            className={`transition-transform duration-300 ${expanded ? "rotate-90" : ""}`}
          />
          <span className="hidden sm:inline">Filters</span>
          {activeCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-cyan-500 text-white text-[9px] font-black flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.5)]">
              {activeCount}
            </span>
          )}
        </motion.button>

        {/* Sort dropdown */}
        <div className="relative hidden sm:block">
          <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/25 pointer-events-none z-10" />
          <SelectMenu
            value={filters.sort}
            onChange={(v) => updateFilter("sort", v)}
            placeholder="Sort by"
            options={SORT_OPTIONS}
            className="pl-8 pr-8 py-3"
          />
        </div>
      </div>

      {/* ── Expanded filter panel ───────────────────────────────────────── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="filter-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="bg-white/80 dark:bg-[#0f172a]/55 border border-gray-200/70 dark:border-white/[0.06] rounded-2xl p-5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">

                {/* Category */}
                <FilterGroup icon={Tag} label="Category">
                  <SelectMenu
                    value={filters.category}
                    onChange={(v) => updateFilter("category", v)}
                    placeholder="All categories"
                    options={CATEGORIES}
                  />
                </FilterGroup>

                {/* Type — hidden when page already scopes to one type */}
                {!hideTypeFilter && (
                  <FilterGroup icon={SlidersHorizontal} label="Type">
                    <SelectMenu
                      value={filters.type}
                      onChange={(v) => updateFilter("type", v)}
                      placeholder="Lost & Found"
                      options={ITEM_TYPES}
                    />
                  </FilterGroup>
                )}

                {/* Status */}
                <FilterGroup icon={CircleCheck} label="Status">
                  <SelectMenu
                    value={filters.status}
                    onChange={(v) => updateFilter("status", v)}
                    placeholder="Any status"
                    options={STATUSES}
                  />
                </FilterGroup>

                {/* Location */}
                <FilterGroup icon={MapPin} label="Location">
                  <SelectMenu
                    value={filters.location}
                    onChange={(v) => updateFilter("location", v)}
                    placeholder="Any location"
                    options={LOCATIONS}
                  />
                </FilterGroup>

                {/* Date range */}
                <FilterGroup icon={Calendar} label="Date">
                  <SelectMenu
                    value={filters.dateRange}
                    onChange={handleDateRange}
                    placeholder="Any time"
                    options={DATE_RANGES}
                  />
                </FilterGroup>

                {/* Color */}
                <FilterGroup icon={Palette} label="Color">
                  <SelectMenu
                    value={filters.color}
                    onChange={(v) => updateFilter("color", v)}
                    placeholder="Any color"
                    options={COLORS.map((c) => ({ value: c.value, label: c.value }))}
                  />
                </FilterGroup>

                {/* Sort — mobile only (desktop has it in the bar) */}
                <div className="sm:hidden">
                  <FilterGroup icon={ArrowUpDown} label="Sort">
                    <SelectMenu
                      value={filters.sort}
                      onChange={(v) => updateFilter("sort", v)}
                      placeholder="Sort by"
                      options={SORT_OPTIONS}
                    />
                  </FilterGroup>
                </div>
              </div>

              {/* Custom date range */}
              <AnimatePresence>
                {showCustomDate && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden mt-4"
                  >
                    <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200/70 dark:border-white/[0.06]">
                      <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-400 dark:text-white/35">
                          From
                        </label>
                        <input
                          type="date"
                          value={filters.dateFrom}
                          onChange={(e) => updateFilter("dateFrom", e.target.value)}
                          className="bg-white/90 dark:bg-white/[0.06] border border-gray-200/80 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-gray-700 dark:text-white/80 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/25 transition-all"
                        />
                      </div>
                      <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-400 dark:text-white/35">
                          To
                        </label>
                        <input
                          type="date"
                          value={filters.dateTo}
                          onChange={(e) => updateFilter("dateTo", e.target.value)}
                          className="bg-white/90 dark:bg-white/[0.06] border border-gray-200/80 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-gray-700 dark:text-white/80 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/25 transition-all"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Color swatches quick-pick */}
              <div className="flex flex-wrap items-center gap-2.5 mt-5 pt-4 border-t border-gray-200/70 dark:border-white/[0.06]">
                <span className="text-[10px] text-gray-400 dark:text-white/30 font-semibold uppercase tracking-[0.08em] mr-1">
                  Quick color
                </span>
                {COLORS.map((c) => (
                  <motion.button
                    key={c.value}
                    type="button"
                    onClick={() =>
                      updateFilter("color", filters.color === c.value ? "" : c.value)
                    }
                    title={c.value}
                    whileTap={{ scale: 0.85 }}
                    className={`w-7 h-7 rounded-full border-2 transition-all duration-200 ${
                      filters.color === c.value
                        ? "border-cyan-400 scale-110 shadow-[0_0_14px_rgba(34,211,238,0.5)]"
                        : "border-gray-300 dark:border-white/15 hover:border-cyan-400/50 hover:scale-110 hover:shadow-[0_0_12px_rgba(34,211,238,0.12)]"
                    }`}
                    style={{ background: c.dot }}
                    aria-pressed={filters.color === c.value}
                    aria-label={`Filter by ${c.value}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Results summary + reset ─────────────────────────────────────── */}
      <div className="flex items-center justify-between min-h-[24px] px-0.5">
        <motion.p
          key={`${total}-${loading}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-gray-500 dark:text-white/40"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
              <span className="text-gray-500 dark:text-white/50">Searching…</span>
            </span>
          ) : (
                        <span className="text-gray-500 dark:text-white/45">
              <span className="text-gray-800 dark:text-white/75 font-semibold">{total}</span> {" "}
              {total === 1 ? "item" : "items"} found
            </span>
          )}
        </motion.p>

        {hasActiveFilters && (
          <motion.button
            type="button"
            onClick={handleReset}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400/70 hover:text-red-700 dark:hover:text-red-400 transition-colors"
          >
            <X size={12} />
            Reset filters
          </motion.button>
        )}
      </div>
    </div>
  );
}
