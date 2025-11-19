import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ScrollView,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { firestore, storage } from '../firebase/config';
import { getAuth } from 'firebase/auth';
import PDFGenerator, { WeeklyReportEntry, WeeklyReportData } from '../services/pdfGenerator';

type WeeklyReportEntryForm = Omit<WeeklyReportEntry, 'hours'> & { hours: string };

const emptyEntry: WeeklyReportEntryForm = {
    date: '',
    timeIn: '',
    timeOut: '',
    hours: '',
    taskCompleted: '',
    remarks: '',
};

const WeeklyReportScreen: React.FC = () => {
    const [formInfo, setFormInfo] = useState({
        traineeName: '',
        departmentAssigned: '',
        companyName: '',
        monthCovered: '',
        supervisorName: '',
        ojtAdvisorName: '',
    });
    const [entries, setEntries] = useState<WeeklyReportEntryForm[]>([{ ...emptyEntry }]);
    const [file, setFile] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [isPdfGenerating, setIsPdfGenerating] = useState(false);

    const totalHours = useMemo(
        () => entries.reduce((sum, entry) => sum + (Number(entry.hours) || 0), 0),
        [entries]
    );

    const handlePickFile = async () => {
        const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
        if (!result.canceled && result.assets && result.assets.length > 0) {
            setFile(result.assets[0]);
        }
    };

    const handleInfoChange = (field: keyof typeof formInfo, value: string) => {
        setFormInfo((prev) => ({ ...prev, [field]: value }));
    };

    const handleEntryChange = (index: number, field: keyof WeeklyReportEntryForm, value: string) => {
        setEntries((prev) =>
            prev.map((entry, idx) => (idx === index ? { ...entry, [field]: value } : entry))
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
                ...entry,
                hours: Number(entry.hours) || 0,
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
        let attachmentUrl = '';

        try {
            if (file) {
                const response = await fetch(file.uri);
                const blob = await response.blob();
                const fileRef = ref(storage, `weeklyReports/${Date.now()}_${file.name}`);
                await uploadBytes(fileRef, blob);
                attachmentUrl = await getDownloadURL(fileRef);
            }

            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            await addDoc(collection(firestore, 'weeklyReports'), {
                userId: user.uid,
                ...formInfo,
                totalHours,
                entries: validEntries,
                attachmentUrl,
                timestamp: Timestamp.now(),
            });

            setFormInfo({
                traineeName: '',
                departmentAssigned: '',
                companyName: '',
                monthCovered: '',
                supervisorName: '',
                ojtAdvisorName: '',
            });
            setEntries([{ ...emptyEntry }]);
            setFile(null);
            Alert.alert('Success', 'Weekly report submitted and saved!');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to submit report.');
        } finally {
            setLoading(false);
        }
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

        const reportData: WeeklyReportData = {
            traineeName: formInfo.traineeName,
            departmentAssigned: formInfo.departmentAssigned,
            companyName: formInfo.companyName,
            monthCovered: formInfo.monthCovered,
            entries: validEntries,
            preparedByName: formInfo.traineeName,
            preparedByTitle: 'Trainee',
            notedByName: formInfo.supervisorName,
            notedByTitle: 'Job Title of Supervisor',
            receivedByName: formInfo.ojtAdvisorName,
            receivedByTitle: 'OJT Adviser',
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
        <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.section}>
                <Text style={styles.title}>Weekly Accomplishment Report</Text>
                <Text style={styles.description}>
                    Fill out the trainee details and daily accomplishments. Once complete, you can submit the
                    record to Firestore and export a PDF that mirrors the NEU template.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Trainee Information</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Trainee Name"
                    value={formInfo.traineeName}
                    onChangeText={(text) => handleInfoChange('traineeName', text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Department Assigned"
                    value={formInfo.departmentAssigned}
                    onChangeText={(text) => handleInfoChange('departmentAssigned', text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Company"
                    value={formInfo.companyName}
                    onChangeText={(text) => handleInfoChange('companyName', text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Month Covered"
                    value={formInfo.monthCovered}
                    onChangeText={(text) => handleInfoChange('monthCovered', text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Supervisor (for Noted by)"
                    value={formInfo.supervisorName}
                    onChangeText={(text) => handleInfoChange('supervisorName', text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="OJT Adviser (for Received by)"
                    value={formInfo.ojtAdvisorName}
                    onChangeText={(text) => handleInfoChange('ojtAdvisorName', text)}
                />
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Daily Entries</Text>
                    <TouchableOpacity onPress={addEntry} style={styles.addButton}>
                        <Text style={styles.addButtonText}>+ Add Day</Text>
                    </TouchableOpacity>
                </View>

                {entries.map((entry, index) => (
                    <View key={`entry-${index}`} style={styles.entryCard}>
                        <View style={styles.entryHeader}>
                            <Text style={styles.entryTitle}>Day {index + 1}</Text>
                            {entries.length > 1 && (
                                <TouchableOpacity onPress={() => removeEntry(index)}>
                                    <Text style={styles.removeText}>Remove</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        <View style={styles.row}>
                            <TextInput
                                style={[styles.input, styles.rowInput]}
                                placeholder="Date (e.g., 9/18/2023)"
                                value={entry.date}
                                onChangeText={(text) => handleEntryChange(index, 'date', text)}
                            />
                            <TextInput
                                style={[styles.input, styles.rowInput]}
                                placeholder="Time In"
                                value={entry.timeIn}
                                onChangeText={(text) => handleEntryChange(index, 'timeIn', text)}
                            />
                            <TextInput
                                style={[styles.input, styles.rowInput]}
                                placeholder="Time Out"
                                value={entry.timeOut}
                                onChangeText={(text) => handleEntryChange(index, 'timeOut', text)}
                            />
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Number of hours"
                            keyboardType="numeric"
                            value={entry.hours}
                            onChangeText={(text) => handleEntryChange(index, 'hours', text)}
                        />
                        <TextInput
                            style={[styles.input, styles.multilineInput]}
                            placeholder="Task completed"
                            multiline
                            value={entry.taskCompleted}
                            onChangeText={(text) => handleEntryChange(index, 'taskCompleted', text)}
                        />
                        <TextInput
                            style={[styles.input, styles.multilineInput]}
                            placeholder="Remarks (optional)"
                            multiline
                            value={entry.remarks || ''}
                            onChangeText={(text) => handleEntryChange(index, 'remarks', text)}
                        />
                    </View>
                ))}

                <Text style={styles.totalHours}>Total Hours: {totalHours}</Text>
            </View>

            <TouchableOpacity style={styles.fileButton} onPress={handlePickFile}>
                <Text style={styles.fileButtonText}>
                    {file ? `Attached: ${file.name}` : 'Attach Supporting File (optional)'}
                </Text>
            </TouchableOpacity>

            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.secondaryButton, styles.buttonSpacing]}
                    onPress={handleGeneratePdf}
                    disabled={isPdfGenerating}
                >
                    {isPdfGenerating ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.actionButtonText}>Export PDF</Text>
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.primaryButton]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.actionButtonText}>Submit Report</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scroll: {
        padding: 20,
        backgroundColor: '#f7f9fc',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    description: {
        marginTop: 8,
        color: '#555',
        fontSize: 14,
        lineHeight: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        color: '#1a1a1a',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#d7dce5',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        fontSize: 15,
        backgroundColor: '#fdfdfd',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    rowInput: {
        flex: 1,
        marginRight: 8,
    },
    multilineInput: {
        minHeight: 70,
        textAlignVertical: 'top',
    },
    entryCard: {
        borderWidth: 1,
        borderColor: '#e4e9f2',
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
        backgroundColor: '#fbfcff',
    },
    entryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    entryTitle: {
        fontWeight: '600',
        color: '#1a1a1a',
    },
    removeText: {
        color: '#d9534f',
        fontWeight: '600',
    },
    addButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: '#e6f0ff',
    },
    addButtonText: {
        color: '#2962ff',
        fontWeight: '600',
    },
    totalHours: {
        textAlign: 'right',
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginTop: 4,
    },
    fileButton: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d7dce5',
        marginBottom: 16,
    },
    fileButtonText: {
        color: '#2962ff',
        fontWeight: '600',
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
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: '#1c7ed6',
    },
    secondaryButton: {
        backgroundColor: '#6c5ce7',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default WeeklyReportScreen;
