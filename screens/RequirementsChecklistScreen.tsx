import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Alert,
    Modal,
} from 'react-native';
import { Card, Chip, Button, ProgressBar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { auth, firestore, storage, ADMIN_FILE_FUNCTION_BASE_URL } from '../firebase/config';
import { doc, getDoc, updateDoc, setDoc, collection, addDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import * as DocumentPicker from 'expo-document-picker';
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

type RequirementsNavigationProp = StackNavigationProp<RootStackParamList, 'RequirementsChecklist'>;

interface Requirement {
    id: string;
    title: string;
    description: string;
    category: 'documents' | 'forms' | 'certifications' | 'other';
    status: 'pending' | 'completed' | 'overdue';
    dueDate?: Date;
    uploadedFiles: Array<
        | string
        | { name: string; url?: string; path?: string; contentType?: string; uploadedAt?: string }
        | { name: string; adminDocId: string; storedInFirestore: boolean; downloadUrl?: string; uploadedAt?: string }
    >;
    notes?: string;
    isRequired: boolean;
}

const RequirementsChecklistScreen: React.FC = () => {
    const navigation = useNavigation<RequirementsNavigationProp>();
    const [requirements, setRequirements] = useState<Requirement[]>([]);
    const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    // Default to using Cloud Storage for requirement files to avoid Firestore size limits
    const [storeMode, setStoreMode] = useState<'storage' | 'firestore'>('storage');

    // Soft limit for base64 storing in Firestore (bytes)
    const FIRESTORE_MAX_BYTES = 700 * 1024; // ~700 KB

    // ADMIN_FILE_FUNCTION_BASE_URL is read from firebase/config (useful when you deploy the getAdminFile function)

    useEffect(() => {
        loadRequirements();
        // load persisted upload store mode preference
        (async () => {
            try {
                const value = await AsyncStorage.getItem('REQUIREMENTS_STORE_MODE');
                if (value === 'storage' || value === 'firestore') setStoreMode(value);
            } catch (e) {
                // ignore
            }
        })();
    }, []);

    // Persist user's selected storage mode
    const setStoreModeAndPersist = async (mode: 'storage' | 'firestore') => {
        setStoreMode(mode);
        try { await AsyncStorage.setItem('REQUIREMENTS_STORE_MODE', mode); } catch (e) { /* ignore */ }
    };

    const loadRequirements = async () => {
        if (!auth.currentUser) return;

        try {
            const userDoc = await getDoc(doc(firestore, 'users', auth.currentUser.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                const savedRequirements = (data.requirements || getDefaultRequirements()) as any[];
                // Normalize statuses: if there are no uploadedFiles, ensure status is 'pending'
                const normalized = savedRequirements.map(r => {
                    const uploadedFiles = Array.isArray(r.uploadedFiles) ? r.uploadedFiles : [];
                    let status = r.status || (uploadedFiles.length > 0 ? 'completed' : 'pending');
                    if (!uploadedFiles || uploadedFiles.length === 0) status = 'pending';
                    // If dueDate exists and is past, keep 'overdue'
                    if (r.dueDate) {
                        const due = new Date(r.dueDate);
                        if (!isNaN(due.getTime()) && new Date() > due) {
                            status = uploadedFiles.length > 0 ? 'completed' : 'overdue';
                        }
                    }
                    return { ...r, uploadedFiles, status };
                });
                setRequirements(normalized as any);
                calculateProgress(normalized as any);
            } else {
                const defaultRequirements = getDefaultRequirements();
                setRequirements(defaultRequirements);
                calculateProgress(defaultRequirements);
            }
        } catch (error) {
            console.error('Error loading requirements:', error);
            const defaultRequirements = getDefaultRequirements();
            setRequirements(defaultRequirements);
            calculateProgress(defaultRequirements);
        }
    };

    const getDefaultRequirements = (): Requirement[] => [
        {
            id: '1',
            title: 'MOA (Memorandum of Agreement)',
            description: 'Signed agreement between your school and the company',
            category: 'documents',
            status: 'pending',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            uploadedFiles: [],
            isRequired: true,
        },
        {
            id: '2',
            title: 'Parent/Guardian Consent Form',
            description: 'Signed consent form from parent or guardian',
            category: 'forms',
            status: 'pending',
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
            uploadedFiles: [],
            isRequired: true,
        },
        {
            id: '3',
            title: 'Medical Certificate',
            description: 'Medical clearance from a licensed physician',
            category: 'certifications',
            status: 'pending',
            dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
            uploadedFiles: [],
            isRequired: true,
        },
        {
            id: '4',
            title: 'Police Clearance',
            description: 'Police clearance certificate',
            category: 'certifications',
            status: 'pending',
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
            uploadedFiles: [],
            isRequired: true,
        },
        {
            id: '5',
            title: 'Resume/CV',
            description: 'Updated resume or curriculum vitae',
            category: 'documents',
            status: 'pending',
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
            uploadedFiles: [],
            isRequired: true,
        },
        {
            id: '6',
            title: 'Cover Letter',
            description: 'Personalized cover letter for the internship',
            category: 'documents',
            status: 'pending',
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
            uploadedFiles: [],
            isRequired: false,
        },
        {
            id: '7',
            title: 'Academic Records',
            description: 'Official transcript of records',
            category: 'documents',
            status: 'pending',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            uploadedFiles: [],
            isRequired: true,
        },
        {
            id: '8',
            title: 'Insurance Certificate',
            description: 'Student insurance coverage certificate',
            category: 'certifications',
            status: 'pending',
            dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
            uploadedFiles: [],
            isRequired: true,
        },
    ];

    const calculateProgress = (reqs: Requirement[]) => {
        const completed = reqs.filter(req => req.status === 'completed').length;
        const total = reqs.filter(req => req.isRequired).length;
        setProgress(total > 0 ? completed / total : 0);
    };

    const handleStatusChange = async (requirementId: string, newStatus: 'pending' | 'completed' | 'overdue') => {
        const updatedRequirements = requirements.map(req => {
            if (req.id === requirementId) {
                // Only allow 'completed' if there is at least one uploaded file
                if (newStatus === 'completed' && req.uploadedFiles.length === 0) {
                    Alert.alert('Please upload a file before marking as complete.');
                    return req;
                }
                return { ...req, status: newStatus };
            }
            return req;
        });
        setRequirements(updatedRequirements);
        calculateProgress(updatedRequirements);

        // Save to Firestore
        if (auth.currentUser) {
            try {
                console.log('handleStatusChange: updating requirements for user', auth.currentUser.uid, { requirementId, newStatus });
                await updateDoc(doc(firestore, 'users', auth.currentUser.uid), {
                    requirements: updatedRequirements,
                });
                console.log('handleStatusChange: requirements update succeeded');
            } catch (error: any) {
                console.error('Error updating requirements:', error);
                Alert.alert('Save error', `Failed to save requirements: ${error?.message || String(error)}`);
                // Diagnostic: write the error to the user's document so you can inspect it in the console / server side.
                try {
                    await setDoc(doc(firestore, 'users', auth.currentUser.uid), {
                        lastRequirementsSyncError: { time: new Date().toISOString(), message: error?.message || String(error) }
                    }, { merge: true });
                    console.log('handleStatusChange: wrote lastRequirementsSyncError to user doc');
                } catch (dbgErr) {
                    console.error('handleStatusChange: failed to write diagnostic info to user doc:', dbgErr);
                }
            }
        }
    };

    const uriToBlob = (uri: string) => new Promise<Blob>((resolve, reject) => {
        try {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                resolve(xhr.response as Blob);
            };
            xhr.onerror = function () {
                reject(new Error('Failed to fetch file for upload'));
            };
            xhr.responseType = 'blob';
            xhr.open('GET', uri, true);
            xhr.send(null);
        } catch (err) {
            reject(err);
        }
    });

    const uploadToStorage = async (uri: string, name: string, fileAny: any, requirementId: string) => {
        try {
            const blob = await uriToBlob(uri);
            const remotePath = `requirements/${auth.currentUser?.uid}/${name}`;
            const sRef = storageRef(storage, remotePath);
            await uploadBytes(sRef, blob, { contentType: fileAny.mimeType || fileAny.type || 'application/octet-stream' });
            const downloadURL = await getDownloadURL(sRef);

            const fileMeta = { name, url: downloadURL, path: remotePath, contentType: fileAny.mimeType || fileAny.type || 'application/octet-stream', uploadedAt: new Date().toISOString() } as any;

            // add admin_files doc and attach its id to the returned metadata
            try {
                const req = requirements.find(r => r.id === requirementId);
                const adminDocRef = await addDoc(collection(firestore, 'admin_files'), {
                    userId: auth.currentUser?.uid,
                    requirementId,
                    requirementTitle: req?.title || null,
                    name: fileMeta.name,
                    url: fileMeta.url,
                    path: fileMeta.path,
                    contentType: fileMeta.contentType,
                    uploadedAt: fileMeta.uploadedAt,
                });
                fileMeta.adminDocId = adminDocRef.id;
            } catch (adminErr) {
                console.error('Failed to write admin_files record:', adminErr);
            }

            return fileMeta;
        } catch (err) {
            console.error('Storage upload error (helper):', err);
            throw err;
        }
    };

    const handleUploadFile = async () => {
        if (!selectedRequirement) return;

        try {
            setUploading(true);
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                copyToCacheDirectory: true,
            });

            if (result.canceled) {
                setUploading(false);
                return;
            }

            const file = result.assets && result.assets.length > 0 ? result.assets[0] : (result as any);
            const fileAny: any = file;
            const uri = fileAny.uri;
            const name = fileAny.name || fileAny.fileName || `uploaded_${Date.now()}`;

            if (storeMode === 'firestore') {
                // Read as base64 and store in Firestore (small files only)
                try {
                    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
                    const estimatedBytes = Math.ceil((base64.length * 3) / 4);
                    if (estimatedBytes > FIRESTORE_MAX_BYTES) {
                        Alert.alert('File too large', 'This file exceeds the Firestore storage limit (≈700 KB). Requirement uploads must be stored in Firestore; please use the Help Desk or contact an administrator to upload larger files.');
                        setUploading(false);
                        return;
                    }

                    const adminDocRef = await addDoc(collection(firestore, 'admin_files'), {
                        userId: auth.currentUser?.uid,
                        requirementId: selectedRequirement.id,
                        requirementTitle: selectedRequirement.title,
                        name,
                        contentBase64: base64,
                        contentType: fileAny.mimeType || fileAny.type || 'application/octet-stream',
                        uploadedAt: new Date().toISOString(),
                        storedInFirestore: true,
                    });

                    const dataUrl = `data:${fileAny.mimeType || fileAny.type || 'application/octet-stream'};base64,${base64}`;

                    const uploadedEntry = { name, adminDocId: adminDocRef.id, storedInFirestore: true, downloadUrl: dataUrl } as any;

                    const updatedRequirements = requirements.map(req =>
                        req.id === selectedRequirement.id
                            ? { ...req, uploadedFiles: [...req.uploadedFiles, uploadedEntry], status: 'completed' as 'completed' }
                            : req
                    );

                    setRequirements(updatedRequirements);
                    if (auth.currentUser) {
                        try {
                            console.log('handleUploadFile: updating user requirements (firestore-only) for', auth.currentUser.uid);
                            await updateDoc(doc(firestore, 'users', auth.currentUser.uid), {
                                requirements: updatedRequirements,
                            });
                            console.log('handleUploadFile: update requirements succeeded (firestore-only)');
                        } catch (error: any) {
                            console.error('handleUploadFile: failed to update requirements after firestore upload:', error);
                            Alert.alert('Save error', `Failed to update your requirements in Firestore: ${error?.message || String(error)}`);
                            try {
                                await setDoc(doc(firestore, 'users', auth.currentUser.uid), { lastRequirementsSyncError: { time: new Date().toISOString(), message: error?.message || String(error) } }, { merge: true });
                                console.log('handleUploadFile: wrote diagnostic to user doc');
                            } catch (dbgErr) { console.error('handleUploadFile: debug write failed', dbgErr); }
                        }
                    }

                    Alert.alert('Success', 'File stored in Firestore (small file). Admins can download it.');
                    setShowUploadModal(false);
                    setSelectedRequirement(null);
                    setUploading(false);
                    return;
                } catch (fsErr) {
                    console.error('Firestore store error:', fsErr);
                    Alert.alert('Error', 'Failed to store file in Firestore. Try Storage mode.');
                    setUploading(false);
                    return;
                }
            }

            // If storeMode is storage, upload the file to Cloud Storage and record admin_files
            if (storeMode === 'storage') {
                try {
                    // perform storage upload (this also writes admin_files and returns meta)
                    const fileMeta = await uploadToStorage(uri, name, fileAny, selectedRequirement.id);

                    const uploadedEntry: any = {
                        name: fileMeta.name,
                        url: fileMeta.url,
                        path: fileMeta.path,
                        contentType: fileMeta.contentType,
                        uploadedAt: fileMeta.uploadedAt,
                        adminDocId: fileMeta.adminDocId,
                        storedInFirestore: false,
                    };

                    const updatedRequirements = requirements.map(req =>
                        req.id === selectedRequirement.id
                            ? { ...req, uploadedFiles: [...req.uploadedFiles, uploadedEntry], status: 'completed' as 'completed' }
                            : req
                    );

                    setRequirements(updatedRequirements);

                    if (auth.currentUser) {
                        try {
                            console.log('handleUploadFile: updating user requirements (storage) for', auth.currentUser.uid);
                            await updateDoc(doc(firestore, 'users', auth.currentUser.uid), {
                                requirements: updatedRequirements,
                            });
                            console.log('handleUploadFile: update requirements succeeded (storage)');
                        } catch (error: any) {
                            console.error('handleUploadFile: failed to update requirements after storage upload:', error);
                            Alert.alert('Save error', `Failed to update your requirements in Firestore: ${error?.message || String(error)}`);
                            try {
                                await setDoc(doc(firestore, 'users', auth.currentUser.uid), { lastRequirementsSyncError: { time: new Date().toISOString(), message: error?.message || String(error) } }, { merge: true });
                                console.log('handleUploadFile: wrote diagnostic to user doc');
                            } catch (dbgErr) { console.error('handleUploadFile: debug write failed', dbgErr); }
                        }
                    }

                    Alert.alert('Success', 'File uploaded to Storage. Admins can download it.');
                    setShowUploadModal(false);
                    setSelectedRequirement(null);
                    setUploading(false);
                    return;
                } catch (storageErr) {
                    console.error('Storage upload error (handleUploadFile):', storageErr);
                    Alert.alert('Error', 'Failed to upload file to Storage. Please try again.');
                    setUploading(false);
                    return;
                }
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            Alert.alert('Error', 'Failed to upload file. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return '#4CAF50';
            case 'overdue': return '#F44336';
            case 'pending': return '#FF9800';
            default: return '#757575';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return 'checkmark-circle';
            case 'overdue': return 'alert-circle';
            case 'pending': return 'time';
            default: return 'help-circle';
        }
    };

    const formatDate = (date: Date | undefined) => {
        if (!date || isNaN(new Date(date).getTime())) return '';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const isOverdue = (dueDate: Date) => {
        return new Date() > dueDate;
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'documents': return 'document-text';
            case 'forms': return 'clipboard';
            case 'certifications': return 'shield-checkmark';
            case 'other': return 'folder';
            default: return 'document';
        }
    };

    const removeUploadedFile = async (requirementId: string, fileAny: any, index: number) => {
        Alert.alert('Remove file', 'Are you sure you want to remove this uploaded file?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: async () => {
                    try {
                        // If file is stored in Firestore (has adminDocId), delete that admin doc
                        if (fileAny && fileAny.adminDocId) {
                            try {
                                await deleteDoc(doc(firestore, 'admin_files', fileAny.adminDocId));
                            } catch (e) {
                                console.error('Failed to delete admin_files doc:', e);
                            }
                        }

                        // If file is stored in Storage (has path), delete object and any admin_files pointing to it
                        if (fileAny && fileAny.path) {
                            try {
                                const sRef = storageRef(storage, fileAny.path);
                                try {
                                    const storageModule: any = await import('firebase/storage');
                                    const deleteObjectFn = storageModule.deleteObject;
                                    if (deleteObjectFn) {
                                        await deleteObjectFn(sRef);
                                    } else {
                                        console.warn('deleteObject not available in storage module');
                                    }
                                } catch (impErr) {
                                    console.error('Dynamic import of firebase/storage failed for deleteObject:', impErr);
                                }
                            } catch (e) {
                                console.error('Failed to delete storage object:', e);
                            }

                            try {
                                const q = query(collection(firestore, 'admin_files'), where('path', '==', fileAny.path));
                                const snap = await getDocs(q);
                                for (const d of snap.docs) {
                                    try { await deleteDoc(d.ref); } catch (ee) { console.error('Failed to delete admin_files by path:', ee); }
                                }
                            } catch (e) {
                                console.error('Failed to query/delete admin_files by path:', e);
                            }
                        }

                        // Remove from user's requirements array and update per-requirement status
                        const updatedRequirements = requirements.map(req => {
                            if (req.id === requirementId) {
                                const newFiles = req.uploadedFiles.filter((_, i) => i !== index);
                                // If no uploaded files remain, mark as pending; otherwise keep completed
                                const newStatus = newFiles.length > 0 ? 'completed' : 'pending';
                                return { ...req, uploadedFiles: newFiles, status: newStatus } as Requirement;
                            }
                            return req;
                        });

                        setRequirements(updatedRequirements);
                        // Recalculate overall progress immediately so the progress bar reflects the change
                        calculateProgress(updatedRequirements);

                        if (auth.currentUser) {
                                    try {
                                        console.log('removeUploadedFile: updating user requirements for', auth.currentUser.uid);
                                        await updateDoc(doc(firestore, 'users', auth.currentUser.uid), { requirements: updatedRequirements });
                                        console.log('removeUploadedFile: user requirements update succeeded');
                                    } catch (e: any) {
                                        console.error('Failed to update user doc after file removal:', e);
                                        Alert.alert('Save error', `Failed to update your requirements in Firestore: ${e?.message || String(e)}`);
                                        try {
                                            await setDoc(doc(firestore, 'users', auth.currentUser.uid), { lastRequirementsSyncError: { time: new Date().toISOString(), message: e?.message || String(e) } }, { merge: true });
                                            console.log('removeUploadedFile: wrote diagnostic to user doc');
                                        } catch (dbgErr) { console.error('removeUploadedFile: debug write failed', dbgErr); }
                                    }
                                }

                        Alert.alert('Removed', 'File removed successfully.');
                    } catch (err) {
                        console.error('Error removing uploaded file:', err);
                        Alert.alert('Error', 'Failed to remove file.');
                    }
                }
            }
        ]);
    };

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Requirements Checklist</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Progress Section */}
                <Card style={styles.progressCard}>
                    <Card.Content>
                        <View style={styles.progressHeader}>
                            <Text style={styles.progressTitle}>Overall Progress</Text>
                            <Text style={styles.progressPercentage}>{Math.round(progress * 100)}%</Text>
                        </View>
                        <ProgressBar
                            progress={progress}
                            color="#4CAF50"
                            style={styles.progressBar}
                        />
                        <Text style={styles.progressSubtext}>
                            {requirements.filter(r => r.status === 'completed' && r.isRequired).length} of {requirements.filter(r => r.isRequired).length} required items completed
                        </Text>
                    </Card.Content>
                </Card>

                {/* Requirements List */}
                {requirements.map((requirement) => (
                    <Card key={requirement.id} style={styles.requirementCard}>
                        <Card.Content>
                            <View style={styles.requirementHeader}>
                                <View style={styles.requirementInfo}>
                                    <View style={styles.requirementTitleRow}>
                                        <Ionicons
                                            name={getCategoryIcon(requirement.category)}
                                            size={20}
                                            color="#666"
                                            style={styles.categoryIcon}
                                        />
                                        <Text style={styles.requirementTitle}>{requirement.title}</Text>
                                        {requirement.isRequired && (
                                            <Chip mode="outlined" textStyle={{ fontSize: 10 }} style={styles.requiredChip}>
                                                Required
                                            </Chip>
                                        )}
                                    </View>
                                    <Text style={styles.requirementDescription}>{requirement.description}</Text>
                                </View>
                                <View style={styles.statusContainer}>
                                    <Ionicons
                                        name={getStatusIcon(requirement.status)}
                                        size={24}
                                        color={getStatusColor(requirement.status)}
                                    />
                                </View>
                            </View>

                            <View style={styles.requirementDetails}>
                                {requirement.uploadedFiles.length > 0 && (
                                    <View style={styles.uploadedFilesContainer}>
                                        <Text style={styles.uploadedFilesTitle}>{`Uploaded Files (${requirement.uploadedFiles.length})`}</Text>
                                        {requirement.uploadedFiles.map((file, index) => {
                                            const fileAny: any = file;
                                            const displayName = typeof file === 'string' ? file : (fileAny.name || 'file');
                                            const url = typeof file === 'string' ? null : (fileAny.downloadUrl || fileAny.url);
                                            return (
                                                <View key={index} style={styles.fileRow}>
                                                    <TouchableOpacity
                                                        style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                                                        onPress={() => {
                                                            if (url) return Linking.openURL(url);
                                                            // If file was saved as an admin doc in Firestore, prefer the getAdminFile cloud function
                                                            if ((fileAny && fileAny.adminDocId) && ADMIN_FILE_FUNCTION_BASE_URL.includes('cloudfunctions')) {
                                                                const fnUrl = `${ADMIN_FILE_FUNCTION_BASE_URL}?docId=${fileAny.adminDocId}`;
                                                                return Linking.openURL(fnUrl);
                                                            }
                                                        }}
                                                        disabled={!url && !(fileAny && fileAny.adminDocId)}
                                                    >
                                                        <Ionicons name="document" size={16} color="#007aff" />
                                                        <Text style={styles.fileName}>{displayName}</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => removeUploadedFile(requirement.id, fileAny, index)} style={styles.deleteButton}>
                                                        <Ionicons name="trash" size={18} color="#d32f2f" />
                                                    </TouchableOpacity>
                                                </View>
                                            );
                                        })}
                                    </View>
                                )}

                                <View style={styles.actionButtons}>
                                    {requirement.uploadedFiles.length > 0 ? (
                                        <View style={styles.doneIndicator}>
                                            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                                            <Text style={styles.doneText}>Done</Text>
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            style={styles.uploadButton}
                                            onPress={() => {
                                                setSelectedRequirement(requirement);
                                                setShowUploadModal(true);
                                            }}
                                        >
                                            <Ionicons name="cloud-upload" size={16} color="#007aff" />
                                            <Text style={styles.uploadButtonText}>Upload File</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        </Card.Content>
                    </Card>
                ))}

                {/* Spacer for bottom nav */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Upload Modal */}
            <Modal
                visible={showUploadModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowUploadModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Upload File</Text>
                            <TouchableOpacity onPress={() => setShowUploadModal(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            {selectedRequirement && (
                                <>
                                    <Text style={styles.modalSubtitle}>{selectedRequirement.title}</Text>
                                    <Text style={styles.modalDescription}>{selectedRequirement.description}</Text>

                                    <View style={styles.uploadSection}>
                                        <Ionicons name="cloud-upload-outline" size={48} color="#007aff" />
                                        <Text style={styles.uploadText}>Select a file to upload</Text>
                                        <Text style={styles.uploadSubtext}>Supports PDF and image files</Text>
                                    </View>

                                    <Button
                                        mode="contained"
                                        onPress={handleUploadFile}
                                        loading={uploading}
                                        disabled={uploading}
                                        style={styles.uploadModalButton}
                                    >
                                        {uploading ? 'Uploading...' : 'Select File'}
                                    </Button>
                                </>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f6ff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: '#6366F1',
        borderBottomWidth: 0,
        borderRadius: 12,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    scrollView: {
        flex: 1,
        padding: 16,
    },
    progressCard: {
        marginBottom: 16,
        elevation: 2,
        borderRadius: 12,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    progressTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    progressPercentage: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        marginBottom: 8,
    },
    progressSubtext: {
        fontSize: 14,
        color: '#666',
    },
    requirementCard: {
        marginBottom: 16,
        elevation: 2,
        borderRadius: 12,
    },
    requirementHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    requirementInfo: {
        flex: 1,
    },
    requirementTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    categoryIcon: {
        marginRight: 8,
    },
    requirementTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    requiredChip: {
        height: 20,
        marginLeft: 8,
    },
    requirementDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    statusContainer: {
        marginLeft: 12,
    },
    requirementDetails: {
        marginTop: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    dueDateText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 6,
    },
    overdueText: {
        color: '#F44336',
        fontWeight: '600',
    },
    uploadedFilesContainer: {
        marginBottom: 12,
    },
    uploadedFilesTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 6,
    },
    fileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    fileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    deleteButton: {
        padding: 6,
        marginLeft: 8,
    },
    fileName: {
        fontSize: 14,
        color: '#6366F1',
        marginLeft: 6,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    statusButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#4CAF50',
        backgroundColor: 'transparent',
    },
    completedButton: {
        backgroundColor: '#4CAF50',
    },
    statusButtonText: {
        fontSize: 14,
        color: '#4CAF50',
        marginLeft: 4,
        fontWeight: '500',
    },
    completedButtonText: {
        color: '#fff',
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#6366F1',
        backgroundColor: 'transparent',
    },
    uploadButtonText: {
        fontSize: 14,
        color: '#6366F1',
        marginLeft: 4,
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        width: '90%',
        maxWidth: 400,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    modalBody: {
        padding: 20,
    },
    modalSubtitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    modalDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 24,
        lineHeight: 20,
    },
    uploadSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    uploadText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginTop: 12,
        marginBottom: 4,
    },
    uploadSubtext: {
        fontSize: 14,
        color: '#666',
    },
    uploadModalButton: {
        borderRadius: 8,
    },
    doneIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
    },
    doneText: {
        color: '#4CAF50',
        fontWeight: 'bold',
        fontSize: 15,
        marginLeft: 4,
    },
});

export default RequirementsChecklistScreen; 