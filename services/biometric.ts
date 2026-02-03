import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BIOMETRIC_UNLOCK_KEY = '@InternQuest_biometricUnlockEnabled';

export type BiometricSupport = {
  supported: boolean;
  enrolled: boolean;
  types: string[];
};

/**
 * Check if the device supports biometric authentication and has credentials enrolled.
 */
export async function getBiometricSupport(): Promise<BiometricSupport> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    const typeNames = types.map((t: number) => {
      if (t === LocalAuthentication.AuthenticationType.FINGERPRINT) return 'fingerprint';
      if (t === LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION) return 'face';
      if (t === LocalAuthentication.AuthenticationType.IRIS) return 'iris';
      return 'unknown';
    });
    return {
      supported: hasHardware,
      enrolled: hasHardware && isEnrolled,
      types: typeNames,
    };
  } catch {
    return { supported: false, enrolled: false, types: [] };
  }
}

/**
 * Prompt the user for biometric authentication.
 * @param promptMessage - Message shown in the biometric dialog (e.g. "Unlock InternQuest")
 * @returns true if authentication succeeded, false if cancelled or failed
 */
export async function authenticate(promptMessage: string = 'Unlock InternQuest'): Promise<boolean> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: 'Cancel',
      fallbackLabel: 'Use passcode',
    });
    return result.success;
  } catch {
    return false;
  }
}

/**
 * Get whether biometric unlock is enabled (from AsyncStorage).
 */
export async function getBiometricUnlockEnabled(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(BIOMETRIC_UNLOCK_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

/**
 * Set whether biometric unlock is enabled (persists to AsyncStorage).
 */
export async function setBiometricUnlockEnabled(enabled: boolean): Promise<void> {
  try {
    if (enabled) {
      await AsyncStorage.setItem(BIOMETRIC_UNLOCK_KEY, 'true');
    } else {
      await AsyncStorage.removeItem(BIOMETRIC_UNLOCK_KEY);
    }
  } catch (e) {
    console.warn('Biometric: failed to persist preference', e);
  }
}
