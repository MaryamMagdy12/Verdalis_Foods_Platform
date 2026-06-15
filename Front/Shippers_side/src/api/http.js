import {
  csrfHeaders,
  ensureCsrfCookie,
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

export { ensureCsrfCookie, resetCsrf };

export function createApiClient({ onUnauthorized } = {}) {
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

    const url = getBaseUrl().startsWith("/")
      ? `${getBaseUrl()}/${path.replace(/^\//, "")}`
      : `${getBaseUrl()}/${path.replace(/^\//, "")}`;

    const res = await fetch(url, {
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
      throw Object.assign(new Error(data.message || "Session expired."), {
        status: 401,
        body: data,
      });
    }

    if (!res.ok) {
      throw Object.assign(new Error(data.message || "Request failed"), {
        status: res.status,
        body: data,
      });
    }

    return data;
  }

  return {
    get: (path) => request(path, { method: "GET" }),
    post: (path, body) => request(path, { method: "POST", body }),
    postForm: (path, formData) => request(path, { method: "POST", body: formData }),
  };
}
