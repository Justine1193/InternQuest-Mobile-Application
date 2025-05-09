import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, Modal, TextInput,
  TouchableOpacity, Alert, StyleSheet
} from 'react-native';
import { Card, FAB } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import BottomNavbar from '../components/BottomNav';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../App';
import { auth, firestore } from '../firebase/config';
import { doc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';

// Types
type TimeLog = {
  date: string;
  clockIn: string;
  clockOut: string;
  hours: string;
};

type FormData = TimeLog;

type AmPm = 'AM' | 'PM';

// Constants
const DEFAULT_REQUIRED_HOURS = 300;
const MAX_HOURS = 24;

const OJTTrackerScreen: React.FC = () => {
  // Navigation
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'OJTTracker'>>();

  // State
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState<FormData>({ date: '', clockIn: '', clockOut: '', hours: '' });
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [clockInAmPm, setClockInAmPm] = useState<AmPm>('AM');
  const [clockOutAmPm, setClockOutAmPm] = useState<AmPm>('PM');
  const [requiredHours, setRequiredHours] = useState(DEFAULT_REQUIRED_HOURS);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [goalInput, setGoalInput] = useState('300');
  const [totalHours, setTotalHours] = useState(0);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    await Promise.all([
      loadRequiredHours(),
      loadLogsFromFirestore()
    ]);
  };

  // Data loading functions
  const loadRequiredHours = async () => {
    const savedGoal = await AsyncStorage.getItem('OJT_REQUIRED_HOURS');
    if (savedGoal) setRequiredHours(Number(savedGoal));
  };

  const loadLogsFromFirestore = async () => {
    if (!auth.currentUser) return;
    try {
      const userId = auth.currentUser.uid;
      const logsCol = collection(firestore, `users/${userId}/ojtLogs`);
      const logsSnap = await getDocs(logsCol);
      const logs: TimeLog[] = [];
      logsSnap.forEach(doc => logs.push(doc.data() as TimeLog));
      setTimeLogs(logs.sort((a, b) => b.date.localeCompare(a.date)));
    } catch (error) {
      console.error('Error loading logs:', error);
      Alert.alert('Error', 'Failed to load time logs.');
    }
  };

  // Validation functions
  const validateTime = (time: string): boolean => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  const validateDate = (date: string): boolean => {
    const [year, month, day] = date.split('/').map(num => parseInt(num));
    if (isNaN(year) || isNaN(month) || isNaN(day)) return false;
    const dateObj = new Date(year, month - 1, day);
    return dateObj.getFullYear() === year &&
      dateObj.getMonth() === month - 1 &&
      dateObj.getDate() === day;
  };

  // Firestore operations
  const syncLogToFirestore = async (log: TimeLog) => {
    if (!auth.currentUser) return;
    try {
      const userId = auth.currentUser.uid;
      const logId = `${log.date}_${log.clockIn}`.replace(/\W/g, '');
      const logRef = doc(firestore, `users/${userId}/ojtLogs/${logId}`);
      await setDoc(logRef, log);
    } catch (error) {
      console.error('Error syncing log:', error);
      throw error;
    }
  };

  const deleteLogFromFirestore = async (log: TimeLog) => {
    if (!auth.currentUser) return;
    try {
      const userId = auth.currentUser.uid;
      const logId = `${log.date}_${log.clockIn}`.replace(/\W/g, '');
      const logRef = doc(firestore, `users/${userId}/ojtLogs/${logId}`);
      await deleteDoc(logRef);
    } catch (error) {
      console.error('Error deleting log:', error);
      throw error;
    }
  };

  // Event handlers
  const handleSave = async () => {
    try {
      // Validate inputs
      if (!formData.date || !formData.clockIn || !formData.clockOut || !formData.hours) {
        Alert.alert('Error', 'Please fill in all fields.');
        return;
      }

      if (!validateDate(formData.date)) {
        Alert.alert('Error', 'Please enter a valid date in YYYY/MM/DD format.');
        return;
      }

      // Validate time format (HH:MM)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(formData.clockIn) || !timeRegex.test(formData.clockOut)) {
        Alert.alert('Error', 'Please enter valid times in HH:MM format.');
        return;
      }

      const hours = Number(formData.hours);
      if (isNaN(hours) || hours <= 0 || hours > MAX_HOURS) {
        Alert.alert('Error', `Please enter a valid number of hours (1-${MAX_HOURS}).`);
        return;
      }

      // Check for duplicates
      const logId = `${formData.date}_${formData.clockIn}`.replace(/\W/g, '');
      const duplicate = timeLogs.find(
        log => `${log.date}_${log.clockIn}`.replace(/\W/g, '') === logId && editIndex === null
      );
      if (duplicate) {
        Alert.alert('Error', 'A log for this date and clock-in time already exists.');
        return;
      }

      // Save log
      const logToSave = {
        ...formData,
        clockIn: `${formData.clockIn} ${clockInAmPm}`,
        clockOut: `${formData.clockOut} ${clockOutAmPm}`,
      };

      if (editIndex !== null) {
        const updatedLogs = [...timeLogs];
        updatedLogs[editIndex] = logToSave;
        setTimeLogs(updatedLogs);
        await syncLogToFirestore(logToSave);
      } else {
        const newLogs = [...timeLogs, logToSave];
        setTimeLogs(newLogs);
        await syncLogToFirestore(logToSave);
      }

      // Update UI
      await loadLogsFromFirestore();
      setModalVisible(false);
      setFormData({ date: '', clockIn: '', clockOut: '', hours: '' });
      Alert.alert('Success', 'Time log saved successfully!');
    } catch (error) {
      console.error('Error saving log:', error);
      Alert.alert('Error', 'Failed to save time log. Please try again.');
    }
  };

  const handleDelete = async (index: number) => {
    Alert.alert("Confirm", "Delete this time log?", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            const logToDelete = timeLogs[index];
            await deleteLogFromFirestore(logToDelete);
            const filtered = timeLogs.filter((_, i) => i !== index);
            setTimeLogs(filtered);
            await loadLogsFromFirestore();
          } catch (error) {
            console.error('Error deleting log:', error);
            Alert.alert('Error', 'Failed to delete time log.');
          }
        }
      }
    ]);
  };

  const saveGoal = useCallback(async () => {
    const num = Number(goalInput);
    if (isNaN(num) || num <= 0) {
      Alert.alert('Error', 'Please enter a valid number of hours.');
      return;
    }
    setRequiredHours(num);
    await AsyncStorage.setItem('OJT_REQUIRED_HOURS', String(num));
    setGoalModalVisible(false);
  }, [goalInput]);

  // UI handlers
  const openModal = (log?: TimeLog, index?: number) => {
    if (log && index !== undefined) {
      setFormData(log);
      setEditIndex(index);
    } else {
      setFormData({ date: '', clockIn: '', clockOut: '', hours: '' });
      setEditIndex(null);
    }
    setModalVisible(true);
  };

  const toggleDropdown = () => setIsDropdownVisible(!isDropdownVisible);

  // Calculate total hours
  useEffect(() => {
    const sum = timeLogs.reduce((acc, log) => acc + Number(log.hours), 0);
    setTotalHours(sum);
  }, [timeLogs]);

  // Add this new function to format time display
  const formatTimeDisplay = (time: string, amPm: AmPm) => {
    return `${time} ${amPm}`;
  };

  // Add this new function to handle hours input
  const handleHoursInput = (text: string) => {
    // Remove any non-numeric characters
    const numericValue = text.replace(/[^0-9]/g, '');

    // Convert to number and validate
    const hours = parseInt(numericValue);

    // Only update if it's a valid number between 1 and 24
    if (!isNaN(hours) && hours >= 1 && hours <= 24) {
      setFormData({ ...formData, hours: numericValue });
    } else if (numericValue === '') {
      // Allow empty input for better UX
      setFormData({ ...formData, hours: '' });
    }
  };

  // Add these new functions to handle formatted inputs
  const formatTimeInput = (text: string) => {
    // Remove any non-numeric characters
    const numbers = text.replace(/[^0-9]/g, '');

    // Format as HH:MM
    if (numbers.length <= 2) {
      return numbers;
    } else {
      return `${numbers.slice(0, 2)}:${numbers.slice(2, 4)}`;
    }
  };

  const formatDateInput = (text: string) => {
    // Remove any non-numeric characters
    const numbers = text.replace(/[^0-9]/g, '');

    // Format as YYYY/MM/DD
    if (numbers.length <= 4) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 4)}/${numbers.slice(4)}`;
    } else {
      return `${numbers.slice(0, 4)}/${numbers.slice(4, 6)}/${numbers.slice(6, 8)}`;
    }
  };

  return (
    <><ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Icon name="arrow-back" size={24} onPress={() => navigation.goBack()} />
        <Text style={styles.headerText}>OJT Personal Tracker</Text>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Goal</Text>
          <TouchableOpacity onPress={() => setGoalModalVisible(true)}>
            <Text style={styles.infoValue}>{totalHours}hrs / {requiredHours} hrs</Text>
          </TouchableOpacity>
          <Text style={styles.subText}>
            {Math.max(0, requiredHours - totalHours)} hours remaining
          </Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Company</Text>
          <Text style={styles.infoValue}>Google Inc.</Text>
        </View>
      </View>

      <View style={styles.noteBox}>
        <Icon name="warning-outline" size={20} color="#FFA500" />
        <Text style={styles.noteText}>
          This tracker is for personal use only. For official time logs, please check with your HR.
        </Text>
      </View>

      <Card style={styles.tableCard}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Date</Text>
          <Text style={styles.tableHeaderText}>Clock In</Text>
          <Text style={styles.tableHeaderText}>Clock Out</Text>
          <Text style={styles.tableHeaderText}>Hours</Text>
        </View>

        {timeLogs.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>{item.date}</Text>
            <Text style={styles.tableCell}>{item.clockIn}</Text>
            <Text style={styles.tableCell}>{item.clockOut}</Text>
            <Text style={styles.tableCell}>{item.hours}</Text>
            <TouchableOpacity onPress={() => openModal(item, index)}>
              <Icon name="create-outline" size={18} color="blue" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(index)}>
              <Icon name="trash-outline" size={18} color="red" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        ))}
      </Card>

      <View style={styles.pagination}>
        <Text>‹ Previous</Text>
        <Text style={styles.pageIndicator}>Page 1 ▾</Text>
        <Text>Next ›</Text>
      </View>
    </ScrollView>

      {/* Dropdown Buttons */}
      {isDropdownVisible && (
        <View style={styles.dropdownContainer}>
          <FAB
            style={styles.dropdownButton}
            icon="content-save"
            label="Save"
            onPress={() => { }} />
          <FAB
            style={styles.dropdownButton}
            icon="plus"
            label="Add Log"
            onPress={() => openModal()} />
        </View>
      )}

      {/* Plus Button */}
      <FAB
        style={styles.fabPlus}
        icon="plus"
        onPress={toggleDropdown} />

      {/* Bottom Navbar */}
      <View style={styles.bottomNavbar}>
        <BottomNavbar navigation={navigation} />
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editIndex !== null ? 'Edit Log' : 'Add Time Log'}</Text>

            {/* Date Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Date (YYYY/MM/DD)</Text>
              <TextInput
                placeholder="YYYY/MM/DD"
                style={styles.input}
                value={formData.date}
                onChangeText={text => {
                  const formatted = formatDateInput(text);
                  setFormData({ ...formData, date: formatted });
                }}
                keyboardType="number-pad"
                maxLength={10}
              />
              <Text style={styles.helperText}>Enter date in YYYY/MM/DD format</Text>
            </View>

            {/* Clock In Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Clock In</Text>
              <View style={styles.timeInputContainer}>
                <TextInput
                  placeholder="HH:MM"
                  style={[styles.input, { flex: 1 }]}
                  value={formData.clockIn}
                  onChangeText={text => {
                    const formatted = formatTimeInput(text);
                    setFormData({ ...formData, clockIn: formatted });
                  }}
                  keyboardType="number-pad"
                  maxLength={5}
                />
                <View style={styles.amPmContainer}>
                  <TouchableOpacity
                    style={[
                      styles.amPmButton,
                      clockInAmPm === 'AM' && styles.amPmButtonActive
                    ]}
                    onPress={() => setClockInAmPm('AM')}
                  >
                    <Text style={[
                      styles.amPmText,
                      clockInAmPm === 'AM' && styles.amPmTextActive
                    ]}>AM</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.amPmButton,
                      clockInAmPm === 'PM' && styles.amPmButtonActive
                    ]}
                    onPress={() => setClockInAmPm('PM')}
                  >
                    <Text style={[
                      styles.amPmText,
                      clockInAmPm === 'PM' && styles.amPmTextActive
                    ]}>PM</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.helperText}>Enter time in HH:MM format</Text>
            </View>

            {/* Clock Out Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Clock Out</Text>
              <View style={styles.timeInputContainer}>
                <TextInput
                  placeholder="HH:MM"
                  style={[styles.input, { flex: 1 }]}
                  value={formData.clockOut}
                  onChangeText={text => {
                    const formatted = formatTimeInput(text);
                    setFormData({ ...formData, clockOut: formatted });
                  }}
                  keyboardType="number-pad"
                  maxLength={5}
                />
                <View style={styles.amPmContainer}>
                  <TouchableOpacity
                    style={[
                      styles.amPmButton,
                      clockOutAmPm === 'AM' && styles.amPmButtonActive
                    ]}
                    onPress={() => setClockOutAmPm('AM')}
                  >
                    <Text style={[
                      styles.amPmText,
                      clockOutAmPm === 'AM' && styles.amPmTextActive
                    ]}>AM</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.amPmButton,
                      clockOutAmPm === 'PM' && styles.amPmButtonActive
                    ]}
                    onPress={() => setClockOutAmPm('PM')}
                  >
                    <Text style={[
                      styles.amPmText,
                      clockOutAmPm === 'PM' && styles.amPmTextActive
                    ]}>PM</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.helperText}>Enter time in HH:MM format</Text>
            </View>

            {/* Hours Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Hours (1-24)</Text>
              <View style={styles.hoursInputContainer}>
                <TextInput
                  placeholder="Enter hours"
                  style={[styles.input, styles.hoursInput]}
                  value={formData.hours}
                  onChangeText={handleHoursInput}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <Text style={styles.hoursLabel}>hours</Text>
              </View>
              <Text style={styles.hoursHelperText}>
                Please enter a number between 1 and 24
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
                <Text style={{ color: 'white' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Goal Edit Modal */}
      <Modal visible={goalModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Required Hours</Text>
            <TextInput
              placeholder="Required Hours"
              style={styles.input}
              value={goalInput}
              onChangeText={setGoalInput}
              keyboardType="number-pad"
              maxLength={4}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setGoalModalVisible(false)} style={styles.cancelBtn}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveGoal} style={styles.saveBtn}>
                <Text style={{ color: 'white' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', flex: 1, paddingTop: 30 },
  scrollContent: { paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  headerText: { fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoBox: {
    width: '48%', backgroundColor: '#f9f9ff', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#cce0ff', alignItems: 'center',
  },
  infoLabel: { color: '#007bff', fontWeight: 'bold' },
  infoValue: { fontSize: 16, fontWeight: 'bold', marginVertical: 4 },
  subText: { fontSize: 12, color: '#888' },
  noteBox: {
    marginVertical: 16, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fffbe6', padding: 10, borderRadius: 8,
    borderColor: '#ffdd57', borderWidth: 1,
  },
  noteText: { color: '#ff8800', marginLeft: 8, fontSize: 13 },
  tableCard: { borderRadius: 10, overflow: 'hidden', marginTop: 10, marginBottom: 20 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#007bff', padding: 10 },
  tableHeaderText: { color: 'white', flex: 1, fontWeight: 'bold', fontSize: 12 },
  tableRow: {
    flexDirection: 'row', padding: 10, borderBottomColor: '#eee',
    borderBottomWidth: 1, alignItems: 'center',
  },
  tableCell: { flex: 1, fontSize: 12 },
  pagination: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 32, alignItems: 'center', marginBottom: 80,
  },
  pageIndicator: { fontWeight: 'bold' },
  fabSave: {
    position: 'absolute', bottom: 160, right: 20, backgroundColor: '#4CAF50',
  },
  fabAdd: {
    position: 'absolute', bottom: 80, right: 20, backgroundColor: '#007bff',
  },
  fabPlus: {
    position: 'absolute',
    bottom: 80, // Positioned above the Bottom Navbar
    right: 20,
    backgroundColor: '#007bff',
  },
  dropdownContainer: {
    position: 'absolute',
    bottom: 140, // Positioned above the Plus Button
    right: 20,
    alignItems: 'flex-end', // Align buttons to the right
  },
  dropdownButton: {
    marginBottom: 10, // Space between dropdown buttons
    backgroundColor: '#4CAF50',
  },
  bottomNavbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    elevation: 5, // Add shadow for better visibility
  },
  modalOverlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    width: '85%', backgroundColor: 'white', padding: 20, borderRadius: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  input: {
    borderBottomWidth: 1, borderBottomColor: '#ccc', marginBottom: 10, paddingVertical: 4,
  },
  modalButtons: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 16,
  },
  cancelBtn: {
    padding: 10, backgroundColor: '#eee', borderRadius: 5,
  },
  saveBtn: {
    padding: 10, backgroundColor: '#007bff', borderRadius: 5,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  amPmContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    overflow: 'hidden',
  },
  amPmButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
  },
  amPmButtonActive: {
    backgroundColor: '#007bff',
  },
  amPmText: {
    fontSize: 14,
    color: '#333',
  },
  amPmTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  hoursInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
  },
  hoursInput: {
    flex: 1,
    borderBottomWidth: 0,
    marginBottom: 0,
    textAlign: 'center',
    fontSize: 16,
    paddingVertical: 8,
  },
  hoursLabel: {
    color: '#666',
    marginLeft: 8,
    fontSize: 14,
  },
  hoursHelperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default OJTTrackerScreen;
