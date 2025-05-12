/**
 * Navbar - Top navigation bar for the admin dashboard
 * Includes logo, navigation links, and a settings/logout dropdown
 *
 * @component
 * @example
 * <Navbar onLogout={() => handleLogout()} />
 */

import React, { useState } from "react";
import PropTypes from "prop-types";
import { IoSettingsOutline } from "react-icons/io5";
import logo from "../../assets/InternQuest_Logo.png";
import "./Navbar.css";

const Navbar = ({ onLogout }) => {
  const [showLogout, setShowLogout] = useState(false);

  // Toggle logout dropdown
  const toggleLogout = () => setShowLogout((prev) => !prev);

  // Hide dropdown when focus is lost
  const handleBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setShowLogout(false);
    }
  };

  return (
    <nav className="top-nav" role="navigation" aria-label="Main navigation">
      <div className="nav-left">
        <div className="logo">
          <img src={logo} alt="InternQuest Logo" height="32" />
        </div>
        <div className="nav-links">
          <a href="/dashboard" className="nav-link active">
            Manage Internships
          </a>
          <a href="/studentDashboard" className="nav-link">
            Manage Students
          </a>
        </div>
      </div>
      <div className="nav-right" tabIndex={-1} onBlur={handleBlur}>
        <button
          className="settings-icon"
          aria-label="Settings menu"
          aria-haspopup="true"
          aria-expanded={showLogout}
          onClick={toggleLogout}
          tabIndex={0}
          type="button"
        >
          <IoSettingsOutline />
        </button>
        {showLogout && (
          <div className="logout-dropdown" role="menu">
            <button onClick={onLogout} role="menuitem" tabIndex={0}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

Navbar.propTypes = {
  /** Function to handle logout action */
  onLogout: PropTypes.func.isRequired,
};

export default Navbar;
