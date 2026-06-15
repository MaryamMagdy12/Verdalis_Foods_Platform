import React, { useState } from "react";
import { apiPatchAuth, apiPostFormAuth } from "../../api/client";
import { LocationMapPicker } from "../shared/LocationMapPicker";

export function CompleteProfileModal({ user, onComplete, onClose }) {
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    password: "",
    password_confirmation: "",
    line1: user?.address || "",
    city: "",
    postal_code: "",
    country: "CA",
    location_lat: user?.location_lat ?? null,
    location_lng: user?.location_lng ?? null,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleMapPick = (loc) => {
    setForm((prev) => ({
      ...prev,
      location_lat: loc.lat,
      location_lng: loc.lng,
      address: loc.line1 || loc.displayName || prev.address,
      line1: loc.line1 || prev.line1,
      city: loc.city || prev.city,
      postal_code: loc.postal_code || prev.postal_code,
      country: loc.country || prev.country,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const body = {
        name: form.name,
        phone: form.phone,
        address: form.address,
        location_lat: form.location_lat,
        location_lng: form.location_lng,
        shipping_address: {
          line1: form.line1 || form.address,
          city: form.city,
          postal_code: form.postal_code,
          country: form.country,
          latitude: form.location_lat,
          longitude: form.location_lng,
        },
      };
      if (form.password) {
        body.password = form.password;
        body.password_confirmation = form.password_confirmation;
      }
      const res = await apiPatchAuth("auth/profile/complete", body);
      onComplete(res.data);
    } catch (err) {
      setError(err.body?.message || err.message || "Could not save profile.");
      if (err.body?.errors) {
        setError(Object.values(err.body.errors).flat().join(" "));
      }
    } finally {
      setLoading(false);
    }
  };

  const uploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("photo", file);
    try {
      await apiPostFormAuth("auth/profile/photo", fd);
    } catch (_) {}
  };

  return (
    <div className="ck-profile-modal" role="dialog" aria-modal="true">
      <div className="ck-profile-modal__card">
        <h2>Complete your profile</h2>
        <p>
          {user?.google_id
            ? "You signed in with Google. Add your delivery details below to place your order."
            : "We need a few details before you can check out."}
        </p>
        {error && <p className="ck-login-error">{error}</p>}
        <form onSubmit={submit}>
          <label className="ck-field">
            <span>Full name</span>
            <input required value={form.name} onChange={update("name")} />
          </label>
          <label className="ck-field">
            <span>Phone</span>
            <input required type="tel" value={form.phone} onChange={update("phone")} />
          </label>
          <label className="ck-field">
            <span>Street address</span>
            <input required value={form.address} onChange={update("address")} />
          </label>
          <label className="ck-field">
            <span>City</span>
            <input required value={form.city} onChange={update("city")} />
          </label>
          <label className="ck-field">
            <span>Postal code</span>
            <input required value={form.postal_code} onChange={update("postal_code")} />
          </label>

          <LocationMapPicker
            label="Delivery location — pick on map"
            value={
              form.location_lat != null && form.location_lng != null
                ? { lat: form.location_lat, lng: form.location_lng }
                : null
            }
            onChange={handleMapPick}
          />

          {user?.google_id && (
            <>
              <label className="ck-field">
                <span>Set a password (optional, for email login)</span>
                <input type="password" minLength={8} value={form.password} onChange={update("password")} />
              </label>
              <label className="ck-field">
                <span>Confirm password</span>
                <input type="password" value={form.password_confirmation} onChange={update("password_confirmation")} />
              </label>
            </>
          )}

          <label className="ck-field">
            <span>Profile photo (optional)</span>
            <input type="file" accept="image/*" onChange={uploadPhoto} />
          </label>

          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
            <button type="submit" className="ck-btn ck-btn--primary" disabled={loading}>
              {loading ? "Saving…" : "Continue to payment"}
            </button>
            {onClose && (
              <button type="button" className="ck-btn" onClick={onClose}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
