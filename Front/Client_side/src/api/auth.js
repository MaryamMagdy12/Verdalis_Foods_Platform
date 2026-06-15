// Cookie-based auth — no tokens in localStorage.

export function getToken() {
  return null;
}

export function setToken() {
  // no-op: auth is httpOnly cookie
}

export function authHeaders() {
  return {};
}
