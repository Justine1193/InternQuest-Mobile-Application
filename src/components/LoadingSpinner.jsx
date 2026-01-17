import React from "react";
import PropTypes from "prop-types";
import "./LoadingSpinner.css";
import logo from "../assets/InternQuest_Logo.png";

/**
 * A modern loading spinner component with logo and animated elements
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
        {/* Logo with pulse animation */}
        <div className="loading-logo-wrapper">
          <img src={logo} alt="InternQuest" className="loading-logo" />
          <div className="loading-logo-ring"></div>
        </div>

        {/* Animated dots loader */}
        <div className="loading-dots">
          <span className="loading-dot"></span>
          <span className="loading-dot"></span>
          <span className="loading-dot"></span>
        </div>

        {/* Message */}
        {message && <p className="loading-message">{message}</p>}

        {/* Progress bar */}
        <div className="loading-progress-bar">
          <div className="loading-progress-fill"></div>
        </div>
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
