import React from "react";
import { Link } from "react-router-dom";
import brandHero from "../../assets/images/ChatGPT Image May 18, 2026, 07_54_10 AM.png";
import "../../assets/css/checkout-pages.css";

const VALUE_PROPS = [
  { icon: "fa-shield-halved", title: "Secure & Safe", text: "Your data is fully protected" },
  { icon: "fa-leaf", title: "Premium Quality", text: "Carefully sourced products" },
  { icon: "fa-truck", title: "Fast Delivery", text: "On-time & reliable" },
  { icon: "fa-headset", title: "Dedicated Support", text: "We're here to help you anytime" },
];

export function AuthPageShell({
  title,
  hint,
  tagline = "Rooted in Quality",
  children,
  footer,
  showValues = false,
  showSocial = false,
  socialSlot = null,
}) {
  const heroStyle = { backgroundImage: `url("${brandHero}")` };

  return (
    <div className="ck-auth-page">
      <aside className="ck-login-brand" style={heroStyle} aria-label="Verdalis Foods">
        <p className="ck-login-brand__tag">Rooted in Quality</p>
        <h1>Made for Better Living.</h1>
        <div className="ck-login-brand__divider" aria-hidden="true">
          <span />
          <i className="fa-solid fa-leaf" />
          <span />
        </div>
        <p className="ck-login-brand__sub">
          Premium quality foods, delivered with care.
        </p>
      </aside>

      <main className="ck-auth-main">
        <div className="ck-login-card">
          <header className="ck-login-card__brand">
            <i className="fa-solid fa-leaf ck-login-card__logo" aria-hidden="true" />
            <div>
              <strong>Verdalis Foods</strong>
              <span>{tagline}</span>
            </div>
          </header>

          <h2>
            {title} <span className="ck-login-card__leaf" aria-hidden="true">🍃</span>
          </h2>
          {hint && <p className="ck-login-card__hint">{hint}</p>}

          {children}

          {showSocial && (
            <>
              <p className="ck-login-divider">
                <span>or continue with</span>
              </p>
              <div className="ck-social-btns">
                {socialSlot || (
                  <button type="button" className="ck-btn ck-btn--social" disabled>
                    <i className="fa-brands fa-google" aria-hidden="true" />
                    Continue with Google
                  </button>
                )}
              </div>
            </>
          )}

          {footer}

          {showValues && (
            <footer className="ck-login-values">
              <ul>
                {VALUE_PROPS.map((v) => (
                  <li key={v.title}>
                    <i className={`fa-solid ${v.icon}`} aria-hidden="true" />
                    <strong>{v.title}</strong>
                    <span>{v.text}</span>
                  </li>
                ))}
              </ul>
            </footer>
          )}
        </div>
      </main>
    </div>
  );
}

export function AuthSignInLink() {
  return (
    <p className="ck-login-signup">
      Already have an account? <Link to="/login">Sign in</Link>
    </p>
  );
}

export function AuthSignUpLink() {
  return (
    <p className="ck-login-signup">
      Don&apos;t have an account? <Link to="/register">Sign Up</Link>
    </p>
  );
}
