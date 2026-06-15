import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import "../../assets/css/components/AdminModal.css";

export function AdminRowActions({
  onView,
  onEdit,
  onDelete,
  showEdit = true,
  viewLabel = "View more",
  editLabel = "Edit",
  deleteLabel = "Delete",
}) {
  return (
    <div className="admin-table-actions">
      {onView && (
        <button type="button" className="admin-table-action-btn admin-table-action-btn--primary" onClick={onView} aria-label={viewLabel}>
          <FontAwesomeIcon icon={faEye} />
          <span>View</span>
        </button>
      )}
      {showEdit && onEdit && (
        <button type="button" className="admin-table-action-btn" onClick={onEdit} aria-label={editLabel}>
          <FontAwesomeIcon icon={faPen} />
        </button>
      )}
      {onDelete && (
        <button type="button" className="admin-table-action-btn admin-table-action-btn--danger" onClick={onDelete} aria-label={deleteLabel}>
          <FontAwesomeIcon icon={faTrash} />
        </button>
      )}
    </div>
  );
}
