import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import LaunchScreen from './screens/LaunchScreen'; // Make sure this file exists and is exported properly

export type RootStackParamList = {
  Launch: undefined;
  SignIn: undefined;
  SignUp: undefined;
  Home: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [launchCompleted, setLaunchCompleted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLaunchCompleted(true), 2000); // Simulate 2-sec splash delay
    return () => clearTimeout(timer);
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!launchCompleted ? (
          // Only shown on initial app load
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
                <Stack.Screen
                  name="Profile"
                  component={ProfileScreen}
                  options={{ headerShown: true, title: 'My Profile' }}
                />
              </>
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
