import React from 'react';
import { View, Image, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { colors, radii, spacing } from '../ui/theme';

type Props = {
  userEmail?: string | null;
};

const LaunchScreen: React.FC<Props> = ({ userEmail }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerStripe} />
      <Image
        source={require('../assets/InternQuest.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      {userEmail ? (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>Auto-logging in...</Text>
          <Text style={styles.emailText}>{userEmail}</Text>
        </View>
      ) : (
        <Text style={styles.statusText}>Loading...</Text>
      )}
    </View>
  );
};

export default LaunchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  headerStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
    zIndex: -1,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 20,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  loader: {
    marginTop: 18,
  },
  statusContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 12,
    fontWeight: '600',
  },
  emailText: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 8,
    fontWeight: '700',
  },
});
