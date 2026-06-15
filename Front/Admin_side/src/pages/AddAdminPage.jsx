import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiGet, apiPost, apiPut } from "../api/admin";
import { AdminPageShell } from "../components/dashboard/AdminPageShell";
import { AdminPageHeader } from "../components/dashboard/AdminPageHeader";

export function AddAdminPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const isEdit = Boolean(editId);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!editId) return;
    apiGet(`admin/admins/${editId}`)
      .then((res) => {
        const a = res.data;
        setForm({ name: a.name || "", email: a.email || "", password: "" });
      })
      .catch(() => setError("Failed to load admin."));
  }, [editId]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;
      if (isEdit) {
        await apiPut(`admin/admins/${editId}`, payload);
      } else {
        await apiPost("admin/admins", form);
      }
      navigate("/admin/admins");
    } catch (err) {
      setError(err.message || `Failed to ${isEdit ? "update" : "create"} admin.`);
      if (err.errors) setError(Object.values(err.errors).flat().join(" "));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminPageShell>
      
      <div className="admin-form-wrap">
      <AdminPageHeader title={isEdit ? "Edit Admin" : "Add Admin"} breadcrumb="Admins" />

        {error && <p className="admin-alert-error" role="alert">{error}</p>}

        <form className="admin-form-card" onSubmit={submit}>
        <label>
          Full name
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Admin User"
          />
        </label>
        <label>
          Email
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="admin@verdalisfoods.com"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            required={!isEdit}
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder={isEdit ? "Leave blank to keep current password" : "Minimum 8 characters"}
          />
        </label>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
          <button type="submit" className="admin-btn-primary" disabled={loading}>
            {loading ? (isEdit ? "Saving…" : "Creating…") : (isEdit ? "Save changes" : "Create admin")}
          </button>
          <button type="button" className="admin-btn-outline" onClick={() => navigate("/admin/admins")}>
            Cancel
          </button>
        </div>
        </form>
      </div>
    </AdminPageShell>
  );
}
