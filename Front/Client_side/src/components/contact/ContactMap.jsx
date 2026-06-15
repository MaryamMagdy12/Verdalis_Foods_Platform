import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fadeRight } from "../../animations/motionPresets";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { apiGet } from "../../api/client";

export function ContactMap({ reduce }) {
  const [warehouse, setWarehouse] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiGet("settings/warehouse");
        const d = res.data;
        if (!cancelled && (d?.address || (d?.latitude != null && d?.longitude != null))) {
          setWarehouse(d);
        }
      } catch (_) {}
    })();
    return () => { cancelled = true; };
  }, []);

  const mapUrl =
    warehouse?.latitude != null && warehouse?.longitude != null
      ? `https://www.google.com/maps?q=${warehouse.latitude},${warehouse.longitude}`
      : warehouse?.address
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(warehouse.address)}`
        : null;

  const [ref, isInView] = useScrollReveal();
  const show = reduce || isInView;
  return (
    <motion.div
      ref={ref}
      className="contact-map-wrap"
      initial={reduce ? false : "hidden"}
      animate={show ? "show" : "hidden"}
      variants={reduce ? undefined : fadeRight}
    >
      {mapUrl ? (
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-map-link"
        >
          <div className="contact-map-placeholder">
            <i className="fa-solid fa-location-dot" aria-hidden="true" />
            <span>Our Location</span>
            {warehouse?.address && (
              <span className="contact-map-address">{warehouse.address}</span>
            )}
          </div>
        </a>
      ) : (
        <div className="contact-map-placeholder">
          <i className="fa-solid fa-location-dot" aria-hidden="true" />
          <span>Our Location</span>
        </div>
      )}
    </motion.div>
  );
}
