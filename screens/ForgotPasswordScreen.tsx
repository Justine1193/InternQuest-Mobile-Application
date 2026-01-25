import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { sendPasswordResetEmail } from 'firebase/auth';
import type { RootStackParamList } from '../App';
import { auth } from '../firebase/config';
import { SecurityUtils } from '../services/security';
import { colors, radii, spacing } from '../ui/theme';
import { Screen } from '../ui/components/Screen';

type Nav = StackNavigationProp<RootStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<any>();

  const initialEmail = (route?.params?.email && typeof route.params.email === 'string') ? route.params.email : '';

  const [email, setEmail] = useState(initialEmail);
  const [focused, setFocused] = useState<'email' | null>(null);
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const canSubmit = useMemo(() => !!email && !loading, [loading, email]);

  const handleSend = async () => {
    const value = SecurityUtils.sanitizeInput(email);
    if (!value) {
      Alert.alert('Missing Email', 'Please enter your email address.');
      return;
    }

    if (!isValidEmail(value)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const emailTrimmed = value.trim().toLowerCase();
      await sendPasswordResetEmail(auth, emailTrimmed);
      setSentTo(emailTrimmed);

      Alert.alert(
        'Reset link sent',
        `We sent a password reset link to ${emailTrimmed}.\n\nIf you don’t see it within a few minutes, please check your Spam email.`
      );
    } catch (e: any) {
      const code = e?.code ?? '';
      const friendly =
        code === 'auth/invalid-email'
          ? 'Please enter a valid email address.'
          : code === 'auth/user-not-found'
            ? 'No account was found for this email address.'
            : code === 'auth/network-request-failed'
              ? 'Network error. Please check your internet connection and try again.'
              : '';

      const fallback = e?.message || 'Failed to send the reset email. Please try again.';
      Alert.alert('Password Reset Failed', friendly || (code ? `${fallback}\n\n(${code})` : fallback));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.bg}>
      <View style={styles.bgCircle1} pointerEvents="none" />
      <View style={styles.bgCircle2} pointerEvents="none" />

      <Screen scroll style={styles.screen} contentContainerStyle={styles.container}>
        <View style={styles.stack}>
          <View style={styles.header}>
            <View style={styles.topRow}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Icon name="arrow-left" size={22} color={colors.white} />
              </TouchableOpacity>
              <View style={styles.topRowSpacer} />
            </View>

            <View style={styles.logoOuter}>
              <View style={styles.logoInner}>
                <Image source={require('../assets/ship.png')} style={styles.logo} resizeMode="contain" />
              </View>
            </View>

            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>We’ll send a reset link to your registered email address.</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.fieldRow}>
              <View style={[styles.bubble, focused === 'email' && styles.bubbleFocused]}>
                <Icon name="email-outline" size={20} color={colors.primary} />
              </View>
              <View style={[styles.pill, focused === 'email' && styles.pillFocused]}>
                <TextInput
                  style={styles.pillInput}
                  placeholder="Email address"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholderTextColor={colors.textSubtle}
                  autoCorrect={false}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  accessibilityLabel="Email address"
                  returnKeyType="done"
                  onSubmitEditing={handleSend}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSend} disabled={!canSubmit}>
              {loading ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={styles.buttonText}>Send reset link</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.note}>
              If you don’t see the email within a few minutes, please check your Spam email.
            </Text>

            {sentTo ? (
              <View style={styles.successWrap}>
                <Icon name="check-circle" size={18} color="#16a34a" />
                <Text style={styles.successText} numberOfLines={2}>
                  Reset link sent to {sentTo}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </Screen>
    </View>
  );
}

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
    transform: [{ translateY: -34 }],
  },
  header: {
    alignItems: 'center',
    marginBottom: 18,
  },
  topRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  topRowSpacer: { flex: 1 },
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
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  card: {
    width: '100%',
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
  note: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(11,43,52,0.55)',
    lineHeight: 16,
  },
  successWrap: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  successText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(11,43,52,0.75)',
  },
});

