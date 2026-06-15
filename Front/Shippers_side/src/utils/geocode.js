import { formatAddress } from "./shipperOrders";

const coordCache = new Map();

function readCoords(address) {
  if (!address || typeof address !== "object") return null;
  const lat = address.latitude ?? address.lat ?? address.location_lat;
  const lng = address.longitude ?? address.lng ?? address.location_lng;
  if (lat == null || lng == null) return null;
  const latN = Number(lat);
  const lngN = Number(lng);
  if (Number.isNaN(latN) || Number.isNaN(lngN)) return null;
  return { lat: latN, lng: lngN };
}

export async function resolveStopCoordinates(address) {
  const direct = readCoords(address);
  if (direct) return direct;

  const query = formatAddress(address);
  if (!query || query === "—") return null;

  if (coordCache.has(query)) return coordCache.get(query);

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    url.searchParams.set("q", query);

    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;

    const rows = await res.json();
    const hit = rows?.[0];
    if (!hit) return null;

    const coords = { lat: parseFloat(hit.lat), lng: parseFloat(hit.lon) };
    coordCache.set(query, coords);
    return coords;
  } catch {
    return null;
  }
}
