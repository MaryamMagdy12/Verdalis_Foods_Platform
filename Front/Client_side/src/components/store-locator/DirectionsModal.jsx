import React, { useState } from "react";
import { haversineKm, haversineMiles } from "../../utils/distance";

function buildDirectionsUrl(origin, destination) {
  const enc = encodeURIComponent;
  const originStr = typeof origin === "string" ? origin : `${origin.lat},${origin.lng}`;
  const destStr = typeof destination === "string" ? destination : `${destination.lat},${destination.lng}`;
  return `https://www.google.com/maps/dir/?api=1&origin=${enc(originStr)}&destination=${enc(destStr)}`;
}

export function DirectionsModal({ store, fromLocation, fromAddress, onClose }) {
  const [unit, setUnit] = useState("km"); // km | miles

  if (!store) return null;

  const fromLat = fromLocation?.lat ?? null;
  const fromLon = fromLocation?.lng ?? null;
  const distanceKm =
    fromLat != null && fromLon != null
      ? haversineKm(fromLat, fromLon, store.latitude, store.longitude)
      : null;
  const distanceMiles = distanceKm != null ? haversineMiles(fromLat, fromLon, store.latitude, store.longitude) : null;

  const originLabel = fromAddress && fromAddress.trim() ? fromAddress : "My location";
  const originForUrl = fromLocation
    ? `${fromLocation.lat},${fromLocation.lng}`
    : (fromAddress && fromAddress.trim() ? fromAddress : "");

  const handleGetDirections = () => {
    const url = buildDirectionsUrl(originForUrl, store.address);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="store-locator-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="directions-modal-title">
      <div className="store-locator-modal store-locator-directions-modal">
        <button
          type="button"
          className="store-locator-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <i className="fa-solid fa-times" aria-hidden="true" />
        </button>
        <h2 id="directions-modal-title" className="store-locator-directions-modal-title">
          Store Direction
        </h2>
        <h3 className="store-locator-directions-modal-subtitle">GET DIRECTIONS</h3>
        <div className="store-locator-directions-modal-row">
          <label className="store-locator-directions-label">From:</label>
          <span className="store-locator-directions-value">{originLabel}</span>
        </div>
        <div className="store-locator-directions-modal-row">
          <label className="store-locator-directions-label">To:</label>
          <span className="store-locator-directions-value">{store.address}</span>
        </div>
        {(distanceKm != null) && (
          <div className="store-locator-directions-units">
            <button
              type="button"
              className={unit === "km" ? "store-locator-directions-unit active" : "store-locator-directions-unit"}
              onClick={() => setUnit("km")}
            >
              Km
            </button>
            <button
              type="button"
              className={unit === "miles" ? "store-locator-directions-unit active" : "store-locator-directions-unit"}
              onClick={() => setUnit("miles")}
            >
              Miles
            </button>
            <span className="store-locator-directions-distance">
              {unit === "km" ? distanceKm.toFixed(1) : distanceMiles.toFixed(1)} {unit === "km" ? "km" : "miles"}
            </span>
          </div>
        )}
        <button type="button" className="store-locator-directions-modal-btn" onClick={handleGetDirections}>
          GET DIRECTIONS
        </button>
      </div>
    </div>
  );
}
