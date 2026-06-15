import React, { useEffect, useRef } from "react";

export function StoreList({ stores, selectedStoreId, onSelectStore, onDirections }) {
  const selectedRef = useRef(null);

  useEffect(() => {
    if (selectedStoreId && selectedRef.current) {
      selectedRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedStoreId]);

  if (!stores.length) {
    return (
      <div className="store-locator-list-empty">
        <p>No shops found.</p>
      </div>
    );
  }

  return (
    <ul className="store-locator-list" aria-label="List of shops">
      {stores.map((store) => (
        <li
          key={store.id}
          ref={selectedStoreId === store.id ? selectedRef : undefined}
          className={`store-locator-list-item ${selectedStoreId === store.id ? "store-locator-list-item-selected" : ""}`}
        >
          <button
            type="button"
            className="store-locator-list-item-inner"
            onClick={() => onSelectStore(store)}
            aria-pressed={selectedStoreId === store.id}
          >
            <h3 className="store-locator-list-item-name">{store.name}</h3>
            <p className="store-locator-list-item-address">{store.address}</p>
            <p className="store-locator-list-item-hours">{store.openingHours}</p>
            <p className="store-locator-list-item-days">{store.daysOpen}</p>
            {store.brandId ? (
              <p className="store-locator-list-item-brand">
                <i className="fa-solid fa-flag" aria-hidden="true" /> {store.brandId}
              </p>
            ) : null}
          </button>
          <button
            type="button"
            className="store-locator-list-item-directions"
            onClick={(e) => {
              e.stopPropagation();
              onDirections(store);
            }}
          >
            Directions
          </button>
        </li>
      ))}
    </ul>
  );
}
