import React from "react";
import { motion } from "framer-motion";
import { fadeLeft } from "../../animations/motionPresets";
import { useScrollReveal } from "../../hooks/useScrollReveal";

export function ContactFormCard({ reduce, formData, setFormData, onSubmit, loading, errors = {} }) {
  const [ref, isInView] = useScrollReveal();
  const show = reduce || isInView;
  return (
    <motion.div
      ref={ref}
      className="contact-form-wrap"
      initial={reduce ? false : "hidden"}
      animate={show ? "show" : "hidden"}
      variants={reduce ? undefined : fadeLeft}
    >
      <h2 className="contact-form-heading">Send a message</h2>
      <form className="contact-form-form" onSubmit={onSubmit}>
        <div className="contact-form-row">
          <div className="contact-form-field">
            <input
              type="text"
              placeholder="Name *"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              className="contact-form-input"
              aria-invalid={!!errors.name}
            />
            {errors.name && <span className="contact-form-error">{errors.name[0]}</span>}
          </div>
          <div className="contact-form-field">
            <input
              type="text"
              placeholder="Company name *"
              value={formData.company_name}
              onChange={(e) => setFormData((p) => ({ ...p, company_name: e.target.value }))}
              className="contact-form-input"
              aria-invalid={!!errors.company_name}
            />
            {errors.company_name && <span className="contact-form-error">{errors.company_name[0]}</span>}
          </div>
        </div>
        <div className="contact-form-row">
          <div className="contact-form-field">
            <input
              type="tel"
              placeholder="Phone * (digits only)"
              value={formData.phone}
              onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
              className="contact-form-input"
              aria-invalid={!!errors.phone}
            />
            {errors.phone && <span className="contact-form-error">{errors.phone[0]}</span>}
          </div>
          <div className="contact-form-field">
            <input
              type="email"
              placeholder="Email (optional)"
              value={formData.email}
              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
              className="contact-form-input"
              aria-invalid={!!errors.email}
            />
            {errors.email && <span className="contact-form-error">{errors.email[0]}</span>}
          </div>
        </div>
        <div className="contact-form-field">
          <input
            type="text"
            placeholder="Address *"
            value={formData.address}
            onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
            className="contact-form-input contact-form-input-full"
            aria-invalid={!!errors.address}
          />
          {errors.address && <span className="contact-form-error">{errors.address[0]}</span>}
        </div>
        <div className="contact-form-field">
          <textarea
            placeholder="Message *"
            value={formData.message}
            onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
            className="contact-form-textarea"
            rows={4}
            aria-invalid={!!errors.message}
          />
          {errors.message && <span className="contact-form-error">{errors.message[0]}</span>}
        </div>
        <button type="submit" className="contact-form-submit" disabled={loading}>
          {loading ? "Sending…" : "Submit"}
        </button>
      </form>
    </motion.div>
  );
}
