import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { resolveStopCoordinates } from "../utils/geocode";
import "../assets/css/ShipperRouteMap.css";

const DEFAULT_CENTER = [30.0444, 31.2357];

function shipperIcon() {
  return L.divIcon({
    className: "sp-route-map__shipper-wrap",
    html: '<div class="sp-route-map__shipper-pointer" aria-hidden="true"><i class="fa-solid fa-location-arrow"></i><span class="sp-route-map__shipper-pulse"></span></div>',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function stopIcon(number) {
  return L.divIcon({
    className: "sp-route-map__stop-wrap",
    html: `<div class="sp-route-map__stop-pin">${number}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

function MapBounds({ points, shipperPos }) {
  const map = useMap();
  const lastFitKey = useRef("");

  useEffect(() => {
    if (!shipperPos && !points.length) return;

    const bounds = L.latLngBounds([]);
    points.forEach((p) => bounds.extend([p.lat, p.lng]));
    if (shipperPos) bounds.extend([shipperPos.lat, shipperPos.lng]);
    if (!bounds.isValid()) return;

    const fitKey = `${points.length}:${points.map((p) => `${p.lat},${p.lng}`).join("|")}`;
    if (fitKey !== lastFitKey.current) {
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: 15 });
      lastFitKey.current = fitKey;
    } else if (shipperPos) {
      map.panTo([shipperPos.lat, shipperPos.lng], { animate: true, duration: 0.35 });
    }
  }, [map, points, shipperPos]);

  return null;
}

export function DeliveryRouteMap({ stops = [], tall = true, trackLocation = true }) {
  const [shipperPos, setShipperPos] = useState(null);
  const [stopCoords, setStopCoords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [geoError, setGeoError] = useState(false);

  useEffect(() => {
    if (!trackLocation || !navigator.geolocation) {
      setGeoError(true);
      return undefined;
    }

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setGeoError(false);
        setShipperPos({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          heading: pos.coords.heading,
        });
      },
      () => setGeoError(true),
      { enableHighAccuracy: true, maximumAge: 8000, timeout: 12000 }
    );

    return () => navigator.geolocation.clearWatch(id);
  }, [trackLocation]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!stops.length) {
        setStopCoords([]);
        return;
      }

      setLoading(true);
      const resolved = [];

      for (let i = 0; i < stops.length; i++) {
        const coords = await resolveStopCoordinates(stops[i].address);
        if (coords) {
          resolved.push({ ...coords, order: stops[i], index: i + 1 });
        }
        if (i < stops.length - 1) {
          await new Promise((r) => setTimeout(r, 350));
        }
      }

      if (!cancelled) {
        setStopCoords(resolved);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [stops]);

  const routeLine = useMemo(() => {
    const pts = [];
    if (shipperPos) pts.push([shipperPos.lat, shipperPos.lng]);
    stopCoords.forEach((s) => pts.push([s.lat, s.lng]));
    return pts;
  }, [shipperPos, stopCoords]);

  const mapCenter = useMemo(() => {
    if (shipperPos) return [shipperPos.lat, shipperPos.lng];
    if (stopCoords[0]) return [stopCoords[0].lat, stopCoords[0].lng];
    return DEFAULT_CENTER;
  }, [shipperPos, stopCoords]);

  const hasMapData = shipperPos || stopCoords.length > 0;

  return (
    <div className={`sp-route-map${tall ? " sp-route-map--tall" : ""}`}>
      {loading && <div className="sp-route-map__status">Plotting delivery stops…</div>}
      {!loading && geoError && !stopCoords.length && (
        <div className="sp-route-map__status sp-route-map__status--muted">
          Enable location to track your position on the map
        </div>
      )}

      <MapContainer
        center={mapCenter}
        zoom={13}
        className="sp-route-map__canvas"
        scrollWheelZoom
        attributionControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />

        <MapBounds points={stopCoords} shipperPos={shipperPos} />

        {shipperPos && (
          <Marker
            position={[shipperPos.lat, shipperPos.lng]}
            icon={shipperIcon()}
            zIndexOffset={1000}
          >
            <Popup>Your current location</Popup>
          </Marker>
        )}

        {stopCoords.map((s) => (
          <Marker
            key={s.order.id}
            position={[s.lat, s.lng]}
            icon={stopIcon(s.index)}
          >
            <Popup>
              <strong>Stop {s.index}</strong>
              <br />
              {s.order.client_name}
            </Popup>
          </Marker>
        ))}

        {routeLine.length > 1 && (
          <Polyline
            positions={routeLine}
            pathOptions={{ color: "#15803d", weight: 4, opacity: 0.85, dashArray: "10 8" }}
          />
        )}
      </MapContainer>

      {!hasMapData && !loading && (
        <div className="sp-route-map__empty-overlay">
          <i className="fa-solid fa-map-location-dot" aria-hidden />
          <span>Waiting for GPS or delivery stops</span>
        </div>
      )}
    </div>
  );
}
