import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

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
};

// Stack Param List
export type RootStackParamList = {
  Launch: undefined;
  Home: undefined;
  SignIn: undefined;
  SignUp: undefined;
  SetupAccount: undefined;
  InternshipDetails: { post: Post };
  OJTTracker: { post: Post };
  Notifications: undefined;
  Settings: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000); // Simulate splash
    return () => clearTimeout(timer);
  }, []);

  return (
    <SavedInternshipsProvider>
      <NavigationContainer>
        {/* Global StatusBar configuration */}
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isLoading ? (
            <Stack.Screen name="Launch" component={LaunchScreen} />
          ) : (
            <>
              <Stack.Screen name="SignIn">
              {props => <SignInScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
              </Stack.Screen>
              <Stack.Screen name="SignUp" component={SignUpScreen} />
              <Stack.Screen name="SetupAccount">
              {props => (
                <SetupAccountScreen
                {...props}
                onSetupComplete={() => {
                  setIsLoggedIn(true);
                  props.navigation.replace('Home');
                }}
                />
              )}
              </Stack.Screen>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="Notifications" component={NotificationsScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="InternshipDetails" component={InternshipDetailsScreen} />
              <Stack.Screen name="OJTTracker" component={OJTTrackerScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SavedInternshipsProvider>
  );
};

export default App;
