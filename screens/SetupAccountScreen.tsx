import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebase/config';
import { updatePassword } from "firebase/auth";

type NavigationProp = StackNavigationProp<RootStackParamList, 'SetupAccount'>;

type SetupAccountScreenProps = {
  navigation: any;
  route: any;
  onSetupComplete: () => void;
};

export const SetupAccountScreen: React.FC<SetupAccountScreenProps> = ({
  navigation,
  route,
  onSetupComplete,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [program, setProgram] = useState('');
  const [field, setField] = useState('');
  const [locationPreference, setLocationPreference] = useState({
    remote: false,
    onsite: false,
    hybrid: false,
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [programSearch, setProgramSearch] = useState('');
  const [fieldSearch, setFieldSearch] = useState('');
  const [showProgramOptions, setShowProgramOptions] = useState(false);
  const [showFieldOptions, setShowFieldOptions] = useState(false);

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

  // Add program categories and options
  const programCategories = [
    {
      category: '💼 Business & Management',
      programs: [
        { label: 'BS in Business Administration', value: 'bsba' },
        { label: 'BS in Real Estate Management', value: 'bsrem' },
        { label: 'BS in Entrepreneurship', value: 'bsent' },
      ]
    },
    {
      category: '💻 Information Technology & Computing',
      programs: [
        { label: 'BS in Information Technology', value: 'bsit' },
        { label: 'BS in Information System', value: 'bsis' },
        { label: 'BS in Computer Science', value: 'bscs' },
        { label: 'BS in Entertainment and Multimedia Computing', value: 'bsemc' },
      ]
    },
    {
      category: '🧪 Health Sciences',
      programs: [
        { label: 'BS in Medical Technology', value: 'bsmt' },
        { label: 'BS in Nursing', value: 'bsn' },
        { label: 'BS in Respiratory Therapy', value: 'bsrt' },
        { label: 'BS in Physical Therapy', value: 'bspt' },
      ]
    },
    {
      category: '🧠 Psychology & Social Sciences',
      programs: [
        { label: 'BS in Psychology', value: 'bspsych' },
        { label: 'BA in Political Science', value: 'baps' },
        { label: 'Bachelor of Public Administration', value: 'bpa' },
      ]
    },
    {
      category: '🧰 Engineering & Architecture',
      programs: [
        { label: 'BS in Civil Engineering', value: 'bsce' },
        { label: 'BS in Electrical Engineering', value: 'bsee' },
        { label: 'BS in Mechanical Engineering', value: 'bsme' },
        { label: 'BS in Electronics Engineering', value: 'bsece' },
        { label: 'BS in Industrial Engineering', value: 'bsie' },
        { label: 'BS in Architecture', value: 'bsarch' },
      ]
    },
    {
      category: '🎙️ Communication & Media',
      programs: [
        { label: 'BA in Broadcasting', value: 'bab' },
        { label: 'BA in Journalism', value: 'baj' },
        { label: 'BA in Communication', value: 'bac' },
      ]
    },
    {
      category: '🧑‍🏫 Education',
      programs: [
        { label: 'Bachelor in Elementary Education', value: 'beed' },
        { label: 'Bachelor in Secondary Education', value: 'bsed' },
      ]
    }
  ];

  // Add field categories and options
  const fieldCategories = [
    {
      category: '💼 Business & Management',
      fields: [
        { label: 'Corporate Management', value: 'corporate' },
        { label: 'Sales & Marketing', value: 'sales' },
        { label: 'Human Resources', value: 'hr' },
        { label: 'Finance & Accounting', value: 'finance' },
        { label: 'Real Estate', value: 'realestate' },
      ]
    },
    {
      category: '💻 Information Technology',
      fields: [
        { label: 'Software Development', value: 'software' },
        { label: 'Web Development', value: 'web' },
        { label: 'IT Support', value: 'itsupport' },
        { label: 'Multimedia & Design', value: 'multimedia' },
        { label: 'Data Science', value: 'data' },
      ]
    },
    {
      category: '🧪 Healthcare',
      fields: [
        { label: 'Hospital', value: 'hospital' },
        { label: 'Clinical Laboratory', value: 'lab' },
        { label: 'Medical Research', value: 'research' },
        { label: 'Healthcare Administration', value: 'healthadmin' },
      ]
    },
    {
      category: '🧠 Social Services',
      fields: [
        { label: 'Clinical Psychology', value: 'clinical' },
        { label: 'Government Agency', value: 'government' },
        { label: 'Community Organization', value: 'community' },
        { label: 'Social Work', value: 'socialwork' },
      ]
    },
    {
      category: '🧰 Engineering & Construction',
      fields: [
        { label: 'Construction', value: 'construction' },
        { label: 'Utilities', value: 'utilities' },
        { label: 'Engineering Consultancy', value: 'consultancy' },
        { label: 'Architecture Firm', value: 'architecture' },
      ]
    },
    {
      category: '🎙️ Media & Communication',
      fields: [
        { label: 'Media Outlet', value: 'media' },
        { label: 'Production Company', value: 'production' },
        { label: 'Public Relations', value: 'pr' },
        { label: 'Digital Media', value: 'digital' },
      ]
    },
    {
      category: '🧑‍🏫 Education',
      fields: [
        { label: 'Elementary School', value: 'elementary' },
        { label: 'Secondary School', value: 'secondary' },
        { label: 'Educational Administration', value: 'eduadmin' },
      ]
    }
  ];

  // Flatten program options for the picker
  const programOptions = programCategories.flatMap(category => [
    { label: category.category, value: null, disabled: true },
    ...category.programs
  ]);

  // Flatten field options for the picker
  const fieldOptions = fieldCategories.flatMap(category => [
    { label: category.category, value: null, disabled: true },
    ...category.fields
  ]);

  // Add this helper function to flatten all program options
  const allPrograms = programCategories.flatMap(cat => cat.programs);
  const allFields = fieldCategories.flatMap(cat => cat.fields);

  const toggleCheckbox = (type: 'remote' | 'onsite' | 'hybrid') => {
    setLocationPreference((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const finishSetup = async () => {
    if (!auth.currentUser) {
      Alert.alert('Error', 'You must be logged in to complete setup.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      const userId = auth.currentUser.uid;
      const userRef = doc(firestore, 'users', userId);

      // Get the selected program and field details
      const selectedProgram = programOptions.find(p => p.value === program);
      const selectedField = fieldOptions.find(f => f.value === field);
      const programCategory = programCategories.find(cat =>
        cat.programs.some(p => p.value === program)
      );
      const fieldCategory = fieldCategories.find(cat =>
        cat.fields.some(f => f.value === field)
      );

      // Prepare user data with detailed structure
      const userData = {
        // Basic Information
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender,
        email: auth.currentUser.email,

        // Academic Information
        program: {
          id: program,
          name: selectedProgram?.label || '',
          category: programCategory?.category || '',
          categoryEmoji: programCategory?.category.split(' ')[0] || '',
        },

        // Career Information
        field: {
          id: field,
          name: selectedField?.label || '',
          category: fieldCategory?.category || '',
          categoryEmoji: fieldCategory?.category.split(' ')[0] || '',
        },

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
          addedAt: serverTimestamp(),
        })),

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

      // Save to Firestore
      await setDoc(userRef, userData, { merge: true });

      // Update user's profile completion status
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
              navigation.navigate('SignIn');
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
    }
  };

  // Enhanced validation function
  const validateForm = () => {
    const errors = [];

    if (!firstName.trim()) {
      errors.push('First name is required');
    }
    if (!lastName.trim()) {
      errors.push('Last name is required');
    }
    if (!gender) {
      errors.push('Gender is required');
    }
    if (!program) {
      errors.push('Program is required');
    }
    if (!field) {
      errors.push('Preferred field is required');
    }
    if (skills.length === 0) {
      errors.push('At least one skill is required');
    }
    if (!locationPreference.remote && !locationPreference.onsite && !locationPreference.hybrid) {
      errors.push('At least one location preference is required');
    }

    if (errors.length > 0) {
      Alert.alert(
        'Validation Error',
        errors.join('\n'),
        [{ text: 'OK' }]
      );
      return false;
    }

    return true;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Setup Account</Text>
      <ScrollView contentContainerStyle={styles.card}>
        <Text style={styles.title}>Set up Your Profile</Text>

        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Your First Name"
          value={firstName}
          onChangeText={setFirstName}
        />

        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Your Last Name"
          value={lastName}
          onChangeText={setLastName}
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
        <TextInput
          style={styles.input}
          placeholder="Search your program"
          value={programSearch}
          onChangeText={text => {
            setProgramSearch(text);
            setShowProgramOptions(true);
          }}
          onFocus={() => setShowProgramOptions(true)}
        />
        {showProgramOptions && (
          <View style={styles.dropdown}>
            {allPrograms
              .filter(p => p.label.toLowerCase().includes(programSearch.toLowerCase()))
              .map(p => (
                <TouchableOpacity
                  key={p.value}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setProgram(p.value);
                    setProgramSearch(p.label);
                    setShowProgramOptions(false);
                  }}
                >
                  <Text>{p.label}</Text>
                </TouchableOpacity>
              ))}
          </View>
        )}

        <Text style={styles.label}>Preferred Field / Industry</Text>
        <TextInput
          style={styles.input}
          placeholder="Search your preferred field"
          value={fieldSearch}
          onChangeText={text => {
            setFieldSearch(text);
            setShowFieldOptions(true);
          }}
          onFocus={() => setShowFieldOptions(true)}
        />
        {showFieldOptions && (
          <View style={styles.dropdown}>
            {allFields
              .filter(f => f.label.toLowerCase().includes(fieldSearch.toLowerCase()))
              .map(f => (
                <TouchableOpacity
                  key={f.value}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setField(f.value);
                    setFieldSearch(f.label);
                    setShowFieldOptions(false);
                  }}
                >
                  <Text>{f.label}</Text>
                </TouchableOpacity>
              ))}
          </View>
        )}

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
          style={styles.input}
          placeholder="Search skills"
          value={skillSearch}
          onChangeText={setSkillSearch}
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
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#F4F5F9',
    color: 'black',
    marginBottom: 10,
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
  dropdown: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    maxHeight: 150,
    marginBottom: 10,
    zIndex: 10,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
