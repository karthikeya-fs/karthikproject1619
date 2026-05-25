import { useCallback, useEffect, useRef, useState } from "react";
import API from "../services/api";

export const EMPTY_FILTERS = {
  keyword:   "",
  category:  "",
  type:      "",
  status:    "",
  color:     "",
  location:  "",
  dateRange: "",
  dateFrom:  "",
  dateTo:    "",
  sort:      "newest",
};

const PAGE_SIZE = 12;

/**
 * useItemSearch — debounced search + filter + pagination hook.
 *
 * @param {object} overrides  Fixed filters that cannot be changed by the user
 *                            e.g. { type: "found" } for the FoundItems page.
 */
export function useItemSearch(overrides = {}) {
  const [filters, setFilters]     = useState(EMPTY_FILTERS);
  const [page, setPage]           = useState(1);
  const [items, setItems]         = useState([]);
  const [total, setTotal]         = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  const debounceRef = useRef(null);
  const abortRef    = useRef(null);

  const fetchItems = useCallback(
    async (activeFilters, activePage) => {
      // Cancel any in-flight request
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError("");

      try {
        // Merge user filters with page-level overrides
        const merged = { ...activeFilters, ...overrides };

        // Build query string — skip empty values
        const params = new URLSearchParams();
        Object.entries(merged).forEach(([k, v]) => {
          if (v && v !== "") params.set(k, v);
        });
        params.set("page",  String(activePage));
        params.set("limit", String(PAGE_SIZE));

        const res = await API.get(`/items/search?${params.toString()}`, {
          signal: controller.signal,
        });

        setItems(res.data.items      ?? []);
        setTotal(res.data.total      ?? 0);
        setTotalPages(res.data.totalPages ?? 1);
      } catch (err) {
        if (err.name === "CanceledError" || err.name === "AbortError") return;
        setError(err.response?.data?.message || "Failed to load items.");
        setItems([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    // overrides is stable (passed from parent, not recreated each render)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(overrides)]
  );

  // Debounce keyword changes; fire immediately for non-keyword filter changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchItems(filters, 1);
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [filters, fetchItems]);

  // Re-fetch when page changes (no debounce needed)
  useEffect(() => {
    if (page === 1) return; // already handled by filter effect above
    fetchItems(filters, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  }, []);

  const hasActiveFilters = Object.entries(filters).some(
    ([k, v]) => k !== "sort" && v !== ""
  );

  const removeItem = useCallback((deletedId) => {
    setItems((prev) => prev.filter((it) => it._id !== deletedId));
    setTotal((prev) => Math.max(0, prev - 1));
  }, []);

  return {
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    page,
    setPage,
    items,
    total,
    totalPages,
    loading,
    error,
    removeItem,
  };
}
