import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  Linking,
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

type Errors = {
  email?: string;
  password?: string;
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
  const [errors, setErrors] = useState<Errors>({});
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);

  const googleClientIds = useMemo(
    () => ({
      expo: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_EXPO,
      ios: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
      android: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID,
      web: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB,
    }),
    []
  );

  const isGoogleConfigured = useMemo(() => {
    if (Platform.OS === 'android') {
      return Boolean(googleClientIds.android);
    } else if (Platform.OS === 'ios') {
      return Boolean(googleClientIds.ios);
    } else {
      return Boolean(googleClientIds.web || googleClientIds.expo);
    }
  }, [googleClientIds]);

  const googleAuthConfig = useMemo<Partial<Google.GoogleAuthRequestConfig>>(
    () => {
      // Provide a minimal valid config to prevent hook errors
      // The hook will validate, so we need at least the platform-specific client ID
      const config: Partial<Google.GoogleAuthRequestConfig> = {
        scopes: ["profile", "email"],
      };

      if (googleClientIds.expo) config.clientId = googleClientIds.expo;
      if (googleClientIds.ios) config.iosClientId = googleClientIds.ios;
      if (googleClientIds.android) config.androidClientId = googleClientIds.android;
      if (googleClientIds.web) config.webClientId = googleClientIds.web;

      // On Android, we must provide androidClientId or the hook will error
      // If not configured, provide a placeholder to prevent the error
      if (Platform.OS === 'android' && !config.androidClientId) {
        config.androidClientId = 'placeholder-not-configured';
      }

      return config;
    },
    [googleClientIds]
  );

  // Only use the hook result if Google is properly configured
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest(
    isGoogleConfigured ? googleAuthConfig : { androidClientId: 'placeholder', scopes: ["profile", "email"] }
  );

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
      // State
      const [email, setEmail] = useState("");
      const [password, setPassword] = useState("");
      const [showPassword, setShowPassword] = useState(false);
      const [isLoading, setIsLoading] = useState(false);
      const [errors, setErrors] = useState<Errors>({});
      const [forgotPasswordSent, setForgotPasswordSent] = useState(false);

      Alert.alert(
          break;
          errorMessage = error.message || "Failed to send password reset email.";
  };
  return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                onChangeText={(text: string) => {
                  setEmail(text);
                  if (errors.email) setErrors((prev: Errors) => ({ ...prev, email: undefined }));
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
                onChangeText={(text: string) => {
                  setPassword(text);
                  if (errors.password) setErrors((prev: Errors) => ({ ...prev, password: undefined }));
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
            {forgotPasswordSent && (
              <View style={styles.forgotPasswordInfoBox}>
                <Text style={styles.forgotPasswordInfoText}>
                  A password reset link has been sent to your NEU email address. Please check your inbox and follow the instructions to reset your password.
                </Text>
                <TouchableOpacity
                  style={styles.openEmailButton}
                  onPress={() => {
                    // Open NEU webmail in browser
                    // You can change this to the actual NEU webmail URL if different
                    const url = 'https://mail.google.com/a/neu.edu.ph';
                    Linking.openURL(url);
                  }}
                >
                  <Text style={styles.openEmailButtonText}>Open NEU Email</Text>
                </TouchableOpacity>
              </View>
            )}

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
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#ccc",
  },
  dividerText: {
    marginHorizontal: 8,
    color: "#999",
    textTransform: "uppercase",
    fontSize: 12,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingVertical: 12,
  },
  googleButton: {
    backgroundColor: "#fff",
  },
  socialIcon: {
    marginRight: 12,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  googleConfigNotice: {
    marginTop: 12,
    fontSize: 13,
    color: "#999",
    textAlign: "center",
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
  forgotPasswordInfoBox: {
    backgroundColor: '#e6f7ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    marginTop: 8,
    alignItems: 'center',
  },
  forgotPasswordInfoText: {
    color: '#0077cc',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  openEmailButton: {
    backgroundColor: '#0077cc',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  openEmailButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default SignInScreen;
