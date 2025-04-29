import { View, Text, StyleSheet } from 'react-native';

export default function Navbar() {
  return (
    <View style={styles.navbar}>
      <Text style={styles.logo}>InternQuest</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    height: 60,
    backgroundColor: '#0077B6',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  logo: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
