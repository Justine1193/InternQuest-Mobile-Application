import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Navbar = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.navbar}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.logoContainer}>
        <Image 
          source={require('../assets/logo-black.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />
      </TouchableOpacity>

      <View style={styles.navbarActions}>
        <TouchableOpacity 
          style={[styles.navbarBtn, styles.signupBtn]} 
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={styles.signupText}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navbarBtn, styles.loginBtn]} 
          onPress={() => navigation.navigate('Signin')}
        >
          <Text style={styles.loginText}>Log In</Text>
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
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    elevation: 4,
  },
  logoContainer: {
    height: '100%',
    justifyContent: 'center',
  },
  logo: {
    height: 75,
    width: 150,
  },
  navbarActions: {
    flexDirection: 'row',
    gap: 12,
  },
  navbarBtn: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  signupBtn: {
    borderWidth: 2,
    borderColor: '#4f70cb',
    backgroundColor: 'transparent',
  },
  loginBtn: {
    backgroundColor: '#4f70cb',
  },
  signupText: {
    color: '#4f70cb',
    fontSize: 16,
  },
  loginText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Navbar;
