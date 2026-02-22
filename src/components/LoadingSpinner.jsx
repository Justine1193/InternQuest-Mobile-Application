/**
 * Loading spinner with logo and optional message.
 */

import React from "react";
import PropTypes from "prop-types";
import "./LoadingSpinner.css";
import logo from "../assets/InternQuest_Logo.png";

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
        <div className="loading-logo-wrapper">
          <img src={logo} alt="InternQuest" className="loading-logo" />
          <div className="loading-logo-ring" />
        </div>
        <div className="loading-dots">
          <span className="loading-dot" />
          <span className="loading-dot" />
          <span className="loading-dot" />
        </div>
        {message && <p className="loading-message">{message}</p>}
        <div className="loading-progress-bar">
          <div className="loading-progress-fill" />
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
