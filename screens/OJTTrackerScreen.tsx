import React, { useEffect, useState } from 'react';
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
import type { RootStackParamList } from '../App'; // Import RootStackParamList

type TimeLog = {
  date: string;
  clockIn: string;
  clockOut: string;
  hours: string;
};

const OJTTrackerScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'OJTTracker'>>(); // Typed navigation
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState<TimeLog>({ date: '', clockIn: '', clockOut: '', hours: '' });
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  useEffect(() => {
    loadLogsFromStorage();
  }, []);

  const loadLogsFromStorage = async () => {
    try {
      const savedLogs = await AsyncStorage.getItem('OJT_TIME_LOGS');
      if (savedLogs) {
        setTimeLogs(JSON.parse(savedLogs));
      }
    } catch (error) {
      console.error('Failed to load time logs:', error);
    }
  };

  const saveLogsToStorage = async () => {
    try {
      await AsyncStorage.setItem('OJT_TIME_LOGS', JSON.stringify(timeLogs));
      Alert.alert('Success', 'Time logs saved locally!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save time logs.');
    }
  };

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

  const handleSave = () => {
    if (!formData.date || !formData.clockIn || !formData.clockOut || !formData.hours) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (editIndex !== null) {
      const updatedLogs = [...timeLogs];
      updatedLogs[editIndex] = formData;
      setTimeLogs(updatedLogs);
    } else {
      setTimeLogs([...timeLogs, formData]);
    }

    setModalVisible(false);
    setFormData({ date: '', clockIn: '', clockOut: '', hours: '' });
  };

  const handleDelete = (index: number) => {
    Alert.alert("Confirm", "Delete this time log?", [
      { text: "Cancel" },
      {
        text: "Delete", onPress: () => {
          const filtered = timeLogs.filter((_, i) => i !== index);
          setTimeLogs(filtered);
        }
      }
    ]);
  };

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
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
                  <Text style={styles.infoValue}>36hrs / 300 hrs</Text>
                  <Text style={styles.subText}>Estimated left 44 workdays</Text>
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
                  onPress={saveLogsToStorage} />
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
                  {['date', 'clockIn', 'clockOut', 'hours'].map((field) => (
                      <TextInput
                          key={field}
                          placeholder={field}
                          style={styles.input}
                          value={(formData as any)[field]}
                          onChangeText={(text) => setFormData({ ...formData, [field]: text })} />
                  ))}
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
      </Modal></>

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
});

export default OJTTrackerScreen;
