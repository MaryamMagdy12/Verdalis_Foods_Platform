import React, { useState, useEffect, useMemo } from "react";
import { apiGet } from "../../api/client";
import { sortStoresByDistance } from "../../utils/distance";
import { geocodeAddress } from "../../utils/geocode";
import { StoreSearch } from "./StoreSearch";
import { StoreList } from "./StoreList";
import { StoreMap } from "./StoreMap";
import { LocationModal } from "./LocationModal";
import { DirectionsModal } from "./DirectionsModal";
import "../../assets/css/StoreLocator.css";

const DEFAULT_CENTER = { lat: 43.6532, lng: -79.3832 };

function normalizeStore(s) {
  return {
    id: String(s.id),
    name: s.name,
    address: s.address,
    latitude: s.latitude,
    longitude: s.longitude,
    openingHours: s.opening_hours,
    daysOpen: s.days_open,
  };
}

const RADIUS_KM = 25;

export function StoreLocatorSection() {
  const [stores, setStores] = useState([]);
  const [storesLoading, setStoresLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCenter, setSearchCenter] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [geocodeLoading, setGeocodeLoading] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showDirectionsModal, setShowDirectionsModal] = useState(false);
  const [directionsStore, setDirectionsStore] = useState(null);
  const [selectedStoreId, setSelectedStoreId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiGet("stores");
        if (!cancelled) setStores((res.data || []).map(normalizeStore));
      } catch (_) {
        if (!cancelled) setStores([]);
      } finally {
        if (!cancelled) setStoresLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const centerPoint = userLocation || searchCenter;

  const filteredStores = useMemo(() => {
    if (searchResults !== null) return searchResults.map(normalizeStore);
    if (!stores.length) return [];
    if (centerPoint && centerPoint.lat != null && centerPoint.lng != null) {
      return sortStoresByDistance(stores, centerPoint.lat, centerPoint.lng);
    }
    return [...stores];
  }, [stores, centerPoint, searchResults]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setGeocodeLoading(true);
    setSearchCenter(null);
    setSearchResults(null);
    try {
      const res = await apiGet("stores", {
        location: query.trim(),
        radius_km: RADIUS_KM,
      });
      const data = res.data || [];
      const loc = res.search_location;
      setSearchResults(Array.isArray(data) ? data : []);
      if (loc && loc.latitude != null && loc.longitude != null) {
        setSearchCenter({ lat: loc.latitude, lng: loc.longitude });
      } else {
        const result = await geocodeAddress(query).catch(() => null);
        if (result) setSearchCenter({ lat: result.lat, lng: result.lng });
      }
    } catch (e) {
      const result = await geocodeAddress(query).catch(() => null);
      if (result) {
        setSearchCenter({ lat: result.lat, lng: result.lng });
      }
    } finally {
      setGeocodeLoading(false);
    }
  };

  const handleUseLocation = (coords) => {
    setUserLocation(coords);
    setSearchResults(null);
    setShowLocationModal(false);
  };

  const handleDirections = (store) => {
    setDirectionsStore(store);
    setShowDirectionsModal(true);
  };

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    const shown = sessionStorage.getItem("storeLocatorLocationModalShown");
    if (!shown) {
      setShowLocationModal(true);
      sessionStorage.setItem("storeLocatorLocationModalShown", "1");
    }
  }, []);

  const mapCenter = centerPoint || (filteredStores[0] ? { lat: filteredStores[0].latitude, lng: filteredStores[0].longitude } : DEFAULT_CENTER);

  return (
    <section className="store-locator-section" id="find-a-store">
      <h2 className="store-locator-heading">Find a Store Near You</h2>
      {storesLoading && (
        <div className="store-locator-loading">Loading stores…</div>
      )}

      <div className="store-locator-main">
        <div className="store-locator-panel store-locator-list-panel">
          <StoreSearch onSearch={handleSearch} disabled={geocodeLoading} />
          <div className="store-locator-count-row">
            <span className="store-locator-count">Number Of Shops: {filteredStores.length}</span>
            <button type="button" className="store-locator-print-btn" onClick={handlePrint}>
              <i className="fa-solid fa-print" aria-hidden="true" /> PRINT
            </button>
          </div>
          <div className="store-locator-list-scroll">
            <StoreList
              stores={filteredStores}
              selectedStoreId={selectedStoreId}
              onSelectStore={(store) => setSelectedStoreId(store.id)}
              onDirections={handleDirections}
            />
          </div>
          <button
            type="button"
            className="store-locator-find-near-me"
            onClick={() => setShowLocationModal(true)}
          >
            Find Near Me
          </button>
        </div>

        <div className="store-locator-panel store-locator-map-panel no-print">
          {geocodeLoading && (
            <div className="store-locator-map-loading">Loading…</div>
          )}
          <StoreMap
            stores={filteredStores}
            center={mapCenter}
            userLocation={userLocation}
            selectedStoreId={selectedStoreId}
            onSelectStore={(store) => setSelectedStoreId(store.id)}
          />
        </div>
      </div>

      {showLocationModal && (
        <LocationModal
          onClose={() => setShowLocationModal(false)}
          onUseLocation={handleUseLocation}
        />
      )}

      {showDirectionsModal && directionsStore && (
        <DirectionsModal
          store={directionsStore}
          fromLocation={userLocation || searchCenter}
          fromAddress={searchQuery}
          onClose={() => {
            setShowDirectionsModal(false);
            setDirectionsStore(null);
          }}
        />
      )}
    </section>
  );
}
