import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { auth, firestore, SEND_PUSH_SELF_FUNCTION_BASE_URL } from '../firebase/config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

let hasInitialized = false;

export async function initNotifications() {
  if (hasInitialized) return;
  hasInitialized = true;

  // Ensure notifications can display while app is foregrounded.
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366F1',
    });
  }
}

function getExpoProjectId(): string | undefined {
  // Prefer EAS project ID if available.
  const fromEas = (Constants as any)?.easConfig?.projectId;
  if (typeof fromEas === 'string' && fromEas) return fromEas;

  // Fallback to expo config extra.eas.projectId (from app.json).
  const fromExtra = (Constants as any)?.expoConfig?.extra?.eas?.projectId;
  if (typeof fromExtra === 'string' && fromExtra) return fromExtra;

  // Last resort (older builds): manifest2
  const fromManifest = (Constants as any)?.manifest2?.extra?.eas?.projectId;
  if (typeof fromManifest === 'string' && fromManifest) return fromManifest;

  return undefined;
}

export async function registerForExpoPushToken(): Promise<string | null> {
  await initNotifications();

  if (!Device.isDevice) {
    // Push tokens require a physical device.
    return null;
  }

  const ok = await requestNotificationPermission();
  if (!ok) return null;

  const projectId = getExpoProjectId();
  if (!projectId) {
    console.warn('Push notifications: missing EAS projectId (extra.eas.projectId).');
    return null;
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  return token.data || null;
}

export async function syncExpoPushTokenForCurrentUser(): Promise<{ ok: true } | { ok: false; reason: string }> {
  const user = auth.currentUser;
  if (!user) return { ok: false, reason: 'not_authenticated' };

  const token = await registerForExpoPushToken();
  if (!token) return { ok: false, reason: 'token_unavailable' };

  try {
    await setDoc(
      doc(firestore, 'users', user.uid),
      {
        expoPushToken: token,
        expoPushTokenPlatform: Platform.OS,
        expoPushTokenUpdatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return { ok: true };
  } catch (e) {
    console.warn('Failed to save expo push token:', e);
    return { ok: false, reason: 'firestore_write_failed' };
  }
}

export async function clearExpoPushTokenForCurrentUser(): Promise<{ ok: true } | { ok: false; reason: string }> {
  const user = auth.currentUser;
  if (!user) return { ok: false, reason: 'not_authenticated' };

  try {
    const userRef = doc(firestore, 'users', user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return { ok: true };

    // Avoid deleteField dependency; just null it out.
    await setDoc(
      userRef,
      {
        expoPushToken: null,
        expoPushTokenUpdatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return { ok: true };
  } catch (e) {
    console.warn('Failed to clear expo push token:', e);
    return { ok: false, reason: 'firestore_write_failed' };
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  await initNotifications();

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function sendLocalTestNotification() {
  const ok = await requestNotificationPermission();
  if (!ok) return { ok: false as const, reason: 'permission_denied' as const };

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'InternQuest',
      body: 'This is a test notification from InternQuest.',
      sound: true,
    },
    trigger: null, // fire immediately
  });

  return { ok: true as const };
}

export async function sendRemoteTestPushToSelf(): Promise<{ ok: true } | { ok: false; reason: string }> {
  const user = auth.currentUser;
  if (!user) return { ok: false, reason: 'not_authenticated' };
  if (!SEND_PUSH_SELF_FUNCTION_BASE_URL) return { ok: false, reason: 'missing_function_url' };

  // Ensure a token exists (best-effort)
  const syncRes = await syncExpoPushTokenForCurrentUser();
  if (!syncRes.ok) return { ok: false, reason: syncRes.reason };

  try {
    const idToken = await user.getIdToken();
    const resp = await fetch(SEND_PUSH_SELF_FUNCTION_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        title: 'InternQuest',
        body: 'Remote push test (from Cloud Function).',
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.warn('sendRemoteTestPushToSelf failed:', resp.status, text);
      return { ok: false, reason: `http_${resp.status}` };
    }

    return { ok: true };
  } catch (e) {
    console.warn('sendRemoteTestPushToSelf error:', e);
    return { ok: false, reason: 'network_error' };
  }
}
