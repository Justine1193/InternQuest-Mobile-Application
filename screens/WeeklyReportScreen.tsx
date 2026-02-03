import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    AppState,
    ScrollView,
    Modal,
    Linking,
    Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Asset } from 'expo-asset';
import { collection, addDoc, Timestamp, getDocs } from 'firebase/firestore';
import { firestore } from '../firebase/config';
import { getAuth } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import PDFGenerator, { WeeklyReportEntry, WeeklyReportData } from '../services/pdfGenerator';
import { colors, radii, shadows } from '../ui/theme';
import { Screen } from '../ui/components/Screen';
import { AppHeader } from '../ui/components/AppHeader';

type AmPm = 'AM' | 'PM';

type WeeklyReportEntryForm = Omit<WeeklyReportEntry, 'hours'> & {
    hours: string;
    timeInAmPm: AmPm;
    timeOutAmPm: AmPm;
};

type OjtTimeLog = {
    date: string;
    clockIn: string;
    clockOut: string;
    hours: string;
};

const emptyEntry: WeeklyReportEntryForm = {
    date: '',
    timeIn: '',
    timeOut: '',
    hours: '',
    taskCompleted: '',
    remarks: '',
    timeInAmPm: 'AM',
    timeOutAmPm: 'PM',
};

const WEEKLY_REPORT_DRAFT_KEY = 'WEEKLY_REPORT_DRAFT';

