import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import { reverseGeocode } from "../../utils/geocode";

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

const TILE = {
  url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
};

const DEFAULT_CENTER = { lat: 43.6532, lng: -79.3832 };

function MapClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function MapViewSync({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center?.[0] == null || center?.[1] == null) return;
    map.setView(center, zoom ?? map.getZoom(), { animate: false });
  }, [map, center?.[0], center?.[1], zoom]);
  return null;
}

function MapInvalidator() {
  const map = useMap();
  useEffect(() => {
    const refresh = () => map.invalidateSize({ animate: false });
    const timers = [0, 150, 400].map((ms) => window.setTimeout(refresh, ms));
    window.addEventListener("resize", refresh);
    const container = map.getContainer();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(refresh) : null;
    observer?.observe(container);
    refresh();
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("resize", refresh);
      observer?.disconnect();
    };
  }, [map]);
  return null;
}

export function LocationMapPicker({
  value,
  onChange,
  label = "Pick location on map (optional)",
  height = 280,
}) {
  const [loading, setLoading] = React.useState(false);
  const center = useMemo(
    () => (value?.lat != null ? [value.lat, value.lng] : [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]),
    [value?.lat, value?.lng]
  );
  const zoom = value?.lat != null ? 15 : 10;

  const pick = async (coords) => {
    setLoading(true);
    try {
      const details = await reverseGeocode(coords.lat, coords.lng);
      onChange?.({
        lat: coords.lat,
        lng: coords.lng,
        ...details,
      });
    } catch {
      onChange?.({ lat: coords.lat, lng: coords.lng });
    } finally {
      setLoading(false);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => pick({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
  };

  useEffect(() => {
    if (value?.lat != null) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => pick({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { maximumAge: 60000, timeout: 8000 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="ck-map-picker">
      <div className="ck-map-picker__head">
        <span>{label}</span>
        <button type="button" className="ck-map-picker__geo" onClick={useMyLocation}>
          <i className="fa-solid fa-location-crosshairs" aria-hidden="true" /> Use my location
        </button>
      </div>
      <div className="ck-map-picker__map" style={{ height }}>
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom
          className="ck-map-picker__leaflet"
        >
          <TileLayer
            attribution={TILE.attribution}
            url={TILE.url}
            subdomains="abcd"
            maxZoom={20}
          />
          <MapInvalidator />
          <MapViewSync center={center} zoom={zoom} />
          <MapClickHandler onPick={pick} />
          {value?.lat != null && <Marker position={[value.lat, value.lng]} />}
        </MapContainer>
      </div>
      <p className="ck-map-picker__hint">
        {loading ? "Looking up address…" : "Click the map to set your delivery pin."}
        {value?.lat != null && !loading && (
          <span>
            {" "}
            ({Number(value.lat).toFixed(5)}, {Number(value.lng).toFixed(5)})
          </span>
        )}
      </p>
    </div>
  );
}
