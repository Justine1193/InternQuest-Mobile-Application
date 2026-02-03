import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { signOut, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth, firestore } from '../firebase/config';
import { RootStackParamList } from '../App';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { doc, getDoc, setDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { colors, radii, shadows, spacing } from '../ui/theme';
import { Screen } from '../ui/components/Screen';
import { AppHeader } from '../ui/components/AppHeader';
import { useBiometric } from '../context/BiometricContext';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { support, biometricEnabled, setBiometricEnabled, refreshSupport } = useBiometric();
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportContactsLoading, setSupportContactsLoading] = useState(false);
  const [adviserEmail, setAdviserEmail] = useState<string | null>(null);
  const [coordinatorEmail, setCoordinatorEmail] = useState<string | null>(null);
  const [creatorEmail, setCreatorEmail] = useState<string | null>(null);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [biometricToggling, setBiometricToggling] = useState(false);

  useEffect(() => {
    if (showSecurityModal) refreshSupport();
  }, [showSecurityModal, refreshSupport]);

  const loadAdviserAndCoordinatorEmails = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setSupportContactsLoading(true);
    setAdviserEmail(null);
    setCoordinatorEmail(null);
    setCreatorEmail(null);
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const userSnap = await getDoc(userDocRef);
      const userData = userSnap.exists() ? userSnap.data() : ({} as any);

      // Adviser & Coordinator: use emails from adminusers collection
      let foundCoordinator: string | null = null;
      let foundAdviser: string | null = null;
      const adminUsersSnap = await getDocs(collection(firestore, 'adminusers'));
      const emailsNoRole: string[] = [];
      for (const d of adminUsersSnap.docs) {
        const data = d.data() as any;
        const email = (data && typeof data.email === 'string') ? data.email : null;
        if (!email) continue;
        const role = (data && data.role) ? String(data.role) : '';
        if (role === 'super_admin') {
          if (!foundAdviser) foundAdviser = email;
        } else if (role === 'admin') {
          if (!foundCoordinator) foundCoordinator = email;
        } else {
          emailsNoRole.push(email);
        }
      }
      if (!foundCoordinator && emailsNoRole.length > 0) foundCoordinator = emailsNoRole[0];
      if (!foundAdviser && emailsNoRole.length > 1) foundAdviser = emailsNoRole[1];
      else if (!foundAdviser && emailsNoRole.length === 1 && emailsNoRole[0] !== foundCoordinator) foundAdviser = emailsNoRole[0];
      if (foundCoordinator) setCoordinatorEmail(foundCoordinator);
      if (foundAdviser) setAdviserEmail(foundAdviser);

      // Account creator: user doc may have createdByUid (uid) or createdBy (email)
      const createdByUid = userData.createdByUid;
      const createdBy = userData.createdBy;
      if (createdByUid && typeof createdByUid === 'string') {
        const creatorDoc = await getDoc(doc(firestore, 'users', createdByUid));
        if (creatorDoc.exists()) {
          const creator = creatorDoc.data() as any;
          const email = creator.email || null;
          if (email) setCreatorEmail(email);
        }
      } else if (createdBy && typeof createdBy === 'string' && createdBy.includes('@')) {
        setCreatorEmail(createdBy);
      }
    } catch (e) {
      console.warn('SettingsScreen: load adviser/coordinator/creator emails failed', e);
    } finally {
      setSupportContactsLoading(false);
    }
  };

  useEffect(() => {
    if (showSupportModal) loadAdviserAndCoordinatorEmails();
  }, [showSupportModal]);

  const loadSkillSuggestions = async () => {
    try {
      const skillsDoc = await getDoc(doc(firestore, 'meta', 'suggestionSkills'));
      if (skillsDoc.exists()) {
        const data = skillsDoc.data();
        let list: string[] = Array.isArray(data?.list)
          ? [...new Set((data.list as any[]).map((s: any) => String(s).trim()).filter(Boolean))]
          : [];
        setSkillSuggestions(list);
      }
    } catch (e) {
      console.warn('SettingsScreen: load skill suggestions failed', e);
    }
  };

  const loadFieldSuggestions = async () => {
    try {
      const fieldDoc = await getDoc(doc(firestore, 'meta', 'field'));
      if (fieldDoc.exists()) {
        const data = fieldDoc.data();
        let list: string[] = Array.isArray(data?.list)
          ? [...new Set((data.list as any[]).map((s: any) => String(s).trim()).filter(Boolean))]
          : [];
        setFieldSuggestions(list);
      }
    } catch (e) {
      console.warn('SettingsScreen: load field suggestions failed', e);
    }
  };

  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [userData, setUserData] = useState<any>({});
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [skillDropdownVisible, setSkillDropdownVisible] = useState(false);
  const skillDropdownTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const MAX_SKILLS = 5;

  const [fields, setFields] = useState<string[]>([]);
  const [fieldInput, setFieldInput] = useState('');
  const [fieldSuggestions, setFieldSuggestions] = useState<string[]>([]);
  const [fieldDropdownVisible, setFieldDropdownVisible] = useState(false);
  const fieldDropdownTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const MAX_FIELDS = 5;

  useEffect(() => () => {
    if (skillDropdownTimeoutRef.current) clearTimeout(skillDropdownTimeoutRef.current);
    if (fieldDropdownTimeoutRef.current) clearTimeout(fieldDropdownTimeoutRef.current);
  }, []);

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
      const rawPhone = (data as any).contact || (data as any).phone || '';
      setPhone(rawPhone ? (() => {
        const d = String(rawPhone).replace(/\D/g, '').slice(0, 11);
        if (d.length <= 10 && d[0] !== '0') return '0' + d;
        return d || rawPhone;
      })() : '');
      const rawSkills = (data as any).skills;
      setSkills(Array.isArray(rawSkills) ? rawSkills.filter((s: any) => typeof s === 'string' && s.trim()) : []);
      setSkillInput('');
      const rawFields = (data as any).field;
      setFields(Array.isArray(rawFields) ? rawFields.filter((s: any) => typeof s === 'string' && s.trim()) : (typeof rawFields === 'string' && rawFields.trim() ? [rawFields.trim()] : []));
      setFieldInput('');
      await Promise.all([loadSkillSuggestions(), loadFieldSuggestions()]);
      setEditProfileModalVisible(true);
    } catch (error: any) {
      console.error('SettingsScreen: loadProfileForEditing failed:', error);
      Alert.alert('Error', error.message || 'Failed to load profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const formatPhoneInput = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 11);
    if (digits.length === 0) return '';
    if (digits[0] !== '0') return '0' + digits.slice(0, 10);
    return digits;
  };

  const handleSaveProfile = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'No user is currently signed in.');
      return;
    }
    const phoneTrimmed = phone.replace(/\D/g, '');
    if (phoneTrimmed.length > 0 && (phoneTrimmed.length !== 11 || phoneTrimmed[0] !== '0')) {
      Alert.alert('Invalid phone', 'Phone must be 11 digits starting with 0 (e.g. 09xxxxxxxxx).');
      return;
    }
    setProfileSaving(true);
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      let displayName = name.trim();
      if (!displayName && userData?.firstName && userData?.lastName) {
        displayName = `${userData.firstName} ${userData.lastName}`;
      }
      const updatedData = {
        ...userData,
        name: displayName,
        email: userData?.email || user.email || email,
        phone: phoneTrimmed || undefined,
        contact: phoneTrimmed || undefined,
        skills: skills,
        field: fields,
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

  const renderSettingRow = (
      icon: string,
      iconColor: string,
      label: string,
      onPress: () => void,
      right?: React.ReactNode
    ) => (
      <TouchableOpacity
        style={styles.settingRow}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={[styles.settingRowIconWrap, { backgroundColor: iconColor + '18' }]}>
          <Icon name={icon as any} size={22} color={iconColor} />
        </View>
        <Text style={styles.settingRowLabel}>{label}</Text>
        {right ?? <Icon name="chevron-right" size={22} color={colors.textSubtle} />}
      </TouchableOpacity>
    );

  return (
    <Screen scroll style={{ backgroundColor: colors.white }} contentContainerStyle={styles.container}>
      {/* Hero header */}
      <View style={styles.heroContainer}>
        <View style={styles.heroCard}>
          <View style={styles.heroTitleRow}>
            <View style={styles.heroIconWrap}>
              <Icon name="cog-outline" size={28} color={colors.onPrimary} />
            </View>
            <Text style={styles.heroTitle}>Settings</Text>
          </View>
          <Text style={styles.heroSubtitle}>
            Manage your account and security.
          </Text>
        </View>
      </View>

      {/* ACCOUNT */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Account</Text>
        {renderSettingRow(
          'account-edit-outline',
          colors.primary,
          'Edit Profile',
          loadProfileForEditing,
          profileLoading ? <ActivityIndicator size="small" color={colors.primary} /> : undefined
        )}
        <View style={styles.rowDivider} />
        {renderSettingRow(
          'key-outline',
          colors.warning,
          'Change Password',
          () => {
            setChangePasswordError('');
            setChangePasswordSuccess('');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            setChangePasswordModalVisible(true);
          }
        )}
      </View>

      {/* SECURITY */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Security</Text>
        {renderSettingRow('shield-lock-outline', colors.success, 'Biometric Security', () => setShowSecurityModal(true))}
      </View>

      {/* CONTACT ADVISER */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Contact Adviser</Text>
        {renderSettingRow('school', colors.primary, 'Contact Adviser', () => setShowSupportModal(true))}
      </View>

      {/* ABOUT */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>About</Text>
        {renderSettingRow('information-outline', colors.warning, 'Version, Privacy & Terms', () => setShowAboutModal(true))}
      </View>

      {/* Log Out */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
        <Icon name="logout" size={22} color={colors.onPrimary} style={styles.logoutIcon} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>


      {/* Biometric Security Modal */}
      <Modal visible={showSecurityModal} animationType="fade" transparent onRequestClose={() => setShowSecurityModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.modalContentStretch]}>
            <TouchableOpacity style={styles.closeIcon} onPress={() => setShowSecurityModal(false)}>
              <Icon name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Biometric Security</Text>
            {support && !support.supported && (
              <Text style={styles.modalBodyText}>Biometric authentication is not available on this device.</Text>
            )}
            {support && support.supported && !support.enrolled && (
              <Text style={styles.modalBodyText}>No biometric credentials are set up on this device. Add a fingerprint or face in your device settings to use this feature.</Text>
            )}
            {support && support.supported && support.enrolled && (
              <>
                <Text style={styles.modalBodyText}>Use fingerprint or face to unlock the app when you return to it.</Text>
                <View style={styles.biometricToggleRow}>
                  <Text style={styles.biometricToggleLabel}>Use biometric to unlock app</Text>
                  <Switch
                    value={biometricEnabled}
                    onValueChange={async (value) => {
                      setBiometricToggling(true);
                      try {
                        await setBiometricEnabled(value);
                      } catch (e) {
                        Alert.alert('Error', 'Could not update biometric setting.');
                      } finally {
                        setBiometricToggling(false);
                      }
                    }}
                    disabled={biometricToggling}
                    trackColor={{ false: colors.border, true: colors.primarySoft }}
                    thumbColor={biometricEnabled ? colors.primary : colors.textSubtle}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Contact Adviser Modal */}
      <Modal visible={showSupportModal} animationType="fade" transparent onRequestClose={() => setShowSupportModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeIcon} onPress={() => setShowSupportModal(false)}>
              <Icon name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Contact Adviser</Text>
            <Text style={styles.modalBodyText}>Reach out to your adviser or coordinator for help. Tap an email to open it in your mail app.</Text>
            {supportContactsLoading ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 16 }} />
            ) : (
              <View style={styles.contactEmailsBlock}>
                {adviserEmail ? (
                  <TouchableOpacity
                    style={styles.contactEmailRow}
                    onPress={() => Linking.openURL(`mailto:${adviserEmail}`)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.contactEmailIconWrap}>
                      <Icon name="school" size={22} color={colors.primary} />
                    </View>
                    <View style={styles.contactEmailTextWrap}>
                      <Text style={styles.contactEmailLabel}>Adviser</Text>
                      <Text style={styles.contactEmailValue} selectable>{adviserEmail}</Text>
                    </View>
                    <Icon name="open-in-new" size={20} color={colors.primary} />
                  </TouchableOpacity>
                ) : null}
                {coordinatorEmail ? (
                  <TouchableOpacity
                    style={styles.contactEmailRow}
                    onPress={() => Linking.openURL(`mailto:${coordinatorEmail}`)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.contactEmailIconWrap}>
                      <Icon name="account-tie-outline" size={22} color={colors.primary} />
                    </View>
                    <View style={styles.contactEmailTextWrap}>
                      <Text style={styles.contactEmailLabel}>Coordinator</Text>
                      <Text style={styles.contactEmailValue} selectable>{coordinatorEmail}</Text>
                    </View>
                    <Icon name="open-in-new" size={20} color={colors.primary} />
                  </TouchableOpacity>
                ) : null}
                {creatorEmail ? (
                  <TouchableOpacity
                    style={styles.contactEmailRow}
                    onPress={() => Linking.openURL(`mailto:${creatorEmail}`)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.contactEmailIconWrap}>
                      <Icon name="account-plus-outline" size={22} color={colors.primary} />
                    </View>
                    <View style={styles.contactEmailTextWrap}>
                      <Text style={styles.contactEmailLabel}>Account created by</Text>
                      <Text style={styles.contactEmailValue} selectable>{creatorEmail}</Text>
                    </View>
                    <Icon name="open-in-new" size={20} color={colors.primary} />
                  </TouchableOpacity>
                ) : null}
                {!supportContactsLoading && !adviserEmail && !coordinatorEmail && !creatorEmail ? (
                  <Text style={styles.contactEmailFallback}>No adviser, coordinator, or creator email on file. Please ask your school.</Text>
                ) : null}
              </View>
            )}
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
            <Text style={styles.modalBodyText}>Version 1.3.6</Text>
            <Text style={[styles.modalBodyText, { marginTop: 8 }]}>Privacy Policy | Terms of Service</Text>
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
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={20}
        >
          <View style={[styles.modalContent, styles.modalContentStretch, styles.editProfileModal]}>
            <TouchableOpacity style={styles.closeIcon} onPress={() => setEditProfileModalVisible(false)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Icon name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
            <Text style={styles.editProfileTitle}>Edit Profile</Text>
            <Text style={styles.editProfileSubtitle}>Update your name, phone, fields, and skills below.</Text>
            <ScrollView style={styles.modalScroll} contentContainerStyle={styles.editProfileScrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.editProfileSectionLabel}>Account info (read-only)</Text>
              <View style={styles.profileInfoBlock}>
                <View style={styles.profileInfoRow}>
                  <View style={styles.profileInfoIconWrap}>
                    <Icon name="card-account-details-outline" size={20} color={colors.textMuted} />
                  </View>
                  <Text style={styles.profileInfoLabel}>Student number</Text>
                  <Text style={styles.profileInfoValue}>{userData.studentId ?? '—'}</Text>
                </View>
                <View style={styles.profileInfoRow}>
                  <View style={styles.profileInfoIconWrap}>
                    <Icon name="email-outline" size={20} color={colors.textMuted} />
                  </View>
                  <Text style={styles.profileInfoLabel}>Email</Text>
                  <Text style={styles.profileInfoValue}>{userData.email || auth.currentUser?.email || '—'}</Text>
                </View>
                <View style={[styles.profileInfoRow, styles.profileInfoRowLast]}>
                  <View style={styles.profileInfoIconWrap}>
                    <Icon name="school-outline" size={20} color={colors.textMuted} />
                  </View>
                  <Text style={styles.profileInfoLabel}>Program</Text>
                  <Text style={styles.profileInfoValue}>{userData.program || userData.course || '—'}</Text>
                </View>
              </View>

              <Text style={[styles.editProfileSectionLabel, styles.editProfileSectionLabelTop]}>What you can edit</Text>
              <View style={styles.editProfileFieldGroup}>
                <View style={styles.editProfileFieldLabelRow}>
                  <View style={styles.editProfileFieldIconWrap}>
                    <Icon name="account-edit-outline" size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.fieldLabel}>Display name</Text>
                </View>
                <TextInput style={styles.editProfileInput} value={name} onChangeText={setName} placeholder="Your full name" placeholderTextColor={colors.textSubtle} />
              </View>

              <View style={styles.editProfileFieldGroup}>
                <View style={styles.editProfileFieldLabelRow}>
                  <View style={styles.editProfileFieldIconWrap}>
                    <Icon name="phone-outline" size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.fieldLabel}>Phone number</Text>
                </View>
                <TextInput
                  style={styles.editProfileInput}
                  value={phone}
                  onChangeText={(t) => setPhone(formatPhoneInput(t))}
                  keyboardType="phone-pad"
                  placeholder="09xxxxxxxxx"
                  placeholderTextColor={colors.textSubtle}
                  maxLength={11}
                />
              </View>

              <View style={styles.editProfileFieldGroup}>
                <View style={styles.editProfileFieldLabelRow}>
                  <View style={styles.editProfileFieldIconWrap}>
                    <Icon name="briefcase-outline" size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.fieldLabel}>Field of interest</Text>
                </View>
              <View style={styles.skillTagContainer}>
                <TextInput
                  style={styles.skillTagInput}
                  value={fieldInput}
                  onChangeText={(t) => {
                    setFieldInput(t);
                    setFieldDropdownVisible(true);
                  }}
                  placeholder="Search fields..."
                  placeholderTextColor={colors.textSubtle}
                  onFocus={() => {
                    if (fieldDropdownTimeoutRef.current) {
                      clearTimeout(fieldDropdownTimeoutRef.current);
                      fieldDropdownTimeoutRef.current = null;
                    }
                    setFieldDropdownVisible(true);
                  }}
                  onBlur={() => {
                    fieldDropdownTimeoutRef.current = setTimeout(() => setFieldDropdownVisible(false), 200);
                  }}
                  onSubmitEditing={() => {
                    const v = fieldInput.trim();
                    if (!v) return;
                    if (fields.includes(v)) {
                      setFieldInput('');
                      return;
                    }
                    if (fields.length >= MAX_FIELDS) return;
                    setFields([...fields, v]);
                    setFieldInput('');
                  }}
                  returnKeyType="done"
                  blurOnSubmit={false}
                />
                {fieldDropdownVisible && fieldSuggestions.length > 0 ? (
                  <View style={styles.skillDropdown}>
                    <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled style={styles.skillDropdownScroll} showsVerticalScrollIndicator={false}>
                      {(fieldInput.trim()
                        ? fieldSuggestions.filter((s) => s.toLowerCase().includes(fieldInput.trim().toLowerCase()))
                        : fieldSuggestions
                      )
                        .slice(0, 12)
                        .map((s) => (
                          <TouchableOpacity
                            key={s}
                            style={styles.skillDropdownItem}
                            onPress={() => {
                              if (fields.includes(s) || fields.length >= MAX_FIELDS) return;
                              setFields([...fields, s]);
                              setFieldInput('');
                              setFieldDropdownVisible(false);
                            }}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.skillDropdownItemText}>{s}</Text>
                          </TouchableOpacity>
                        ))}
                    </ScrollView>
                  </View>
                ) : null}
                <View style={styles.skillChipsRow}>
                  {fields.map((s, i) => (
                    <View key={`f-${s}-${i}`} style={styles.skillTagChip}>
                      <Text style={styles.skillTagChipText} numberOfLines={1}>{s}</Text>
                      <TouchableOpacity
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        onPress={() => setFields(fields.filter((_, idx) => idx !== i))}
                        style={styles.skillTagChipRemove}
                      >
                        <Icon name="close" size={16} color={colors.textMuted} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
                <Text style={styles.skillTagCounter}>{fields.length} of {MAX_FIELDS} fields</Text>
              </View>
              </View>

              <View style={styles.editProfileFieldGroup}>
                <View style={styles.editProfileFieldLabelRow}>
                  <View style={styles.editProfileFieldIconWrap}>
                    <Icon name="star-outline" size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.fieldLabel}>Skills</Text>
                </View>
              <View style={styles.skillTagContainer}>
                <TextInput
                  style={styles.skillTagInput}
                  value={skillInput}
                  onChangeText={(t) => {
                    setSkillInput(t);
                    setSkillDropdownVisible(true);
                  }}
                  placeholder="Search skills..."
                  placeholderTextColor={colors.textSubtle}
                  onFocus={() => {
                    if (skillDropdownTimeoutRef.current) {
                      clearTimeout(skillDropdownTimeoutRef.current);
                      skillDropdownTimeoutRef.current = null;
                    }
                    setSkillDropdownVisible(true);
                  }}
                  onBlur={() => {
                    skillDropdownTimeoutRef.current = setTimeout(() => setSkillDropdownVisible(false), 200);
                  }}
                  onSubmitEditing={() => {
                    const v = skillInput.trim();
                    if (!v) return;
                    if (skills.includes(v)) {
                      setSkillInput('');
                      return;
                    }
                    if (skills.length >= MAX_SKILLS) return;
                    setSkills([...skills, v]);
                    setSkillInput('');
                  }}
                  returnKeyType="done"
                  blurOnSubmit={false}
                />
                {skillDropdownVisible && skillSuggestions.length > 0 ? (
                  <View style={styles.skillDropdown}>
                    <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled style={styles.skillDropdownScroll} showsVerticalScrollIndicator={false}>
                      {(skillInput.trim()
                        ? skillSuggestions.filter((s) => s.toLowerCase().includes(skillInput.trim().toLowerCase()))
                        : skillSuggestions
                      )
                        .slice(0, 12)
                        .map((s) => (
                          <TouchableOpacity
                            key={s}
                            style={styles.skillDropdownItem}
                            onPress={() => {
                              if (skills.includes(s) || skills.length >= MAX_SKILLS) return;
                              setSkills([...skills, s]);
                              setSkillInput('');
                              setSkillDropdownVisible(false);
                            }}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.skillDropdownItemText}>{s}</Text>
                          </TouchableOpacity>
                        ))}
                    </ScrollView>
                  </View>
                ) : null}
                <View style={styles.skillChipsRow}>
                  {skills.map((s, i) => (
                    <View key={`${s}-${i}`} style={styles.skillTagChip}>
                      <Text style={styles.skillTagChipText} numberOfLines={1}>{s}</Text>
                      <TouchableOpacity
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        onPress={() => setSkills(skills.filter((_, idx) => idx !== i))}
                        style={styles.skillTagChipRemove}
                      >
                        <Icon name="close" size={16} color={colors.textMuted} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
                <Text style={styles.skillTagCounter}>{skills.length} of {MAX_SKILLS} skills</Text>
              </View>
              </View>

              <View style={styles.editProfileActions}>
                <TouchableOpacity
                  style={styles.editProfileCancelBtn}
                  onPress={() => setEditProfileModalVisible(false)}
                  disabled={profileSaving}
                  activeOpacity={0.7}
                >
                  <Text style={styles.editProfileCancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.editProfileSaveBtn, profileSaving && { opacity: 0.7 }]}
                  onPress={handleSaveProfile}
                  disabled={profileSaving}
                  activeOpacity={0.85}
                >
                  <Text style={styles.editProfileSaveBtnText}>{profileSaving ? 'Saving...' : 'Save'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={changePasswordModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setChangePasswordModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={20}
        >
          <View style={[styles.modalContent, styles.modalContentStretch]}>
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
              placeholderTextColor={colors.textSubtle}
            />

            <Text style={styles.fieldLabel}>New Password</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholder="Enter new password (min 8 characters)"
              placeholderTextColor={colors.textSubtle}
            />

            <Text style={styles.fieldLabel}>Confirm New Password</Text>
            <TextInput
              style={styles.input}
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              secureTextEntry
              placeholder="Confirm new password"
              placeholderTextColor={colors.textSubtle}
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.cancelButton, styles.modalButtonLeft]}
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
                style={[styles.saveButton, styles.modalButtonRight, changePasswordLoading && { opacity: 0.7 }]}
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
        </KeyboardAvoidingView>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 0,
    paddingBottom: 36,
    paddingHorizontal: 18,
  },
  heroContainer: {
    paddingTop: 14,
    paddingBottom: 22,
    backgroundColor: colors.primary,
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  heroCard: {
    paddingVertical: 4,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.onPrimary,
    letterSpacing: 0.2,
  },
  heroSubtitle: {
    fontSize: 14,
    color: colors.onPrimarySubtle,
    lineHeight: 21,
    maxWidth: '95%',
  },
  /* Section cards */
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
    marginTop: 10,
    paddingHorizontal: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    minHeight: 56,
  },
  settingRowIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingRowLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 4 + 44 + 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 36,
    backgroundColor: colors.danger,
    minHeight: 52,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: radii.lg,
    ...shadows.card,
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  /* Legacy / unused – keep for compatibility */
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16 },
  settingRowTight: { marginBottom: 0, paddingVertical: 12, minHeight: 48 },
  settingLabelRow: { flexDirection: 'row', alignItems: 'center' },
  settingText: { fontSize: 16, color: colors.text },
  profileRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  profilePic: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surfaceAlt },
  profilePicLargeWrap: { alignItems: 'center', marginBottom: 16 },
  profilePicLarge: { width: 90, height: 90, borderRadius: 45, backgroundColor: colors.surfaceAlt },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 18,
    fontSize: 16,
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    minHeight: 50,
  },
  saveButton: {
    backgroundColor: colors.primary,
    minHeight: 50,
    paddingVertical: 14,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: colors.surfaceAlt,
    minHeight: 50,
    paddingVertical: 14,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
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
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: 24,
    paddingTop: 52,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    color: colors.text,
    alignSelf: 'stretch',
  },
  modalContentStretch: {
    alignItems: 'stretch',
  },
  modalScroll: {
    width: '100%',
    maxHeight: 480,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  modalButtonLeft: {
    flex: 1,
    marginRight: 6,
  },
  modalButtonRight: {
    flex: 1,
    marginLeft: 6,
  },
  modalBodyText: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    alignSelf: 'stretch',
  },
  contactEmailsBlock: {
    alignSelf: 'stretch',
    marginTop: 16,
  },
  contactEmailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 64,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contactEmailIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  contactEmailIcon: {
    marginRight: 14,
  },
  contactEmailTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  contactEmailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  contactEmailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 22,
  },
  contactEmailFallback: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginTop: 12,
    alignSelf: 'stretch',
  },
  biometricToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    minHeight: 56,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
  },
  biometricToggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 12,
  },
  languageOption: { paddingVertical: 12, alignItems: 'center', width: '100%' },
  languageText: { fontSize: 16, color: colors.text },
  closeIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 10,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 8 },
  editProfileModal: {
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  editProfileTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  editProfileSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 21,
    marginBottom: 24,
    alignSelf: 'stretch',
  },
  editProfileSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    alignSelf: 'stretch',
  },
  editProfileSectionLabelTop: {
    marginTop: 24,
    marginBottom: 14,
  },
  editProfileScrollContent: {
    paddingBottom: 28,
  },
  profileInfoBlock: {
    alignSelf: 'stretch',
    marginBottom: 8,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  profileInfoRowLast: {
    borderBottomWidth: 0,
  },
  profileInfoIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileInfoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    width: 120,
  },
  profileInfoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
  editProfileFieldGroup: {
    alignSelf: 'stretch',
    marginBottom: 20,
  },
  editProfileFieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  editProfileFieldIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  editProfileInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: colors.surface,
    color: colors.text,
    minHeight: 52,
  },
  skillTagContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    marginTop: 4,
  },
  skillTagInput: {
    fontSize: 15,
    color: colors.text,
    paddingVertical: 8,
    paddingHorizontal: 0,
    marginBottom: 12,
  },
  skillChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    gap: 8,
  },
  skillTagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingVertical: 8,
    paddingLeft: 14,
    paddingRight: 8,
    maxWidth: '100%',
  },
  skillTagChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginRight: 6,
    maxWidth: 160,
  },
  skillTagChipRemove: {
    padding: 4,
  },
  skillTagCounter: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
  },
  skillDropdown: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    marginTop: 0,
    marginBottom: 12,
    maxHeight: 220,
    overflow: 'hidden',
  },
  skillDropdownScroll: {
    maxHeight: 216,
  },
  skillDropdownItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  skillDropdownItemText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  skillSuggestionsWrap: {
    marginBottom: 20,
  },
  skillSuggestionsLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
    marginBottom: 8,
  },
  skillSuggestionsList: {
    flexDirection: 'row',
    paddingRight: 8,
  },
  skillChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  skillChipSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  skillChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  skillChipTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  editProfileActions: {
    marginTop: 28,
    flexDirection: 'row',
    gap: 14,
  },
  editProfileSaveBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    minHeight: 52,
    paddingVertical: 16,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editProfileSaveBtnText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  editProfileCancelBtn: {
    flex: 1,
    minHeight: 52,
    paddingVertical: 16,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  editProfileCancelBtnText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  editSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 12,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginBottom: 8,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginBottom: 12,
    alignSelf: 'stretch',
  },
  successText: {
    color: colors.success,
    fontSize: 14,
    marginBottom: 12,
    alignSelf: 'stretch',
  },
});

export default SettingsScreen;
