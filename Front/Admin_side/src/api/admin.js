import {
  csrfHeaders,
  getAppRoot,
  getBaseUrlFromEnv,
  prepareCsrf,
  resetCsrf,
} from "./csrf.js";

export function getBaseUrl() {
  return getBaseUrlFromEnv("/api");
}

export function getAppRootUrl() {
  return getAppRoot(getBaseUrl());
}

export { resetCsrf };

let unauthorizedHandler = null;

export function onUnauthorized(handler) {
  unauthorizedHandler = handler;
}

export function getToken() {
  return null;
}

export function setToken() {}

export function apiUrl(path) {
  const base = getBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

function buildApiUrl(path, params = {}) {
  const relative = apiUrl(path);
  const url = getBaseUrl().startsWith("/")
    ? new URL(relative, window.location.origin)
    : new URL(relative);
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== "") url.searchParams.set(k, v);
  });
  return url.toString();
}

async function request(path, options = {}, retried = false) {
  const method = (options.method || "GET").toUpperCase();
  const appRoot = getAppRootUrl();

  if (method !== "GET" && method !== "HEAD") {
    await prepareCsrf(appRoot, retried);
  }

  const headers = {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
    ...csrfHeaders(),
    ...options.headers,
  };

  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(apiUrl(path), {
    ...options,
    method,
    headers,
    credentials: "include",
    body:
      options.body && !(options.body instanceof FormData)
        ? JSON.stringify(options.body)
        : options.body,
  });

  const data = await res.json().catch(() => ({}));

  if (res.status === 419 && !retried) {
    resetCsrf();
    return request(path, options, true);
  }

  if (res.status === 401) {
    unauthorizedHandler?.();
    throw Object.assign(new Error(data.message || "Session expired."), {
      status: 401,
      body: data,
    });
  }

  if (!res.ok) {
    throw Object.assign(new Error(data.message || res.statusText), {
      status: res.status,
      body: data,
      errors: data.errors,
    });
  }

  return data;
}

export async function apiGet(path, params = {}, options = {}) {
  const res = await fetch(buildApiUrl(path, params), {
    method: "GET",
    headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    if (!options.silent) unauthorizedHandler?.();
    throw Object.assign(new Error(data.message || "Unauthorized"), { status: 401 });
  }
  if (!res.ok) {
    throw Object.assign(new Error(data.message || res.statusText), {
      status: res.status,
      body: data,
    });
  }
  return data;
}

export async function apiPost(path, body = {}) {
  return request(path, { method: "POST", body });
}

export async function apiPut(path, body = {}) {
  return request(path, { method: "PUT", body });
}

export async function apiPatch(path, body = {}) {
  return request(path, { method: "PATCH", body });
}

export async function apiDelete(path) {
  const res = await fetch(apiUrl(path), {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...csrfHeaders(),
    },
    credentials: "include",
  });
  if (res.status === 401) {
    unauthorizedHandler?.();
    throw new Error("Unauthorized");
  }
  if (res.status === 204) return;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(new Error(data.message || res.statusText), {
      status: res.status,
      body: data,
    });
  }
  return data;
}

export async function apiUpload(method, path, formData) {
  await prepareCsrf(getAppRootUrl());
  const res = await fetch(apiUrl(path), {
    method,
    headers: {
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...csrfHeaders(),
    },
    credentials: "include",
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    unauthorizedHandler?.();
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    throw Object.assign(new Error(data.message || res.statusText), {
      status: res.status,
      body: data,
    });
  }
  return data;
}
