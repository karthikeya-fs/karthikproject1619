import { Search, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import AdvancedSearch from "../components/AdvancedSearch";
import ItemGrid from "../components/ItemGrid";
import { useItemSearch } from "../hooks/useItemSearch";

// type is locked to "found" via overrides — users cannot change it
const OVERRIDES = { type: "found" };

function FoundItems() {
  const {
    filters, updateFilter, resetFilters, hasActiveFilters,
    items, total, totalPages, page, setPage, loading, error, removeItem,
  } = useItemSearch(OVERRIDES);

  return (
    <div className="item-page min-h-screen bg-gradient-to-br from-[#f4f7fb] via-cyan-50/50 to-white dark:from-slate-950 dark:via-cyan-950/20 dark:to-black text-gray-900 dark:text-white px-4 sm:px-6 pt-24 pb-20 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[10%] right-[-5%] w-[400px] h-[400px] bg-cyan-400/10 dark:bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-5%] w-[300px] h-[300px] bg-teal-400/8 dark:bg-teal-500/8 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-cyan-500/15 border border-cyan-200 dark:border-cyan-500/20 flex items-center justify-center">
                  <Search size={18} className="text-cyan-600 dark:text-cyan-400" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-700 to-teal-600 dark:from-cyan-300 dark:to-teal-400 bg-clip-text text-transparent">
                  Found Items
                </h1>
              </div>
              <p className="text-gray-500 dark:text-white/40 text-sm ml-12">
                Items found on campus — help reunite them with their owners
              </p>
            </div>
            <Link
              to="/post-item"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-100 dark:bg-cyan-500/15 border border-cyan-200 dark:border-cyan-500/25 text-cyan-700 dark:text-cyan-300 text-sm font-medium hover:bg-cyan-200 dark:hover:bg-cyan-500/25 transition-all"
            >
              <Plus size={15} />
              Post found item
            </Link>
          </div>
        </div>

        {/* Advanced search — hideTypeFilter since page is already scoped */}
        <div className="mb-8">
          <AdvancedSearch
            filters={filters}
            updateFilter={updateFilter}
            resetFilters={resetFilters}
            hasActiveFilters={hasActiveFilters}
            total={total}
            loading={loading}
            hideTypeFilter
          />
        </div>

        {/* Item grid */}
        <ItemGrid
          items={items}
          loading={loading}
          error={error}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          hasFilters={hasActiveFilters}
          emptyMessage="No found items have been posted yet."
          onItemDeleted={removeItem}
        />

        {/* Mobile post CTA */}
        <div className="sm:hidden mt-8 text-center">
          <Link
            to="/post-item"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-100 dark:bg-cyan-500/15 border border-cyan-200 dark:border-cyan-500/25 text-cyan-700 dark:text-cyan-300 text-sm font-medium"
          >
            <Plus size={15} />
            Post a found item
          </Link>
        </div>
      </div>
    </div>
  );
}

export default FoundItems;
