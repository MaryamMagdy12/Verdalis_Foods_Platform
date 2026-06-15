import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { fadeUp, fadeLeft, fadeRight, revealViewport, staggerContainer } from "../../animations/motionPresets";
import { ThankYouModal } from "../shared/ThankYouModal";
import { apiPost } from "../../api/client";

const backdropVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const boxVariants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2 } },
};

export function ProductModal({ product, allProducts, onClose, onAddToCart }) {
  const [questionSent, setQuestionSent] = useState(false);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [questionError, setQuestionError] = useState("");
  const [qName, setQName] = useState("");
  const [qEmail, setQEmail] = useState("");
  const [qMessage, setQMessage] = useState("");
  useEffect(() => {
    const scrollY = window.scrollY;
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.position = "fixed";
    document.documentElement.style.top = `-${scrollY}px`;
    document.documentElement.style.width = "100%";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    return () => {
      document.documentElement.style.overflow = "";
      document.documentElement.style.position = "";
      document.documentElement.style.top = "";
      document.documentElement.style.width = "";
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  if (!product) return null;

  const productId = product?.id != null ? String(product.id) : product?.id;
  const similarProducts = (allProducts || []).filter((p) => String(p.id) !== String(product?.id)).slice(0, 4);

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    setQuestionError("");
    setQuestionLoading(true);
    try {
      await apiPost("questions", {
        name: qName,
        email: qEmail,
        message: qMessage,
        product_id: productId ? Number(productId) : undefined,
      });
      setQuestionSent(true);
      setQName("");
      setQEmail("");
      setQMessage("");
    } catch (err) {
      setQuestionError(err.message || (err.errors && Object.values(err.errors).flat().join(" ")) || "Failed to send.");
    } finally {
      setQuestionLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleBackdropWheel = (e) => {
    const content = e.target.closest(".product-modal-content");
    if (!content) e.preventDefault();
  };

  const contentRef = useRef(null);
  const viewportWithRoot = {
    root: contentRef,
    once: false,
    amount: 0.12,
    margin: "0px 0px -10% 0px",
  };

  const content = (
    <motion.div
      className="product-modal-backdrop"
      onClick={handleBackdropClick}
      onWheelCapture={handleBackdropWheel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
      initial="hidden"
      animate="show"
      variants={backdropVariants}
    >
      <motion.div
        className="product-modal-box"
        onClick={(e) => e.stopPropagation()}
        variants={boxVariants}
      >
        <motion.button
          type="button"
          className="product-modal-close"
          onClick={onClose}
          aria-label="Close"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </motion.button>

        <div ref={contentRef} className="product-modal-content">
          {/* First section: two-tone hero (light green left, dark green right + image) */}
          <motion.section
            className="product-modal-hero"
            initial="hidden"
            whileInView="show"
            viewport={viewportWithRoot}
            variants={staggerContainer(0.08, 0.05)}
          >
            <div className="product-modal-hero-left">
              <div className="product-modal-hero-blob product-modal-hero-blob-tl" aria-hidden="true" />
              <div className="product-modal-hero-blob product-modal-hero-blob-bl" aria-hidden="true" />
              <motion.div className="product-modal-hero-info" variants={fadeRight}>
                <h2 id="product-modal-title" className="product-modal-hero-title">
                  <span className="product-modal-hero-title-main">{product.name.split(" ")[0] || product.name}</span>
                  {product.name.split(" ").length > 1 && (
                    <span className="product-modal-hero-title-sub">{product.name.split(" ").slice(1).join(" ")}</span>
                  )}
                </h2>
                <p className="product-modal-hero-desc">
                  {product.description }
                </p>
                <div className="product-modal-hero-actions">
                  <motion.h3
                    className="product-modal-hero-sku"
                    variants={fadeUp}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    SKU: #{product.SKU ?? product.sku}
                  </motion.h3>
                </div>
              </motion.div>
            </div>
            <motion.div className="product-modal-hero-right" variants={fadeLeft}>
              <div className="product-modal-hero-image-wrap">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="product-modal-hero-image" />
                ) : (
                  <div className="product-modal-hero-image-placeholder" />
                )}
              </div>
            </motion.div>
          </motion.section>

          {/* Questions form — animate on scroll into view */}
          <motion.section
            className="product-modal-questions"
            initial="hidden"
            whileInView="show"
            viewport={viewportWithRoot}
            variants={staggerContainer(0.06, 0.05)}
          >
            <motion.h3 className="product-modal-section-heading" variants={fadeUp}>
              Have Questions?
            </motion.h3>
            <motion.form
              className="product-modal-questions-form"
              onSubmit={handleQuestionSubmit}
              variants={fadeUp}
            >
              <ThankYouModal
                open={questionSent}
                onClose={() => setQuestionSent(false)}
                title="Thank you!"
                message="Your question has been sent. We will get back to you soon."
              />
              {/* Thank you popup shown above when questionSent */}
                {false && <p className="product-modal-questions-success" role="status">Question sent. We’ll get back to you soon.</p>}
              {questionError && (
                <p className="product-modal-questions-error" role="alert">{questionError}</p>
              )}
              <div className="product-modal-questions-row">
                <label htmlFor="question-name" className="product-modal-questions-label">
                  Name
                </label>
                <input
                  id="question-name"
                  type="text"
                  placeholder="Your name"
                  className="product-modal-questions-input"
                  value={qName}
                  onChange={(e) => setQName(e.target.value)}
                  required
                />
              </div>
              <div className="product-modal-questions-row">
                <label htmlFor="question-email" className="product-modal-questions-label">
                  Email
                </label>
                <input
                  id="question-email"
                  type="email"
                  placeholder="your@email.com"
                  className="product-modal-questions-input"
                  value={qEmail}
                  onChange={(e) => setQEmail(e.target.value)}
                  required
                />
              </div>
              <div className="product-modal-questions-row">
                <label htmlFor="question-message" className="product-modal-questions-label">
                  Your question
                </label>
                <textarea
                  id="question-message"
                  placeholder="Ask about this product..."
                  rows={4}
                  className="product-modal-questions-textarea"
                  value={qMessage}
                  onChange={(e) => setQMessage(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="product-modal-questions-submit" disabled={questionLoading}>
                {questionLoading ? "Sending…" : "Send Question"}
              </button>
            </motion.form>
          </motion.section>

          {/* Buy similar — animate on scroll into view, every time */}
          <motion.section
            className="product-modal-similar"
            initial="hidden"
            whileInView="show"
            viewport={viewportWithRoot}
            variants={staggerContainer(0.08, 0.05)}
          >
            <motion.h3 className="product-modal-section-heading" variants={fadeUp}>
              Buy Similar
            </motion.h3>
            <div className="product-modal-similar-grid">
              {similarProducts.map((p) => (
                <motion.div
                  key={p.id}
                  className="product-modal-similar-card"
                  variants={fadeUp}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                <motion.div
                  className="product-modal-similar-image"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.25 }}
                >
                  {p.image && <img src={p.image} alt={p.name} />}
                </motion.div>
                  <span className="product-modal-similar-name">{p.name}</span>
                  <span className="product-modal-similar-price">SKU: #{p.SKU ?? p.sku}</span>
                  <motion.button
                    type="button"
                    className="product-modal-similar-btn"
                    onClick={() => onClose()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    View
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(content, document.body);
}
