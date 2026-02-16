import { useCallback, useEffect, useMemo, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

type LockReason = 'inactivity' | 'background';

type UseAutoLockOptions = {
  enabled: boolean;
  /** Lock after no user interaction for this long while the app is active */
  inactivityMs?: number;
  /** Lock if the app stayed in background/inactive for this long */
  backgroundMs?: number;
  onLock?: (reason: LockReason) => void;
};

const DEFAULT_INACTIVITY_MS = 20 * 1000; // 20 seconds
const DEFAULT_BACKGROUND_MS = 10 * 1000; // 10 seconds

export function useAutoLock(options: UseAutoLockOptions) {
  const inactivityMs = options.inactivityMs ?? DEFAULT_INACTIVITY_MS;
  const backgroundMs = options.backgroundMs ?? DEFAULT_BACKGROUND_MS;

  const enabledRef = useRef(options.enabled);
  enabledRef.current = options.enabled;

  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const inactivityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backgroundAtRef = useRef<number | null>(null);
  const isLockingRef = useRef(false);

  const clearInactivityTimeout = useCallback(() => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
      inactivityTimeoutRef.current = null;
    }
  }, []);

  const doLock = useCallback(
    (reason: LockReason) => {
      if (!enabledRef.current) return;
      if (isLockingRef.current) return;

      isLockingRef.current = true;
      try {
        options.onLock?.(reason);
      } finally {
        // Once the app locks, the parent typically disables this hook quickly.
        // Keep a small debounce to avoid double-firing in the meantime.
        setTimeout(() => {
          isLockingRef.current = false;
        }, 250);
      }
    },
    [options]
  );

  const scheduleInactivityTimeout = useCallback(() => {
    clearInactivityTimeout();

    if (!enabledRef.current) return;
    if (appStateRef.current !== 'active') return;

    inactivityTimeoutRef.current = setTimeout(() => {
      doLock('inactivity');
    }, inactivityMs);
  }, [clearInactivityTimeout, doLock, inactivityMs]);

  const registerActivity = useCallback(() => {
    scheduleInactivityTimeout();
  }, [scheduleInactivityTimeout]);

  useEffect(() => {
    if (!options.enabled) {
      clearInactivityTimeout();
      backgroundAtRef.current = null;
      isLockingRef.current = false;
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
            doLock('background');
            return;
          }
        }

        // Back in foreground and still enabled: restart inactivity timer.
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
  }, [backgroundMs, clearInactivityTimeout, doLock, registerActivity]);

  return useMemo(
    () => ({
      registerActivity,
      lockNow: doLock,
    }),
    [doLock, registerActivity]
  );
}
