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
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, updateDoc, getDoc } from 'firebase/firestore';
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

const availableSkills = [
  // Business, Accountancy, and Entrepreneurship
  'Financial Analysis',
  'Financial Reporting',
  'QuickBooks',
  'Xero',
  'Market Research',
  'Market Analysis',
  'Sales',
  'Negotiation',
  'Microsoft Excel (Advanced)',
  'Business Communication',
  'Strategic Planning',
  'CRM Tools',

  // IT, Computer Science, and Multimedia
  'HTML',
  'CSS',
  'JavaScript',
  'React',
  'Node.js',
  'PHP',
  'Python',
  'MySQL',
  'Firebase',
  'MongoDB',
  'UI Design',
  'UX Design',
  'Figma',
  'Adobe XD',
  'Git',
  'GitHub',
  'Unity',
  'Unreal Engine',
  'Blender',
  'Maya',
  'Cybersecurity',

  // Psychology, Education, and Public Administration
  'Psychological Assessment',
  'Report Writing',
  'Documentation',
  'Classroom Management',
  'Lesson Planning',
  'Google Forms',
  'SurveyMonkey',
  'Community Outreach',
  'Public Speaking',
  'Facilitation',
  'Active Listening',

  // Medical, Nursing, and Science
  'Laboratory Safety',
  'Diagnostic Skills',
  'Vital Signs',
  'Health Documentation',
  'EHR Systems',
  'Patient Communication',
  'Research Methods',
  'Data Interpretation',
  'Specimen Handling',
  'First Aid',
  'Emergency Response',

  // Communication, Journalism, and Arts
  'Copywriting',
  'Editing',
  'Photography',
  'Videography',
  'Adobe Photoshop',
  'Adobe Premiere Pro',
  'Adobe InDesign',
  'Social Media Content',
  'News Writing',
  'Press Releases',
  'Public Relations',
  'Media Strategy',
  'Storyboarding',
  'Scriptwriting',
  'Podcasting',
  'Audio Editing',

  // Engineering and Architecture
  'AutoCAD',
  'SketchUp',
  'Revit',
  'Structural Design',
  'Project Documentation',
  'Technical Drawing',
  'Blueprint Reading',
  'MS Project',
  'Safety Compliance',
  'Problem Solving',
  'Critical Thinking',
  'Technical Writing',

  // Music and Performing Arts
  'Instrumental Proficiency',
  'Vocal Proficiency',
  'Music Notation',
  'Music Arrangement',
  'FL Studio',
  'Logic Pro',
  'Event Coordination',
  'Ensemble Collaboration',
  'Conducting',
  'Music Teaching',
  'Audio Recording',
  'Audio Mixing'
];

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
  const [field, setField] = useState('');
  const [skills, setSkills] = useState<string[]>([]);

  // --- State: Preferences ---
  const [locationPreference, setLocationPreference] = useState({
    remote: false,
    onsite: false,
    hybrid: false,
  });

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
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [parentScrollEnabled, setParentScrollEnabled] = useState(true);
  const [programDropdownPos, setProgramDropdownPos] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [fieldDropdownPos, setFieldDropdownPos] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const windowHeight = Dimensions.get('window').height;

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

  // --- Fetch meta data for dropdowns ---
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const programDoc = await getDoc(doc(firestore, 'meta', 'programs'));
        if (programDoc.exists()) setProgramList(programDoc.data().list || []);
        const fieldDoc = await getDoc(doc(firestore, 'meta', 'field'));
        if (fieldDoc.exists()) setFieldList(fieldDoc.data().list || []);
      } catch (error) {
        console.error('Failed to fetch meta:', error);
      }
      setLoadingMeta(false);
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
  const toggleCheckbox = (type: 'remote' | 'onsite' | 'hybrid') => {
    setLocationPreference((prev) => ({ ...prev, [type]: !prev[type] }));
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
      const selectedField = fieldList.find(f => f === field);
      const programCategory = programCategories.find(cat =>
        cat.programs.some(p => p.value === program)
      );
      const fieldCategory = fieldCategories.find(cat =>
        cat.fields.some(f => f.value === field)
      );

      // Prepare user data with detailed structure
      const { name, ...programWithoutName } = {
        id: program,
        name: selectedProgram || '',
        category: programCategory?.category || '',
      };
      const { name: fieldName, ...fieldWithoutName } = {
        id: field,
        name: selectedField || '',
        category: fieldCategory?.category || '',
        categoryEmoji: fieldCategory?.category.split(' ')[0] || '',
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
        field: [fieldWithoutName],

        // Preferences
        locationPreference: {
          remote: locationPreference.remote,
          onsite: locationPreference.onsite,
          hybrid: locationPreference.hybrid,
          lastUpdated: serverTimestamp(),
        },

        // Skills
        skills: skills.map(skill => ({
          name: skill,
          category: availableSkills.find(s => s === skill) ? 'Technical' : 'Soft Skills',
        })),
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
    const errors = [];
    if (!firstName.trim()) errors.push('First name is required');
    if (!lastName.trim()) errors.push('Last name is required');
    if (!gender) errors.push('Gender is required');
    if (!program) errors.push('Program is required');
    if (!field) errors.push('Preferred field is required');
    if (skills.length === 0) errors.push('At least one skill is required');
    if (!locationPreference.remote && !locationPreference.onsite && !locationPreference.hybrid) errors.push('At least one location preference is required');
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
  if (loadingMeta || isLoading) {
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
              <Portal>
                <View
                  style={[
                    styles.dropdownContainer,
                    {
                      position: 'absolute',
                      top: programDropdownPos.y,
                      left: programDropdownPos.x,
                      width: programDropdownPos.width,
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
                    {programList.filter(p => programSearch && smartMatch(p, programSearch)).length === 0 && (
                      <Text style={styles.noResultsText}>No results found</Text>
                    )}
                  </ScrollView>
                </View>
              </Portal>
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
            />
            {showFieldOptions && fieldSearch.length > 0 && (
              <Portal>
                <View
                  style={[
                    styles.dropdownContainer,
                    {
                      position: 'absolute',
                      top: fieldDropdownPos.y,
                      left: fieldDropdownPos.x,
                      width: fieldDropdownPos.width,
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
                    {fieldList.filter(f => fieldSearch && smartMatch(f, fieldSearch)).length === 0 && (
                      <Text style={styles.noResultsText}>No results found</Text>
                    )}
                  </ScrollView>
                </View>
              </Portal>
            )}
          </View>

          <Text style={styles.label}>Location Preference</Text>
          <View style={styles.checkboxContainer}>
            {['remote', 'onsite', 'hybrid'].map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.checkboxRow}
                onPress={() => toggleCheckbox(type as keyof typeof locationPreference)}
              >
                <View
                  style={[
                    styles.checkbox,
                    locationPreference[type as keyof typeof locationPreference] &&
                    styles.checkedBox,
                  ]}
                />
                <Text style={styles.checkboxLabel}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Skills</Text>
          <TextInput
            ref={skillRef}
            style={styles.input}
            placeholder="Search skills"
            value={skillSearch}
            onChangeText={setSkillSearch}
            onFocus={() => scrollToInput(skillRef)}
          />

          <View style={styles.skillPillContainer}>
            {availableSkills
              .filter(
                (skill) =>
                  skill.toLowerCase().includes(skillSearch.toLowerCase()) &&
                  (skillSearch.length > 0 ? true : skills.includes(skill))
              )
              .map((skill) => (
                <TouchableOpacity
                  key={skill}
                  style={[
                    styles.skillPillSelected,
                    !skills.includes(skill) && { opacity: 0.5 },
                  ]}
                  onPress={() => {
                    if (skills.includes(skill)) {
                      setSkills((prev) => prev.filter((s) => s !== skill));
                    } else {
                      setSkills((prev) => [...prev, skill]);
                    }
                  }}
                >
                  <Text style={styles.skillText}>
                    {skill}
                    {skills.includes(skill) ? ' ✕' : ' ＋'}
                  </Text>
                </TouchableOpacity>
              ))}
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
    marginBottom: 20,
  },
  skillPillSelected: {
    backgroundColor: '#00A8E8',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginVertical: 4,
    marginRight: 8,
  },
  skillText: {
    color: '#fff',
    fontSize: 13,
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
