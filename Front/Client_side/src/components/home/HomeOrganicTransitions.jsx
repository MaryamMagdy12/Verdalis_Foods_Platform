import React from "react";

/** Cream / stats → dark “Why” — three stacked organic blobs (border-radius + blur, no SVG). */
export function OrganicBridgeToDark() {
  // return (
  //   <div className="hp-organic-bridge hp-organic-bridge--to-dark" aria-hidden="true">
  //     <div className="hp-organic-bridge__layer hp-organic-bridge__layer--mist" />
  //     <div className="hp-organic-bridge__layer hp-organic-bridge__layer--olive" />
  //     <div className="hp-organic-bridge__layer hp-organic-bridge__layer--forest" />
  //   </div>
  // );
}

/** Dark “Why” → light products — inverted stack (forest lip → olive → mint into cream). */
export function OrganicBridgeToLight() {
  // return (
  //   <div className="hp-organic-bridge hp-organic-bridge--to-light" aria-hidden="true">
  //     <div className="hp-organic-bridge__layer hp-organic-bridge__layer--mist" />
  //     <div className="hp-organic-bridge__layer hp-organic-bridge__layer--olive" />
  //     <div className="hp-organic-bridge__layer hp-organic-bridge__layer--forest" />
  //   </div>
  // );
}

const trustFeatures = [
  { icon: "fa-solid fa-certificate", title: "Certified Products", sub: "Audited suppliers" },
  { icon: "fa-solid fa-clock", title: "On-Time Delivery", sub: "Predictable windows" },
  { icon: "fa-solid fa-headset", title: "Dedicated Support", sub: "Real people, fast answers" },
  { icon: "fa-solid fa-globe", title: "Trusted Globally", sub: "Canada & USA" },
];

/** Glass strip between Why and Products (reference layout). */
export function HomeTrustFeatureStrip() {
  return (
    <div className="hp-trust-strip-wrap">
      <div className="hp-trust-strip">
        {trustFeatures.map((f) => (
          <div key={f.title} className="hp-trust-strip__cell">
            <div className="hp-trust-strip__icon">
              <i className={f.icon} aria-hidden="true" />
            </div>
            <strong>{f.title}</strong>
            <span>{f.sub}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
