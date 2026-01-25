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
import { auth, firestore } from '../firebase/config';
import { doc, setDoc, collection, getDoc, getDocs, deleteDoc } from "firebase/firestore";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
// removed `react-native-progress` dependency and use a simple native progress bar instead
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { colors, radii, shadows } from '../ui/theme';
import { Screen } from '../ui/components/Screen';
import { AppHeader } from '../ui/components/AppHeader';

// Add type for userData
type UserData = {
  status?: string;
  company?: string | null;
  [key: string]: any;
};

const ProfileScreen = ({ navigation }: { navigation: any }) => {
  const [userData, setUserData] = useState<UserData>({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showUndoCompany, setShowUndoCompany] = useState(false);
  const [companyModalVisible, setCompanyModalVisible] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [totalHours, setTotalHours] = useState(0);
  const [progress, setProgress] = useState(0);
  const [requiredHours, setRequiredHours] = useState(300);

  const [avatarUploading, setAvatarUploading] = useState(false);
  const FIRESTORE_MAX_BYTES = 700 * 1024; // only store small base64 previews in Firestore

  const handleClearAppliedCompanyProfile = async () => {
    if (!auth.currentUser) return;
    Alert.alert(
      'Remove Application',
      'Are you sure you want to remove your application? This will clear the applied company from your profile.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: async () => {
          try {
            const uid = auth.currentUser!.uid;
            // Read latest appliedCompanyId from user doc
            let appliedId: string | null = null;
            try {
              const userSnap = await getDoc(doc(firestore, 'users', uid));
              if (userSnap.exists()) appliedId = (userSnap.data() as any).appliedCompanyId || null;
            } catch (readErr) {
              console.warn('ProfileScreen: failed to read user doc before deleting application', readErr);
            }

            if (appliedId) {
              try {
                await deleteDoc(doc(firestore, 'applications', `${uid}_${appliedId}`));
              } catch (delErr) {
                console.warn('ProfileScreen: failed to delete application doc', delErr);
              }
            }

            await setDoc(doc(firestore, 'users', uid), {
              appliedCompanyId: null,
              appliedCompanyName: null,
              applicationRemovedAt: new Date().toISOString()
            }, { merge: true });
            setUserData(prev => ({ ...prev, appliedCompanyId: null, appliedCompanyName: null }));
          } catch (err: any) {
            Alert.alert('Error', 'Could not remove applied company. Please try again.');
            if (auth.currentUser) {
              await setDoc(doc(firestore, 'users', auth.currentUser.uid), { lastProfileError: { time: new Date().toISOString(), message: String(err) } }, { merge: true });
            }
          }
        }}
      ]
    );
  };

  const handleCompanyPress = () => {
    const appliedId = (userData as any).appliedCompanyId;
    const appliedName = (userData as any).appliedCompanyName;
    if (!appliedName && !(userData as any).company) return;

    // If there's an applied company, show options
    if (appliedName) {
      const buttons: any[] = [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove Application', style: 'destructive', onPress: handleClearAppliedCompanyProfile }
      ];
      if (appliedId) {
        buttons.splice(1, 0, { text: 'View Company', onPress: () => navigation.navigate('CompanyProfile', { companyId: appliedId }) });
      }
      Alert.alert(appliedName, 'Choose an action', buttons as any);
      return;
    }

    // If hired company only (no appliedId), just inform
    if ((userData as any).company) {
      Alert.alert('Company', `You are currenty associated with ${ (userData as any).company }`);
    }
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
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      if (!auth.currentUser) {
        Alert.alert("Error", "You must be logged in to update your profile picture.");
        return;
      }
      try {
        setAvatarUploading(true);
        const localUri = result.assets[0].uri;
        const userDocRef = doc(firestore, "users", auth.currentUser.uid);

        // Always upload to Storage under avatars/{userId}/profile.jpg (unique folder per user)
        let storageUrl: string | null = null;
        try {
          const response = await fetch(localUri);
          const blob = await response.blob();
          const storage = getStorage();
          const fileName = `avatars/${auth.currentUser.uid}/profile.jpg`;
          const avatarRef = storageRef(storage, fileName);
          await uploadBytes(avatarRef, blob);
          storageUrl = await getDownloadURL(avatarRef);
        } catch (err: any) {
          await setDoc(userDocRef, { lastAvatarUploadError: { time: new Date().toISOString(), message: String(err) } }, { merge: true });
        }

        // Persist only the Storage URL to user doc
        if (storageUrl) {
          await setDoc(userDocRef, { avatar: storageUrl, updatedAt: new Date().toISOString() }, { merge: true });
          setUserData({ ...userData, avatar: storageUrl });
          setAvatarChanged(true);
          Alert.alert('Success', 'Profile picture updated!');
        } else {
          Alert.alert('Error', 'Failed to upload profile picture.');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to upload profile picture.');
        console.error('ProfileScreen avatar upload error:', error);
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

  // no persisted avatar upload mode — always upload to Storage and optionally save small base64 preview

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
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
    );
  }

  // Always use the Storage URL for avatar
  const avatarUri = userData && userData.avatar ? userData.avatar : undefined;

  return (
    <Screen contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 0 }}>
      <AppHeader title="Profile" />
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
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surfaceAlt }]}>
                  <Ionicons name="person-circle" size={100} color={colors.textSubtle} />
                </View>
              )}
              {/* Edit Icon Overlay */}
              <View style={styles.editIconOverlay}>
                {avatarUploading ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Ionicons name="camera" size={28} color={colors.onPrimary} style={styles.editIcon} />
                )}
              </View>
            </TouchableOpacity>
            <Text style={styles.name}>{userData.name || (userData.firstName && userData.lastName ? userData.firstName + ' ' + userData.lastName : '')}</Text>
            <Text style={styles.subtext}>{userData.course}</Text>
            {userData.status === 'hired' && userData.company && (
              <Text style={styles.subtext}>Company: {userData.company}</Text>
            )}
            {userData.appliedCompanyName && !userData.company && (
              <Text style={styles.subtext}>Applied: {userData.appliedCompanyName}</Text>
            )}
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={24} color={colors.primary} style={{ marginBottom: 4 }} />
            <Text style={styles.statLabel}>Remaining Hours</Text>
            <Text style={styles.statValue}>{Math.max(0, requiredHours - totalHours)} hrs</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="business-outline" size={24} color={colors.primary} style={{ marginBottom: 4 }} />
            <Text style={styles.statLabel}>Company</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={handleCompanyPress} accessibilityRole="button" style={{ flexShrink: 1 }}>
                <Text style={styles.statValue}>{userData.company || userData.appliedCompanyName || 'Not Applied'}</Text>
              </TouchableOpacity>
              {userData.appliedCompanyName && !userData.company && userData.status !== 'hired' ? (
                <TouchableOpacity onPress={handleClearAppliedCompanyProfile} style={styles.removeButton} accessibilityLabel="Remove applied company">
                  <Ionicons name="trash" size={18} color={colors.danger} />
                </TouchableOpacity>
              ) : null}
            </View>
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
            <Ionicons name="mail-outline" size={20} color={colors.primary} style={styles.detailIcon} />
            <Text style={styles.detailValue}>{userData.email}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.detailRow} onPress={handlePhonePress} activeOpacity={0.7}>
            <Ionicons name="call-outline" size={20} color={colors.primary} style={styles.detailIcon} />
            <Text style={styles.detailValue}>{userData.contact}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.detailRow} onPress={handleLinkedInPress} activeOpacity={0.7}>
            <Ionicons name="logo-linkedin" size={20} color={colors.primary} style={styles.detailIcon} />
            <Text style={styles.detailValue}>{userData.linkedin}</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.success }]}
            onPress={() => navigation.navigate('RequirementsChecklist')}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color={colors.onPrimary} />
            <Text style={styles.buttonText}>Requirements Checklist</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 24,
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
  removeButton: { marginLeft: 8, padding: 6, borderRadius: 6, backgroundColor: 'transparent' },
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
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  editIconOverlay: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 4,
    borderWidth: 2,
    borderColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {},
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
    marginBottom: 2,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 15,
    color: colors.textMuted,
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
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  workDetails: {
    marginTop: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 10,
  },
  detailValue: {
    fontSize: 15,
    color: colors.text,
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
    backgroundColor: colors.border,
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 10,
  },
  progressText: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: radii.sm,
    marginTop: 10,
  },
  buttonText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.overlay,
  },
  modalContent: {
    width: '90%',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
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
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceAlt,
    marginBottom: 15,
    color: colors.text,
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
    backgroundColor: colors.primary,
  },
  cancelButton: {
    backgroundColor: colors.danger,
  },
  modalButtonText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 5,
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  link: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  undoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: colors.infoSoft,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    alignSelf: 'flex-start',
  },
  undoButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 13,
    marginLeft: 6,
  },
  undoSnackbar: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: colors.black,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    elevation: 5,
  },
  undoSnackbarText: {
    color: colors.onPrimary,
  },
  undoSnackbarButton: {
    color: colors.onPrimary,
    fontWeight: 'bold',
  },
  companyText: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  successText: {
    color: colors.success,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  headerCardShadow: {
    ...shadows.card,
    marginBottom: 16,
    marginTop: 16,
    borderRadius: 20,
    alignSelf: 'center',
  },
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    width: 320,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailIcon: {
    marginRight: 12,
  },
});

export default ProfileScreen;
