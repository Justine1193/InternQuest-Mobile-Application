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
  Modal,
  Linking,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { auth, firestore } from "../firebase/config";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../App";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import UserAgreementText from '../docs/userAgreement';

// Types
type NavigationProp = StackNavigationProp<RootStackParamList, "SignUp">;

// Constants
const PHONE_REGEX = /^\d{11}$/;
const PASSWORD_MIN_LENGTH = 8;
const STUDENT_ID_REGEX = /^\d{2}-\d{5}-\d{3}$/;

// Password requirements
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
};

// Theme
const theme = {
  background: "#fff",
  text: "#333",
  border: "#ccc",
  buttonText: "#fff",
  buttonBg: "#6366F1",
  link: "#6366F1",
  error: "#ff3b30",
} as const;

const SignUpScreen: React.FC = () => {
  // --- State ---
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    studentId?: string;
    contact?: string;
    password?: string;
    confirmPassword?: string;
    agreement?: string;
  }>({});
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);

  const navigation = useNavigation<NavigationProp>();

  // --- Validation functions ---
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@neu\.edu\.ph$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];

    if (password.length < PASSWORD_REQUIREMENTS.minLength) {
      errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`);
    }
    if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (PASSWORD_REQUIREMENTS.requireNumber && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (PASSWORD_REQUIREMENTS.requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return errors;
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please use your NEU email address (@neu.edu.ph)";
    }

    if (!studentId) {
      newErrors.studentId = "Student ID is required";
    } else if (!STUDENT_ID_REGEX.test(studentId)) {
      newErrors.studentId = "Please enter a valid student ID (e.g., XX-XXXXX-XXX)";
    }

    if (!contact) {
      newErrors.contact = "Contact number is required";
    } else if (!PHONE_REGEX.test(contact)) {
      newErrors.contact = "Please enter a valid 11-digit phone number";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else {
      const passwordErrors = validatePassword(password);
      if (passwordErrors.length > 0) {
        newErrors.password = passwordErrors.join('\n');
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!agreementChecked) {
      newErrors.agreement = 'You must accept the User Agreement to continue';
    }

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
        studentId,
        contact,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        isProfileComplete: false,
        role: "user",
        status: "active",
        acceptedTerms: agreementChecked ? true : false,
        acceptedTermsAt: agreementChecked ? serverTimestamp() : null,
        existingContact,
      };

      await setDoc(userDocRef, userData, { merge: true });
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
          errorMessage = "Password is too weak. Please use a stronger password.";
          break;
        case 'auth/operation-not-allowed':
          errorMessage = "Email/password accounts are not enabled. Please contact support.";
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

  const handleStudentIdChange = useCallback((text: string) => {
    // Only allow numbers and hyphens
    let cleaned = text.replace(/[^0-9-]/g, '');

    // Remove existing hyphens to prevent duplicates
    cleaned = cleaned.replace(/-/g, '');

    // Add hyphens at correct positions
    if (cleaned.length > 2) {
      cleaned = cleaned.slice(0, 2) + '-' + cleaned.slice(2);
    }
    if (cleaned.length > 8) {
      cleaned = cleaned.slice(0, 8) + '-' + cleaned.slice(8);
    }

    setStudentId(cleaned);
    if (errors.studentId) setErrors(prev => ({ ...prev, studentId: undefined }));
  }, [errors]);

  const handleContactChange = useCallback((text: string) => {
    if (/^\d{0,11}$/.test(text)) {
      setContact(text);
      if (errors.contact) setErrors(prev => ({ ...prev, contact: undefined }));
    }
  }, [errors]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join InternQuest today!</Text>

          {/* Student ID Input */}
          <Text style={styles.label}>Student ID</Text>
          <View style={[styles.inputWrapper, errors.studentId && styles.inputError]}>
            <Icon name="card-account-details-outline" size={20} color="#6366F1" style={styles.icon} />
            <TextInput
              placeholder="Enter student ID (e.g., XX-XXXXX-XXX)"
              style={styles.input}
              value={studentId}
              onChangeText={handleStudentIdChange}
              keyboardType="phone-pad"
              maxLength={12}
              editable={!isLoading}
            />
          </View>
          {errors.studentId && <Text style={styles.errorText}>{errors.studentId}</Text>}

          {/* Email Input */}
          <Text style={styles.label}>Email</Text>
          <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
            <Icon name="email-outline" size={20} color="#6366F1" style={styles.icon} />
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
              editable={!isLoading}
            />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          {/* Contact Input */}
          <Text style={styles.label}>Contact Number</Text>
          <View style={[styles.inputWrapper, errors.contact && styles.inputError]}>
            <Icon name="phone-outline" size={20} color="#6366F1" style={styles.icon} />
            <TextInput
              placeholder="Enter contact number (11 digits)"
              style={styles.input}
              value={contact}
              keyboardType="phone-pad"
              onChangeText={handleContactChange}
              maxLength={11}
              editable={!isLoading}
            />
          </View>
          {errors.contact && <Text style={styles.errorText}>{errors.contact}</Text>}

          {/* Password Input */}
          <Text style={styles.label}>Password</Text>
          <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
            <Icon name="lock-outline" size={20} color="#6366F1" style={styles.icon} />
            <TextInput
              placeholder="Enter password"
              style={styles.input}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
              }}
              editable={!isLoading}
            />
            <TouchableOpacity onPress={togglePasswordVisibility} disabled={isLoading}>
              <Icon
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#6366F1"
              />
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          {/* Confirm Password Input */}
          <Text style={styles.label}>Confirm Password</Text>
          <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputError]}>
            <Icon name="lock-check-outline" size={20} color="#6366F1" style={styles.icon} />
            <TextInput
              placeholder="Confirm password"
              style={styles.input}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
              }}
              editable={!isLoading}
            />
            <TouchableOpacity onPress={toggleConfirmPasswordVisibility} disabled={isLoading}>
              <Icon
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#6366F1"
              />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

          {/* User Agreement */}
          <TouchableOpacity
            style={styles.agreementRow}
            onPress={() => setAgreementChecked(prev => !prev)}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            <Icon
              name={agreementChecked ? 'checkbox-marked' : 'checkbox-blank-outline'}
              size={22}
                color={agreementChecked ? '#6366F1' : '#999'}
            />
            <Text style={styles.agreementText}>
              I agree to the{' '}
              <Text style={styles.agreementLink} onPress={() => setShowAgreementModal(true)}>
                User Agreement
              </Text>
            </Text>
          </TouchableOpacity>
          {errors.agreement && <Text style={styles.errorText}>{errors.agreement}</Text>}

          {/* Agreement modal (in-app) */}
          <Modal
            visible={showAgreementModal}
            animationType="slide"
            onRequestClose={() => setShowAgreementModal(false)}
            transparent={true}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.agreementModalContent}>
                <View style={styles.modalHeaderInline}>
                  <Text style={styles.modalTitleInline}>User Agreement</Text>
                  <TouchableOpacity onPress={() => setShowAgreementModal(false)}>
                    <Icon name="close" size={22} color="#333" />
                  </TouchableOpacity>
                </View>
                <ScrollView style={{ padding: 16 }}>
                  <Text style={{ color: '#333', lineHeight: 20 }}>{UserAgreementText}</Text>
                </ScrollView>
              </View>
            </View>
          </Modal>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Sign In Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              Already have an account?{" "}
              <Text style={styles.loginLink} onPress={() => navigation.navigate("SignIn")}>
                Sign In
              </Text>
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
    backgroundColor: "#f2f6ff",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: "#f2f6ff",
  },
  logo: {
    width: 180,
    height: 180,
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#6366F1",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
    color: "#333",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    height: 50,
    backgroundColor: "#F8F9FA",
  },
  inputError: {
    borderColor: "#ff3b30",
    backgroundColor: "#FFF5F5",
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 12,
    marginBottom: 16,
    marginLeft: 5,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    height: "100%",
    paddingVertical: 0,
  },
  button: {
    backgroundColor: "#6366F1",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 24,
    alignItems: "center",
    height: 50,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
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
    marginTop: 8,
  },
  loginText: {
    fontSize: 14,
    color: "#666",
  },
  loginLink: {
    fontWeight: "bold",
    color: "#0077cc",
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  agreementText: {
    marginLeft: 10,
    color: '#333',
    fontSize: 14,
    flexShrink: 1,
  },
  agreementLink: {
    color: '#0077cc',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  agreementModalContent: {
    backgroundColor: '#fff',
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeaderInline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitleInline: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
});

export default SignUpScreen;
