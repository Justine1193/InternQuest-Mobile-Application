import { useCallback, useEffect, useMemo, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';

type LogoutReason = 'inactivity' | 'background';

type UseAutoLogoutOptions = {
  enabled: boolean;
  inactivityMs?: number;
  backgroundMs?: number;
  onLogout?: (reason: LogoutReason) => void;
};

const DEFAULT_INACTIVITY_MS = 30 * 60 * 1000; // 30 minutes
const DEFAULT_BACKGROUND_MS = 5 * 60 * 1000; // 5 minutes

export function useAutoLogout(options: UseAutoLogoutOptions) {
  const inactivityMs = options.inactivityMs ?? DEFAULT_INACTIVITY_MS;
  const backgroundMs = options.backgroundMs ?? DEFAULT_BACKGROUND_MS;

  const enabledRef = useRef(options.enabled);
  enabledRef.current = options.enabled;

  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const inactivityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backgroundAtRef = useRef<number | null>(null);
  const isLoggingOutRef = useRef(false);

  const clearInactivityTimeout = useCallback(() => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
      inactivityTimeoutRef.current = null;
    }
  }, []);

  const doLogout = useCallback(
    async (reason: LogoutReason) => {
      if (!enabledRef.current) return;
      if (!auth.currentUser) return;
      if (isLoggingOutRef.current) return;

      isLoggingOutRef.current = true;
      try {
        await signOut(auth);
        options.onLogout?.(reason);
      } catch (e) {
        // If signOut fails, we still want timers cleared and future attempts possible.
        console.warn('Auto-logout: signOut failed', e);
      } finally {
        isLoggingOutRef.current = false;
      }
    },
    [options]
  );

  const scheduleInactivityTimeout = useCallback(() => {
    clearInactivityTimeout();

    if (!enabledRef.current) return;
    if (!auth.currentUser) return;
    if (appStateRef.current !== 'active') return;

    inactivityTimeoutRef.current = setTimeout(() => {
      void doLogout('inactivity');
    }, inactivityMs);
  }, [clearInactivityTimeout, doLogout, inactivityMs]);

  const registerActivity = useCallback(() => {
    scheduleInactivityTimeout();
  }, [scheduleInactivityTimeout]);

  useEffect(() => {
    // When enabled toggles on, start the timer. When toggles off, clear timers.
    if (!options.enabled) {
      clearInactivityTimeout();
      backgroundAtRef.current = null;
      return;
    }

    registerActivity();
    return () => {
      clearInactivityTimeout();
    };
  }, [options.enabled, clearInactivityTimeout, registerActivity]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      const prev = appStateRef.current;
      appStateRef.current = nextState;

      if (nextState === 'active') {
        if (backgroundAtRef.current) {
          const elapsed = Date.now() - backgroundAtRef.current;
          backgroundAtRef.current = null;

          if (elapsed >= backgroundMs) {
            void doLogout('background');
            return;
          }
        }

        // Coming back to foreground and still logged in: restart inactivity timer.
        registerActivity();
        return;
      }

      // Going to background/inactive.
      if (prev === 'active' && (nextState === 'background' || nextState === 'inactive')) {
        backgroundAtRef.current = Date.now();
      }

      // While backgrounded, we don't want a stale timer.
      clearInactivityTimeout();
    });

    return () => {
      sub.remove();
    };
  }, [backgroundMs, clearInactivityTimeout, doLogout, registerActivity]);

  return useMemo(
    () => ({
      registerActivity,
      logoutNow: doLogout,
    }),
    [doLogout, registerActivity]
  );
}
