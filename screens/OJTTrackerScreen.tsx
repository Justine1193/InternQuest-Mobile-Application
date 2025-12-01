import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, Modal, TextInput,
  TouchableOpacity, Alert, StyleSheet, Platform, PermissionsAndroid, Linking, Share
} from 'react-native';
import { Card, FAB } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import BottomNavbar from '../components/BottomNav';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../App';
import { auth, firestore } from '../firebase/config';
import { doc, setDoc, deleteDoc, collection, getDocs, getDoc } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import RNBlobUtil from 'react-native-blob-util';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';

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
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate()
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [userStatus, setUserStatus] = useState<string | null>(null);
  const [userCompany, setUserCompany] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
    fetchUserStatusAndCompany();
  }, []);

  const loadInitialData = async () => {
    await Promise.all([
      loadRequiredHours(),
      loadLogsFromFirestore()
    ]);
  };

  const fetchUserStatusAndCompany = async () => {
    if (!auth.currentUser) return;
    try {
      const userDoc = await getDoc(doc(firestore, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserStatus(data.status || null);
        setUserCompany(data.company || null);
      }
    } catch (error: any) {
      setUserStatus(null);
      setUserCompany(null);
    }
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
      console.log('loadLogsFromFirestore: loading logs for user', userId);
      const logsCol = collection(firestore, `users/${userId}/ojtLogs`);
      const logsSnap = await getDocs(logsCol);
      console.log('loadLogsFromFirestore: found', logsSnap.size, 'documents');
      const logs: TimeLog[] = [];
      logsSnap.forEach((doc: any) => logs.push(doc.data() as TimeLog));
      setTimeLogs(logs.sort((a, b) => b.date.localeCompare(a.date)));
    } catch (error: any) {
      console.error('Error loading logs:', error);
      Alert.alert('Error', 'Failed to load time logs: ' + (error?.message || String(error)));
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
    if (!auth.currentUser) {
      console.warn('syncLogToFirestore: no auth.currentUser — user not signed in');
      throw new Error('Not authenticated');
    }

    try {
      const userId = auth.currentUser.uid;
      const logId = `${log.date}_${log.clockIn}`.replace(/\W/g, '');
      const path = `users/${userId}/ojtLogs/${logId}`;
      const logRef = doc(firestore, path);

      console.log('syncLogToFirestore: attempting to write', { userId, path, log });
      await setDoc(logRef, log);
      console.log('syncLogToFirestore: write succeeded', { userId, path, logId });
    } catch (error: any) {
      // Provide helpful debug logs for permission issues and other failures
      console.error('syncLogToFirestore: failed to write log —', {
        message: error?.message ?? error,
        code: error?.code ?? null,
        stack: error?.stack ?? null,
      });
      // Re-throw so callers can show an error message (or handle as they see fit)
      throw error;
    }
  };

  const deleteLogFromFirestore = async (log: TimeLog) => {
    if (!auth.currentUser) return;
    try {
      const userId = auth.currentUser.uid;
      const logId = `${log.date}_${log.clockIn}`.replace(/\W/g, '');
      const path = `users/${userId}/ojtLogs/${logId}`;
      const logRef = doc(firestore, path);
      console.log('deleteLogFromFirestore: attempting delete', { userId, path, logId });
      await deleteDoc(logRef);
      console.log('deleteLogFromFirestore: delete succeeded', { userId, path, logId });
    } catch (error) {
      console.error('Error deleting log:', error);
      // Diagnostic write so we can inspect failure server-side
      try {
        if (auth.currentUser) await setDoc(doc(firestore, 'users', auth.currentUser.uid), { lastOjtSyncError: { time: new Date().toISOString(), message: String(error) } }, { merge: true });
      } catch (dbgErr) {
        console.error('deleteLogFromFirestore: failed to write debug info to user doc:', dbgErr);
      }
      throw error;
    }
  };

  // Event handlers
  const calculateHours = (clockIn: string, clockOut: string, clockInAmPm: AmPm, clockOutAmPm: AmPm) => {
    if (!clockIn || !clockOut) return '';

    // Convert times to 24-hour format
    const convertTo24Hour = (time: string, amPm: AmPm) => {
      const [hours, minutes] = time.split(':').map(Number);
      let hour24 = hours;

      if (amPm === 'PM' && hours !== 12) {
        hour24 += 12;
      } else if (amPm === 'AM' && hours === 12) {
        hour24 = 0;
      }

      return hour24 + (minutes / 60);
    };

    const startTime = convertTo24Hour(clockIn, clockInAmPm);
    const endTime = convertTo24Hour(clockOut, clockOutAmPm);

    // Calculate hours difference
    let hours = endTime - startTime;

    // Handle overnight shifts (when clock out is earlier than clock in)
    if (hours < 0) {
      hours += 24;
    }

    // Handle invalid time ranges
    if (hours > 24) {
      Alert.alert('Warning', 'Time difference exceeds 24 hours. Please check your times.');
      return '';
    }

    // Round to nearest whole number
    const roundedHours = Math.round(hours);

    // Return as string
    return roundedHours.toString();
  };

  const handleSave = async () => {
    try {
      console.log('handleSave: saving formData', formData);
      // Validate inputs
      if (!formData.date || !formData.clockIn || !formData.clockOut) {
        Alert.alert('Error', 'Please fill in all required fields.');
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

      // Calculate hours if manual input is empty
      const calculatedHours = calculateHours(
        formData.clockIn,
        formData.clockOut,
        clockInAmPm,
        clockOutAmPm
      );

      const hours = formData.hours || calculatedHours;
      const hoursNum = parseInt(hours);

      if (isNaN(hoursNum) || hoursNum <= 0 || hoursNum > MAX_HOURS) {
        Alert.alert('Error', `Please enter a valid whole number of hours (1-${MAX_HOURS}).`);
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
        hours: hours,
      };

      if (editIndex !== null) {
        const updatedLogs = [...timeLogs];
        updatedLogs[editIndex] = logToSave;
        setTimeLogs(updatedLogs);
        try {
          await syncLogToFirestore(logToSave);
        } catch (error: any) {
          console.error('handleSave: sync edited log failed', error);
          Alert.alert('Error', `Failed saving edited log: ${error?.message || String(error)}`);
          return; // stop, keep modal open for retry
        }
      } else {
        const newLogs = [...timeLogs, logToSave];
        setTimeLogs(newLogs);
        try {
          await syncLogToFirestore(logToSave);
        } catch (error: any) {
          console.error('handleSave: sync new log failed', error);
          Alert.alert('Error', `Failed saving new log: ${error?.message || String(error)}`);
          // revert the optimistic add
          setTimeLogs(timeLogs);
          return;
        }
      }

      // Update UI
      await loadLogsFromFirestore();
      setModalVisible(false);
      setFormData({ date: '', clockIn: '', clockOut: '', hours: '' });
      Alert.alert('Success', 'Time log saved successfully!');
    } catch (error: any) {
      console.error('Error saving log:', error);
      Alert.alert('Error', `Failed to save time log: ${error?.message || String(error)}. Please try again.`);

      // Diagnostic: attempt to write a small debug object to the user's root document
      // so we can inspect error details server-side (this write usually allowed by rules).
      try {
        if (auth.currentUser) {
          const uid = auth.currentUser.uid;
          await setDoc(doc(firestore, 'users', uid), {
            lastOjtSyncError: {
              time: new Date().toISOString(),
              message: error?.message || String(error),
            }
          }, { merge: true });
          console.log('handleSave: wrote lastOjtSyncError to users/' + uid);
        }
      } catch (dbgErr) {
        console.error('handleSave: failed to write debug info to user doc:', dbgErr);
      }
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
          } catch (error: any) {
            console.error('Error deleting log:', error);
            Alert.alert('Error', `Failed to delete time log: ${error?.message || String(error)}`);
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

  const requestStoragePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: "Storage Permission",
          message: "App needs access to storage to save your OJT logs.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const handleSaveCSV = async () => {
    try {
      const csvContent = generateCSV();
      const fileName = `OJT_Logs_${new Date().toISOString().split('T')[0]}.csv`;

      // Create a data URL for the CSV content
      const csvData = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;

      // Share the file
      await Share.share({
        url: csvData,
        title: fileName,
        message: 'Here is my OJT Logs CSV file',
      });

      Alert.alert('Success', 'CSV file has been prepared for download.');
    } catch (error) {
      console.error('Error preparing CSV:', error);
      Alert.alert('Error', 'Failed to prepare CSV file for download.');
    }
  };

  const generateCSV = () => {
    // CSV Header
    const headers = ['Date', 'Clock In', 'Clock Out', 'Hours'];
    const csvRows = [headers];

    // Add data rows
    timeLogs.forEach(log => {
      csvRows.push([
        log.date,
        log.clockIn,
        log.clockOut,
        log.hours
      ]);
    });

    // Convert to CSV string with proper escaping
    const csvContent = csvRows.map(row =>
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    return csvContent;
  };

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
    (async () => {
      await updateTotalHoursInFirestore(sum);
    })();
  }, [timeLogs]);

  const updateTotalHoursInFirestore = async (totalHours: number) => {
    if (!auth.currentUser) return;
    try {
      const userDocRef = doc(firestore, "users", auth.currentUser.uid);
      await setDoc(userDocRef, { totalHours }, { merge: true });
      console.log('totalHours updated in Firestore:', totalHours);
    } catch (error) {
      console.error('Error updating totalHours in Firestore:', error);
      // Diagnostic fallback so we can inspect failure server-side
      try {
        if (auth.currentUser) await setDoc(doc(firestore, 'users', auth.currentUser.uid), { lastOjtSyncError: { time: new Date().toISOString(), message: String(error) } }, { merge: true });
        console.log('updateTotalHoursInFirestore: wrote lastOjtSyncError to user doc');
      } catch (dbgErr) {
        console.error('updateTotalHoursInFirestore: failed to write debug info to user doc:', dbgErr);
      }
    }
  };

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

  // Add useEffect to update hours when clock in/out times change
  useEffect(() => {
    if (formData.clockIn && formData.clockOut) {
      const calculatedHours = calculateHours(
        formData.clockIn,
        formData.clockOut,
        clockInAmPm,
        clockOutAmPm
      );

      // Only update if manual input is empty or if the calculated hours are different
      if (!formData.hours || formData.hours !== calculatedHours) {
        setFormData(prev => ({
          ...prev,
          hours: calculatedHours
        }));
      }
    }
  }, [formData.clockIn, formData.clockOut, clockInAmPm, clockOutAmPm]);

  // Add function to format date for calendar
  const formatDateForCalendar = (date: string) => {
    if (!date) return '';
    const [year, month, day] = date.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  // Add function to format date for display
  const formatDateForDisplay = (date: string) => {
    if (!date) return '';
    const [year, month, day] = date.split('-');
    return `${year}/${month}/${day}`;
  };

  // Update the handleDateSelect function
  const handleDateSelect = (day: number) => {
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
    setFormData(prev => ({
      ...prev,
      date: formattedDate
    }));
    setShowDatePicker(false);
  };

  // Update the handleMonthChange function
  const handleMonthChange = (increment: number) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // Only allow viewing the current month
    setTempDate(prev => ({
      ...prev,
      month: currentMonth,
      year: currentYear
    }));
  };

  const generateDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getPaginatedLogs = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return timeLogs.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(timeLogs.length / itemsPerPage);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= getTotalPages()) {
      setCurrentPage(page);
    }
  };

  return (
    <><ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Icon name="arrow-back" size={24} color="#fff" onPress={() => navigation.goBack()} />
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
          <Text style={styles.infoValue}>
            {userStatus === 'hired' && userCompany ? userCompany : 'Not Hired'}
          </Text>
        </View>
      </View>

      <View style={styles.noteBox}>
        <Icon name="warning-outline" size={18} color="#ff9800" />
        <Text style={styles.noteText}>
          This tracker is for personal use only. For official time logs, please check with your HR.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.weeklyReportButton}
        onPress={() => navigation.navigate('WeeklyReport')}
      >
        <Icon name="document-text-outline" size={18} color="#fff" />
        <Text style={styles.weeklyReportButtonText}>Submit Weekly Report</Text>
      </TouchableOpacity>

      <Card style={styles.tableCard}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Date</Text>
          <Text style={styles.tableHeaderText}>Clock In</Text>
          <Text style={styles.tableHeaderText}>Clock Out</Text>
          <Text style={styles.tableHeaderText}>Hours</Text>
        </View>

        {getPaginatedLogs().map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>{item.date}</Text>
            <Text style={styles.tableCell}>{item.clockIn}</Text>
            <Text style={styles.tableCell}>{item.clockOut}</Text>
            <Text style={styles.tableCell}>{item.hours}</Text>
            <TouchableOpacity onPress={() => openModal(item, index)}>
              <Icon name="create-outline" size={18} color="#6366F1" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(index)}>
              <Icon name="trash-outline" size={18} color="#ef4444" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        ))}
      </Card>

      <View style={styles.pagination}>
        <TouchableOpacity
          onPress={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
        >
          <Text style={[styles.paginationText, currentPage === 1 && styles.paginationTextDisabled]}>‹ Previous</Text>
        </TouchableOpacity>

        <View style={styles.pageNumbers}>
          {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map(pageNum => (
            <TouchableOpacity
              key={pageNum}
              onPress={() => handlePageChange(pageNum)}
              style={[
                styles.pageNumberButton,
                currentPage === pageNum && styles.pageNumberButtonActive
              ]}
            >
              <Text style={[
                styles.pageNumberText,
                currentPage === pageNum && styles.pageNumberTextActive
              ]}>
                {pageNum}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === getTotalPages()}
          style={[styles.paginationButton, currentPage === getTotalPages() && styles.paginationButtonDisabled]}
        >
          <Text style={[styles.paginationText, currentPage === getTotalPages() && styles.paginationTextDisabled]}>Next ›</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>

      {/* Dropdown Buttons */}
      {isDropdownVisible && (
        <View style={styles.dropdownContainer}>
          <FAB
            style={[styles.dropdownButton, { backgroundColor: '#888', borderRadius: 24, width: 48, height: 48, justifyContent: 'center', alignItems: 'center' }]}
            icon="download"
            color="#fff"
            onPress={handleSaveCSV} />
          <FAB
            style={[styles.dropdownButton, { backgroundColor: '#4CAF50', borderRadius: 24, width: 48, height: 48, justifyContent: 'center', alignItems: 'center' }]}
            icon={({ color, size }) => (
              <Feather name="file-plus" size={size} color={color} />
            )}
            color="#fff"
            onPress={() => openModal()} />
        </View>
      )}

      {/* Plus Button */}
      <FAB
        style={[styles.fabPlus, { backgroundColor: '#6366F1' }]}
        icon="plus"
        color="#fff"
        onPress={toggleDropdown} />

      {/* Bottom Navbar */}
      <View style={styles.bottomNavbar}>
        <BottomNavbar navigation={navigation} />
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editIndex !== null ? 'Edit Log' : 'Add Time Log'}</Text>

            {/* Date Field with Calendar */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <View style={styles.dateInputContent}>
                  <Icon name="calendar-outline" size={20} color="#6366F1" style={styles.dateIcon} />
                  <Text style={[
                    styles.dateInputText,
                    !formData.date && styles.dateInputPlaceholder
                  ]}>
                    {formData.date || 'Select Date'}
                  </Text>
                </View>
                <Icon name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Custom Date Picker Modal */}
            <Modal
              visible={showDatePicker}
              transparent
              animationType="fade"
            >
              <View style={styles.datePickerOverlay}>
                <View style={styles.datePickerContainer}>
                  <View style={styles.datePickerHeader}>
                    <Text style={styles.datePickerTitle}>
                      {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </Text>
                    <Text style={styles.datePickerSubtitle}>Select a date from this month</Text>
                  </View>
                  <View style={styles.datePickerGrid}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <Text key={day} style={styles.datePickerDayHeader}>{day}</Text>
                    ))}
                    {Array.from({ length: generateDaysInMonth(new Date().getFullYear(), new Date().getMonth() + 1) }, (_, i) => {
                      const day = i + 1;
                      const date = new Date(new Date().getFullYear(), new Date().getMonth(), day);
                      const isToday = new Date().toDateString() === date.toDateString();
                      const isSelected = formData.date === `${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
                      const isPastDate = date < new Date(new Date().setHours(0, 0, 0, 0));

                      return (
                        <TouchableOpacity
                          key={day}
                          style={[
                            styles.datePickerDay,
                            isToday && styles.datePickerToday,
                            isSelected && styles.datePickerSelected,
                            isPastDate && styles.datePickerPastDay
                          ]}
                          onPress={() => !isPastDate && handleDateSelect(day)}
                          disabled={isPastDate}
                        >
                          <Text style={[
                            styles.datePickerDayText,
                            isToday && styles.datePickerTodayText,
                            isSelected && styles.datePickerSelectedText,
                            isPastDate && styles.datePickerPastDayText
                          ]}>
                            {day}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <TouchableOpacity
                    style={styles.datePickerCloseButton}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.datePickerCloseButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

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
              <Text style={styles.inputLabel}>Hours</Text>
              <View style={styles.hoursInputContainer}>
                <TextInput
                  style={[styles.input, styles.hoursInput, styles.readOnlyInput]}
                  value={formData.hours}
                  editable={false}
                  placeholder="Calculated from clock in/out"
                />
                <Text style={styles.hoursLabel}>hours</Text>
              </View>
              <Text style={styles.hoursHelperText}>
                Hours are automatically calculated from clock in and out times
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
  container: { padding: 16, backgroundColor: '#f2f6ff', flex: 1, paddingTop: 30 },
  scrollContent: { paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, padding: 12, backgroundColor: '#6366F1', borderRadius: 12 },
  headerText: { fontSize: 18, fontWeight: '700', marginLeft: 8, color: '#fff' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoBox: {
    width: '48%', backgroundColor: '#fff', borderRadius: 12, padding: 14,
    borderWidth: 0, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  infoLabel: { color: '#6366F1', fontWeight: '800' },
  infoValue: { fontSize: 16, fontWeight: 'bold', marginVertical: 4 },
  subText: { fontSize: 12, color: '#888' },
  noteBox: {
    marginVertical: 16, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fffbe6', padding: 10, borderRadius: 8,
    borderColor: '#ffdd57', borderWidth: 1,
  },
  noteText: { color: '#ff8800', marginLeft: 8, fontSize: 13 },
  tableCard: { borderRadius: 10, overflow: 'hidden', marginTop: 10, marginBottom: 20 },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#6366F1',
    padding: 10,
    alignItems: 'flex-start'
  },
  tableHeaderText: {
    color: 'white',
    flex: 1,
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'left'
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    alignItems: 'center'
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
    textAlign: 'center'
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 20,
  },
  paginationButton: {
    padding: 8,
    borderRadius: 4,
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationText: {
    color: '#6366F1',
    fontSize: 14,
  },
  paginationTextDisabled: {
    color: '#999',
  },
  pageNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageNumberButton: {
    padding: 8,
    marginHorizontal: 4,
    borderRadius: 4,
    minWidth: 32,
    alignItems: 'center',
  },
  pageNumberButtonActive: {
    backgroundColor: '#6366F1',
  },
  pageNumberText: {
    color: '#333',
    fontSize: 14,
  },
  pageNumberTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  fabSave: {
    position: 'absolute', bottom: 160, right: 20, backgroundColor: '#4CAF50',
  },
  fabAdd: {
    position: 'absolute', bottom: 80, right: 20, backgroundColor: '#6366F1',
  },
  fabPlus: {
    position: 'absolute',
    bottom: 80, // Positioned above the Bottom Navbar
    right: 20,
    backgroundColor: '#6366F1',
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
    padding: 10, backgroundColor: '#6366F1', borderRadius: 5,
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
    backgroundColor: '#6366F1',
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
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  dateInputContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: 8,
  },
  dateInputText: {
    fontSize: 16,
    color: '#333',
  },
  dateInputPlaceholder: {
    color: '#999',
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '90%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  datePickerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  datePickerSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  datePickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  datePickerDayHeader: {
    width: '14.28%',
    textAlign: 'center',
    paddingVertical: 8,
    color: '#666',
    fontWeight: 'bold',
  },
  datePickerDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  datePickerDayText: {
    fontSize: 16,
    color: '#333',
  },
  datePickerToday: {
    backgroundColor: '#e6f3ff',
    borderRadius: 20,
  },
  datePickerTodayText: {
    color: '#6366F1',
    fontWeight: 'bold',
  },
  datePickerSelected: {
    backgroundColor: '#6366F1',
    borderRadius: 20,
  },
  datePickerSelectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  datePickerCloseButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#6366F1',
    borderRadius: 8,
    alignItems: 'center',
  },
  datePickerCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  readOnlyInput: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  monthButton: {
    padding: 8,
  },
  monthButtonDisabled: {
    opacity: 0.5,
  },
  datePickerPastDay: {
    opacity: 0.5,
  },
  datePickerPastDayText: {
    color: '#999',
  },
  weeklyReportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  weeklyReportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default OJTTrackerScreen;
