import React from 'react';
import './ConfirmModal.css';

const ConfirmModal = ({ open, message, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="confirm-modal-backdrop">
      <div className="confirm-modal">
        <div className="confirm-modal-message">{message}</div>
        <div className="confirm-modal-actions">
          <button className="confirm-btn" onClick={onConfirm}>Delete</button>
          <button className="cancel-btn" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
