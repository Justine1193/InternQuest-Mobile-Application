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
} as const;

const SignInScreen: React.FC<Props> = ({ setIsLoggedIn }) => {
  // Navigation
  const navigation = useNavigation<SignInScreenNavigationProp>();

  // State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Handlers
  const handleLogin = async () => {
    try {
      if (!email || !password) {
        throw new Error("Please fill in both fields.");
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ User signed in:", userCredential.user.uid);
      setIsLoggedIn(true);
      navigation.replace("Home");
    } catch (error: any) {
      const errorMessage = error.message || "Invalid email or password.";
      Alert.alert("Login Failed", errorMessage);
      console.error("Login error:", error.message);
    }
  };

  const handleForgotPassword = async () => {
    try {
      if (!email) {
        throw new Error("Please enter your email address first.");
      }

      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Password Reset",
        "A password reset link has been sent to your email address.",
        [{ text: "OK" }]
      );
    } catch (error: any) {
      const errorMessage = error.message || "Failed to send password reset email.";
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

            {/* Email Input */}
            <Text style={[styles.label, { color: theme.text }]}>Email</Text>
            <View style={[styles.inputContainer, { borderColor: theme.border }]}>
              <Icon name="email-outline" size={20} style={[styles.icon, { color: theme.text }]} />
              <TextInput
                placeholder="Enter email"
                placeholderTextColor="#aaa"
                style={[styles.input, { color: theme.text }]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
              />
            </View>

            {/* Password Input */}
            <Text style={[styles.label, { color: theme.text }]}>Password</Text>
            <View style={[styles.inputContainer, { borderColor: theme.border }]}>
              <Icon name="lock-outline" size={20} style={[styles.icon, { color: theme.text }]} />
              <TextInput
                placeholder="Enter password"
                placeholderTextColor="#aaa"
                style={[styles.input, { color: theme.text }]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCorrect={false}
                textContentType="password"
              />
              <TouchableOpacity onPress={togglePasswordVisibility}>
                <Icon
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  style={{ color: theme.text }}
                />
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={[styles.forgotPassword, { color: theme.link }]}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              onPress={handleLogin}
              style={[styles.button, { backgroundColor: theme.buttonBg }]}
            >
              <Text style={[styles.buttonText, { color: theme.buttonText }]}>Sign In</Text>
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
  label: {
    fontSize: 14,
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 5,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  forgotPassword: {
    textAlign: "right",
    marginBottom: 20,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 20,
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
