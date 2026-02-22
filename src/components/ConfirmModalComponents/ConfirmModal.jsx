/**
 * Confirmation modal with optional item count and preview.
 */

import React from "react";
import PropTypes from "prop-types";
import "./ConfirmModal.css";

const ConfirmModal = ({
  open,
  message,
  onConfirm,
  onCancel,
  confirmButtonText = "Yes, delete it!",
  confirmButtonClass = "confirm-btn",
  itemCount = null,
  itemPreview = null,
  title = "Are you sure?",
}) => {
  if (!open) return null;

  const hasItems = itemCount !== null && itemCount > 0;
  const hasPreview = itemPreview && itemPreview.length > 0;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onCancel();
  };

  return (
    <div
      className="confirm-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-message"
      onClick={handleBackdropClick}
    >
      <div className="confirm-modal">
        <div className="confirm-icon">
          <span>!</span>
        </div>
        <h2 className="confirm-title" id="confirm-modal-title">
          {title}
        </h2>
        <div className="confirm-description" id="confirm-modal-message">
          {hasItems && (
            <div className="confirm-item-count">
              <strong>
                {itemCount} item{itemCount !== 1 ? "s" : ""}
              </strong>{" "}
              will be affected.
            </div>
          )}
          <p>{message}</p>
          {hasPreview && (
            <div className="confirm-item-preview">
              <strong>Items:</strong>
              <ul>
                {itemPreview.slice(0, 5).map((item, index) => (
                  <li key={index}>
                    {typeof item === "string"
                      ? item
                      : item.name || item.id}
                  </li>
                ))}
                {itemPreview.length > 5 && (
                  <li className="preview-more">
                    ...and {itemPreview.length - 5} more
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
        <div className="confirm-modal-actions">
          <button
            className="cancel-btn"
            onClick={onCancel}
            aria-label="Cancel action"
          >
            Cancel
          </button>
          <button
            className={confirmButtonClass}
            onClick={onConfirm}
            autoFocus
            aria-label={confirmButtonText}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

ConfirmModal.propTypes = {
  open: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  confirmButtonText: PropTypes.string,
  confirmButtonClass: PropTypes.string,
  itemCount: PropTypes.number,
  itemPreview: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        name: PropTypes.string,
        id: PropTypes.string,
      }),
    ])
  ),
  title: PropTypes.string,
};

export default ConfirmModal;
