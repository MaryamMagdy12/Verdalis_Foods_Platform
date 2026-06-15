/**
 * Geocode / reverse geocode via OpenStreetMap Nominatim.
 */
const NOMINATIM_URL = "https://nominatim.openstreetmap.org";
const USER_AGENT = "VerdalisFoods-Site-StoreLocator/1.0";

export async function geocodeAddress(query) {
  const params = new URLSearchParams({
    q: query,
    format: "json",
    limit: "1",
  });
  const res = await fetch(`${NOMINATIM_URL}/search?${params}`, {
    method: "GET",
    headers: { Accept: "application/json", "User-Agent": USER_AGENT },
  });
  if (!res.ok) throw new Error("Geocoding request failed");
  const data = await res.json();
  if (!data?.length) return null;
  const first = data[0];
  return {
    lat: parseFloat(first.lat),
    lng: parseFloat(first.lon),
    displayName: first.display_name,
  };
}

export async function reverseGeocode(lat, lng) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: "json",
    addressdetails: "1",
  });
  const res = await fetch(`${NOMINATIM_URL}/reverse?${params}`, {
    method: "GET",
    headers: { Accept: "application/json", "User-Agent": USER_AGENT },
  });
  if (!res.ok) throw new Error("Reverse geocoding failed");
  const data = await res.json();
  const addr = data.address || {};
  return {
    lat,
    lng,
    displayName: data.display_name || "",
    line1: [addr.house_number, addr.road].filter(Boolean).join(" ") || data.display_name?.split(",")[0] || "",
    city: addr.city || addr.town || addr.village || addr.municipality || "",
    province: addr.state || addr.province || "",
    postal_code: addr.postcode || "",
    country: addr.country_code?.toUpperCase() || "CA",
  };
}
