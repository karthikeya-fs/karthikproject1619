import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, SearchX } from "lucide-react";
import ItemCard from "./ItemCard";

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-200/60 dark:border-white/10 bg-gray-100/50 dark:bg-white/[0.03] overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-gray-200/60 dark:bg-white/[0.06]" />
      <div className="p-4 space-y-2.5">
        <div className="h-4 bg-gray-200/60 dark:bg-white/[0.06] rounded-lg w-3/4" />
        <div className="h-3 bg-gray-200/40 dark:bg-white/[0.04] rounded-lg w-full" />
        <div className="h-3 bg-gray-200/40 dark:bg-white/[0.04] rounded-lg w-2/3" />
        <div className="h-8 bg-gray-200/60 dark:bg-white/[0.06] rounded-xl mt-3" />
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ hasFilters, emptyMessage }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 flex items-center justify-center mb-5">
        <SearchX size={32} className="text-gray-300 dark:text-white/20" />
      </div>
      <h3 className="text-xl font-bold text-gray-500 dark:text-white/60 mb-2">
        {hasFilters ? "No matching items found" : (emptyMessage || "No items yet")}
      </h3>
      <p className="text-sm text-gray-400 dark:text-white/30 max-w-xs">
        {hasFilters
          ? "Try adjusting your search or filters to find what you're looking for."
          : "Check back later or be the first to post."}
      </p>
    </motion.div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  // Build page number array with ellipsis
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="p-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] text-gray-500 dark:text-white/50 hover:text-gray-800 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-1 text-gray-300 dark:text-white/20 text-sm select-none">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`min-w-[36px] h-9 rounded-xl border text-sm font-medium transition-all ${
              p === page
                ? "bg-cyan-100 dark:bg-cyan-500/20 border-cyan-300 dark:border-cyan-500/40 text-cyan-700 dark:text-cyan-300"
                : "border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] text-gray-500 dark:text-white/50 hover:text-gray-800 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20"
            }`}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="p-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] text-gray-500 dark:text-white/50 hover:text-gray-800 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * ItemGrid
 *
 * Props:
 *   items          — array of item objects
 *   loading        — boolean
 *   error          — string | ""
 *   total          — total result count
 *   page           — current page number
 *   totalPages     — total page count
 *   onPageChange   — (newPage) => void
 *   hasFilters     — boolean (affects empty state message)
 *   emptyMessage   — custom empty state message
 */
export default function ItemGrid({
  items,
  loading,
  error,
  page,
  totalPages,
  onPageChange,
  hasFilters = false,
  emptyMessage,
  onItemDeleted,
}) {
  const safeItems = items ?? [];

  return (
    <>
      {/* Error banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm mb-6">
          ⚠️ {error}
        </div>
      )}

      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          // Skeleton placeholders
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
        ) : safeItems.length === 0 ? (
          <EmptyState hasFilters={hasFilters} emptyMessage={emptyMessage} />
        ) : (
          <AnimatePresence mode="popLayout">
            {safeItems.map((item, i) => (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
              >
                <ItemCard item={item} onItemDeleted={onItemDeleted} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Pagination */}
      {!loading && safeItems.length > 0 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </>
  );
}
