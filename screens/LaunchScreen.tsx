import React from 'react';
import { View, Image, StyleSheet, Text, ActivityIndicator } from 'react-native';

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
      <ActivityIndicator size="large" color="#6366F1" style={styles.loader} />
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
    backgroundColor: '#f2f6ff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    backgroundColor: '#6366F1',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    zIndex: -1,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 20,
    borderRadius: 18,
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
    color: '#374151',
    marginTop: 12,
    fontWeight: '600',
  },
  emailText: {
    fontSize: 14,
    color: '#6366F1',
    marginTop: 8,
    fontWeight: '700',
  },
});
