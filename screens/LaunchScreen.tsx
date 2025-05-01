import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const LaunchScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/InternQuest.png')} // Make sure the path is correct
        style={styles.logo}
        resizeMode="contain"
      />
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
  },
});
