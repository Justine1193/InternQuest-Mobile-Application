import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
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
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, updateDoc, getDoc, orderBy, startAt, endAt, addDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebase/config';
import { updatePassword } from "firebase/auth";
import { Portal } from 'react-native-portalize';

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

export const SetupAccountScreen: React.FC<SetupAccountScreenProps> = ({
  navigation,
  route,
  onSetupComplete,
}) => {
  // --- State: Personal Info ---
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
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
  const [isLoading, setIsLoading] = useState(false);
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
    return snapshot.docs.map(doc => doc.data().name);
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
        const programDoc = await getDoc(doc(firestore, 'meta', 'programs'));
        if (programDoc.exists()) setProgramList(programDoc.data().list || []);
        const fieldDoc = await getDoc(doc(firestore, 'meta', 'field'));
        if (fieldDoc.exists()) setFieldList(fieldDoc.data().list || []);
        // Fetch skills for dropdown
        const skillsDoc = await getDoc(doc(firestore, 'meta', 'suggestionSkills'));
        if (skillsDoc.exists()) {
          const skillsData = skillsDoc.data();
          let skillsArray: string[] = [];
          if (Array.isArray(skillsData.list)) {
            // Remove duplicates and trim whitespace
            skillsArray = [...new Set(skillsData.list.map(skill => String(skill).trim()))];
          } else {
            skillsArray = [...new Set(Object.values(skillsData).map(skill => String(skill).trim()))];
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

  // --- Auth check ---
  useEffect(() => {
    if (!auth.currentUser) {
      Alert.alert(
        'Authentication Required',
        'Please sign in to continue.',
        [
          {
            text: 'OK',
            onPress: () => navigation.replace('SignIn')
          }
        ]
      );
    }
  }, []);

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
    setIsLoading(true);
    try {
      const userId = auth.currentUser.uid;
      const userRef = doc(firestore, 'users', userId);
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
      const userData = {
        // Basic Information
        firstName: firstName.trim(),
        lastName: lastName.trim(),
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
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),

        // Account Status
        status: 'active',
        accountType: 'student',

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

      // Show success message
      Alert.alert(
        'Success',
        'Your profile has been set up successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              onSetupComplete();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error saving user data:', error);
      Alert.alert(
        'Error',
        'Failed to save your profile. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --- Validation ---
  const validateForm = () => {
    const errors: string[] = [];
    if (!firstName.trim()) errors.push('First name is required');
    if (!lastName.trim()) errors.push('Last name is required');
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
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#007aff" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
    >
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>Setup Account</Text>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.card}
          scrollEnabled={parentScrollEnabled}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Set up Your Profile</Text>

          <Text style={styles.label}>First Name</Text>
          <TextInput
            ref={firstNameRef}
            style={styles.input}
            placeholder="Enter Your First Name"
            value={firstName}
            onChangeText={setFirstName}
            onFocus={() => scrollToInput(firstNameRef)}
          />

          <Text style={styles.label}>Last Name</Text>
          <TextInput
            ref={lastNameRef}
            style={styles.input}
            placeholder="Enter Your Last Name"
            value={lastName}
            onChangeText={setLastName}
            onFocus={() => scrollToInput(lastNameRef)}
          />

          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderContainer}>
            {['Male', 'Female', 'Others'].map((g) => (
              <TouchableOpacity
                key={g}
                style={styles.genderRow}
                onPress={() => setGender(g)}
              >
                <View
                  style={[
                    styles.radioCircle,
                    gender === g && styles.selectedRadio,
                  ]}
                />
                <Text style={styles.genderLabel}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.title, { marginTop: 20 }]}>Internship Preference</Text>

          <Text style={styles.label}>Program</Text>
          <View style={[styles.inputContainer, { zIndex: 2 }]}>
            <TextInput
              ref={programRef}
              style={[
                styles.input,
                showProgramOptions && styles.inputFocused
              ]}
              placeholder="Search your program"
              placeholderTextColor="#999"
              value={programSearch}
              onChangeText={text => {
                setProgramSearch(text);
                setShowProgramOptions(true);
                setParentScrollEnabled(false);
              }}
              onFocus={() => {
                scrollToInput(programRef);
                measureProgramInput();
                setShowProgramOptions(true);
                setParentScrollEnabled(false);
              }}
              onBlur={() => {
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
                  {programList
                    .filter(p => programSearch && smartMatch(p, programSearch))
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
                  {programList.filter(p => programSearch && smartMatch(p, programSearch)).length === 0 && programSearch.trim().length > 0 && (
                    <TouchableOpacity
                      style={[styles.skillPillUnselected, { alignSelf: 'flex-start', width: '100%', marginVertical: 4 }]}
                      onPress={() => {
                        const newProgram = programSearch.trim();
                        if (newProgram && !programList.includes(newProgram)) {
                          setProgramList(prev => [...prev, newProgram]);
                          setProgram(newProgram);
                          setProgramSearch(newProgram);
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

          <Text style={styles.label}>Preferred Field / Industry</Text>
          <View style={[styles.inputContainer, { zIndex: 1 }]}>
            <TextInput
              ref={fieldRef}
              style={[
                styles.input,
                showFieldOptions && styles.inputFocused
              ]}
              placeholder="Search your preferred field"
              placeholderTextColor="#999"
              value={fieldSearch}
              onChangeText={text => {
                setFieldSearch(text);
                setShowFieldOptions(true);
                setParentScrollEnabled(false);
              }}
              onFocus={() => {
                scrollToInput(fieldRef);
                measureFieldInput();
                setShowFieldOptions(true);
                setParentScrollEnabled(false);
              }}
              onBlur={() => {
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
                  {fieldList
                    .filter(f => fieldSearch && smartMatch(f, fieldSearch))
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
                  {fieldList.filter(f => fieldSearch && smartMatch(f, fieldSearch)).length === 0 && fieldSearch.trim().length > 0 && (
                    <TouchableOpacity
                      style={[styles.skillPillUnselected, { alignSelf: 'flex-start', width: '100%', marginVertical: 4 }]}
                      onPress={() => {
                        const newField = fieldSearch.trim();
                        if (newField && !fieldList.includes(newField)) {
                          setFieldList(prev => [...prev, newField]);
                          setField(newField);
                          setFieldSearch(newField);
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

          <Text style={styles.label}>Location Preference</Text>
          <View style={styles.checkboxContainer}>
            {['remote', 'onsite', 'hybrid'].map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.checkboxRow}
                onPress={() => selectLocationPreference(type as 'remote' | 'onsite' | 'hybrid')}
              >
                <View
                  style={[
                    styles.checkbox,
                    locationPreference === type && styles.checkedBox,
                  ]}
                />
                <Text style={styles.checkboxLabel}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Skills</Text>
          <View style={styles.inputContainer}>
            <View style={styles.skillPillContainer}>
              {skills.map((skill, index) => (
                <TouchableOpacity
                  key={`selected-${skill}-${index}`}
                  style={styles.skillPillSelected}
                  onPress={() => setSkills(prev => prev.filter(s => s !== skill))}
                >
                  <Text style={styles.skillText}>{skill}</Text>
                  <Text style={styles.removeSkillText}>  ×</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              ref={skillRef}
              style={styles.input}
              placeholder="Search or add a skill"
              value={skillSearch}
              onChangeText={setSkillSearch}
              onFocus={() => {
                scrollToInput(skillRef);
              }}
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

          <TouchableOpacity
            style={[
              styles.button,
              (!firstName || !lastName || !gender || !program || !field || skills.length === 0) &&
              styles.buttonDisabled
            ]}
            onPress={finishSetup}
            disabled={!firstName || !lastName || !gender || !program || !field || skills.length === 0}
          >
            <Text style={styles.buttonText}>Complete Setup</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F5F9',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: '500',
    color: '#4A4A4A',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 3,
    paddingBottom: 30,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 15,
    color: '#000',
  },
  label: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    fontSize: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    color: '#333',
    marginBottom: 10,
  },
  inputFocused: {
    borderColor: '#00A8E8',
    backgroundColor: '#FFFFFF',
  },
  genderContainer: {
    flexDirection: 'column',
    marginBottom: 10,
  },
  genderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioCircle: {
    height: 16,
    width: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555',
    marginRight: 10,
  },
  selectedRadio: {
    backgroundColor: '#00A8E8',
  },
  genderLabel: {
    fontSize: 14,
    color: '#000',
  },
  checkboxContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#555',
    marginRight: 10,
  },
  checkedBox: {
    backgroundColor: '#00A8E8',
  },
  checkboxLabel: {
    fontSize: 14,
  },
  skillPillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    gap: 8,
  },
  skillPillSelected: {
    backgroundColor: '#00A8E8',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillPillUnselected: {
    backgroundColor: '#EAEAEA',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  skillTextUnselected: {
    color: '#333',
    fontSize: 13,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#00A8E8',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  inputContainer: {
    position: 'relative',
    zIndex: 1,
    marginBottom: 15,
  },
  dropdownContainer: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
    maxHeight: 220,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemSelected: {
    backgroundColor: '#F0F8FF',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333',
  },
  noResultsText: {
    padding: 12,
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  skillPillContainerVertical: {
    flexDirection: 'column',
    marginBottom: 20,
  },
  removeSkillText: {
    color: '#fff',
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
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#F4F5F9',
    color: 'black',
    paddingRight: 30,
    marginBottom: 10,
  },
  inputAndroid: {
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#F4F5F9',
    color: 'black',
    paddingRight: 30,
    marginBottom: 10,
  },
  placeholder: {
    color: '#666',
  },
  disabled: {
    color: '#999',
    backgroundColor: '#f5f5f5',
  },
};

export default SetupAccountScreen;
