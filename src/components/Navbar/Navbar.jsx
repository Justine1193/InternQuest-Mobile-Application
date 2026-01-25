/**
 * Navbar - Left sidebar navigation for the admin dashboard
 * Modern sidebar design with collapsible menu
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
  IoServerOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoLogOutOutline,
  IoHomeOutline
} from "react-icons/io5";
import logo from "../../assets/InternQuest_Logo.png";
import logoIcon from "../../assets/Website_Icon.png";
import { getAdminRole, getAdminSession, canViewDashboard, canCreateAccounts, hasRole, ROLES } from "../../utils/auth";
import { loadColleges } from "../../utils/collegeUtils";
import "./Navbar.css";

const Navbar = ({ onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [collegeName, setCollegeName] = useState("");
  const location = useLocation();
  const currentRole = getAdminRole();
  const canViewDash = canViewDashboard();
  const canCreate = canCreateAccounts();
  const isAdviser = currentRole === ROLES.ADVISER;
  const isSuperAdmin = currentRole === ROLES.SUPER_ADMIN;
  const adminSession = getAdminSession();
  const username = adminSession?.username || "Admin";
  const sections = Array.isArray(adminSession?.sections)
    ? adminSession.sections.filter((s) => typeof s === "string" && s.trim())
    : [];
  const sessionCollegeName =
    typeof adminSession?.college_name === "string" && adminSession.college_name.trim()
      ? adminSession.college_name.trim()
      : "";
  const collegeCode =
    typeof adminSession?.college_code === "string" && adminSession.college_code.trim()
      ? adminSession.college_code.trim().toUpperCase()
      : "";

  const sectionsLabel =
    sections.length === 0
      ? ""
      : sections.length === 1
      ? sections[0]
      : `${sections.slice(0, 2).join(", ")}${sections.length > 2 ? ` +${sections.length - 2}` : ""}`;

  useEffect(() => {
    let isMounted = true;

    const resolveCollegeName = async () => {
      if (sessionCollegeName) {
        setCollegeName(sessionCollegeName);
        return;
      }
      if (!collegeCode) {
        setCollegeName("");
        return;
      }

      try {
        const colleges = await loadColleges();
        const match = colleges.find((c) => {
          const code = (c?.college_code || "").toString().trim().toUpperCase();
          return code && code === collegeCode;
        });
        if (isMounted) {
          setCollegeName(match?.college_name ? String(match.college_name).trim() : "");
        }
      } catch (err) {
        if (isMounted) {
          setCollegeName("");
        }
      }
    };

    resolveCollegeName();
    return () => {
      isMounted = false;
    };
  }, [collegeCode, sessionCollegeName]);
  
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
    if (path === "/helpDesk") {
      return location.pathname === "/helpDesk" || location.pathname === "/resource-management";
    }
    return location.pathname.startsWith(path);
  };

  // Toggle sidebar collapse
  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  // Toggle settings submenu
  const toggleSettingsMenu = () => setShowSettingsMenu((prev) => !prev);

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSettingsMenu && !event.target.closest('.settings-section')) {
        setShowSettingsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettingsMenu]);

  // Close settings on ESC key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setShowSettingsMenu(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  // Save collapsed state to localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
    // Update body class for dashboard content adjustment
    if (isCollapsed) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
  }, [isCollapsed]);

  return (
    <nav className={`sidebar-nav ${isCollapsed ? 'collapsed' : ''}`} role="navigation" aria-label="Main navigation">
      {/* Logo Section */}
      <div className="sidebar-header">
        <div className="logo-container">
          <img 
            src={isCollapsed ? logoIcon : logo} 
            alt="InternQuest Logo" 
            className={`sidebar-logo ${isCollapsed ? 'collapsed' : ''}`} 
          />
        </div>
        <button
          className="collapse-btn"
          onClick={toggleSidebar}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          <span className="collapse-icon">{isCollapsed ? "»" : "«"}</span>
        </button>
      </div>

      {/* Main Navigation Links */}
      <div className="sidebar-menu">
        <div className="menu-section">
          {!isCollapsed && <span className="menu-label">Main Menu</span>}
          
          <a 
            href="/dashboard" 
            className={`sidebar-link ${isActive("/dashboard") ? "active" : ""}`}
            title={isAdviser ? "View Companies" : "Manage Company"}
          >
            <IoBriefcaseOutline className="sidebar-icon" />
            {!isCollapsed && <span>{isAdviser ? "View Companies" : "Manage Company"}</span>}
          </a>
          
          <a 
            href="/StudentDashboard" 
            className={`sidebar-link ${isActive("/StudentDashboard") ? "active" : ""}`}
            title="Manage Students"
          >
            <IoPeopleOutline className="sidebar-icon" />
            {!isCollapsed && <span>Manage Students</span>}
          </a>
          
          {canViewDash && (
            <a 
              href="/resource-management" 
              className={`sidebar-link ${isActive("/resource-management") || isActive("/helpDesk") ? "active" : ""}`}
              title="Resource Management"
            >
              <IoHelpCircleOutline className="sidebar-icon" />
              {!isCollapsed && <span>Resources</span>}
            </a>
          )}
        </div>

        {/* Settings Section */}
        <div className="menu-section settings-section">
          {!isCollapsed && <span className="menu-label">Settings</span>}
          
          {canCreate && (
            <a 
              href="/adminManagement" 
              className={`sidebar-link ${isActive("/adminManagement") ? "active" : ""}`}
              title="User & Role Management"
            >
              <IoShieldCheckmarkOutline className="sidebar-icon" />
              {!isCollapsed && <span>User & Role Management</span>}
            </a>
          )}
          
          {isSuperAdmin && (
            <a 
              href="/deleted" 
              className={`sidebar-link ${isActive("/deleted") ? "active" : ""}`}
              title="Archive Management"
            >
              <IoTrashOutline className="sidebar-icon" />
              {!isCollapsed && <span>Archive</span>}
            </a>
          )}
          
          {isSuperAdmin && (
            <a 
              href="/activityLog" 
              className={`sidebar-link ${isActive("/activityLog") ? "active" : ""}`}
              title="Activity Log"
            >
              <IoTimeOutline className="sidebar-icon" />
              {!isCollapsed && <span>Activity Log</span>}
            </a>
          )}
          
          <a 
            href="/security-settings" 
            className={`sidebar-link ${isActive("/security-settings") ? "active" : ""}`}
            title="Security Settings"
          >
            <IoSettingsOutline className="sidebar-icon" />
            {!isCollapsed && <span>Security</span>}
          </a>

          {canCreate && (
            <a
              href="/platform-data"
              className={`sidebar-link ${isActive("/platform-data") ? "active" : ""}`}
              title="Platform Data"
            >
              <IoServerOutline className="sidebar-icon" />
              {!isCollapsed && <span>Platform Data</span>}
            </a>
          )}
        </div>
      </div>

      {/* User Profile Section */}
      <div className="sidebar-footer">
        <div className={`user-profile ${isCollapsed ? 'collapsed' : ''}`}>
          <div className="user-avatar-container">
            <IoPersonCircleOutline className="user-avatar-icon" />
            <span className="online-indicator"></span>
          </div>
          {!isCollapsed && (
            <div className="user-info-text">
              <span className="user-name">{username}</span>
              <span className="user-role">{getRoleDisplayName(currentRole)}</span>
              {collegeCode && (
                <span
                  className="user-meta user-meta-college"
                  title={
                    collegeName
                      ? `College: ${collegeName}`
                      : `College: ${collegeCode}`
                  }
                >
                  College: {collegeName || collegeCode}
                </span>
              )}
              {sectionsLabel && (
                <span className="user-meta" title={`Sections: ${sections.join(", ")}`}>
                  Sections: {sectionsLabel}
                </span>
              )}
            </div>
          )}
        </div>
        
        <button 
          onClick={onLogout} 
          className="logout-btn"
          title="Logout"
        >
          <IoLogOutOutline className="sidebar-icon" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </nav>
  );
};

Navbar.propTypes = {
  /** Function to handle logout action */
  onLogout: PropTypes.func.isRequired,
};

export default Navbar;
