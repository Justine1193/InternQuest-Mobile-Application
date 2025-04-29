import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import SignUpScreen from '../screens/SignUpScreen';
import SignInScreen from '../screens/SignInScreen';
import ProfileScreen from '../screens/ProfileScreen';
import Navbar from '../components/Navbar'; // Navbar component (you can include this if you want to display it globally)

const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      {/* You can add a global Navbar here if you want to display it across all screens */}
      <Navbar />
      
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        {/* Home screen */}
        <Stack.Screen name="Home" component={HomeScreen} />
        
        {/* SignUp screen */}
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        
        {/* SignIn screen */}
        <Stack.Screen name="SignIn" component={SignInScreen} />
        
        {/* Profile screen */}
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
