import React from "react";

export function PageLoader({ label = "Loading…" }) {
  return (
    <div className="vf-section vf-container" style={{ padding: "3rem 1rem", textAlign: "center" }} role="status">
      {label}
    </div>
  );
}
