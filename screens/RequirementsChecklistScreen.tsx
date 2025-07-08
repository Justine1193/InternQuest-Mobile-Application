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
import { auth, firestore } from '../firebase/config';
import { doc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import * as DocumentPicker from 'expo-document-picker';

type RequirementsNavigationProp = StackNavigationProp<RootStackParamList, 'RequirementsChecklist'>;

interface Requirement {
    id: string;
    title: string;
    description: string;
    category: 'documents' | 'forms' | 'certifications' | 'other';
    status: 'pending' | 'completed' | 'overdue';
    dueDate?: Date;
    uploadedFiles: string[];
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

    useEffect(() => {
        loadRequirements();
    }, []);

    const loadRequirements = async () => {
        if (!auth.currentUser) return;

        try {
            const userDoc = await getDoc(doc(firestore, 'users', auth.currentUser.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                const savedRequirements = data.requirements || getDefaultRequirements();
                setRequirements(savedRequirements);
                calculateProgress(savedRequirements);
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
                await updateDoc(doc(firestore, 'users', auth.currentUser.uid), {
                    requirements: updatedRequirements,
                });
            } catch (error) {
                console.error('Error updating requirements:', error);
            }
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

            const file = result.assets[0];

            // Simulate file upload (in real app, upload to cloud storage)
            const fileName = file.name || 'uploaded_file';

            const updatedRequirements = requirements.map(req =>
                req.id === selectedRequirement.id
                    ? { ...req, uploadedFiles: [...req.uploadedFiles, fileName], status: 'completed' as 'completed' }
                    : req
            );

            setRequirements(updatedRequirements);

            // Save to Firestore
            if (auth.currentUser) {
                await updateDoc(doc(firestore, 'users', auth.currentUser.uid), {
                    requirements: updatedRequirements,
                });
            }

            Alert.alert('Success', 'File uploaded successfully!');
            setShowUploadModal(false);
            setSelectedRequirement(null);
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

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
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
                                        <Text style={styles.uploadedFilesTitle}>Uploaded Files:</Text>
                                        {requirement.uploadedFiles.map((file, index) => (
                                            <View key={index} style={styles.fileItem}>
                                                <Ionicons name="document" size={16} color="#007aff" />
                                                <Text style={styles.fileName}>{file}</Text>
                                            </View>
                                        ))}
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
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
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
    fileName: {
        fontSize: 14,
        color: '#007aff',
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
        borderColor: '#007aff',
        backgroundColor: 'transparent',
    },
    uploadButtonText: {
        fontSize: 14,
        color: '#007aff',
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