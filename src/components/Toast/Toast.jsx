/**
 * Toast Notification Component
 * Displays temporary success/error/info messages with progress indicator
 */

import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { 
  IoCheckmarkCircle, 
  IoCloseCircle, 
  IoInformationCircle, 
  IoWarning,
  IoClose 
} from "react-icons/io5";
import "./Toast.css";

const Toast = ({ 
  message, 
  type = "info", 
  duration = 3000, 
  onClose,
  actionLabel,
  onAction,
  showProgress = true
}) => {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const toastRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const remainingTimeRef = useRef(duration);

  useEffect(() => {
    if (duration > 0 && showProgress && !isPaused) {
      const updateProgress = () => {
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = Math.max(0, remainingTimeRef.current - elapsed);
        const progressPercent = (remaining / duration) * 100;
        
        setProgress(progressPercent);
        
        if (remaining <= 0) {
          onClose();
        }
      };

      progressIntervalRef.current = setInterval(updateProgress, 50);
      return () => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      };
    } else if (duration > 0 && !showProgress) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose, showProgress, isPaused]);

  const handleMouseEnter = () => {
    if (duration > 0 && showProgress) {
      setIsPaused(true);
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
    }
  };

  const handleMouseLeave = () => {
    if (duration > 0 && showProgress) {
      setIsPaused(false);
      startTimeRef.current = Date.now();
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <IoCheckmarkCircle className="toast-icon" />;
      case "error":
        return <IoCloseCircle className="toast-icon" />;
      case "warning":
        return <IoWarning className="toast-icon" />;
      default:
        return <IoInformationCircle className="toast-icon" />;
    }
  };

  return (
    <div 
      className={`toast toast-${type}`} 
      role="alert"
      ref={toastRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="toast-content">
        <div className="toast-icon-wrapper">
          {getIcon()}
        </div>
        <div className="toast-message-wrapper">
          <span className="toast-message">{message}</span>
          {onAction && actionLabel && (
            <button
              className="toast-action"
              onClick={onAction}
              aria-label={actionLabel}
            >
              {actionLabel}
            </button>
          )}
        </div>
        <button
          className="toast-close"
          onClick={onClose}
          aria-label="Close notification"
        >
          <IoClose />
        </button>
      </div>
      {showProgress && duration > 0 && (
        <div className="toast-progress-bar">
          <div 
            className="toast-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(["success", "error", "info", "warning"]),
  duration: PropTypes.number,
  onClose: PropTypes.func.isRequired,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
  showProgress: PropTypes.bool,
};

export default Toast;

