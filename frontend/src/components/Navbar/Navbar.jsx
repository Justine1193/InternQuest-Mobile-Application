/**
 * Sidebar navigation with collapsible menu and role-based links.
 */

import React, { useState, useEffect, useLayoutEffect } from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import {
  IoSettingsOutline,
  IoBriefcaseOutline,
  IoPeopleOutline,
  IoHelpCircleOutline,
  IoTrashOutline,
  IoTimeOutline,
  IoServerOutline,
  IoLockClosedOutline,
  IoChevronDownOutline,
  IoLogOutOutline,
  IoMenuOutline,
  IoCloseOutline,
} from "react-icons/io5";
import logo from "../../assets/InternQuest_Logo.png";
import logoIcon from "../../assets/Website_Icon.png";
import {
  getAdminRole,
  getAdminSession,
  canViewDashboard,
  canCreateAccounts,
  ROLES,
} from "../../utils/auth";
import { loadColleges } from "../../utils/collegeUtils";
import "./Navbar.css";

const MOBILE_BREAKPOINT_PX = 768;

function useIsMobile(breakpoint = MOBILE_BREAKPOINT_PX) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(`(max-width: ${breakpoint}px)`).matches;
  });
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const onChange = () => setIsMobile(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [breakpoint]);
  return isMobile;
}

const readSidebarCollapsed = () => {
  if (typeof window === "undefined") return false;
  try {
    const saved = window.localStorage.getItem("sidebarCollapsed");
    if (saved === null) return false;
    return JSON.parse(saved) === true;
  } catch {
    return false;
  }
};

