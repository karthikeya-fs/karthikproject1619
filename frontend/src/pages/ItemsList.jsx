import { Package } from "lucide-react";
import { Link } from "react-router-dom";
import AdvancedSearch from "../components/AdvancedSearch";
import ItemGrid from "../components/ItemGrid";
import { useItemSearch } from "../hooks/useItemSearch";

function ItemsList() {
  const {
    filters, updateFilter, resetFilters, hasActiveFilters,
    items, total, totalPages, page, setPage, loading, error,
  } = useItemSearch(); // no overrides — shows all types

  return (
    <div className="item-page min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-white dark:from-slate-950 dark:via-blue-950/40 dark:to-black text-gray-900 dark:text-white px-4 sm:px-6 pt-24 pb-20 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[10%] right-[-5%] w-[400px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-5%] w-[300px] h-[300px] bg-violet-500/8 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center">
              <Package size={18} className="text-cyan-400" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              All Items
            </h1>
          </div>
          <p className="text-gray-500 dark:text-white/40 text-sm ml-12">
            Browse all reported lost and found items across campus
          </p>
        </div>

        {/* Advanced search + filters */}
        <div className="mb-8">
          <AdvancedSearch
            filters={filters}
            updateFilter={updateFilter}
            resetFilters={resetFilters}
            hasActiveFilters={hasActiveFilters}
            total={total}
            loading={loading}
          />
        </div>

        {/* Item grid with pagination */}
        <ItemGrid
          items={items}
          loading={loading}
          error={error}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          hasFilters={hasActiveFilters}
          emptyMessage="No items have been posted yet."
        />

        {/* Quick-post links */}
        {!loading && items.length === 0 && !hasActiveFilters && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link
              to="/report-lost"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-300 text-sm font-medium hover:bg-amber-500/25 transition-all"
            >
              Report a lost item
            </Link>
            <Link
              to="/post-item"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/25 text-cyan-300 text-sm font-medium hover:bg-cyan-500/25 transition-all"
            >
              Post a found item
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default ItemsList;
