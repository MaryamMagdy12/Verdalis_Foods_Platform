import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiGet, apiUpload, apiPut } from "../api/admin";
import { AdminPageShell } from "../components/dashboard/AdminPageShell";
import { AdminPageHeader } from "../components/dashboard/AdminPageHeader";

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  shipper_pin: "",
};

export function AddShipperPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const isEdit = Boolean(editId);
  const [form, setForm] = useState(EMPTY_FORM);
  const [existing, setExisting] = useState({
    photo_url: null,
    shipper_identity_url: null,
    shipper_certificate_urls: [],
  });
  const [photo, setPhoto] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pinIsHashed, setPinIsHashed] = useState(false);

  useEffect(() => {
    if (!editId) return;
    setLoadingShipper(true);
    apiGet(`admin/shippers/${editId}`)
      .then((res) => {
        const s = res.data;
        setForm({
          name: s.name || "",
          email: s.email || "",
          password: "",
          phone: s.phone || "",
          address: s.address || "",
          shipper_pin: s.pin_is_hashed ? "" : (s.shipper_pin || ""),
        });
        setPinIsHashed(Boolean(s.pin_is_hashed));
        setExisting({
          photo_url: s.photo_url || null,
          shipper_identity_url: s.shipper_identity_url || null,
          shipper_certificate_urls: s.shipper_certificate_urls || [],
        });
      })
      .catch(() => setError("Failed to load shipper."))
      .finally(() => setLoadingShipper(false));
  }, [editId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!isEdit && (!photo || !identity || certificates.length === 0)) {
      setError("Photo, identity document, and at least one certificate are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (isEdit) {
        const hasFiles = photo || identity || certificates.length > 0;
        const payload = {
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          shipper_pin: form.shipper_pin,
        };
        if (form.password) payload.password = form.password;

        if (hasFiles) {
          const fd = new FormData();
          fd.append("_method", "PUT");
          Object.entries(payload).forEach(([k, v]) => fd.append(k, v));
          if (photo) fd.append("photo", photo);
          if (identity) fd.append("identity", identity);
          certificates.forEach((file) => fd.append("certificates[]", file));
          await apiUpload("POST", `admin/shippers/${editId}`, fd);
        } else {
          await apiPut(`admin/shippers/${editId}`, payload);
        }
      } else {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        fd.append("photo", photo);
        fd.append("identity", identity);
        certificates.forEach((file) => fd.append("certificates[]", file));
        await apiUpload("POST", "admin/shippers", fd);
      }
      navigate("/admin/shippers");
    } catch (err) {
      setError(err.message || `Failed to ${isEdit ? "update" : "create"} shipper.`);
      if (err.errors) setError(Object.values(err.errors).flat().join(" "));
    } finally {
      setLoading(false);
    }
  };

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  if (loadingShipper) {
    return (
      <AdminPageShell>
        <div className="admin-form-wrap">
          <AdminPageHeader title="Edit Shipper" breadcrumb="Shippers" />
          <p>Loading shipper…</p>
        </div>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell>
      <div className="admin-form-wrap">
        <AdminPageHeader title={isEdit ? "Edit Shipper" : "Add Shipper"} breadcrumb="Shippers" />
        {error && <p className="admin-alert-error">{error}</p>}
        <form className="admin-form-card" onSubmit={submit} encType="multipart/form-data">
          <label>
            Full name
            <input required value={form.name} onChange={update("name")} />
          </label>
          <label>
            Email
            <input type="email" required value={form.email} onChange={update("email")} />
          </label>
          <label>
            Phone
            <input required value={form.phone} onChange={update("phone")} />
          </label>
          <label>
            Address
            <textarea required rows={2} value={form.address} onChange={update("address")} />
          </label>
          <label>
            Password
            <input
              type="password"
              required={!isEdit}
              minLength={8}
              value={form.password}
              onChange={update("password")}
              placeholder={isEdit ? "Leave blank to keep current" : ""}
            />
          </label>
          <label>
            Company ID (PIN)
            {pinIsHashed && (
              <span className="admin-table-client-sub"> Legacy encrypted PIN — enter the plain PIN once to save it for display.</span>
            )}
            <input required={!isEdit || pinIsHashed} value={form.shipper_pin} onChange={update("shipper_pin")} placeholder={pinIsHashed ? "Enter company PIN" : ""} />
          </label>

          <label>
            Identity document (image or PDF)
            {isEdit && existing.shipper_identity_url && (
              <span className="admin-table-client-sub">
                {" "}
                <a href={existing.shipper_identity_url} target="_blank" rel="noreferrer">
                  View current document
                </a>
              </span>
            )}
            <input
              type="file"
              required={!isEdit}
              accept="image/*,.pdf"
              onChange={(e) => setIdentity(e.target.files?.[0] || null)}
            />
          </label>

          <label>
            Certificates (image or PDF, multiple allowed)
            {isEdit && existing.shipper_certificate_urls.length > 0 && (
              <span className="admin-table-client-sub">
                {" "}
                {existing.shipper_certificate_urls.length} on file — upload new files to replace all
              </span>
            )}
            <input
              type="file"
              required={!isEdit}
              multiple
              accept="image/*,.pdf"
              onChange={(e) => setCertificates(Array.from(e.target.files || []))}
            />
            {certificates.length > 0 && (
              <span className="admin-table-client-sub">{certificates.length} new file(s) selected</span>
            )}
          </label>

          <label>
            Profile photo
            {isEdit && existing.photo_url && (
              <img
                src={existing.photo_url}
                alt=""
                style={{ display: "block", maxWidth: 80, borderRadius: 8, margin: "0.35rem 0" }}
              />
            )}
            <input
              type="file"
              required={!isEdit}
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
            />
          </label>

          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
            <button type="submit" className="admin-btn-primary" disabled={loading}>
              {loading ? "Saving…" : isEdit ? "Save changes" : "Create shipper"}
            </button>
            <button type="button" className="admin-btn-outline" onClick={() => navigate("/admin/shippers")}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AdminPageShell>
  );
}