const Navbar = ({ onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(readSidebarCollapsed);
  const [showSettingsMenu, setShowSettingsMenu] = useState(true);
  const [collegeName, setCollegeName] = useState("");
  const location = useLocation();
  const isMobile = useIsMobile(MOBILE_BREAKPOINT_PX);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  /** On phone/tablet, always show full labels inside the drawer (ignore desktop collapse). */
  const desktopCollapsed = !isMobile && isCollapsed;
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
    typeof adminSession?.college_name === "string" &&
    adminSession.college_name.trim()
      ? adminSession.college_name.trim()
      : "";
  const collegeCode =
    typeof adminSession?.college_code === "string" &&
    adminSession.college_code.trim()
      ? adminSession.college_code.trim().toUpperCase()
      : "";

  const sectionsLabel =
    sections.length === 0
      ? ""
      : sections.length === 1
      ? sections[0]
      : `${sections.slice(0, 2).join(", ")}${
          sections.length > 2 ? ` +${sections.length - 2}` : ""
        }`;

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
          setCollegeName(
            match?.college_name ? String(match.college_name).trim() : ""
          );
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

  const getRoleDisplayName = (role) => {
    const normalizedRole = role === "super_admin" ? "admin" : role;
    switch (normalizedRole) {
      case ROLES.SUPER_ADMIN:
      case "admin":
        return "Admin";
      case ROLES.COORDINATOR:
      case "coordinator":
        return "Coordinator";
      case ROLES.ADVISER:
      case "adviser":
        return "Adviser";
      default:
        return "Admin";
    }
  };

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    if (path === "/StudentDashboard") {
      return (
        location.pathname === "/StudentDashboard" ||
        location.pathname === "/students"
      );
    }
    if (path === "/helpDesk") {
      return (
        location.pathname === "/helpDesk" ||
        location.pathname === "/resource-management"
      );
    }
    return location.pathname.startsWith(path);
  };

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);
  const toggleSettingsMenu = () => setShowSettingsMenu((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSettingsMenu && !event.target.closest(".settings-section")) {
        setShowSettingsMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSettingsMenu]);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        setShowSettingsMenu(false);
        setMobileDrawerOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, []);

  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobile) {
      document.body.classList.remove("mobile-nav-drawer-open");
      return undefined;
    }
    if (mobileDrawerOpen) {
      document.body.classList.add("mobile-nav-drawer-open");
    } else {
      document.body.classList.remove("mobile-nav-drawer-open");
    }
    return () => {
      document.body.classList.remove("mobile-nav-drawer-open");
    };
  }, [isMobile, mobileDrawerOpen]);

  useLayoutEffect(() => {
    try {
      localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed));
    } catch {
      /* ignore quota / private mode */
    }
    if (isCollapsed) {
      document.body.classList.add("sidebar-collapsed");
    } else {
      document.body.classList.remove("sidebar-collapsed");
    }
  }, [isCollapsed]);

  return (
    <>
      {isMobile && (
        <header className="mobile-nav-bar" role="banner">
          <button
            type="button"
            className="mobile-nav-menu-btn"
            onClick={() => setMobileDrawerOpen((open) => !open)}
            aria-expanded={mobileDrawerOpen}
            aria-controls="mobile-sidebar-nav"
            aria-label={
              mobileDrawerOpen ? "Close navigation menu" : "Open navigation menu"
            }
          >
            {mobileDrawerOpen ? (
              <IoCloseOutline className="mobile-nav-menu-icon" aria-hidden />
            ) : (
              <IoMenuOutline className="mobile-nav-menu-icon" aria-hidden />
            )}
          </button>
          <img
            src={logoIcon}
            alt=""
            className="mobile-nav-bar-logo"
            width={40}
            height={40}
          />
          <span className="mobile-nav-bar-title">InternQuest</span>
        </header>
      )}
      {isMobile && mobileDrawerOpen && (
        <button
          type="button"
          className="mobile-nav-backdrop"
          aria-label="Close menu"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}
      <nav
        id="mobile-sidebar-nav"
        className={`sidebar-nav ${desktopCollapsed ? "collapsed" : ""} ${
          isMobile ? "sidebar-nav--mobile" : ""
        } ${isMobile && mobileDrawerOpen ? "mobile-drawer-open" : ""}`}
        role="navigation"
        aria-label="Main navigation"
        aria-hidden={isMobile && !mobileDrawerOpen ? true : undefined}
      >
        <div className="sidebar-header">
          <div className="logo-container">
            <img
              src={desktopCollapsed ? logoIcon : logo}
              alt="InternQuest Logo"
              className={`sidebar-logo ${desktopCollapsed ? "collapsed" : ""}`}
            />
          </div>
          {!isMobile && (
            <button
              type="button"
              className="collapse-btn"
              onClick={toggleSidebar}
              aria-label={
                desktopCollapsed ? "Expand sidebar" : "Collapse sidebar"
              }
              title={desktopCollapsed ? "Expand" : "Collapse"}
            >
              <span className="collapse-icon">{desktopCollapsed ? "»" : "«"}</span>
            </button>
          )}
        </div>
      <div className="sidebar-menu">
        <div className="menu-section">
          {!desktopCollapsed && <span className="menu-label">Main Menu</span>}

          <Link
            to="/dashboard"
            className={`sidebar-link ${isActive("/dashboard") ? "active" : ""}`}
            title={isAdviser ? "View Companies" : "Manage Company"}
          >
            <IoBriefcaseOutline className="sidebar-icon" />
            {!desktopCollapsed && (
              <span>{isAdviser ? "View Companies" : "Manage Company"}</span>
            )}
          </Link>

          <Link
            to="/students"
            className={`sidebar-link ${
              isActive("/StudentDashboard") ? "active" : ""
            }`}
            title="Manage Students"
          >
            <IoPeopleOutline className="sidebar-icon" />
            {!desktopCollapsed && <span>Manage Students</span>}
          </Link>
        </div>

        <div
          className={`menu-section settings-section ${
            showSettingsMenu ? "is-open" : ""
          }`}
        >
          {!desktopCollapsed ? (
            <>
              <button
                type="button"
                className="settings-trigger"
                onClick={toggleSettingsMenu}
                aria-expanded={showSettingsMenu}
                aria-controls="settings-dropdown"
                id="settings-trigger"
                aria-label={
                  showSettingsMenu
                    ? "Collapse Settings menu"
                    : "Expand Settings menu"
                }
              >
                <IoSettingsOutline
                  className="settings-trigger-icon"
                  aria-hidden
                />
                <span className="settings-trigger-text">Settings</span>
                <IoChevronDownOutline
                  className="settings-chevron"
                  aria-hidden
                />
              </button>
              <div
                id="settings-dropdown"
                className="settings-dropdown-content"
                role="region"
                aria-labelledby="settings-trigger"
              >
                <div className="settings-dropdown-inner">
                  {canCreate && (
                    <Link
                      to="/adminManagement"
                      className={`sidebar-link ${
                        isActive("/adminManagement") ? "active" : ""
                      }`}
                      title="OJT Faculties"
                    >
                      <IoPeopleOutline className="sidebar-icon" />
                      <span>OJT Faculties</span>
                    </Link>
                  )}

                  <Link
                    to="/security-settings"
                    className={`sidebar-link ${
                      isActive("/security-settings") ? "active" : ""
                    }`}
                    title="Change Password"
                  >
                    <IoLockClosedOutline className="sidebar-icon" />
                    <span>Change Password</span>
                  </Link>

                  {canViewDash && (
                    <Link
                      to="/resource-management"
                      className={`sidebar-link ${
                        isActive("/resource-management") ||
                        isActive("/helpDesk")
                          ? "active"
                          : ""
                      }`}
                      title="Guide Management"
                    >
                      <IoHelpCircleOutline className="sidebar-icon" />
                      <span>Guide</span>
                    </Link>
                  )}

                  {isSuperAdmin && (
                    <Link
                      to="/platform-data"
                      className={`sidebar-link ${
                        isActive("/platform-data") ? "active" : ""
                      }`}
                      title="Platform Data"
                    >
                      <IoServerOutline className="sidebar-icon" />
                      <span>Platform Data</span>
                    </Link>
                  )}

                  {isSuperAdmin && (
                    <Link
                      to="/activityLog"
                      className={`sidebar-link ${
                        isActive("/activityLog") ? "active" : ""
                      }`}
                      title="Activity Log"
                    >
                      <IoTimeOutline className="sidebar-icon" />
                      <span>Activity Log</span>
                    </Link>
                  )}

                  {isSuperAdmin && (
                    <Link
                      to="/archive"
                      className={`sidebar-link ${
                        isActive("/archive") || isActive("/deleted") ? "active" : ""
                      }`}
                      title="Archive Management"
                    >
                      <IoTrashOutline className="sidebar-icon" />
                      <span>Archive</span>
                    </Link>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* 1. OJT Faculties */}
              {canCreate && (
                <Link
                  to="/adminManagement"
                  className={`sidebar-link ${
                    isActive("/adminManagement") ? "active" : ""
                  }`}
                  title="OJT Faculties"
                >
                  <IoPeopleOutline className="sidebar-icon" />
                  {!desktopCollapsed && <span>OJT Faculties</span>}
                </Link>
              )}

              <Link
                to="/security-settings"
                className={`sidebar-link ${
                  isActive("/security-settings") ? "active" : ""
                }`}
                title="Change Password"
              >
                <IoLockClosedOutline className="sidebar-icon" />
                {!desktopCollapsed && <span>Change Password</span>}
              </Link>

              {canViewDash && (
                <Link
                  to="/resource-management"
                  className={`sidebar-link ${
                    isActive("/resource-management") || isActive("/helpDesk")
                      ? "active"
                      : ""
                  }`}
                  title="Guide Management"
                >
                  <IoHelpCircleOutline className="sidebar-icon" />
                  {!desktopCollapsed && <span>Guide</span>}
                </Link>
              )}

              {isSuperAdmin && (
                <Link
                  to="/platform-data"
                  className={`sidebar-link ${
                    isActive("/platform-data") ? "active" : ""
                  }`}
                  title="Platform Data"
                >
                  <IoServerOutline className="sidebar-icon" />
                  {!desktopCollapsed && <span>Platform Data</span>}
                </Link>
              )}

              {isSuperAdmin && (
                <Link
                  to="/activityLog"
                  className={`sidebar-link ${
                    isActive("/activityLog") ? "active" : ""
                  }`}
                  title="Activity Log"
                >
                  <IoTimeOutline className="sidebar-icon" />
                  {!desktopCollapsed && <span>Activity Log</span>}
                </Link>
              )}

              {isSuperAdmin && (
                <Link
                  to="/archive"
                  className={`sidebar-link ${
                    isActive("/archive") || isActive("/deleted") ? "active" : ""
                  }`}
                  title="Archive Management"
                >
                  <IoTrashOutline className="sidebar-icon" />
                  {!desktopCollapsed && <span>Archive</span>}
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      <div className="sidebar-footer">
        <div className={`user-profile ${desktopCollapsed ? "collapsed" : ""}`}>
          <div className="user-avatar-container">
            <div className="user-avatar-circle">
              <span className="user-avatar-initials">
                {username
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) || "A"}
              </span>
            </div>
            <span className="online-indicator"></span>
          </div>
          {!desktopCollapsed && (
            <div className="user-info-text">
              <div className="user-info-header">
                <span className="user-name">{username}</span>
                <span className="user-role-badge">
                  {getRoleDisplayName(currentRole)}
                </span>
              </div>
              {(collegeCode || sectionsLabel) && (
                <div className="user-info-details">
                  {collegeCode && (
                    <div className="user-detail-item">
                      <span className="user-detail-icon">🏛️</span>
                      <span
                        className="user-detail-text"
                        title={
                          collegeName
                            ? `College: ${collegeName}`
                            : `College: ${collegeCode}`
                        }
                      >
                        {collegeName || collegeCode}
                      </span>
                    </div>
                  )}
                  {sectionsLabel && (
                    <div className="user-detail-item">
                      <span className="user-detail-icon">📚</span>
                      <span
                        className="user-detail-text"
                        title={`Sections: ${sections.join(", ")}`}
                      >
                        {sectionsLabel}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            setMobileDrawerOpen(false);
            if (typeof onLogout === "function") onLogout();
          }}
          className="logout-btn"
          title="Logout"
        >
          <IoLogOutOutline className="sidebar-icon" />
          {!desktopCollapsed && <span>Logout</span>}
        </button>
      </div>
    </nav>
    </>
  );
};

Navbar.propTypes = {
  /** Function to handle logout action */
  onLogout: PropTypes.func,
};

export default Navbar;
