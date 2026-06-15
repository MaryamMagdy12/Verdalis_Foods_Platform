import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = defaultIcon;

function MapUpdater({ center, stores, userLocation }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    if (center && center.lat != null && center.lng != null) {
      map.setView([center.lat, center.lng], map.getZoom());
    } else if (stores.length > 0 || userLocation) {
      const bounds = L.latLngBounds();
      stores.forEach((s) => bounds.extend([s.latitude, s.longitude]));
      if (userLocation) bounds.extend([userLocation.lat, userLocation.lng]);
      if (!bounds.isEmpty()) map.fitBounds(bounds, { padding: [24, 24], maxZoom: 14 });
    }
  }, [map, center?.lat, center?.lng, stores, userLocation]);
  return null;
}

export function StoreMap({ stores, center, userLocation, selectedStoreId, onSelectStore }) {
  const firstStore = stores[0];
  const defaultCenter = firstStore
    ? [firstStore.latitude, firstStore.longitude]
    : [43.6532, -79.3832];
  const defaultZoom = 6;

  return (
    <div className="store-locator-map-wrap">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="store-locator-map"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />
        <MapUpdater center={center} stores={stores} userLocation={userLocation} />
        {stores.map((store) => (
          <Marker
            key={store.id}
            position={[store.latitude, store.longitude]}
            eventHandlers={{
              click: () => onSelectStore(store)
            }}
          >
            <Popup>
              <strong>{store.name}</strong>
              <br />
              {store.address}
            </Popup>
          </Marker>
        ))}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} zIndexOffset={1000}>
            <Popup>Your location</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
