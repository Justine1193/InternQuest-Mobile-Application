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
import { auth } from '../firebase/config';
import { RootStackParamList } from '../App';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomNavbar from '../components/BottomNav';

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
  const [showAccount, setShowAccount] = useState(false);

  const toggleDropdown = (section: 'notif' | 'prefs' | 'account') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (section === 'notif') setShowNotif(!showNotif);
    else if (section === 'prefs') setShowPrefs(!showPrefs);
    else setShowAccount(!showAccount);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate('SignIn');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Add account deletion logic here
            Alert.alert('Account Deleted', 'Your account has been deleted.');
          },
        },
      ]
    );
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Settings</Text>

        {/* Theme Settings */}
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={(value) => {
              setDarkMode(value);
              Alert.alert('Theme Changed', value ? 'Dark Mode Enabled' : 'Light Mode Enabled');
            }}
          />
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
              <Switch
                value={emailNotif}
                onValueChange={(value) => {
                  setEmailNotif(value);
                  Alert.alert('Email Notifications', value ? 'Enabled' : 'Disabled');
                }}
              />
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingText}>Push Notifications</Text>
              <Switch
                value={pushNotif}
                onValueChange={(value) => {
                  setPushNotif(value);
                  Alert.alert('Push Notifications', value ? 'Enabled' : 'Disabled');
                }}
              />
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
              <Switch
                value={locationAccess}
                onValueChange={(value) => {
                  setLocationAccess(value);
                  Alert.alert('Location Access', value ? 'Enabled' : 'Disabled');
                }}
              />
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingText}>Auto-Update App</Text>
              <Switch
                value={autoUpdate}
                onValueChange={(value) => {
                  setAutoUpdate(value);
                  Alert.alert('Auto-Update', value ? 'Enabled' : 'Disabled');
                }}
              />
            </View>
          </View>
        )}

        {/* Account Management Dropdown */}
        <TouchableOpacity style={styles.dropdownHeader} onPress={() => toggleDropdown('account')}>
          <Text style={styles.dropdownTitle}>Account Management</Text>
          <Icon name={showAccount ? 'chevron-up' : 'chevron-down'} size={24} color="#333" />
        </TouchableOpacity>
        {showAccount && (
          <View>
            <TouchableOpacity style={styles.settingRow} onPress={handleDeleteAccount}>
              <Text style={[styles.settingText, { color: '#d9534f' }]}>Delete Account</Text>
              <Icon name="account-remove-outline" size={20} color="#d9534f" />
            </TouchableOpacity>
          </View>
        )}

        {/* Log Out Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomNavbar navigation={navigation} />
    </>
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
