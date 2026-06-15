import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation, faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
import "../../assets/css/components/AdminModal.css";

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Confirm",
  message = "Are you sure?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
}) {
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const isDanger = variant === "danger";
  const icon = isDanger ? faTriangleExclamation : faCircleQuestion;

  return createPortal(
    <div
      className="admin-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-confirm-title"
      onClick={onClose}
    >
      <div className="admin-modal admin-modal--confirm" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__header">
          <div className="admin-modal__header-text">
            <h2 id="admin-confirm-title" className="admin-modal__title">{title}</h2>
          </div>
        </div>
        <div className="admin-modal__body admin-modal__body--center">
          <div className={`admin-modal__icon admin-modal__icon--${isDanger ? "danger" : "default"}`}>
            <FontAwesomeIcon icon={icon} />
          </div>
          <p className="admin-modal__message">{message}</p>
        </div>
        <div className="admin-modal__footer admin-modal__footer--center">
          <button type="button" className="admin-modal__btn admin-modal__btn--ghost" onClick={onClose}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`admin-modal__btn ${isDanger ? "admin-modal__btn--danger" : "admin-modal__btn--primary"}`}
            onClick={() => { onConfirm(); onClose(); }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
