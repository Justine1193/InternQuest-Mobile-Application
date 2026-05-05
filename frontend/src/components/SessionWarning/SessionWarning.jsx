/**
 * Modal shown when session is about to expire; offers extend or logout.
 */

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { IoTimeOutline, IoRefreshOutline } from "react-icons/io5";
import { getAdminSession, createAdminSession } from "../../utils/auth";
import "./SessionWarning.css";

const WARNING_MS = 2 * 60 * 1000;
const EXTEND_MS = 30 * 60 * 1000;

const SessionWarning = ({ onExtend, onLogout }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    const checkSession = () => {
      const session = getAdminSession();
      if (!session?.expiresAt) return;

      const remaining = session.expiresAt - Date.now();
      if (remaining > 0 && remaining <= WARNING_MS) {
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        setTimeRemaining(
          `${minutes}:${seconds.toString().padStart(2, "0")}`
        );
        setIsVisible(true);
      } else if (remaining > WARNING_MS) {
        setIsVisible(false);
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleExtend = () => {
    const session = getAdminSession();
    if (session) {
      createAdminSession({
        ...session,
        expiresAt: Date.now() + EXTEND_MS,
      });
      setIsVisible(false);
      onExtend?.();
    }
  };

  const handleLogout = () => {
    setIsVisible(false);
    onLogout?.();
  };

  if (!isVisible) return null;

  return (
    <div className="session-warning-overlay">
      <div className="session-warning-modal">
        <div className="session-warning-icon">
          <IoTimeOutline />
        </div>
        <h3>Session Expiring Soon</h3>
        <p>
          Your session will expire in <strong>{timeRemaining}</strong>
        </p>
        <p className="session-warning-subtitle">
          Would you like to extend your session?
        </p>
        <div className="session-warning-actions">
          <button
            className="session-warning-btn session-warning-btn-extend"
            onClick={handleExtend}
          >
            <IoRefreshOutline />
            Extend Session
          </button>
          <button
            className="session-warning-btn session-warning-btn-logout"
            onClick={handleLogout}
          >
            Logout Now
          </button>
        </div>
      </div>
    </div>
  );
};

SessionWarning.propTypes = {
  onExtend: PropTypes.func,
  onLogout: PropTypes.func,
};

export default SessionWarning;
