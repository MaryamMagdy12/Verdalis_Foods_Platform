import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faInbox, faReply } from "@fortawesome/free-solid-svg-icons";
import { apiGet, apiPost } from "../api/admin";
import { AdminPageShell } from "../components/dashboard/AdminPageShell";
import { AdminPageHeader } from "../components/dashboard/AdminPageHeader";
import { AdminKpiRow } from "../components/dashboard/AdminKpiRow";
import { AdminFilterBar } from "../components/dashboard/AdminFilterBar";
import { AdminStatusBadge } from "../components/dashboard/AdminStatusBadge";
import { AdminFormModal } from "../components/shared/AdminFormModal";

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch (_) {
    return iso;
  }
}

export function ContactMessagesDashboardPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyError, setReplyError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiGet("admin/contact-messages");
      setMessages(res.data || []);
    } catch (e) {
      setError(e.message || "Failed to load messages.");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = messages.filter((m) => {
    const q = search.toLowerCase().trim();
    const matchSearch = !q || [m.name, m.email, m.company_name, m.message, m.phone, m.address].some(
      (v) => v && String(v).toLowerCase().includes(q)
    );
    const matchFilter = filter === "all" || (filter === "unread" && !m.replied_at);
    return matchSearch && matchFilter;
  });

  const unread = messages.filter((m) => !m.replied_at).length;

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyTarget || !replyText.trim()) return;
    setReplyLoading(true);
    setReplyError("");
    try {
      const path = replyTarget.type === "question"
        ? `admin/questions/${replyTarget.id}/reply`
        : `admin/contact-messages/${replyTarget.id}/reply`;
      await apiPost(path, { reply: replyText.trim() });
      setReplyTarget(null);
      setReplyText("");
      load();
    } catch (e) {
      setReplyError(e.message || "Failed to send reply.");
    } finally {
      setReplyLoading(false);
    }
  };

  return (
    <AdminPageShell>
      <AdminPageHeader title="Contact Messages" />

      {error && <p className="admin-alert-error" role="alert">{error}</p>}

      <AdminKpiRow
        cards={[
          { label: "Total Messages", value: String(messages.length), icon: faEnvelope, iconVariant: "green" },
          { label: "Unread", value: String(unread), icon: faInbox, iconVariant: "orange" },
          { label: "Replied", value: String(messages.length - unread), icon: faReply, iconVariant: "blue" },
          { label: "Showing", value: String(filtered.length), icon: faEnvelope, iconVariant: "yellow" },
        ]}
      />

      <div className="admin-tabs">
        <button type="button" className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All</button>
        <button type="button" className={filter === "unread" ? "active" : ""} onClick={() => setFilter("unread")}>Unread</button>
      </div>

      <AdminFilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search by name, email, message…" />

      {loading ? (
        <p className="admin-loading">Loading messages…</p>
      ) : filtered.length === 0 ? (
        <p className="admin-loading">No messages found.</p>
      ) : (
        <div className="admin-card-grid">
          {filtered.map((m) => (
            <article key={`${m.type}-${m.id}`} className="admin-list-card">
              <div className="admin-list-card-header">
                <FontAwesomeIcon icon={faEnvelope} className="admin-list-card-icon" />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
                    <strong>{m.name}</strong>
                    <span style={{ fontSize: "0.75rem", color: "var(--admin-gray-500)" }}>{formatDate(m.created_at)}</span>
                  </div>
                  <span style={{ fontSize: "0.8rem", color: "var(--admin-gray-500)" }}>{m.email || m.company_name}</span>
                  <div style={{ marginTop: "0.35rem" }}>
                    <AdminStatusBadge status={m.replied_at ? "delivered" : "pending"} label={m.replied_at ? "Replied" : "Unread"} />
                  </div>
                </div>
              </div>
              {m.type === "question" && <span style={{ fontSize: "0.75rem", color: "var(--admin-green)" }}>Product question</span>}
              <p style={{ margin: "0.75rem 0 0", fontSize: "0.875rem", lineHeight: 1.5 }}>{m.message}</p>
              {(m.replied_at || m.admin_reply) && (
                <div style={{ marginTop: "0.75rem", padding: "0.65rem", background: "var(--admin-gray-100)", borderRadius: 8 }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--admin-gray-500)" }}>Your reply</span>
                  <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem" }}>{m.admin_reply || "Replied."}</p>
                </div>
              )}
              <div className="admin-list-card-actions">
                <button
                  type="button"
                  className="admin-btn-primary admin-btn-sm"
                  onClick={() => setReplyTarget(m)}
                  disabled={!m.email}
                >
                  <FontAwesomeIcon icon={faReply} /> Reply
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <AdminFormModal
        open={!!replyTarget}
        onClose={() => { setReplyTarget(null); setReplyText(""); setReplyError(""); }}
        title={replyTarget ? `Reply to ${replyTarget.name}` : "Reply"}
        subtitle={replyTarget?.email}
        footer={(
          <>
            <button type="button" className="admin-modal__btn admin-modal__btn--ghost" onClick={() => { setReplyTarget(null); setReplyText(""); setReplyError(""); }}>
              Cancel
            </button>
            <button type="submit" form="contact-reply-form" className="admin-modal__btn admin-modal__btn--primary" disabled={replyLoading || !replyText.trim()}>
              {replyLoading ? "Sending…" : "Send reply"}
            </button>
          </>
        )}
      >
        <form id="contact-reply-form" onSubmit={handleReplySubmit}>
          <textarea
            placeholder="Write your reply…"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            required
            rows={6}
            className={`admin-modal__textarea ${replyError ? "admin-modal__textarea--error" : ""}`}
          />
          {replyError && <p className="admin-alert-error" style={{ marginTop: "0.65rem" }}>{replyError}</p>}
        </form>
      </AdminFormModal>
    </AdminPageShell>
  );
}
