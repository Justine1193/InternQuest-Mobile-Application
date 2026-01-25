import React, { useEffect, useState } from 'react';
import { StatusBar, ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Host } from 'react-native-portalize';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import { doc, getDoc, getDocs, query, collection, where, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { firestore } from './firebase/config';
import { useAutoLogout } from './hooks/useAutoLogout';
import { colors, navigationTheme, paperTheme } from './ui/theme';
import { initNotifications, syncExpoPushTokenForCurrentUser } from './services/notifications';

// Context
import { SavedInternshipsProvider } from './context/SavedInternshipsContext';

// Screens
import LaunchScreen from './screens/LaunchScreen';
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
  Launch: undefined;
  Home: undefined;
  SignIn: undefined;
  ForgotPassword: { email?: string } | undefined;
  SetupAccount: undefined;
  ForceChangePassword: undefined;
  InternshipDetails: { post: Post };
  CompanyProfile: { companyId: string };
  RequirementsChecklist: undefined;
  OJTTracker: { post?: Post };
  WeeklyReport: undefined;
  Notifications: undefined;
  HelpDesk: undefined;
  Settings: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppInner: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
  const [mustChangePassword, setMustChangePassword] = useState<boolean | null>(null);
  const [currentScreen, setCurrentScreen] = useState<string>('Launch');
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const navigationRef = React.useRef<any>(null);

  const { registerActivity } = useAutoLogout({
    enabled: isLoggedIn,
    inactivityMs: 30 * 60 * 1000,
    backgroundMs: 5 * 60 * 1000,
  });

  useEffect(() => {
    // Best-effort initialization for device notifications (local + foreground display).
    void initNotifications();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Auto-login detected!
        console.log('✅ Auto-login successful!');
        console.log('📧 User email:', user.email);
        console.log('🆔 User ID:', user.uid);
        setCurrentUserEmail(user.email || null);
        setIsLoggedIn(true);

        // Best-effort: register this device for push notifications and store token.
        // (If permission is denied / emulator / missing projectId, it just no-ops.)
        void syncExpoPushTokenForCurrentUser();

        // Fetch user profile from Firestore
        try {
          const userRef = doc(firestore, 'users', user.uid);
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

            // One-time password change gate (set after SetupAccountScreen)
            setMustChangePassword(!!data?.mustChangePassword);

            const flagComplete = !!data?.isProfileComplete || !!data?.profileStatus?.isComplete;
            const hasBasics =
              !!(data?.firstName || data?.lastName || data?.name) &&
              !!(data?.program || data?.course) &&
              !!data?.field &&
              Array.isArray(data?.skills) &&
              data.skills.length > 0;

            const computedComplete = flagComplete || hasBasics;
            setIsProfileComplete(computedComplete);
            console.log('📋 Profile complete:', computedComplete);

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
          setIsProfileComplete(false);
          setMustChangePassword(false);
        }
      } else {
        // No user found - need to sign in
        console.log('🔓 No saved session found - showing sign in screen');
        setCurrentUserEmail(null);
        setIsLoggedIn(false);
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

  const showBottomNav = isLoggedIn && isProfileComplete && mustChangePassword !== true && !isLoading;
  const bottomNavHeight = 60 + Math.max(insets.bottom, 0);

  const renderMainContent = () => {
    if (isLoading) {
      return (
        <Stack.Screen name="Launch">
          {props => <LaunchScreen {...props} userEmail={currentUserEmail} />}
        </Stack.Screen>
      );
    }

    if (!isLoggedIn) {
      return (
        <>
          <Stack.Screen name="SignIn">
            {props => <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
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
              onPasswordChangeComplete={() => setMustChangePassword(false)}
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
          name="HelpDesk"
          // lazy-load the screen when accessed
          component={require('./screens/HelpDeskScreen').default}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
        />
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
            const blueScreens = new Set<string>(['Launch', 'SignIn', 'ForgotPassword', 'SetupAccount']);
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
            style={{ flex: 1, paddingBottom: showBottomNav ? bottomNavHeight : 0 }}
            onStartShouldSetResponderCapture={() => {
              registerActivity();
              return false;
            }}
          >
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {renderMainContent()}
            </Stack.Navigator>

            {/* Only show bottom navbar when logged in and profile is complete */}
            {showBottomNav && (
              <View style={styles.bottomNavWrapper}>
                <BottomNavbar currentRoute={currentScreen} />
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
      <AppInner />
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
  },
});

export default App;
