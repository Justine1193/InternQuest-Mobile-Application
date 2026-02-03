import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { authenticate } from '../services/biometric';
import { colors, radii, spacing } from '../ui/theme';

type Props = {
  onSuccess: () => void;
  promptMessage?: string;
};

/**
 * Shown when user has auto-logged in but biometric is enabled.
 * Stays on this screen until the user passes biometric, then calls onSuccess() to go to the app.
 */
const BiometricGateScreen: React.FC<Props> = ({ onSuccess, promptMessage = 'Unlock to continue' }) => {
  const [prompting, setPrompting] = useState(false);
  const hasTriggered = useRef(false);

  const runBiometric = async () => {
    if (prompting) return;
    setPrompting(true);
    try {
      const success = await authenticate(promptMessage);
      if (success) onSuccess();
    } finally {
      setPrompting(false);
    }
  };

  useEffect(() => {
    if (hasTriggered.current) return;
    hasTriggered.current = true;
    runBiometric();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Icon name="fingerprint" size={64} color={colors.primary} />
        </View>
        <Text style={styles.title}>Verify your identity</Text>
        <Text style={styles.message}>
          Use your fingerprint or face to unlock and continue to the app.
        </Text>
        {prompting ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : (
          <TouchableOpacity style={styles.button} onPress={runBiometric} activeOpacity={0.85}>
            <Icon name="fingerprint" size={24} color={colors.onPrimary} style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Unlock with biometric</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl * 2,
    alignItems: 'center',
    maxWidth: 340,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  loader: {
    marginVertical: spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: radii.md,
    width: '100%',
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onPrimary,
  },
});

export default BiometricGateScreen;
