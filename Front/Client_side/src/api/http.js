import {
  csrfHeaders,
  getAppRoot as resolveAppRoot,
  getBaseUrlFromEnv,
  prepareCsrf,
  resetCsrf,
} from "./csrf.js";

export function getBaseUrl() {
  return getBaseUrlFromEnv("/api");
}

function getAppRootUrl() {
  return resolveAppRoot(getBaseUrl());
}

export { resetCsrf };

function buildApiUrl(path, params = {}) {
  const base = getBaseUrl().replace(/\/$/, "");
  const relative = `${base}/${path.replace(/^\//, "")}`;
  const url = base.startsWith("/")
    ? new URL(relative, window.location.origin)
    : new URL(relative);
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== "") url.searchParams.set(k, v);
  });
  return url.toString();
}

export function createApiClient({ loginPath = "/login", onUnauthorized } = {}) {
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

    const res = await fetch(buildApiUrl(path), {
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
      onUnauthorized?.();
      const err = new Error(data.message || "Session expired. Please sign in again.");
      err.status = 401;
      err.sessionExpired = true;
      throw err;
    }

    if (!res.ok) {
      const err = new Error(data.message || res.statusText || "Request failed");
      err.status = res.status;
      err.body = data;
      if (data.errors) err.errors = data.errors;
      throw err;
    }

    return data;
  }

  return {
    get: (path, params = {}, options = {}) =>
      fetch(buildApiUrl(path, params), {
        method: "GET",
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "include",
      }).then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (res.status === 401) {
          if (!options.silent) onUnauthorized?.();
          throw Object.assign(new Error(data.message || "Session expired."), {
            status: 401,
            sessionExpired: !options.silent,
          });
        }
        if (!res.ok) {
          throw Object.assign(new Error(data.message || res.statusText), {
            status: res.status,
            body: data,
          });
        }
        return data;
      }),
    post: (path, body) => request(path, { method: "POST", body }),
    patch: (path, body) => request(path, { method: "PATCH", body }),
    postForm: (path, formData) => request(path, { method: "POST", body: formData }),
    loginPath,
  };
}
