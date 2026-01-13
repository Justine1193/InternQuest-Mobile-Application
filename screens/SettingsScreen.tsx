import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
  TextInput,
  ActivityIndicator,
  Modal,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { signOut, deleteUser } from 'firebase/auth';
import { auth, firestore } from '../firebase/config';
import { RootStackParamList } from '../App';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomNavbar from '../components/BottomNav';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, deleteDoc } from 'firebase/firestore';
import { colors, radii, shadows } from '../ui/theme';
import { clearExpoPushTokenForCurrentUser, sendLocalTestNotification, sendRemoteTestPushToSelf, syncExpoPushTokenForCurrentUser } from '../services/notifications';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

// Enable layout animation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [isDeleting, setIsDeleting] = useState(false);

  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [locationAccess, setLocationAccess] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showNotifPreview, setShowNotifPreview] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [email, setEmail] = useState('user@email.com');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState('English');

  // Load persisted settings on mount
  useEffect(() => {
    (async () => {
      const emailNotifVal = await AsyncStorage.getItem('emailNotif');
      const pushNotifVal = await AsyncStorage.getItem('pushNotif');
      const locationAccessVal = await AsyncStorage.getItem('locationAccess');
      const autoUpdateVal = await AsyncStorage.getItem('autoUpdate');
      if (emailNotifVal !== null) setEmailNotif(emailNotifVal === 'true');
      if (pushNotifVal !== null) setPushNotif(pushNotifVal === 'true');
      if (locationAccessVal !== null) setLocationAccess(locationAccessVal === 'true');
      if (autoUpdateVal !== null) setAutoUpdate(autoUpdateVal === 'true');
    })();
  }, []);

  // Persist settings on change
  useEffect(() => { AsyncStorage.setItem('emailNotif', emailNotif.toString()); }, [emailNotif]);
  useEffect(() => { AsyncStorage.setItem('pushNotif', pushNotif.toString()); }, [pushNotif]);
  useEffect(() => { AsyncStorage.setItem('locationAccess', locationAccess.toString()); }, [locationAccess]);
  useEffect(() => { AsyncStorage.setItem('autoUpdate', autoUpdate.toString()); }, [autoUpdate]);

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

              // Clear any stored settings
              try {
                await AsyncStorage.multiRemove([
                  'emailNotif',
                  'pushNotif',
                  'locationAccess',
                  'autoUpdate'
                ]);
              } catch (error) {
                console.error('Error clearing AsyncStorage:', error);
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

        {/* Notifications Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Notifications</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingLabelRow}>
              <Icon name="email-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.settingText}>Email Notifications</Text>
            </View>
            <Switch
              value={emailNotif}
              onValueChange={setEmailNotif}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={emailNotif ? colors.onPrimary : colors.surfaceAlt}
            />
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingLabelRow}>
              <Icon name="bell-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.settingText}>Push Notifications</Text>
            </View>
            <Switch
              value={pushNotif}
              onValueChange={async (value) => {
                setPushNotif(value);

                if (value) {
                  const res = await syncExpoPushTokenForCurrentUser();
                  if (!res.ok) {
                    Alert.alert(
                      'Push notifications not enabled',
                      'We could not register this device for push notifications. Please allow notification permission and try again.'
                    );
                  }
                } else {
                  await clearExpoPushTokenForCurrentUser();
                }
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={pushNotif ? colors.onPrimary : colors.surfaceAlt}
            />
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Preferences</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingLabelRow}>
              <Icon name="map-marker-outline" size={20} color={colors.success} style={{ marginRight: 8 }} />
              <Text style={styles.settingText}>Location Access</Text>
            </View>
            <Switch
              value={locationAccess}
              onValueChange={setLocationAccess}
              trackColor={{ false: colors.border, true: colors.success }}
              thumbColor={locationAccess ? colors.onPrimary : colors.surfaceAlt}
            />
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingLabelRow}>
              <Icon name="update" size={20} color={colors.success} style={{ marginRight: 8 }} />
              <Text style={styles.settingText}>Auto-Update App</Text>
            </View>
            <Switch
              value={autoUpdate}
              onValueChange={setAutoUpdate}
              trackColor={{ false: colors.border, true: colors.success }}
              thumbColor={autoUpdate ? colors.onPrimary : colors.surfaceAlt}
            />
          </View>
        </View>

        {/* Language Selection */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Language</Text>
          <TouchableOpacity style={styles.settingRow} onPress={() => setShowLanguageModal(true)}>
            <View style={styles.settingLabelRow}>
              <Icon name="translate" size={20} color={colors.warning} style={{ marginRight: 8 }} />
              <Text style={styles.settingText}>{language}</Text>
            </View>
            <Icon name="chevron-right" size={24} color={colors.textSubtle} />
          </TouchableOpacity>
        </View>

        {/* Notification Preview/Test */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Notification Preview</Text>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={async () => {
              if (!pushNotif) {
                Alert.alert('Notifications are off', 'Turn on Push Notifications in Settings to receive device notifications.');
                return;
              }

              const result = await sendLocalTestNotification();
              if (!result.ok) {
                Alert.alert(
                  'Notifications permission needed',
                  'Please allow notifications for InternQuest in your device settings to receive alerts.'
                );
                return;
              }

              // Keep the in-app preview too.
              setShowNotifPreview(true);
            }}
          >
            <View style={styles.settingLabelRow}>
              <Icon name="bell-ring-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.settingText}>Show Test Notification</Text>
            </View>
            <Icon name="chevron-right" size={24} color={colors.textSubtle} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={async () => {
              if (!pushNotif) {
                Alert.alert('Notifications are off', 'Turn on Push Notifications in Settings to receive device notifications.');
                return;
              }

              const res = await sendRemoteTestPushToSelf();
              if (!res.ok) {
                Alert.alert(
                  'Remote push failed',
                  'Could not send a remote push notification. Make sure you are on a real device, allowed notifications, and try again.'
                );
                return;
              }

              Alert.alert('Sent!', 'A remote push notification was sent to this device.');
            }}
          >
            <View style={styles.settingLabelRow}>
              <Icon name="cloud-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.settingText}>Send Remote Push Test (Cloud)</Text>
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

      {/* Language Modal */}
      <Modal visible={showLanguageModal} animationType="fade" transparent onRequestClose={() => setShowLanguageModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeIcon} onPress={() => setShowLanguageModal(false)}>
              <Icon name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Language</Text>
            {['English', 'Filipino', 'Spanish', 'Chinese'].map((lang) => (
              <TouchableOpacity key={lang} style={styles.languageOption} onPress={() => { setLanguage(lang); setShowLanguageModal(false); }}>
                <Text style={styles.languageText}>{lang}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Notification Preview Modal */}
      <Modal visible={showNotifPreview} animationType="fade" transparent onRequestClose={() => setShowNotifPreview(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeIcon} onPress={() => setShowNotifPreview(false)}>
              <Icon name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
            <Icon name="bell-ring-outline" size={40} color={colors.primary} style={{ alignSelf: 'center', marginBottom: 12 }} />
            <Text style={styles.modalTitle}>This is a test notification!</Text>
            <Text style={{ color: colors.textMuted, textAlign: 'center', marginBottom: 20 }}>You can preview how notifications will look here.</Text>
          </View>
        </View>
      </Modal>

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
            <Text style={{ color: colors.textMuted, marginBottom: 8 }}>Version 1.3.1</Text>
            <Text style={{ color: colors.textMuted, marginBottom: 8 }}>Privacy Policy | Terms of Service</Text>
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
});

export default SettingsScreen;
