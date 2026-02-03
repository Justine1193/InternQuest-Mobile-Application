import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import {
  getBiometricSupport,
  authenticate,
  getBiometricUnlockEnabled,
  setBiometricUnlockEnabled,
  BiometricSupport,
} from '../services/biometric';

type BiometricContextType = {
  /** Whether the device supports and has biometric enrolled */
  support: BiometricSupport | null;
  /** Whether biometric unlock is enabled (user preference) */
  biometricEnabled: boolean;
  /** Enable or disable biometric unlock. When enabling, prompts for biometric first. */
  setBiometricEnabled: (enabled: boolean) => Promise<void>;
  /** App is locked and requires biometric to unlock */
  appLocked: boolean;
  setAppLocked: (locked: boolean) => void;
  /** Run biometric auth and unlock if success */
  unlock: (promptMessage?: string) => Promise<boolean>;
  /** Refresh support (e.g. after opening Settings modal) */
  refreshSupport: () => Promise<void>;
};

const BiometricContext = createContext<BiometricContextType | undefined>(undefined);

export function BiometricProvider({ children }: { children: ReactNode }) {
  const [support, setSupport] = useState<BiometricSupport | null>(null);
  const [biometricEnabled, setBiometricEnabledState] = useState(false);
  const [appLocked, setAppLocked] = useState(false);

  const refreshSupport = useCallback(async () => {
    const s = await getBiometricSupport();
    setSupport(s);
  }, []);

  useEffect(() => {
    refreshSupport();
    getBiometricUnlockEnabled().then(setBiometricEnabledState);
  }, [refreshSupport]);

  const setBiometricEnabled = useCallback(async (enabled: boolean) => {
    if (enabled) {
      const success = await authenticate('Confirm your identity to enable biometric unlock');
      if (success) {
        await setBiometricUnlockEnabled(true);
        setBiometricEnabledState(true);
      }
      return;
    }
    await setBiometricUnlockEnabled(false);
    setBiometricEnabledState(false);
  }, []);

  const unlock = useCallback(async (promptMessage: string = 'Unlock InternQuest') => {
    const success = await authenticate(promptMessage);
    if (success) setAppLocked(false);
    return success;
  }, []);

  const value: BiometricContextType = {
    support,
    biometricEnabled,
    setBiometricEnabled,
    appLocked,
    setAppLocked,
    unlock,
    refreshSupport,
  };

  return (
    <BiometricContext.Provider value={value}>
      {children}
    </BiometricContext.Provider>
  );
}

export function useBiometric() {
  const context = useContext(BiometricContext);
  if (!context) {
    throw new Error('useBiometric must be used within a BiometricProvider');
  }
  return context;
}
