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
import { EmailAuthProvider, reauthenticateWithCredential, signOut, updatePassword } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebase/config';
import { colors, radii, shadows, spacing } from '../ui/theme';

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

      // Reset navigation to the main app.
      try {
        navigation?.reset?.({ index: 0, routes: [{ name: 'Home' }] });
      } catch (e) {
        // Fallback: attempt navigate
        try { navigation?.navigate?.('Home'); } catch (_) { /* ignore */ }
      }
    } catch (e: any) {
      let msg = 'Failed to change password.';
      if (e?.code === 'auth/wrong-password') {
        msg = 'Current password is incorrect.';
      } else if (e?.code === 'auth/weak-password') {
        msg = 'New password is too weak.';
      } else if (e?.code === 'auth/too-many-requests') {
        msg = 'Too many attempts. Please try again later.';
      } else if (e?.code === 'auth/requires-recent-login') {
        Alert.alert(
          'Sign in required',
          'For security reasons, please sign in again, then change your password.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Sign Out',
              style: 'destructive',
              onPress: async () => {
                try { await signOut(auth); } catch (_) { /* ignore */ }
              },
            },
          ]
        );
        msg = 'Please sign in again to change your password.';
      } else if (e?.message) {
        msg = e.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerIconWrap}>
          <Icon name="shield-lock-outline" size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Change your password</Text>
          <Text style={styles.subtitle}>Required one-time security step to continue.</Text>
        </View>
      </View>

      <View style={styles.card}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Text style={styles.label}>Current Password</Text>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          placeholder="Enter current password"
        />

        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          placeholder="Enter new password"
        />

        <Text style={styles.label}>Confirm New Password</Text>
        <TextInput
          style={styles.input}
          value={confirmNewPassword}
          onChangeText={setConfirmNewPassword}
          secureTextEntry
          placeholder="Confirm new password"
        />

        <TouchableOpacity
          style={[styles.primaryButton, (!canSubmit || loading) && styles.primaryButtonDisabled]}
          onPress={handleChangePassword}
          disabled={!canSubmit}
        >
          {loading ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={styles.primaryButtonText}>Save New Password</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => {
            Alert.alert(
              'Sign out?',
              'You must change your password to continue. Signing out will bring you back to the sign-in screen.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Sign Out',
                  style: 'destructive',
                  onPress: async () => {
                    try { await signOut(auth); } catch (_) { /* ignore */ }
                  },
                },
              ]
            );
          }}
          disabled={loading}
        >
          <Text style={styles.secondaryButtonText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.helperText}>
          Tip: the default password provided by the admin is usually required as your current password.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xl,
    paddingTop: 56,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 14,
    color: colors.textMuted,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 12,
    marginBottom: spacing.md,
    fontSize: 16,
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radii.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: spacing.md,
    paddingVertical: 12,
    borderRadius: radii.md,
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginBottom: spacing.md,
  },
  helperText: {
    marginTop: spacing.md,
    color: colors.textSubtle,
    fontSize: 12,
    lineHeight: 16,
  },
});

export default ForceChangePasswordScreen;
