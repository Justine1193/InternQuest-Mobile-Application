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
  Linking,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavbar from '../components/BottomNav';
import { auth, firestore } from '../firebase/config';
import { doc, setDoc, collection, getDoc, getDocs } from "firebase/firestore";
import * as ImagePicker from 'expo-image-picker';
import * as Progress from 'react-native-progress';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

// Add type for userData
type UserData = {
  status?: string;
  company?: string | null;
  [key: string]: any;
};

const ProfileScreen = ({ navigation }: { navigation: any }) => {
  const [userData, setUserData] = useState<UserData>({});
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showUndoCompany, setShowUndoCompany] = useState(false);
  const [companyModalVisible, setCompanyModalVisible] = useState(false);
  const [companyName, setCompanyName] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedin, setLinkedIn] = useState('');
  const [skills, setSkills] = useState([]);
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [totalHours, setTotalHours] = useState(0);
  const [progress, setProgress] = useState(0);
  const [requiredHours, setRequiredHours] = useState(300);

  const handleSaveProfile = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const userDocRef = doc(firestore, "users", auth.currentUser.uid);
      let displayName = name;
      if (!displayName && userData.firstName && userData.lastName) {
        displayName = userData.firstName + ' ' + userData.lastName;
      }
      const updatedData = {
        ...userData,
        name: displayName,
        email,
        phone,
        contact: phone,
        linkedin,
        skills,
        avatar: userData.avatar || "",
      };
      await setDoc(userDocRef, updatedData, { merge: true });
      setUserData(updatedData);
      Alert.alert('Success', 'Profile updated successfully!');
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile.');
      console.error(error);
    }
    setLoading(false);
  };

  const handleEmailPress = () => {
    if (userData.email) {
      Linking.openURL(`mailto:${userData.email}`);
    } else {
      Alert.alert('Error', 'Email not available.');
    }
  };

  const handlePhonePress = () => {
    const phone = userData.phone || userData.contact;
    if (phone && /^\d{10,}$/.test(phone)) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert('Error', 'Phone number not available or invalid.');
    }
  };

  const handleLinkedInPress = () => {
    if (userData.linkedin) {
      Linking.openURL(userData.linkedin);
    } else {
      Alert.alert('Error', 'LinkedIn profile not available.');
    }
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission required", "Permission to access media library is required!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      if (!auth.currentUser) {
        Alert.alert("Error", "You must be logged in to update your profile picture.");
        return;
      }
      try {
        const localUri = result.assets[0].uri;
        console.log('Selected image URI:', localUri);
        const response = await fetch(localUri);
        const blob = await response.blob();
        const storage = getStorage();
        const fileName = `avatars/${auth.currentUser.uid}_${Date.now()}`;
        const avatarRef = storageRef(storage, fileName);
        console.log('Uploading image to Firebase Storage...');
        await uploadBytes(avatarRef, blob);
        console.log('Getting download URL...');
        const downloadURL = await getDownloadURL(avatarRef);
        console.log('Download URL:', downloadURL);
        // Save to Firestore immediately after upload
        const userDocRef = doc(firestore, "users", auth.currentUser.uid);
        console.log('Saving avatar URL to Firestore...');
        await setDoc(userDocRef, { avatar: downloadURL }, { merge: true });
        console.log('Saved avatar to Firestore!');
        setUserData({ ...userData, avatar: downloadURL });
        setAvatarChanged(true);
        Alert.alert('Success', 'Profile picture updated!');
      } catch (error) {
        Alert.alert('Error', 'Failed to upload profile picture.');
        console.error('Firebase Storage upload error:', error);
        if (error && typeof error === 'object') {
          console.log('Error details:', JSON.stringify(error, null, 2));
        }
      }
    }
  };

  const fetchUserData = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const userDocRef = doc(firestore, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserData(data);
        setName(data.name || "");
        setEmail(data.email || "");
        setPhone(data.contact || data.phone || "");
        setLinkedIn(data.linkedin || "");
        setSkills(data.skills || []);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
    setLoading(false);
  };

  // Fetch OJT logs from Firestore and calculate total hours
  const fetchOJTLogsAndProgress = async () => {
    if (!auth.currentUser) return;
    try {
      const logsCol = collection(firestore, `users/${auth.currentUser.uid}/ojtLogs`);
      const logsSnap = await getDocs(logsCol);
      let sum = 0;
      logsSnap.forEach(doc => {
        const log = doc.data();
        console.log('Fetched log:', log);
        const hours = parseFloat(log.hours);
        if (!isNaN(hours)) sum += hours;
      });
      setTotalHours(sum);
      setProgress(Math.min(sum / requiredHours, 1));
    } catch (error) {
      console.error('Failed to fetch OJT logs:', error);
    }
  };

  // Refresh OJT data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        await loadRequiredHours();
        await fetchOJTLogsAndProgress();
      };
      loadData();
    }, [])
  );

  // Update loadRequiredHours to be reusable
  const loadRequiredHours = async () => {
    const savedGoal = await AsyncStorage.getItem('OJT_REQUIRED_HOURS');
    if (savedGoal) setRequiredHours(Number(savedGoal));
  };

  // Remove the old useEffect that loads data
  useEffect(() => {
    fetchUserData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  };

  // Update company status and details
  const handleCompanyUpdate = async () => {
    if (!auth.currentUser) return;
    try {
      const userDocRef = doc(firestore, "users", auth.currentUser.uid);
      await setDoc(userDocRef, {
        status: 'hired',
        company: companyName
      }, { merge: true });

      setUserData((prev: UserData) => ({
        ...prev,
        status: 'hired',
        company: companyName
      }));
      setShowUndoCompany(true);
      setTimeout(() => setShowUndoCompany(false), 5000);
      setCompanyModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update company details');
    }
  };

  // Handle undo company status
  const handleUndoCompany = async () => {
    if (!auth.currentUser) return;
    try {
      const userDocRef = doc(firestore, "users", auth.currentUser.uid);
      await setDoc(userDocRef, {
        status: 'searching',
        company: null
      }, { merge: true });
      setUserData((prev: UserData) => ({
        ...prev,
        status: 'searching',
        company: null
      }));
      setShowUndoCompany(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to undo status');
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.header}>Profile</Text>

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {userData.avatar ? (
              <Image source={{ uri: userData.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#eee' }]}>
                <Ionicons name="person-circle" size={100} color="#bbb" />
              </View>
            )}
          </View>
          <Text style={styles.name}>{userData.name || (userData.firstName && userData.lastName ? userData.firstName + ' ' + userData.lastName : '')}</Text>
          <Text style={styles.subtext}>{userData.course}</Text>
          {/* Show company if hired */}
          {userData.status === 'hired' && userData.company && (
            <Text style={styles.subtext}>Company: {userData.company}</Text>
          )}
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: '#007bff', flexDirection: 'row', alignItems: 'center' }]}
            onPress={() => navigation.navigate('OJTTracker')}
            activeOpacity={0.7}
          >
            <Ionicons name="time-outline" size={24} color="#fff" style={{ marginRight: 10 }} />
            <View>
              <Text style={[styles.statLabel, { color: '#fff' }]}>Remaining Hours</Text>
              <Text style={[styles.statValue, { color: '#fff' }]}>{Math.max(0, requiredHours - totalHours)} hours</Text>
            </View>
          </TouchableOpacity>
          <View style={[styles.statCard, { backgroundColor: '#007bff', flexDirection: 'row', alignItems: 'center' }]}>
            <Ionicons name="business-outline" size={24} color="#fff" style={{ marginRight: 10 }} />
            <View>
              <Text style={[styles.statLabel, { color: '#fff' }]}>Company</Text>
              <Text style={[styles.statValue, { color: '#fff' }]}>
                {userData.status === 'hired' ? userData.company || 'Not Set' : 'Not Hired'}
              </Text>
              {userData.status === 'hired' && (
                <TouchableOpacity
                  style={styles.undoButton}
                  onPress={handleUndoCompany}
                >
                  <Ionicons name="arrow-undo-outline" size={18} color="#007bff" />
                  <Text style={styles.undoButtonText}>Undo</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Internship Progress Section */}
        <View style={styles.progressContainer}>
          <Text style={styles.sectionHeader}>Internship Progress</Text>
          <Progress.Bar
            progress={progress}
            width={null}
            height={20}
            color="#0080ff"
            unfilledColor="#e0e0e0"
            borderRadius={10}
            borderWidth={0}
          />
          <Text style={styles.progressText}>
            {totalHours} hrs / {requiredHours} hrs ({Math.round(progress * 100)}% completed)
          </Text>
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
            <Text style={[styles.detailValue, styles.link]}>{userData.contact}</Text>
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

      {/* Company Details Modal */}
      <Modal
        visible={companyModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCompanyModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>
              {userData.status === 'hired' ? 'Update Company' : 'Add Company'}
            </Text>

            <Text style={styles.label}>Company Name</Text>
            <TextInput
              style={styles.input}
              value={companyName}
              onChangeText={setCompanyName}
              placeholder="Enter company name"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setCompanyModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleCompanyUpdate}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Undo Company Snackbar */}
      {showUndoCompany && (
        <View style={styles.undoSnackbar}>
          <Text style={styles.undoSnackbarText}>Company status updated</Text>
          <TouchableOpacity onPress={handleUndoCompany}>
            <Text style={styles.undoSnackbarButton}>UNDO</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Navbar */}
      <BottomNavbar navigation={navigation} currentRoute="Profile" />
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
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editAvatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 16,
    padding: 4,
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
    justifyContent: 'space-between',
    alignItems: 'stretch',
    marginVertical: 28,
  },
  statCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  statLabel: {
    fontSize: 16,
    color: '#888',
  },
  statValue: {
    fontSize: 20,
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
  undoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#e6f0ff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007bff',
    alignSelf: 'flex-start',
  },
  undoButtonText: {
    color: '#007bff',
    fontWeight: 'bold',
    fontSize: 13,
    marginLeft: 6,
  },
  undoSnackbar: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: '#333',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    elevation: 5,
  },
  undoSnackbarText: {
    color: '#fff',
  },
  undoSnackbarButton: {
    color: '#fff',
    fontWeight: 'bold',
  },
  companyText: {
    color: '#007aff',
    textDecorationLine: 'underline',
  },
});

export default ProfileScreen;
