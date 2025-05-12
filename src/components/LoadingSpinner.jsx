import React from "react";
import PropTypes from "prop-types";
import "./LoadingSpinner.css";

/**
 * A reusable loading spinner component that can be used as an overlay
 * @param {Object} props - Component props
 * @param {boolean} props.isLoading - Whether the spinner should be shown
 * @param {string} props.message - Optional message to display below the spinner
 * @param {string} props.className - Optional additional CSS classes
 * @returns {JSX.Element|null} The loading spinner component or null if not loading
 */
const LoadingSpinner = ({
  isLoading,
  message = "Loading...",
  className = "",
}) => {
  if (!isLoading) return null;

  return (
    <div
      className={`loading-spinner-overlay ${className}`}
      role="alert"
      aria-busy="true"
    >
      <div className="loading-spinner-container">
        <div className="loading-spinner"></div>
        {message && <p className="loading-message">{message}</p>}
      </div>
    </div>
  );
};

LoadingSpinner.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  message: PropTypes.string,
  className: PropTypes.string,
};

export default LoadingSpinner;
