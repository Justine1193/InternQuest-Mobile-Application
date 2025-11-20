import React from 'react';
import { View, Image, StyleSheet, Text, ActivityIndicator } from 'react-native';

type Props = {
  userEmail?: string | null;
};

const LaunchScreen: React.FC<Props> = ({ userEmail }) => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/InternQuest.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color="#0077cc" style={styles.loader} />
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
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  loader: {
    marginTop: 20,
  },
  statusContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    fontWeight: '500',
  },
  emailText: {
    fontSize: 14,
    color: '#0077cc',
    marginTop: 8,
    fontWeight: '600',
  },
});
