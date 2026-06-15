import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeLeft, fadeRight, sectionEntrance } from "../../animations/motionPresets";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { ThankYouModal } from "../shared/ThankYouModal";
import { apiPost } from "../../api/client";

const initialForm = {
  name: "",
  company_name: "",
  phone: "",
  address: "",
  email: "",
  message: "",
};

export function HomeContact({ reduce }) {
  const [formData, setFormData] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiPost("contact", {
        name: formData.name,
        company_name: formData.company_name,
        phone: formData.phone.replace(/\D/g, ""),
        address: formData.address,
        email: formData.email || undefined,
        message: formData.message,
      });
      setSubmitted(true);
      setFormData(initialForm);
    } catch (err) {
      setError(err.message || (err.errors ? Object.values(err.errors).flat().join(" ") : "Failed to send. Try again."));
    } finally {
      setLoading(false);
    }
  };

  const [ref, isInView] = useScrollReveal();
  const show = reduce || isInView;

  return (
    <motion.section
      ref={ref}
      className="hp-contact cream-section"
      id="contact"
      initial={reduce ? false : "hidden"}
      animate={show ? "show" : "hidden"}
      variants={reduce ? undefined : sectionEntrance}
    >
      <div className="hp-contact-decor" aria-hidden="true">
        <div className="hp-leaf" />
        <div className="hp-leaf hp-leaf--2" />
      </div>
      <div className="section-content">
        <div className="hp-contact-grid">
          <motion.div variants={reduce ? undefined : fadeLeft}>
            <p className="hp-about-kicker">
              <i className="fa-solid fa-leaf" aria-hidden="true" /> Get in touch
            </p>
            <h2 className="hp-contact-title">Let&apos;s Build Something Great Together.</h2>
            <p className="hp-contact-desc">
              Have questions or want to partner with us? Our team is ready to support your growth with premium products and dependable logistics.
            </p>
            <Link to="/contact" className="hp-btn hp-btn--primary">
              Partner With Us
              <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </Link>
          </motion.div>

          <motion.form className="hp-contact-form" variants={reduce ? undefined : fadeRight} onSubmit={handleSubmit}>
            <div className="hp-contact-row">
              <input type="text" name="name" placeholder="Name *" value={formData.name} onChange={handleChange} required aria-label="Name" />
              <input type="text" name="company_name" placeholder="Company *" value={formData.company_name} onChange={handleChange} required aria-label="Company" />
            </div>
            <div className="hp-contact-row">
              <input type="tel" name="phone" placeholder="Phone *" value={formData.phone} onChange={handleChange} required aria-label="Phone" />
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} aria-label="Email" />
            </div>
            <input type="text" name="address" placeholder="Address *" value={formData.address} onChange={handleChange} required aria-label="Address" />
            <textarea name="message" placeholder="Message *" rows={4} value={formData.message} onChange={handleChange} required aria-label="Message" />
            {error && (
              <span className="hp-contact-error" role="alert">
                {error}
              </span>
            )}
            <button type="submit" className="hp-contact-submit" disabled={loading}>
              <i className="fa-solid fa-paper-plane" aria-hidden="true" />
              {loading ? "Sending..." : submitted ? "Sent" : "Send Message"}
            </button>
          </motion.form>
        </div>

        <ThankYouModal
          open={submitted}
          onClose={() => setSubmitted(false)}
          title="Thank you!"
          message="Your message has been sent successfully. We'll get back to you soon."
        />
      </div>
    </motion.section>
  );
}
