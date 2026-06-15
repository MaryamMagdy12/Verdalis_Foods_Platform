import { useCallback, useEffect, useState } from "react";
import { shipperApi } from "../api";

export function useShipperDashboard() {
  const [orders, setOrders] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [todayRes, perfRes, historyRes] = await Promise.all([
        shipperApi.todayOrders(),
        shipperApi.performance(),
        shipperApi.history().catch(() => ({ data: [] })),
      ]);
      setOrders(todayRes.data || []);
      setPerformance(perfRes.data || null);
      setHistory(historyRes.data || []);
    } catch (err) {
      setError(err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { orders, performance, history, loading, error, refresh };
}
