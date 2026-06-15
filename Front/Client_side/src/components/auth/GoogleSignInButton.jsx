import React, { useEffect, useRef } from "react";

export function GoogleSignInButton({ onSuccess, onError }) {
  const   btnRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || !btnRef.current) return;

    const init = () => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response?.credential) onSuccess(response.credential);
          else onError?.("Google sign-in failed.");
        },
      });
      window.google.accounts.id.renderButton(btnRef.current, {
        theme: "outline",
        size: "large",
        width: 320,
        text: "continue_with",
        
      });
    };

    if (window.google?.accounts?.id) {
      init();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = init;
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [clientId, onSuccess, onError]);

  if (!clientId) {
    return (
      <p className="ck-login-card__hint" style={{ fontSize: "0.85rem" }}>
        Set VITE_GOOGLE_CLIENT_ID to enable Google sign-in.
      </p>
    );
  }

  return <div ref={btnRef} className="ck-google-btn-wrap" />;
}
