import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { apiGetAuth, apiPost, onUnauthorized } from "../api/client";
import { isProfileReadyForCheckout } from "../utils/profile";

const AuthContext = createContext(null);

function formatError(e) {
  const errors = e.body?.errors;
  if (errors) {
    const first = Object.values(errors).flat().find(Boolean);
    if (first) return first;
  }
  return e.body?.message || e.message;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const userRef = useRef(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const clearSession = useCallback(() => {
    setUser(null);
  }, []);

  useEffect(() => {
    onUnauthorized(() => {
      if (!userRef.current) return;
      setUser(null);
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = `/login?expired=1`;
      }
    });
  }, []);

  useEffect(() => {
    apiGetAuth("auth/me", {}, { silent: true })
      .then((res) => setUser(res.data ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    if (!email?.trim() || !password) {
      return { ok: false, error: "Please enter your email and password." };
    }
    try {
      const res = await apiPost("auth/login", { email: email.trim(), password });
      if (res.otp_required) {
        return { ok: true, otpRequired: true, email: res.email };
      }
      setUser(res.user);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: formatError(e) };
    }
  }, []);

  const verifyLoginOtp = useCallback(async (email, code) => {
    try {
      const res = await apiPost("auth/login/verify", { email, code });
      setUser(res.user);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: formatError(e) };
    }
  }, []);

  const register = useCallback(async (payload) => {
    try {
      const res = await apiPost("auth/register", payload);
      if (res.otp_required) {
        return { ok: true, otpRequired: true, email: res.email };
      }
      setUser(res.user);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: formatError(e) };
    }
  }, []);

  const verifyRegisterOtp = useCallback(async (email, code) => {
    try {
      const res = await apiPost("auth/register/verify", { email, code });
      setUser(res.user);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: formatError(e) };
    }
  }, []);

  const resendOtp = useCallback(async (email, purpose) => {
    try {
      await apiPost("auth/otp/resend", { email, purpose });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: formatError(e) };
    }
  }, []);

  const forgotPassword = useCallback(async (email) => {
    if (!email?.trim()) {
      return { ok: false, error: "Please enter your email address." };
    }
    try {
      await apiPost("auth/forgot-password", { email: email.trim() });
      return { ok: true, email: email.trim() };
    } catch (e) {
      return { ok: false, error: formatError(e) };
    }
  }, []);

  const resetPassword = useCallback(async (email, code, password, passwordConfirmation) => {
    try {
      await apiPost("auth/reset-password", {
        email,
        code,
        password,
        password_confirmation: passwordConfirmation,
      });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: formatError(e) };
    }
  }, []);

  const loginWithGoogle = useCallback(async (credential) => {
    try {
      const res = await apiPost("auth/google", { credential });
      setUser(res.user);
      return { ok: true, profileComplete: res.profile_complete !== false && res.user?.profile_complete !== false };
    } catch (e) {
      return { ok: false, error: formatError(e) };
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await apiGetAuth("auth/me");
    setUser(res.data);
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiPost("auth/logout");
    } catch (_) {
      /* ignore */
    }
    clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      login,
      verifyLoginOtp,
      register,
      verifyRegisterOtp,
      resendOtp,
      forgotPassword,
      resetPassword,
      loginWithGoogle,
      refreshUser,
      logout,
      loading,
      isAuthenticated: !!user,
      isRetailer: user?.is_retailer,
      profileComplete: isProfileReadyForCheckout(user),
    }),
    [user, login, verifyLoginOtp, register, verifyRegisterOtp, resendOtp, forgotPassword, resetPassword, loginWithGoogle, refreshUser, logout, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
