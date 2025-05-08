import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { doc, setDoc } from 'firebase/firestore';
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

  const availableSkills = [
    'Programming',
    'AI',
    'React Native',
    'Cloud',
    'Data Science',
    'Web Development',
    'Machine Learning',
    'Cybersecurity',
    'UI/UX Design',
  ];

  const toggleCheckbox = (type: 'remote' | 'onsite' | 'hybrid') => {
    setLocationPreference((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const finishSetup = async () => {
    if (!firstName || !lastName || !gender) {
      alert('Please complete all fields.');
      return;
    }

    const userData = {
      firstName,
      lastName,
      gender,
      program,
      field,
      locationPreference,
      skills,
      createdAt: new Date().toISOString(),
    };

    try {
      const userDocRef = doc(firestore, 'users', auth.currentUser?.uid || 'unknown');
      await setDoc(userDocRef, userData, { merge: true });

      alert('Account Setup Complete!');
      navigation.navigate('SignIn');
      onSetupComplete();
    } catch (error) {
      console.error('Error saving user data:', error);
      alert('An error occurred while saving your data.');
    }
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

        <Text style={styles.label}>Programs</Text>
        <RNPickerSelect
          onValueChange={(value) => setProgram(value)}
          placeholder={{ label: 'Type your course', value: null }}
          items={[
            { label: 'Computer Science', value: 'cs' },
            { label: 'Business', value: 'business' },
            { label: 'Engineering', value: 'engineering' },
          ]}
          style={pickerSelectStyles}
        />

        <Text style={styles.label}>Preferred Field / Industry</Text>
        <RNPickerSelect
          onValueChange={(value) => setField(value)}
          placeholder={{ label: 'Choose field', value: null }}
          items={[
            { label: 'Tech', value: 'tech' },
            { label: 'Finance', value: 'finance' },
            { label: 'Healthcare', value: 'healthcare' },
          ]}
          style={pickerSelectStyles}
        />

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

        <TouchableOpacity style={styles.button} onPress={finishSetup}>
          <Text style={styles.buttonText}>Finish Setup</Text>
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
};

export default SetupAccountScreen;
