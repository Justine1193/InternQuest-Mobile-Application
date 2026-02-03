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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { auth, firestore } from '../firebase/config';
import { doc, setDoc, collection, getDoc, getDocFromServer, getDocs, deleteDoc, query, where, getDocsFromServer, serverTimestamp } from "firebase/firestore";
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
  const [companyInfoModalVisible, setCompanyInfoModalVisible] = useState(false);
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
      setCompanyInfoModalVisible(true);
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
        const data = { ...userSnap.data() } as UserData;
        const appliedId = (data as any).appliedCompanyId;
        // If user has an applied company, verify both:
        // 1) The application status is not denied/cancelled
        // 2) The company still exists in the companies collection
        // Use getDocFromServer to avoid cache so we see real server state.
        if (appliedId && typeof appliedId === 'string') {
          try {
            const applicationRef = doc(firestore, 'applications', `${auth.currentUser!.uid}_${appliedId}`);
            const applicationSnap = await getDocFromServer(applicationRef);
            const appStatus = applicationSnap.exists() ? (applicationSnap.data() as any).status : null;

            // If the application was denied or cancelled, don't show this company in profile anymore.
            if (appStatus === 'denied' || appStatus === 'cancelled') {
              const appliedName = (data as any).appliedCompanyName;
              data.appliedCompanyId = null;
              (data as any).appliedCompanyName = null;
              const updates: any = {
                appliedCompanyId: null,
                appliedCompanyName: null,
                applicationRemovedAt: new Date().toISOString(),
              };
              if ((data as any).company === appliedName && data.status !== 'hired') {
                (data as any).company = null;
                updates.company = null;
              }
              await setDoc(userDocRef, updates, { merge: true });
            } else {
              // Only if application is not explicitly denied/cancelled, verify the company document still exists.
              const companyRef = doc(firestore, 'companies', appliedId);
              const companySnap = await getDocFromServer(companyRef);
              if (!companySnap.exists()) {
                const appliedName = (data as any).appliedCompanyName;
                data.appliedCompanyId = null;
                (data as any).appliedCompanyName = null;
                const updates: any = {
                  appliedCompanyId: null,
                  appliedCompanyName: null,
                  applicationRemovedAt: new Date().toISOString(),
                };
                if ((data as any).company === appliedName && data.status !== 'hired') {
                  (data as any).company = null;
                  updates.company = null;
                }
                await setDoc(userDocRef, updates, { merge: true });
                try {
                  await deleteDoc(doc(firestore, 'applications', `${auth.currentUser!.uid}_${appliedId}`));
                } catch (_) {
                  // ignore if application doc missing
                }
              }
            }
          } catch (checkErr) {
            console.warn('ProfileScreen: could not verify applied company/application', checkErr);
          }
        }

        // If admin already approved/accepted the application but the user doc wasn't updated yet,
        // sync the approved company into the profile so the user sees it as assigned.
        try {
          const approvedQ = query(
            collection(firestore, 'applications'),
            where('userId', '==', auth.currentUser!.uid),
            where('status', '==', 'approved')
          );
          const approvedSnap = await getDocsFromServer(approvedQ);
          if (!approvedSnap.empty) {
            const approved = approvedSnap.docs[0].data() as any;
            const approvedCompanyName = String(approved.companyName || approved.company || '');
            const approvedCompanyId = String(approved.companyId || '');

            if ((data.status !== 'hired' || !data.company) && approvedCompanyName) {
              data.status = 'hired';
              (data as any).company = approvedCompanyName;
              (data as any).hiredCompanyId = approvedCompanyId || null;

              await setDoc(doc(firestore, 'users', auth.currentUser!.uid), {
                status: 'hired',
                company: approvedCompanyName,
                hiredCompanyId: approvedCompanyId || null,
                hiredAt: serverTimestamp(),
                // once approved, clear applied fields to avoid confusion
                appliedCompanyId: null,
                appliedCompanyName: null,
              }, { merge: true });
            }
          }
        } catch (e) {
          console.warn('ProfileScreen: failed to sync approved company into user profile', e);
        }

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

  // Refresh user data and OJT when screen comes into focus (so removed companies are cleared)
  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        await fetchUserData();
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
      <ScrollView
        style={styles.profileScrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header + Profile section with gradient background */}
        <View style={styles.headerGradientWrapper}>
          <LinearGradient
            colors={['#4F46E5', '#6366F1', '#818CF8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            {/* Decorative circles */}
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />
            <View style={styles.decorativeCircle3} />
            
            <AppHeader title="Profile" variant="hero" back />
            {/* Profile section - scrolls with content */}
            <View style={styles.profileHeaderSection}>
              <View style={styles.profileHeaderBackground}>
                <View style={styles.profileHeaderContent}>
                  {/* Avatar with glow effect */}
                  <View style={styles.avatarGlowWrapper}>
                    <TouchableOpacity
                      style={styles.avatarContainer}
                      onPress={handlePickImage}
                      accessibilityLabel="Edit profile picture"
                      accessibilityRole="button"
                      activeOpacity={0.8}
                    >
                      {avatarUri ? (
                        <Image source={{ uri: avatarUri }} style={styles.avatar} />
                      ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                          <Ionicons name="person-circle" size={100} color={colors.white} />
                        </View>
                      )}
                      <View style={styles.editIconOverlay}>
                        {avatarUploading ? (
                          <ActivityIndicator size="small" color={colors.onPrimary} />
                        ) : (
                          <Ionicons name="camera" size={18} color={colors.onPrimary} style={styles.editIcon} />
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>
                  
                  {/* Name */}
                  <Text style={styles.profileName}>
                    {userData.name || (userData.firstName && userData.lastName ? userData.firstName + ' ' + userData.lastName : '')}
                  </Text>
                  
                  <Text style={styles.profileEmail}>{userData.email || auth.currentUser?.email || ''}</Text>
                  
                  {/* Decorative divider */}
                  <View style={styles.profileDivider} />
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* White content card - stats and below */}
        <View style={styles.profileContentCard}>
        {/* Stats Cards */}
        <View style={styles.statsRow}>
          {/* Hours Done Card */}
          <View style={styles.statCardWrapper}>
            <LinearGradient
              colors={['#F3E8FF', '#EDE9FE', '#F5F3FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCardGradient}
            >
              <View style={styles.statCardIconWrapper}>
                <Ionicons name="checkmark-circle" size={24} color="#8B5CF6" />
              </View>
              <Text style={styles.statNumberEnhanced}>{totalHours}</Text>
              <Text style={styles.statLabelEnhanced}>Hours Done</Text>
            </LinearGradient>
          </View>

          {/* Remaining Hours Card */}
          <View style={styles.statCardWrapper}>
            <LinearGradient
              colors={['#FEF3C7', '#FEF9E7', '#FFFBEB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCardGradient}
            >
              <View style={styles.statCardIconWrapper}>
                <Ionicons name="time" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.statNumberEnhancedDark}>{Math.max(0, requiredHours - totalHours)}</Text>
              <Text style={styles.statLabelEnhancedDark}>Remaining</Text>
            </LinearGradient>
          </View>

          {/* Required Hours Card */}
          <View style={styles.statCardWrapper}>
            <LinearGradient
              colors={['#DBEAFE', '#EFF6FF', '#F0F9FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCardGradient}
            >
              <View style={styles.statCardIconWrapper}>
                <Ionicons name="flag" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.statNumberEnhancedDark}>{requiredHours}</Text>
              <Text style={styles.statLabelEnhancedDark}>Required</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionHeaderText}>Personal Information</Text>
        </View>

        {/* Profile Details List */}
        <View style={styles.settingsListCard}>
          <TouchableOpacity 
            style={styles.settingsRow}
            activeOpacity={0.7}
            disabled
          >
            <View style={[styles.settingsIconWrapper, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="id-card" size={20} color="#8B5CF6" />
            </View>
            <View style={styles.settingsTextWrapper}>
              <Text style={styles.settingsTitle}>Student ID</Text>
              <Text style={styles.settingsSubtitle} numberOfLines={2}>
                {(userData as any).studentId || 'Not set'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingsRow}
            activeOpacity={0.7}
            disabled
          >
            <View style={[styles.settingsIconWrapper, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="school" size={20} color="#3B82F6" />
            </View>
            <View style={styles.settingsTextWrapper}>
              <Text style={styles.settingsTitle}>Program</Text>
              <Text style={styles.settingsSubtitle} numberOfLines={2}>
                {(userData as any).program || (userData as any).course || 'Not set'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingsRow}
            activeOpacity={0.7}
            disabled
          >
            <View style={[styles.settingsIconWrapper, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="people" size={20} color="#22C55E" />
            </View>
            <View style={styles.settingsTextWrapper}>
              <Text style={styles.settingsTitle}>Section</Text>
              <Text style={styles.settingsSubtitle} numberOfLines={2}>
                {(userData as any).section || 'Not set'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingsRow}
            activeOpacity={0.7}
            disabled
          >
            <View style={[styles.settingsIconWrapper, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="briefcase" size={20} color="#F59E0B" />
            </View>
            <View style={styles.settingsTextWrapper}>
              <Text style={styles.settingsTitle}>Preferred Field</Text>
              <Text style={styles.settingsSubtitle} numberOfLines={2}>
                {Array.isArray((userData as any).field)
                  ? (userData as any).field.join(', ')
                  : (userData as any).field || 'Not set'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.settingsRow, { borderBottomWidth: 0 }]}
            activeOpacity={0.7}
            onPress={userData.status === 'hired' && userData.company ? handleCompanyPress : undefined}
            disabled={!(userData.status === 'hired' && userData.company)}
          >
            <View style={[styles.settingsIconWrapper, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="business" size={20} color="#EF4444" />
            </View>
            <View style={styles.settingsTextWrapper}>
              <Text style={styles.settingsTitle}>Company</Text>
              <Text style={styles.settingsSubtitle} numberOfLines={2}>
                {userData.status === 'hired' && userData.company ? userData.company : 'Not assigned yet'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionHeaderText}>Skills & Progress</Text>
        </View>

        {/* Skills Section */}
        <View style={styles.skillsCardContainer}>
          <View style={styles.skillsCardHeader}>
            <View style={[styles.settingsIconWrapper, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="star" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.skillsCardTitle}>Skills</Text>
            {Array.isArray((userData as any).skills) && (userData as any).skills.length > 0 && (
              <Text style={styles.skillsCount}>({(userData as any).skills.length})</Text>
            )}
          </View>
          
          {Array.isArray((userData as any).skills) && (userData as any).skills.length > 0 ? (
            <View style={styles.skillsChipsContainer}>
              {(userData as any).skills.map((skill: string, index: number) => {
                const accentColors = ['#6366F1', '#8B5CF6', '#06B6D4', '#22C55E', '#F59E0B', '#EF4444', '#3B82F6'];
                const colorIndex = index % accentColors.length;
                return (
                  <View 
                    key={`${skill}-${index}`} 
                    style={[
                      styles.skillChipNew, 
                      { 
                        backgroundColor: `${accentColors[colorIndex]}15`, 
                        borderColor: accentColors[colorIndex] 
                      }
                    ]}
                  >
                    <Text style={[styles.skillChipTextNew, { color: accentColors[colorIndex] }]}>
                      {skill}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.skillsEmptyContainer}>
              <Ionicons name="star-outline" size={32} color={colors.textMuted} />
              <Text style={styles.skillsEmptyText}>No skills added yet</Text>
              <Text style={styles.skillsEmptySubtext}>You can add skills in Settings</Text>
            </View>
          )}
        </View>

        {/* Internship Progress Section */}
        <View style={styles.settingsListCard}>
          <TouchableOpacity 
            style={[styles.settingsRow, { borderBottomWidth: 0 }]}
            activeOpacity={0.7}
            disabled
          >
            <View style={[styles.settingsIconWrapper, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="bar-chart" size={20} color="#3B82F6" />
            </View>
            <View style={styles.settingsTextWrapper}>
              <Text style={styles.settingsTitle}>Internship Progress</Text>
              <Text style={styles.settingsSubtitle} numberOfLines={2}>
                {totalHours} hrs / {requiredHours} hrs ({Math.round(progress * 100)}% completed)
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionHeaderText}>Contact Information</Text>
        </View>

        {/* Contact & Details Section */}
        <View style={styles.settingsListCard}>
          <TouchableOpacity 
            style={styles.settingsRow}
            activeOpacity={0.7}
            disabled
          >
            <View style={[styles.settingsIconWrapper, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="mail" size={20} color="#EF4444" />
            </View>
            <View style={styles.settingsTextWrapper}>
              <Text style={styles.settingsTitle}>Email</Text>
              <Text style={styles.settingsSubtitle} numberOfLines={2}>
                {userData.email || 'Not set'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingsRow}
            activeOpacity={0.7}
            disabled
          >
            <View style={[styles.settingsIconWrapper, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="call" size={20} color="#22C55E" />
            </View>
            <View style={styles.settingsTextWrapper}>
              <Text style={styles.settingsTitle}>Phone</Text>
              <Text style={styles.settingsSubtitle} numberOfLines={2}>
                {userData.contact || 'Not set'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.settingsRow, { borderBottomWidth: 0 }]}
            activeOpacity={0.7}
            disabled
          >
            <View style={[styles.settingsIconWrapper, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="logo-linkedin" size={20} color="#0A66C2" />
            </View>
            <View style={styles.settingsTextWrapper}>
              <Text style={styles.settingsTitle}>LinkedIn</Text>
              <Text style={styles.settingsSubtitle} numberOfLines={2}>
                {userData.linkedin || 'Not set'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        </View>
      </ScrollView>

      {/* Company Details Modal */}
      <Modal
        visible={companyModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setCompanyModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={() => setCompanyModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <View style={styles.modalHeaderContainer}>
              <View style={styles.modalHeaderIconWrapper}>
                <Ionicons name="business" size={24} color={colors.primary} />
              </View>
              <View style={styles.modalHeaderTextWrapper}>
                <Text style={styles.modalHeader}>
                  {userData.status === 'hired' ? 'Update Company' : 'Add Company'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {userData.status === 'hired' 
                    ? 'Update your current company information' 
                    : 'Add the company where you are interning'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setCompanyModalVisible(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Input Section */}
            <View style={styles.modalInputSection}>
              <Text style={styles.modalLabel}>Company Name</Text>
              <View style={styles.modalInputWrapper}>
                <Ionicons name="business-outline" size={20} color={colors.textMuted} style={styles.modalInputIcon} />
                <TextInput
                  style={styles.modalInput}
                  value={companyName}
                  onChangeText={setCompanyName}
                  placeholder="Enter company name"
                  placeholderTextColor={colors.textMuted}
                  autoFocus={true}
                />
              </View>
            </View>

            {/* Modal Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setCompanyModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  styles.modalSaveButton,
                  !companyName.trim() && styles.modalSaveButtonDisabled
                ]}
                onPress={handleCompanyUpdate}
                activeOpacity={0.8}
                disabled={!companyName.trim()}
              >
                <Ionicons 
                  name="checkmark" 
                  size={18} 
                  color={!companyName.trim() ? colors.textMuted : colors.onPrimary} 
                  style={{ marginRight: 6 }} 
                />
                <Text style={[
                  styles.modalSaveButtonText,
                  !companyName.trim() && styles.modalSaveButtonTextDisabled
                ]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Company Information Display Modal */}
      <Modal
        visible={companyInfoModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setCompanyInfoModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={() => setCompanyInfoModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.companyInfoModalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <View style={styles.companyInfoModalHeader}>
              <View style={styles.companyInfoModalIconWrapper}>
                <Ionicons name="business" size={28} color={colors.primary} />
              </View>
              <View style={styles.companyInfoModalHeaderTextWrapper}>
                <Text style={styles.companyInfoModalTitle}>Company</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setCompanyInfoModalVisible(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Company Information */}
            <View style={styles.companyInfoModalBody}>
              <Text style={styles.companyInfoModalText}>
                You are currently associated with{' '}
                <Text style={styles.companyInfoModalCompanyName}>
                  {(userData as any).company}
                </Text>
              </Text>
            </View>

            {/* Modal Button */}
            <View style={styles.companyInfoModalFooter}>
              <TouchableOpacity
                style={styles.companyInfoModalButton}
                onPress={() => setCompanyInfoModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.companyInfoModalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
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
  profileScrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
    paddingHorizontal: 16,
    flexGrow: 1,
    backgroundColor: colors.bg,
  },
  profileContentCard: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingTop: 20,
    marginTop: 0,
    flexGrow: 1,
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
  headerGradientWrapper: {
    marginBottom: 0,
    marginHorizontal: -16,
    overflow: 'hidden',
    position: 'relative',
  },
  headerGradient: {
    paddingBottom: 40,
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
    position: 'relative',
    overflow: 'hidden',
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: -80,
    right: -50,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    top: 100,
    left: -40,
  },
  decorativeCircle3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    bottom: 20,
    right: 30,
  },
  profileHeaderSection: {
    marginBottom: 0,
    paddingTop: 8,
    paddingBottom: 40,
    paddingHorizontal: 20,
    width: '100%',
    backgroundColor: 'transparent',
    position: 'relative',
    zIndex: 1,
  },
  profileHeaderBackground: {
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'transparent',
  },
  profileHeaderContent: {
    alignItems: 'center',
    width: '100%',
  },
  avatarGlowWrapper: {
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  avatarContainer: {
    alignSelf: 'center',
    position: 'relative',
  },
  
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 5,
    borderColor: colors.white,
    backgroundColor: colors.surface,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  editIconOverlay: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    width: 40,
    height: 40,
    borderWidth: 4,
    borderColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  profileName: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.white,
    textAlign: 'center',
    lineHeight: 32,
    letterSpacing: 0.3,
    marginTop: 20,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  profileEmail: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: 0.2,
    marginBottom: 16,
  },
  profileDivider: {
    width: 60,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginTop: 8,
  },
  editIcon: {},
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  subtext: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 0,
    fontWeight: '500',
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
  statCardFull: {
    flex: 1,
    width: '100%',
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
  skillsCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  skillsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  contactCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
  progressChartContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  circularProgressWrapper: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  circularProgressBackground: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 12,
    borderColor: colors.border,
    position: 'absolute',
  },
  circularProgressFill: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 12,
    borderColor: colors.primary,
    position: 'absolute',
  },
  circularProgressInner: {
    width: 136,
    height: 136,
    borderRadius: 68,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  circularProgressPercent: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  circularProgressLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  progressStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    width: '100%',
  },
  progressStatBox: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: radii.md,
    gap: 10,
    minHeight: 110,
    justifyContent: 'flex-start',
  },
  progressStatIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 4,
  },
  progressStatText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
  progressBarContainer: {
    marginTop: 0,
    width: '100%',
  },
  progressBarBackground: {
    width: '100%',
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 10,
  },
  progressText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    paddingVertical: 4,
    includeFontPadding: false,
    textAlignVertical: 'center',
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  modalHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalHeaderIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalHeaderTextWrapper: {
    flex: 1,
    paddingRight: 8,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    lineHeight: 26,
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  modalInputSection: {
    padding: 24,
    paddingTop: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  modalInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    minHeight: 52,
  },
  modalInputIcon: {
    marginRight: 12,
  },
  modalInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 0,
    includeFontPadding: false,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    padding: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  modalCancelButton: {
    backgroundColor: '#F3F4F6',
  },
  modalSaveButton: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  modalCancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  modalSaveButtonText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  modalSaveButtonDisabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  modalSaveButtonTextDisabled: {
    color: colors.textMuted,
  },
  companyInfoModalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  companyInfoModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  companyInfoModalIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  companyInfoModalHeaderTextWrapper: {
    flex: 1,
    paddingRight: 8,
  },
  companyInfoModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 28,
  },
  companyInfoModalBody: {
    padding: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  companyInfoModalText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  companyInfoModalCompanyName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    lineHeight: 24,
  },
  companyInfoModalFooter: {
    padding: 24,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  companyInfoModalButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  companyInfoModalButtonText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: '600',
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
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    marginBottom: 20,
    marginTop: 16,
    borderRadius: radii.xl,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
    overflow: 'hidden',
  },
  headerGradientAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.primary,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
  },
  headerNameSection: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
    width: '100%',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
    paddingHorizontal: 4,
    width: '100%',
  },
  profileIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  headerStudentDetails: {
    width: '100%',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 14,
  },
  detailCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  detailTextWrapper: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
    lineHeight: 20,
  },
  headerDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    minHeight: 28,
    width: '100%',
  },
  headerDetailLeft: {
    flex: 1,
    paddingRight: 12,
  },
  headerDetailRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  headerAcademicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  headerAcademicLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    flex: 0,
    minWidth: 110,
  },
  headerAcademicValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 'auto',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
    paddingHorizontal: 16,
  },
  statCardWrapper: {
    flex: 1,
    borderRadius: radii.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statCardGradient: {
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 12,
    minHeight: 100,
    justifyContent: 'center',
    borderRadius: radii.lg,
  },
  statCardIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statNumberEnhanced: {
    fontSize: 30,
    fontWeight: '700',
    color: '#8B5CF6',
    marginBottom: 5,
  },
  statLabelEnhanced: {
    fontSize: 12,
    color: '#7C3AED',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  statNumberEnhancedDark: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 5,
  },
  statLabelEnhancedDark: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  statCardClean: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: radii.lg,
    minHeight: 90,
    justifyContent: 'center',
  },
  statCardElevated: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  statNumberClean: {
    fontSize: 28,
    fontWeight: '700',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  statLabelClean: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  statNumberCleanDark: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statLabelCleanDark: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
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
    borderRadius: radii.lg,
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  settingsListCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    marginBottom: 16,
    marginHorizontal: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    minHeight: 72,
  },
  settingsIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  settingsTextWrapper: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    lineHeight: 22,
  },
  settingsSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  sectionHeaderContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    minHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailIcon: {
    marginRight: 12,
  },
  academicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 6,
  },
  academicLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  academicValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  academicEmptyText: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 8,
  },
  skillsCardContainer: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    marginBottom: 16,
    marginHorizontal: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  skillsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  skillsCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  skillsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillsChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  skillChipNew: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    marginBottom: 4,
  },
  skillChipTextNew: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  skillsEmptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  skillsEmptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  skillsEmptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  skillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  skillChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    borderWidth: 1.5,
  },
  skillChipText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default ProfileScreen;
