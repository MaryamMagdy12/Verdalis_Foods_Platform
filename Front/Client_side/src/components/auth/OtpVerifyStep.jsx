import React, { useState } from "react";

export function OtpVerifyStep({ email, onVerify, onBack, onResend, loading, error }) {
  const [code, setCode] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const submit = (e) => {
    e.preventDefault();
    onVerify(code);
  };

  const handleResend = async () => {
    if (!onResend) return;
    setResendLoading(true);
    setResendMessage("");
    const result = await onResend();
    setResendLoading(false);
    if (result.ok) {
      setResendMessage("A new code has been sent to your email.");
    } else {
      setResendMessage(result.error || "Could not resend code.");
    }
  };

  return (
    <form className="ck-login-form" onSubmit={submit}>
      <p className="ck-login-card__hint">
        Enter the 6-digit code sent to <strong>{email}</strong>
      </p>
      {error && (
        <p className="ck-login-error" role="alert">
          {error}
        </p>
      )}
      {resendMessage && (
        <p className="ck-login-card__hint" role="status">
          {resendMessage}
        </p>
      )}
      <label className="ck-field ck-field--icon">
        <span>Verification code</span>
        <i className="fa-solid fa-shield-halved" aria-hidden="true" />
        <input
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          autoComplete="one-time-code"
        />
      </label>
      <button type="submit" className="ck-btn ck-btn--primary ck-login-submit" disabled={loading || code.length !== 6}>
        {loading ? "Verifying…" : "Verify"}
        <i className="fa-solid fa-arrow-right" aria-hidden="true" />
      </button>
      {onResend && (
        <button
          type="button"
          className="ck-forgot"
          onClick={handleResend}
          disabled={resendLoading || loading}
          style={{ background: "none", border: 0, cursor: "pointer" }}
        >
          {resendLoading ? "Sending…" : "Resend code"}
        </button>
      )}
      <button type="button" className="ck-forgot" onClick={onBack} style={{ background: "none", border: 0, cursor: "pointer" }}>
        ← Back
      </button>
    </form>
  );
}
