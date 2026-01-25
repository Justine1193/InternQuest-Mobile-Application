import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radii } from '../ui/theme';

type Props = {
  style?: StyleProp<ViewStyle>;
};

export default function MapPreview({ style }: Props) {
  return (
    <View style={[styles.fallback, style]}>
      <Text style={styles.text}>Map preview unavailable on web</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.lg,
  },
  text: {
    color: colors.textMuted,
    fontSize: 13,
  },
});

