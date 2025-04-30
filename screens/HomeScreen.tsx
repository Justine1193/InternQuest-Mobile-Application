import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import BottomNavbar from '../components/BottomNav'; // Ensure BottomNavbar is imported
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Image
            source={{ uri: 'https://img.icons8.com/color/48/000000/user-male-circle--v1.png' }}
            style={styles.profileIcon}
          />
          <Text style={styles.title}>InternQuest</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Image
              source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/menu--v1.png' }}
              style={styles.menuIcon}
            />
          </TouchableOpacity>
        </View>

        {/* Post Cards */}
        {[...Array(5)].map((_, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.cardHeader}>
              <Image
                source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/company.png' }}
                style={styles.companyLogo}
              />
              <View>
                <Text style={styles.companyName}>Company {index + 1}</Text>
                <Text style={styles.followers}>1,350 followers</Text>
              </View>
            </View>
            <Text style={styles.postText}>
              At Company {index + 1}, we value growth and innovation in all aspects of technology...
            </Text>
            <Image
              source={{ uri: 'https://via.placeholder.com/300x150' }}
              style={styles.postImage}
            />
            <Text style={styles.reactions}>😍👏🔥 200</Text>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Navbar */}
      <BottomNavbar navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 16 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  menuIcon: {
    width: 24,
    height: 24,
  },
  card: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  companyLogo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  companyName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  followers: {
    fontSize: 12,
    color: '#666',
  },
  postText: {
    fontSize: 14,
    marginBottom: 12,
    color: '#333',
  },
  postImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  reactions: {
    fontSize: 14,
    color: '#888',
  },
});

export default HomeScreen;
