import React, { useState, useEffect } from 'react';
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
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { signOut, deleteUser } from 'firebase/auth';
import { auth, firestore } from '../firebase/config';
import { RootStackParamList } from '../App';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomNavbar from '../components/BottomNav';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, deleteDoc } from 'firebase/firestore';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

// Enable layout animation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [locationAccess, setLocationAccess] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(true);

  // Load persisted settings on mount
  useEffect(() => {
    (async () => {
      const emailNotifVal = await AsyncStorage.getItem('emailNotif');
      const pushNotifVal = await AsyncStorage.getItem('pushNotif');
      const locationAccessVal = await AsyncStorage.getItem('locationAccess');
      const autoUpdateVal = await AsyncStorage.getItem('autoUpdate');
      if (emailNotifVal !== null) setEmailNotif(emailNotifVal === 'true');
      if (pushNotifVal !== null) setPushNotif(pushNotifVal === 'true');
      if (locationAccessVal !== null) setLocationAccess(locationAccessVal === 'true');
      if (autoUpdateVal !== null) setAutoUpdate(autoUpdateVal === 'true');
    })();
  }, []);

  // Persist settings on change
  useEffect(() => { AsyncStorage.setItem('emailNotif', emailNotif.toString()); }, [emailNotif]);
  useEffect(() => { AsyncStorage.setItem('pushNotif', pushNotif.toString()); }, [pushNotif]);
  useEffect(() => { AsyncStorage.setItem('locationAccess', locationAccess.toString()); }, [locationAccess]);
  useEffect(() => { AsyncStorage.setItem('autoUpdate', autoUpdate.toString()); }, [autoUpdate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const user = auth.currentUser;
              if (!user) throw new Error('No user is currently signed in.');
              // Delete Firestore user document
              await deleteDoc(doc(firestore, 'users', user.uid));
              // Delete Firebase Auth user
              await deleteUser(user);
              // No manual navigation needed; auth state will handle it
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete account.');
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Settings</Text>

        {/* Notifications Section */}
        <Text style={styles.dropdownTitle}>Notifications</Text>
        <View>
          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Email Notifications</Text>
            <Switch
              value={emailNotif}
              onValueChange={setEmailNotif}
            />
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Push Notifications</Text>
            <Switch
              value={pushNotif}
              onValueChange={setPushNotif}
            />
          </View>
        </View>
        <View style={styles.sectionSeparator} />

        {/* Preferences Section */}
        <Text style={styles.dropdownTitle}>Preferences</Text>
        <View>
          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Location Access</Text>
            <Switch
              value={locationAccess}
              onValueChange={setLocationAccess}
            />
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Auto-Update App</Text>
            <Switch
              value={autoUpdate}
              onValueChange={setAutoUpdate}
            />
          </View>
        </View>
        <View style={styles.sectionSeparator} />

        {/* Account Management Section */}
        <Text style={styles.dropdownTitle}>Account Management</Text>
        <View>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Text style={styles.deleteButtonText}>Delete Account</Text>
            <Icon name="account-remove-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.sectionSeparator} />

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
  dropdownTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
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
  sectionSeparator: { height: 1, backgroundColor: '#eee', marginVertical: 18 },
  deleteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#d9534f', paddingVertical: 12, borderRadius: 6, marginTop: 10 },
  deleteButtonText: { color: '#fff', fontSize: 16, fontWeight: '600', marginRight: 8 },
});

export default SettingsScreen;
