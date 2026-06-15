import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { ScrollReveal } from "../components/shared/ScrollReveal";
import { apiGet, apiPost, apiPut } from "../api/admin";
import { ConfirmModal } from "../components/shared/ConfirmModal";
import "../assets/css/pages/AddStorePage.css";
import { AdminPageShell } from "../components/dashboard/AdminPageShell";
import { AdminPageHeader } from "../components/dashboard/AdminPageHeader";

export function AddStorePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const [loading, setLoading] = useState(false);
  const [loadStore, setLoadStore] = useState(!!editId);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    openingHours: "",
    daysOpen: "",
  });
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!editId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiGet(`admin/stores/${editId}`);
        if (!cancelled && res.data) {
          const s = res.data;
          setForm({
            name: s.name ?? "",
            address: s.address ?? "",
            latitude: s.latitude ?? "",
            longitude: s.longitude ?? "",
            openingHours: s.opening_hours ?? "",
            daysOpen: s.days_open ?? "",
          });
        }
      } catch (_) {}
      setLoadStore(false);
    })();
    return () => { cancelled = true; };
  }, [editId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const doSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const body = {
        name: form.name,
        address: form.address,
        latitude: Number(form.latitude) || null,
        longitude: Number(form.longitude) || null,   
        opening_hours: form.openingHours || null,
        days_open: form.daysOpen || null,
      };
      if (editId) {
        await apiPut(`admin/stores/${editId}`, body);
      } else {
        await apiPost("admin/stores", body);
      }
      navigate("/admin/stores");
    } catch (err) {
      setError(err.message || (err.body?.message) || "Failed to save.");
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  if (loadStore) {
    return (
      <AdminPageShell>
        <p className="admin-loading">Loading…</p>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell>
          <div className="admin-form-wrap">
      <AdminPageHeader title={editId ? "Edit Store" : "Add Store"} breadcrumb="Stores" />

  
      <ScrollReveal className="add-store-form admin-form-card" once={false}>
        {error && <p className="add-store-error" role="alert">{error}</p>}
        <form onSubmit={handleSubmit}>
        <div className="add-store-row">
          <div className="add-store-field">
            <label className="add-store-label">Store Name</label>
            <input
              type="text"
              name="name"
              className="add-store-input"
              placeholder="e.g. Downtown Verdalis Foods"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="add-store-field full">
          <label className="add-store-label">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="add-store-label-icon" /> Address
          </label>
          <input
            type="text"
            name="address"
            className="add-store-input"
            placeholder="Full street address, city, province, postal code"
            value={form.address}
            onChange={handleChange}
          />
        </div>


        <div className="add-store-actions">
          <button type="submit" className="add-store-btn-submit" disabled={loading}>{loading ? "Saving…" : editId ? "Update" : "Add Store"}</button>
          <button type="button" className="add-store-btn-cancel" onClick={() => navigate("/admin/stores")}>Cancel</button>
        </div>
        </form>
      </ScrollReveal>
      </div>
      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={doSubmit}
        title={editId ? "Save changes?" : "Add store?"}
        message={editId ? "Are you sure you want to save these changes?" : "Are you sure you want to add this store?"}
        confirmLabel={editId ? "Save" : "Add"}
        cancelLabel="Cancel"
      />
    </AdminPageShell>
  );
}
