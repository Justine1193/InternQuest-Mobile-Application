/**
 * ConfirmModal - A reusable confirmation modal dialog
 * Displays a message and confirm/cancel actions
 *
 * @component
 * @param {boolean} open - Whether the modal is open
 * @param {string} message - The message to display
 * @param {function} onConfirm - Handler for confirm action
 * @param {function} onCancel - Handler for cancel action
 * @example
 * <ConfirmModal open={open} message="Are you sure?" onConfirm={handleConfirm} onCancel={handleCancel} />
 */

import React from "react";
import PropTypes from "prop-types";
import "./ConfirmModal.css";

const ConfirmModal = ({ open, message, onConfirm, onCancel }) => {
  // If not open, render nothing
  if (!open) return null;
  return (
    <div
      className="confirm-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-message"
    >
      <div className="confirm-modal">
        <div className="confirm-modal-message" id="confirm-modal-message">
          {message}
        </div>
        <div className="confirm-modal-actions">
          <button className="confirm-btn" onClick={onConfirm} autoFocus>
            Delete
          </button>
          <button className="cancel-btn" onClick={onCancel}>
            Cancel
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
};

export default ConfirmModal;
