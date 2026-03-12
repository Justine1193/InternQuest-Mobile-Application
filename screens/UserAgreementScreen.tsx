import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../ui/components/Screen';
import { AppHeader } from '../ui/components/AppHeader';
import { colors, radii, shadows, spacing } from '../ui/theme';
import userAgreement from '../docs/userAgreement';

export default function UserAgreementScreen() {
  const paragraphs = useMemo(() => {
    return String(userAgreement)
      .split('\n')
      .map((p) => p.trimEnd())
      .filter((p) => p.length > 0);
  }, []);

  return (
    <Screen scroll contentContainerStyle={styles.container}>
      <AppHeader title="Terms & Conditions" back />

      <View style={styles.card}>
        {paragraphs.map((p, idx) => (
          <Text key={idx} style={styles.bodyText}>
            {p}
          </Text>
        ))}
      </View>
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
});
