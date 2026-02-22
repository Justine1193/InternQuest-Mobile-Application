import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { auth } from '../firebase/config';
import { Screen } from '../ui/components/Screen';
import { AppHeader } from '../ui/components/AppHeader';
import { colors, radii, shadows, spacing } from '../ui/theme';
import privacyPolicy from '../docs/privacyPolicy';

type RouteParams = {
  onContinue?: () => void;
  continueLabel?: string;
  requireAcknowledgement?: boolean;
} | undefined;

type Nav = StackNavigationProp<RootStackParamList, 'PrivacyPolicy'>;

export default function PrivacyPolicyScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<Nav>();

  const params: RouteParams = (route?.params && typeof route.params === 'object') ? route.params : undefined;
  const onContinue = params?.onContinue;
  const continueLabel = params?.continueLabel || 'Continue';
  const requireAcknowledgement = params?.requireAcknowledgement === true;

  const [ackChecked, setAckChecked] = useState(false);
  const [ackLoaded, setAckLoaded] = useState(!requireAcknowledgement);
  const alertShownRef = useRef(false);

  const ackKey = useMemo(() => {
    const uid = auth.currentUser?.uid;
    return uid ? `@InternQuest_privacyPolicyAck_${uid}` : null;
  }, []);

  useEffect(() => {
    if (!requireAcknowledgement) return;
    let cancelled = false;
    (async () => {
      try {
        if (!ackKey) return;
        const stored = await AsyncStorage.getItem(ackKey);
        if (!cancelled && stored === 'true') setAckChecked(true);
      } catch (e) {
        // best-effort
      } finally {
        if (!cancelled) setAckLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ackKey, requireAcknowledgement]);

  useEffect(() => {
    if (!requireAcknowledgement) return;
    const unsubscribe = (navigation as any)?.addListener?.('beforeRemove', (e: any) => {
      if (ackChecked) return;
      e.preventDefault();
      if (alertShownRef.current) return;
      alertShownRef.current = true;
      Alert.alert('Action required', 'Please read and accept the Privacy Policy to continue.', [
        { text: 'OK', onPress: () => { alertShownRef.current = false; } },
      ]);
    });
    return unsubscribe;
  }, [navigation, requireAcknowledgement, ackChecked]);

  const paragraphs = useMemo(() => {
    return String(privacyPolicy)
      .split('\n')
      .map((p) => p.trimEnd())
      .filter((p) => p.length > 0);
  }, []);

  return (
    <Screen scroll contentContainerStyle={styles.container}>
      <AppHeader title="Privacy Policy" back />

      <View style={styles.card}>
        {paragraphs.map((p, idx) => (
          <Text key={idx} style={styles.bodyText}>
            {p}
          </Text>
        ))}
      </View>

      {requireAcknowledgement ? (
        <TouchableOpacity
          style={styles.ackRow}
          activeOpacity={0.8}
          onPress={() => setAckChecked((v) => !v)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: ackChecked }}
          accessibilityLabel="I have read and agree to the Privacy Policy"
        >
          <View style={[styles.ackBox, ackChecked && styles.ackBoxChecked]}>
            {ackChecked ? <Icon name="check" size={14} color={colors.onPrimary} /> : null}
          </View>
          <Text style={styles.ackText}>I have read and agree to the Privacy Policy.</Text>
        </TouchableOpacity>
      ) : null}

      {(onContinue || requireAcknowledgement) ? (
        <TouchableOpacity
          style={[
            styles.primaryButton,
            ((requireAcknowledgement && (!ackLoaded || !ackChecked))) ? styles.primaryButtonDisabled : null,
          ]}
          activeOpacity={0.9}
          disabled={requireAcknowledgement ? (!ackLoaded || !ackChecked) : false}
          onPress={async () => {
            if (requireAcknowledgement && (!ackLoaded || !ackChecked)) return;
            try {
              if (requireAcknowledgement && ackKey) {
                try {
                  await AsyncStorage.setItem(ackKey, 'true');
                } catch (e) {
                  // best-effort
                }
              }
              if (onContinue) {
                onContinue();
              }
            } finally {
              // If the caller navigated here as a one-time step, try to avoid leaving this screen stuck.
              if (navigation.canGoBack()) navigation.goBack();
              else (navigation as any).navigate?.('Home');
            }
          }}
          accessibilityRole="button"
          accessibilityLabel={continueLabel}
        >
          <Text style={styles.primaryButtonText}>{continueLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 0,
    paddingBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  bodyText: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
    marginBottom: 10,
  },
  primaryButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: '900',
  },
  ackRow: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  ackBox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    backgroundColor: colors.surface,
  },
  ackBoxChecked: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  ackText: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
});
