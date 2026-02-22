import React, { useCallback, useEffect, useState, useRef } from 'react';
import { StatusBar, ActivityIndicator, View, StyleSheet, Easing } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { Host } from 'react-native-portalize';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase/config';
import { doc, getDoc, getDocs, query, collection, where, setDoc, serverTimestamp, deleteDoc, onSnapshot } from 'firebase/firestore';
import { firestore } from './firebase/config';
import { useAutoLogout } from './hooks/useAutoLogout';
import { useAutoLock } from './hooks/useAutoLock';
import { colors, navigationTheme, paperTheme } from './ui/theme';
import { initNotifications, syncExpoPushTokenForCurrentUser } from './services/notifications';

// Context
import { SavedInternshipsProvider } from './context/SavedInternshipsContext';
import { NotificationCountProvider, useNotificationCount } from './context/NotificationCountContext';
import { BiometricProvider, useBiometric } from './context/BiometricContext';
import { getBiometricUnlockEnabled } from './services/biometric';

// Screens
import LoginScreen from './screens/LoginScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import { SetupAccountScreen } from './screens/SetupAccountScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import SettingsScreen from './screens/SettingsScreen';
import ForceChangePasswordScreen from './screens/ForceChangePasswordScreen';
import InternshipDetailsScreen from './screens/InternshipDetailsScreen';
import OJTTrackerScreen from './screens/OJTTrackerScreen';
import WeeklyReportScreen from './screens/WeeklyReportScreen';
import CompanyProfileScreen from './screens/CompanyProfileScreen';
import RequirementsChecklistScreen from './screens/RequirementsChecklistScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import BottomNavbar from './components/BottomNav';

// Shared Post Type
export type Post = {
  latitude: number;
  longitude: number;
  id: string;
  company: string;
  description: string;
  category: string;
  location: string;
  industry: string;
  tags: string[];
  endorsedByCollege?: string;
  website?: string;
  email?: string;
  contactPersonName?: string;
  contactPersonPhone?: string;
  skills?: string[];
  modeOfWork?: string;
  moa?: string;
  createdAt?: Date;
};

