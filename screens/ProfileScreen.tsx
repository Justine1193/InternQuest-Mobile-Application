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
// removed `react-native-progress` dependency and use a simple native progress bar instead
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

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

  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState('');
  const [changePasswordSuccess, setChangePasswordSuccess] = useState('');

  const [avatarUploading, setAvatarUploading] = useState(false);

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
      console.error('handleSaveProfile failed:', error);
      try {
        if (auth.currentUser) {
          await setDoc(doc(firestore, 'users', auth.currentUser.uid), { lastProfileUpdateError: { time: new Date().toISOString(), message: String(error) } }, { merge: true });
          console.log('ProfileScreen: wrote lastProfileUpdateError to user doc');
        }
      } catch (diagErr) {
        console.warn('ProfileScreen: failed to write lastProfileUpdateError for user:', diagErr);
      }
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
        setAvatarUploading(true);
        const localUri = result.assets[0].uri;
        // Convert to blob (ScanConnect style)
        const response = await fetch(localUri);
        const blob = await response.blob();
        // Upload to Firebase Storage
        const storage = getStorage();
        const fileName = `avatars/${auth.currentUser.uid}`;
        const avatarRef = storageRef(storage, fileName);
        await uploadBytes(avatarRef, blob);
        // Get download URL
        const downloadURL = await getDownloadURL(avatarRef);
        // Save to Firestore
        const userDocRef = doc(firestore, "users", auth.currentUser.uid);
        await setDoc(userDocRef, { avatar: downloadURL }, { merge: true });
        setUserData({ ...userData, avatar: downloadURL });
        setAvatarChanged(true);
        Alert.alert('Success', 'Profile picture updated!');
      } catch (error) {
        Alert.alert('Error', 'Failed to upload profile picture.');
        console.error('Firebase Storage upload error:', error);
        try {
          if (auth.currentUser) {
            await setDoc(doc(firestore, 'users', auth.currentUser.uid), { lastAvatarUploadError: { time: new Date().toISOString(), message: String(error) } }, { merge: true });
            console.log('ProfileScreen: wrote lastAvatarUploadError to user doc');
          }
        } catch (diagErr) {
          console.warn('ProfileScreen: failed to write lastAvatarUploadError for user:', diagErr);
        }
      } finally {
        setAvatarUploading(false);
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
        // Prefer firstName + lastName if available, else fallback to name
        const displayName = (data.firstName && data.lastName)
          ? `${data.firstName} ${data.lastName}`
          : (data.name || "");
        setName(displayName);
        setEmail(data.email || "");
        setPhone(data.contact || data.phone || "");
        setLinkedIn(data.linkedin || "");
        setSkills(data.skills || []);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      try {
        if (auth.currentUser) {
          await setDoc(doc(firestore, 'users', auth.currentUser.uid), { lastProfileFetchError: { time: new Date().toISOString(), message: String(error) } }, { merge: true });
          console.log('ProfileScreen: wrote lastProfileFetchError to user doc');
        }
      } catch (diagErr) {
        console.warn('ProfileScreen: failed to write lastProfileFetchError for user:', diagErr);
      }
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
      logsSnap.forEach((doc: any) => {
        const log: any = doc.data();
        console.log('Fetched log:', log);
        const hours = parseFloat(log.hours);
        if (!isNaN(hours)) sum += hours;
      });
      setTotalHours(sum);
      setProgress(Math.min(sum / requiredHours, 1));
    } catch (error) {
      console.error('Failed to fetch OJT logs:', error);
      try {
        if (auth.currentUser) {
          await setDoc(doc(firestore, 'users', auth.currentUser.uid), { lastOjtLogsFetchError: { time: new Date().toISOString(), message: String(error) } }, { merge: true });
          console.log('ProfileScreen: wrote lastOjtLogsFetchError to user doc');
        }
      } catch (diagErr) {
        console.warn('ProfileScreen: failed to write lastOjtLogsFetchError for user:', diagErr);
      }
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
      console.error('handleCompanyUpdate failed:', error);
      try {
        if (auth.currentUser) {
          await setDoc(doc(firestore, 'users', auth.currentUser.uid), { lastCompanyUpdateError: { time: new Date().toISOString(), message: String(error) } }, { merge: true });
          console.log('ProfileScreen: wrote lastCompanyUpdateError to user doc');
        }
      } catch (diagErr) {
        console.warn('ProfileScreen: failed to write lastCompanyUpdateError for user:', diagErr);
      }
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
      console.error('handleUndoCompany failed:', error);
      try {
        if (auth.currentUser) {
          await setDoc(doc(firestore, 'users', auth.currentUser.uid), { lastCompanyUndoError: { time: new Date().toISOString(), message: String(error) } }, { merge: true });
          console.log('ProfileScreen: wrote lastCompanyUndoError to user doc');
        }
      } catch (diagErr) {
        console.warn('ProfileScreen: failed to write lastCompanyUndoError for user:', diagErr);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
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
        {/* Profile Header Card */}
        <View style={styles.headerCardShadow}>
          <View style={styles.headerCard}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={handlePickImage}
              accessibilityLabel="Edit profile picture"
              accessibilityRole="button"
              activeOpacity={0.7}
            >
              {userData.avatar ? (
                <Image source={{ uri: userData.avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#eee' }]}>
                  <Ionicons name="person-circle" size={100} color="#bbb" />
                </View>
              )}
              {/* Edit Icon Overlay */}
              <View style={styles.editIconOverlay}>
                {avatarUploading ? (
                  <ActivityIndicator size="small" color="#6366F1" />
                ) : (
                  <Ionicons name="camera" size={28} color="#fff" style={styles.editIcon} />
                )}
              </View>
            </TouchableOpacity>
            <Text style={styles.name}>{userData.name || (userData.firstName && userData.lastName ? userData.firstName + ' ' + userData.lastName : '')}</Text>
            <Text style={styles.subtext}>{userData.course}</Text>
            {userData.status === 'hired' && userData.company && (
              <Text style={styles.subtext}>Company: {userData.company}</Text>
            )}
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={24} color="#6366F1" style={{ marginBottom: 4 }} />
            <Text style={styles.statLabel}>Remaining Hours</Text>
            <Text style={styles.statValue}>{Math.max(0, requiredHours - totalHours)} hrs</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="business-outline" size={24} color="#6366F1" style={{ marginBottom: 4 }} />
            <Text style={styles.statLabel}>Company</Text>
            <Text style={styles.statValue}>{userData.status === 'hired' ? userData.company || 'Not Set' : 'Not Hired'}</Text>
          </View>
        </View>

        {/* Internship Progress Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Internship Progress</Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBackground}>
              <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
            </View>
          </View>
          <Text style={styles.progressText}>
            {totalHours} hrs / {requiredHours} hrs ({Math.round(progress * 100)}% completed)
          </Text>
        </View>

        {/* Contact & Details Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Contact & Details</Text>
          <TouchableOpacity style={styles.detailRow} onPress={handleEmailPress} activeOpacity={0.7}>
            <Ionicons name="mail-outline" size={20} color="#6366F1" style={styles.detailIcon} />
            <Text style={styles.detailValue}>{userData.email}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.detailRow} onPress={handlePhonePress} activeOpacity={0.7}>
            <Ionicons name="call-outline" size={20} color="#6366F1" style={styles.detailIcon} />
            <Text style={styles.detailValue}>{userData.contact}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.detailRow} onPress={handleLinkedInPress} activeOpacity={0.7}>
            <Ionicons name="logo-linkedin" size={20} color="#6366F1" style={styles.detailIcon} />
            <Text style={styles.detailValue}>{userData.linkedin}</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#6366F1' }]}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="pencil" size={20} color="#fff" />
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#ff9800' }]}
            onPress={() => setChangePasswordModalVisible(true)}
          >
            <Ionicons name="key-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Change Password</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
            onPress={() => navigation.navigate('RequirementsChecklist')}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Requirements Checklist</Text>
          </TouchableOpacity>
        </View>
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

      {/* Change Password Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={changePasswordModalVisible}
        onRequestClose={() => setChangePasswordModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Change Password</Text>
            {changePasswordSuccess ? (
              <Text style={styles.successText}>{changePasswordSuccess}</Text>
            ) : null}
            {changePasswordError ? (
              <Text style={styles.errorText}>{changePasswordError}</Text>
            ) : null}
            <Text style={styles.label}>Current Password</Text>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              placeholder="Enter current password"
            />
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholder="Enter new password"
            />
            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput
              style={styles.input}
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              secureTextEntry
              placeholder="Confirm new password"
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#bbb', flex: 1, marginRight: 8 }]}
                onPress={() => {
                  setChangePasswordModalVisible(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmNewPassword('');
                  setChangePasswordError('');
                  setChangePasswordSuccess('');
                }}
                disabled={changePasswordLoading}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#6366F1', flex: 1, marginLeft: 8 }]}
                onPress={async () => {
                  setChangePasswordError('');
                  setChangePasswordSuccess('');
                  if (!currentPassword || !newPassword || !confirmNewPassword) {
                    setChangePasswordError('All fields are required.');
                    return;
                  }
                  if (newPassword.length < 8) {
                    setChangePasswordError('New password must be at least 8 characters.');
                    return;
                  }
                  if (newPassword !== confirmNewPassword) {
                    setChangePasswordError('New passwords do not match.');
                    return;
                  }
                  if (!auth.currentUser || !auth.currentUser.email) {
                    setChangePasswordError('User not authenticated.');
                    return;
                  }
                  setChangePasswordLoading(true);
                  try {
                    const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
                    await reauthenticateWithCredential(auth.currentUser, credential);
                    await updatePassword(auth.currentUser, newPassword);
                    setChangePasswordSuccess('Password changed successfully!');
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmNewPassword('');
                  } catch (error: any) {
                    let msg = 'Failed to change password.';
                    if (error.code === 'auth/wrong-password') {
                      msg = 'Current password is incorrect.';
                    } else if (error.code === 'auth/weak-password') {
                      msg = 'New password is too weak.';
                    } else if (error.code === 'auth/too-many-requests') {
                      msg = 'Too many attempts. Please try again later.';
                    } else if (error.message) {
                      msg = error.message;
                    }
                    setChangePasswordError(msg);
                  } finally {
                    setChangePasswordLoading(false);
                  }
                }}
                disabled={changePasswordLoading}
              >
                <Text style={styles.buttonText}>{changePasswordLoading ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Navbar */}
      <BottomNavbar navigation={navigation} currentRoute="Profile" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f6ff',
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
    alignSelf: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#6366F1',
    backgroundColor: '#fff',
  },
  editIconOverlay: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#6366F1',
    borderRadius: 20,
    padding: 4,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {},
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 12,
    marginBottom: 2,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    marginVertical: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f5f8ff',
    borderRadius: 16,
    alignItems: 'center',
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  workDetails: {
    marginTop: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366F1',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#444',
    marginTop: 10,
  },
  detailValue: {
    fontSize: 15,
    color: '#333',
  },
  progressContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  progressBarContainer: {
    marginTop: 10,
    height: 20,
    justifyContent: 'center',
  },
  progressBackground: {
    width: '100%',
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 10,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
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
    backgroundColor: '#6366F1',
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
    color: '#6366F1',
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
    borderColor: '#6366F1',
    alignSelf: 'flex-start',
  },
  undoButtonText: {
    color: '#6366F1',
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
    color: '#6366F1',
    textDecorationLine: 'underline',
  },
  successText: {
    color: '#4CAF50',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  headerCardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
    marginTop: 16,
    borderRadius: 20,
    alignSelf: 'center',
  },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    width: 320,
    alignSelf: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
    paddingHorizontal: 16,
  },
  buttonGroup: {
    marginTop: 16,
    marginBottom: 32,
    gap: 12,
    paddingHorizontal: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    paddingVertical: 14,
    marginBottom: 0,
    gap: 8,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailIcon: {
    marginRight: 12,
  },
});

export default ProfileScreen;
