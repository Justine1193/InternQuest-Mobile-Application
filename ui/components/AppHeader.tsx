import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '../theme';

type Props = {
  title: string;
  subtitle?: string;
  /**
   * Shows a back button that calls navigation.goBack().
   * Use for detail pages and modal-ish flows.
   */
  back?: boolean;
  right?: React.ReactNode;
  tone?: 'dark' | 'light';
};

export function AppHeader({ title, subtitle, back, right, tone = 'dark' }: Props) {
  const navigation = useNavigation<any>();
  const isLight = tone === 'light';

  return (
    <View style={styles.wrap}>
      <View style={styles.left}>
        {back ? (
          <IconButton
            icon="arrow-left"
            size={22}
            iconColor={isLight ? colors.white : colors.text}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
          />
        ) : (
          <View style={styles.leftSpacer} />
        )}
      </View>

      <View style={styles.center}>
        <Text style={[styles.title, isLight && styles.titleLight]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, isLight && styles.subtitleLight]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.right}>{right ?? <View style={styles.rightSpacer} />}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  left: {
    width: 48,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  leftSpacer: {
    width: 48,
    height: 48,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  titleLight: {
    color: colors.white,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  subtitleLight: {
    color: colors.onPrimarySubtle,
  },
  right: {
    width: 48,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  rightSpacer: {
    width: 48,
    height: 48,
  },
});

