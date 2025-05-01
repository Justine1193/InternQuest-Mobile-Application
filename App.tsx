import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import LaunchScreen from './screens/LaunchScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import SettingsScreen from './screens/SettingsScreen';

export type RootStackParamList = {
  Launch: undefined;
  SignIn: undefined;
  SignUp: undefined;
  Home: undefined;
  Profile: undefined;
  Notifications: undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [launchCompleted, setLaunchCompleted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLaunchCompleted(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!launchCompleted ? (
          <Stack.Screen name="Launch" component={LaunchScreen} />
        ) : (
          <>
            {!isLoggedIn ? (
              <>
                <Stack.Screen name="SignIn">
                  {(props) => <SignInScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
                </Stack.Screen>
                <Stack.Screen name="SignUp" component={SignUpScreen} />
              </>
            ) : (
              <>
                <Stack.Screen name="Home">
                  {(props) => <HomeScreen {...props} />}
                </Stack.Screen>
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen name="Notifications" component={NotificationsScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
              </>
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
