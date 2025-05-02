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
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { ref, set } from 'firebase/database';
import { auth, db } from '../firebase';

type NavigationProp = StackNavigationProp<RootStackParamList, 'SetupAccount'>;

export default function SetupAccountScreen() {
  const navigation = useNavigation<NavigationProp>();
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
      createdAt: new Date().toISOString(),
    };

    try {
      const userRef = ref(db, 'userinformation/' + auth.currentUser?.uid);
      await set(userRef, userData);

      alert('Account Setup Complete!');
      navigation.navigate('SignIn');
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
                  locationPreference[type as keyof typeof locationPreference] && styles.checkedBox,
                ]}
              />
              <Text style={styles.checkboxLabel}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
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
}

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
