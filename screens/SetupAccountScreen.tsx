import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import CheckBox from '@react-native-community/checkbox';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App'; // Adjust the path if needed

type NavigationProp = StackNavigationProp<RootStackParamList, 'SetupAccount'>;

export default function SetupAccountScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [program, setProgram] = useState('');
  const [field, setField] = useState('');
  const [locationPreference, setLocationPreference] = useState({
    remote: true,
    onsite: false,
    hybrid: false,
  });

  const toggleCheckbox = (type: 'remote' | 'onsite' | 'hybrid') => {
    setLocationPreference((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const finishSetup = () => {
    navigation.navigate('SignIn'); // ✅ Now this is type-safe
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Setup Account</Text>
      <View style={styles.card}>
        <Text style={styles.title}>Set up Your Profile</Text>

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
          placeholder={{ label: 'Type your course', value: null }}
          items={[
            { label: 'Tech', value: 'tech' },
            { label: 'Finance', value: 'finance' },
            { label: 'Healthcare', value: 'healthcare' },
          ]}
          style={pickerSelectStyles}
        />

        <Text style={styles.label}>Location Preference</Text>
        <View style={styles.checkboxContainer}>
          <View style={styles.checkboxRow}>
            <CheckBox
              value={locationPreference.remote}
              onValueChange={() => toggleCheckbox('remote')}
            />
            <Text style={styles.checkboxLabel}>Remote</Text>
          </View>
          <View style={styles.checkboxRow}>
            <CheckBox
              value={locationPreference.onsite}
              onValueChange={() => toggleCheckbox('onsite')}
            />
            <Text style={styles.checkboxLabel}>On-site</Text>
          </View>
          <View style={styles.checkboxRow}>
            <CheckBox
              value={locationPreference.hybrid}
              onValueChange={() => toggleCheckbox('hybrid')}
            />
            <Text style={styles.checkboxLabel}>Hybrid</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={finishSetup}>
          <Text style={styles.buttonText}>Finish Setup</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F5F9',
    padding: 20,
  },
  header: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 3,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    marginBottom: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    marginLeft: 5,
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
