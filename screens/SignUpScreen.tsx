import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { auth, firestore } from "../firebase/config";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../App";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

// Types
type NavigationProp = StackNavigationProp<RootStackParamList, "SignUp">;

// Constants
const PHONE_REGEX = /^09\d{9}$/;
const PASSWORD_MIN_LENGTH = 6;

const SignUpScreen: React.FC = () => {
  // --- State ---
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    contact?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const navigation = useNavigation<NavigationProp>();

  // --- Validation functions ---
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = "Email is required";
    else if (!validateEmail(email)) newErrors.email = "Please enter a valid email";
    if (!contact) newErrors.contact = "Contact number is required";
    else if (!PHONE_REGEX.test(contact)) newErrors.contact = "Please enter a valid 11-digit phone number starting with 09";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < PASSWORD_MIN_LENGTH) newErrors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Handlers ---
  const handleSignUp = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Save user data to Firestore
      const userDocRef = doc(firestore, "users", user.uid);
      const existingDoc = await getDoc(userDocRef);
      const existingContact = existingDoc.exists() ? existingDoc.data().contact || "" : "";
      const userData = {
        email,
        contact,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        isProfileComplete: false,
        role: "user",
        status: "active",
        existingContact,
      };
      await setDoc(userDocRef, userData, { merge: true });
      // navigation.replace("SetupAccount");
    } catch (error: any) {
      let errorMessage = "An error occurred during sign up.";
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = "This email is already registered.";
          break;
        case 'auth/invalid-email':
          errorMessage = "Please enter a valid email address.";
          break;
        case 'auth/weak-password':
          errorMessage = `Password should be at least ${PASSWORD_MIN_LENGTH} characters.`;
          break;
        default:
          errorMessage = error.message;
      }
      Alert.alert("Error", errorMessage);
      console.error("Sign up error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactChange = useCallback((text: string) => {
    if (/^\d{0,11}$/.test(text)) {
      setContact(text);
      if (errors.contact) setErrors(prev => ({ ...prev, contact: undefined }));
    }
  }, [errors]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // --- Render ---
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Image
            source={require("../assets/InternQuest.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>Create your Account here!!</Text>
          {/* Email Input */}
          <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
            <Icon name="email-outline" size={20} color="#555" style={styles.icon} />
            <TextInput
              placeholder="Enter email"
              style={styles.input}
              value={email}
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
              }}
            />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          {/* Contact Input */}
          <View style={[styles.inputWrapper, errors.contact && styles.inputError]}>
            <Icon name="phone-outline" size={20} color="#555" style={styles.icon} />
            <TextInput
              placeholder="Enter contact number (09XXXXXXXXX)"
              style={styles.input}
              value={contact}
              keyboardType="phone-pad"
              onChangeText={handleContactChange}
              maxLength={11}
            />
          </View>
          {errors.contact && <Text style={styles.errorText}>{errors.contact}</Text>}
          {/* Password Input */}
          <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
            <Icon name="lock-outline" size={20} color="#555" style={styles.icon} />
            <TextInput
              placeholder="Enter password"
              style={styles.input}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
              }}
            />
            <TouchableOpacity onPress={togglePasswordVisibility}>
              <Icon
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#555"
              />
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          {/* Confirm Password Input */}
          <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputError]}>
            <Icon name="lock-check-outline" size={20} color="#555" style={styles.icon} />
            <TextInput
              placeholder="Confirm password"
              style={styles.input}
              secureTextEntry={!showPassword}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
              }}
            />
          </View>
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>
          {/* Sign In Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              Already have an account?{" "}
              <Text style={styles.loginLink} onPress={() => navigation.navigate("SignIn")}>Sign In</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#fff",
  },
  logo: {
    width: 200,
    height: 200,
    alignSelf: "center",
    marginBottom: 0,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#0077cc",
    textAlign: "center",
    marginTop: 0,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  inputError: {
    borderColor: "#ff3b30",
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
  },
  icon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: "#333",
  },
  button: {
    backgroundColor: "#0077cc",
    paddingVertical: 14,
    borderRadius: 6,
    marginBottom: 20,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
  },
  loginContainer: {
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
    color: "#555",
  },
  loginLink: {
    fontWeight: "bold",
    color: "#0077cc",
  },
});

export default SignUpScreen;
