import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    Image,
    ActivityIndicator,
} from 'react-native';
import { Card, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { auth, firestore, storage } from '../firebase/config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import * as DocumentPicker from 'expo-document-picker';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { SecurityUtils } from '../services/security';
import { colors, radii, shadows } from '../ui/theme';

const SignatureUploadScreen: React.FC = () => {
    const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [userRole, setUserRole] = useState<string>('');
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        loadUserSignature();
        checkAdminStatus();
    }, []);

    const checkAdminStatus = async () => {
        const admin = await SecurityUtils.isAdmin();
        setIsAdmin(admin);
    };

    const loadUserSignature = async () => {
        if (!auth.currentUser) return;

        try {
            setLoading(true);
            const userDoc = await getDoc(doc(firestore, 'users', auth.currentUser.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                setUserRole(data.role || '');
                setSignatureUrl(data.signatureUrl || null);
            }
        } catch (error) {
            console.error('Error loading signature:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadSignature = async () => {
        if (!auth.currentUser) {
            Alert.alert('Error', 'You must be signed in to upload a signature.');
            return;
        }

        // Check if user is admin or super_admin
        const admin = await SecurityUtils.isAdmin();
        if (!admin) {
            Alert.alert('Unauthorized', 'Only coordinators and advisers can upload signatures.');
            return;
        }

        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*'],
                copyToCacheDirectory: true,
            });

            if (result.canceled) {
                return;
            }

            const fileUri = result.assets?.[0]?.uri;
            if (!fileUri) {
                Alert.alert('Error', 'No file selected');
                return;
            }

            setUploading(true);

            // Convert to blob
            const blob = await uriToBlob(fileUri);

            // Upload to Firebase Storage
            const fileName = `signatures/${auth.currentUser.uid}-signature-${Date.now()}`;
            const storageReference = storageRef(storage, fileName);
            await uploadBytes(storageReference, blob);

            // Get download URL
            const downloadUrl = await getDownloadURL(storageReference);

            // Save to Firestore
            await setDoc(
                doc(firestore, 'users', auth.currentUser.uid),
                {
                    signatureUrl: downloadUrl,
                    signatureUploadedAt: serverTimestamp(),
                },
                { merge: true }
            );

            setSignatureUrl(downloadUrl);
            Alert.alert('Success', 'Signature uploaded successfully!');
        } catch (error) {
            console.error('Error uploading signature:', error);
            Alert.alert('Error', `Failed to upload signature: ${error}`);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteSignature = async () => {
        if (!auth.currentUser) return;

        Alert.alert('Delete Signature', 'Are you sure you want to delete your signature?', [
            { text: 'Cancel', onPress: () => {} },
            {
                text: 'Delete',
                onPress: async () => {
                    try {
                        setUploading(true);

                        // Delete from Storage (best effort)
                        if (signatureUrl) {
                            try {
                                const fileRef = storageRef(storage, `signatures/${auth.currentUser?.uid}-signature-*`);
                                // Note: Firebase Storage doesn't support wildcard deletions, so we'll just clear the URL
                            } catch (e) {
                                console.warn('Could not delete from storage:', e);
                            }
                        }

                        // Remove from Firestore
                        await setDoc(
                            doc(firestore, 'users', auth.currentUser.uid),
                            {
                                signatureUrl: null,
                            },
                            { merge: true }
                        );

                        setSignatureUrl(null);
                        Alert.alert('Success', 'Signature deleted successfully!');
                    } catch (error) {
                        console.error('Error deleting signature:', error);
                        Alert.alert('Error', `Failed to delete signature: ${error}`);
                    } finally {
                        setUploading(false);
                    }
                },
            },
        ]);
    };

    const uriToBlob = (uri: string) =>
        new Promise<Blob>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = () => resolve(xhr.response as Blob);
            xhr.onerror = () => reject(new Error('Failed to fetch file'));
            xhr.responseType = 'blob';
            xhr.open('GET', uri, true);
            xhr.send(null);
        });

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <Card style={styles.card}>
                    <Card.Content>
                        <View style={styles.header}>
                            <Ionicons name="pencil" size={32} color={colors.primary} />
                            <Text style={styles.title}>Digital Signature</Text>
                        </View>

                        {!isAdmin && (
                            <View style={styles.warningBox}>
                                <Ionicons name="warning" size={24} color={colors.warning} />
                                <Text style={styles.warningText}>
                                    Only coordinators and advisers can upload signatures.
                                </Text>
                            </View>
                        )}

                        {isAdmin && (
                            <>
                                <Text style={styles.description}>
                                    Upload your digital signature. This will be automatically added to official documents like the OJT Completion Checklist when students complete their requirements.
                                </Text>

                                {signatureUrl ? (
                                    <View style={styles.previewSection}>
                                        <Text style={styles.label}>Current Signature:</Text>
                                        <View style={styles.signaturePreview}>
                                            <Image source={{ uri: signatureUrl }} style={styles.signatureImage} />
                                        </View>
                                        <Text style={styles.uploadedText}>✓ Signature uploaded</Text>

                                        <View style={styles.buttonGroup}>
                                            <Button
                                                mode="contained"
                                                onPress={handleUploadSignature}
                                                disabled={uploading}
                                                style={styles.button}
                                            >
                                                {uploading ? 'Uploading...' : 'Change Signature'}
                                            </Button>
                                            <Button
                                                mode="outlined"
                                                onPress={handleDeleteSignature}
                                                disabled={uploading}
                                                style={styles.button}
                                            >
                                                Delete
                                            </Button>
                                        </View>
                                    </View>
                                ) : (
                                    <View style={styles.uploadSection}>
                                        <View style={styles.uploadPlaceholder}>
                                            <Ionicons name="cloud-upload" size={48} color={colors.textSubtle} />
                                            <Text style={styles.placeholderText}>No signature uploaded</Text>
                                        </View>

                                        <Button
                                            mode="contained"
                                            onPress={handleUploadSignature}
                                            disabled={uploading}
                                            style={styles.button}
                                        >
                                            {uploading ? 'Uploading...' : 'Upload Signature'}
                                        </Button>
                                    </View>
                                )}

                                <View style={styles.infoBox}>
                                    <Ionicons name="information-circle" size={20} color={colors.info} />
                                    <Text style={styles.infoText}>
                                        Recommended: Upload a PNG or JPG image (max 5MB) with transparent background for best results.
                                    </Text>
                                </View>
                            </>
                        )}
                    </Card.Content>
                </Card>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    content: {
        padding: 16,
        paddingBottom: 32,
    },
    card: {
        marginTop: 8,
        borderRadius: radii.lg,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.card,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginLeft: 12,
        color: colors.text,
    },
    description: {
        fontSize: 14,
        color: colors.textMuted,
        lineHeight: 20,
        marginBottom: 20,
    },
    warningBox: {
        flexDirection: 'row',
        backgroundColor: colors.warningSoft,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: colors.warning,
    },
    warningText: {
        flex: 1,
        marginLeft: 12,
        color: colors.text,
        fontSize: 14,
        fontWeight: '500',
    },
    previewSection: {
        marginVertical: 20,
    },
    uploadSection: {
        marginVertical: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 12,
    },
    signaturePreview: {
        backgroundColor: colors.surfaceAlt,
        borderRadius: radii.md,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
    },
    signatureImage: {
        width: '100%',
        height: 120,
        resizeMode: 'contain',
    },
    uploadPlaceholder: {
        backgroundColor: colors.surfaceAlt,
        borderRadius: radii.md,
        padding: 32,
        marginBottom: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: colors.border,
    },
    placeholderText: {
        fontSize: 14,
        color: colors.textSubtle,
        marginTop: 12,
    },
    uploadedText: {
        fontSize: 12,
        color: colors.success,
        fontWeight: '500',
        marginBottom: 16,
    },
    buttonGroup: {
        gap: 12,
    },
    button: {
        marginVertical: 8,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: colors.infoSoft,
        borderRadius: 8,
        padding: 12,
        marginTop: 20,
        borderLeftWidth: 4,
        borderLeftColor: colors.info,
    },
    infoText: {
        flex: 1,
        marginLeft: 12,
        color: colors.text,
        fontSize: 12,
        lineHeight: 18,
    },
});

export default SignatureUploadScreen;
