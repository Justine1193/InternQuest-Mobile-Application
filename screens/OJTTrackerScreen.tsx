import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, Modal, TextInput,
  TouchableOpacity, Alert, StyleSheet, Platform, PermissionsAndroid, Linking, Share
} from 'react-native';
import { Card } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../App';
import { auth, firestore } from '../firebase/config';
import { doc, setDoc, deleteDoc, collection, getDocs, getDoc, onSnapshot } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';
// NOTE: Avoid importing native-only modules at file scope in Expo bridgeless / Expo Go.
// They can be null and crash during module initialization.
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { colors, radii, shadows } from '../ui/theme';
import { Screen } from '../ui/components/Screen';
import Svg, { Circle } from 'react-native-svg';

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
const OJT_CSV_DOWNLOAD_DIR_URI_KEY = 'OJT_CSV_DOWNLOAD_DIR_URI';

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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1, // 1–12
    day: new Date().getDate()
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [userStatus, setUserStatus] = useState<string | null>(null);
  const [userCompany, setUserCompany] = useState<string | null>(null);
  const [appliedCompanyName, setAppliedCompanyName] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
    fetchUserStatusAndCompany();
  }, []);

  // Listen for live updates to the user's profile while this screen is focused
  useFocusEffect(
    useCallback(() => {
      if (!auth.currentUser) return () => { };
      const uid = auth.currentUser.uid;
      const userDocRef = doc(firestore, 'users', uid);
      const unsub = onSnapshot(userDocRef, (snap: any) => {
        if (snap.exists()) {
          const data = snap.data();
          setUserStatus(data.status || null);
          setUserCompany(data.company || null);
          setAppliedCompanyName(data.appliedCompanyName || null);
        }
      });

      // cleanup
      return () => unsub();
    }, [])
  );

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
        setAppliedCompanyName(data.appliedCompanyName || null);
      }
    } catch (error: any) {
      setUserStatus(null);
      setUserCompany(null);
      setAppliedCompanyName(null);
    }
  };

  const handleClearAppliedCompany = async () => {
    if (!auth.currentUser) return;
    Alert.alert(
      'Remove Application',
      'Are you sure you want to remove the applied company from your profile? This will only clear your applied-company record on your account.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const uid = auth.currentUser!.uid;
              // Read current appliedCompanyId from user doc so we can delete the application record too
              try {
                const userSnap = await getDoc(doc(firestore, 'users', uid));
                const appliedId = userSnap.exists() ? (userSnap.data() as any).appliedCompanyId : null;
                if (appliedId) {
                  try {
                    await deleteDoc(doc(firestore, 'applications', `${uid}_${appliedId}`));
                  } catch (delErr) { }
                }
              } catch (readErr) { }

              await setDoc(doc(firestore, 'users', uid), {
                appliedCompanyId: null,
                appliedCompanyName: null,
                applicationRemovedAt: new Date().toISOString()
              }, { merge: true });
              setAppliedCompanyName(null);
            } catch (error: any) {
              Alert.alert('Error', 'Could not remove applied company. Please try again.');
              if (auth.currentUser) {
                await setDoc(doc(firestore, 'users', auth.currentUser.uid), { lastOjtSyncError: { time: new Date().toISOString(), message: String(error) } }, { merge: true });
              }
            }
          }
        }
      ]
    );
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
      logsSnap.forEach((doc: any) => logs.push(doc.data() as TimeLog));
      setTimeLogs(logs.sort((a, b) => b.date.localeCompare(a.date)));
    } catch (error: any) {
      console.error('OJT Tracker: load time logs failed', error?.message || error);
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
      throw new Error('Not authenticated');
    }

    try {
      const userId = auth.currentUser.uid;
      const logId = `${log.date}_${log.clockIn}`.replace(/\W/g, '');
      const path = `users/${userId}/ojtLogs/${logId}`;
      const logRef = doc(firestore, path);
      await setDoc(logRef, log);
    } catch (error: any) {
      console.error('OJT Tracker: sync log failed', error?.message || error);
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
      await deleteDoc(logRef);
    } catch (error) {
      console.error('OJT Tracker: delete log failed', error);
      try {
        if (auth.currentUser) await setDoc(doc(firestore, 'users', auth.currentUser.uid), { lastOjtSyncError: { time: new Date().toISOString(), message: String(error) } }, { merge: true });
      } catch (dbgErr) { }
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

    // Automatically subtract 1 hour lunch break if the shift covers 12:00–13:00
    // (typical 8am–5pm OJT day becomes 8 hours instead of 9)
    const lunchStart = 12; // 12:00
    const lunchEnd = 13;   // 13:00
    const coversLunch = startTime <= lunchStart && endTime >= lunchEnd;
    if (coversLunch) {
      hours -= 1;
    }

    // Round to nearest whole number
    const roundedHours = Math.round(hours);

    // Return as string
    return roundedHours.toString();
  };

  const handleSave = async () => {
    try {
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

      // Calculate hours (lunch break is automatically deducted)
      const calculatedHours = calculateHours(
        formData.clockIn,
        formData.clockOut,
        clockInAmPm,
        clockOutAmPm
      );

      const hoursToUse = formData.hours || calculatedHours;
      const hoursNum = parseInt(hoursToUse);

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
      const logToSave: TimeLog = {
        ...formData,
        clockIn: `${formData.clockIn} ${clockInAmPm}`,
        clockOut: `${formData.clockOut} ${clockOutAmPm}`,
        hours: hoursToUse,
      };

      if (editIndex !== null) {
        const updatedLogs = [...timeLogs];
        updatedLogs[editIndex] = logToSave;
        setTimeLogs(updatedLogs);
        try {
          await syncLogToFirestore(logToSave);
        } catch (error: any) {
          console.error('OJT Tracker: save edited log failed', error?.message || error);
          Alert.alert('Error', `Failed saving edited log: ${error?.message || String(error)}`);
          return; // stop, keep modal open for retry
        }
      } else {
        const newLogs = [...timeLogs, logToSave];
        setTimeLogs(newLogs);
        try {
          await syncLogToFirestore(logToSave);
        } catch (error: any) {
          console.error('OJT Tracker: save new log failed', error?.message || error);
          Alert.alert('Error', `Failed saving new log: ${error?.message || String(error)}`);
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
      console.error('OJT Tracker: save time log failed', error?.message || error);
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
        }
      } catch (dbgErr) { }
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
            console.error('OJT Tracker: delete time log failed', error?.message || error);
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
      return false;
    }
  };

  const handleSaveCSV = async () => {
    try {
      // Check if there are any logs to export
      if (!timeLogs || timeLogs.length === 0) {
        Alert.alert('No Data', 'There are no OJT logs to export. Please add some time logs first.');
        return;
      }

      const csvContent = generateCSV();
      const fileName = `OJT_Logs_${new Date().toISOString().split('T')[0]}.csv`;

      // Expo-safe file path (works in Expo Go + dev builds)
      const baseDir = FileSystem.documentDirectory;
      if (!baseDir) {
        Alert.alert('Export unavailable', 'File system is not available on this device/runtime.');
        return;
      }
      const filePath = `${baseDir}${fileName}`;

      // Add UTF-8 BOM for better Google Sheets compatibility
      const BOM = '\uFEFF';
      const csvWithBOM = BOM + csvContent;

      // Write the CSV file with UTF-8 encoding
      await FileSystem.writeAsStringAsync(filePath, csvWithBOM, { encoding: FileSystem.EncodingType.UTF8 });

      // Show success message with file location
      const location = 'App Documents';
      Alert.alert(
        'Success',
        `CSV file created successfully!\n\nFile: ${fileName}\nLocation: ${location}\n\nUse Download to save it to Downloads/Files, or Share to send it.`,
        [
          {
            text: 'OK',
            style: 'default'
          },
          {
            text: 'Download',
            onPress: async () => {
              try {
                // iOS: the system share sheet includes "Save to Files".
                if (Platform.OS !== 'android') {
                  if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(filePath, {
                      mimeType: 'text/csv',
                      dialogTitle: fileName,
                    });
                    return;
                  }
                  await Share.share({
                    url: filePath,
                    title: fileName,
                    message: 'Save this CSV to Files',
                  });
                  return;
                }

                // Android: let user choose a directory (Downloads, Drive, etc.) and save there.
                const saf: any = (FileSystem as any).StorageAccessFramework;
                if (!saf?.requestDirectoryPermissionsAsync || !saf?.createFileAsync) {
                  Alert.alert('Download unavailable', 'Folder access is not available in this build.');
                  return;
                }

                const saveToDirectory = async (directoryUri: string) => {
                  const destUri = await saf.createFileAsync(directoryUri, fileName, 'text/csv');
                  await FileSystem.writeAsStringAsync(destUri, csvWithBOM, { encoding: FileSystem.EncodingType.UTF8 });
                  return destUri;
                };

                // Try to reuse the last selected folder so it behaves like a default Downloads folder.
                const savedDir = await AsyncStorage.getItem(OJT_CSV_DOWNLOAD_DIR_URI_KEY);
                if (savedDir) {
                  try {
                    await saveToDirectory(savedDir);
                    Alert.alert('Downloaded', 'CSV saved to your default download folder.');
                    return;
                  } catch (e) {
                    // Permission might have been revoked; clear and re-prompt.
                    await AsyncStorage.removeItem(OJT_CSV_DOWNLOAD_DIR_URI_KEY);
                  }
                }

                const perm = await saf.requestDirectoryPermissionsAsync();
                if (!perm?.granted || !perm?.directoryUri) {
                  Alert.alert('Cancelled', 'No folder selected.');
                  return;
                }

                await saveToDirectory(perm.directoryUri);
                await AsyncStorage.setItem(OJT_CSV_DOWNLOAD_DIR_URI_KEY, perm.directoryUri);
                Alert.alert('Downloaded', 'CSV saved. Next time it will download to the same folder automatically.');
              } catch (downloadErr: any) {
                console.error('Download failed', downloadErr);
                Alert.alert('Download Error', `Could not download the file: ${downloadErr?.message || String(downloadErr)}`);
              }
            },
          },
          {
            text: 'Share',
            onPress: async () => {
              try {
                // Prefer expo-sharing where available; fallback to RN Share.
                if (await Sharing.isAvailableAsync()) {
                  await Sharing.shareAsync(filePath, {
                    mimeType: 'text/csv',
                    dialogTitle: fileName,
                  });
                  return;
                }
                await Share.share({
                  url: filePath,
                  title: fileName,
                  message: 'Here is my OJT Logs CSV file',
                });
              } catch (shareError) {
                console.error('Share failed', shareError);
                Alert.alert('Share Error', 'Could not share the file. The file has been saved to your device.');
              }
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('OJT Tracker: save CSV failed', error);
      const errorMessage = error?.message || String(error);
      Alert.alert('Error', `Failed to save CSV file: ${errorMessage}\n\nPlease try again or check your storage permissions.`);
    }
  };

  const generateCSV = () => {
    // Get user information
    const userEmail = auth.currentUser?.email || '';
    const userName = auth.currentUser?.displayName || userEmail.split('@')[0] || 'User';
    const companyName = userCompany || appliedCompanyName || 'N/A';

    // CSV Header with additional columns for Google Sheets compatibility
    const headers = [
      'Student Name',
      'Student Email',
      'Company Name',
      'Date',
      'Clock In',
      'Clock Out',
      'Hours'
    ];
    const csvRows: string[][] = [headers];

    // Add data rows - sort by date (oldest first for better readability)
    const sortedLogs = [...timeLogs].sort((a, b) => {
      // Sort by date (YYYY/MM/DD format)
      return a.date.localeCompare(b.date);
    });

    sortedLogs.forEach(log => {
      // Ensure all values are properly formatted
      csvRows.push([
        String(userName || ''),
        String(userEmail || ''),
        String(companyName || 'N/A'),
        String(log.date || ''),
        String(log.clockIn || ''),
        String(log.clockOut || ''),
        String(log.hours || '0')
      ]);
    });

    // Convert to CSV string with proper escaping for Google Sheets
    // Use RFC 4180 compliant CSV format
    const csvContent = csvRows.map(row =>
      row.map(cell => {
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        const cellStr = String(cell || '');
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n') || cellStr.includes('\r')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    ).join('\r\n'); // Use \r\n for better Windows/Google Sheets compatibility

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
    } catch (error) {
      console.error('OJT Tracker: update totalHours failed', error);
      try {
        if (auth.currentUser) await setDoc(doc(firestore, 'users', auth.currentUser.uid), { lastOjtSyncError: { time: new Date().toISOString(), message: String(error) } }, { merge: true });
      } catch (dbgErr) { }
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

  // Auto-update hours when clock in/out change (lunch break is automatically deducted)
  useEffect(() => {
    if (formData.clockIn && formData.clockOut) {
      const calculated = calculateHours(
        formData.clockIn,
        formData.clockOut,
        clockInAmPm,
        clockOutAmPm
      );

      if (!formData.hours || formData.hours !== calculated) {
        setFormData(prev => ({
          ...prev,
          hours: calculated
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
    // Use the currently selected calendar month/year (tempDate)
    const year = tempDate.year;
    const month = tempDate.month;
    const formattedDate = `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
    setFormData(prev => ({
      ...prev,
      date: formattedDate,
    }));
    setShowDatePicker(false);
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

  // Progress for total hours
  const progress = requiredHours > 0 ? Math.min(1, totalHours / requiredHours) : 0;
  const progressPercent = Math.round(progress * 100);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= getTotalPages()) {
      setCurrentPage(page);
    }
  };

  const openDatePickerModal = () => {
    // If a date is already selected, start the calendar at that month/year
    if (formData.date) {
      const parts = formData.date.split('/');
      if (parts.length === 3) {
        const [y, m, d] = parts.map(Number);
        if (!Number.isNaN(y) && !Number.isNaN(m) && m >= 1 && m <= 12) {
          setTempDate({
            year: y,
            month: m,
            day: !Number.isNaN(d) ? d : 1,
          });
        }
      }
    } else {
      const today = new Date();
      setTempDate({
        year: today.getFullYear(),
        month: today.getMonth() + 1,
        day: today.getDate(),
      });
    }
    setShowDatePicker(true);
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setTempDate(prev => {
      let year = prev.year;
      let month = prev.month + (direction === 'next' ? 1 : -1);

      if (month < 1) {
        month = 12;
        year -= 1;
      } else if (month > 12) {
        month = 1;
        year += 1;
      }

      // Do not allow selecting months after the current month/year
      const today = new Date();
      const maxYear = today.getFullYear();
      const maxMonth = today.getMonth() + 1;
      if (year > maxYear || (year === maxYear && month > maxMonth)) {
        return prev;
      }

      return { ...prev, year, month };
    });
  };

  return (
    <Screen style={{ backgroundColor: colors.white }} contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 0 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Hero header - scrolls with content */}
        <LinearGradient
          colors={['#4F46E5', '#6366F1', '#818CF8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroContainer}
        >
          <View style={styles.heroCard}>
            <View style={styles.heroTitleRow}>
              <Icon name="time" size={26} color={colors.onPrimary} style={styles.heroIcon} />
              <Text style={styles.heroTitle}>OJT Tracker</Text>
            </View>
            <Text style={styles.heroSubtitle}>
              Log your daily hours and track your internship progress toward your goal.
            </Text>
          </View>
        </LinearGradient>

        {/* Section: Your progress */}
        <Text style={styles.sectionTitle}>Your progress</Text>
        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <View style={styles.infoLabelRow}>
              <Icon name="time-outline" size={16} color={colors.textMuted} />
              <Text style={styles.infoLabel}>Total hours</Text>
            </View>
            <TouchableOpacity
              onPress={() => setGoalModalVisible(true)}
              activeOpacity={0.9}
              style={styles.progressTapArea}
            >
              <View style={styles.progressRingWrapper}>
                <Svg width={120} height={120} viewBox="0 0 100 100">
                  {/* Background track */}
                  <Circle
                    cx={50}
                    cy={50}
                    r={40}
                    stroke={colors.surfaceAlt}
                    strokeWidth={10}
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* Progress arc */}
                  <Circle
                    cx={50}
                    cy={50}
                    r={40}
                    stroke={colors.success}
                    strokeWidth={10}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={(1 - progress) * 2 * Math.PI * 40}
                    transform="rotate(-90 50 50)"
                  />
                </Svg>
                <View style={styles.progressCenter}>
                  <Text style={styles.progressPercentText}>{totalHours} hrs</Text>
                  <Text style={styles.progressHoursSub}>/ {requiredHours} hrs</Text>
                </View>
              </View>
              <Text style={styles.progressRemainingText}>
                {Math.max(0, requiredHours - totalHours)} hours remaining
              </Text>
              <Text style={styles.progressTapHint}>Tap to set your goal</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoBox}>
            <View style={styles.infoLabelRow}>
              <Icon name="business-outline" size={16} color={colors.textMuted} />
              <Text style={styles.infoLabel}>Company</Text>
            </View>
            <View style={styles.companyRow}>
              <Text style={styles.infoValue}>
                {userStatus === 'hired' && userCompany ? userCompany : 'Not assigned yet'}
              </Text>
            </View>
          </View>
        </View>

        {/* Reminder */}
        <View style={styles.noteBox}>
          <Icon name="information-circle-outline" size={20} color={colors.info} />
          <View style={styles.noteContent}>
            <Text style={styles.noteTitle}>For your reference</Text>
            <Text style={styles.noteText}>
              Use this tracker to log hours for your own records. Lunch (12–1 PM) is auto-deducted.
            </Text>
          </View>
        </View>

        {/* Weekly report shortcut */}
        <TouchableOpacity
          style={styles.weeklyReportButton}
          onPress={() => navigation.navigate('WeeklyReport')}
          activeOpacity={0.9}
        >
          <Icon name="document-text-outline" size={18} color={colors.onPrimary} />
          <Text style={styles.weeklyReportButtonText}>Submit weekly report</Text>
        </TouchableOpacity>

        {/* Time logs section */}
        <Text style={styles.sectionTitle}>Time logs</Text>
        <Card style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>Date</Text>
            <Text style={styles.tableHeaderText}>Clock in</Text>
            <Text style={styles.tableHeaderText}>Clock out</Text>
            <Text style={styles.tableHeaderText}>Hours</Text>
            <View style={styles.tableHeaderActionsSpacer} />
          </View>

          {getPaginatedLogs().length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="calendar-outline" size={48} color={colors.textSubtle} style={styles.emptyStateIcon} />
              <Text style={styles.emptyStateTitle}>No time logs yet</Text>
              <Text style={styles.emptyStateText}>Add your first log to start tracking your OJT hours.</Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => { setIsDropdownVisible(false); openModal(); }}
                activeOpacity={0.85}
              >
                <Icon name="add" size={20} color={colors.onPrimary} />
                <Text style={styles.emptyStateButtonText}>Add time log</Text>
              </TouchableOpacity>
            </View>
          ) : getPaginatedLogs().map((item, index) => {
            const actualIndex = (currentPage - 1) * itemsPerPage + index;
            const isEven = index % 2 === 0;
            return (
              <View
                key={`${item.date}-${item.clockIn}`}
                style={[
                  styles.tableRow,
                  isEven && styles.tableRowAlt,
                ]}
              >
                <Text style={[styles.tableCell, styles.tableCellDate]}>{item.date}</Text>
                <Text style={styles.tableCell}>{item.clockIn}</Text>
                <Text style={styles.tableCell}>{item.clockOut}</Text>
                <View style={styles.hoursPillCell}>
                  <View style={styles.hoursPill}>
                    <Text style={styles.hoursPillText}>{item.hours}h</Text>
                  </View>
                </View>
                <View style={styles.rowActions}>
                  <TouchableOpacity
                    onPress={() => openModal(item, actualIndex)}
                    style={styles.rowIconBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    activeOpacity={0.7}
                  >
                    <Icon name="create-outline" size={20} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(actualIndex)}
                    style={styles.rowIconBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    activeOpacity={0.7}
                  >
                    <Icon name="trash-outline" size={20} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </Card>

        {/* Pagination - only show when there are logs and more than one page */}
        {timeLogs.length > 0 && getTotalPages() > 1 && (
          <View style={styles.pagination}>
            <TouchableOpacity
              onPress={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
              activeOpacity={0.7}
            >
              <Text style={[styles.paginationText, currentPage === 1 && styles.paginationTextDisabled]}>‹ Previous</Text>
            </TouchableOpacity>

            <Text style={styles.paginationSummary}>
              Page {currentPage} of {getTotalPages()}
            </Text>

            <TouchableOpacity
              onPress={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === getTotalPages()}
              style={[styles.paginationButton, currentPage === getTotalPages() && styles.paginationButtonDisabled]}
              activeOpacity={0.7}
            >
              <Text style={[styles.paginationText, currentPage === getTotalPages() && styles.paginationTextDisabled]}>Next ›</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* FAB menu: Add log + Export CSV */}
      {isDropdownVisible && (
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={styles.fabMenuItem}
            onPress={() => { setIsDropdownVisible(false); openModal(); }}
            activeOpacity={0.85}
          >
            <View style={[styles.fabMenuIconWrap, { backgroundColor: colors.primary }]}>
              <Icon name="add" size={24} color={colors.onPrimary} />
            </View>
            <Text style={styles.fabMenuLabel}>Add time log</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.fabMenuItem}
            onPress={() => { setIsDropdownVisible(false); handleSaveCSV(); }}
            activeOpacity={0.85}
          >
            <View style={[styles.fabMenuIconWrap, { backgroundColor: colors.textMuted }]}>
              <Icon name="download-outline" size={24} color={colors.onPrimary} />
            </View>
            <Text style={styles.fabMenuLabel}>Export CSV</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main FAB */}
      <TouchableOpacity
        style={styles.fabPlus}
        onPress={toggleDropdown}
        activeOpacity={0.9}
      >
        <Icon name={isDropdownVisible ? 'close' : 'add'} size={28} color={colors.onPrimary} />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editIndex !== null ? 'Edit Log' : 'Add Time Log'}</Text>
            <Text style={styles.modalSubtitle}>Quickly log your OJT hours for a single day.</Text>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalFormContent}
            >
              {/* Date Field with Calendar */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Date</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={openDatePickerModal}
                >
                  <View style={styles.dateInputContent}>
                    <Icon name="calendar-outline" size={20} color={colors.primary} style={styles.dateIcon} />
                    <Text style={[
                      styles.dateInputText,
                      !formData.date && styles.dateInputPlaceholder
                    ]}>
                      {formData.date || 'Select Date'}
                    </Text>
                  </View>
                  <Icon name="chevron-down" size={20} color={colors.textMuted} />
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
                      <View style={styles.datePickerHeaderRow}>
                        <TouchableOpacity
                          onPress={() => handleMonthChange('prev')}
                          style={styles.datePickerNavBtn}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Icon name="chevron-back-outline" size={20} color={colors.text} />
                        </TouchableOpacity>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.datePickerTitle}>
                            {new Date(tempDate.year, tempDate.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                          </Text>
                          <Text style={styles.datePickerSubtitle}>Select a date</Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleMonthChange('next')}
                          style={styles.datePickerNavBtn}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Icon name="chevron-forward-outline" size={20} color={colors.text} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.datePickerGrid}>
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <Text key={day} style={styles.datePickerDayHeader}>{day}</Text>
                      ))}
                      {Array.from({ length: generateDaysInMonth(tempDate.year, tempDate.month) }, (_, i) => {
                        const day = i + 1;
                        const date = new Date(tempDate.year, tempDate.month - 1, day);
                        const today = new Date();
                        const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                        const isToday = todayMid.toDateString() === date.toDateString();
                        const isSelected = formData.date === `${tempDate.year}/${String(tempDate.month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
                        const isFutureDate = date > todayMid;

                        return (
                          <TouchableOpacity
                            key={day}
                            style={[
                              styles.datePickerDay,
                              isToday && styles.datePickerToday,
                              isSelected && styles.datePickerSelected,
                              isFutureDate && styles.datePickerPastDay
                            ]}
                            onPress={() => !isFutureDate && handleDateSelect(day)}
                            disabled={isFutureDate}
                          >
                            <Text style={[
                              styles.datePickerDayText,
                              isToday && styles.datePickerTodayText,
                              isSelected && styles.datePickerSelectedText,
                              isFutureDate && styles.datePickerPastDayText
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
                      activeOpacity={0.85}
                    >
                      <Text style={styles.datePickerCloseButtonText}>Done</Text>
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

              {/* Total Hours Field */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Total hours</Text>
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
                  Total hours are automatically calculated. Lunch break (12 PM - 1 PM) is automatically deducted.
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn} activeOpacity={0.8}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={styles.saveBtn} activeOpacity={0.85}>
                <Icon name="checkmark" size={18} color={colors.onPrimary} style={{ marginRight: 6 }} />
                <Text style={styles.saveBtnText}>Save log</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Goal Edit Modal */}
      <Modal visible={goalModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set required hours</Text>
            <Text style={styles.modalSubtitle}>Your OJT goal in total hours (e.g. 300).</Text>
            <View style={styles.goalInputWrap}>
              <TextInput
                placeholder="e.g. 300"
                placeholderTextColor={colors.textSubtle}
                style={styles.goalInput}
                value={goalInput}
                onChangeText={setGoalInput}
                keyboardType="number-pad"
                maxLength={4}
              />
              <Text style={styles.goalInputSuffix}>hours</Text>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setGoalModalVisible(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveGoal} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>Save goal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1 },
  scrollContent: { paddingBottom: 24 },
  heroContainer: {
    marginHorizontal: -16,
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  heroCard: {
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroIcon: {
    marginRight: 10,
  },
  heroTitle: {
    color: colors.onPrimary,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  heroSubtitle: {
    color: colors.onPrimarySubtle,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: '95%',
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
    marginTop: 4,
    paddingHorizontal: 2,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoBox: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'flex-start',
    ...shadows.card,
  },
  infoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoLabel: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 6,
    marginBottom: 0,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '700',
    marginVertical: 2,
    color: colors.text,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressTapArea: {
    alignSelf: 'stretch',
    alignItems: 'center',
    marginTop: 6,
  },
  progressRingWrapper: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCenter: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  progressHoursSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: -2,
  },
  progressRemainingText: {
    marginTop: 6,
    fontSize: 12,
    color: colors.textMuted,
  },
  progressTapHint: {
    marginTop: 4,
    fontSize: 11,
    color: colors.textSubtle,
  },
  removeButton: { marginLeft: 8, padding: 6, borderRadius: 6, backgroundColor: 'transparent' },
  subText: { fontSize: 12, color: colors.textMuted },
  noteBox: {
    marginTop: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radii.lg,
    borderColor: colors.border,
    borderWidth: 1,
  },
  noteContent: {
    flex: 1,
    marginLeft: 10,
  },
  noteTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  noteText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  emptyState: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  emptyStateIcon: {
    marginBottom: 12,
    opacity: 0.7,
  },
  emptyStateTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radii.md,
    gap: 8,
    ...shadows.card,
  },
  emptyStateButtonText: {
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  tableCard: { borderRadius: radii.lg, overflow: 'hidden', marginTop: 6, marginBottom: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tableHeaderText: {
    color: colors.onPrimary,
    flex: 1,
    fontWeight: '600',
    fontSize: 12,
    textAlign: 'left',
  },
  tableHeaderActionsSpacer: {
    width: 64,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 14,
    minHeight: 48,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  tableRowAlt: {
    backgroundColor: colors.surfaceAlt,
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
    textAlign: 'left',
    color: colors.text,
  },
  tableCellDate: {
    fontWeight: '500',
  },
  hoursPillCell: {
    flex: 1,
    alignItems: 'flex-start',
  },
  hoursPill: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: colors.primarySoft || colors.primary + '22',
  },
  hoursPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rowIconBtn: {
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  paginationButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceAlt,
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  paginationTextDisabled: {
    color: colors.textSubtle,
  },
  paginationSummary: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  fabPlus: {
    position: 'absolute',
    bottom: 88,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  dropdownContainer: {
    position: 'absolute',
    bottom: 156,
    right: 20,
    alignItems: 'flex-end',
  },
  fabMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingLeft: 12,
    paddingRight: 16,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  fabMenuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  fabMenuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  bottomNavbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    elevation: 5, // Add shadow for better visibility
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.overlay,
  },
  modalContent: {
    width: '90%',
    maxWidth: 420,
    maxHeight: '85%',
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    color: colors.text,
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 16,
    lineHeight: 18,
  },
  modalFormContent: {
    paddingBottom: 8,
  },
  input: {
    borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 10, paddingVertical: 4, color: colors.text,
  },
  goalInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    marginBottom: 20,
    backgroundColor: colors.surface,
  },
  goalInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 18,
    color: colors.text,
  },
  goalInputSuffix: {
    fontSize: 15,
    color: colors.textMuted,
    marginLeft: 6,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.sm,
    marginRight: 8,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
  },
  cancelBtnText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  saveBtnText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 12,
    color: colors.textMuted,
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
    borderColor: colors.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  amPmButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.surfaceAlt,
  },
  amPmButtonActive: {
    backgroundColor: colors.primary,
  },
  amPmText: {
    fontSize: 14,
    color: colors.text,
  },
  amPmTextActive: {
    color: colors.onPrimary,
    fontWeight: 'bold',
  },
  hoursInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.textMuted,
    marginLeft: 8,
    fontSize: 14,
  },
  hoursHelperText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    fontStyle: 'italic',
  },
  helperText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    fontStyle: 'italic',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surface,
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
    color: colors.text,
  },
  dateInputPlaceholder: {
    color: colors.textSubtle,
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContainer: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
    width: '92%',
    maxWidth: 380,
    ...shadows.card,
  },
  datePickerHeader: {
    marginBottom: 8,
  },
  datePickerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  datePickerNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  datePickerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  datePickerSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  datePickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  datePickerDayHeader: {
    width: '14.28%',
    textAlign: 'center',
    paddingVertical: 8,
    color: colors.textMuted,
    fontWeight: 'bold',
  },
  datePickerDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
    borderRadius: 999,
  },
  datePickerDayText: {
    fontSize: 16,
    color: colors.text,
  },
  datePickerToday: {
    backgroundColor: colors.infoSoft,
    borderRadius: 20,
  },
  datePickerTodayText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  datePickerSelected: {
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  datePickerSelectedText: {
    color: colors.onPrimary,
    fontWeight: 'bold',
  },
  datePickerCloseButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  datePickerCloseButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  readOnlyInput: {
    backgroundColor: colors.surfaceAlt,
    color: colors.textMuted,
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
    color: colors.textSubtle,
  },
  weeklyReportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 16,
    ...shadows.card,
  },
  weeklyReportButtonText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default OJTTrackerScreen;
