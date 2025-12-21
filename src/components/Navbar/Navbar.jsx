/**
 * Navbar - Top navigation bar for the admin dashboard
 * Includes logo, navigation links, and a settings/logout dropdown
 *
 * @component
 * @example
 * <Navbar onLogout={() => handleLogout()} />
 */

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";
import { 
  IoSettingsOutline, 
  IoBriefcaseOutline, 
  IoPeopleOutline, 
  IoHelpCircleOutline, 
  IoShieldCheckmarkOutline, 
  IoTrashOutline,
  IoTimeOutline,
  IoPersonCircleOutline,
  IoMenuOutline,
  IoCloseOutline
} from "react-icons/io5";
import logo from "../../assets/InternQuest_Logo.png";
import { getAdminRole, getAdminSession, canViewDashboard, canCreateAccounts, hasRole, ROLES } from "../../utils/auth";
import "./Navbar.css";

const Navbar = ({ onLogout }) => {
  const [showLogout, setShowLogout] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const location = useLocation();
  const currentRole = getAdminRole();
  const canViewDash = canViewDashboard();
  const canCreate = canCreateAccounts();
  const isAdviser = currentRole === ROLES.ADVISER;
  const adminSession = getAdminSession();
  const username = adminSession?.username || "Admin";
  
  // Format role name for display
  const getRoleDisplayName = (role) => {
    switch (role) {
      case ROLES.SUPER_ADMIN:
        return "Super Admin";
      case ROLES.COORDINATOR:
        return "Coordinator";
      case ROLES.ADVISER:
        return "Adviser";
      default:
        return role || "Admin";
    }
  };

  const isActive = (path) => {
    if (path === "/dashboard" || path === "/StudentDashboard") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // Toggle logout dropdown
  const toggleLogout = () => setShowLogout((prev) => !prev);

  // Toggle mobile menu
  const toggleMobileMenu = () => setShowMobileMenu((prev) => !prev);

  // Hide dropdown when focus is lost
  const handleBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setShowLogout(false);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLogout && !event.target.closest('.nav-right')) {
        setShowLogout(false);
      }
      if (showMobileMenu && !event.target.closest('.nav-left') && !event.target.closest('.mobile-menu')) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLogout, showMobileMenu]);

  // Close dropdowns on ESC key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setShowLogout(false);
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setShowMobileMenu(false);
  }, [location.pathname]);

  return (
    <nav className="top-nav" role="navigation" aria-label="Main navigation">
      <div className="nav-left">
        <div className="logo">
          <img src={logo} alt="InternQuest Logo" height="32" />
        </div>
        <button
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={showMobileMenu}
          type="button"
        >
          {showMobileMenu ? <IoCloseOutline /> : <IoMenuOutline />}
        </button>
        <div className={`nav-links ${showMobileMenu ? "mobile-menu-open" : ""}`}>
          {canViewDash && (
            <a 
              href="/dashboard" 
              className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}
              onClick={() => setShowMobileMenu(false)}
            >
              <IoBriefcaseOutline className="nav-link-icon" />
              <span>Manage Company</span>
            </a>
          )}
          <a 
            href="/StudentDashboard" 
            className={`nav-link ${isActive("/StudentDashboard") ? "active" : ""}`}
            onClick={() => setShowMobileMenu(false)}
          >
            <IoPeopleOutline className="nav-link-icon" />
            <span>Manage Students</span>
          </a>
          {canViewDash && (
            <a 
              href="/helpDesk" 
              className={`nav-link ${isActive("/helpDesk") ? "active" : ""}`}
              onClick={() => setShowMobileMenu(false)}
            >
              <IoHelpCircleOutline className="nav-link-icon" />
              <span>Help Desk</span>
            </a>
          )}
        </div>
        {showMobileMenu && <div className="mobile-menu-backdrop" onClick={() => setShowMobileMenu(false)} />}
      </div>
      <div className="nav-right" tabIndex={-1} onBlur={handleBlur}>
        <div className="user-info">
          <IoPersonCircleOutline className="user-avatar" />
          <div className="user-details">
            <span className="user-name">{username}</span>
            <span className="user-role">{getRoleDisplayName(currentRole)}</span>
          </div>
        </div>
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
            {canCreate && (
              <a 
                href="/adminManagement" 
                className={`dropdown-item ${isActive("/adminManagement") ? "active" : ""}`}
                role="menuitem"
                tabIndex={0}
                onClick={() => setShowLogout(false)}
              >
                <IoShieldCheckmarkOutline className="dropdown-icon" />
                <span>Admin Management</span>
              </a>
            )}
            {canViewDash && (
              <a 
                href="/deleted" 
                className={`dropdown-item ${isActive("/deleted") ? "active" : ""}`}
                role="menuitem"
                tabIndex={0}
                onClick={() => setShowLogout(false)}
              >
                <IoTrashOutline className="dropdown-icon" />
                <span>Archive Management</span>
              </a>
            )}
            {canViewDash && (
              <a 
                href="/activityLog" 
                className={`dropdown-item ${isActive("/activityLog") ? "active" : ""}`}
                role="menuitem"
                tabIndex={0}
                onClick={() => setShowLogout(false)}
              >
                <IoTimeOutline className="dropdown-icon" />
                <span>Activity Log</span>
              </a>
            )}
            <div className="dropdown-divider"></div>
            <button onClick={onLogout} role="menuitem" tabIndex={0} className="dropdown-item logout-button">
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
