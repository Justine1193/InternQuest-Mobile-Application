import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebase/config';
import { colors, radii, shadows, spacing } from '../ui/theme';
import { Screen } from '../ui/components/Screen';
import { AppHeader } from '../ui/components/AppHeader';

type Props = {
  navigation: any;
  onPasswordChangeComplete?: () => void;
};

const ForceChangePasswordScreen: React.FC<Props> = ({ navigation, onPasswordChangeComplete }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState<'current' | 'next' | 'confirm' | null>(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const allowExitRef = useRef(false);

  const canSubmit = useMemo(() => {
    return !!currentPassword && !!newPassword && !!confirmNewPassword && !loading;
  }, [currentPassword, newPassword, confirmNewPassword, loading]);

  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('beforeRemove', (e: any) => {
      // Block leaving until password is changed.
      if (allowExitRef.current) return;
      e.preventDefault();
      Alert.alert('Action required', 'Please change your password to continue using the app.');
    });
    return unsubscribe;
  }, [navigation]);

  const handleChangePassword = async () => {
    setError('');

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError('All fields are required.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (!auth.currentUser || !auth.currentUser.email) {
      setError('User not authenticated.');
      return;
    }

    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);

      // Clear the flag so the user can proceed.
      try {
        await setDoc(
          doc(firestore, 'users', auth.currentUser.uid),
          {
            mustChangePassword: false,
            passwordChangedAt: serverTimestamp(),
            passwordStatus: {
              mustChangePassword: false,
              changedAt: serverTimestamp(),
            },
          },
          { merge: true }
        );
      } catch (e) {
        // Best-effort; even if Firestore fails, we still try to proceed.
        console.warn('ForceChangePasswordScreen: failed to update user flag in Firestore', e);
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');

      onPasswordChangeComplete?.();

      // Allow leaving this screen once we have succeeded.
      allowExitRef.current = true;
      // NOTE:
      // We do not navigate/reset here because when `mustChangePassword === true`,
      // App.tsx only registers the ForceChangePassword route in the navigator.
      // The parent (`onPasswordChangeComplete`) will flip the gate and show Home.
    } catch (e: any) {
      let msg = 'Failed to change password.';
      if (e?.code === 'auth/wrong-password') {
        msg = 'Current password is incorrect.';
      } else if (e?.code === 'auth/weak-password') {
        msg = 'New password is too weak.';
      } else if (e?.code === 'auth/too-many-requests') {
        msg = 'Too many attempts. Please try again later.';
      } else if (e?.code === 'auth/requires-recent-login') {
        msg = 'For security reasons, please sign in again, then change your password.';
      } else if (e?.message) {
        msg = e.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <View style={styles.heroBadge}>
          <Icon name="shield-check-outline" size={16} color={stylesBrand.blue} />
          <Text style={styles.heroBadgeText}>Required</Text>
        </View>
        <Text style={styles.title}>Change your password</Text>
        <Text style={styles.subtitle}>
          This is a one-time security step. Please update your password to continue.
        </Text>
      </View>

      <View style={styles.card}>
        {error ? (
          <View style={styles.errorBox}>
            <Icon name="alert-circle-outline" size={18} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Text style={styles.label}>Current password</Text>
        <View style={[styles.field, focused === 'current' && styles.fieldFocused]}>
          <View style={styles.fieldIcon}>
            <Icon name="lock-outline" size={18} color={stylesBrand.blue} />
          </View>
          <TextInput
            style={styles.fieldInput}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry={!showCurrent}
            placeholder="Enter current password"
            placeholderTextColor={colors.textSubtle}
            onFocus={() => setFocused('current')}
            onBlur={() => setFocused(null)}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowCurrent((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={showCurrent ? 'Hide password' : 'Show password'}
          >
            <Icon name={showCurrent ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>New password</Text>
        <View style={[styles.field, focused === 'next' && styles.fieldFocused]}>
          <View style={styles.fieldIcon}>
            <Icon name="shield-lock-outline" size={18} color={stylesBrand.blue} />
          </View>
          <TextInput
            style={styles.fieldInput}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNew}
            placeholder="Create a new password"
            placeholderTextColor={colors.textSubtle}
            onFocus={() => setFocused('next')}
            onBlur={() => setFocused(null)}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowNew((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={showNew ? 'Hide password' : 'Show password'}
          >
            <Icon name={showNew ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>At least 8 characters.</Text>

        <Text style={styles.label}>Confirm new password</Text>
        <View style={[styles.field, focused === 'confirm' && styles.fieldFocused]}>
          <View style={styles.fieldIcon}>
            <Icon name="check-decagram-outline" size={18} color={stylesBrand.blue} />
          </View>
          <TextInput
            style={styles.fieldInput}
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
            secureTextEntry={!showConfirm}
            placeholder="Re-enter new password"
            placeholderTextColor={colors.textSubtle}
            onFocus={() => setFocused('confirm')}
            onBlur={() => setFocused(null)}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleChangePassword}
          />
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowConfirm((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={showConfirm ? 'Hide password' : 'Show password'}
          >
            <Icon name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, (!canSubmit || loading) && styles.primaryButtonDisabled]}
          onPress={handleChangePassword}
          disabled={!canSubmit}
          activeOpacity={0.9}
        >
          {loading ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={styles.primaryButtonText}>Save new password</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.helperText}>
          Tip: the default password provided by the admin is usually required as your current password.
        </Text>
      </View>
    </Screen>
  );
};

const stylesBrand = {
  blue: '#2B7FFF',
};

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  hero: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(43,127,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(43,127,255,0.20)',
    marginBottom: spacing.sm,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: stylesBrand.blue,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    lineHeight: 18,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
    marginHorizontal: spacing.lg,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMuted,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: spacing.md,
  },
  fieldFocused: {
    borderColor: stylesBrand.blue,
    backgroundColor: colors.surface,
  },
  fieldIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(43,127,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  fieldInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    paddingVertical: 0,
  },
  eyeBtn: {
    padding: 8,
    marginRight: -6,
  },
  hint: {
    marginTop: -8,
    marginBottom: spacing.md,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSubtle,
  },
  primaryButton: {
    backgroundColor: stylesBrand.blue,
    height: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: '900',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: radii.md,
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.22)',
    marginBottom: spacing.md,
  },
  errorText: {
    flex: 1,
    color: colors.danger,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  helperText: {
    marginTop: spacing.md,
    color: colors.textSubtle,
    fontSize: 12,
    lineHeight: 16,
  },
});

export default ForceChangePasswordScreen;
