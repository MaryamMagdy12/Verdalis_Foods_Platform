import React from "react";

const PREFIX = {
  catalog: "products-card",
  home: "home-product-card",
};

export function ProductCard({
  product,
  variant = "catalog",
  rowDir = "left",
  animationDelay,
  reduce,
  onViewMore,
  onAddToCart,
  showTopRated = false,
  badge = null,
}) {
  if (!product) return null;

  const p = PREFIX[variant] || PREFIX.catalog;
  const isHome = variant === "home";

  const handleViewMore = (e) => {
    e?.preventDefault?.();
    onViewMore?.(product);
  };

  const handleAddToCart = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    onAddToCart?.(product);
  };

  if (isHome) {
    return (
      <article
        className={p + " " + p + "-row-" + rowDir}
        style={reduce ? undefined : animationDelay != null ? { animationDelay: `${animationDelay}s` } : undefined}
      >
        <div className={p + "-image-wrap"} onClick={handleViewMore}>
          {showTopRated && <span className={p + "-badge"}>TOP RATED</span>}
          {product.image ? (
            <img src={product.image} alt={product.name} className={p + "-image"} loading="lazy" />
          ) : (
            <div className={p + "-image-placeholder"} />
          )}
        </div>
        <div className={p + "-body"}>
          <h3 className={p + "-name"}>{product.name}</h3>
        </div>
        <div className={p + "-footer"}>
          <span className={p + "-sku"}>
            <i className="fa-solid fa-box" aria-hidden="true" />
            SKU: #{product.SKU ?? "—"}
          </span>
          <button type="button" className={p + "-footer-view"} onClick={handleViewMore} aria-label="View more">
            <i className="fa-solid fa-eye" aria-hidden="true" />
          </button>
        </div>
      </article>
    );
  }

  const origin = product.category?.name || "Verdalis";

  return (
    <article className="pp-card">
      {badge && <span className="pp-card__badge">{badge}</span>}
      <button type="button" className="pp-card__media" onClick={handleViewMore} aria-label={`View ${product.name}`}>
        {product.image ? (
          <img src={product.image} alt={product.name} loading="lazy" />
        ) : (
          <span className="pp-card__placeholder" aria-hidden="true" />
        )}
      </button>
      <div className="pp-card__body">
        <h3 className="pp-card__name">{product.name}</h3>
        {product.category?.name && <p className="pp-card__category">{product.category.name}</p>}
        <p className="pp-card__origin">
          <i className="fa-solid fa-globe" aria-hidden="true" />
          Origin: {origin}
        </p>
      </div>
      <div className="pp-card__actions">
        <button type="button" className="pp-card__cart" onClick={handleAddToCart} aria-label="Add to cart">
          <i className="fa-solid fa-cart-shopping" aria-hidden="true" />
        </button>
        <button type="button" className="pp-card__details" onClick={handleViewMore}>
          View Details
        </button>
      </div>
    </article>
  );
}