// Stack Param List
export type RootStackParamList = {
  Home: undefined;
  SignIn: undefined;
  ForgotPassword: { email?: string } | undefined;
  SetupAccount: undefined;
  ForceChangePassword: undefined;
  PrivacyPolicy: { onContinue?: () => void; continueLabel?: string; requireAcknowledgement?: boolean } | undefined;
  InternshipDetails: { post: Post };
  CompanyProfile: { companyId: string };
  RequirementsChecklist: undefined;
  OJTTracker: { post?: Post };
  WeeklyReport: undefined;
  Notifications: undefined;
  ResourceManagement: undefined;
  Settings: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const profileCompleteKeyForUser = (uid: string) => `@InternQuest_profileComplete_${uid}`;
const passwordChangedKeyForUser = (uid: string) => `@InternQuest_passwordChanged_${uid}`;

const AppInner: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
  const [mustChangePassword, setMustChangePassword] = useState<boolean | null>(null);
  const [currentScreen, setCurrentScreen] = useState<string>('SignIn');
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [awaitingBiometric, setAwaitingBiometric] = useState(false);
  const [authBlockMessage, setAuthBlockMessage] = useState<string | null>(null);
  const { notificationCount, setNotificationCount } = useNotificationCount();
  const { biometricEnabled } = useBiometric();
  const blockedListenerUnsubRef = useRef<null | (() => void)>(null);

  const handleBlockedAccount = useCallback(async (data: any) => {
    const accountAccess = (data && typeof data.accountAccess === 'object' && data.accountAccess) ? data.accountAccess : null;
    const reason =
      (accountAccess && typeof accountAccess.blockedReason === 'string' && accountAccess.blockedReason.trim()) ? accountAccess.blockedReason.trim() :
      (typeof data?.blockedReason === 'string' && data.blockedReason.trim()) ? data.blockedReason.trim() :
      (typeof data?.blockReason === 'string' && data.blockReason.trim()) ? data.blockReason.trim() :
      '';
    const blockedBy =
      (accountAccess && typeof accountAccess.blockedBy === 'string' && accountAccess.blockedBy.trim()) ? accountAccess.blockedBy.trim() :
      (typeof data?.blockedBy === 'string' && data.blockedBy.trim()) ? data.blockedBy.trim() :
      '';
    const who = blockedBy ? ` by ${blockedBy}` : '';
    const suffix = reason ? `\n\nReason: ${reason}` : '';

    setAuthBlockMessage(`Your account has been blocked${who}. Please contact your adviser/coordinator.${suffix}`);

    // Best-effort sign-out and reset app state.
    try { await signOut(auth); } catch (e) { /* best-effort */ }
    setIsLoggedIn(false);
    setAwaitingBiometric(false);
    setIsProfileComplete(null);
    setMustChangePassword(null);
    setIsLoading(false);
  }, []);
  const navigationRef = React.useRef<any>(null);

  // Fetch notification count when user is logged in (for badge on bell).
  // Exclude hidden (deleted) notifications so the badge matches what the user sees.
  useEffect(() => {
    if (!auth.currentUser) {
      setNotificationCount(0);
      return;
    }
    let cancelled = false;
    const uid = auth.currentUser.uid;
    const notificationsRef = collection(firestore, 'notifications');
    const hiddenRef = collection(firestore, `users/${uid}/hiddenNotifications`);
    Promise.all([
      getDocs(query(notificationsRef, where('userId', '==', uid))),
      getDocs(query(notificationsRef, where('targetStudentId', '==', uid))),
      getDocs(query(notificationsRef, where('targetType', '==', 'all'))),
      getDocs(hiddenRef),
    ])
      .then(([snap1, snap2, snap3, hiddenSnap]) => {
        if (cancelled) return;
        const ids = new Set<string>();
        [snap1, snap2, snap3].forEach((snap: any) => snap.docs.forEach((d: any) => ids.add(d.id)));
        const hiddenIds = new Set((hiddenSnap as any).docs.map((d: any) => d.id));
        const visibleCount = [...ids].filter((id) => !hiddenIds.has(id)).length;
        setNotificationCount(visibleCount);
      })
      .catch(() => {
        if (!cancelled) setNotificationCount(0);
      });
    return () => { cancelled = true; };
  }, [auth.currentUser?.uid, setNotificationCount]);

  const { registerActivity: registerLogoutActivity } = useAutoLogout({
    enabled: isLoggedIn,
    inactivityMs: 30 * 60 * 1000,
    backgroundMs: 5 * 60 * 1000,
  });

  // Auto-lock to the biometric gate (Login screen) after short inactivity/background.
  // This keeps the Firebase session, but requires biometric to continue.
  const { registerActivity: registerLockActivity } = useAutoLock({
    enabled: isLoggedIn && biometricEnabled,
    inactivityMs: 20 * 1000,
    backgroundMs: 10 * 1000,
    onLock: () => {
      setAwaitingBiometric(true);
      setIsLoggedIn(false);
    },
  });

  useEffect(() => {
    // Best-effort initialization for device notifications (local + foreground display).
    void initNotifications();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Ensure any prior blocked listener is cleaned up before creating a new one.
        if (blockedListenerUnsubRef.current) {
          try { blockedListenerUnsubRef.current(); } catch (e) { /* ignore */ }
          blockedListenerUnsubRef.current = null;
        }

        // Auto-login detected! We may still require biometric before showing the app.
        console.log('✅ Auto-login successful!');
        console.log('📧 User email:', user.email);
        console.log('🆔 User ID:', user.uid);
        setCurrentUserEmail(user.email || null);
        // Do NOT set isLoggedIn(true) yet – wait until after biometric check below.

        // Best-effort: register this device for push notifications and store token.
        // (If permission is denied / emulator / missing projectId, it just no-ops.)
        void syncExpoPushTokenForCurrentUser();

        // Fetch user profile from Firestore
        try {
          const userRef = doc(firestore, 'users', user.uid);

          // Live block sync: if admin blocks this account while the user is in-app,
          // immediately sign them out and show the reason.
          blockedListenerUnsubRef.current = onSnapshot(
            userRef,
            async (snap) => {
              if (!snap.exists()) return;
              const data: any = snap.data();
              const accountAccess = (data && typeof data.accountAccess === 'object' && data.accountAccess) ? data.accountAccess : null;
              const isBlocked =
                (accountAccess && accountAccess.isBlocked === true) ||
                data?.isBlocked === true ||
                data?.is_blocked === true ||
                data?.blocked === true ||
                String(data?.accountStatus || '').toLowerCase() === 'blocked' ||
                String(data?.status || '').toLowerCase() === 'blocked';

              if (isBlocked) {
                // Prevent multiple triggers.
                if (blockedListenerUnsubRef.current) {
                  try { blockedListenerUnsubRef.current(); } catch (e) { /* ignore */ }
                  blockedListenerUnsubRef.current = null;
                }
                await handleBlockedAccount(data);
              }
            }
          );

          const userDoc = await getDoc(userRef);

          // If an admin created a legacy Firestore user doc under a non-UID document id,
          // migrate it on login (not only during SetupAccountScreen) to prevent duplicates.
          // This specifically covers the common pattern where the legacy doc stores a field like { uid: <authUid> }.
          try {
            const potentialLegacyDocs: any[] = [];

            // 1) Match by email (most common)
            if (user.email) {
              const byEmail = await getDocs(query(collection(firestore, 'users'), where('email', '==', user.email)));
              potentialLegacyDocs.push(...byEmail.docs);
            }

            // 2) Match legacy docs that have a uid field pointing to auth.uid
            // (this is exactly what your screenshot shows)
            const byUidField = await getDocs(query(collection(firestore, 'users'), where('uid', '==', user.uid)));
            potentialLegacyDocs.push(...byUidField.docs);

            // Deduplicate by doc id, and ignore the correct UID doc
            const seen = new Set<string>();
            const legacyDocs = potentialLegacyDocs
              .filter((d: any) => d && d.id && d.id !== user.uid)
              .filter((d: any) => {
                if (seen.has(d.id)) return false;
                seen.add(d.id);
                return true;
              });

            if (legacyDocs.length > 0) {
              const uidData: any = userDoc.exists() ? userDoc.data() : {};

              for (const legacy of legacyDocs) {
                const legacyData: any = legacy.data();
                if (legacyData?.archived === true) continue;

                // UID doc wins on conflicts; legacy doc fills missing fields.
                const merged = {
                  ...legacyData,
                  ...uidData,
                  migratedFromUserDocId: legacy.id,
                  migratedToAuthUidAt: serverTimestamp(),
                };

                await setDoc(doc(firestore, 'users', user.uid), merged, { merge: true });

                // Mark legacy as archived (best-effort), then delete it (best-effort).
                try {
                  await setDoc(doc(firestore, 'users', legacy.id), {
                    archived: true,
                    archivedReason: 'migrated_to_uid_doc',
                    migratedToUserId: user.uid,
                    migratedAt: serverTimestamp(),
                  }, { merge: true });
                } catch (e) {
                  // best-effort
                }

                try {
                  await deleteDoc(doc(firestore, 'users', legacy.id));
                  console.log('🧹 Deleted legacy user doc:', legacy.id);
                } catch (e) {
                  console.warn('Legacy user doc migration: delete failed (left archived):', e);
                }
              }
            }
          } catch (e) {
            console.warn('Legacy user doc migration skipped/failed:', e);
          }

          // IMPORTANT: migration may have created/updated the UID doc.
          // Re-fetch so we don't rely on a stale snapshot.
          const userDocAfter = await getDoc(userRef);
          if (userDocAfter.exists()) {
            const data: any = userDocAfter.data();

            // Account access block (adviser/coordinator/admin)
            const accountAccess = (data && typeof data.accountAccess === 'object' && data.accountAccess) ? data.accountAccess : null;
            const isBlocked =
              (accountAccess && accountAccess.isBlocked === true) ||
              data?.isBlocked === true ||
              data?.is_blocked === true ||
              data?.blocked === true ||
              String(data?.accountStatus || '').toLowerCase() === 'blocked' ||
              String(data?.status || '').toLowerCase() === 'blocked';

            if (isBlocked) {
              await handleBlockedAccount(data);
              return;
            }

            // We now know this signed-in user is not blocked; clear any old banner.
            setAuthBlockMessage(null);

            // One-time password change gate (set after SetupAccountScreen)
            // Self-heal legacy / already-changed accounts:
            // - If mustChangePassword is true but we see a passwordChangedAt timestamp
            //   or passwordStatus.mustChangePassword === false, clear the flag.
            let effectiveMustChangePassword = !!data?.mustChangePassword;
            const passwordStatus = data?.passwordStatus;
            const passwordChangedAt = data?.passwordChangedAt;

            // Also self-heal from local cache in case the Firestore write failed after a successful password change.
            if (effectiveMustChangePassword) {
              try {
                const cachedPasswordChanged = await AsyncStorage.getItem(passwordChangedKeyForUser(user.uid));
                if (cachedPasswordChanged === 'true') {
                  effectiveMustChangePassword = false;
                }
              } catch (e) {
                // best-effort
              }
            }

            if (
              effectiveMustChangePassword &&
              (
                (passwordStatus && passwordStatus.mustChangePassword === false) ||
                !!passwordChangedAt
              )
            ) {
              effectiveMustChangePassword = false;
              try {
                await setDoc(
                  userRef,
                  {
                    mustChangePassword: false,
                    passwordStatus: {
                      ...(passwordStatus || {}),
                      mustChangePassword: false,
                    },
                  },
                  { merge: true }
                );
              } catch (e) {
                // best-effort; don't block login if this fails
                console.warn('App: failed to self-heal mustChangePassword flag', e);
              }
            }

            setMustChangePassword(effectiveMustChangePassword);

            // Cache password-changed on device (per-user) so we can avoid re-gating
            // if Firestore flags are missing or a temporary fetch issue occurs.
            if (!effectiveMustChangePassword) {
              try {
                void AsyncStorage.setItem(passwordChangedKeyForUser(user.uid), 'true');
              } catch (e) {
                // best-effort
              }
            }

            const profileStatus = data?.profileStatus;
            const flagComplete =
              !!data?.isProfileComplete ||
              !!profileStatus?.isComplete ||
              !!profileStatus?.setupCompletedAt;

            // Legacy / flexible completeness detection (older docs may use different keys or shapes)
            const hasName = !!(data?.firstName || data?.lastName || data?.name || data?.fullName || data?.displayName);
            const programValue = (data?.program || data?.course || data?.courseOrProgram || data?.programName);
            const hasProgram = !!programValue;

            const rawField = (data?.field ?? data?.fields ?? data?.preferredField ?? data?.interestField);
            const hasField = Array.isArray(rawField) ? rawField.length > 0 : !!rawField;

            const rawSkills = (data?.skills ?? data?.skill ?? data?.skillSet ?? data?.skillsCsv ?? data?.userSkills);
            const hasSkills =
              Array.isArray(rawSkills) ? rawSkills.length > 0 :
              (typeof rawSkills === 'string') ? rawSkills.trim().length > 0 :
              false;

            const hasBasics = hasName && hasProgram && hasField && hasSkills;

            const computedComplete = flagComplete || hasBasics;
            setIsProfileComplete(computedComplete);
            console.log('📋 Profile complete:', computedComplete);

            // Cache profile completion on device (per-user) as a fallback.
            if (computedComplete) {
              try {
                void AsyncStorage.setItem(profileCompleteKeyForUser(user.uid), 'true');
              } catch (e) {
                // best-effort
              }
            }

            // Self-heal: if the profile looks complete but the legacy flag is missing, set it.
            if (computedComplete && !data?.isProfileComplete) {
              try {
                await setDoc(userRef, { isProfileComplete: true }, { merge: true });
              } catch (e) {
                // best-effort
              }
            }
          } else {
            setIsProfileComplete(false);
            setMustChangePassword(false);
            console.log('📋 Profile not found in Firestore');

            // If there is no profile doc, it's not a block scenario.
            setAuthBlockMessage(null);
          }
        } catch (e: any) {
          console.error('❌ Error fetching profile:', e);
          // Extra diagnostics for permission issues
          if (e?.code === 'permission-denied') {
            console.warn('🔍 Permission denied when reading user profile. This usually means the client request did not pass authentication, or Firestore rules disallow this read.');
            try {
              // Try to dump some helpful info to the console (do not log tokens in production)
              console.log('Debug auth.currentUser:', auth.currentUser);
              if (user?.getIdToken) {
                const idToken = await user.getIdToken();
                console.log('Debug: user.getIdToken() retrieved a token (length):', idToken ? idToken.length : 0);
              }
            } catch (debugErr) {
              console.log('Failed to fetch debug token / info:', debugErr);
            }
          }
          // Fallback to local cache so finished accounts aren't forced to redo setup/password
          // when Firestore is temporarily unavailable (offline, transient errors, etc.).
          try {
            const [cachedProfile, cachedPasswordChanged] = await Promise.all([
              AsyncStorage.getItem(profileCompleteKeyForUser(user.uid)),
              AsyncStorage.getItem(passwordChangedKeyForUser(user.uid)),
            ]);

            // If we *know* the profile is complete, keep it complete. Otherwise leave unknown
            // so we don't incorrectly force SetupAccount due to transient errors.
            setIsProfileComplete(cachedProfile === 'true' ? true : null);

            // Only disable the password gate when we *know* it's already been changed.
            // Otherwise leave unknown (null) to avoid re-forcing the flow when we can't verify.
            setMustChangePassword(cachedPasswordChanged === 'true' ? false : null);
          } catch (cacheErr) {
            setIsProfileComplete(false);
            setMustChangePassword(false);
          }
        }

        // If biometric unlock is enabled, stay on biometric gate until user passes (don't go to home yet)
        try {
          const biometricEnabledForUnlock = await getBiometricUnlockEnabled();
          if (biometricEnabledForUnlock) {
            setAwaitingBiometric(true);
            setIsLoggedIn(false);
          } else {
            setIsLoggedIn(true);
            setAwaitingBiometric(false);
          }
        } catch (e) {
          setIsLoggedIn(true);
          setAwaitingBiometric(false);
        }
      } else {
        // Clean up the live block listener on logout.
        if (blockedListenerUnsubRef.current) {
          try { blockedListenerUnsubRef.current(); } catch (e) { /* ignore */ }
          blockedListenerUnsubRef.current = null;
        }
        // No user found - need to sign in
        console.log('🔓 No saved session found - showing sign in screen');
        setCurrentUserEmail(null);
        setIsLoggedIn(false);
        setAwaitingBiometric(false);
        setIsProfileComplete(null);
        setMustChangePassword(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Helper to handle screen changes
  const handleScreenChange = (screenName: string) => {
    setCurrentScreen(screenName);
  };

  const screensWithoutNav = ['CompanyProfile', 'Profile', 'Notifications', 'WeeklyReport'];
  const showBottomNav =
    isLoggedIn &&
    isProfileComplete &&
    mustChangePassword !== true &&
    !isLoading &&
    !screensWithoutNav.includes(currentScreen);
  const bottomNavHeight = 56 + Math.max(insets.bottom, 8);

  const renderMainContent = () => {
    if (isLoading) {
      return (
        <>
          <Stack.Screen name="SignIn">
            {props => <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} initialErrorMessage={authBlockMessage} />}
          </Stack.Screen>
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      );
    }

    // If the account is blocked, always keep the user on SignIn
    // (do not route into SetupAccount even if profile state is incomplete).
    if (authBlockMessage) {
      return (
        <>
          <Stack.Screen name="SignIn">
            {props => (
              <LoginScreen
                {...props}
                setIsLoggedIn={setIsLoggedIn}
                initialErrorMessage={authBlockMessage}
                gateMode={false}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      );
    }

    if (!isLoggedIn) {
      // Biometric gate: show login screen with "Unlock with biometric" or "Use password instead"
      return (
        <>
          <Stack.Screen name="SignIn">
            {props => (
              <LoginScreen
                {...props}
                setIsLoggedIn={setIsLoggedIn}
                initialErrorMessage={authBlockMessage}
                gateMode={awaitingBiometric}
                onBiometricUnlock={() => {
                  setAwaitingBiometric(false);
                  setIsLoggedIn(true);
                }}
                onPasswordUnlock={() => setAwaitingBiometric(false)}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      );
    }

    if (isProfileComplete === false) {
      return (
            <Stack.Screen name="SetupAccount">
          {props => (
            <SetupAccountScreen
              {...props}
              onSetupComplete={async () => {
                // Update Firestore (best-effort) and local state
                setIsProfileComplete(true);
                setMustChangePassword(true);

                // Local cache so we don't re-show SetupAccount for this user.
                if (auth.currentUser) {
                  try {
                    void AsyncStorage.setItem(profileCompleteKeyForUser(auth.currentUser.uid), 'true');
                    void AsyncStorage.removeItem(passwordChangedKeyForUser(auth.currentUser.uid));
                  } catch (e) {
                    // best-effort
                  }
                }

                if (auth.currentUser) {
                  try {
                    await setDoc(
                      doc(firestore, 'users', auth.currentUser.uid),
                      { isProfileComplete: true, mustChangePassword: true },
                      { merge: true }
                    );
                  } catch (e) {
                    // best-effort
                  }
                }
              }}
            />
          )}
        </Stack.Screen>
      );
    }

    if (mustChangePassword === true) {
      return (
        <Stack.Screen name="ForceChangePassword" options={{ gestureEnabled: false }}>
          {props => (
            <ForceChangePasswordScreen
              {...props}
              onPasswordChangeComplete={(nextScreen?: string) => {
                setMustChangePassword(false);

                if (nextScreen === 'PrivacyPolicy') {
                  // Wait a tick for the navigator to re-register main screens.
                  setTimeout(() => {
                    try {
                      navigationRef.current?.navigate?.(nextScreen as any, { requireAcknowledgement: true });
                    } catch (e) {
                      // best-effort
                    }
                  }, 0);
                }
              }}
            />
          )}
        </Stack.Screen>
      );
    }

    // Main app screens
    return (
      <>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
        />
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
        />
        <Stack.Screen
          name="ResourceManagement"
          component={require('./screens/ResourceManagementScreen').default}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        <Stack.Screen
          name="InternshipDetails"
          component={InternshipDetailsScreen}
        />
        <Stack.Screen
          name="OJTTracker"
          component={OJTTrackerScreen}
        />
        <Stack.Screen
          name="CompanyProfile"
          component={CompanyProfileScreen}
        />
        <Stack.Screen
          name="RequirementsChecklist"
          component={RequirementsChecklistScreen}
        />
        <Stack.Screen
          name="WeeklyReport"
          component={WeeklyReportScreen}
        />
      </>
    );
  };

  return (
    <PaperProvider theme={paperTheme}>
      <Host>
        <SavedInternshipsProvider>
          <NavigationContainer
            ref={navigationRef}
            theme={navigationTheme}
            onStateChange={() => {
              try {
                const route = navigationRef.current?.getCurrentRoute?.();
                if (route?.name) handleScreenChange(route.name);
              } catch (e) {
                // ignore
              }
            }}
          >
          {/* Global StatusBar configuration (route-aware to avoid flicker on Android) */}
          {(() => {
            const routeName =
              (navigationRef.current?.getCurrentRoute?.()?.name as string | undefined) || currentScreen;

            const BRAND_BLUE = '#2B7FFF';
            const blueScreens = new Set<string>(['SignIn', 'ForgotPassword', 'SetupAccount']);
            const isBlue = blueScreens.has(routeName);

            return (
              <StatusBar
                translucent
                backgroundColor={isBlue ? BRAND_BLUE : colors.bg}
                barStyle={isBlue ? 'light-content' : 'dark-content'}
              />
            );
          })()}
          <View
            style={{ flex: 1, paddingBottom: showBottomNav ? bottomNavHeight : 0, backgroundColor: colors.bg }}
            onStartShouldSetResponderCapture={() => {
              registerLogoutActivity();
              registerLockActivity();
              return false;
            }}
          >
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: colors.bg },
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                transitionSpec: {
                  open: {
                    animation: 'timing',
                    config: {
                      duration: 320,
                      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                    },
                  },
                  close: {
                    animation: 'timing',
                    config: {
                      duration: 280,
                      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                    },
                  },
                },
                // Disable horizontal swipe gestures (no sliding between screens)
                gestureEnabled: false,
              }}
            >
              {renderMainContent()}
            </Stack.Navigator>

            {/* Only show bottom navbar when logged in and profile is complete */}
            {showBottomNav && (
              <View style={styles.bottomNavWrapper}>
                <BottomNavbar currentRoute={currentScreen} notificationCount={notificationCount} />
              </View>
            )}
          </View>
          </NavigationContainer>
        </SavedInternshipsProvider>
      </Host>
    </PaperProvider>
  );
};

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <NotificationCountProvider>
        <BiometricProvider>
          <AppInner />
        </BiometricProvider>
      </NotificationCountProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  bottomNavWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: '#FFFFFF',
  },
});

export default App;