const WeeklyReportScreen: React.FC = () => {
    const [formInfo, setFormInfo] = useState({
        traineeName: '',
        departmentAssigned: '',
        companyName: '',
        monthCovered: '',
        supervisorName: '',
        supervisorTitle: '',
        ojtAdvisorName: '',
        ojtAdvisorTitle: '',
    });
    const [entries, setEntries] = useState<WeeklyReportEntryForm[]>([{ ...emptyEntry }]);
    const [loading, setLoading] = useState(false);
    const [isPdfGenerating, setIsPdfGenerating] = useState(false);
    const appState = useRef(AppState.currentState);
    const isInitialLoad = useRef(true);
    const [availableLogs, setAvailableLogs] = useState<OjtTimeLog[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [importModalVisible, setImportModalVisible] = useState(false);
    const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);
    const [previewModalVisible, setPreviewModalVisible] = useState(false);
    const [pdfPreviewUri, setPdfPreviewUri] = useState<string | null>(null);
    const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [pdfError, setPdfError] = useState<string | null>(null);
    const [pdfFileUri, setPdfFileUri] = useState<string | null>(null);

    const totalHours = useMemo(
        () => entries.reduce((sum, entry) => sum + (Number(entry.hours) || 0), 0),
        [entries]
    );

    // Auto-save functions
    const saveDraft = useCallback(async () => {
        try {
            const draftData = {
                formInfo,
                entries,
            };
            await AsyncStorage.setItem(WEEKLY_REPORT_DRAFT_KEY, JSON.stringify(draftData));
        } catch (error) {
            // Silently fail - auto-save shouldn't interrupt user flow
            console.warn('Failed to save draft:', error);
        }
    }, [formInfo, entries]);

    const loadDraft = useCallback(async () => {
        try {
            const savedData = await AsyncStorage.getItem(WEEKLY_REPORT_DRAFT_KEY);
            if (savedData) {
                const draft = JSON.parse(savedData);
                if (draft.formInfo) {
                    setFormInfo(draft.formInfo);
                }
                if (draft.entries && draft.entries.length > 0) {
                    setEntries(draft.entries);
                }
            }
        } catch (error) {
            console.warn('Failed to load draft:', error);
        }
    }, []);

    const clearDraft = useCallback(async () => {
        try {
            await AsyncStorage.removeItem(WEEKLY_REPORT_DRAFT_KEY);
        } catch (error) {
            console.warn('Failed to clear draft:', error);
        }
    }, []);

    const makeLogId = (log: OjtTimeLog) =>
        `${log.date}_${log.clockIn}`.replace(/\W/g, '');

    const loadOjtLogsForImport = useCallback(async () => {
        try {
            setLogsLoading(true);
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) {
                setAvailableLogs([]);
                return;
            }

            const logsCol = collection(firestore, `users/${user.uid}/ojtLogs`);
            const snap = await getDocs(logsCol);

            const logs: OjtTimeLog[] = [];
            snap.forEach((docSnap: any) => {
                const data = docSnap.data() as any;
                if (data.date && data.clockIn && data.clockOut && data.hours != null) {
                    logs.push({
                        date: data.date,
                        clockIn: String(data.clockIn),
                        clockOut: String(data.clockOut),
                        hours: String(data.hours),
                    });
                }
            });

            // Sort ascending by date so weeks are together
            logs.sort((a, b) => a.date.localeCompare(b.date));
            setAvailableLogs(logs);
        } catch (error) {
            console.warn('Failed to load OJT logs for import:', error);
            setAvailableLogs([]);
        } finally {
            setLogsLoading(false);
        }
    }, []);

    // Load draft on mount
    useEffect(() => {
        if (isInitialLoad.current) {
            loadDraft().then(() => {
                isInitialLoad.current = false;
            });
        }
    }, [loadDraft]);

    // Save when form data changes (debounced)
    useEffect(() => {
        if (!isInitialLoad.current) {
            const timeoutId = setTimeout(() => {
                saveDraft();
            }, 1000); // Debounce: save 1 second after last change

            return () => clearTimeout(timeoutId);
        }
    }, [formInfo, entries, saveDraft]);

    // Save when app goes to background
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (
                appState.current.match(/active|foreground/) &&
                nextAppState.match(/inactive|background/)
            ) {
                // App is going to background
                saveDraft();
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, [saveDraft]);

    // Save when navigating away from screen
    useFocusEffect(
        useCallback(() => {
            return () => {
                // Screen is losing focus (navigating away)
                saveDraft();
            };
        }, [saveDraft])
    );

    // Save on component unmount
    useEffect(() => {
        return () => {
            saveDraft();
        };
    }, [saveDraft]);

    // Helpers to make daily entries easier to fill in
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

        // Format as YYYY/MM/DD (same as OJT tracker)
        if (numbers.length <= 4) {
            return numbers;
        } else if (numbers.length <= 6) {
            return `${numbers.slice(0, 4)}/${numbers.slice(4)}`;
        } else {
            return `${numbers.slice(0, 4)}/${numbers.slice(4, 6)}/${numbers.slice(6, 8)}`;
        }
    };

    const formatDisplayDate = (raw: string) => {
        if (!raw) return '';
        const parts = raw.split('/');
        if (parts.length !== 3) return raw;
        const [yearStr, monthStr, dayStr] = parts;
        const year = Number(yearStr);
        const month = Number(monthStr);
        const day = Number(dayStr);
        if (!year || !month || !day) return raw;
        const date = new Date(year, month - 1, day);
        if (Number.isNaN(date.getTime())) return raw;
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const calculateHoursFromTimes = (
        timeIn: string,
        timeOut: string,
        timeInAmPm: AmPm,
        timeOutAmPm: AmPm
    ) => {
        if (!timeIn || !timeOut) return '';

        const parseTime = (time: string, amPm: AmPm) => {
            const [hoursStr, minutesStr] = time.split(':');
            const hours = Number(hoursStr);
            const minutes = Number(minutesStr);
            if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

            let hour24 = hours;
            if (amPm === 'PM' && hours !== 12) {
                hour24 += 12;
            } else if (amPm === 'AM' && hours === 12) {
                hour24 = 0;
            }

            return hour24 + minutes / 60;
        };

        const start = parseTime(timeIn, timeInAmPm);
        const end = parseTime(timeOut, timeOutAmPm);
        if (start == null || end == null) return '';

        let diff = end - start;

        // Handle overnight shifts (when time out is earlier than time in)
        if (diff < 0) {
            diff += 24;
        }

        if (diff > 24) {
            Alert.alert('Warning', 'Time difference exceeds 24 hours. Please check your times.');
            return '';
        }

        return Math.round(diff).toString();
    };

    const openImportModal = async () => {
        await loadOjtLogsForImport();
        setImportModalVisible(true);
    };

    const toggleLogSelection = (id: string) => {
        setSelectedLogIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const handleImportSelectedLogs = () => {
        if (!selectedLogIds.length) {
            setImportModalVisible(false);
            return;
        }

        const selectedLogs = availableLogs.filter((log) =>
            selectedLogIds.includes(makeLogId(log))
        );

        if (!selectedLogs.length) {
            setImportModalVisible(false);
            return;
        }

        const newEntries: WeeklyReportEntryForm[] = selectedLogs.map((log) => {
            const [clockInTime, clockInPeriod] = String(log.clockIn).split(' ');
            const [clockOutTime, clockOutPeriod] = String(log.clockOut).split(' ');

            const inAmPm: AmPm = clockInPeriod === 'PM' ? 'PM' : 'AM';
            const outAmPm: AmPm = clockOutPeriod === 'AM' || clockOutPeriod === 'PM' ? (clockOutPeriod as AmPm) : 'PM';

            return {
                ...emptyEntry,
                date: log.date,
                timeIn: clockInTime || '',
                timeOut: clockOutTime || '',
                hours: String(log.hours || ''),
                timeInAmPm: inAmPm,
                timeOutAmPm: outAmPm,
            };
        });

        setEntries((prev) => [...prev, ...newEntries]);
        setImportModalVisible(false);
        setSelectedLogIds([]);
    };


    const handleInfoChange = (field: keyof typeof formInfo, value: string) => {
        setFormInfo((prev) => ({ ...prev, [field]: value }));
    };

    const handleEntryChange = (index: number, field: keyof WeeklyReportEntryForm, value: string) => {
        setEntries((prev) =>
            prev.map((entry, idx) => {
                if (idx !== index) return entry;

                let updated: WeeklyReportEntryForm = { ...entry, [field]: value };

                if (field === 'date') {
                    updated = { ...updated, date: formatDateInput(value) };
                }

                if (field === 'timeIn') {
                    updated = { ...updated, timeIn: formatTimeInput(value) };
                }

                if (field === 'timeOut') {
                    updated = { ...updated, timeOut: formatTimeInput(value) };
                }

                // Auto-calculate hours when both times and AM/PM are present
                if (
                    (field === 'timeIn' ||
                        field === 'timeOut' ||
                        field === 'timeInAmPm' ||
                        field === 'timeOutAmPm') &&
                    updated.timeIn &&
                    updated.timeOut
                ) {
                    const hours = calculateHoursFromTimes(
                        updated.timeIn,
                        updated.timeOut,
                        updated.timeInAmPm || 'AM',
                        updated.timeOutAmPm || 'PM'
                    );
                    if (hours) {
                        updated = { ...updated, hours };
                    }
                }

                return updated;
            })
        );
    };

    const addEntry = () => setEntries((prev) => [...prev, { ...emptyEntry }]);

    const removeEntry = (index: number) => {
        setEntries((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== index)));
    };

    const getValidEntries = (): WeeklyReportEntry[] => {
        return entries
            .filter(
                (entry) =>
                    entry.date &&
                    entry.timeIn &&
                    entry.timeOut &&
                    entry.hours &&
                    entry.taskCompleted.trim().length > 0
            )
            .map((entry) => ({
                date: entry.date,
                timeIn: `${entry.timeIn} ${entry.timeInAmPm}`.trim(),
                timeOut: `${entry.timeOut} ${entry.timeOutAmPm}`.trim(),
                hours: Number(entry.hours) || 0,
                taskCompleted: entry.taskCompleted,
                remarks: entry.remarks,
            }));
    };

    const ensureReportIsComplete = () => {
        if (!formInfo.traineeName || !formInfo.companyName || !formInfo.monthCovered) {
            Alert.alert('Missing Information', 'Please fill out trainee, company, and month covered.');
            return false;
        }

        if (!entries.some((entry) => entry.date && entry.hours && entry.taskCompleted)) {
            Alert.alert('Incomplete Entries', 'Please add at least one complete day entry.');
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!ensureReportIsComplete()) {
            return;
        }

        const validEntries = getValidEntries();
        if (!validEntries.length) {
            Alert.alert('Invalid Entries', 'Please ensure your entries have date, hours, and tasks.');
            return;
        }

        setLoading(true);

        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            // Write to user's subcollection: users/{userId}/weeklyReports
            await addDoc(collection(firestore, `users/${user.uid}/weeklyReports`), {
                userId: user.uid,
                ...formInfo,
                totalHours,
                entries: validEntries,
                timestamp: Timestamp.now(),
            });

            setFormInfo({
                traineeName: '',
                departmentAssigned: '',
                companyName: '',
                monthCovered: '',
                supervisorName: '',
                supervisorTitle: '',
                ojtAdvisorName: '',
                ojtAdvisorTitle: '',
            });
            setEntries([{ ...emptyEntry }]);
            await clearDraft(); // Clear saved draft after successful submission
            Alert.alert('Success', 'Weekly report submitted and saved!');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to submit report.');
        } finally {
            setLoading(false);
        }
    };

    const getLogoAsBase64 = async (): Promise<string | undefined> => {
        try {
            const asset = Asset.fromModule(require('../assets/neu.png'));
            await asset.downloadAsync();
            if (asset.localUri) {
                const base64 = await FileSystem.readAsStringAsync(asset.localUri, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                return `data:image/png;base64,${base64}`;
            }
        } catch (error) {
            console.warn('Failed to load NEU logo:', error);
        }
        return undefined;
    };

    const handleGeneratePdf = async () => {
        if (!ensureReportIsComplete()) {
            return;
        }

        const validEntries = getValidEntries();
        if (!validEntries.length) {
            Alert.alert('Invalid Entries', 'Please ensure your entries have date, hours, and tasks.');
            return;
        }

        const logoUrl = await getLogoAsBase64();

        const reportData: WeeklyReportData = {
            traineeName: formInfo.traineeName,
            departmentAssigned: formInfo.departmentAssigned,
            companyName: formInfo.companyName,
            monthCovered: formInfo.monthCovered,
            entries: validEntries,
            preparedByName: formInfo.traineeName,
            preparedByTitle: 'Trainee',
            notedByName: formInfo.supervisorName,
            notedByTitle: formInfo.supervisorTitle || 'Job Title of Supervisor',
            receivedByName: formInfo.ojtAdvisorName,
            receivedByTitle: formInfo.ojtAdvisorTitle || 'OJT Adviser',
            leftLogoUrl: logoUrl,
            rightLogoUrl: logoUrl,
        };

        try {
            setIsPdfGenerating(true);
            const pdfUri = await PDFGenerator.generateWeeklyReportPDF(reportData);
            await PDFGenerator.sharePDF(
                pdfUri,
                `Weekly_Report_${formInfo.monthCovered || 'InternQuest'}.pdf`
            );
        } catch (error: any) {
            Alert.alert('PDF Error', error.message || 'Failed to generate PDF.');
        } finally {
            setIsPdfGenerating(false);
        }
    };

    return (
        <Screen scroll contentContainerStyle={styles.scroll}>
            <AppHeader title="Weekly report" back />
            <LinearGradient
                colors={['#4F46E5', '#6366F1', '#818CF8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.hero}
            >
                <View style={styles.heroContent}>
                    <Icon name="document-text" size={28} color={colors.onPrimary} style={styles.heroIcon} />
                    <View style={styles.heroTextWrap}>
                        <Text style={styles.heroTitle}>Weekly Accomplishment Report</Text>
                        <Text style={styles.heroSubtitle}>
                            Fill in trainee details and daily tasks. Export a PDF that matches the NEU template or preview before submitting.
                        </Text>
                    </View>
                </View>
            </LinearGradient>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <View>
                        <Text style={styles.sectionTitle}>Trainee Information</Text>
                        <Text style={styles.sectionSubtitle}>
                            These details will appear at the top of your weekly report.
                        </Text>
                    </View>
                </View>

                <View style={styles.fieldGroup}>
                    <Text style={styles.inputLabel}>Trainee Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Full name (e.g., JUAN DELA CRUZ)"
                        value={formInfo.traineeName}
                        onChangeText={(text) => handleInfoChange('traineeName', text)}
                    />
                </View>

                <View style={styles.fieldGroup}>
                    <Text style={styles.inputLabel}>Department Assigned</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., NETWORK INFORMATION MANAGEMENT DIVISION"
                        value={formInfo.departmentAssigned}
                        onChangeText={(text) => handleInfoChange('departmentAssigned', text)}
                    />
                </View>

                <View style={styles.fieldGroup}>
                    <Text style={styles.inputLabel}>Company</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., DEPARTMENT OF ENVIRONMENT AND NATURAL RESOURCES"
                        value={formInfo.companyName}
                        onChangeText={(text) => handleInfoChange('companyName', text)}
                    />
                </View>

                <View style={styles.fieldGroup}>
                    <Text style={styles.inputLabel}>Month Covered</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., DECEMBER 2025"
                        value={formInfo.monthCovered}
                        onChangeText={(text) => handleInfoChange('monthCovered', text)}
                    />
                </View>

                <View style={styles.nameTitleGroup}>
                    <Text style={styles.inputLabel}>Supervisor (for Noted by)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Supervisor Name"
                        value={formInfo.supervisorName}
                        onChangeText={(text) => handleInfoChange('supervisorName', text)}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Job Title (e.g., HR Manager, Department Head)"
                        value={formInfo.supervisorTitle}
                        onChangeText={(text) => handleInfoChange('supervisorTitle', text)}
                    />
                </View>
                <View style={styles.nameTitleGroup}>
                    <Text style={styles.inputLabel}>OJT Adviser (for Received by)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="OJT Adviser Name"
                        value={formInfo.ojtAdvisorName}
                        onChangeText={(text) => handleInfoChange('ojtAdvisorName', text)}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Job Title (e.g., OJT Coordinator, Faculty Adviser)"
                        value={formInfo.ojtAdvisorTitle}
                        onChangeText={(text) => handleInfoChange('ojtAdvisorTitle', text)}
                    />
                </View>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <View>
                        <Text style={styles.sectionTitle}>Daily Entries</Text>
                        <Text style={styles.sectionSubtitle}>
                            {entries.length} {entries.length === 1 ? 'day' : 'days'} logged
                        </Text>
                    </View>
                </View>
                <View style={styles.actionButtonsRow}>
                    <TouchableOpacity
                        onPress={openImportModal}
                        style={styles.importButton}
                        activeOpacity={0.8}
                    >
                        <Icon name="download-outline" size={20} color={colors.primary} style={styles.actionBtnIcon} />
                        <Text style={styles.importButtonText}>Import from OJT</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={addEntry} style={styles.addButton} activeOpacity={0.85}>
                        <Icon name="add-circle-outline" size={22} color={colors.onPrimary} style={styles.actionBtnIcon} />
                        <Text style={styles.addButtonText}>Add Day</Text>
                    </TouchableOpacity>
                </View>

                {entries.map((entry, index) => (
                    <View
                        key={`entry-${index}`}
                        style={[styles.entryCard, entry.hours ? styles.entryCardFilled : null]}
                    >
                        <View style={styles.entryHeader}>
                            <View style={styles.entryHeaderLeft}>
                                <View style={styles.dayBadge}>
                                    <Text style={styles.dayBadgeText}>{index + 1}</Text>
                                </View>
                                <View style={styles.entryTitleContainer}>
                                    <Text style={styles.entryTitle}>Day {index + 1}</Text>
                                    {entry.date ? (
                                        <Text style={styles.entryMeta}>{formatDisplayDate(entry.date)}</Text>
                                    ) : (
                                        <Text style={styles.entryMetaPlaceholder}>Select date</Text>
                                    )}
                                </View>
                            </View>
                            <View style={styles.entryHeaderRight}>
                                {entry.hours ? (
                                    <View style={styles.entryHoursPill}>
                                        <Text style={styles.entryHoursPillText}>
                                            {entry.hours} hrs
                                        </Text>
                                    </View>
                                ) : null}
                                {entries.length > 1 && (
                                    <TouchableOpacity
                                        onPress={() => removeEntry(index)}
                                        style={styles.removeButton}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                        activeOpacity={0.7}
                                    >
                                        <Icon name="trash-outline" size={20} color="#DC2626" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        <View style={styles.timeInputsContainer}>
                            <View style={styles.timeInputGroup}>
                                <Text style={styles.inputLabel}>Date</Text>
                                <TextInput
                                    style={[styles.input, styles.dateInput]}
                                    placeholder="YYYY/MM/DD"
                                    placeholderTextColor={colors.textMuted}
                                    value={entry.date}
                                    onChangeText={(text) => handleEntryChange(index, 'date', text)}
                                />
                            </View>
                            <View style={styles.timeInputGroup}>
                                <Text style={styles.inputLabel}>Time In</Text>
                                <TextInput
                                    style={[styles.input, styles.timeInput]}
                                    placeholder="08:00"
                                    placeholderTextColor={colors.textMuted}
                                    value={entry.timeIn}
                                    keyboardType="numeric"
                                    onChangeText={(text) => handleEntryChange(index, 'timeIn', text)}
                                />
                                <View style={styles.amPmRow}>
                                    <TouchableOpacity
                                        style={[
                                            styles.amPmButton,
                                            entry.timeInAmPm === 'AM' && styles.amPmButtonActive,
                                        ]}
                                        activeOpacity={0.7}
                                        onPress={() => handleEntryChange(index, 'timeInAmPm', 'AM')}
                                    >
                                        <Text
                                            style={[
                                                styles.amPmText,
                                                entry.timeInAmPm === 'AM' && styles.amPmTextActive,
                                            ]}
                                        >
                                            AM
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.amPmButton,
                                            entry.timeInAmPm === 'PM' && styles.amPmButtonActive,
                                        ]}
                                        activeOpacity={0.7}
                                        onPress={() => handleEntryChange(index, 'timeInAmPm', 'PM')}
                                    >
                                        <Text
                                            style={[
                                                styles.amPmText,
                                                entry.timeInAmPm === 'PM' && styles.amPmTextActive,
                                            ]}
                                        >
                                            PM
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={styles.timeInputGroup}>
                                <Text style={styles.inputLabel}>Time Out</Text>
                                <TextInput
                                    style={[styles.input, styles.timeInput]}
                                    placeholder="17:00"
                                    placeholderTextColor={colors.textMuted}
                                    value={entry.timeOut}
                                    keyboardType="numeric"
                                    onChangeText={(text) => handleEntryChange(index, 'timeOut', text)}
                                />
                                <View style={styles.amPmRow}>
                                    <TouchableOpacity
                                        style={[
                                            styles.amPmButton,
                                            entry.timeOutAmPm === 'AM' && styles.amPmButtonActive,
                                        ]}
                                        activeOpacity={0.7}
                                        onPress={() => handleEntryChange(index, 'timeOutAmPm', 'AM')}
                                    >
                                        <Text
                                            style={[
                                                styles.amPmText,
                                                entry.timeOutAmPm === 'AM' && styles.amPmTextActive,
                                            ]}
                                        >
                                            AM
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.amPmButton,
                                            entry.timeOutAmPm === 'PM' && styles.amPmButtonActive,
                                        ]}
                                        activeOpacity={0.7}
                                        onPress={() => handleEntryChange(index, 'timeOutAmPm', 'PM')}
                                    >
                                        <Text
                                            style={[
                                                styles.amPmText,
                                                entry.timeOutAmPm === 'PM' && styles.amPmTextActive,
                                            ]}
                                        >
                                            PM
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        {entry.hours ? (
                            <View style={styles.hoursDisplay}>
                                <Text style={styles.hoursLabel}>Total Hours</Text>
                                <Text style={styles.hoursValue}>{entry.hours} hours</Text>
                            </View>
                        ) : null}

                        <View style={styles.taskInputGroup}>
                            <Text style={styles.inputLabel}>Tasks Completed</Text>
                            <TextInput
                                style={[styles.input, styles.multilineInput]}
                                placeholder="Describe the tasks you completed today..."
                                placeholderTextColor={colors.textMuted}
                                multiline
                                value={entry.taskCompleted}
                                onChangeText={(text) => handleEntryChange(index, 'taskCompleted', text)}
                            />
                        </View>
                    </View>
                ))}

                <View style={styles.totalHoursCard}>
                    <Icon name="time-outline" size={20} color={colors.primary} />
                    <Text style={styles.totalHoursLabel}>Total hours this report</Text>
                    <Text style={styles.totalHoursValue}>{totalHours} hrs</Text>
                </View>
            </View>

            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.secondaryButton, styles.buttonSpacing]}
                    onPress={handleGeneratePdf}
                    disabled={isPdfGenerating}
                    activeOpacity={0.85}
                >
                    {isPdfGenerating ? (
                        <ActivityIndicator color={colors.onPrimary} size="small" />
                    ) : (
                        <>
                            <Icon name="document-attach-outline" size={20} color={colors.onPrimary} style={styles.actionBtnIcon} />
                            <Text style={styles.actionButtonText}>Export PDF</Text>
                        </>
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.primaryButton]}
                    activeOpacity={0.85}
                    onPress={async () => {
                        if (!ensureReportIsComplete()) {
                            return;
                        }
                        setIsGeneratingPreview(true);
                        setPdfError(null);
                        setPreviewModalVisible(true);
                        try {
                            const validEntries = getValidEntries();
                            const logoUrl = await getLogoAsBase64();
                            const reportData: WeeklyReportData = {
                                traineeName: formInfo.traineeName,
                                departmentAssigned: formInfo.departmentAssigned,
                                companyName: formInfo.companyName,
                                monthCovered: formInfo.monthCovered,
                                entries: validEntries,
                                preparedByName: formInfo.traineeName,
                                preparedByTitle: 'Trainee',
                                notedByName: formInfo.supervisorName,
                                notedByTitle: formInfo.supervisorTitle || 'Job Title of Supervisor',
                                receivedByName: formInfo.ojtAdvisorName,
                                receivedByTitle: formInfo.ojtAdvisorTitle || 'OJT Adviser',
                                leftLogoUrl: logoUrl,
                                rightLogoUrl: logoUrl,
                            };
                            
                            // Generate PDF
                            const pdfUri = await PDFGenerator.generateWeeklyReportPDF(reportData);
                            setPdfFileUri(pdfUri);
                            
                            // Convert to base64 for in-app preview
                            const base64 = await FileSystem.readAsStringAsync(pdfUri, {
                                encoding: FileSystem.EncodingType.Base64,
                            });
                            
                            // Create HTML page with PDF.js that renders PDF as images (works in WebView)
                            const htmlContent = `
                                <!DOCTYPE html>
                                <html>
                                <head>
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
                                    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script>
                                    <style>
                                        * { margin: 0; padding: 0; box-sizing: border-box; }
                                        body { 
                                            background: #f5f5f5; 
                                            padding: 10px;
                                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                        }
                                        #pdf-container { 
                                            max-width: 100%;
                                            margin: 0 auto;
                                        }
                                        canvas { 
                                            display: block;
                                            margin: 10px auto;
                                            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                                            background: white;
                                            max-width: 100%;
                                            height: auto;
                                        }
                                        #loading {
                                            text-align: center;
                                            padding: 40px;
                                            color: #666;
                                            font-size: 16;
                                        }
                                        #error {
                                            text-align: center;
                                            padding: 40px;
                                            color: #d32f2f;
                                            font-size: 14;
                                        }
                                    </style>
                                </head>
                                <body>
                                    <div id="loading">Loading PDF...</div>
                                    <div id="pdf-container"></div>
                                    <script>
                                        (function() {
                                            const pdfData = atob('${base64}');
                                            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
                                            
                                            pdfjsLib.getDocument({ data: pdfData }).promise.then(function(pdf) {
                                                document.getElementById('loading').style.display = 'none';
                                                const container = document.getElementById('pdf-container');
                                                
                                                function renderPage(pageNum) {
                                                    return pdf.getPage(pageNum).then(function(page) {
                                                        const viewport = page.getViewport({ scale: 1.5 });
                                                        const canvas = document.createElement('canvas');
                                                        const context = canvas.getContext('2d');
                                                        canvas.height = viewport.height;
                                                        canvas.width = viewport.width;
                                                        
                                                        const renderContext = {
                                                            canvasContext: context,
                                                            viewport: viewport
                                                        };
                                                        
                                                        return page.render(renderContext).promise.then(function() {
                                                            container.appendChild(canvas);
                                                            if (pageNum < pdf.numPages) {
                                                                return renderPage(pageNum + 1);
                                                            }
                                                        });
                                                    });
                                                }
                                                
                                                return renderPage(1);
                                            }).catch(function(error) {
                                                document.getElementById('loading').innerHTML = '<div id="error">Error loading PDF: ' + error.message + '</div>';
                                            });
                                        })();
                                    </script>
                                </body>
                                </html>
                            `;
                            
                            const htmlDataUri = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;
                            setPdfPreviewUri(htmlDataUri);
                        } catch (error: any) {
                            console.error('Preview generation error:', error);
                            setPdfError(`Failed to generate preview: ${error.message || 'Unknown error'}`);
                        } finally {
                            setIsGeneratingPreview(false);
                        }
                    }}
                    disabled={loading || isGeneratingPreview}
                >
                    {isGeneratingPreview ? (
                        <ActivityIndicator color={colors.onPrimary} size="small" />
                    ) : (
                        <>
                            <Icon name="eye-outline" size={20} color={colors.onPrimary} style={styles.actionBtnIcon} />
                            <Text style={styles.actionButtonText}>Preview</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
            <Modal
                visible={importModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => {
                    setImportModalVisible(false);
                    setSelectedLogIds([]);
                }}
            >
                <View style={styles.importModalBackdrop}>
                    <View style={styles.importModalCard}>
                        <Text style={styles.importModalTitle}>Import from OJT Tracker</Text>
                        <Text style={styles.importModalSubtitle}>
                            Select the time logs you want to add to this weekly report. Tasks and remarks can be filled in after importing.
                        </Text>
                        {logsLoading ? (
                            <View style={styles.importLoading}>
                                <ActivityIndicator color={colors.primary} />
                            </View>
                        ) : availableLogs.length ? (
                            <ScrollView style={styles.importList}>
                                {availableLogs.map((log) => {
                                    const id = makeLogId(log);
                                    const selected = selectedLogIds.includes(id);
                                    return (
                                        <TouchableOpacity
                                            key={id}
                                            style={[
                                                styles.importLogRow,
                                                selected && styles.importLogRowSelected,
                                            ]}
                                            activeOpacity={0.85}
                                            onPress={() => toggleLogSelection(id)}
                                        >
                                            <View style={styles.importLogText}>
                                                <Text style={styles.importLogDate}>{log.date}</Text>
                                                <Text style={styles.importLogTime}>
                                                    {log.clockIn} → {log.clockOut}
                                                </Text>
                                            </View>
                                            <Text style={styles.importLogHours}>{log.hours} hrs</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        ) : (
                            <View style={styles.importEmptyState}>
                                <Icon name="calendar-outline" size={44} color={colors.textSubtle} style={styles.importEmptyIcon} />
                                <Text style={styles.importEmptyTitle}>No OJT logs yet</Text>
                                <Text style={styles.importEmptyText}>
                                    Log your hours in the OJT Tracker first, then come back here to import them into this report.
                                </Text>
                            </View>
                        )}
                        <View style={styles.importActions}>
                            <TouchableOpacity
                                style={[styles.importActionButton, styles.importCancelButton]}
                                activeOpacity={0.85}
                                onPress={() => {
                                    setImportModalVisible(false);
                                    setSelectedLogIds([]);
                                }}
                            >
                                <Text style={styles.importCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.importActionButton,
                                    styles.importConfirmButton,
                                    !selectedLogIds.length && styles.importConfirmButtonDisabled,
                                ]}
                                activeOpacity={0.85}
                                onPress={handleImportSelectedLogs}
                                disabled={!selectedLogIds.length}
                            >
                                <Text style={styles.importConfirmText}>{selectedLogIds.length ? `Import ${selectedLogIds.length} selected` : 'Import selected'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Report Preview Modal - PDF Preview */}
            <Modal
                visible={previewModalVisible}
                animationType="slide"
                onRequestClose={() => {
                    setPreviewModalVisible(false);
                    setPdfPreviewUri(null);
                    setPdfError(null);
                    setPdfLoading(false);
                    setPdfFileUri(null);
                }}
            >
                <View style={styles.pdfPreviewContainer}>
                    <View style={styles.pdfPreviewHeader}>
                        <Text style={styles.pdfPreviewTitle}>Report Preview</Text>
                        <View style={styles.pdfPreviewHeaderRight}>
                            {pdfFileUri && (
                                <TouchableOpacity
                                    style={styles.pdfPreviewExternalButton}
                                    onPress={async () => {
                                        try {
                                            if (await Sharing.isAvailableAsync()) {
                                                await Sharing.shareAsync(pdfFileUri, {
                                                    mimeType: 'application/pdf',
                                                    dialogTitle: 'Open Weekly Report',
                                                    UTI: 'com.adobe.pdf',
                                                });
                                            } else {
                                                const canOpen = await Linking.canOpenURL(pdfFileUri);
                                                if (canOpen) {
                                                    await Linking.openURL(pdfFileUri);
                                                }
                                            }
                                        } catch (error: any) {
                                            Alert.alert('Error', 'Could not open PDF file.');
                                        }
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.pdfPreviewExternalText}>Open Externally</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={styles.pdfPreviewCloseButton}
                                onPress={() => {
                                    setPreviewModalVisible(false);
                                    setPdfPreviewUri(null);
                                    setPdfError(null);
                                    setPdfLoading(false);
                                    setPdfFileUri(null);
                                }}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.pdfPreviewCloseText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {isGeneratingPreview ? (
                        <View style={styles.pdfPreviewLoading}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={styles.pdfPreviewLoadingText}>Generating PDF preview...</Text>
                            <Text style={styles.pdfPreviewLoadingSubtext}>Please wait</Text>
                        </View>
                    ) : pdfError ? (
                        <View style={styles.pdfPreviewLoading}>
                            <Text style={styles.pdfPreviewErrorText}>⚠️</Text>
                            <Text style={styles.pdfPreviewLoadingText}>{pdfError}</Text>
                            <View style={styles.pdfPreviewErrorActions}>
                                {pdfFileUri && (
                                    <TouchableOpacity
                                        style={styles.pdfPreviewOpenButton}
                                        onPress={async () => {
                                            try {
                                                await Linking.openURL(pdfFileUri);
                                                setPreviewModalVisible(false);
                                            } catch (error: any) {
                                                Alert.alert('Error', 'Could not open PDF file.');
                                            }
                                        }}
                                    >
                                        <Text style={styles.pdfPreviewOpenText}>Open Externally</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    style={styles.pdfPreviewRetryButton}
                                    onPress={() => {
                                        setPdfError(null);
                                        setPdfPreviewUri(null);
                                        setPdfFileUri(null);
                                    }}
                                >
                                    <Text style={styles.pdfPreviewRetryText}>Retry</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : pdfPreviewUri ? (
                        (() => {
                            let WebViewComponent: any = null;
                            try {
                                WebViewComponent = require('react-native-webview').WebView;
                            } catch (e) {
                                WebViewComponent = null;
                            }

                            if (WebViewComponent) {
                                return (
                                    <>
                                        {pdfLoading && (
                                            <View style={styles.pdfPreviewLoadingOverlay}>
                                                <ActivityIndicator size="large" color={colors.primary} />
                                                <Text style={styles.pdfPreviewLoadingText}>Rendering PDF...</Text>
                                            </View>
                                        )}
                                        <WebViewComponent
                                            source={{ uri: pdfPreviewUri }}
                                            style={styles.pdfPreviewWebView}
                                            onLoadStart={() => setPdfLoading(true)}
                                            onLoadEnd={() => setPdfLoading(false)}
                                            onError={(syntheticEvent: any) => {
                                                const { nativeEvent } = syntheticEvent;
                                                console.error('WebView error:', nativeEvent);
                                                setPdfError('Failed to load PDF preview. You can still open it externally.');
                                                setPdfLoading(false);
                                            }}
                                            javaScriptEnabled={true}
                                            domStorageEnabled={true}
                                            scalesPageToFit={true}
                                            startInLoadingState={true}
                                            renderLoading={() => (
                                                <View style={styles.pdfPreviewLoading}>
                                                    <ActivityIndicator size="large" color={colors.primary} />
                                                    <Text style={styles.pdfPreviewLoadingText}>Loading PDF preview...</Text>
                                                </View>
                                            )}
                                        />
                                    </>
                                );
                            }

                            return (
                                <View style={styles.pdfPreviewLoading}>
                                    <Text style={styles.pdfPreviewLoadingText}>
                                        PDF preview requires react-native-webview
                                    </Text>
                                    {pdfFileUri && (
                                        <TouchableOpacity
                                            style={styles.pdfPreviewViewButton}
                                            onPress={async () => {
                                                try {
                                                    if (await Sharing.isAvailableAsync()) {
                                                        await Sharing.shareAsync(pdfFileUri, {
                                                            mimeType: 'application/pdf',
                                                            dialogTitle: 'Preview Weekly Report',
                                                            UTI: 'com.adobe.pdf',
                                                        });
                                                    }
                                                } catch (error: any) {
                                                    Alert.alert('Error', `Could not open PDF: ${error.message}`);
                                                }
                                            }}
                                        >
                                            <Text style={styles.pdfPreviewViewButtonText}>Open PDF</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            );
                        })()
                    ) : pdfFileUri ? (
                        <View style={styles.pdfPreviewSuccess}>
                            <Text style={styles.pdfPreviewSuccessIcon}>✅</Text>
                            <Text style={styles.pdfPreviewSuccessTitle}>PDF Generated Successfully!</Text>
                            <Text style={styles.pdfPreviewSuccessText}>
                                Your weekly report PDF has been generated. Tap the button below to view it.
                            </Text>
                            <TouchableOpacity
                                style={styles.pdfPreviewViewButton}
                                onPress={async () => {
                                    try {
                                        if (await Sharing.isAvailableAsync()) {
                                            await Sharing.shareAsync(pdfFileUri, {
                                                mimeType: 'application/pdf',
                                                dialogTitle: 'Preview Weekly Report',
                                                UTI: 'com.adobe.pdf',
                                            });
                                        } else {
                                            const canOpen = await Linking.canOpenURL(pdfFileUri);
                                            if (canOpen) {
                                                await Linking.openURL(pdfFileUri);
                                            } else {
                                                Alert.alert('Error', 'Could not open PDF file.');
                                            }
                                        }
                                        setPreviewModalVisible(false);
                                    } catch (error: any) {
                                        Alert.alert('Error', `Could not open PDF: ${error.message || 'Unknown error'}`);
                                    }
                                }}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.pdfPreviewViewButtonText}>View PDF</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.pdfPreviewCloseButton2}
                                onPress={() => {
                                    setPreviewModalVisible(false);
                                    setPdfFileUri(null);
                                }}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.pdfPreviewCloseButton2Text}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.pdfPreviewLoading}>
                            <Text style={styles.pdfPreviewLoadingText}>No preview available</Text>
                        </View>
                    )}
                </View>
            </Modal>
        </Screen>
    );
};

const styles = StyleSheet.create({
    scroll: {
        padding: 20,
        paddingTop: 0,
        backgroundColor: colors.bg,
    },
    hero: {
        marginHorizontal: -20,
        marginBottom: 20,
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    heroContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    heroIcon: {
        marginRight: 12,
        marginTop: 2,
    },
    heroTextWrap: {
        flex: 1,
    },
    heroTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.onPrimary,
        marginBottom: 6,
        letterSpacing: 0.2,
    },
    heroSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 19,
    },
    section: {
        backgroundColor: colors.surface,
        borderRadius: radii.lg,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.card,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.text,
    },
    description: {
        marginTop: 8,
        color: colors.textMuted,
        fontSize: 14,
        lineHeight: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 4,
        color: colors.text,
        letterSpacing: -0.3,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: colors.textMuted,
        fontWeight: '500',
    },
    sectionHeader: {
        marginBottom: 16,
    },
    fieldGroup: {
        marginBottom: 14,
    },
    actionButtonsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },
    input: {
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: radii.md,
        padding: 12,
        fontSize: 15,
        backgroundColor: colors.surface,
        color: colors.text,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textMuted,
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    nameTitleGroup: {
        marginBottom: 16,
    },
    timeInputsContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },
    timeInputGroup: {
        flex: 1,
    },
    dateInput: {
        fontSize: 14,
    },
    timeInput: {
        fontSize: 14,
        textAlign: 'center',
    },
    hoursDisplay: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderRadius: radii.md,
        backgroundColor: colors.primarySoft,
        marginBottom: 16,
    },
    hoursLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    hoursValue: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.primary,
    },
    taskInputGroup: {
        marginTop: 4,
    },
    multilineInput: {
        minHeight: 90,
        textAlignVertical: 'top',
        paddingTop: 12,
    },
    amPmRow: {
        flexDirection: 'row',
        marginTop: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    amPmButton: {
        flex: 1,
        paddingVertical: 6,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surfaceAlt,
    },
    amPmButtonActive: {
        backgroundColor: colors.primary,
    },
    amPmText: {
        fontSize: 12,
        color: colors.text,
    },
    amPmTextActive: {
        color: colors.onPrimary,
        fontWeight: '600',
    },
    entryCard: {
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: radii.lg,
        padding: 16,
        marginBottom: 16,
        backgroundColor: colors.surface,
        ...shadows.card,
    },
    entryCardFilled: {
        borderColor: colors.primary,
        backgroundColor: colors.bg,
        borderWidth: 2,
    },
    entryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    entryHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    dayBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    dayBadgeText: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.onPrimary,
    },
    entryTitleContainer: {
        flex: 1,
    },
    entryTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 2,
    },
    entryMeta: {
        fontSize: 12,
        color: colors.textMuted,
        fontWeight: '500',
    },
    entryMetaPlaceholder: {
        fontSize: 12,
        color: colors.textSubtle,
        fontStyle: 'italic',
    },
    entryHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    removeButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.dangerSoft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    entryHoursPill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: colors.primarySoft,
    },
    entryHoursPillText: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.primary,
    },
    actionBtnIcon: {
        marginRight: 8,
    },
    addButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: radii.md,
        backgroundColor: colors.primary,
        ...shadows.card,
        elevation: 2,
    },
    addButtonText: {
        color: colors.onPrimary,
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    importButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 14,
        paddingVertical: 14,
        borderRadius: radii.md,
        backgroundColor: colors.surface,
        borderWidth: 1.5,
        borderColor: colors.border,
    },
    importButtonText: {
        color: colors.text,
        fontSize: 13,
        fontWeight: '600',
    },
    totalHoursCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: radii.md,
        backgroundColor: colors.primarySoft,
        marginTop: 8,
        gap: 8,
    },
    totalHoursLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    totalHoursValue: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.primary,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    buttonSpacing: {
        marginRight: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radii.lg,
        paddingVertical: 14,
    },
    primaryButton: {
        backgroundColor: colors.primary,
    },
    secondaryButton: {
        backgroundColor: colors.primary,
    },
    actionButtonText: {
        color: colors.onPrimary,
        fontSize: 16,
        fontWeight: '600',
    },
    importModalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    importModalCard: {
        width: '100%',
        maxHeight: '80%',
        backgroundColor: colors.surface,
        borderRadius: radii.lg,
        padding: 16,
        ...shadows.card,
    },
    importModalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
    },
    importModalSubtitle: {
        fontSize: 13,
        color: colors.textMuted,
        marginBottom: 12,
    },
    importLoading: {
        paddingVertical: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    importList: {
        maxHeight: 260,
        marginBottom: 16,
    },
    importLogRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 8,
        backgroundColor: colors.surfaceAlt,
    },
    importLogRowSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primarySoft,
    },
    importLogText: {
        flex: 1,
        marginRight: 8,
    },
    importLogDate: {
        fontWeight: '600',
        color: colors.text,
        marginBottom: 2,
    },
    importLogTime: {
        fontSize: 12,
        color: colors.textMuted,
    },
    importLogHours: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.text,
    },
    importEmptyState: {
        paddingVertical: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    importEmptyIcon: {
        marginBottom: 12,
        opacity: 0.7,
    },
    importEmptyTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
    },
    importEmptyText: {
        fontSize: 13,
        color: colors.textMuted,
        textAlign: 'center',
    },
    importActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 8,
    },
    importActionButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: radii.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    importCancelButton: {
        backgroundColor: colors.surfaceAlt,
    },
    importCancelText: {
        color: colors.textMuted,
        fontWeight: '500',
    },
    importConfirmButton: {
        backgroundColor: colors.primary,
    },
    importConfirmButtonDisabled: {
        opacity: 0.5,
    },
    importConfirmText: {
        color: colors.onPrimary,
        fontWeight: '600',
    },
    pdfPreviewContainer: {
        flex: 1,
        backgroundColor: colors.surface,
    },
    pdfPreviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface,
    },
    pdfPreviewTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
    },
    pdfPreviewHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    pdfPreviewExternalButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: radii.md,
        backgroundColor: colors.primary,
    },
    pdfPreviewExternalText: {
        color: colors.onPrimary,
        fontSize: 13,
        fontWeight: '600',
    },
    pdfPreviewCloseButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pdfPreviewCloseText: {
        fontSize: 18,
        color: colors.text,
        fontWeight: '600',
    },
    pdfPreviewWebView: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    pdfPreviewLoading: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bg,
        padding: 20,
    },
    pdfPreviewLoadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    pdfPreviewLoadingText: {
        marginTop: 12,
        fontSize: 14,
        color: colors.textMuted,
        textAlign: 'center',
    },
    pdfPreviewLoadingSubtext: {
        marginTop: 8,
        fontSize: 12,
        color: colors.textSubtle,
    },
    pdfPreviewErrorText: {
        fontSize: 48,
        marginBottom: 16,
    },
    pdfPreviewErrorActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    pdfPreviewOpenButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: radii.md,
        backgroundColor: colors.info,
    },
    pdfPreviewOpenText: {
        color: colors.onPrimary,
        fontSize: 14,
        fontWeight: '600',
    },
    pdfPreviewRetryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: radii.md,
        backgroundColor: colors.primary,
    },
    pdfPreviewRetryText: {
        color: colors.onPrimary,
        fontSize: 14,
        fontWeight: '600',
    },
    pdfPreviewSuccess: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bg,
        padding: 40,
    },
    pdfPreviewSuccessIcon: {
        fontSize: 64,
        marginBottom: 20,
    },
    pdfPreviewSuccessTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 12,
        textAlign: 'center',
    },
    pdfPreviewSuccessText: {
        fontSize: 15,
        color: colors.textMuted,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    pdfPreviewViewButton: {
        width: '100%',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: radii.md,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        ...shadows.card,
    },
    pdfPreviewViewButtonText: {
        color: colors.onPrimary,
        fontSize: 16,
        fontWeight: '700',
    },
    pdfPreviewCloseButton2: {
        width: '100%',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: radii.md,
        backgroundColor: colors.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pdfPreviewCloseButton2Text: {
        color: colors.text,
        fontSize: 15,
        fontWeight: '600',
    },
});

export default WeeklyReportScreen;
