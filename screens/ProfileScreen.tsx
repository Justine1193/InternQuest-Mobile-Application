import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Linking, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavbar from '../components/BottomNav';
import * as Progress from 'react-native-progress';

declare global {
  interface User {
    name?: string;
  }
  var user: User | undefined;
}

const ProfileScreen = ({ navigation }: { navigation: any }) => {
  const handleAchievementClick = (achievement: string) => {
    Alert.alert('Achievement Details', `You clicked on: ${achievement}`);
  };

  const handleEditProfile = () => {
    Alert.alert(
      'Edit Profile',
      'Are you sure you want to edit your profile?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: () => navigation.navigate('EditProfile') },
      ]
    );
  };

  const handleEmailClick = () => {
    Linking.openURL('mailto:google@gmail.com');
  };

  const handlePhoneClick = () => {
    Linking.openURL('tel:+1234567890');
  };

  const handleLinkedInClick = () => {
    Linking.openURL('https://linkedin.com/in/ashleywatson');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/men/75.jpg' }}
            style={styles.avatar}
          />
          <Text style={styles.name}>
            {globalThis.user?.name || 'Ashley Watson'}
          </Text>
          <Text style={styles.subtext}>BSIT</Text>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Hours</Text>
            <Text style={styles.statValue}>36 hours</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Company</Text>
            <Text style={styles.statValue}>Google</Text>
          </View>
        </View>

        {/* Progress Section */}
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionHeader}>Internship Progress</Text>
          <Text style={styles.detailLabel}>Start Date:</Text>
          <Text style={styles.detailValue}>April 01, 2025</Text>

          <Text style={styles.detailLabel}>End Date:</Text>
          <Text style={styles.detailValue}>June 11, 2025</Text>

          <View style={styles.progressBarContainer}>
            <Progress.Bar
              progress={0.08}
              width={null}
              height={20}
              color="#0080ff"
              unfilledColor="#e0e0e0"
              borderRadius={10}
              borderWidth={0}
            />
            <Text style={styles.progressText}>Progress: 8% goal completed</Text>
          </View>
        </View>

        {/* Work Details Section */}
        <View style={styles.workDetails}>
          <Text style={styles.sectionHeader}>Work Details</Text>
          <Text style={styles.detailLabel}>Company Name:</Text>
          <Text style={styles.detailValue}>Google</Text>

          <Text style={styles.detailLabel}>Company Website:</Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://google.com')}>
            <Text style={[styles.detailValue, styles.link]}>Google Inc.</Text>
          </TouchableOpacity>

          <Text style={styles.detailLabel}>Worked Field:</Text>
          <Text style={styles.detailValue}>Programmer</Text>

          <Text style={styles.detailLabel}>Email:</Text>
          <TouchableOpacity onPress={handleEmailClick}>
            <Text style={[styles.detailValue, styles.link]}>google@gmail.com</Text>
          </TouchableOpacity>

          <Text style={styles.detailLabel}>Phone:</Text>
          <TouchableOpacity onPress={handlePhoneClick}>
            <Text style={[styles.detailValue, styles.link]}>+1 234 567 890</Text>
          </TouchableOpacity>

          <Text style={styles.detailLabel}>LinkedIn:</Text>
          <TouchableOpacity onPress={handleLinkedInClick}>
            <Text style={[styles.detailValue, styles.link]}>linkedin.com/in/ashleywatson</Text>
          </TouchableOpacity>
        </View>

        {/* Achievements Section */}
        <View style={styles.achievementsContainer}>
          <Text style={styles.sectionHeader}>Achievements</Text>
          <TouchableOpacity onPress={() => handleAchievementClick('Completed 100 hours of internship')}>
            <View style={styles.achievementItem}>
              <Ionicons name="trophy" size={20} color="#FFD700" />
              <Text style={styles.achievementText}>Completed 100 hours of internship</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleAchievementClick('Received Outstanding Intern Award')}>
            <View style={styles.achievementItem}>
              <Ionicons name="medal" size={20} color="#C0C0C0" />
              <Text style={styles.achievementText}>Received Outstanding Intern Award</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Edit Profile Button */}
        <TouchableOpacity
          style={styles.editProfileButton}
          onPress={handleEditProfile}
        >
          <Ionicons name="pencil" size={20} color="#fff" />
          <Text style={styles.editProfileButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navbar */}
      <BottomNavbar navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 30
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginVertical: 25,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  name: {
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: 20,
  },
  subtext: {
    fontSize: 14,
    color: '#777',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  statCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    width: '40%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  detailsContainer: {
    marginTop: 20,
    marginBottom: 25,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  detailLabel: {
    fontSize: 14,
    color: '#444',
    marginTop: 10,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  progressBarContainer: {
    marginVertical: 25,
    paddingHorizontal: 10,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#555',
    marginTop: 10,
  },
  workDetails: {
    marginTop: 20,
    marginBottom: 30,
  },
  link: {
    color: '#0080ff',
    textDecorationLine: 'underline',
  },
  achievementsContainer: {
    marginTop: 25,
    marginBottom: 30,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  achievementText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#444',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007aff',
    padding: 12,
    borderRadius: 5,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  editProfileButtonText: {
    marginLeft: 10,
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
