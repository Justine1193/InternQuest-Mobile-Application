import React, { useEffect, useState } from 'react';
import { StatusBar, ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Host } from 'react-native-portalize';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from './firebase/config';

// Context
import { SavedInternshipsProvider } from './context/SavedInternshipsContext';

// Screens
import LaunchScreen from './screens/LaunchScreen';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import { SetupAccountScreen } from './screens/SetupAccountScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import SettingsScreen from './screens/SettingsScreen';
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
  SignUp: undefined;
  SetupAccount: undefined;
  InternshipDetails: { post: Post };
  CompanyProfile: { company: Post };
  RequirementsChecklist: undefined;
  OJTTracker: { post?: Post };
  WeeklyReport: undefined;
  Notifications: undefined;
  HelpDesk: undefined;
  Settings: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
  const [currentScreen, setCurrentScreen] = useState<string>('Home');
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Auto-login detected!
        console.log('✅ Auto-login successful!');
        console.log('📧 User email:', user.email);
        console.log('🆔 User ID:', user.uid);
        setCurrentUserEmail(user.email || null);
        setIsLoggedIn(true);

        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(firestore, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setIsProfileComplete(!!data.isProfileComplete);
            console.log('📋 Profile complete:', !!data.isProfileComplete);
          } else {
            setIsProfileComplete(false);
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
        }
      } else {
        // No user found - need to sign in
        console.log('🔓 No saved session found - showing sign in screen');
        setCurrentUserEmail(null);
        setIsLoggedIn(false);
        setIsProfileComplete(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Helper to handle screen changes
  const handleScreenChange = (screenName: string) => {
    setCurrentScreen(screenName);
  };

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
            {props => <SignInScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
          </Stack.Screen>
          <Stack.Screen name="SignUp" component={SignUpScreen} />
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
                // Update Firestore and local state
                if (auth.currentUser) {
                  const userDoc = await getDoc(doc(firestore, 'users', auth.currentUser.uid));
                  if (userDoc.exists()) {
                    setIsProfileComplete(true);
                  }
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
          listeners={{ focus: () => handleScreenChange('Home') }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          listeners={{ focus: () => handleScreenChange('Profile') }}
        />
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          listeners={{ focus: () => handleScreenChange('Notifications') }}
        />
        <Stack.Screen
          name="HelpDesk"
          // lazy-load the screen when accessed
          component={require('./screens/HelpDeskScreen').default}
          listeners={{ focus: () => handleScreenChange('HelpDesk') }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          listeners={{ focus: () => handleScreenChange('Settings') }}
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
    <Host>
      <SavedInternshipsProvider>
        <NavigationContainer>
          {/* Global StatusBar configuration */}
          <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
          <View style={{ flex: 1 }}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {renderMainContent()}
            </Stack.Navigator>

            {/* Only show bottom navbar when logged in and profile is complete */}
            {isLoggedIn && isProfileComplete && (
              <View style={styles.bottomNavWrapper}>
                <BottomNavbar currentRoute={currentScreen} />
              </View>
            )}
          </View>
        </NavigationContainer>
      </SavedInternshipsProvider>
    </Host>
  );
};

const styles = StyleSheet.create({
  bottomNavWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    zIndex: 100,
  },
});

export default App;
