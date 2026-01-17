import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebase/config';
import { LOOKUP_EMAIL_FUNCTION_BASE_URL } from '../firebase/config';
import { signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged } from 'firebase/auth';
import { SecurityUtils } from '../services/security';
import { colors, radii, shadows, spacing } from '../ui/theme';

type SignInProps = {
  setIsLoggedIn?: (v: boolean) => void;
};

const SignInScreen: React.FC<SignInProps> = ({ setIsLoggedIn }) => {
  const navigation = useNavigation();
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const formatStudentId = (text: string) => {
    // If the input looks like an email (admin login), do not format
    if (text.includes('@')) return text.trim();
    let cleaned = text.replace(/[^0-9-]/g, '');
    cleaned = cleaned.replace(/-/g, '');
    if (cleaned.length > 2) cleaned = cleaned.slice(0, 2) + '-' + cleaned.slice(2);
    if (cleaned.length > 8) cleaned = cleaned.slice(0, 8) + '-' + cleaned.slice(8);
    return cleaned;
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user: any) => {
      if (user) {
        // If the user is already signed in, prefer to let the app root react to the auth
        // state by using the provided setIsLoggedIn callback. Avoid directly calling
        // navigate('Home') here because the active navigator might not have that route
        // (this causes the development-only 'action NAVIGATE not handled' warning).
        if (setIsLoggedIn) {
          setIsLoggedIn(true);
        } else {
          // Fallback: try to navigate but guard against missing parent
          try { (navigation as any).getParent?.()?.navigate?.('Home'); } catch(e) { /* ignore */ }
        }
      }
      setCheckingSession(false);
    });
    return unsub;
  }, [navigation]);

  const handleSignIn = async () => {
    const identifier = SecurityUtils.sanitizeInput(studentId);

    if (!identifier || !password) {
      Alert.alert('Missing fields', 'Please enter your Student ID or admin email, and password.');
      return;
    }

    const isStudentId = SecurityUtils.validateStudentId(identifier);
    const isEmail = SecurityUtils.validateEmail(identifier);

    if (!(isStudentId || isEmail)) {
      Alert.alert('Invalid credentials', 'Enter a valid Student ID (XX-XXXXX-XXX) or an admin email (@neu.edu.ph).');
      return;
    }

    setLoading(true);
    try {
      // Admin login: if identifier is an email, sign in directly
      if (isEmail) {
        await signInWithEmailAndPassword(auth, identifier.trim(), password);
        if (setIsLoggedIn) setIsLoggedIn(true);
        setLoading(false);
        return;
      }

      // Student login: require Cloud Function lookup since emails are personalized
      if (!LOOKUP_EMAIL_FUNCTION_BASE_URL) {
        Alert.alert(
          'Configuration Error',
          'LOOKUP_EMAIL_FUNCTION_BASE_URL is not configured. Please set this in your Expo app.json or environment variables.'
        );
        setLoading(false);
        return;
      }

      let emailToUse: string | null = null;
      try {
        console.log('🔍 Calling function:', LOOKUP_EMAIL_FUNCTION_BASE_URL);
        const res = await fetch(LOOKUP_EMAIL_FUNCTION_BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId: identifier })
        });
        if (!res.ok) {
          console.error('Lookup service returned status:', res.status);
          Alert.alert('Lookup Error', 'Email lookup service is unavailable. Please try again later or contact your adviser.');
          setLoading(false);
          return;
        }

        const data = await res.json();
        console.log('📧 Function response:', data);
        if (data?.email && typeof data.email === 'string') {
          emailToUse = data.email;
        }
      } catch (fetchErr) {
        console.error('❌ Function call failed:', fetchErr);
        Alert.alert('Lookup Error', 'Could not reach email lookup service. Check your internet connection.');
        setLoading(false);
        return;
      }

      if (!emailToUse) {
        Alert.alert(
          'Account Not Found',
          `No account found for Student ID: ${identifier}. Please contact your adviser.`
        );
        setLoading(false);
        return;
      }

      // Sign in using the resolved email and admin-provided password
      console.log('🔍 Attempting sign-in with email:', emailToUse);
      await signInWithEmailAndPassword(auth, emailToUse.trim(), password);

      if (setIsLoggedIn) setIsLoggedIn(true);
      else { try { (navigation as any).getParent?.()?.navigate?.('Home'); } catch(e) { /* ignore */ } }
    } catch (e: any) {
      const code = e?.code ?? '';
      console.error('❌ Sign-in error code:', code);
      console.error('❌ Full error:', e);
      let message = 'Failed to sign in. Please try again.';
      
      if (code === 'auth/user-not-found') {
        message = `No account found for Student ID: ${identifier}\n\nPlease contact your adviser to create an account.`;
      } else if (code === 'auth/wrong-password') {
        message = 'Incorrect password.\n\nDefault password is: Student@123\n\nIf you\'ve changed it and forgot, contact your adviser to reset it.';
      } else if (code === 'auth/invalid-login-credentials') {
        message = 'Invalid Student ID or password.\n\nPlease check:\n• Student ID format: XX-XXXXX-XXX\n• Default password: Student@123\n\nIf the problem persists, contact your adviser.';
      } else if (code === 'permission-denied') {
        message = 'Permission denied. Please contact your adviser.';
      }
      
      Alert.alert('Sign In Failed', message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const identifier = SecurityUtils.sanitizeInput(studentId);
    if (!identifier) {
      Alert.alert('Missing field', 'Please enter your Student ID or admin email first.');
      return;
    }

    const isStudentId = SecurityUtils.validateStudentId(identifier);
    const isEmail = SecurityUtils.validateEmail(identifier);
    if (!(isStudentId || isEmail)) {
      Alert.alert('Invalid input', 'Enter a valid Student ID (XX-XXXXX-XXX) or an admin email (@neu.edu.ph).');
      return;
    }

    setResetLoading(true);
    try {
      let emailToUse: string | null = null;

      if (isEmail) {
        emailToUse = identifier.trim();
      } else {
        // Student reset: resolve their email via your existing lookup function
        if (!LOOKUP_EMAIL_FUNCTION_BASE_URL) {
          Alert.alert(
            'Configuration Error',
            'LOOKUP_EMAIL_FUNCTION_BASE_URL is not configured. Please set this in your Expo app.json or environment variables.'
          );
          return;
        }

        try {
          const res = await fetch(LOOKUP_EMAIL_FUNCTION_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId: identifier }),
          });
          if (!res.ok) {
            Alert.alert('Lookup Error', 'Email lookup service is unavailable. Please try again later.');
            return;
          }
          const data = await res.json();
          if (data?.email && typeof data.email === 'string') {
            emailToUse = data.email;
          }
        } catch (fetchErr) {
          console.error('❌ Password reset lookup failed:', fetchErr);
          Alert.alert('Lookup Error', 'Could not reach email lookup service. Check your internet connection.');
          return;
        }
      }

      if (!emailToUse) {
        Alert.alert(
          'Account Not Found',
          isStudentId
            ? `No account found for Student ID: ${identifier}. Please contact your adviser.`
            : 'No email found. Please check your input.'
        );
        return;
      }

      await sendPasswordResetEmail(auth, emailToUse);
      Alert.alert(
        'Reset email sent',
        `If an account exists for ${emailToUse}, a password reset link has been sent.`
      );
    } catch (e: any) {
      const code = e?.code ?? '';
      console.error('❌ Password reset error:', code, e);
      let message = 'Failed to send password reset email. Please try again.';
      if (code === 'auth/invalid-email') message = 'Invalid email address.';
      else if (code === 'auth/too-many-requests') message = 'Too many requests. Please try again later.';
      else if (code === 'auth/user-not-found') {
        // Keep message generic, but your app already surfaces user-not-found elsewhere.
        message = 'No account found for this email/Student ID. Please contact your adviser.';
      }
      Alert.alert('Password Reset Failed', message);
    } finally {
      setResetLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={require('../assets/InternQuest.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Sign In</Text>
      <Text style={styles.subtitle}>Welcome back — please sign in to continue</Text>

      <Text style={styles.label}>Student ID</Text>
      <View style={styles.inputWrapper}>
        <Icon name="card-account-details-outline" size={20} color={colors.primary} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Enter student ID (e.g., XX-XXXXX-XXX)"
          value={studentId}
          onChangeText={(t) => setStudentId(formatStudentId(t))}
          autoCapitalize="none"
          keyboardType="default"
        />
      </View>

      <Text style={styles.label}>Password</Text>
      <View style={styles.inputWrapper}>
        <Icon name="lock-outline" size={20} color={colors.primary} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Enter password (provided by admin)"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSignIn} disabled={loading || resetLoading}>
        {loading ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.buttonText}>Sign In</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleResetPassword} disabled={resetLoading || loading}>
        <Text style={styles.loginLink}>{resetLoading ? 'Sending reset email…' : 'Forgot password?'}</Text>
      </TouchableOpacity>

      <Text style={styles.helperNote}>No account? Please contact your adviser/coordinator.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: 32,
    backgroundColor: colors.bg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 180,
    height: 180,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: colors.textMuted,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
    color: colors.text,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 50,
    backgroundColor: colors.surfaceAlt,
    ...shadows.card,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    height: '100%',
    paddingVertical: 0,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radii.md,
    marginTop: 8,
    marginBottom: 24,
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 18,
    color: colors.onPrimary,
    fontWeight: '600',
  },
  loginLink: {
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
  },
    helperNote: {
      textAlign: 'center',
      color: colors.textMuted,
      marginTop: 16,
    },
});

export default SignInScreen;
