import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiGet } from "../api/client";
import { cachedApiGet } from "../utils/catalogCache";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "../assets/css/platform-design.css";
import "../assets/css/product-detail.css";
import "../assets/css/home-sections.css";
import { clampQuantity, maxQuantity, minQuantity, quantityHint } from "../utils/productQuantity";

export function ProductDetailPage() {
  const { id } = useParams();
  const { addItem } = useCart();
  const { isRetailer } = useAuth();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addError, setAddError] = useState("");

  useEffect(() => {
    setLoading(true);
    cachedApiGet(`products/${id}`)
      .then((res) => {
        setProduct(res.data);
        setRelated(res.related || []);
        const p = res.data;
        const min = isRetailer ? p.wholesale_min_quantity : p.min_quantity;
        setQty(Math.max(min || 1, 1));
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id, isRetailer]);

  if (loading) {
    return (
      <section className="vf-section vf-section--product-detail">
        <div className="vf-container">
          <div className="vf-skeleton" style={{ height: 400 }} />
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="vf-section vf-section--product-detail vf-container vf-empty">
        <i className="fa-solid fa-box-open" />
        <p>Product not found.</p>
        <Link to="/products" className="vf-btn vf-btn--primary">Back to shop</Link>
      </section>
    );
  }

  const minQty = minQuantity(product, isRetailer);
  const maxQty = maxQuantity(product);
  const hint = quantityHint(product, isRetailer);

  return (
    <section className="vf-section vf-section--product-detail">
      <div className="vf-container product-detail-grid">
        <div className="product-detail-gallery vf-card">
          {product.image ? <img src={product.image} alt={product.name} /> : null}
        </div>
        <div className="product-detail-info">
          <p className="vf-kicker">{product.category?.name}</p>
          <h1 className="vf-title product-detail-title">{product.name}</h1>
          <p className="product-detail-price">${Number(isRetailer && product.wholesale_price ? product.wholesale_price : product.price).toFixed(2)}</p>
          {hint && <p className="vf-lede product-detail-hint">{hint}</p>}
          {product.description && <p className="product-detail-desc">{product.description}</p>}
          <p className="product-detail-meta">SKU: {product.sku} · {product.in_stock ? "In stock" : "Out of stock"}</p>
          <div className="product-detail-actions">
            <input
              type="number"
              min={minQty}
              max={maxQty}
              value={qty}
              onChange={(e) => setQty(clampQuantity(Number(e.target.value) || minQty, product, isRetailer))}
            />
            {addError && <p className="ck-login-error">{addError}</p>}
            <button
              type="button"
              className="vf-btn vf-btn--primary"
              disabled={!product.in_stock || maxQty < minQty}
              onClick={() => {
                const res = addItem({ ...product }, qty);
                if (!res?.ok) setAddError(res.error || "Could not add to cart.");
                else setAddError("");
              }}
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <div className="vf-container product-detail-related">
          <h2 className="vf-title product-detail-related-title">Related products</h2>
          <div className="hp-product-grid">
            {related.map((p) => (
              <Link key={p.id} to={`/products/${p.id}`} className="hp-product-card product-detail-related-card">
                {p.image && <img src={p.image} alt="" />}
                <div className="hp-product-card-body">
                  <h3>{p.name}</h3>
                  <p className="hp-product-price">${Number(p.price).toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
