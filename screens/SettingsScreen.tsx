import React, { useState } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { RootStackParamList } from '../App';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

// Enable layout animation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [darkMode, setDarkMode] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [locationAccess, setLocationAccess] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(true);

  const [showNotif, setShowNotif] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);

  const toggleDropdown = (section: 'notif' | 'prefs') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (section === 'notif') setShowNotif(!showNotif);
    else setShowPrefs(!showPrefs);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate('SignIn');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Settings</Text>

      <View style={styles.settingRow}>
        <Text style={styles.settingText}>Dark Mode</Text>
        <Switch value={darkMode} onValueChange={setDarkMode} />
      </View>

      {/* Notifications Dropdown */}
      <TouchableOpacity style={styles.dropdownHeader} onPress={() => toggleDropdown('notif')}>
        <Text style={styles.dropdownTitle}>Notifications</Text>
        <Icon name={showNotif ? 'chevron-up' : 'chevron-down'} size={24} color="#333" />
      </TouchableOpacity>
      {showNotif && (
        <View>
          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Email Notifications</Text>
            <Switch value={emailNotif} onValueChange={setEmailNotif} />
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Push Notifications</Text>
            <Switch value={pushNotif} onValueChange={setPushNotif} />
          </View>
        </View>
      )}

      {/* Preferences Dropdown */}
      <TouchableOpacity style={styles.dropdownHeader} onPress={() => toggleDropdown('prefs')}>
        <Text style={styles.dropdownTitle}>Preferences</Text>
        <Icon name={showPrefs ? 'chevron-up' : 'chevron-down'} size={24} color="#333" />
      </TouchableOpacity>
      {showPrefs && (
        <View>
          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Location Access</Text>
            <Switch value={locationAccess} onValueChange={setLocationAccess} />
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Auto-Update App</Text>
            <Switch value={autoUpdate} onValueChange={setAutoUpdate} />
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingLeft: 10,
  },
  settingText: {
    fontSize: 16,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  logoutButton: {
    marginTop: 40,
    backgroundColor: '#d9534f',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen;
