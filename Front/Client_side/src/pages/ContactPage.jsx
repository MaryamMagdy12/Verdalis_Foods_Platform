import React, { useState } from "react";
import { useReduceMotion } from "../hooks/useReduceMotion";
import { ContactHero } from "../components/contact/ContactHero";
import { ContactFormCard } from "../components/contact/ContactFormCard";
import { ContactInfoCards } from "../components/contact/ContactInfoCards";
import { ContactMap } from "../components/contact/ContactMap";
import { ContactFaq } from "../components/contact/ContactFaq";
import { ContactCta } from "../components/contact/ContactCta";
import { ThankYouModal } from "../components/shared/ThankYouModal";
import { apiPost } from "../api/client";
import "../assets/css/ContactPage.css";

let contactLeafUrl = "";
try {
  contactLeafUrl = new URL("../assets/images/ChatGPT Image Feb 9, 2026, 02_20_26 PM.png", import.meta.url).href;
} catch (_) {}

const DEFAULT_FAQ = [
  { q: "How do I schedule a consultation?", a: "You can use the contact form above or call us directly. Our team will coordinate a time that works for you." },
  { q: "What's your response time?", a: "We typically respond within 24–48 hours during business days." },
  { q: "Do you offer international shipping?", a: "We distribute across Canada and the USA. Contact us for specific regions." },
];

const initialFormData = {
  name: "",
  company_name: "",
  phone: "",
  address: "",
  email: "",
  message: "",
};

export function ContactPage() {
  const reduce = useReduceMotion();
  const [formData, setFormData] = useState(initialFormData);
  const [openFaq, setOpenFaq] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await apiPost("contact", {
        name: formData.name,
        email: formData.email || undefined,
        message: formData.message,
        company_name: formData.company_name,
        phone: String(formData.phone).replace(/\D/g, ""),
        address: formData.address,
      });
      setSubmitted(true);
      setFormData(initialFormData);
    } catch (err) {
      if (err.errors) setErrors(err.errors);
      else setErrors({ message: [err.message || "Failed to send. Try again."] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <ContactHero reduce={reduce} />
      <section className="contact-main-section">
        <div className="contact-main-inner">
          <div className="contact-form-row-wrap">
            <ContactFormCard
              reduce={reduce}
              formData={formData}
              setFormData={setFormData}
              setErrors={setErrors}
              onSubmit={handleSubmit}
              loading={loading}
              errors={errors}
            />
            <ThankYouModal
              open={submitted}
              onClose={() => setSubmitted(false)}
              title="Thank you!"
              message="Your message has been sent successfully. We'll get back to you soon."
            />
          </div>
          <div className="contact-second-row">
            <div className="contact-left-col">
              <ContactInfoCards reduce={reduce} />
              {/* <ContactFaq
                reduce={reduce}
                faqItems={DEFAULT_FAQ}
                openFaq={openFaq}
                setOpenFaq={setOpenFaq}
              /> */}
              {/* <ContactCta reduce={reduce} /> */}
            </div>
         
            <div className="contact-right-col">
              <ContactMap reduce={reduce} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
