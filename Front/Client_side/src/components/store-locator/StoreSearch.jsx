import React, { useState } from "react";

export function StoreSearch({ onSearch, disabled }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) onSearch(trimmed);
  };

  return (
    <form className="store-locator-search" onSubmit={handleSubmit}>
      <label className="store-locator-search-label" htmlFor="store-locator-input">
        Search Location
      </label>
      <div className="store-locator-search-row">
        <input
          id="store-locator-input"
          type="text"
          className="store-locator-search-input"
          placeholder="Postal code or full address"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={disabled}
          aria-label="Enter a postal code or full address to find nearby stores"
        />
        <button type="submit" className="store-locator-search-btn" disabled={disabled} aria-label="Search">
          <i className="fa-solid fa-search" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
