import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii, shadows } from '../theme';

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
  /**
   * Hero style: primary background, rounded bottom, white text.
   * Use for main tab screens (Settings, Profile, Resources).
   */
  variant?: 'default' | 'hero';
};

export function AppHeader({ title, subtitle, back, right, tone = 'dark', variant = 'default' }: Props) {
  const navigation = useNavigation<any>();
  const isLight = tone === 'light' || variant === 'hero';

  const wrapStyle = [styles.wrap, variant === 'hero' && styles.wrapHero];
  const titleStyle = [styles.title, isLight && styles.titleLight];
  const subtitleStyle = [styles.subtitle, isLight && styles.subtitleLight];

  return (
    <View style={wrapStyle}>
      <View style={styles.left}>
        {back ? (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backTouch}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color={isLight ? colors.white : colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.leftSpacer} />
        )}
      </View>

      <View style={styles.center}>
        <Text style={titleStyle} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={subtitleStyle} numberOfLines={1}>
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
    paddingTop: spacing.xs,
  },
  wrapHero: {
    backgroundColor: 'transparent',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 18,
  },
  backTouch: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: colors.info,
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
    color: colors.onPrimaryMuted,
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

