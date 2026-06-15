import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faCircleCheck,
  faStar,
  faTriangleExclamation,
  faImage,
  faEdit,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { ProductDashFilters } from "../components/product-dashboard/ProductDashFilters";
import { apiGet, apiDelete, apiPut } from "../api/admin";
import { clearAdminCatalogCache, cachedAdminGet } from "../utils/catalogCache";
import { ConfirmModal } from "../components/shared/ConfirmModal";
import { AdminPageShell } from "../components/dashboard/AdminPageShell";
import { AdminPageHeader } from "../components/dashboard/AdminPageHeader";
import { AdminKpiRow } from "../components/dashboard/AdminKpiRow";
import { AdminDataTable, AdminTablePagination } from "../components/dashboard/AdminDataTable";
import { AdminStatusBadge } from "../components/dashboard/AdminStatusBadge";
import { storageUrl } from "../utils/storageUrl";

export function ProductDashboardPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await cachedAdminGet("admin/products", { category_id: categoryId || undefined });
      setProducts((res.data || []).map((p) => ({ ...p, highlighted: Boolean(p.highlighted) })));
    } catch (e) {
      setError(e.message || "Failed to load products.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    apiGet("admin/categories").then((res) => setCategories(res.data || [])).catch(() => {});
  }, []);

  const toggleHighlight = async (row) => {
    const next = !row.highlighted;
    setProducts((prev) =>
      prev.map((p) => (p.id === row.id ? { ...p, highlighted: next } : p))
    );
    try {
      const res = await apiPut(`admin/products/${row.id}`, { highlighted: next });
      clearAdminCatalogCache("admin/products");
      if (res?.data) {
        setProducts((prev) =>
          prev.map((p) => (p.id === row.id ? { ...p, ...res.data, highlighted: Boolean(res.data.highlighted) } : p))
        );
      }
    } catch (e) {
      setProducts((prev) =>
        prev.map((p) => (p.id === row.id ? { ...p, highlighted: !next } : p))
      );
      alert(e.message || "Failed to update highlight.");
    }
  };

  const doDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiDelete(`admin/products/${deleteTarget.id}`);
      clearAdminCatalogCache("admin/products");
      setDeleteTarget(null);
      loadProducts();
    } catch (e) {
      alert(e.message || "Delete failed.");
    }
  };

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.category?.name?.toLowerCase().includes(q)
    );
  }, [products, search]);

  const stats = useMemo(() => {
    const active = products.filter((p) => p.is_active !== false).length;
    const highlighted = products.filter((p) => p.highlighted).length;
    const outOfStock = products.filter((p) => p.stock != null && Number(p.stock) <= 0).length;
    return { total: products.length, active, highlighted, outOfStock };
  }, [products]);

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Products"
        actionLabel="Add Product"
        actionTo="/admin/add-product"
      />

      {error && <p className="admin-alert-error" role="alert">{error}</p>}

      <AdminKpiRow
        cards={[
          { label: "Total Products", value: String(stats.total), subtext: "In catalog", icon: faBox, iconVariant: "green" },
          { label: "Active Products", value: String(stats.active), subtext: "Visible on site", icon: faCircleCheck, iconVariant: "blue" },
          { label: "Best Selling", value: String(stats.highlighted), subtext: "Highlighted", icon: faStar, iconVariant: "yellow" },
          { label: "Out of Stock", value: String(stats.outOfStock), subtext: "Needs restock", icon: faTriangleExclamation, iconVariant: "red" },
        ]}
      />

      <ProductDashFilters
        categories={categories}
        categoryId={categoryId}
        search={search}
        onCategoryChange={setCategoryId}
        onSearchChange={setSearch}
      />

      <AdminDataTable loading={loading} loadingMessage="Loading products…">
        <thead>
          <tr>
            <th>Product</th>
            <th>SKU</th>
            <th>Category</th>
            <th>Price</th>
            <th>Retailer price</th>
            <th>Stock</th>
            <th>Best Selling</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length === 0 ? (
            <tr><td colSpan={9}>No products found.</td></tr>
          ) : (
            filteredProducts.map((row) => (
              <tr key={row.id}>
                <td>
                  <div className="admin-table-client">
                    {row.image ? (
                      <img
                        src={storageUrl(row.image)}
                        alt=""
                        className="admin-table-img"
                      />
                    ) : (
                      <div className="admin-table-img" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--admin-gray-500)" }}>
                        <FontAwesomeIcon icon={faImage} />
                      </div>
                    )}
                    <span className="admin-table-client-name">{row.name}</span>
                  </div>
                </td>
                <td>{row.sku || "—"}</td>
                <td>{row.category?.name ?? "—"}</td>
                <td className="admin-table-price">
                  {row.price != null ? `$${Number(row.price).toFixed(2)}` : "—"}
                </td>
                <td className="admin-table-price">
                  {row.wholesale_price != null ? `$${Number(row.wholesale_price).toFixed(2)}` : "—"}
                </td>
                <td>
                  {row.stock != null ? (
                    Number(row.stock) <= 0 ? (
                      <AdminStatusBadge status="failed" label={`${row.stock} (out)`} />
                    ) : (
                      row.stock
                    )
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  <button
                    type="button"
                    className={`admin-toggle-best ${row.highlighted ? "is-on" : ""}`}
                    onClick={() => toggleHighlight(row)}
                    aria-pressed={row.highlighted}
                  >
                    <FontAwesomeIcon icon={faStar} /> {row.highlighted ? "On" : "Off"}
                  </button>
                </td>
                <td>
                  <AdminStatusBadge status="active" label={row.is_active === false ? "Inactive" : "Active"} />
                </td>
                <td>
                  <div className="admin-table-actions">
                    <button
                      type="button"
                      className="admin-table-action-edit"
                      onClick={() => navigate(`/admin/add-product?edit=${row.id}`)}
                      aria-label="Edit"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      type="button"
                      className="admin-table-action-delete"
                      onClick={() => setDeleteTarget(row)}
                      aria-label="Delete"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </AdminDataTable>

      <AdminTablePagination showing="products" total={filteredProducts.length} pageSize={25} />

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={doDelete}
        title="Delete product"
        message={deleteTarget ? `Delete "${deleteTarget.name}"?` : ""}
        confirmLabel="Delete"
        variant="danger"
      />
    </AdminPageShell>
  );
}
