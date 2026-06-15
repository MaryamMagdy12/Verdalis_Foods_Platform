import React, { useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../../api/client";
import "../../assets/css/platform-design.css";

const FAQ = [
  { q: "Track order", a: "Enter your PRM order number on the tracking page.", link: "/track-order" },
  { q: "Wholesale", a: "Register as a retailer for bulk pricing and quotations.", link: "/register/retailer" },
  { q: "Delivery", a: "Orders typically ship within 24–48h. Track status in real time once dispatched." },
  { q: "Payment", a: "Online, COD, bank transfer, and invoice billing for approved retailers." },
];

function formatProductReply(data) {
  const price = data.price != null ? `$${Number(data.price).toFixed(2)}` : "Price on request";
  const cat = data.category?.name ? ` · ${data.category.name}` : "";
  const stock = data.in_stock === false ? "Currently out of stock." : "In stock.";
  return `${data.name} (SKU: ${data.sku || "—"})${cat}\n${price} · ${stock}\n${data.description ? data.description.slice(0, 160) + (data.description.length > 160 ? "…" : "") : ""}`;
}

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! I'm your Verdalis assistant. Ask about a product by name or SKU, or use the quick topics below." },
  ]);

  const pushBot = (text, link) => {
    setMessages((m) => [...m, { role: "bot", text, link }]);
  };

  const ask = (item) => {
    setMessages((m) => [
      ...m,
      { role: "user", text: item.q },
      { role: "bot", text: item.a, link: item.link },
    ]);
  };

  const lookupProduct = async (query) => {
    const q = query.trim();
    if (q.length < 2) {
      pushBot("Please type at least 2 characters of a product name or SKU.");
      return;
    }
    setBusy(true);
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    try {
      const res = await apiGet("products/lookup", { q });
      if (res.found && res.data) {
        const detail = formatProductReply(res.data);
        const productLink = res.data.id ? `/products/${res.data.id}` : "/products";
        pushBot(`Yes — we have this in our catalog:\n\n${detail}`, productLink);
      } else {
        pushBot(res.message || `We don't have a product matching "${q}" in our catalog right now.`);
      }
    } catch {
      pushBot("Sorry, I couldn't check the catalog right now. Try again or browse the shop.");
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || busy) return;
    lookupProduct(input);
  };

  return (
    <>
      <button
        type="button"
        className="vf-chatbot-fab"
        aria-label={open ? "Close assistant" : "Open assistant"}
        onClick={() => setOpen((o) => !o)}
      >
        <i
          className={`fa-solid ${open ? "fa-xmark" : "fa-robot"}`}
          aria-hidden="true"
        />
      </button>
      {open ? (
        <div className="vf-chatbot-panel">
          <div className="vf-chatbot-header">
            <i className="fa-solid fa-robot vf-chatbot-header__icon" aria-hidden="true" />
            Verdalis Assistant
          </div>
          <div className="vf-chatbot-body">
            {messages.map((msg, i) => (
              <div key={i} className={`vf-chatbot-msg vf-chatbot-msg--${msg.role}`} style={{ whiteSpace: "pre-wrap" }}>
                {msg.text}
                {msg.link ? (
                  <Link to={msg.link} style={{ display: "block", marginTop: "0.35rem", color: "var(--vf-emerald)" }}>
                    Open →
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
          <form className="vf-chatbot-input-row" onSubmit={onSubmit} style={{ padding: "0.5rem 0.75rem", display: "flex", gap: "0.5rem" }}>
            <input
              type="text"
              placeholder="Product name or SKU…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={busy}
              style={{ flex: 1, padding: "0.5rem", borderRadius: 8, border: "1px solid #e2e8f0" }}
            />
            <button type="submit" className="vf-btn vf-btn--primary" disabled={busy} style={{ padding: "0.5rem 0.75rem" }}>
              {busy ? "…" : "Ask"}
            </button>
          </form>
          <div className="vf-chatbot-quick">
            {FAQ.map((f) => (
              <button key={f.q} type="button" onClick={() => ask(f)}>
                {f.q}
              </button>
            ))}
            <button
              type="button"
              onClick={() => ask({ q: "Shop", a: "Browse our premium wholesale catalog.", link: "/products" })}
            >
              Shop
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
