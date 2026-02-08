import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { auth, LOOKUP_EMAIL_FUNCTION_BASE_URL } from '../firebase/config';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { SecurityUtils } from '../services/security';
import { authenticate } from '../services/biometric';
import { colors, radii, spacing } from '../ui/theme';
import { Screen } from '../ui/components/Screen';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../App';

type LoginProps = {
  setIsLoggedIn?: (v: boolean) => void;
  /** When true, user is auto-logged in but can use password or biometric; no separate gate UI */
  gateMode?: boolean;
  onBiometricUnlock?: () => void;
  /** Called when user signs in with password while in gate mode (so app can clear gate state) */
  onPasswordUnlock?: () => void;
  /** Optional message shown once (e.g. account was blocked during auto-login). */
  initialErrorMessage?: string | null;
};

type LoginErrorType = 'student_id' | 'password' | 'network' | 'other';

const LoginScreen: React.FC<LoginProps> = ({ setIsLoggedIn, gateMode, onBiometricUnlock, onPasswordUnlock, initialErrorMessage }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<'studentId' | 'password' | null>(null);
  const [loading, setLoading] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<{ type: LoginErrorType; message: string } | null>(null);

  // Persist any blocked message coming from app startup (auto-login block).
  useEffect(() => {
    if (initialErrorMessage && typeof initialErrorMessage === 'string' && initialErrorMessage.trim()) {
      setBlockedMessage(initialErrorMessage);
    }
  }, [initialErrorMessage]);

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
        // In gate mode, App controls unlock; don't auto-set isLoggedIn here
        if (!gateMode && setIsLoggedIn) {
          setIsLoggedIn(true);
        } else if (!gateMode) {
          try { (navigation as any).getParent?.()?.navigate?.('Home'); } catch (e) { /* ignore */ }
        }
      }
      setCheckingSession(false);
    });
    return unsub;
  }, [navigation, gateMode]);

  // When in gate mode, show the system biometric prompt automatically
  useEffect(() => {
    if (!gateMode || !onBiometricUnlock) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      setBiometricLoading(true);
      authenticate('Unlock InternQuest').then((success) => {
        if (!cancelled) {
          setBiometricLoading(false);
          if (success) onBiometricUnlock();
        }
      });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [gateMode, onBiometricUnlock]);

  const clearError = () => setLoginError(null);

  const handleSignIn = async () => {
    const identifier = SecurityUtils.sanitizeInput(studentId);
    setLoginError(null);

    if (!identifier && !password) {
      setLoginError({ type: 'other', message: 'Enter your Student ID and password to sign in.' });
      return;
    }
    if (!identifier) {
      setLoginError({ type: 'student_id', message: 'Enter your Student ID.' });
      return;
    }
    if (!password) {
      setLoginError({ type: 'password', message: 'Enter your password.' });
      return;
    }

    const isStudentId = SecurityUtils.validateStudentId(identifier);
    if (!isStudentId) {
      setLoginError({ type: 'student_id', message: 'Invalid format. Use XX-XXXXX-XXX.' });
      return;
    }

    setLoading(true);
    try {
      if (!LOOKUP_EMAIL_FUNCTION_BASE_URL) {
        setLoginError({ type: 'other', message: 'Sign-in is not configured. Please contact support.' });
        return;
      }

      const BLOCKED_SENTINEL = '__ACCOUNT_BLOCKED__';

      const lookupEmail = async (studentIdValue: string): Promise<string | null> => {
        const res = await fetch(LOOKUP_EMAIL_FUNCTION_BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId: studentIdValue }),
        });
        if (!res.ok) {
          if (res.status === 403) {
            // Try to parse structured payloads (e.g. ACCOUNT_BLOCKED)
            try {
              const body = await res.json();
              if (body && body.error === 'ACCOUNT_BLOCKED') {
                const reason = (typeof body.reason === 'string' && body.reason.trim()) ? body.reason.trim() : '';
                const blockedBy = (typeof body.blockedBy === 'string' && body.blockedBy.trim()) ? body.blockedBy.trim() : '';
                const who = blockedBy ? ` by ${blockedBy}` : '';
                const suffix = reason ? `\n\nReason: ${reason}` : '';
                const msg = `Your account has been blocked${who}. Please contact your adviser/coordinator.${suffix}`;
                setBlockedMessage(msg);
                setLoginError(null);
                return BLOCKED_SENTINEL;
              }
            } catch (e) {
              // ignore JSON parse errors
            }

            setLoginError({ type: 'other', message: 'Sign-in is currently restricted. Please contact your adviser.' });
            return null;
          }
          setLoginError({ type: 'network', message: 'We could not verify your Student ID right now. Please try again later.' });
          return null;
        }
        const data = await res.json();
        return (data?.email && typeof data.email === 'string') ? data.email : null;
      };

      let emailToUse: string | null = null;
      try {
        emailToUse = await lookupEmail(identifier);

        if (emailToUse === BLOCKED_SENTINEL) return;

        // Some databases store studentId without hyphens. Retry once with a normalized value.
        if (!emailToUse && identifier.includes('-')) {
          const normalized = identifier.replace(/-/g, '');
          emailToUse = await lookupEmail(normalized);

          if (emailToUse === BLOCKED_SENTINEL) return;
        }
      } catch (fetchErr) {
        setLoginError({ type: 'network', message: 'Please check your internet connection and try again.' });
        return;
      } finally {
        setLoading(false);
      }

      if (!emailToUse) {
        setLoginError({
          type: 'student_id',
          message: "No account found for this Student ID. Please check the number or contact your adviser to create an account.",
        });
        return;
      }

      setLoading(true);

      await signInWithEmailAndPassword(auth, emailToUse.trim(), password);

      // Successful login clears any prior blocked banner.
      setBlockedMessage(null);

      if (gateMode && onPasswordUnlock) onPasswordUnlock();
      if (setIsLoggedIn) setIsLoggedIn(true);
      else { try { (navigation as any).getParent?.()?.navigate?.('Home'); } catch (e) { /* ignore */ } }
    } catch (e: any) {
      const code = e?.code ?? '';
      let type: LoginErrorType = 'other';
      let message = 'Something went wrong. Please try again.';

      if (code === 'auth/user-not-found') {
        type = 'student_id';
        message = "No account found for this Student ID. Please contact your adviser to create an account.";
      } else if (code === 'auth/user-disabled') {
        type = 'other';
        message = 'Your account is disabled. Please contact your adviser/coordinator.';
      } else if (code === 'auth/wrong-password' || code === 'auth/invalid-login-credentials' || code === 'auth/invalid-credential') {
        type = 'password';
        message = "Incorrect password. Please try again or use Forgot password to reset it.";
      } else if (code === 'auth/network-request-failed') {
        type = 'network';
        message = 'Please check your internet connection and try again.';
      } else if (code === 'permission-denied') {
        message = 'Permission denied. Please contact your adviser.';
      }

      setLoginError({ type, message });
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
                onChangeText={(t) => { setStudentId(formatStudentId(t)); clearError(); }}
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
                onChangeText={(t) => { setPassword(t); clearError(); }}
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

          {blockedMessage ? (
            <View style={[styles.errorBanner, styles.errorBannerPassword]} accessible accessibilityRole="alert">
              <Icon
                name="account-cancel-outline"
                size={22}
                color={colors.danger}
                style={styles.errorBannerIcon}
              />
              <Text style={styles.errorBannerText} numberOfLines={6}>{blockedMessage}</Text>
            </View>
          ) : null}

          {loginError && loginError.message !== blockedMessage ? (
            <View style={[styles.errorBanner, loginError.type === 'password' && styles.errorBannerPassword, loginError.type === 'student_id' && styles.errorBannerStudentId]} accessible accessibilityRole="alert">
              <Icon
                name={loginError.type === 'password' ? 'lock-alert-outline' : loginError.type === 'student_id' ? 'account-alert-outline' : 'alert-circle-outline'}
                size={22}
                color={loginError.type === 'password' ? colors.danger : loginError.type === 'student_id' ? colors.warning : colors.textMuted}
                style={styles.errorBannerIcon}
              />
              <Text style={styles.errorBannerText} numberOfLines={3}>{loginError.message}</Text>
              <TouchableOpacity onPress={clearError} style={styles.errorBannerDismiss} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} accessibilityLabel="Dismiss">
                <Icon name="close" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          ) : null}

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

          {gateMode && onBiometricUnlock ? (
            <TouchableOpacity
              style={styles.biometricLink}
              onPress={async () => {
                setBiometricLoading(true);
                try {
                  const success = await authenticate('Unlock to continue');
                  if (success) onBiometricUnlock();
                } finally {
                  setBiometricLoading(false);
                }}
              }
              disabled={biometricLoading || loading}
              accessibilityRole="button"
              accessibilityLabel="Unlock with biometric"
            >
              {biometricLoading ? (
                <ActivityIndicator size="small" color="#2B7FFF" style={{ marginRight: 8 }} />
              ) : (
                <Icon name="fingerprint" size={18} color="#2B7FFF" style={{ marginRight: 6 }} />
              )}
              <Text style={styles.biometricLinkText}>Unlock with biometric</Text>
            </TouchableOpacity>
          ) : null}
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
  biometricLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  biometricLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2B7FFF',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(107, 114, 128, 0.12)',
    borderRadius: radii.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 18,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.textMuted,
  },
  errorBannerPassword: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderLeftColor: colors.danger,
  },
  errorBannerStudentId: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderLeftColor: colors.warning,
  },
  errorBannerIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    fontWeight: '500',
  },
  errorBannerDismiss: {
    padding: 4,
  },
});

export default LoginScreen;

