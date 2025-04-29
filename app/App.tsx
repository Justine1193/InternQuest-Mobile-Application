import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen'; // Your Home screen component
import SignupScreen from '../screens/SignUpScreen'; // Your Sign Up screen component
import SigninScreen from '../screens/SignInScreen'; // Your Sign In screen component
import Navbar from '../components/Navbar'; // Your Navbar component

// Define navigation param list
type RootStackParamList = {
  Home: undefined;
  Signup: undefined;
  Signin: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Navbar /> {/* Place Navbar to make it appear on all screens */}
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Signin" component={SigninScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
