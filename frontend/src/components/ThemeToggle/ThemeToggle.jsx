/**
 * ThemeToggle – Light / Dark mode switch with accessible, animated UI
 */

import React from "react";
import PropTypes from "prop-types";
import { IoMoonOutline, IoSunnyOutline } from "react-icons/io5";
import { useTheme } from "../../context/ThemeContext";
import "./ThemeToggle.css";

function ThemeToggle({ variant = "default", size = "medium", showLabel = false, className = "" }) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      className={`theme-toggle theme-toggle--${variant} theme-toggle--${size} ${showLabel ? "theme-toggle--with-label" : ""} ${className}`.trim()}
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      <span className="theme-toggle-track" aria-hidden>
        <span className="theme-toggle-thumb" data-dark={isDark} />
        <span className="theme-toggle-icon theme-toggle-icon--sun" aria-hidden>
          <IoSunnyOutline />
        </span>
        <span className="theme-toggle-icon theme-toggle-icon--moon" aria-hidden>
          <IoMoonOutline />
        </span>
      </span>
      {showLabel && (
        <span className="theme-toggle-label">
          {isDark ? "Light" : "Dark"}
        </span>
      )}
    </button>
  );
}

ThemeToggle.propTypes = {
  variant: PropTypes.oneOf(["default", "minimal", "pill"]),
  size: PropTypes.oneOf(["small", "medium", "large"]),
  showLabel: PropTypes.bool,
  className: PropTypes.string,
};

export default ThemeToggle;
