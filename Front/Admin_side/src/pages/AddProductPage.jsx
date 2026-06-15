import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import { fadeUp } from "../animations/motionPresets";
import { ScrollReveal } from "../components/shared/ScrollReveal";
import { apiGet, apiPost, apiPut, apiUpload } from "../api/admin";
import { ConfirmModal } from "../components/shared/ConfirmModal";
import "../assets/css/pages/AddProductPage.css";
import { AdminPageShell } from "../components/dashboard/AdminPageShell";
import { AdminPageHeader } from "../components/dashboard/AdminPageHeader";
import { storageUrl } from "../utils/storageUrl";

export function AddProductPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadProduct, setLoadProduct] = useState(!!editId);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    category_id: "",
    name: "",
    sku: "",
    description: "",
    price: "",
    wholesale_price: "",
    stock: "",
    min_quantity: "1",
    wholesale_min_quantity: "1",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiGet("admin/categories");
        if (!cancelled) setCategories(res.data || []);
      } catch (_) {
        if (!cancelled) setCategories([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => () => {
    if (imagePreview && imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  useEffect(() => {
    if (!editId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiGet(`admin/products/${editId}`);
        if (!cancelled && res.data) {
          const p = res.data;
          const imageUrl = p.image_url ?? p.image ?? null;
          setForm({
            category_id: String(p.category_id ?? ""),
            name: p.name ?? "",
            sku: p.sku ?? "",
            description: p.description ?? "",
            price: p.price ?? "",
            wholesale_price: p.wholesale_price ?? "",
            stock: p.stock ?? "",
            min_quantity: String(p.min_quantity ?? 1),
            wholesale_min_quantity: String(p.wholesale_min_quantity ?? 1),
            image: null,
          });
          if (imageUrl && typeof imageUrl === "string") {
            setImagePreview(storageUrl(imageUrl));
          }
        }
      } catch (_) {}
      setLoadProduct(false);
    })();
    return () => { cancelled = true; };
  }, [editId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setForm((prev) => ({ ...prev, image: file || null }));
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
    e.target.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const doSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      if (editId) {
        const body = {
          category_id: form.category_id ? Number(form.category_id) : undefined,
          name: form.name || undefined,
          sku: form.sku || undefined,
          description: form.description || undefined,
          price: form.price || undefined,
          wholesale_price: form.wholesale_price || undefined,
          stock: form.stock !== "" ? Number(form.stock) : undefined,
          min_quantity: form.min_quantity !== "" ? Number(form.min_quantity) : undefined,
          wholesale_min_quantity: form.wholesale_min_quantity !== "" ? Number(form.wholesale_min_quantity) : undefined,
        };
        if (form.image) {
          const fd = new FormData();
          fd.append("_method", "PUT");
          fd.append("category_id", form.category_id);
          fd.append("name", form.name);
          fd.append("sku", form.sku);
          fd.append("description", form.description);
          fd.append("price", form.price);
          fd.append("wholesale_price", form.wholesale_price);
          fd.append("stock", form.stock);
          fd.append("min_quantity", form.min_quantity);
          fd.append("wholesale_min_quantity", form.wholesale_min_quantity);
          fd.append("image", form.image);
          await apiUpload("POST", `admin/products/${editId}`, fd);
        } else {
          await apiPut(`admin/products/${editId}`, body);
        }
        navigate("/admin/products");
      } else {
        const fd = new FormData();
        fd.append("category_id", form.category_id);
        fd.append("name", form.name);
        fd.append("sku", form.sku);
        fd.append("description", form.description);
        fd.append("price", form.price);
        if (form.wholesale_price) fd.append("wholesale_price", form.wholesale_price);
        fd.append("stock", form.stock || "0");
        fd.append("min_quantity", form.min_quantity || "1");
        fd.append("wholesale_min_quantity", form.wholesale_min_quantity || "1");
        if (form.image) fd.append("image", form.image);
        await apiUpload("POST", "admin/products", fd);
        navigate("/admin/products");
      }
    } catch (err) {
      setError(err.message || (err.body?.message) || "Failed to save.");
      if (err.errors) setError(Object.values(err.errors).flat().join(" "));
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  if (loadProduct) {
    return (
      <AdminPageShell>
        <p className="admin-loading">Loading…</p>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell>
            <div className="admin-form-wrap">

      <AdminPageHeader title={editId ? "Edit Product" : "Add Product"} breadcrumb="Products" />


      <ScrollReveal className="add-product-form admin-form-card" once={false}>
        {error && <p className="add-product-error" role="alert">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="add-product-row">
            <div className="add-product-field">
              <label className="add-product-label">Product Name</label>
              <input
                type="text"
                name="name"
                className="add-product-input"
                placeholder="Enter product name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="add-product-field">
              <label className="add-product-label">SKU</label>
              <input
                type="text"
                name="sku"
                className="add-product-input"
                placeholder="e.g. PRD-001"
                value={form.sku}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="add-product-row">
            <div className="add-product-field">
              <label className="add-product-label">Product Category</label>
              <select
                name="category_id"
                className="add-product-select"
                value={form.category_id}
                onChange={handleChange}
                required
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="add-product-field">
              <label className="add-product-label">Retail price</label>
              <input
                type="text"
                name="price"
                className="add-product-input"
                placeholder="Client price"
                value={form.price}
                onChange={handleChange}
                required
              />
            </div>
            <div className="add-product-field">
              <label className="add-product-label">Retailer price (wholesale)</label>
              <input
                type="text"
                name="wholesale_price"
                className="add-product-input"
                placeholder="Approved retailer price"
                value={form.wholesale_price}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="add-product-row">
            <div className="add-product-field">
              <label className="add-product-label">Stock quantity</label>
              <input
                type="number"
                name="stock"
                min="0"
                className="add-product-input"
                placeholder="Available units"
                value={form.stock}
                onChange={handleChange}
                required
              />
            </div>
            <div className="add-product-field">
              <label className="add-product-label">Min qty (client)</label>
              <input
                type="number"
                name="min_quantity"
                min="1"
                className="add-product-input"
                value={form.min_quantity}
                onChange={handleChange}
                required
              />
            </div>
            <div className="add-product-field">
              <label className="add-product-label">Min qty (retailer)</label>
              <input
                type="number"
                name="wholesale_min_quantity"
                min="1"
                className="add-product-input"
                value={form.wholesale_min_quantity}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        
          <div className="add-product-field full">
            <label className="add-product-label">Product Description</label>
            <textarea
              name="description"
              className="add-product-textarea"
              placeholder="Enter detailed description"
              rows={4}
              value={form.description}
              onChange={handleChange}
            />
          </div>
          <div className="add-product-field full">
            <label className="add-product-label">Product Image Upload</label>
            <div
              className="add-product-upload-zone"
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="add-product-image-preview" />
                  <button type="button" className="add-product-upload-btn">Change</button>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faImage} className="add-product-upload-icon" />
                  <p style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", color: "var(--admin-gray-500)" }}>
                    Drop image or click to upload
                  </p>
                  <button type="button" className="add-product-upload-btn">Upload Image</button>
                </>
              )}
            </div>
          </div>
          <div className="add-product-actions">
            <button type="submit" className="add-product-btn-submit" disabled={loading}>
              {loading ? "Saving…" : editId ? "Update" : "Add"}
            </button>
            <button type="button" className="add-product-btn-cancel" onClick={() => navigate("/admin/products")}>
              Cancel
            </button>
          </div>
        </form>
      </ScrollReveal>
      </div>
      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={doSubmit}
        title={editId ? "Save changes?" : "Add product?"}
        message={editId ? "Are you sure you want to save these changes?" : "Are you sure you want to add this product?"}
        confirmLabel={editId ? "Save" : "Add"}
        cancelLabel="Cancel"
      />
    </AdminPageShell>
  );
}
