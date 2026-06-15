import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEdit, faImage, faStar } from "@fortawesome/free-solid-svg-icons";
import { ScrollReveal } from "../shared/ScrollReveal";
import "../../assets/css/components/ProductDashTable.css";

export function ProductDashTable({ products = [], loading, onEdit, onDelete, onHighlight }) {
  if (loading) {
    return (
      <ScrollReveal className="product-dash-table-wrap" once={false}>
        <div className="product-dash-table-loading">Loading products…</div>
      </ScrollReveal>
    );
  }

  return (
    <ScrollReveal className="product-dash-table-wrap" once={false}>
      <div className="product-dash-table-scroll">
        <table className="product-dash-table">
          <thead>
            <tr>
              <th>Product Image</th>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Retailer price</th>
              <th>Stock</th>
              <th>Best selling</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={9} className="product-dash-table-empty">No products found.</td>
              </tr>
            ) : (
              products.map((row) => (
                <tr key={row.id}>
                  <td>
                    {row.image ? (
                      <img
                        src={row.image.startsWith("http") ? row.image : `${(import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "")}/storage/${row.image}`}
                        alt=""
                        className="product-dash-table-img"
                      />
                    ) : (
                      <div className="product-dash-table-no-img" title="No image uploaded">
                        <FontAwesomeIcon icon={faImage} className="product-dash-table-no-img-icon" />
                        <span>No image</span>
                      </div>
                    )}
                  </td>
                  <td>{row.name}</td>
                  <td>{row.sku}</td>
                  <td>{row.category?.name ?? "—"}</td>
                  <td>{row.price != null ? `$${Number(row.price).toFixed(2)}` : "—"}</td>
                  <td>{row.wholesale_price != null ? `$${Number(row.wholesale_price).toFixed(2)}` : "—"}</td>
                  <td>{row.stock != null ? row.stock : "—"}</td>
                  <td>
                    <button
                      type="button"
                      className={`product-dash-table-action-btn product-dash-table-action-highlight ${row.highlighted ? "is-highlighted" : ""}`}
                      onClick={() => onHighlight?.(row)}
                      title={row.highlighted ? "Remove from Best Selling" : "Add to Best Selling"}
                    >
                      <FontAwesomeIcon icon={faStar} className={row.highlighted ? "" : "product-dash-table-star-off"} /> {row.highlighted ? "On" : "Off"}
                    </button>
                  </td>
                  <td>
                    <div className="product-dash-table-actions">
                      <button
                        type="button"
                        className="product-dash-table-action-btn product-dash-table-action-edit"
                        onClick={() => onEdit?.(row)}
                      >
                        <FontAwesomeIcon icon={faEdit} /> Edit
                      </button>
                      <button
                        type="button"
                        className="product-dash-table-action-btn product-dash-table-action-delete"
                        onClick={() => onDelete?.(row)}
                      >
                        <FontAwesomeIcon icon={faTrash} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </ScrollReveal>
  );
}
