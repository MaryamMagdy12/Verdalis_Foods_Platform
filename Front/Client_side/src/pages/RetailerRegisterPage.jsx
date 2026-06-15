import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AuthPageShell, AuthSignInLink } from "../components/auth/AuthPageShell";
import { OtpVerifyStep } from "../components/auth/OtpVerifyStep";
import { LocationMapPicker } from "../components/shared/LocationMapPicker";
import { uploadProfilePhoto, validateImageFile } from "../utils/fileUpload";

export function RetailerRegisterPage() {
  const { register, verifyRegisterOtp, resendOtp, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone: "",
    personal_address: "",
    store_name: "",
    store_address: "",
    location_lat: "",
    location_lng: "",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const payload = {
      ...form,
      role: "retailer",
      location_lat: form.location_lat ? Number(form.location_lat) : null,
      location_lng: form.location_lng ? Number(form.location_lng) : null,
    };
    const res = await register(payload);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    if (res.otpRequired) {
      setOtpEmail(res.email || form.email);
      setOtpStep(true);
      return;
    }
    navigate("/dashboard/orders");
  };

  const handleOtp = async (code) => {
    setLoading(true);
    setError("");
    const res = await verifyRegisterOtp(otpEmail, code);
    if (!res.ok) {
      setLoading(false);
      setError(res.error);
      return;
    }
    try {
      if (photoFile) await uploadProfilePhoto(photoFile);
      await refreshUser();
    } catch (uploadErr) {
      setError(uploadErr.message || "Application submitted but photo upload failed.");
      setLoading(false);
      navigate("/dashboard/profile");
      return;
    }
    setLoading(false);
    navigate("/dashboard/orders", { state: { retailerPending: true } });
  };

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPhotoFile(null);
      setPhotoPreview("");
      return;
    }
    const check = validateImageFile(file);
    if (!check.ok) {
      setError(check.error);
      e.target.value = "";
      return;
    }
    setError("");
    setPhotoFile(file);
    setPhotoPreview(check.previewUrl);
  };

  const handleMapPick = (loc) => {
    setForm((prev) => ({
      ...prev,
      location_lat: loc.lat,
      location_lng: loc.lng,
      store_address: loc.line1 || loc.displayName || prev.store_address,
    }));
  };

  if (otpStep) {
    return (
      <AuthPageShell
        title="Verify Email"
        hint="Enter the code we sent to complete your retailer application."
        tagline="Wholesale program"
        showValues
        footer={<AuthSignInLink />}
      >
        <OtpVerifyStep
          email={otpEmail}
          onVerify={handleOtp}
          onBack={() => setOtpStep(false)}
          onResend={() => resendOtp(otpEmail, "register")}
          loading={loading}
          error={error}
        />
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell
      title="Retailer Application"
      hint="Apply for wholesale pricing, bulk orders, and invoice billing. Accounts require admin approval."
      tagline="Wholesale program"
      showValues
      footer={
        <>
          <AuthSignInLink />
          <p className="ck-login-signup">
            Shopping as an individual? <Link to="/register">Client registration</Link>
          </p>
        </>
      }
    >
      {error && (
        <p className="ck-login-error" role="alert">
          {error}
        </p>
      )}

      <form className="ck-login-form" onSubmit={submit}>
        <label className="ck-field ck-field--icon">
          <span>Store name</span>
          <i className="fa-solid fa-store" aria-hidden="true" />
          <input required placeholder="Your store" value={form.store_name} onChange={update("store_name")} />
        </label>
        <label className="ck-field ck-field--icon">
          <span>Store address</span>
          <i className="fa-solid fa-location-dot" aria-hidden="true" />
          <input required placeholder="Store location" value={form.store_address} onChange={update("store_address")} />
        </label>
        <label className="ck-field ck-field--icon">
          <span>Contact name</span>
          <i className="fa-solid fa-user" aria-hidden="true" />
          <input required placeholder="Full name" value={form.name} onChange={update("name")} autoComplete="name" />
        </label>
        <label className="ck-field ck-field--icon">
          <span>Personal address</span>
          <i className="fa-solid fa-house" aria-hidden="true" />
          <input required placeholder="Your address" value={form.personal_address} onChange={update("personal_address")} />
        </label>
        <label className="ck-field ck-field--icon">
          <span>Business email</span>
          <i className="fa-solid fa-envelope" aria-hidden="true" />
          <input type="email" required placeholder="Enter your email" value={form.email} onChange={update("email")} autoComplete="email" />
        </label>
        <label className="ck-field ck-field--icon">
          <span>Phone</span>
          <i className="fa-solid fa-phone" aria-hidden="true" />
          <input required placeholder="Phone number" value={form.phone} onChange={update("phone")} autoComplete="tel" />
        </label>
        <LocationMapPicker
          label="Store location (optional) — pick on map"
          value={
            form.location_lat && form.location_lng
              ? { lat: Number(form.location_lat), lng: Number(form.location_lng) }
              : null
          }
          onChange={handleMapPick}
          height={180}
        />
        <label className="ck-field ck-field--icon">
          <span>Photo (optional, max 5 MB)</span>
          <i className="fa-solid fa-image" aria-hidden="true" />
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handlePhoto} />
        </label>
        {photoPreview && (
          <img src={photoPreview} alt="Photo preview" style={{ maxWidth: 96, borderRadius: 8, marginBottom: "0.5rem" }} />
        )}
        <label className="ck-field ck-field--icon">
          <span>Password</span>
          <i className="fa-solid fa-lock" aria-hidden="true" />
          <input
            type={showPass ? "text" : "password"}
            required
            minLength={8}
            placeholder="At least 8 characters"
            value={form.password}
            onChange={update("password")}
            autoComplete="new-password"
          />
          <button type="button" className="ck-field__toggle" onClick={() => setShowPass((v) => !v)} aria-label={showPass ? "Hide password" : "Show password"}>
            <i className={`fa-solid ${showPass ? "fa-eye-slash" : "fa-eye"}`} aria-hidden="true" />
          </button>
        </label>
        <label className="ck-field ck-field--icon">
          <span>Confirm password</span>
          <i className="fa-solid fa-lock" aria-hidden="true" />
          <input
            type={showPass ? "text" : "password"}
            required
            placeholder="Confirm password"
            value={form.password_confirmation}
            onChange={update("password_confirmation")}
            autoComplete="new-password"
          />
        </label>
        <button type="submit" className="ck-btn ck-btn--primary ck-login-submit" disabled={loading}>
          {loading ? "Sending code…" : "Submit application"}
          <i className="fa-solid fa-arrow-right" aria-hidden="true" />
        </button>
      </form>
    </AuthPageShell>
  );
}
