import React from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import "../../assets/css/SharedModals.css";

export function ThankYouModal({ open, onClose, title = "Thank you!", message = "Your message has been sent successfully. We'll get back to you soon." }) {
  if (!open) return null;
  return createPortal(
    <motion.div
      className="shared-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shared-modal-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        className="shared-modal-card shared-modal-thankyou"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shared-modal-icon-wrap">
          <i className="fa-solid fa-circle-check shared-modal-icon shared-modal-icon-success" aria-hidden="true" />
        </div>
        <h2 id="shared-modal-title" className="shared-modal-title">{title}</h2>
        <p className="shared-modal-message">{message}</p>
        <button type="button" className="shared-modal-btn shared-modal-btn-primary" onClick={onClose}>OK</button>
      </motion.div>
    </motion.div>,
    document.body
  );
}
