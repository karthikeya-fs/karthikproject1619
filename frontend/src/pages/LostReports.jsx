import { AlertTriangle, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import AdvancedSearch from "../components/AdvancedSearch";
import ItemGrid from "../components/ItemGrid";
import { useItemSearch } from "../hooks/useItemSearch";

// type is locked to "lost" via overrides
const OVERRIDES = { type: "lost" };

function LostReports() {
  const {
    filters, updateFilter, resetFilters, hasActiveFilters,
    items, total, totalPages, page, setPage, loading, error, removeItem,
  } = useItemSearch(OVERRIDES);

  return (
    <div className="item-page min-h-screen bg-gradient-to-br from-[#f4f7fb] via-amber-50/50 to-white dark:from-slate-950 dark:via-amber-950/15 dark:to-black text-gray-900 dark:text-white px-4 sm:px-6 pt-24 pb-20 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[10%] right-[-5%] w-[400px] h-[400px] bg-amber-400/10 dark:bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-5%] w-[300px] h-[300px] bg-orange-400/8 dark:bg-orange-500/8 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center">
                  <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 dark:from-amber-200 dark:to-orange-300 bg-clip-text text-transparent">
                  Reported Lost Items
                </h1>
              </div>
              <p className="text-gray-500 dark:text-white/40 text-sm ml-12">
                Items reported as lost — check here before posting a find
              </p>
            </div>
            <Link
              to="/report-lost"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25 text-amber-700 dark:text-amber-300 text-sm font-medium hover:bg-amber-200 dark:hover:bg-amber-500/25 transition-all"
            >
              <Plus size={15} />
              Report lost item
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
          emptyMessage="No lost items have been reported yet."
          onItemDeleted={removeItem}
        />

        {/* Mobile report CTA */}
        <div className="sm:hidden mt-8 text-center">
          <Link
            to="/report-lost"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25 text-amber-700 dark:text-amber-300 text-sm font-medium"
          >
            <Plus size={15} />
            Report a lost item
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LostReports;
