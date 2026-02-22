/**
 * Confirmation dialog for destructive or important actions.
 */

import React from "react";
import PropTypes from "prop-types";
import { IoWarningOutline, IoCloseOutline } from "react-icons/io5";
import "./ConfirmAction.css";

const ConfirmAction = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleConfirm = () => {
    if (!isLoading) onConfirm();
  };

  return (
    <div className="confirm-action-overlay" onClick={handleBackdropClick}>
      <div className="confirm-action-modal">
        <button
          className="confirm-action-close"
          onClick={onClose}
          aria-label="Close"
          disabled={isLoading}
        >
          <IoCloseOutline />
        </button>
        <div className={`confirm-action-icon confirm-action-icon-${type}`}>
          <IoWarningOutline />
        </div>
        <h3 className="confirm-action-title">{title}</h3>
        <p className="confirm-action-message">{message}</p>
        <div className="confirm-action-actions">
          <button
            className="confirm-action-btn confirm-action-btn-cancel"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            className={`confirm-action-btn confirm-action-btn-confirm confirm-action-btn-${type}`}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-small" aria-hidden="true" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

ConfirmAction.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  type: PropTypes.oneOf(["danger", "warning", "info"]),
  isLoading: PropTypes.bool,
};

export default ConfirmAction;
