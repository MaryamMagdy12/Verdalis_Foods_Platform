import { useCallback, useEffect, useState } from "react";
import { apiGet } from "../api/client";

/**
 * Load active categories from GET /api/categories
 * @param {{ withCounts?: boolean }} options
 */
export function useCategories({ withCounts = true } = {}) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = withCounts ? { with_counts: "1" } : {};
      const res = await apiGet("categories", params);
      setCategories(res.data || []);
    } catch (e) {
      setError(e.message || "Failed to load categories.");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [withCounts]);

  useEffect(() => {
    load();
  }, [load]);

  return { categories, loading, error, reload: load };
}
