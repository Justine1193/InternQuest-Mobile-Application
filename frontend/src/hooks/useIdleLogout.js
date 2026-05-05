/**
 * Custom hook for auto-logout on idle
 * Logs out the user after 5 minutes of inactivity
 */

import { useEffect, useRef } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { clearAdminSession } from "../utils/auth";

const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Hook to handle automatic logout after idle time
 * @param {boolean} enabled - Whether idle detection is enabled (default: true)
 */
const useIdleLogout = (enabled = true) => {
  const timeoutRef = useRef(null);

  const resetTimer = () => {
    if (!enabled) return;
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for logout
    timeoutRef.current = setTimeout(async () => {
      try {
        // Sign out from Firebase Auth
        await signOut(auth);
      } catch (error) {
        console.error("Logout error during idle timeout:", error);
      } finally {
        // Clear admin session and redirect
        clearAdminSession();
        window.location.href = "/";
      }
    }, IDLE_TIMEOUT);
  };

  useEffect(() => {
    if (!enabled) {
      // Clear timeout if disabled
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // List of events that indicate user activity
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, resetTimer, true);
    });

    // Initialize timer
    resetTimer();

    // Cleanup function
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer, true);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [enabled]);
};

export default useIdleLogout;

