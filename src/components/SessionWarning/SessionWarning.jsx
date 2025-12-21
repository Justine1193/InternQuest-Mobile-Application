/**
 * SessionWarning - Component to show session expiration warning
 * Displays a modal when session is about to expire
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { IoTimeOutline, IoRefreshOutline } from 'react-icons/io5';
import { getAdminSession, createAdminSession } from '../../utils/auth';
import './SessionWarning.css';

const SessionWarning = ({ onExtend, onLogout }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  React.useEffect(() => {
    const checkSession = () => {
      const session = getAdminSession();
      if (!session || !session.expiresAt) return;

      const remaining = session.expiresAt - Date.now();
      const warningTime = 2 * 60 * 1000; // 2 minutes

      if (remaining > 0 && remaining <= warningTime) {
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        setIsVisible(true);
      } else if (remaining > warningTime) {
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
      // Extend session by 30 minutes
      const extendedExpiresAt = Date.now() + 30 * 60 * 1000;
      createAdminSession({
        ...session,
        expiresAt: extendedExpiresAt,
      });
      setIsVisible(false);
      if (onExtend) onExtend();
    }
  };

  const handleLogout = () => {
    setIsVisible(false);
    if (onLogout) onLogout();
  };

  if (!isVisible) return null;

  return (
    <div className="session-warning-overlay">
      <div className="session-warning-modal">
        <div className="session-warning-icon">
          <IoTimeOutline />
        </div>
        <h3>Session Expiring Soon</h3>
        <p>Your session will expire in <strong>{timeRemaining}</strong></p>
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

