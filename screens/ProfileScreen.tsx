import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Linking, // Add this import
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavbar from '../components/BottomNav';
import { auth, db } from '../firebase/config';
import { ref, onValue, update } from 'firebase/database';
import * as Progress from 'react-native-progress';

const ProfileScreen = ({ navigation }: { navigation: any }) => {
  const [userData, setUserData] = useState<any>({
    name: 'John Doe',
    email: 'johndoe@example.com',
    phone: '+1234567890',
    linkedin: 'https://linkedin.com/in/johndoe',
    skills: ['React Native', 'Firebase', 'JavaScript'],
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
    course: 'BS Computer Science',
    hours: 120,
    company: 'TechCorp',
    startDate: 'April 01, 2025',
    endDate: 'June 30, 2025',
    progress: 0.4,
  });
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [name, setName] = useState(userData.name);
  const [email, setEmail] = useState(userData.email);
  const [phone, setPhone] = useState(userData.phone);
  const [linkedin, setLinkedIn] = useState(userData.linkedin);
  const [skills, setSkills] = useState(userData.skills);

  const handleSaveProfile = () => {
    const updatedData = {
      ...userData,
      name,
      email,
      phone,
      linkedin,
      skills,
    };
    setUserData(updatedData);
    Alert.alert('Success', 'Profile updated successfully!');
    setModalVisible(false);
  };

  const handleEmailPress = () => {
    if (userData.email) {
      Linking.openURL(`mailto:${userData.email}`);
    } else {
      Alert.alert('Error', 'Email not available.');
    }
  };

  const handlePhonePress = () => {
    if (userData.phone) {
      Linking.openURL(`tel:${userData.phone}`);
    } else {
      Alert.alert('Error', 'Phone number not available.');
    }
  };

  const handleLinkedInPress = () => {
    if (userData.linkedin) {
      Linking.openURL(userData.linkedin);
    } else {
      Alert.alert('Error', 'LinkedIn profile not available.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007aff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Profile</Text>

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: userData.avatar }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{userData.name}</Text>
          <Text style={styles.subtext}>{userData.course}</Text>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Hours</Text>
            <Text style={styles.statValue}>{userData.hours} hours</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Company</Text>
            <Text style={styles.statValue}>{userData.company}</Text>
          </View>
        </View>

        {/* Progress Section */}
        <View style={styles.progressContainer}>
          <Text style={styles.sectionHeader}>Internship Progress</Text>
          <Text style={styles.detailLabel}>Start Date:</Text>
          <Text style={styles.detailValue}>{userData.startDate}</Text>

          <Text style={styles.detailLabel}>End Date:</Text>
          <Text style={styles.detailValue}>{userData.endDate}</Text>

          <View style={styles.progressBarContainer}>
            <Progress.Bar
              progress={userData.progress}
              width={null}
              height={20}
              color="#0080ff"
              unfilledColor="#e0e0e0"
              borderRadius={10}
              borderWidth={0}
            />
            <Text style={styles.progressText}>
              Progress: {Math.round(userData.progress * 100)}% goal completed
            </Text>
          </View>
        </View>

        {/* Work Details Section */}
        <View style={styles.workDetails}>
          <Text style={styles.sectionHeader}>Work Details</Text>
          <Text style={styles.detailLabel}>Email:</Text>
          <TouchableOpacity onPress={handleEmailPress}>
            <Text style={[styles.detailValue, styles.link]}>{userData.email}</Text>
          </TouchableOpacity>

          <Text style={styles.detailLabel}>Phone:</Text>
          <TouchableOpacity onPress={handlePhonePress}>
            <Text style={[styles.detailValue, styles.link]}>{userData.phone}</Text>
          </TouchableOpacity>

          <Text style={styles.detailLabel}>LinkedIn:</Text>
          <TouchableOpacity onPress={handleLinkedInPress}>
            <Text style={[styles.detailValue, styles.link]}>{userData.linkedin}</Text>
          </TouchableOpacity>
        </View>

        {/* Edit Profile Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="pencil" size={20} color="#fff" />
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Edit Profile</Text>

            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
            />

            <Text style={styles.label}>LinkedIn</Text>
            <TextInput
              style={styles.input}
              value={linkedin}
              onChangeText={setLinkedIn}
            />

            {/* Save and Cancel Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveProfile}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Navbar */}
      <BottomNavbar navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 30,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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
  workDetails: {
    marginTop: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
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
  progressContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  progressBarContainer: {
    marginTop: 10,
  },
  progressText: {
    marginTop: 10,
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007aff',
    paddingVertical: 12,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    marginLeft: 10,
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    fontSize: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#007aff',
  },
  cancelButton: {
    backgroundColor: '#d9534f',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    color: '#444',
    marginBottom: 5,
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  link: {
    color: '#007aff',
    textDecorationLine: 'underline',
  },
});

export default ProfileScreen;
