/**
 * Sanctum CSRF helpers — fetch cookie + send X-XSRF-TOKEN on mutating requests.
 */

export function getBaseUrlFromEnv(fallback = "/api") {
  const url = import.meta.env.VITE_API_URL;
  if (!url && import.meta.env.PROD) {
    throw new Error("VITE_API_URL must be set in production.");
  }
  return (url || fallback).replace(/\/$/, "");
}

export function getAppRoot(apiBase) {
  if (apiBase.startsWith("/")) return "";
  return apiBase.replace(/\/api\/?$/, "");
}

function readCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function csrfHeaders() {
  const token = readCookie("XSRF-TOKEN");
  return token ? { "X-XSRF-TOKEN": token } : {};
}

let csrfReady = false;

export function resetCsrf() {
  csrfReady = false;
}

export async function ensureCsrfCookie(appRoot) {
  await fetch(`${appRoot}/sanctum/csrf-cookie`, {
    method: "GET",
    credentials: "include",
    headers: { "X-Requested-With": "XMLHttpRequest" },
  });
  csrfReady = true;
}

export async function prepareCsrf(appRoot, force = false) {
  if (force || !csrfReady) {
    await ensureCsrfCookie(appRoot);
  }
}
