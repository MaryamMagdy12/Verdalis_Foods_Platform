import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AuthPageShell, AuthSignUpLink } from "../components/auth/AuthPageShell";
import { OtpVerifyStep } from "../components/auth/OtpVerifyStep";
import { GoogleSignInButton } from "../components/auth/GoogleSignInButton";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, verifyLoginOtp, forgotPassword, resetPassword, resendOtp, loginWithGoogle, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [mode, setMode] = useState("login");

  const from = location.state?.from || "/cart";

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, from, navigate]);

  if (isAuthenticated) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await login(email, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (result.otpRequired) {
      setOtpEmail(result.email || email);
      setOtpStep(true);
      return;
    }
    navigate(from, { replace: true });
  };

  const handleOtp = async (code) => {
    setLoading(true);
    setError("");
    const result = await verifyLoginOtp(otpEmail, code);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate(from, { replace: true });
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const result = await forgotPassword(email);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setOtpEmail(result.email || email);
    setMessage("If that email exists, a reset code has been sent.");
    setMode("reset");
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    const result = await resetPassword(otpEmail, resetCode, newPassword, confirmPassword);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage("Password reset. You can sign in with your new password.");
    setMode("login");
    setPassword("");
    setResetCode("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleGoogle = async (credential) => {
    setError("");
    const result = await loginWithGoogle(credential);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const dest = result.profileComplete === false ? "/checkout" : from;
    navigate(dest, { replace: true });
  };

  if (otpStep) {
    return (
      <AuthPageShell title="Verify Email" hint="Check your inbox for the sign-in code." showValues footer={<AuthSignUpLink />}>
        <OtpVerifyStep
          email={otpEmail}
          onVerify={handleOtp}
          onBack={() => setOtpStep(false)}
          onResend={() => resendOtp(otpEmail, "login")}
          loading={loading}
          error={error}
        />
      </AuthPageShell>
    );
  }

  if (mode === "forgot") {
    return (
      <AuthPageShell
        title="Forgot Password"
        hint="Enter your account email and we will send a reset code."
        showValues
        footer={<AuthSignUpLink />}
      >
        {error && (
          <p className="ck-login-error" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="ck-login-card__hint" role="status">
            {message}
          </p>
        )}
        <form className="ck-login-form" onSubmit={handleForgotSubmit}>
          <label className="ck-field ck-field--icon">
            <span>Email Address</span>
            <i className="fa-solid fa-envelope" aria-hidden="true" />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <button type="submit" className="ck-btn ck-btn--primary ck-login-submit" disabled={loading}>
            {loading ? "Sending…" : "Send reset code"}
            <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="ck-forgot"
            onClick={() => {
              setMode("login");
              setError("");
              setMessage("");
            }}
            style={{ background: "none", border: 0, cursor: "pointer" }}
          >
            ← Back to login
          </button>
        </form>
      </AuthPageShell>
    );
  }

  if (mode === "reset") {
    return (
      <AuthPageShell
        title="Reset Password"
        hint={`Enter the code sent to ${otpEmail} and choose a new password.`}
        showValues
        footer={<AuthSignUpLink />}
      >
        {error && (
          <p className="ck-login-error" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="ck-login-card__hint" role="status">
            {message}
          </p>
        )}
        <form className="ck-login-form" onSubmit={handleResetSubmit}>
          <label className="ck-field ck-field--icon">
            <span>Reset code</span>
            <i className="fa-solid fa-shield-halved" aria-hidden="true" />
            <input
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              placeholder="000000"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              autoComplete="one-time-code"
            />
          </label>
          <label className="ck-field ck-field--icon">
            <span>New password</span>
            <i className="fa-solid fa-lock" aria-hidden="true" />
            <input
              type="password"
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
          <label className="ck-field ck-field--icon">
            <span>Confirm password</span>
            <i className="fa-solid fa-lock" aria-hidden="true" />
            <input
              type="password"
              placeholder="Repeat new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
          <button type="submit" className="ck-btn ck-btn--primary ck-login-submit" disabled={loading || resetCode.length !== 6}>
            {loading ? "Resetting…" : "Reset password"}
            <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="ck-forgot"
            onClick={() => {
              setMode("forgot");
              setError("");
            }}
            style={{ background: "none", border: 0, cursor: "pointer" }}
          >
            ← Resend code
          </button>
        </form>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell
      title="Welcome Back"
      hint="Login to your account to continue"
      showValues
      showSocial
      footer={<AuthSignUpLink />}
      socialSlot={<GoogleSignInButton onSuccess={handleGoogle} onError={setError} />}
    >
      {error && (
        <p className="ck-login-error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="ck-login-card__hint" role="status">
          {message}
        </p>
      )}

      <form className="ck-login-form" onSubmit={handleSubmit}>
        <label className="ck-field ck-field--icon">
          <span>Email Address</span>
          <i className="fa-solid fa-envelope" aria-hidden="true" />
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label className="ck-field ck-field--icon">
          <span>Password</span>
          <i className="fa-solid fa-lock" aria-hidden="true" />
          <input
            type={showPass ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            className="ck-field__toggle"
            onClick={() => setShowPass((v) => !v)}
            aria-label={showPass ? "Hide password" : "Show password"}
          >
            <i className={`fa-solid ${showPass ? "fa-eye-slash" : "fa-eye"}`} aria-hidden="true" />
          </button>
        </label>
        <button
          type="button"
          className="ck-forgot"
          onClick={() => {
            setMode("forgot");
            setError("");
            setMessage("");
          }}
          style={{ background: "none", border: 0, cursor: "pointer", textAlign: "left" }}
        >
          Forgot password?
        </button>
        <button type="submit" className="ck-btn ck-btn--primary ck-login-submit" disabled={loading}>
          {loading ? "Sending code…" : "Log In"}
          <i className="fa-solid fa-arrow-right" aria-hidden="true" />
        </button>
      </form>
    </AuthPageShell>
  );
}
