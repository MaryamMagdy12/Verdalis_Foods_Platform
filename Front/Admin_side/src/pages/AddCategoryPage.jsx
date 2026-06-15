import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ScrollReveal } from "../components/shared/ScrollReveal";
import { apiGet, apiUpload } from "../api/admin";
import { ConfirmModal } from "../components/shared/ConfirmModal";
import "../assets/css/pages/AddCategoryPage.css";
import { AdminPageShell } from "../components/dashboard/AdminPageShell";
import { AdminPageHeader } from "../components/dashboard/AdminPageHeader";

export function AddCategoryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const [loading, setLoading] = useState(false);
  const [loadCat, setLoadCat] = useState(!!editId);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", description: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!editId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiGet(`admin/categories/${editId}`);
        if (!cancelled && res.data) {
          setForm({
            name: res.data.name ?? "",
            description: res.data.description ?? "",
          });
          setImagePreview(res.data.image_url ?? null);
        }
      } catch (_) {}
      setLoadCat(false);
    })();
    return () => { cancelled = true; };
  }, [editId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFile = (file) => {
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const doSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      if (form.description) fd.append("description", form.description);
      if (imageFile) fd.append("image", imageFile);
      if (editId) {
        fd.append("_method", "PUT");
        await apiUpload("POST", `admin/categories/${editId}`, fd);
      } else {
        await apiUpload("POST", "admin/categories", fd);
      }
      navigate("/admin/categories");
    } catch (err) {
      setError(err.message || (err.body?.message) || "Failed to save.");
      if (err.errors) setError(Object.values(err.errors).flat().join(" "));
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  if (loadCat) {
    return (
      <AdminPageShell>
        <p className="admin-loading">Loading…</p>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell>
          <div className="admin-form-wrap">
      <AdminPageHeader title={editId ? "Edit Category" : "Add Category"} breadcrumb="Categories" />

  
      <ScrollReveal className="add-category-form admin-form-card" once={false}>
        {error && <p className="add-category-error" role="alert">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="add-category-row">
            <div className="add-category-field">
              <label className="add-category-label">Category Name</label>
              <input
                type="text"
                name="name"
                className="add-category-input"
                placeholder="e.g. Beverages"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="add-category-field">
              <label className="add-category-label">Description (optional)</label>
              <input
                type="text"
                name="description"
                className="add-category-input"
                value={form.description}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="add-category-row">
            <div className="add-category-field">
              <label className="add-category-label">Category image</label>
              {imagePreview ? (
                <img src={imagePreview} alt="" style={{ maxWidth: 160, borderRadius: 8, display: "block", marginBottom: 8 }} />
              ) : null}
              <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0] || null)} />
            </div>
          </div>
          <div className="add-category-actions">
            <button type="submit" className="add-category-btn-submit" disabled={loading}>{loading ? "Saving…" : editId ? "Update" : "Add Category"}</button>
            <button type="button" className="add-category-btn-cancel" onClick={() => navigate("/admin/categories")}>Cancel</button>
          </div>
        </form>
      </ScrollReveal>
      </div>
      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={doSubmit}
        title={editId ? "Save changes?" : "Add category?"}
        message={editId ? "Are you sure you want to save these changes?" : "Are you sure you want to add this category?"}
        confirmLabel={editId ? "Save" : "Add"}
        cancelLabel="Cancel"
      />
    </AdminPageShell>
  );
}
