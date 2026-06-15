import { getBaseUrlFromEnv, getAppRoot } from "../api/csrf";

/** API origin without /api suffix — for /storage/... image URLs */
export function getStorageBaseUrl() {
  const apiBase = getBaseUrlFromEnv("/api");
  const root = getAppRoot(apiBase);
  if (root) return root.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

export function storageUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = getStorageBaseUrl();
  const normalized = path.startsWith("storage/") ? path : `storage/${path}`;
  return `${base}/${normalized}`;
}
