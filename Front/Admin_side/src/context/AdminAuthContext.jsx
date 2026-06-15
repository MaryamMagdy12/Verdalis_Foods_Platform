import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { apiGet, onUnauthorized } from "../api/admin";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const authedRef = useRef(false);

  useEffect(() => {
    authedRef.current = authenticated;
  }, [authenticated]);

  useEffect(() => {
    onUnauthorized(() => {
      if (!authedRef.current) return;
      setAuthenticated(false);
    });
  }, []);

  useEffect(() => {
    apiGet("admin/me", {}, { silent: true })
      .then(() => setAuthenticated(true))
      .catch(() => setAuthenticated(false))
      .finally(() => setLoading(false));
  }, []);

  const markAuthenticated = useCallback(() => {
    setAuthenticated(true);
  }, []);

  const markUnauthenticated = useCallback(() => {
    setAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({ authenticated, loading, markAuthenticated, markUnauthenticated }),
    [authenticated, loading, markAuthenticated, markUnauthenticated]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
