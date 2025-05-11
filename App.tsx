import React, { useEffect, useState } from 'react';
import { StatusBar, ActivityIndicator, View, Text } from 'react-native';
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

  return (
    <Host>
      <SavedInternshipsProvider>
        <NavigationContainer>
          {/* Global StatusBar configuration */}
          <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isLoading ? (
              <Stack.Screen name="Launch" component={LaunchScreen} />
            ) : (
              <>
                {!isLoggedIn ? (
                  <>
                    <Stack.Screen name="SignIn">
                      {props => <SignInScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
                    </Stack.Screen>
                    <Stack.Screen name="SignUp" component={SignUpScreen} />
                  </>
                ) : isProfileComplete === false ? (
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
                ) : (
                  <>
                    <Stack.Screen name="Home" component={HomeScreen} />
                    <Stack.Screen name="Profile" component={ProfileScreen} />
                    <Stack.Screen name="Notifications" component={NotificationsScreen} />
                    <Stack.Screen name="Settings" component={SettingsScreen} />
                    <Stack.Screen name="InternshipDetails" component={InternshipDetailsScreen} />
                    <Stack.Screen name="OJTTracker" component={OJTTrackerScreen} />
                  </>
                )}
                {/* Always include SetupAccount for navigation safety, but only show when needed */}
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </SavedInternshipsProvider>
    </Host>
  );
};

export default App;
