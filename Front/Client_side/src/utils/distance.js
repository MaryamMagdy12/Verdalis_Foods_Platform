/**
 * Haversine formula: distance between two lat/lng points in kilometres.
 * Used to sort stores by "nearest" when user searches or uses "Use my location".
 */
const EARTH_RADIUS_KM = 6371;

export function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export function haversineMiles(lat1, lon1, lat2, lon2) {
  return haversineKm(lat1, lon1, lat2, lon2) * 0.621371;
}

/**
 * Sort an array of stores by distance from a center point (lat, lon).
 * Mutates and returns the same array for convenience.
 */
export function sortStoresByDistance(stores, centerLat, centerLon) {
  return [...stores].sort((a, b) => {
    const distA = haversineKm(centerLat, centerLon, a.latitude, a.longitude);
    const distB = haversineKm(centerLat, centerLon, b.latitude, b.longitude);
    return distA - distB;
  });
}
