import { colors, radii, shadows, spacing } from '../ui/theme';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  findNodeHandle,
  UIManager,
  Dimensions,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, updateDoc, getDoc, orderBy, startAt, endAt, addDoc, deleteDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebase/config';
import { updatePassword } from "firebase/auth";
import { Portal } from 'react-native-portalize';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Screen } from '../ui/components/Screen';
import { AppHeader } from '../ui/components/AppHeader';

type NavigationProp = StackNavigationProp<RootStackParamList, 'SetupAccount'>;

type SetupAccountScreenProps = {
  navigation: any;
  route: any;
  onSetupComplete: () => void;
};

type ProgramCategory = {
  category: string;
  programs: { label: string; value: string }[];
};

type FieldCategory = {
  category: string;
  fields: { label: string; value: string }[];
};

const CARD_HORIZONTAL_PADDING = 20;
const BRAND_BLUE = '#2B7FFF';

export const SetupAccountScreen: React.FC<SetupAccountScreenProps> = ({
  navigation,
  route,
  onSetupComplete,
}) => {
  // --- State: Personal Info ---
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contact, setContact] = useState('');
  const [contactOverLimit, setContactOverLimit] = useState(false);
  const [gender, setGender] = useState('');
  const [program, setProgram] = useState('');
  const [fields, setFields] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);

  // --- State: Preferences ---
  const [locationPreference, setLocationPreference] = useState('');

  // --- State: Dropdowns & Search ---
  const [skillSearch, setSkillSearch] = useState('');
  const [programSearch, setProgramSearch] = useState('');
  const [fieldSearch, setFieldSearch] = useState('');
  const [showProgramOptions, setShowProgramOptions] = useState(false);
  const [showFieldOptions, setShowFieldOptions] = useState(false);
  const [programCategories, setProgramCategories] = useState<ProgramCategory[]>([]);
  const [fieldCategories, setFieldCategories] = useState<FieldCategory[]>([]);
  const [programList, setProgramList] = useState<string[]>([]);
  const [fieldList, setFieldList] = useState<string[]>([]);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [parentScrollEnabled, setParentScrollEnabled] = useState(true);
  const [programDropdownPos, setProgramDropdownPos] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [fieldDropdownPos, setFieldDropdownPos] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skillDropdownPos, setSkillDropdownPos] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [showSkillOptions, setShowSkillOptions] = useState(false);
  const [field, setField] = useState('');
  const windowHeight = Dimensions.get('window').height;
  // New state for Firestore search
  const [programOptions, setProgramOptions] = useState<string[]>([]);
  const [fieldOptions, setFieldOptions] = useState<string[]>([]);
  const [skillOptions, setSkillOptions] = useState<string[]>([]);
  const [programLoading, setProgramLoading] = useState(false);
  const [fieldLoading, setFieldLoading] = useState(false);
  const [skillLoading, setSkillLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);

  // If the admin created the user doc under a different document ID than auth.uid,
  // we remember that legacy doc id so we can migrate it and avoid duplicates.
  const [legacyUserDocId, setLegacyUserDocId] = useState<string | null>(null);

  // --- Refs ---
  const scrollViewRef = useRef<ScrollView>(null);
  const firstNameRef = useRef<TextInput>(null);
  const lastNameRef = useRef<TextInput>(null);
  const programRef = useRef<TextInput>(null);
  const fieldRef = useRef<TextInput>(null);
  const skillRef = useRef<TextInput>(null);

  // --- Utility: Scroll to input ---
  const scrollToInput = (inputRef: React.RefObject<TextInput>) => {
    if (inputRef.current && scrollViewRef.current) {
      const inputHandle = findNodeHandle(inputRef.current);
      const scrollHandle = findNodeHandle(scrollViewRef.current);
      if (inputHandle && scrollHandle) {
        UIManager.measureLayout(
          inputHandle,
          scrollHandle,
          () => { },
          (x, y) => {
            scrollViewRef.current?.scrollTo({ y: y - 20, animated: true });
          }
        );
      }
    }
  };

  // --- Utility: Measure dropdown positions ---
  const measureProgramInput = () => {
    if (programRef.current) {
      programRef.current.measureInWindow((x, y, width, height) => {
        setProgramDropdownPos({
          x: x - CARD_HORIZONTAL_PADDING,
          y: y + height + 4,
          width,
          height: 220,
        });
      });
    }
  };
  const measureFieldInput = () => {
    if (fieldRef.current) {
      fieldRef.current.measureInWindow((x, y, width, height) => {
        setFieldDropdownPos({
          x: x - CARD_HORIZONTAL_PADDING,
          y: y + height + 4,
          width,
          height: 220,
        });
      });
    }
  };
  const measureSkillInput = () => {
    if (skillRef.current) {
      skillRef.current.measureInWindow((x, y, width, height) => {
        setSkillDropdownPos({
          x: x - CARD_HORIZONTAL_PADDING,
          y: y + height + 4,
          width,
          height: 220,
        });
      });
    }
  };

  // --- Debounce utility ---
  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  // --- Firestore prefix search ---
  const fetchFirestoreOptions = async (collectionName: string, searchText: string) => {
    if (!searchText) return [];
    const q = query(
      collection(firestore, collectionName),
      orderBy('name'),
      startAt(searchText),
      endAt(searchText + '\uf8ff')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc: any) => doc.data().name);
  };

  // --- Persist newly added options (programs/fields/skills) ---
  const persistNewOption = async (kind: 'program' | 'field' | 'skill', value: string) => {
    const clean = String(value).trim();
    if (!clean) return;
    try {
      // Add to dedicated collection for prefix search
      const coll = kind === 'program' ? 'programs' : kind === 'field' ? 'fields' : 'skills';
      await addDoc(collection(firestore, coll), { name: clean, createdAt: serverTimestamp() });
    } catch (e) {
      console.warn('persistNewOption failed', kind, value, e);
    }
  };

  // --- Handlers for dropdown search ---
  const debouncedFetchPrograms = useRef(debounce(async (text: string) => {
    setProgramLoading(true);
    setProgramOptions(await fetchFirestoreOptions('programs', text));
    setProgramLoading(false);
  }, 300)).current;
  const debouncedFetchFields = useRef(debounce(async (text: string) => {
    setFieldLoading(true);
    setFieldOptions(await fetchFirestoreOptions('fields', text));
    setFieldLoading(false);
  }, 300)).current;
  const debouncedFetchSkills = useRef(debounce(async (text: string) => {
    setSkillLoading(true);
    setSkillOptions(await fetchFirestoreOptions('skills', text));
    setSkillLoading(false);
  }, 300)).current;

  // --- Update search handlers ---
  useEffect(() => {
    if (programSearch.trim().length > 0) {
      debouncedFetchPrograms(programSearch.trim());
    } else {
      setProgramOptions([]);
    }
  }, [programSearch]);
  useEffect(() => {
    if (fieldSearch.trim().length > 0) {
      debouncedFetchFields(fieldSearch.trim());
    } else {
      setFieldOptions([]);
    }
  }, [fieldSearch]);
  useEffect(() => {
    if (skillSearch.trim().length > 0) {
      debouncedFetchSkills(skillSearch.trim());
    } else {
      setSkillOptions([]);
    }
  }, [skillSearch]);

  // --- Fetch meta data for dropdowns ---
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        console.log('📚 Fetching programs from meta/programs document...');
        // Fetch programs from the 'meta/programs' document
        const programsDoc = await getDoc(doc(firestore, 'meta', 'programs'));
        const programs: string[] = [];
        
        if (programsDoc.exists()) {
          const data = programsDoc.data();
          console.log('📚 Programs document data:', data);
          
          // Extract all program names from the nested structure
          Object.values(data).forEach((college: any) => {
            if (typeof college === 'object' && college !== null) {
              Object.values(college).forEach((program: any) => {
                if (typeof program === 'string') {
                  programs.push(program);
                }
              });
            }
          });
        }
        
        console.log('📚 Loaded programs:', programs);
        setProgramList(programs);

        console.log('📚 Fetching fields...');
        const fieldDoc = await getDoc(doc(firestore, 'meta', 'field'));
        if (fieldDoc.exists()) {
          console.log('📚 Field data:', fieldDoc.data());
          setFieldList(fieldDoc.data().list || []);
        } else {
          console.log('⚠️ No field document found');
        }
        // Fetch skills for dropdown
        const skillsDoc = await getDoc(doc(firestore, 'meta', 'suggestionSkills'));
        if (skillsDoc.exists()) {
          const skillsData = skillsDoc.data();
          let skillsArray: string[] = [];
            if (Array.isArray(skillsData.list)) {
            // Remove duplicates and trim whitespace
            skillsArray = [...new Set(skillsData.list.map((skill: any) => String(skill).trim()))] as string[];
          } else {
            skillsArray = [...new Set(Object.values(skillsData).map((skill: any) => String(skill).trim()))] as string[];
          }
          setAvailableSkills(skillsArray);
        }
      } catch (error) {
        console.error('Failed to fetch meta:', error);
      }
      setIsLoading(false);
    };
    fetchMeta();
  }, []);

  // --- Auth check and fetch user data ---
  useEffect(() => {
    const fetchUserData = async () => {
      console.log('🔄 useEffect running, currentUser:', auth.currentUser?.uid);
      console.log('🔄 currentUser email:', auth.currentUser?.email);
      if (!auth.currentUser) {
        console.log('⚠️ No current user');
        return; // Don't show alert here, just skip
      }

      // Fetch existing user data from Firestore
      try {
        const uid = auth.currentUser.uid;
        const userEmail = auth.currentUser.email;
        console.log('📋 Fetching user data for UID:', uid);
        console.log('📋 Email:', userEmail);
        
        // Set email from auth
        if (userEmail) setEmail(userEmail);
        
        const userDocRef = doc(firestore, 'users', uid);
        console.log('📋 User doc ref path:', userDocRef.path);
        
        let userDoc: any = await getDoc(userDocRef);
        
        // If not found, try searching by email
        if (!userDoc.exists() && userEmail) {
          console.log('⚠️ UID search failed, trying email search:', userEmail);
          const userQuery = query(collection(firestore, 'users'), where('email', '==', userEmail));
          const querySnapshot = await getDocs(userQuery);
          if (!querySnapshot.empty) {
            console.log('✅ Found user by email');
            userDoc = querySnapshot.docs[0];
            if (userDoc.id && userDoc.id !== uid) {
              console.log('🧩 Found legacy user doc id (different from auth.uid):', userDoc.id);
              setLegacyUserDocId(userDoc.id);
            }
          }
        }
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log('📋 User data found:', JSON.stringify(data, null, 2));
          if (data.studentId) {
            console.log('✅ Setting studentId:', data.studentId);
            setStudentId(data.studentId);
          }
          if (data.firstName) {
            console.log('✅ Setting firstName:', data.firstName);
            setFirstName(data.firstName);
          } else {
            console.log('⚠️ No firstName in data');
          }
          if (data.lastName) {
            console.log('✅ Setting lastName:', data.lastName);
            setLastName(data.lastName);
          } else {
            console.log('⚠️ No lastName in data');
          }
          if (data.contact || data.contactNumber || data.phoneNumber || data.phone) {
            const contactValue = data.contact || data.contactNumber || data.phoneNumber || data.phone;
            console.log('✅ Setting contact:', contactValue);
            setContact(contactValue);
          }
          // Optionally pre-populate other fields if they exist
          if (data.gender) setGender(data.gender);
          if (data.program) {
            setProgram(data.program);
            setProgramSearch(data.program);
          }
          if (data.field) {
            setField(data.field);
            setFieldSearch(data.field);
          }
          if (data.locationPreference) setLocationPreference(data.locationPreference);
          if (data.skills && Array.isArray(data.skills)) setSkills(data.skills);
        } else {
          console.log('⚠️ User document does not exist at path:', userDocRef.path);
          console.log('⚠️ Tried both UID and email search - profile not found');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [auth.currentUser?.uid]);

  // --- Checkbox toggle ---
  const selectLocationPreference = (type: 'remote' | 'onsite' | 'hybrid') => {
    setLocationPreference(type);
  };

  // --- Finish Setup: Save to Firestore and mark profile complete ---
  const finishSetup = async () => {
    if (!auth.currentUser) {
      Alert.alert('Error', 'You must be logged in to complete setup.');
      return;
    }
    if (!validateForm()) return;
    setSaving(true);
    try {
      const userId = auth.currentUser.uid;
      const userRef = doc(firestore, 'users', userId);

      // If the account was provisioned by admin under a different Firestore doc ID,
      // migrate that legacy doc into the UID doc to prevent duplicate rows in admin lists.
      if (legacyUserDocId && legacyUserDocId !== userId) {
        try {
          console.log('🧩 Migrating legacy user doc to UID doc:', { legacyUserDocId, userId });
          const legacyRef = doc(firestore, 'users', legacyUserDocId);
          const legacySnap = await getDoc(legacyRef);
          if (legacySnap.exists()) {
            const legacyData: any = legacySnap.data();
            // Copy everything from legacy into UID doc first (keeps createdAt, studentId, etc.)
            await setDoc(userRef, {
              ...legacyData,
              migratedFromUserDocId: legacyUserDocId,
              migratedToAuthUidAt: serverTimestamp(),
            }, { merge: true });
          }

          // Best-effort cleanup: delete the legacy doc so admin won't see duplicates.
          try {
            await deleteDoc(doc(firestore, 'users', legacyUserDocId));
            console.log('🧹 Deleted legacy user doc:', legacyUserDocId);
            setLegacyUserDocId(null);
          } catch (delErr) {
            console.warn('⚠️ Could not delete legacy user doc; archiving instead', delErr);
            await setDoc(doc(firestore, 'users', legacyUserDocId), {
              archived: true,
              archivedReason: 'migrated_to_uid_doc',
              migratedToUserId: userId,
              migratedAt: serverTimestamp(),
            }, { merge: true });
          }
        } catch (migErr) {
          console.warn('⚠️ Legacy user doc migration skipped/failed:', migErr);
        }
      }
      // Get the selected program and field details
      const selectedProgram = programList.find(p => p === program);
      const programCategory = programCategories.find(cat =>
        cat.programs.some(p => p.value === program)
      );

      // Prepare user data with detailed structure
      const { name, ...programWithoutName } = {
        id: program,
        name: selectedProgram || '',
      };
      const userData: any = {
        // Basic Information
        // Don't overwrite admin-set names with blank values.
        ...(firstName.trim() ? { firstName: firstName.trim() } : {}),
        ...(lastName.trim() ? { lastName: lastName.trim() } : {}),
        contact: contact.trim(),
        gender,
        email: auth.currentUser.email,

        // Academic Information
        program: program,

        // Career Information
        field: field,

        // Preferences
        locationPreference: locationPreference,

        // Skills
        skills: skills,
        skillsUpdatedAt: serverTimestamp(),

        // Profile Status
        profileStatus: {
          isComplete: true,
          lastUpdated: serverTimestamp(),
          setupCompletedAt: serverTimestamp(),
        },

        // Timestamps
        // Note: createdAt is NOT updated - it preserves the original timestamp from when admin created the account
        updatedAt: serverTimestamp(),

        // Account Status
        status: 'active',
        accountType: 'student',

        // Security
        // Require users to change the admin-provided default password once.
        mustChangePassword: true,

        // OJT Status
        ojtStatus: {
          isHired: false,
          currentCompany: null,
          hiredAt: null,
          completedHours: 0,
          requiredHours: 300, // Default value, can be updated later
        }
      };

      console.log('Saving userData to Firestore:', userData);
      // Save to Firestore
      await setDoc(userRef, userData, { merge: true });

      // Ensure top-level isProfileComplete is set to true
      await setDoc(userRef, { isProfileComplete: true }, { merge: true });

      // Update user's profile completion status (nested)
      await updateDoc(userRef, {
        'profileStatus.isComplete': true,
        'profileStatus.setupCompletedAt': serverTimestamp(),
      });

      // Show success modal (custom UI)
      setSuccessOpen(true);
    } catch (error) {
      console.error('Error saving user data:', error);
      Alert.alert(
        'Error',
        'Failed to save your profile. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setSaving(false);
    }
  };

  // --- Validation ---
  const validateForm = () => {
    const errors: string[] = [];
    // firstName and lastName are pre-populated by admin, so they're optional here
    if (!contact || contact.length !== 11) errors.push('Mobile number must be 11 digits');
    if (!gender) errors.push('Gender is required');
    if (!program) errors.push('Program is required');
    if (!field) errors.push('Field is required');
    if (skills.length === 0) errors.push('At least one skill is required');
    if (!locationPreference) errors.push('Location preference is required');
    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'), [{ text: 'OK' }]);
      return false;
    }
    return true;
  };

  // --- Utility: Normalization and smart match for search ---
  const normalize = (str: string) =>
    str.toLowerCase().replace(/b[.]?s[.]?/g, 'bachelor of science')
      .replace(/bachelor\s+of\s+science/g, 'bachelor of science')
      .replace(/bachelor/g, 'bachelor of science')
      .replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
  const smartMatch = (option: string, input: string) => {
    const normOption = normalize(option);
    const normInput = normalize(input);
    if (normOption.includes(normInput)) return true;
    const inputWords = normInput.split(' ');
    const optionWords = normOption.split(' ');
    return inputWords.some(word => word && optionWords.some(optWord => optWord.startsWith(word)));
  };

  // --- Loading indicator ---
  if (isLoading) {
    return (
      <Screen contentContainerStyle={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Screen>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
    >
      <View style={styles.bg}>
        <View style={styles.bgCircle1} pointerEvents="none" />
        <View style={styles.bgCircle2} pointerEvents="none" />

        <Screen style={styles.screen} contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 0 }}>
          <AppHeader title="Set up account" subtitle="Complete your profile to continue" tone="light" />
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            scrollEnabled={parentScrollEnabled}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.hero}>
              <View style={styles.heroBadge}>
                <Icon name="sparkles" size={16} color={BRAND_BLUE} />
                <Text style={styles.heroBadgeText}>Almost there</Text>
              </View>
              <Text style={styles.heroTitle}>Set up your profile</Text>
              <Text style={styles.heroSubtitle}>
                Add a few details so we can personalize your internship recommendations.
              </Text>
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: 'rgba(43,127,255,0.12)' }]}>
                  <Icon name="account-circle-outline" size={18} color={BRAND_BLUE} />
                </View>
                <View style={styles.sectionHeaderText}>
                  <Text style={styles.sectionTitle}>Account</Text>
                  <Text style={styles.sectionHint}>Basic account details</Text>
                </View>
              </View>

              <Text style={styles.label}>Student ID</Text>
              <View style={styles.readOnlyRow}>
                <TextInput
                  style={[styles.input, styles.inputReadOnly, styles.readOnlyInput]}
                  placeholder="Student ID"
                  value={studentId}
                  editable={false}
                />
                <View style={styles.readOnlyBadge} pointerEvents="none">
                  <Icon name="lock-outline" size={16} color={colors.textMuted} />
                </View>
              </View>

              <Text style={styles.label}>Email</Text>
              <View style={styles.readOnlyRow}>
                <TextInput
                  style={[styles.input, styles.inputReadOnly, styles.readOnlyInput]}
                  placeholder="Email"
                  value={email}
                  editable={false}
                />
                <View style={styles.readOnlyBadge} pointerEvents="none">
                  <Icon name="email-outline" size={16} color={colors.textMuted} />
                </View>
              </View>

              <Text style={styles.label}>First name</Text>
              <TextInput
                ref={firstNameRef}
                style={[styles.input, focusedField === 'firstName' && styles.inputFocused]}
                placeholder="First name"
                value={firstName}
                onChangeText={setFirstName}
                autoCorrect={false}
                onFocus={() => setFocusedField('firstName')}
                onBlur={() => setFocusedField(null)}
              />

              <Text style={styles.label}>Last name</Text>
              <TextInput
                ref={lastNameRef}
                style={[styles.input, focusedField === 'lastName' && styles.inputFocused]}
                placeholder="Last name"
                value={lastName}
                onChangeText={setLastName}
                autoCorrect={false}
                onFocus={() => setFocusedField('lastName')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: 'rgba(34,197,94,0.12)' }]}>
                  <Icon name="card-account-phone-outline" size={18} color={colors.success} />
                </View>
                <View style={styles.sectionHeaderText}>
                  <Text style={styles.sectionTitle}>Personal information</Text>
                  <Text style={styles.sectionHint}>How we can reach you</Text>
                </View>
              </View>

              <Text style={styles.label}>Mobile number</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'contact' && styles.inputFocused,
                  contactOverLimit && styles.inputError
                ]}
                placeholder="Mobile number"
                value={contact}
                onChangeText={(text) => {
                  const digitsOnly = String(text || '').replace(/\D+/g, '');
                  setContactOverLimit(digitsOnly.length > 11);
                  setContact(digitsOnly.slice(0, 11));
                }}
                keyboardType="phone-pad"
                onFocus={() => setFocusedField('contact')}
                onBlur={() => setFocusedField(null)}
              />
              {contactOverLimit ? (
                <Text style={styles.inputErrorText}>Maximum 11 digits. Extra digits were removed.</Text>
              ) : null}

              <Text style={styles.label}>Gender</Text>
              <View style={styles.choiceRow}>
                {['Male', 'Female', 'Others'].map((g) => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setGender(g)}
                    activeOpacity={0.85}
                    style={[styles.choicePill, gender === g && styles.choicePillActive]}
                  >
                    <Text style={[styles.choiceText, gender === g && styles.choiceTextActive]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: 'rgba(59,130,246,0.12)' }]}>
                  <Icon name="briefcase-outline" size={18} color={colors.info} />
                </View>
                <View style={styles.sectionHeaderText}>
                  <Text style={styles.sectionTitle}>Internship preferences</Text>
                  <Text style={styles.sectionHint}>What you’re looking for</Text>
                </View>
              </View>

              <Text style={styles.label}>Program</Text>
              <View style={[styles.inputContainer, { zIndex: 2 }]}>
                <TextInput
                  ref={programRef}
                  style={[
                    styles.input,
                    (focusedField === 'program' || showProgramOptions) && styles.inputFocused
                  ]}
                  placeholder="Search your program"
                  placeholderTextColor={colors.textSubtle}
                  value={programSearch}
                  onChangeText={text => {
                    setProgramSearch(text);
                    setShowProgramOptions(true);
                    setParentScrollEnabled(false);
                  }}
                  onFocus={() => {
                    setFocusedField('program');
                    scrollToInput(programRef);
                    measureProgramInput();
                    setShowProgramOptions(true);
                    setParentScrollEnabled(false);
                  }}
                  onBlur={() => {
                    setFocusedField(null);
                    setTimeout(() => {
                      setShowProgramOptions(false);
                      setParentScrollEnabled(true);
                    }, 100);
                  }}
                />
              {showProgramOptions && programSearch.length > 0 && (
                <View
                  style={[
                    styles.dropdownContainer,
                    {
                      position: 'relative',
                      top: 0,
                      left: 0,
                      width: '100%',
                      maxHeight: 220,
                      zIndex: 9999,
                    }
                  ]}
                  pointerEvents="auto"
                >
                  <ScrollView
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={true}
                    style={{ maxHeight: 220 }}
                  >
                    {(programOptions.length > 0 ? programOptions : programList.filter(p => programSearch && smartMatch(p, programSearch)))
                      .map((p, idx) => (
                        <TouchableOpacity
                          key={idx}
                          style={[
                            styles.dropdownItem,
                            program === p && styles.dropdownItemSelected
                          ]}
                          activeOpacity={0.7}
                          onPress={() => {
                            setProgram(p);
                            setProgramSearch(p);
                            setShowProgramOptions(false);
                            setParentScrollEnabled(true);
                            programRef.current?.blur();
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{p}</Text>
                        </TouchableOpacity>
                      ))}
                    {((programOptions.length === 0) && (programList.filter(p => programSearch && smartMatch(p, programSearch)).length === 0)) && programSearch.trim().length > 0 && (
                      <TouchableOpacity
                        style={[styles.skillPillUnselected, { alignSelf: 'flex-start', width: '100%', marginVertical: 4 }]}
                        onPress={() => {
                          const newProgram = programSearch.trim();
                          if (newProgram && !programList.includes(newProgram)) {
                            setProgramList(prev => [...prev, newProgram]);
                            setProgram(newProgram);
                            setProgramSearch(newProgram);
                            // Persist for future users
                            persistNewOption('program', newProgram);
                            setShowProgramOptions(false);
                            setParentScrollEnabled(true);
                            programRef.current?.blur();
                          }
                        }}
                      >
                        <Text style={styles.skillTextUnselected}>Add "{programSearch.trim()}"</Text>
                      </TouchableOpacity>
                    )}
                  </ScrollView>
                </View>
              )}
            </View>

              <Text style={styles.label}>Preferred field / industry</Text>
              <View style={[styles.inputContainer, { zIndex: 1 }]}>
                <TextInput
                  ref={fieldRef}
                  style={[
                    styles.input,
                    (focusedField === 'field' || showFieldOptions) && styles.inputFocused
                  ]}
                  placeholder="Search your preferred field"
                  placeholderTextColor={colors.textSubtle}
                  value={fieldSearch}
                  onChangeText={text => {
                    setFieldSearch(text);
                    setShowFieldOptions(true);
                    setParentScrollEnabled(false);
                  }}
                  onFocus={() => {
                    setFocusedField('field');
                    scrollToInput(fieldRef);
                    measureFieldInput();
                    setShowFieldOptions(true);
                    setParentScrollEnabled(false);
                  }}
                  onBlur={() => {
                    setFocusedField(null);
                    setTimeout(() => {
                      setShowFieldOptions(false);
                      setParentScrollEnabled(true);
                    }, 100);
                  }}
                  onSubmitEditing={() => {
                    const newField = fieldSearch.trim();
                    if (newField) {
                      setField(newField);
                      setFieldSearch(newField);
                    }
                  }}
                />
              {showFieldOptions && fieldSearch.length > 0 && (
                <View
                  style={[
                    styles.dropdownContainer,
                    {
                      position: 'relative',
                      top: 0,
                      left: 0,
                      width: '100%',
                      maxHeight: 220,
                      zIndex: 9998,
                    }
                  ]}
                  pointerEvents="auto"
                >
                  <ScrollView
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={true}
                    style={{ maxHeight: 220 }}
                  >
                    {(fieldOptions.length > 0 ? fieldOptions : fieldList.filter(f => fieldSearch && smartMatch(f, fieldSearch)))
                      .map((f, idx) => (
                        <TouchableOpacity
                          key={idx}
                          style={[
                            styles.dropdownItem,
                            field === f && styles.dropdownItemSelected
                          ]}
                          activeOpacity={0.7}
                          onPress={() => {
                            setField(f);
                            setFieldSearch(f);
                            setShowFieldOptions(false);
                            setParentScrollEnabled(true);
                            fieldRef.current?.blur();
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{f}</Text>
                        </TouchableOpacity>
                      ))}
                    {((fieldOptions.length === 0) && (fieldList.filter(f => fieldSearch && smartMatch(f, fieldSearch)).length === 0)) && fieldSearch.trim().length > 0 && (
                      <TouchableOpacity
                        style={[styles.skillPillUnselected, { alignSelf: 'flex-start', width: '100%', marginVertical: 4 }]}
                        onPress={() => {
                          const newField = fieldSearch.trim();
                          if (newField && !fieldList.includes(newField)) {
                            setFieldList(prev => [...prev, newField]);
                            setField(newField);
                            setFieldSearch(newField);
                            // Persist for future users
                            persistNewOption('field', newField);
                            setShowFieldOptions(false);
                            setParentScrollEnabled(true);
                            fieldRef.current?.blur();
                          }
                        }}
                      >
                        <Text style={styles.skillTextUnselected}>Add "{fieldSearch.trim()}"</Text>
                      </TouchableOpacity>
                    )}
                  </ScrollView>
                </View>
              )}
            </View>

              <Text style={styles.label}>Mode of work</Text>
              <View style={styles.choiceRow}>
                {(['remote', 'onsite', 'hybrid'] as const).map((type) => {
                  const active = locationPreference === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      onPress={() => selectLocationPreference(type)}
                      activeOpacity={0.85}
                      style={[styles.choicePill, active && styles.choicePillActive]}
                    >
                      <Text style={[styles.choiceText, active && styles.choiceTextActive]}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: 'rgba(245,158,11,0.14)' }]}>
                  <Icon name="star-outline" size={18} color={colors.warning} />
                </View>
                <View style={styles.sectionHeaderText}>
                  <Text style={styles.sectionTitle}>Skills</Text>
                  <Text style={styles.sectionHint}>Pick what you’re good at</Text>
                </View>
              </View>

              <Text style={styles.label}>Select at least one</Text>
              <View style={styles.inputContainer}>
                <View style={styles.skillPillContainer}>
                  {skills.map((skill, index) => (
                    <TouchableOpacity
                      key={`selected-${skill}-${index}`}
                      style={styles.skillPillSelected}
                      onPress={() => setSkills(prev => prev.filter(s => s !== skill))}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.skillText}>{skill}</Text>
                      <Text style={styles.removeSkillText}>  ×</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  ref={skillRef}
                  style={[styles.input, focusedField === 'skill' && styles.inputFocused]}
                  placeholder="Search or add a skill"
                  value={skillSearch}
                  onChangeText={setSkillSearch}
                  onFocus={() => {
                    setFocusedField('skill');
                    scrollToInput(skillRef);
                  }}
                  onBlur={() => setFocusedField(null)}
                  onSubmitEditing={() => {
                    const newSkill = skillSearch.trim();
                    if (newSkill && !skills.includes(newSkill)) {
                      setSkills(prev => [...prev, newSkill]);
                      setSkillSearch("");
                    }
                  }}
                />
              {skillSearch.length > 0 && (
                <View style={styles.skillPillContainerVertical}>
                  {availableSkills
                    .filter((skill) => skill.toLowerCase().includes(skillSearch.toLowerCase()) && !skills.includes(skill))
                    .map((skill, index) => (
                      <TouchableOpacity
                        key={`skill-${skill}-${index}`}
                        style={styles.skillPillUnselected}
                        onPress={() => {
                          setSkills((prev) => [...prev, skill]);
                          setSkillSearch("");
                        }}
                      >
                        <Text style={styles.skillTextUnselected}>{skill} ＋</Text>
                      </TouchableOpacity>
                    ))}
                  {availableSkills.filter((skill) => skill.toLowerCase().includes(skillSearch.toLowerCase()) && !skills.includes(skill)).length === 0 && skillSearch.trim().length > 0 && (
                    <TouchableOpacity
                      style={[styles.skillPillUnselected, { alignSelf: 'flex-start', width: '100%', marginVertical: 4 }]}
                      onPress={() => {
                        const newSkill = skillSearch.trim();
                        if (newSkill && !skills.includes(newSkill)) {
                          setAvailableSkills(prev => [...prev, newSkill]);
                          setSkills(prev => [...prev, newSkill]);
                          // Persist for future users
                          persistNewOption('skill', newSkill);
                          setSkillSearch("");
                        }
                      }}
                    >
                      <Text style={styles.skillTextUnselected}>Add "{skillSearch.trim()}"</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
            </View>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                (!gender || !program || !field || skills.length === 0) &&
                styles.primaryButtonDisabled
              ]}
              onPress={finishSetup}
              disabled={!gender || !program || !field || skills.length === 0 || saving}
              activeOpacity={0.9}
            >
              {saving ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={styles.primaryButtonText}>Complete setup</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </Screen>

        <Portal>
          {successOpen ? (
            <View style={styles.modalOverlay} accessibilityViewIsModal>
              <View style={styles.successModal} accessibilityRole="dialog">
                <View style={styles.successIconWrap}>
                  <View style={styles.successIconInner}>
                    <Icon name="check" size={18} color={colors.white} />
                  </View>
                </View>

                <Text style={styles.successTitle}>Success</Text>
                <Text style={styles.successSubtitle}>Your profile has been set up successfully.</Text>

                <TouchableOpacity
                  style={styles.successAction}
                  activeOpacity={0.9}
                  onPress={() => {
                    setSuccessOpen(false);
                    onSetupComplete();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Continue"
                >
                  <Text style={styles.successActionText}>Continue</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </Portal>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: BRAND_BLUE,
  },
  screen: {
    backgroundColor: 'transparent',
  },
  bgCircle1: {
    position: 'absolute',
    width: 520,
    height: 520,
    borderRadius: 520,
    right: -220,
    top: -260,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  bgCircle2: {
    position: 'absolute',
    width: 380,
    height: 380,
    borderRadius: 380,
    left: -170,
    top: 90,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.sm,
  },
  hero: {
    marginBottom: spacing.md,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(43,127,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(43,127,255,0.20)',
    marginBottom: spacing.sm,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: BRAND_BLUE,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
  },
  heroSubtitle: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    lineHeight: 18,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
    marginBottom: spacing.md,
    marginHorizontal: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  sectionHint: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  label: {
    fontSize: 12,
    marginTop: spacing.md,
    marginBottom: 6,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.4,
  },
  input: {
    fontSize: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    marginBottom: 10,
  },
  inputFocused: {
    borderColor: BRAND_BLUE,
    backgroundColor: colors.surface,
  },
  inputReadOnly: {
    backgroundColor: colors.surfaceAlt,
    color: colors.textMuted,
  },
  readOnlyRow: {
    position: 'relative',
  },
  readOnlyInput: {
    paddingRight: 38,
  },
  readOnlyBadge: {
    position: 'absolute',
    right: 10,
    top: 12,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(11,43,52,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputError: {
    borderColor: colors.danger,
  },
  inputErrorText: {
    marginTop: -4,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '600',
    color: colors.danger,
  },
  choiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  choicePill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(11,43,52,0.12)',
    backgroundColor: colors.surfaceAlt,
  },
  choicePillActive: {
    borderColor: 'rgba(43,127,255,0.45)',
    backgroundColor: 'rgba(43,127,255,0.10)',
  },
  choiceText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  choiceTextActive: {
    color: '#2B7FFF',
  },
  skillPillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    gap: 8,
  },
  skillPillSelected: {
    backgroundColor: BRAND_BLUE,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillPillUnselected: {
    backgroundColor: colors.surface,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(11,43,52,0.10)',
  },
  skillText: {
    color: colors.onPrimary,
    fontSize: 13,
    fontWeight: '500',
  },
  skillTextUnselected: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 999,
    marginTop: spacing.sm,
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  primaryButtonText: { fontSize: 14, color: BRAND_BLUE, fontWeight: '900' },
  primaryButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderColor: 'rgba(255,255,255,0.35)',
    opacity: 1,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  successModal: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    ...shadows.card,
  },
  successIconWrap: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  successIconInner: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  successSubtitle: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    lineHeight: 18,
  },
  successAction: {
    marginTop: spacing.lg,
    height: 46,
    borderRadius: 999,
    backgroundColor: BRAND_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  successActionText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: '900',
  },
  inputContainer: {
    position: 'relative',
    zIndex: 1,
    marginBottom: 15,
  },
  dropdownContainer: {
    position: 'absolute',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 8,
    ...shadows.card,
    zIndex: 1000,
    maxHeight: 220,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemSelected: {
    backgroundColor: colors.infoSoft,
  },
  dropdownItemText: {
    fontSize: 14,
    color: colors.text,
  },
  noResultsText: {
    padding: 12,
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  skillPillContainerVertical: {
    flexDirection: 'column',
    marginBottom: 20,
  },
  removeSkillText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 4,
  },
});

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    paddingRight: 30,
    marginBottom: 10,
  },
  inputAndroid: {
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    paddingRight: 30,
    marginBottom: 10,
  },
  placeholder: {
    color: colors.textMuted,
  },
  disabled: {
    color: colors.textSubtle,
    backgroundColor: colors.surfaceAlt,
  },
};

export default SetupAccountScreen;
