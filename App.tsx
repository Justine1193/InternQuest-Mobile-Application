import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';

// Define the type for the stack params
export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Home: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    // Ensure NavigationContainer wraps the entire Stack.Navigator
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isLoggedIn ? 'Home' : 'Login'}>
        {/* Only render login and signup screens if not logged in */}
        {!isLoggedIn ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
