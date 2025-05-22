import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/config";

// Types
type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  Home: undefined;
  Profile: undefined;
};

type SignInScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "SignIn">;

type Props = {
  setIsLoggedIn: (value: boolean) => void;
};

// Theme
const theme = {
  background: "#fff",
  text: "#333",
  border: "#ccc",
  buttonText: "#fff",
  buttonBg: "#007bff",
  link: "#0077cc",
  error: "#ff3b30",
} as const;

const SignInScreen: React.FC<Props> = ({ setIsLoggedIn }) => {
  // Navigation
  const navigation = useNavigation<SignInScreenNavigationProp>();

  // State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // Validation
  const validateEmail = (email: string): boolean => {
    // Only allow NEU email addresses
    const emailRegex = /^[^\s@]+@neu\.edu\.ph$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please use your NEU email address (@neu.edu.ph)";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Sanitize inputs
      const sanitizedEmail = email.trim().toLowerCase();
      const sanitizedPassword = password.trim();

      const userCredential = await signInWithEmailAndPassword(auth, sanitizedEmail, sanitizedPassword);

      // Clear sensitive data
      setPassword("");
      setEmail("");

      console.log("✅ User signed in:", userCredential.user.uid);
      setIsLoggedIn(true);
    } catch (error: any) {
      let errorMessage = "Invalid email or password.";
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = "No account found with this email.";
          break;
        case 'auth/wrong-password':
          errorMessage = "Incorrect password.";
          break;
        case 'auth/invalid-email':
          errorMessage = "Please enter a valid NEU email address.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many failed attempts. Please try again later.";
          break;
        case 'auth/user-disabled':
          errorMessage = "This account has been disabled. Please contact support.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Network error. Please check your connection.";
          break;
        default:
          errorMessage = "An error occurred. Please try again.";
      }
      Alert.alert("Login Failed", errorMessage);
      console.error("Login error:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErrors(prev => ({ ...prev, email: "Please enter your email address first" }));
      return;
    }

    if (!validateEmail(email)) {
      setErrors(prev => ({ ...prev, email: "Please enter a valid NEU email address" }));
      return;
    }

    try {
      const sanitizedEmail = email.trim().toLowerCase();
      await sendPasswordResetEmail(auth, sanitizedEmail);
      Alert.alert(
        "Password Reset",
        "A password reset link has been sent to your NEU email address.",
        [{ text: "OK" }]
      );
    } catch (error: any) {
      let errorMessage = "Failed to send password reset email.";
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = "No account found with this email.";
          break;
        case 'auth/invalid-email':
          errorMessage = "Please enter a valid NEU email address.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many attempts. Please try again later.";
          break;
        default:
          errorMessage = error.message || "Failed to send password reset email.";
      }
      Alert.alert("Error", errorMessage);
      console.error("Password reset error:", error.message);
    }
  };

  const handleSignUp = () => navigation.navigate("SignUp");
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  // Render
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={[styles.scroll, { backgroundColor: theme.background }]}>
          <View style={styles.container}>
            <Image
              source={require("../assets/InternQuest.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.welcomeText}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            {/* Email Input */}
            <Text style={[styles.label, { color: theme.text }]}>Email</Text>
            <View style={[
              styles.inputContainer,
              { borderColor: errors.email ? theme.error : theme.border }
            ]}>
              <Icon name="email-outline" size={20} style={[styles.icon, { color: theme.text }]} />
              <TextInput
                placeholder="Enter email"
                placeholderTextColor="#aaa"
                style={[styles.input, { color: theme.text }]}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                editable={!isLoading}
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            {/* Password Input */}
            <Text style={[styles.label, { color: theme.text }]}>Password</Text>
            <View style={[
              styles.inputContainer,
              { borderColor: errors.password ? theme.error : theme.border }
            ]}>
              <Icon name="lock-outline" size={20} style={[styles.icon, { color: theme.text }]} />
              <TextInput
                placeholder="Enter password"
                placeholderTextColor="#aaa"
                style={[styles.input, { color: theme.text }]}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                }}
                secureTextEntry={!showPassword}
                autoCorrect={false}
                textContentType="password"
                editable={!isLoading}
              />
              <TouchableOpacity onPress={togglePasswordVisibility} disabled={isLoading}>
                <Icon
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  style={{ color: theme.text }}
                />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            {/* Forgot Password */}
            <TouchableOpacity onPress={handleForgotPassword} disabled={isLoading}>
              <Text style={[styles.forgotPassword, { color: theme.link }]}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              onPress={handleLogin}
              style={[
                styles.button,
                { backgroundColor: theme.buttonBg },
                isLoading && styles.buttonDisabled
              ]}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.buttonText, { color: theme.buttonText }]}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signupContainer}>
              <Text style={[styles.signupText, { color: theme.text }]}>
                Don't have an account?{" "}
                <Text
                  style={[styles.signupLink, { color: theme.link }]}
                  onPress={handleSignUp}
                >
                  Sign up
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

// Styles
const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    padding: 20,
  },
  logo: {
    width: 200,
    height: 200,
    alignSelf: "center",
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0077cc",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 5,
    paddingHorizontal: 12,
    height: 50,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
  },
  forgotPassword: {
    textAlign: "right",
    marginBottom: 20,
    fontSize: 14,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
    height: 50,
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "bold",
  },
  signupContainer: {
    alignItems: "center",
  },
  signupText: {
    fontSize: 14,
  },
  signupLink: {
    fontWeight: "500",
    textDecorationLine: "underline",
  },
});

export default SignInScreen;
