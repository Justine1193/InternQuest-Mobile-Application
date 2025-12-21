/**
 * Toast Container - Manages multiple toast notifications
 */

import React from "react";
import Toast from "./Toast";
import "./ToastContainer.css";

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default ToastContainer;

