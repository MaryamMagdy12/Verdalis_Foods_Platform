import { createApiClient } from "./api/http.js";

let user = null;

export function setUser(next) {
  user = next;
  window.dispatchEvent(new Event("shipper-user-updated"));
}

export function getUser() {
  return user;
}

const client = createApiClient({
  onUnauthorized: () => {
    user = null;
    if (!window.location.pathname.startsWith("/login")) {
      window.location.href = "/login?expired=1";
    }
  },
});

export function isAuthenticated() {
  return !!user;
}

export function getToken() {
  return user ? "session" : null;
}

export function setToken() {}

export async function api(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  if (method === "GET") return client.get(path);
  if (options.body instanceof FormData) return client.postForm(path, options.body);
  return client.post(path, options.body);
}

export const shipperApi = {
  login: (body) => client.post("auth/shipper/login", body),
  logout: () => client.post("auth/logout"),
  me: () => client.get("shipper/me"),
  todayOrders: () => client.get("shipper/orders/today"),
  getOrder: (orderNumber) => client.get(`shipper/orders/${encodeURIComponent(orderNumber)}`),
  resendDeliveryOtp: (orderNumber) => client.post(`shipper/orders/${encodeURIComponent(orderNumber)}/resend-otp`),
  pickup: (formData) => client.postForm("shipper/pickup", formData),
  requestManualPickup: (body) => client.post("shipper/pickup/manual/request", body),
  confirmManualPickup: (formData) => client.postForm("shipper/pickup/manual/confirm", formData),
  deliver: (formData) => client.postForm("shipper/deliver", formData),
  failed: (body) => client.post("shipper/failed", body),
  history: () => client.get("shipper/history"),
  performance: () => client.get("shipper/performance"),
};

export function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("GPS is not available on this device."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const { latitude, longitude, accuracy } = p.coords;
        if (latitude === 0 && longitude === 0) {
          reject(new Error("Invalid GPS coordinates. Enable location and try again."));
          return;
        }
        resolve({ latitude, longitude, accuracy });
      },
      () => reject(new Error("Location permission denied. Enable GPS to continue.")),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  });
}
