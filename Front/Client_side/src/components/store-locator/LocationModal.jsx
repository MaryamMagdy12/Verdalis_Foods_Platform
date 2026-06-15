import React, { useState } from "react";

export function LocationModal({ onClose, onUseLocation }) {
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState("");

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setStatus("error");
      setErrorMessage("Geolocation is not supported by your browser.");
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onUseLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setStatus("success");
        onClose();
      },
      (err) => {
        setStatus("error");
        if (err.code === 1) setErrorMessage("Location permission denied.");
        else if (err.code === 2) setErrorMessage("Location unavailable.");
        else setErrorMessage("Could not get your location.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  return (
    <div className="store-locator-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="location-modal-title">
      <div className="store-locator-modal store-locator-location-modal">
        <button
          type="button"
          className="store-locator-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <i className="fa-solid fa-times" aria-hidden="true" />
        </button>
        <div className="store-locator-location-modal-icon">
          <i className="fa-solid fa-location-dot" aria-hidden="true" />
        </div>
        <h2 id="location-modal-title" className="store-locator-location-modal-title">
          Find Nearby Service Providers
        </h2>
        <p className="store-locator-location-modal-text">
          Use my location to find the closest Service Provider near me
        </p>
        {status === "error" && (
          <p className="store-locator-location-modal-error" role="alert">
            {errorMessage}
          </p>
        )}
        <button
          type="button"
          className="store-locator-location-modal-btn"
          onClick={handleUseLocation}
          disabled={status === "loading"}
        >
          {status === "loading" ? "Getting location…" : "USE LOCATION"}
        </button>
      </div>
    </div>
  );
}
