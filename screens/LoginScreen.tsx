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
import { auth, LOOKUP_EMAIL_FUNCTION_BASE_URL } from '../firebase/config';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { SecurityUtils } from '../services/security';
import { colors, radii, spacing } from '../ui/theme';
import { Screen } from '../ui/components/Screen';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../App';

type LoginProps = {
  setIsLoggedIn?: (v: boolean) => void;
};

const LoginScreen: React.FC<LoginProps> = ({ setIsLoggedIn }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<'studentId' | 'password' | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const formatStudentId = (text: string) => {
    // Enforce Student ID format: XX-XXXXX-XXX (2-5-3 digits)
    const digits = String(text || '').replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user: any) => {
      if (user) {
        if (setIsLoggedIn) {
          setIsLoggedIn(true);
        } else {
          try { (navigation as any).getParent?.()?.navigate?.('Home'); } catch (e) { /* ignore */ }
        }
      }
      setCheckingSession(false);
    });
    return unsub;
  }, [navigation]);

  const handleSignIn = async () => {
    const identifier = SecurityUtils.sanitizeInput(studentId);

    if (!identifier || !password) {
      Alert.alert('Missing fields', 'Please enter your Student ID and password.');
      return;
    }

    const isStudentId = SecurityUtils.validateStudentId(identifier);
    if (!isStudentId) {
      Alert.alert('Invalid Student ID', 'Please use this format: XX-XXXXX-XXX');
      return;
    }

    setLoading(true);
    try {
      if (!LOOKUP_EMAIL_FUNCTION_BASE_URL) {
        Alert.alert(
          'Configuration Error',
          'LOOKUP_EMAIL_FUNCTION_BASE_URL is not configured. Please set this in your Expo app.json or environment variables.'
        );
        return;
      }

      const lookupEmail = async (studentIdValue: string) => {
        const res = await fetch(LOOKUP_EMAIL_FUNCTION_BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId: studentIdValue }),
        });
        if (!res.ok) {
          if (res.status === 403) {
            Alert.alert('Sign-in Error', 'Sign-in verification is currently restricted. Please contact your adviser.');
            return null;
          }
          Alert.alert('Sign-in Error', `We couldn’t verify your Student ID right now (Error ${res.status}). Please try again later.`);
          return null;
        }
        const data = await res.json();
        return (data?.email && typeof data.email === 'string') ? data.email : null;
      };

      let emailToUse: string | null = null;
      try {
        emailToUse = await lookupEmail(identifier);

        // Some databases store studentId without hyphens. Retry once with a normalized value.
        if (!emailToUse && identifier.includes('-')) {
          const normalized = identifier.replace(/-/g, '');
          emailToUse = await lookupEmail(normalized);
        }
      } catch (fetchErr) {
        Alert.alert('Network Error', 'Please check your internet connection and try again.');
        return;
      }

      if (!emailToUse) {
        Alert.alert('Account Not Found', `No account found for Student ID: ${identifier}. Please contact your adviser.`);
        return;
      }

      await signInWithEmailAndPassword(auth, emailToUse.trim(), password);

      if (setIsLoggedIn) setIsLoggedIn(true);
      else { try { (navigation as any).getParent?.()?.navigate?.('Home'); } catch (e) { /* ignore */ } }
    } catch (e: any) {
      const code = e?.code ?? '';
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

      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  if (checkingSession) {
    return (
      <Screen style={styles.screen} contentContainerStyle={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Screen>
    );
  }

  return (
    <View style={styles.bg}>
      <View style={styles.bgCircle1} pointerEvents="none" />
      <View style={styles.bgCircle2} pointerEvents="none" />

      <Screen scroll style={styles.screen} contentContainerStyle={styles.container}>
        <View style={styles.stack}>
          <View style={styles.header}>
            <View style={styles.logoOuter}>
              <View style={styles.logoInner}>
                <Image source={require('../assets/ship.png')} style={styles.logo} resizeMode="contain" />
              </View>
            </View>

            <Text style={styles.title}>InterQuest</Text>
            <Text style={styles.subtitle}>Sign in with your Student ID</Text>
          </View>

          <View style={styles.card}>
          {/* Student ID */}
          <View style={styles.fieldRow}>
            <View style={[styles.bubble, focused === 'studentId' && styles.bubbleFocused]}>
              <Icon name="card-account-details-outline" size={20} color={colors.primary} />
            </View>
            <View style={[styles.pill, focused === 'studentId' && styles.pillFocused]}>
              <TextInput
                style={styles.pillInput}
                placeholder="Student ID (XX-XXXXX-XXX)"
                value={studentId}
                onChangeText={(t) => setStudentId(formatStudentId(t))}
                autoCapitalize="none"
                keyboardType="number-pad"
                placeholderTextColor={colors.textSubtle}
                maxLength={12}
                autoCorrect={false}
                onFocus={() => setFocused('studentId')}
                onBlur={() => setFocused(null)}
                accessibilityLabel="Student ID"
              />
            </View>
          </View>

          {/* Password */}
          <View style={[styles.fieldRow, { marginTop: 14 }]}>
            <View style={[styles.bubble, focused === 'password' && styles.bubbleFocused]}>
              <Icon name="lock-outline" size={20} color={colors.primary} />
            </View>
            <View style={[styles.pill, focused === 'password' && styles.pillFocused]}>
              <TextInput
                style={styles.pillInput}
                placeholder="Password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                placeholderTextColor={colors.textSubtle}
                autoCorrect={false}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                accessibilityLabel="Password"
              />
              <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                style={styles.eyeButton}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                <Icon name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSignIn} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.buttonText}>Sign in</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleOpenForgotPassword}
            disabled={loading}
            style={styles.forgotButton}
            accessibilityRole="button"
            accessibilityLabel="Forgot password"
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
          </View>
        </View>
      </Screen>
    </View>
  );
};

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#2B7FFF' },
  screen: { backgroundColor: 'transparent' },
  bgCircle1: {
    position: 'absolute',
    top: -80,
    right: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  bgCircle2: {
    position: 'absolute',
    bottom: -140,
    left: -160,
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  container: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    flexGrow: 1,
    justifyContent: 'center',
  },
  stack: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 420,
    transform: [{ translateY: -50 }],
  },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: {
    alignItems: 'center',
    marginBottom: 18,
  },
  logoOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  logoInner: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 46, height: 46 },
  title: { fontSize: 26, fontWeight: '900', color: colors.white },
  subtitle: { marginTop: 4, fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  bubbleFocused: {
    borderColor: 'rgba(59,130,246,0.55)',
    backgroundColor: 'rgba(59,130,246,0.08)',
  },
  pill: {
    flex: 1,
    height: 46,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(11,43,52,0.10)',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillFocused: {
    borderColor: 'rgba(59,130,246,0.55)',
    backgroundColor: 'rgba(43,127,255,0.06)',
  },
  pillInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    height: '100%',
    paddingVertical: 0,
  },
  eyeButton: { paddingLeft: 10, paddingVertical: 10 },
  button: {
    width: '100%',
    backgroundColor: '#2B7FFF',
    borderRadius: 999,
    marginTop: 18,
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  buttonText: { fontSize: 14, color: colors.onPrimary, fontWeight: '800' },
  forgotButton: {
    marginTop: 12,
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2B7FFF',
  },
});

export default LoginScreen;

