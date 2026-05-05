/**
 * Custom hook for session expiration warning
 * Shows a warning when session is about to expire
 */

import { useEffect, useState } from 'react';
import { getAdminSession } from '../utils/auth';

const WARNING_TIME_MS = 2 * 60 * 1000; // 2 minutes before expiration
const CHECK_INTERVAL_MS = 30 * 1000; // Check every 30 seconds

/**
 * Hook to monitor session expiration and show warnings
 * @param {function} onWarning - Callback when warning should be shown
 * @param {function} onExpired - Callback when session expires
 * @returns {object} - { timeRemaining, showWarning, extendSession }
 */
export const useSessionWarning = (onWarning, onExpired) => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const checkSession = () => {
      const session = getAdminSession();
      
      if (!session || !session.expiresAt) {
        if (onExpired) onExpired();
        return;
      }

      const now = Date.now();
      const expiresAt = session.expiresAt;
      const remaining = expiresAt - now;

      setTimeRemaining(remaining);

      if (remaining <= 0) {
        // Session expired
        if (onExpired) onExpired();
        setShowWarning(false);
      } else if (remaining <= WARNING_TIME_MS && !showWarning) {
        // Show warning
        setShowWarning(true);
        if (onWarning) {
          onWarning(remaining);
        }
      } else if (remaining > WARNING_TIME_MS) {
        setShowWarning(false);
      }
    };

    // Check immediately
    checkSession();

    // Set up interval
    const interval = setInterval(checkSession, CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [onWarning, onExpired, showWarning]);

  const formatTimeRemaining = () => {
    if (!timeRemaining || timeRemaining <= 0) return '0:00';
    
    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    timeRemaining,
    showWarning,
    formattedTime: formatTimeRemaining(),
  };
};

export default useSessionWarning;

