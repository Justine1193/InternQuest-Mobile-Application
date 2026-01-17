import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { signOut, deleteUser, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth, firestore } from '../firebase/config';
import { RootStackParamList } from '../App';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomNavbar from '../components/BottomNav';
import { doc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import { colors, radii, shadows } from '../ui/theme';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [userData, setUserData] = useState<any>({});
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedin, setLinkedIn] = useState('');

  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState('');
  const [changePasswordSuccess, setChangePasswordSuccess] = useState('');

  const loadProfileForEditing = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'No user is currently signed in.');
      return;
    }
    setProfileLoading(true);
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const userSnap = await getDoc(userDocRef);
      const data = userSnap.exists() ? userSnap.data() : {};
      setUserData(data);
      const displayName = (data as any).firstName && (data as any).lastName
        ? `${(data as any).firstName} ${(data as any).lastName}`
        : ((data as any).name || '');
      setName(displayName);
      setEmail((data as any).email || user.email || '');
      setPhone((data as any).contact || (data as any).phone || '');
      setLinkedIn((data as any).linkedin || '');
      setEditProfileModalVisible(true);
    } catch (error: any) {
      console.error('SettingsScreen: loadProfileForEditing failed:', error);
      Alert.alert('Error', error.message || 'Failed to load profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'No user is currently signed in.');
      return;
    }
    setProfileSaving(true);
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      let displayName = name;
      if (!displayName && userData?.firstName && userData?.lastName) {
        displayName = `${userData.firstName} ${userData.lastName}`;
      }
      const updatedData = {
        ...userData,
        name: displayName,
        email,
        phone,
        contact: phone,
        linkedin,
        skills: Array.isArray(userData?.skills) ? userData.skills : [],
        avatar: userData?.avatar || '',
        updatedAt: new Date().toISOString(),
      };
      await setDoc(userDocRef, updatedData, { merge: true });
      setUserData(updatedData);
      Alert.alert('Success', 'Profile updated successfully!');
      setEditProfileModalVisible(false);
    } catch (error: any) {
      console.error('SettingsScreen: handleSaveProfile failed:', error);
      Alert.alert('Error', error.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              const user = auth.currentUser;
              if (!user) throw new Error('No user is currently signed in.');

              // First delete Firestore data
              try {
                await deleteDoc(doc(firestore, 'users', user.uid));
              } catch (error) {
                console.error('Error deleting Firestore data:', error);
                // Continue with auth deletion even if Firestore fails
              }

              // Then delete Firebase Auth user
              try {
                await deleteUser(user);
              } catch (error: any) {
                // If the error is due to recent login, reauthenticate and try again
                if (error.code === 'auth/requires-recent-login') {
                  Alert.alert(
                    'Authentication Required',
                    'For security reasons, please sign in again before deleting your account.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Sign In Again',
                        onPress: async () => {
                          try {
                            await signOut(auth);
                            // Auth state change will handle navigation
                          } catch (error: any) {
                            Alert.alert('Error', error.message);
                          }
                        },
                      },
                    ]
                  );
                  return;
                }
                throw error;
              }

            } catch (error: any) {
              Alert.alert(
                'Error',
                error.message || 'Failed to delete account. Please try again.'
              );
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Settings</Text>

        {/* Profile & Password */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Profile</Text>

          <TouchableOpacity
            style={[styles.settingRow, styles.settingRowTight]}
            onPress={loadProfileForEditing}
            disabled={profileLoading}
          >
            <View style={styles.settingLabelRow}>
              <Icon name="account-edit-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.settingText}>Edit Profile</Text>
            </View>
            {profileLoading ? (
              <ActivityIndicator color={colors.textSubtle} />
            ) : (
              <Icon name="chevron-right" size={24} color={colors.textSubtle} />
            )}
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={[styles.settingRow, styles.settingRowTight]}
            onPress={() => {
              setChangePasswordError('');
              setChangePasswordSuccess('');
              setCurrentPassword('');
              setNewPassword('');
              setConfirmNewPassword('');
              setChangePasswordModalVisible(true);
            }}
          >
            <View style={styles.settingLabelRow}>
              <Icon name="key-outline" size={20} color={colors.warning} style={{ marginRight: 8 }} />
              <Text style={styles.settingText}>Change Password</Text>
            </View>
            <Icon name="chevron-right" size={24} color={colors.textSubtle} />
          </TouchableOpacity>
        </View>

        {/* Account Security */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Security</Text>
          <TouchableOpacity style={styles.settingRow} onPress={() => setShowSecurityModal(true)}>
            <View style={styles.settingLabelRow}>
              <Icon name="shield-lock-outline" size={20} color={colors.success} style={{ marginRight: 8 }} />
              <Text style={styles.settingText}>2FA & Recent Activity</Text>
            </View>
            <Icon name="chevron-right" size={24} color={colors.textSubtle} />
          </TouchableOpacity>
        </View>

        {/* Help & Support */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Help & Support</Text>
          <TouchableOpacity style={styles.settingRow} onPress={() => setShowSupportModal(true)}>
            <View style={styles.settingLabelRow}>
              <Icon name="help-circle-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.settingText}>FAQ, Contact, Support</Text>
            </View>
            <Icon name="chevron-right" size={24} color={colors.textSubtle} />
          </TouchableOpacity>
        </View>

        {/* About App */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About App</Text>
          <TouchableOpacity style={styles.settingRow} onPress={() => setShowAboutModal(true)}>
            <View style={styles.settingLabelRow}>
              <Icon name="information-outline" size={20} color={colors.warning} style={{ marginRight: 8 }} />
              <Text style={styles.settingText}>Version, Privacy Policy, Terms</Text>
            </View>
            <Icon name="chevron-right" size={24} color={colors.textSubtle} />
          </TouchableOpacity>
        </View>

        {/* Account Management Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Management</Text>
          <TouchableOpacity
            style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
            onPress={handleDeleteAccount}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator color={colors.onPrimary} style={{ marginRight: 8 }} />
            ) : (
              <Icon name="account-remove-outline" size={20} color={colors.onPrimary} style={{ marginRight: 8 }} />
            )}
            <Text style={styles.deleteButtonText}>
              {isDeleting ? 'Deleting Account...' : 'Delete Account'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Log Out Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={20} color={colors.onPrimary} style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Account Security Modal */}
      <Modal visible={showSecurityModal} animationType="fade" transparent onRequestClose={() => setShowSecurityModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeIcon} onPress={() => setShowSecurityModal(false)}>
              <Icon name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Account Security</Text>
            <Text style={{ color: colors.textMuted, marginBottom: 16 }}>2FA and recent activity features coming soon.</Text>
          </View>
        </View>
      </Modal>

      {/* Help & Support Modal */}
      <Modal visible={showSupportModal} animationType="fade" transparent onRequestClose={() => setShowSupportModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeIcon} onPress={() => setShowSupportModal(false)}>
              <Icon name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Help & Support</Text>
            <Text style={{ color: colors.textMuted, marginBottom: 16 }}>For help, contact us at support@internquest.com or visit our FAQ.</Text>
          </View>
        </View>
      </Modal>

      {/* About App Modal */}
      <Modal visible={showAboutModal} animationType="fade" transparent onRequestClose={() => setShowAboutModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeIcon} onPress={() => setShowAboutModal(false)}>
              <Icon name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>About InternQuest</Text>
            <Text style={{ color: colors.textMuted, marginBottom: 8 }}>Version 1.3.6</Text>
            <Text style={{ color: colors.textMuted, marginBottom: 8 }}>Privacy Policy | Terms of Service</Text>
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        visible={editProfileModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setEditProfileModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { alignItems: 'stretch' }]}>
            <TouchableOpacity style={styles.closeIcon} onPress={() => setEditProfileModalVisible(false)}>
              <Icon name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} />

            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" />

            <Text style={styles.fieldLabel}>Phone</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

            <Text style={styles.fieldLabel}>LinkedIn</Text>
            <TextInput style={styles.input} value={linkedin} onChangeText={setLinkedIn} autoCapitalize="none" />

            <TouchableOpacity
              style={[styles.saveButton, profileSaving && { opacity: 0.7 }]}
              onPress={handleSaveProfile}
              disabled={profileSaving}
            >
              <Text style={styles.saveButtonText}>{profileSaving ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setEditProfileModalVisible(false)}
              disabled={profileSaving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={changePasswordModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setChangePasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { alignItems: 'stretch' }]}>
            <TouchableOpacity
              style={styles.closeIcon}
              onPress={() => {
                if (changePasswordLoading) return;
                setChangePasswordModalVisible(false);
              }}
            >
              <Icon name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Change Password</Text>
            {changePasswordSuccess ? <Text style={styles.successText}>{changePasswordSuccess}</Text> : null}
            {changePasswordError ? <Text style={styles.errorText}>{changePasswordError}</Text> : null}

            <Text style={styles.fieldLabel}>Current Password</Text>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              placeholder="Enter current password"
            />

            <Text style={styles.fieldLabel}>New Password</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholder="Enter new password"
            />

            <Text style={styles.fieldLabel}>Confirm New Password</Text>
            <TextInput
              style={styles.input}
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              secureTextEntry
              placeholder="Confirm new password"
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
              <TouchableOpacity
                style={[styles.cancelButton, { flex: 1, marginRight: 8 }]}
                onPress={() => {
                  if (changePasswordLoading) return;
                  setChangePasswordModalVisible(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmNewPassword('');
                  setChangePasswordError('');
                  setChangePasswordSuccess('');
                }}
                disabled={changePasswordLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { flex: 1, marginLeft: 8 }, changePasswordLoading && { opacity: 0.7 }]}
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
                    } else if (error.code === 'auth/requires-recent-login') {
                      msg = 'Please sign in again, then try changing your password.';
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
                <Text style={styles.saveButtonText}>{changePasswordLoading ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNavbar navigation={navigation} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: colors.bg,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: colors.text,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 18,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  settingRowTight: {
    marginBottom: 0,
    paddingVertical: 10,
  },
  settingLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: colors.text,
  },
  logoutButton: {
    flexDirection: 'row',
    marginTop: 10,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    elevation: 1,
  },
  logoutText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
    paddingVertical: 14,
    borderRadius: radii.md,
    marginTop: 10,
    marginBottom: 10,
  },
  deleteButtonText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButtonDisabled: {
    opacity: 0.7,
    backgroundColor: colors.textSubtle,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  profilePic: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceAlt,
  },
  profilePicLargeWrap: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profilePicLarge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.surfaceAlt,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 10,
    marginBottom: 14,
    fontSize: 16,
    backgroundColor: colors.surfaceAlt,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: radii.md,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: colors.surfaceAlt,
    paddingVertical: 12,
    borderRadius: radii.md,
    alignItems: 'center',
    marginBottom: 10,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 18,
    color: colors.text,
  },
  languageOption: {
    paddingVertical: 12,
    alignItems: 'center',
    width: '100%',
  },
  languageText: {
    fontSize: 16,
    color: colors.text,
  },
  closeIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 6,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginBottom: 10,
  },
  successText: {
    color: colors.success,
    fontSize: 14,
    marginBottom: 10,
  },
});

export default SettingsScreen;
