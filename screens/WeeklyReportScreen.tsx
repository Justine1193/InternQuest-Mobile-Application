import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { firestore, storage } from '../firebase/config';
import { getAuth } from 'firebase/auth';

const WeeklyReportScreen: React.FC = () => {
    const [tasks, setTasks] = useState('');
    const [learnings, setLearnings] = useState('');
    const [outcomes, setOutcomes] = useState('');
    const [file, setFile] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handlePickFile = async () => {
        const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
        if (!result.canceled && result.assets && result.assets.length > 0) {
            setFile(result.assets[0]);
        }
    };

    const handleSubmit = async () => {
        if (!tasks || !learnings || !outcomes) {
            Alert.alert('Please fill in all fields.');
            return;
        }
        setLoading(true);
        let attachmentUrl = '';
        try {
            // Upload file if selected
            if (file) {
                const response = await fetch(file.uri);
                const blob = await response.blob();
                const fileRef = ref(storage, `weeklyReports/${Date.now()}_${file.name}`);
                await uploadBytes(fileRef, blob);
                attachmentUrl = await getDownloadURL(fileRef);
            }
            // Get current user
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) throw new Error('User not authenticated');
            // Save report to Firestore
            await addDoc(collection(firestore, 'weeklyReports'), {
                userId: user.uid,
                tasks,
                learnings,
                outcomes,
                attachmentUrl,
                timestamp: Timestamp.now(),
            });
            setTasks('');
            setLearnings('');
            setOutcomes('');
            setFile(null);
            Alert.alert('Success', 'Weekly report submitted!');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to submit report.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Submit Weekly Accomplishment Report</Text>
            <TextInput
                style={styles.input}
                placeholder="Tasks this week"
                value={tasks}
                onChangeText={setTasks}
                multiline
            />
            <TextInput
                style={styles.input}
                placeholder="Learnings this week"
                value={learnings}
                onChangeText={setLearnings}
                multiline
            />
            <TextInput
                style={styles.input}
                placeholder="Outcomes this week"
                value={outcomes}
                onChangeText={setOutcomes}
                multiline
            />
            <TouchableOpacity style={styles.fileButton} onPress={handlePickFile}>
                <Text style={styles.fileButtonText}>{file ? `Attached: ${file.name}` : 'Attach File (optional)'}</Text>
            </TouchableOpacity>
            {loading ? (
                <ActivityIndicator size="large" color="#007AFF" style={{ marginVertical: 16 }} />
            ) : (
                <Button title="Submit Report" onPress={handleSubmit} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 24,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    fileButton: {
        backgroundColor: '#eee',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        alignItems: 'center',
    },
    fileButtonText: {
        color: '#007AFF',
        fontSize: 16,
    },
});

export default WeeklyReportScreen;
