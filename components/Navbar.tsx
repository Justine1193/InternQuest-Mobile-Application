import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define navigation prop types
type RootStackParamList = {
  Home: undefined;
  Signup: undefined;
  Signin: undefined;
};

const Navbar: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width } = Dimensions.get('window');

  const isMobile = width <= 768;

  return (
    <View style={styles.navbar}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.logoContainer}>
      <Image source={require('../../assets/logo-black.png')} style={styles.logo} />
      </TouchableOpacity>

      <View style={[styles.navbarActions, isMobile && styles.mobileNavbarActions]}>
        <TouchableOpacity 
          style={[styles.navbarBtn, styles.signupBtn]} 
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={styles.navbarBtnText}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navbarBtn, styles.loginBtn]} 
          onPress={() => navigation.navigate('Signin')}
        >
          <Text style={styles.navbarBtnText}>Log In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    width: '100%',
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logoContainer: {
    height: '100%',
    justifyContent: 'center',
  },
  logo: {
    height: 60,
    width: 120,
    resizeMode: 'contain',
  },
  navbarActions: {
    flexDirection: 'row',
    gap: 8,
  },
  mobileNavbarActions: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  navbarBtn: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    fontSize: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    height: 40,
  },
  navbarBtnText: {
    fontSize: 16,
    textAlign: 'center',
  },
  signupBtn: {
    borderColor: '#4f70cb',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  loginBtn: {
    backgroundColor: '#4f70cb',
    borderWidth: 0,
  },
});

export default Navbar;
