import React, { useEffect, useMemo, useState } from "react";
import { useCart } from "../../context/CartContext";
import { ProductCard } from "./ProductCard";
import { ProductModal } from "./ProductModal";

const QUICK_FILTERS = [
  { id: "all", label: "All Products" },
  { id: "bestseller", label: "Bestseller" },
  { id: "new", label: "New Arrival" },
  { id: "popular", label: "Popular" },
];

const SORT_OPTIONS = [
  { id: "featured", label: "Sort by: Featured" },
  { id: "name-asc", label: "Sort by: Name (A–Z)" },
  { id: "name-desc", label: "Sort by: Name (Z–A)" },
];

function getBadge(product, index) {
  if (product.highlighted) return "Bestseller";
  if (index % 7 === 1) return "New Arrival";
  if (index % 5 === 2) return "Popular";
  return null;
}

export function ProductsCatalog({
  reduce,
  products = [],
  categories = [],
  categoryFilter,
  search = "",
  onCategoryChange,
  onSearchChange,
  quickFilter,
  onQuickFilterChange,
  sortBy,
  onSortChange,
}) {
  const { addItem } = useCart();
  const [viewMoreProduct, setViewMoreProduct] = useState(null);
  const [searchDraft, setSearchDraft] = useState(search);

  useEffect(() => {
    setSearchDraft(search);
  }, [search]);

  const submitSearch = (e) => {
    e?.preventDefault();
    onSearchChange?.(searchDraft.trim());
  };

  const displayed = useMemo(() => {
    let list = [...products];
    if (quickFilter === "bestseller") list = list.filter((p) => p.highlighted);
    else if (quickFilter === "new") list = list.slice().sort((a, b) => Number(b.id) - Number(a.id));
    else if (quickFilter === "popular") list = list.filter((p) => p.highlighted).concat(list.filter((p) => !p.highlighted));

    if (sortBy === "name-asc") list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    else if (sortBy === "name-desc") list.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
    else list.sort((a, b) => (b.highlighted ? 1 : 0) - (a.highlighted ? 1 : 0) || (a.name || "").localeCompare(b.name || ""));

    return list;
  }, [products, quickFilter, sortBy]);

  useEffect(() => {
    if (viewMoreProduct) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [viewMoreProduct]);

  const categoryOptions = [
    { id: "All", name: "All Categories" },
    ...categories.map((c) => ({ id: String(c.id), name: c.name })),
  ];

  return (
    <section className="pp-catalog" id="pp-catalog">
      <div className="pp-container">
        <div className="pp-catalog__head">
          <h2 className="pp-section-title">All Products</h2>
          <form className="pp-catalog__search" onSubmit={submitSearch}>
            <input
              type="search"
              placeholder="Search products…"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              aria-label="Search products"
            />
            <button type="submit" className="pp-btn--outline" aria-label="Search products">
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
            </button>
          </form>
        </div>

        <div className="pp-catalog__toolbar">
          <div className="pp-catalog__pills">
            {QUICK_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`pp-pill${quickFilter === f.id ? " pp-pill--active" : ""}`}
                onClick={() => onQuickFilterChange?.(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="pp-catalog__dropdowns">
            <select
              className="pp-select"
              value={categoryFilter}
              onChange={(e) => onCategoryChange?.(e.target.value)}
              aria-label="Filter by category"
            >
              {categoryOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id === "All" ? "All Categories" : c.name}
                </option>
              ))}
            </select>
            <select
              className="pp-select"
              value={sortBy}
              onChange={(e) => onSortChange?.(e.target.value)}
              aria-label="Sort products"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {displayed.length === 0 ? (
          <p className="pp-catalog__empty">No products match your filters.</p>
        ) : (
          <div className="pp-catalog__grid">
            {displayed.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                variant="catalog"
                badge={getBadge(p, i)}
                reduce={reduce}
                onViewMore={setViewMoreProduct}
                onAddToCart={addItem}
              />
            ))}
          </div>
        )}
      </div>

      {viewMoreProduct && (
        <ProductModal
          product={viewMoreProduct}
          allProducts={displayed}
          onClose={() => setViewMoreProduct(null)}
          onAddToCart={(p) => {
            addItem(p ?? viewMoreProduct);
            setViewMoreProduct(null);
          }}
        />
      )}
    </section>
  );
}
