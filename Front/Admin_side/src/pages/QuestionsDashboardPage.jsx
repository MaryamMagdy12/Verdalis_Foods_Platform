import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion, faClock, faCircleCheck, faReply } from "@fortawesome/free-solid-svg-icons";
import { apiGet, apiPost } from "../api/admin";
import { AdminPageShell } from "../components/dashboard/AdminPageShell";
import { AdminPageHeader } from "../components/dashboard/AdminPageHeader";
import { AdminKpiRow } from "../components/dashboard/AdminKpiRow";
import { AdminFilterBar } from "../components/dashboard/AdminFilterBar";
import { AdminStatusBadge } from "../components/dashboard/AdminStatusBadge";
import { AdminFormModal } from "../components/shared/AdminFormModal";

export function QuestionsDashboardPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [replyModal, setReplyModal] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyError, setReplyError] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiGet("admin/questions");
      setQuestions(res.data || []);
    } catch (e) {
      setError(e.message || "Failed to load questions.");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleReply = async () => {
    if (!replyModal || !replyText.trim()) return;
    setReplyError("");
    setSending(true);
    try {
      await apiPost(`admin/questions/${replyModal.id}/reply`, { reply: replyText.trim() });
      setReplyModal(null);
      setReplyText("");
      load();
    } catch (e) {
      const msg = e.errors?.reply?.[0] || e.message || "Failed to send reply.";
      setReplyError(msg);
    } finally {
      setSending(false);
    }
  };

  let filtered = search
    ? questions.filter((q) => [q.name, q.email, q.message].some((t) => String(t || "").toLowerCase().includes(search.toLowerCase())))
    : questions;
  if (filter === "pending") filtered = filtered.filter((q) => !q.replied_at);
  if (filter === "answered") filtered = filtered.filter((q) => q.replied_at);

  const pending = questions.filter((q) => !q.replied_at).length;

  return (
    <AdminPageShell>
      <AdminPageHeader title="Questions" />

      {error && <p className="admin-alert-error" role="alert">{error}</p>}

      <AdminKpiRow
        cards={[
          { label: "Total Questions", value: String(questions.length), icon: faCircleQuestion, iconVariant: "green" },
          { label: "Pending", value: String(pending), icon: faClock, iconVariant: "orange" },
          { label: "Answered", value: String(questions.length - pending), icon: faCircleCheck, iconVariant: "blue" },
          { label: "Showing", value: String(filtered.length), icon: faCircleQuestion, iconVariant: "yellow" },
        ]}
      />

      <div className="admin-tabs">
        <button type="button" className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All</button>
        <button type="button" className={filter === "pending" ? "active" : ""} onClick={() => setFilter("pending")}>Pending</button>
        <button type="button" className={filter === "answered" ? "active" : ""} onClick={() => setFilter("answered")}>Answered</button>
      </div>

      <AdminFilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search questions…" />

      {loading ? (
        <p className="admin-loading">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="admin-loading">No questions found.</p>
      ) : (
        <div className="admin-card-grid">
          {filtered.map((q) => (
            <article key={q.id} className="admin-list-card">
              <div className="admin-list-card-header">
                <FontAwesomeIcon icon={faCircleQuestion} className="admin-list-card-icon" />
                <div>
                  <strong>{q.name}</strong>
                  <p style={{ margin: "0.2rem 0", fontSize: "0.8rem", color: "var(--admin-gray-500)" }}>
                    {q.product ? `Product: ${q.product.name}` : "General"}
                  </p>
                  <AdminStatusBadge status={q.replied_at ? "delivered" : "pending"} label={q.replied_at ? "Answered" : "Pending"} />
                </div>
              </div>
              <p style={{ margin: "0.75rem 0 0", fontSize: "0.875rem" }}>{q.message}</p>
              {(q.replied_at || q.admin_reply) && (
                <div style={{ marginTop: "0.75rem", padding: "0.65rem", background: "var(--admin-gray-100)", borderRadius: 8 }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: 600 }}>Your reply</span>
                  <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem" }}>{q.admin_reply || "Replied."}</p>
                </div>
              )}
              <div className="admin-list-card-actions">
                <button type="button" className="admin-btn-primary admin-btn-sm" onClick={() => setReplyModal(q)}>
                  <FontAwesomeIcon icon={faReply} /> Reply
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <AdminFormModal
        open={!!replyModal}
        onClose={() => { setReplyModal(null); setReplyText(""); setReplyError(""); }}
        title={replyModal ? `Reply to ${replyModal.name}` : "Reply"}
        subtitle={replyModal?.email}
        footer={(
          <>
            <button type="button" className="admin-modal__btn admin-modal__btn--ghost" onClick={() => { setReplyModal(null); setReplyText(""); setReplyError(""); }}>
              Cancel
            </button>
            <button type="button" className="admin-modal__btn admin-modal__btn--primary" onClick={handleReply} disabled={sending || !replyText.trim()}>
              {sending ? "Sending…" : "Send reply"}
            </button>
          </>
        )}
      >
        <textarea
          rows={6}
          value={replyText}
          onChange={(e) => { setReplyError(""); setReplyText(e.target.value); }}
          placeholder="Write your reply…"
          className={`admin-modal__textarea ${replyError ? "admin-modal__textarea--error" : ""}`}
        />
        {replyError && <p className="admin-alert-error" style={{ marginTop: "0.65rem" }}>{replyError}</p>}
      </AdminFormModal>
    </AdminPageShell>
  );
}
