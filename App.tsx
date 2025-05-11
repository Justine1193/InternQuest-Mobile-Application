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
  website?: string; // ✅ Added
  email?: string;   // ✅ Added
  skills?: string[]; // <-- Add this line
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
  OJTTracker: { post?: Post };
  Notifications: undefined;
  Settings: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
  const [currentScreen, setCurrentScreen] = useState<string>('Home');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoggedIn(!!user);
      if (user) {
        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(firestore, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setIsProfileComplete(!!data.isProfileComplete);
          } else {
            setIsProfileComplete(false);
          }
        } catch (e) {
          setIsProfileComplete(false);
        }
      } else {
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
      return <Stack.Screen name="Launch" component={LaunchScreen} />;
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
                  await getDoc(doc(firestore, 'users', auth.currentUser.uid)).then(userDoc => {
                    if (userDoc.exists()) {
                      setIsProfileComplete(true);
                    }
                  });
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
