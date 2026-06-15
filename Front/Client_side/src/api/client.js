import { createApiClient } from "./http.js";

let unauthorizedHandler = null;

export function onUnauthorized(handler) {
  unauthorizedHandler = handler;
}

const api = createApiClient({
  loginPath: "/login",
  onUnauthorized: () => unauthorizedHandler?.(),
});

export function clearAuthState() {
  unauthorizedHandler?.();
}

export const apiGet = api.get;
export const apiPost = api.post;
export const apiPatch = api.patch;
export const apiPostForm = api.postForm;

export async function apiGetAuth(path, params, options = {}) {
  return api.get(path, params, options);
}

export async function apiPostAuth(path, body) {
  return api.post(path, body);
}

export async function apiPatchAuth(path, body) {
  return api.patch(path, body);
}

export async function apiPostFormAuth(path, formData) {
  return api.postForm(path, formData);
}

export function apiUrl(path) {
  const base = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
