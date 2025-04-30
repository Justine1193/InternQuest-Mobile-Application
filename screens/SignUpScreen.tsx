import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, db } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

type NavigationProp = StackNavigationProp<RootStackParamList, 'SignUp'>;

const SignUpScreen: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation<NavigationProp>();

  const handleSignUp = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Please fill in all fields.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await set(ref(db, `users/${user.uid}`), {
        fullName,
        email,
      });

      Alert.alert('Success', 'Account created!');
      navigation.navigate('Login');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ImageBackground
      source={{
        uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/NEU_Main_Campus%2C_Central_Avenue%2C_New_Era%2C_Quezon_City.jpg/330px-NEU_Main_Campus%2C_Central_Avenue%2C_New_Era%2C_Quezon_City.jpg",
      }}
      style={styles.background}
      imageStyle={{ opacity: 0.85 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Sign Up</Text>

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              Already have an account?{' '}
              <Text style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
                Log In
              </Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    color: '#002f6c',
  },
  input: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2980b9',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  loginContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#333',
  },
  loginLink: {
    color: '#004aad',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});

export default SignUpScreen;
