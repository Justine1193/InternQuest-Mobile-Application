/**
 * ConfirmModal - A reusable confirmation modal dialog
 * Displays a message and confirm/cancel actions
 *
 * @component
 * @param {boolean} open - Whether the modal is open
 * @param {string} message - The message to display
 * @param {function} onConfirm - Handler for confirm action
 * @param {function} onCancel - Handler for cancel action
 * @param {string} confirmButtonText - Optional text for confirm button (default: "Yes, delete it!")
 * @param {string} confirmButtonClass - Optional CSS class for confirm button (default: "confirm-btn")
 * @param {number} itemCount - Optional count of items being affected
 * @param {Array} itemPreview - Optional array of item names/IDs to preview
 * @param {string} title - Optional custom title (default: "Are you sure?")
 * @example
 * <ConfirmModal open={open} message="Are you sure?" onConfirm={handleConfirm} onCancel={handleCancel} />
 * <ConfirmModal open={open} message="Restore?" confirmButtonText="Yes, restore it!" itemCount={5} onConfirm={handleRestore} onCancel={handleCancel} />
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
  title = "Are you sure?"
}) => {
  if (!open) return null;
  
  const hasItems = itemCount !== null && itemCount > 0;
  const hasPreview = itemPreview && itemPreview.length > 0;
  
  return (
    <div
      className="confirm-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-message"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
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
              <strong>{itemCount} item{itemCount !== 1 ? 's' : ''}</strong> will be affected.
            </div>
          )}
          <p>{message}</p>
          {hasPreview && itemPreview.length > 0 && (
            <div className="confirm-item-preview">
              <strong>Items:</strong>
              <ul>
                {itemPreview.slice(0, 5).map((item, index) => (
                  <li key={index}>{typeof item === 'string' ? item : item.name || item.id}</li>
                ))}
                {itemPreview.length > 5 && (
                  <li className="preview-more">...and {itemPreview.length - 5} more</li>
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
  /** Whether the modal is open */
  open: PropTypes.bool.isRequired,
  /** The message to display */
  message: PropTypes.string.isRequired,
  /** Handler for confirm action */
  onConfirm: PropTypes.func.isRequired,
  /** Handler for cancel action */
  onCancel: PropTypes.func.isRequired,
  /** Optional text for confirm button */
  confirmButtonText: PropTypes.string,
  /** Optional CSS class for confirm button */
  confirmButtonClass: PropTypes.string,
  /** Optional count of items being affected */
  itemCount: PropTypes.number,
  /** Optional array of item names/IDs to preview */
  itemPreview: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      name: PropTypes.string,
      id: PropTypes.string
    })
  ])),
  /** Optional custom title */
  title: PropTypes.string,
};

export default ConfirmModal;
