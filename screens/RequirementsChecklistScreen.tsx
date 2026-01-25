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
    RefreshControl,
} from 'react-native';
import { Card, Chip, Button, ProgressBar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { auth, firestore, storage, ADMIN_FILE_FUNCTION_BASE_URL } from '../firebase/config';
import { doc, getDoc, updateDoc, setDoc, collection, addDoc, deleteDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import * as DocumentPicker from 'expo-document-picker';
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import OJTChecklistGenerator from '../services/ojtChecklistGenerator';
import { colors, radii, shadows } from '../ui/theme';
import { Screen } from '../ui/components/Screen';

type RequirementsNavigationProp = StackNavigationProp<RootStackParamList, 'RequirementsChecklist'>;

interface Requirement {
    id: string;
    title: string;
    description: string;
    category: 'documents' | 'forms' | 'certifications' | 'other';
    status: 'pending' | 'completed' | 'overdue';
    approvalStatus?: 'pending_review' | 'approved' | 'rejected' | 'not_submitted';
    rejectionReason?: string;
    adviserNotes?: string;
    reviewedBy?: string;
    reviewedAt?: string;
    dueDate?: Date;
    uploadedFiles: Array<
        | string
        | { name: string; url?: string; path?: string; contentType?: string; uploadedAt?: string; providedByAdmin?: boolean }
        | { name: string; adminDocId: string; storedInFirestore: boolean; downloadUrl?: string; uploadedAt?: string }
    >;
    notes?: string;
    isRequired: boolean;
    adminProvided?: boolean;
}

const RequirementsChecklistScreen: React.FC = () => {
    const navigation = useNavigation<RequirementsNavigationProp>();
    const [requirements, setRequirements] = useState<Requirement[]>([]);
    const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    // Default to using Cloud Storage for requirement files to avoid Firestore size limits
    const [storeMode, setStoreMode] = useState<'storage' | 'firestore'>('storage');

    // Soft limit for base64 storing in Firestore (bytes)
    const FIRESTORE_MAX_BYTES = 700 * 1024; // ~700 KB

    // Firestore does not allow `undefined` anywhere in the payload (even nested).
    // This helper strips undefined values recursively so updateDoc/setDoc won't fail.
    const sanitizeForFirestore = (value: any): any => {
        if (Array.isArray(value)) {
            return value.map(sanitizeForFirestore);
        }
        if (value && typeof value === 'object') {
            const out: any = {};
            for (const [k, v] of Object.entries(value)) {
                if (v === undefined) continue;
                out[k] = sanitizeForFirestore(v);
            }
            return out;
        }
        return value;
    };

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

    // Auto-refresh when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            loadRequirements();
        }, [])
    );

    // Persist user's selected storage mode
    const setStoreModeAndPersist = async (mode: 'storage' | 'firestore') => {
        setStoreMode(mode);
        try { await AsyncStorage.setItem('REQUIREMENTS_STORE_MODE', mode); } catch (e) { /* ignore */ }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadRequirements();
        setRefreshing(false);
    };

    const loadRequirements = async () => {
        if (!auth.currentUser) return;

        try {
            const userDoc = await getDoc(doc(firestore, 'users', auth.currentUser.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                const savedRequirements = (data.requirements || []) as any[];

                const normalizeKey = (value: string) => String(value || '')
                    .toLowerCase()
                    .replace(/\([^)]*\)/g, '')
                    .replace(/[^a-z0-9]+/g, ' ')
                    .trim();

                const defaultReqs = getDefaultRequirements();

                const findMatch = (target: Requirement, existing: any[]): any | null => {
                    const t = normalizeKey(target.title);
                    const aliases: string[] = [];

                    // known legacy titles -> new titles
                    if (t.includes('notarized parental consent')) {
                        aliases.push(normalizeKey('Parent/Guardian Consent Form'));
                    }
                    if (t.includes('proof of insurance')) {
                        aliases.push(normalizeKey('Insurance Certificate'));
                    }
                    if (t.includes('curriculum vitae')) {
                        aliases.push(normalizeKey('Resume/CV'));
                    }
                    if (t.includes('memorandum of agreement') || t === 'moa') {
                        aliases.push(normalizeKey('MOA (Memorandum of Agreement)'));
                    }
                    if (t.includes('proof of enrollment')) {
                        aliases.push(normalizeKey('Academic Records'));
                    }

                    const candidates = [t, ...aliases];
                    for (const r of existing) {
                        const rt = normalizeKey(String(r?.title || ''));
                        if (!rt) continue;
                        if (candidates.includes(rt)) return r;
                        // allow partial match as last resort
                        if (rt.includes(t) || t.includes(rt)) return r;
                    }
                    return null;
                };

                // Migrate: replace the requirement list with the new one, carrying over existing uploads/status where possible.
                const mergedFromDefaults: Requirement[] = defaultReqs.map((d) => {
                    const match = findMatch(d, savedRequirements);
                    if (!match) return d;
                    const uploadedFiles = Array.isArray(match.uploadedFiles) ? match.uploadedFiles : [];
                    const status = match.status || (uploadedFiles.length > 0 ? 'completed' : 'pending');
                    
                    // Debug: log approval status for each requirement
                    console.log(`📋 Requirement: ${d.title}`);
                    console.log(`   Approval Status: ${match.approvalStatus || 'not set'}`);
                    console.log(`   Files: ${uploadedFiles.length}`);
                    
                    return {
                        ...d,
                        uploadedFiles,
                        status,
                        approvalStatus: match.approvalStatus,
                        rejectionReason: match.rejectionReason,
                        adviserNotes: match.adviserNotes,
                        reviewedBy: match.reviewedBy,
                        reviewedAt: match.reviewedAt,
                    } as Requirement;
                });

                // Pull admin-provided documents (MOA & OJT Orientation) from Help Desk templates
                const resolveTemplateUrl = async (t: any): Promise<string | null> => {
                    const possibleUrl = t?.url || t?.fileUrl || t?.downloadUrl || t?.downloadURL || t?.fileDownloadUrl;
                    if (possibleUrl) return String(possibleUrl);
                    const possiblePath = t?.path || t?.filePath || t?.storagePath || t?.file_path || t?.file_pathname;
                    if (possiblePath) {
                        try {
                            return await getDownloadURL(storageRef(storage, String(possiblePath)));
                        } catch (e) {
                            return null;
                        }
                    }
                    return null;
                };

                const helpDeskDocs: any[] = [];
                try {
                    const snap = await getDocs(query(collection(firestore, 'helpDeskFiles')));
                    snap.forEach((d: any) => helpDeskDocs.push({ id: d.id, ...(d.data() as any) }));
                } catch (e) {
                    console.warn('RequirementsChecklist: failed to load helpDeskFiles for admin-provided docs', e);
                }

                const pickTemplateForRequirement = (reqTitle: string): any | null => {
                    const titleKey = normalizeKey(reqTitle);
                    const keys: string[] = [];
                    if (titleKey.includes('memorandum of agreement')) keys.push('memorandum of agreement', 'moa');

                    for (const t of helpDeskDocs) {
                        const name = String(t?.fileName || t?.name || '').toLowerCase();
                        const desc = String(t?.description || '').toLowerCase();
                        const hay = `${name} ${desc}`;
                        if (keys.some(k => hay.includes(k))) return t;
                    }
                    return null;
                };

                const mergedWithAdminFiles: Requirement[] = [];
                for (const req of mergedFromDefaults) {
                    if (!req.adminProvided) {
                        mergedWithAdminFiles.push(req);
                        continue;
                    }

                    const template = pickTemplateForRequirement(req.title);
                    const url = template ? await resolveTemplateUrl(template) : null;

                    const existingUploads = Array.isArray(req.uploadedFiles) ? req.uploadedFiles : [];
                    // Keep any student uploads; ensure we don't duplicate the admin-provided entry on every refresh.
                    const studentUploads = existingUploads.filter((f: any) => !f?.providedByAdmin);

                    if (url) {
                        const name = String(template?.fileName || template?.name || req.title);
                        const adminEntry = { name, url, uploadedAt: template?.uploadedAt, providedByAdmin: true } as any;
                        mergedWithAdminFiles.push({
                            ...req,
                            uploadedFiles: [...studentUploads, adminEntry],
                        });
                    } else {
                        mergedWithAdminFiles.push({
                            ...req,
                            // Don't wipe existing uploads if template isn't available
                            uploadedFiles: studentUploads,
                        });
                    }
                }

                // Fetch approval statuses from requirement_approvals collection
                let approvalData: Record<string, any> = {};
                try {
                    // Get the user's approvals document (requirement_approvals/{userId} is a document)
                    const userApprovalsDoc = doc(firestore, 'requirement_approvals', auth.currentUser.uid);
                    const userApprovalsSnap = await getDoc(userApprovalsDoc);
                    
                    if (userApprovalsSnap.exists()) {
                        // The document contains all approvals as fields
                        const data = userApprovalsSnap.data();
                        approvalData = data || {};
                        console.log(`📋 Approvals loaded for user:`, approvalData);
                    } else {
                        console.log('📋 No approvals document found for user');
                    }
                } catch (e) {
                    console.warn('RequirementsChecklist: failed to load requirement_approvals', e);
                }

                // Merge approval statuses with requirements
                const mergedWithApprovals = mergedWithAdminFiles.map(req => {
                    const titleKey = normalizeKey(req.title);
                    const titleLower = req.title.toLowerCase();
                    console.log(`🔍 Checking requirement: "${req.title}" (normalized: "${titleKey}")`);
                    
                    let approval: any = null;
                    let matchedKey = '';
                    
                    // Check various matching strategies
                    for (const [key, value] of Object.entries(approvalData)) {
                        const normalizedKey = normalizeKey(key);
                        const keyLower = key.toLowerCase();
                        
                        // Strategy 1: Exact match
                        if (normalizedKey === titleKey || key === req.title) {
                            approval = value;
                            matchedKey = key;
                            console.log(`  ✅ EXACT MATCH for "${req.title}" with key "${key}"`);
                            break;
                        }
                        
                        // Strategy 2: Check if original approval key appears in title (case-insensitive)
                        // e.g., "COM" is in "Proof of Enrollment (COM)"
                        if (titleLower.includes(keyLower)) {
                            approval = value;
                            matchedKey = key;
                            console.log(`  ✅ CONTAINS MATCH: "${req.title}" contains "${key}"`);
                            break;
                        }
                        
                        // Strategy 3: Check normalized contains
                        if (titleKey.includes(normalizedKey)) {
                            approval = value;
                            matchedKey = key;
                            console.log(`  ✅ NORMALIZED CONTAINS: "${titleKey}" contains "${normalizedKey}"`);
                            break;
                        }
                        
                        // Strategy 3: Check if requirement title contains approval key words
                        // e.g., "Notarized Parental Consent" matches "Parent/Guardian Consent Form"
                        const keyWords = normalizedKey.split(' ').filter(w => w.length > 3);
                        const titleWords = titleKey.split(' ').filter(w => w.length > 3);
                        const commonWords = keyWords.filter(w => titleWords.includes(w));
                        
                        if (commonWords.length >= 2) {
                            approval = value;
                            matchedKey = key;
                            console.log(`  ✅ WORD MATCH for "${req.title}" with key "${key}" (common: ${commonWords.join(', ')})`);
                            break;
                        }
                    }
                    
                    if (approval) {
                        const status = approval.status as string;
                        let approvalStatus: 'pending_review' | 'approved' | 'rejected' | 'not_submitted' = 'pending_review';
                        
                        if (status === 'accepted' || status === 'approved') {
                            approvalStatus = 'approved';
                        } else if (status === 'denied' || status === 'rejected') {
                            approvalStatus = 'rejected';
                        }
                        
                        console.log(`✅ Setting approvalStatus for ${req.title}: ${approvalStatus} (original status: ${status}, matched with: ${matchedKey})`);
                        
                        return {
                            ...req,
                            approvalStatus,
                            rejectionReason: (approval.reason as string) || req.rejectionReason,
                            adviserNotes: (approval.notes as string) || req.adviserNotes,
                            reviewedBy: (approval.reviewedBy as string) || req.reviewedBy,
                            reviewedAt: (approval.reviewedAt as string) || req.reviewedAt,
                        };
                    }
                    
                    console.log(`  ❌ No approval found for "${req.title}"`);
                    return req;
                });

                // Normalize statuses: if there are no uploadedFiles, ensure status is 'pending'
                const normalized = mergedWithApprovals.map(r => {
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

                // Persist migrated list back to the user doc (best-effort)
                try {
                    const currentTitles = (savedRequirements || []).map((r: any) => String(r?.title || '')).filter(Boolean);
                    const desiredTitles = getDefaultRequirements().map(r => r.title);
                    const titleMismatch = currentTitles.length !== desiredTitles.length || currentTitles.some((t: string) => !desiredTitles.includes(t));
                    if (titleMismatch) {
                        await setDoc(doc(firestore, 'users', auth.currentUser.uid), { requirements: normalized }, { merge: true });
                    }
                } catch (e) {
                    console.warn('RequirementsChecklist: failed to persist migrated requirements list', e);
                }

                // Auto-transition to hired when all REQUIRED requirements are approved.
                // Minimal rule: if user has appliedCompanyName (and no finalized company yet), mark hired.
                try {
                    const required = (normalized as any[]).filter((r: any) => r.isRequired !== false);
                    const allRequiredApproved = required.length > 0 && required.every((req: any) =>
                        req.approvalStatus === 'approved' &&
                        Array.isArray(req.uploadedFiles) && req.uploadedFiles.length > 0
                    );

                    // Auto-generate OJT Completion Checklist once all required requirements are approved.
                    // This is independent of the "hired" transition.
                    try {
                        const latestReviewedAtMs = Math.max(
                            0,
                            ...required.map((r: any) => {
                                const v = r.reviewedAt;
                                const ms = typeof v === 'string' ? Date.parse(v) : NaN;
                                return Number.isFinite(ms) ? ms : 0;
                            })
                        );

                        const existing = (data as any)?.generatedDocuments?.ojtCompletionChecklist;
                        const existingSourceMs = existing?.sourceReviewedAtMs;

                        const shouldGenerateChecklist =
                            allRequiredApproved &&
                            (!existing?.url || !existing?.path || !existingSourceMs || (latestReviewedAtMs && latestReviewedAtMs > existingSourceMs));

                        if (shouldGenerateChecklist) {
                            await generateOJTChecklistOnApproval(data, normalized as any, {
                                sourceReviewedAtMs: latestReviewedAtMs || Date.now(),
                            });
                        }
                    } catch (checklistErr) {
                        console.warn('RequirementsChecklist: failed to generate OJT Completion Checklist', checklistErr);
                    }

                    const alreadyHired = data.status === 'hired';
                    const hasFinalCompany = Boolean(data.company);
                    const appliedCompanyName = data.appliedCompanyName;

                    if (allRequiredApproved && !alreadyHired && !hasFinalCompany && appliedCompanyName) {
                        await setDoc(doc(firestore, 'users', auth.currentUser.uid), {
                            status: 'hired',
                            company: appliedCompanyName,
                            hiredAt: serverTimestamp(),
                            lastUpdated: serverTimestamp(),
                            appliedCompanyId: null,
                            appliedCompanyName: null,
                        }, { merge: true });

                        // Best-effort: mark their application doc as approved (if it exists)
                        try {
                            if (data.appliedCompanyId) {
                                await setDoc(doc(firestore, 'applications', `${auth.currentUser.uid}_${data.appliedCompanyId}`), {
                                    status: 'approved',
                                    approvedAt: serverTimestamp(),
                                }, { merge: true });
                            }
                        } catch (appErr) {
                            console.warn('RequirementsChecklist: failed to update application status to approved', appErr);
                        }

                    }
                } catch (e) {
                    console.warn('RequirementsChecklist: auto-hired check failed', e);
                }
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
            title: 'Proof of Enrollment (COM)',
            description: 'Certificate of Matriculation / proof of enrollment',
            category: 'documents',
            status: 'pending',
            uploadedFiles: [],
            isRequired: true,
        },
        {
            id: '2',
            title: 'Notarized Parental Consent',
            description: 'Notarized consent from parent or guardian',
            category: 'forms',
            status: 'pending',
            uploadedFiles: [],
            isRequired: true,
        },
        {
            id: '3',
            title: 'Medical Certificate',
            description: 'Medical clearance from a licensed physician',
            category: 'certifications',
            status: 'pending',
            uploadedFiles: [],
            isRequired: true,
        },
        {
            id: '4',
            title: 'Psychological Test Certification',
            description: 'Psychological test certification (if required)',
            category: 'certifications',
            status: 'pending',
            uploadedFiles: [],
            isRequired: true,
        },
        {
            id: '5',
            title: 'Proof of Insurance',
            description: 'Student insurance coverage proof/certificate',
            category: 'certifications',
            status: 'pending',
            uploadedFiles: [],
            isRequired: true,
        },
        {
            id: '7',
            title: 'Memorandum of Agreement',
            description: 'MOA document provided by the school/administrator',
            category: 'documents',
            status: 'pending',
            uploadedFiles: [],
            isRequired: true,
            adminProvided: true,
        },
        {
            id: '8',
            title: 'Curriculum Vitae',
            description: 'Updated resume / CV',
            category: 'documents',
            status: 'pending',
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
                    requirements: sanitizeForFirestore(updatedRequirements),
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
            // Find the requirement title and create a folder from it
            const requirement = requirements.find(r => r.id === requirementId);
            const folderName = requirement?.title
                ? requirement.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                : 'unknown';
            const remotePath = `requirements/${auth.currentUser?.uid}/${folderName}/${name}`;
            const sRef = storageRef(storage, remotePath);
            await uploadBytes(sRef, blob, { contentType: fileAny.mimeType || fileAny.type || 'application/octet-stream' });
            const downloadURL = await getDownloadURL(sRef);

            const fileMeta = { name, url: downloadURL, path: remotePath, contentType: fileAny.mimeType || fileAny.type || 'application/octet-stream', uploadedAt: new Date().toISOString() } as any;

            // add admin_files doc and attach its id to the returned metadata
            try {
                const adminDocRef = await addDoc(collection(firestore, 'admin_files'), {
                    userId: auth.currentUser?.uid,
                    requirementId,
                    requirementTitle: requirement?.title || null,
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
                            ? { 
                                ...req, 
                                uploadedFiles: [...req.uploadedFiles, uploadedEntry], 
                                status: 'completed' as 'completed',
                                approvalStatus: 'pending_review' as 'pending_review'
                            }
                            : req
                    );

                    setRequirements(updatedRequirements);
                    if (auth.currentUser) {
                        try {
                            console.log('handleUploadFile: updating user requirements (firestore-only) for', auth.currentUser.uid);
                            await updateDoc(doc(firestore, 'users', auth.currentUser.uid), {
                                requirements: sanitizeForFirestore(updatedRequirements),
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
                            ? { 
                                ...req, 
                                uploadedFiles: [...req.uploadedFiles, uploadedEntry], 
                                status: 'completed' as 'completed',
                                approvalStatus: 'pending_review' as 'pending_review'
                            }
                            : req
                    );

                    setRequirements(updatedRequirements);

                    if (auth.currentUser) {
                        try {
                            console.log('handleUploadFile: updating user requirements (storage) for', auth.currentUser.uid);
                            await updateDoc(doc(firestore, 'users', auth.currentUser.uid), {
                                requirements: sanitizeForFirestore(updatedRequirements),
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
            case 'completed': return colors.success;
            case 'overdue': return colors.danger;
            case 'pending': return colors.warning;
            default: return colors.textSubtle;
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

    const generateOJTChecklistOnApproval = async (
        userData: any,
        reqs: Requirement[],
        options?: { sourceReviewedAtMs?: number }
    ) => {
        try {
            const resolveSignatureUrl = async (value: any): Promise<string | undefined> => {
                const candidate = typeof value === 'string' ? value.trim() : '';
                if (!candidate) return undefined;

                // Already a usable URL/data URI
                if (/^(https?:\/\/|data:)/i.test(candidate)) return candidate;

                // Treat as Firebase Storage path or gs:// URL
                try {
                    return await getDownloadURL(storageRef(storage, candidate));
                } catch (e) {
                    console.warn('Failed to resolve signature download URL:', candidate, e);
                    return undefined;
                }
            };

            const embedImageAsDataUriIfNeeded = async (url?: string): Promise<string | undefined> => {
                if (!url) return undefined;
                const candidate = String(url).trim();
                if (!candidate) return undefined;

                // Already embedded
                if (/^data:/i.test(candidate)) return candidate;

                // For expo-print reliability, embed remote images as base64
                if (/^https?:\/\//i.test(candidate)) {
                    try {
                        const lower = candidate.toLowerCase();
                        const extMatch = lower.match(/\.(png|jpe?g|webp)(?:\?|$)/);
                        const ext = extMatch ? extMatch[1] : 'png';
                        const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'webp' ? 'image/webp' : 'image/png';

                        const localPath = `${FileSystem.cacheDirectory}sig_${Date.now()}.${ext}`;
                        const dl = await FileSystem.downloadAsync(candidate, localPath);
                        if ((dl as any)?.status && (dl as any).status !== 200) {
                            console.warn('Signature download returned non-200:', (dl as any).status);
                            return candidate;
                        }

                        const base64 = await FileSystem.readAsStringAsync(dl.uri, { encoding: FileSystem.EncodingType.Base64 });
                        return `data:${mime};base64,${base64}`;
                    } catch (e) {
                        console.warn('Failed to embed signature image as data URI:', e);
                        return candidate;
                    }
                }

                return candidate;
            };

            // Fetch coordinator and adviser profiles for signatures
            let coordinatorName = 'OJT Coordinator';
            let coordinatorSignatureUrl: string | undefined;
            let adviserName = 'OJT Adviser';
            let adviserSignatureUrl: string | undefined;

            try {
                // Look for coordinator (admin)
                const adminSnap = await getDocs(query(collection(firestore, 'users'), where('role', '==', 'admin')));
                for (const adminDocSnap of adminSnap.docs) {
                    const admin = adminDocSnap.data();
                    if (admin.role === 'admin') {
                        coordinatorName = admin.fullName || admin.name || 'OJT Coordinator';
                        
                        // Try to fetch signature from teacher_signatures collection first
                        try {
                            const sigDoc = await getDoc(doc(firestore, 'teacher_signatures', adminDocSnap.id));
                            if (sigDoc.exists()) {
                                const sigData: any = sigDoc.data();
                                coordinatorSignatureUrl = await resolveSignatureUrl(sigData.downloadUrl || sigData.storagePath);
                            }
                        } catch (e) {
                            console.warn('No signature in teacher_signatures for coordinator:', e);
                        }
                        
                        // Fallback to user document signature
                        if (!coordinatorSignatureUrl) {
                            coordinatorSignatureUrl = await resolveSignatureUrl(admin.signatureUrl || admin.signature || admin.signaturePath);
                        }
                        break;
                    }
                }

                // Check if student has a specific adviser assigned
                if (userData.adviserId) {
                    try {
                        const adviserDoc = await getDoc(doc(firestore, 'users', userData.adviserId));
                        if (adviserDoc.exists()) {
                            const adviser = adviserDoc.data();
                            adviserName = adviser.fullName || adviser.name || 'OJT Adviser';
                            
                            // Try to fetch signature from teacher_signatures collection first
                            try {
                                const sigDoc = await getDoc(doc(firestore, 'teacher_signatures', userData.adviserId));
                                if (sigDoc.exists()) {
                                    const sigData: any = sigDoc.data();
                                    adviserSignatureUrl = await resolveSignatureUrl(sigData.downloadUrl || sigData.storagePath);
                                }
                            } catch (e) {
                                console.warn('No signature in teacher_signatures for adviser:', e);
                            }
                            
                            // Fallback to user document signature
                            if (!adviserSignatureUrl) {
                                adviserSignatureUrl = await resolveSignatureUrl(adviser.signatureUrl || adviser.signature || adviser.signaturePath);
                            }

                            // Ensure the signature is embeddable in the generated PDF
                            adviserSignatureUrl = await embedImageAsDataUriIfNeeded(adviserSignatureUrl);
                        }
                    } catch (e) {
                        console.warn('Failed to fetch assigned adviser:', e);
                    }
                } else {
                    // Fall back to finding any super_admin
                    const adviserSnap = await getDocs(query(collection(firestore, 'users'), where('role', '==', 'super_admin')));
                    for (const docSnap of adviserSnap.docs) {
                        const adviser = docSnap.data();
                        if (adviser.role === 'super_admin') {
                            adviserName = adviser.fullName || adviser.name || 'OJT Adviser';
                            
                            // Try to fetch signature from teacher_signatures collection first
                            try {
                                const sigDoc = await getDoc(doc(firestore, 'teacher_signatures', docSnap.id));
                                if (sigDoc.exists()) {
                                    const sigData: any = sigDoc.data();
                                    adviserSignatureUrl = await resolveSignatureUrl(sigData.downloadUrl || sigData.storagePath);
                                }
                            } catch (e) {
                                console.warn('No signature in teacher_signatures for super_admin:', e);
                            }
                            
                            // Fallback to user document signature
                            if (!adviserSignatureUrl) {
                                adviserSignatureUrl = await resolveSignatureUrl(adviser.signatureUrl || adviser.signature || adviser.signaturePath);
                            }

                            // Ensure the signature is embeddable in the generated PDF
                            adviserSignatureUrl = await embedImageAsDataUriIfNeeded(adviserSignatureUrl);
                            break;
                        }
                    }
                }
            } catch (e) {
                console.warn('Failed to fetch coordinator/adviser signatures:', e);
            }

            // Prepare checklist data
            const checklistData = {
                studentName: userData.fullName || userData.name || 'Student',
                studentId: userData.studentId || '',
                program: userData.program || userData.course || userData.department || '',
                section: userData.section || '',
                studentEmail: userData.email || auth.currentUser?.email || '',
                contactNumber: userData.contact || userData.contactNumber || userData.phone || '',
                adviserName,
                adviserSignatureUrl,
                companyName: userData.company || userData.appliedCompanyName || '',
                companyContactPerson: userData.companyContactPerson || '',
                companyJobTitle: userData.companyJobTitle || userData.jobTitle || '',
                companyEmail: userData.companyEmail || '',
                companyAddress: userData.companyAddress || '',
                startDate: userData.ojt?.startDate || '',
                endDate: userData.ojt?.endDate || '',
                completedDate: new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                }),
                requirements: reqs.map(r => {
                    const status = (r.approvalStatus === 'approved' ? 'approved' : r.approvalStatus === 'rejected' ? 'rejected' : 'pending') as 'pending' | 'approved' | 'rejected';
                    const dateCompleted = r.reviewedAt ? new Date(r.reviewedAt).toLocaleDateString() : '';
                    const remarks = (r.approvalStatus === 'rejected' && r.rejectionReason) ? r.rejectionReason : (r.adviserNotes || '');
                    return {
                        title: r.title,
                        status,
                        dateCompleted,
                        remarks,
                    };
                }),
            };

            // Generate PDF
            const pdfUri = await OJTChecklistGenerator.generateOJTChecklistPDF(checklistData);

            // Upload the generated PDF to Cloud Storage so it can be downloaded later (Resources screen)
            let uploadedUrl: string | undefined;
            let uploadedPath: string | undefined;
            try {
                if (!auth.currentUser) throw new Error('No authenticated user');
                const blob = await uriToBlob(pdfUri);
                const filename = `ojt_completion_checklist_${Date.now()}.pdf`;
                const remotePath = `generatedDocuments/${auth.currentUser.uid}/${filename}`;
                const sRef = storageRef(storage, remotePath);
                await uploadBytes(sRef, blob, { contentType: 'application/pdf' });
                uploadedUrl = await getDownloadURL(sRef);
                uploadedPath = remotePath;
            } catch (uploadErr) {
                console.warn('OJT Checklist generated, but upload failed:', uploadErr);
            }

            // Store in Firestore
            if (auth.currentUser) {
                await setDoc(doc(firestore, 'users', auth.currentUser.uid), {
                    generatedDocuments: {
                        ojtCompletionChecklist: {
                            title: 'OJT Completion Checklist',
                            url: uploadedUrl || null,
                            path: uploadedPath || null,
                            generatedAt: serverTimestamp(),
                            sourceReviewedAtMs: options?.sourceReviewedAtMs || Date.now(),
                            studentName: checklistData.studentName,
                            companyName: checklistData.companyName,
                        }
                    }
                }, { merge: true });

                console.log('OJT Completion Checklist generated and saved:', uploadedUrl || pdfUri);
            }
        } catch (error) {
            console.error('Error generating OJT Checklist:', error);
        }
    };

    const removeUploadedFile = async (requirementId: string, fileAny: any, index: number) => {
        if (fileAny && fileAny.providedByAdmin) {
            Alert.alert('Not allowed', 'This file is provided by the admin/super admin and cannot be removed.');
            return;
        }
        Alert.alert('Remove file', 'Are you sure you want to remove this uploaded file?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: async () => {
                    try {
                        // Delete from Storage first (if path exists)
                        if (fileAny && fileAny.path) {
                            try {
                                const sRef = storageRef(storage, fileAny.path);
                                const storageModule: any = await import('firebase/storage');
                                const deleteObjectFn = storageModule.deleteObject;
                                if (deleteObjectFn) {
                                    await deleteObjectFn(sRef);
                                } else {
                                    console.warn('deleteObject not available in storage module');
                                }
                            } catch (e) {
                                console.error('Failed to delete storage object:', e);
                                // Write diagnostic to user doc if permission error
                                const errCode = typeof e === 'object' && e && 'code' in e ? (e as any).code : undefined;
                                if (errCode === 'storage/unauthorized' || errCode === 'storage/unknown') {
                                    try {
                                        if (auth.currentUser) {
                                            await setDoc(doc(firestore, 'users', auth.currentUser.uid), { lastStorageDeleteError: { time: new Date().toISOString(), message: String(e) } }, { merge: true });
                                        }
                                    } catch (dbg) { console.error('Failed to write storage delete diagnostic:', dbg); }
                                }
                            }
                        }

                        // Delete admin_files doc (by adminDocId or by path)
                        if (fileAny && fileAny.adminDocId) {
                            try {
                                await deleteDoc(doc(firestore, 'admin_files', fileAny.adminDocId));
                            } catch (e) {
                                console.error('Failed to delete admin_files doc:', e);
                                const errCode = typeof e === 'object' && e && 'code' in e ? (e as any).code : undefined;
                                if (errCode === 'permission-denied') {
                                    try {
                                        if (auth.currentUser) {
                                            await setDoc(doc(firestore, 'users', auth.currentUser.uid), { lastAdminFilesDeleteError: { time: new Date().toISOString(), message: String(e) } }, { merge: true });
                                        }
                                    } catch (dbg) { console.error('Failed to write admin_files delete diagnostic:', dbg); }
                                }
                            }
                        } else if (fileAny && fileAny.path) {
                            try {
                                const q = query(collection(firestore, 'admin_files'), where('path', '==', fileAny.path));
                                const snap = await getDocs(q);
                                for (const d of snap.docs) {
                                    try { await deleteDoc(d.ref); } catch (ee) {
                                        console.error('Failed to delete admin_files by path:', ee);
                                        const errCode = typeof ee === 'object' && ee && 'code' in ee ? (ee as any).code : undefined;
                                        if (errCode === 'permission-denied') {
                                            try {
                                                if (auth.currentUser) {
                                                    await setDoc(doc(firestore, 'users', auth.currentUser.uid), { lastAdminFilesDeleteError: { time: new Date().toISOString(), message: String(ee) } }, { merge: true });
                                                }
                                            } catch (dbg) { console.error('Failed to write admin_files delete diagnostic:', dbg); }
                                        }
                                    }
                                }
                            } catch (e) {
                                console.error('Failed to query/delete admin_files by path:', e);
                                const errCode = typeof e === 'object' && e && 'code' in e ? (e as any).code : undefined;
                                if (errCode === 'permission-denied') {
                                    try {
                                        if (auth.currentUser) {
                                            await setDoc(doc(firestore, 'users', auth.currentUser.uid), { lastAdminFilesDeleteError: { time: new Date().toISOString(), message: String(e) } }, { merge: true });
                                        }
                                    } catch (dbg) { console.error('Failed to write admin_files delete diagnostic:', dbg); }
                                }
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
                        calculateProgress(updatedRequirements);

                        if (auth.currentUser) {
                            try {
                                await updateDoc(doc(firestore, 'users', auth.currentUser.uid), {
                                    requirements: sanitizeForFirestore(updatedRequirements),
                                });
                            } catch (e: any) {
                                console.error('Failed to update user doc after file removal:', e);
                                Alert.alert('Save error', `Failed to update your requirements in Firestore: ${e?.message || String(e)}`);
                                try {
                                    await setDoc(doc(firestore, 'users', auth.currentUser.uid), { lastRequirementsSyncError: { time: new Date().toISOString(), message: e?.message || String(e) } }, { merge: true });
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
        <Screen contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 0 }}>

            {/* Header */}
            <View style={styles.headerWrap}>
                <View style={styles.headerInner}>
                    <View style={styles.headerAccent} />
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.onPrimary} />
                    </TouchableOpacity>
                    <View style={{ flex: 1, paddingLeft: 8 }}>
                        <Text style={styles.headerKicker}>OJT</Text>
                        <Text style={styles.headerTitle}>Requirements Checklist</Text>
                        <Text style={styles.headerSubtitle}>Upload files, track approvals, and generate your completion checklist.</Text>
                    </View>
                </View>
            </View>

            <ScrollView 
                style={styles.scrollView} 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
            >
                {/* Progress Section */}
                <Card style={styles.progressCard}>
                    <Card.Content>
                        <View style={styles.progressHeader}>
                            <Text style={styles.progressTitle}>Overall Progress</Text>
                            <Text style={styles.progressPercentage}>{Math.round(progress * 100)}%</Text>
                        </View>
                        <ProgressBar
                            progress={progress}
                            color={colors.success}
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
                                            color={colors.textMuted}
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
                                                        <Ionicons name="document" size={16} color={colors.primary} />
                                                        <Text style={styles.fileName}>{displayName}</Text>
                                                    </TouchableOpacity>
                                                    {!fileAny?.providedByAdmin ? (
                                                        <TouchableOpacity onPress={() => removeUploadedFile(requirement.id, fileAny, index)} style={styles.deleteButton}>
                                                            <Ionicons name="trash" size={18} color={colors.danger} />
                                                        </TouchableOpacity>
                                                    ) : null}
                                                </View>
                                            );
                                        })}
                                    </View>
                                )}

                                {/* Approval Status Badge */}
                                {requirement.uploadedFiles.length > 0 && (
                                    <View style={styles.approvalStatusContainer}>
                                        {requirement.approvalStatus === 'approved' && (
                                            <View style={[styles.approvalBadge, { backgroundColor: colors.success }]}>
                                                <Ionicons name="checkmark-circle" size={16} color={colors.onPrimary} />
                                                <Text style={styles.approvalBadgeText}>Approved</Text>
                                            </View>
                                        )}
                                        {requirement.approvalStatus === 'pending_review' && (
                                            <View style={[styles.approvalBadge, { backgroundColor: colors.warning }]}>
                                                <Ionicons name="time" size={16} color={colors.onPrimary} />
                                                <Text style={styles.approvalBadgeText}>Pending Review</Text>
                                            </View>
                                        )}
                                        {requirement.approvalStatus === 'rejected' && (
                                            <View style={[styles.approvalBadge, { backgroundColor: colors.danger }]}>
                                                <Ionicons name="close-circle" size={16} color={colors.onPrimary} />
                                                <Text style={styles.approvalBadgeText}>Rejected</Text>
                                            </View>
                                        )}
                                    </View>
                                )}

                                {/* Rejection Reason */}
                                {requirement.approvalStatus === 'rejected' && requirement.rejectionReason && (
                                    <View style={styles.rejectionReasonContainer}>
                                        <Text style={styles.rejectionReasonLabel}>Reason for rejection:</Text>
                                        <Text style={styles.rejectionReasonText}>{requirement.rejectionReason}</Text>
                                    </View>
                                )}

                                {/* Adviser Notes */}
                                {requirement.adviserNotes && (
                                    <View style={styles.adviserNotesContainer}>
                                        <View style={styles.adviserNotesHeader}>
                                            <Ionicons name="chatbox-ellipses" size={16} color={colors.info} />
                                            <Text style={styles.adviserNotesLabel}>
                                                {requirement.reviewedBy ? `Message from ${requirement.reviewedBy}` : 'Adviser Notes'}
                                            </Text>
                                        </View>
                                        <Text style={styles.adviserNotesText}>{requirement.adviserNotes}</Text>
                                        {requirement.reviewedAt && (
                                            <Text style={styles.adviserNotesDate}>
                                                {new Date(requirement.reviewedAt).toLocaleString()}
                                            </Text>
                                        )}
                                    </View>
                                )}

                                <View style={styles.actionButtons}>
                                    {requirement.uploadedFiles.length > 0 && (!requirement.adminProvided || requirement.uploadedFiles.some((f: any) => !f?.providedByAdmin)) ? (
                                        <View style={styles.doneIndicator}>
                                            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                                            <Text style={styles.doneText}>
                                                {requirement.approvalStatus === 'approved' ? 'Approved' : 'Submitted'}
                                            </Text>
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            style={styles.uploadButton}
                                            onPress={() => {
                                                setSelectedRequirement(requirement);
                                                setShowUploadModal(true);
                                            }}
                                        >
                                            <Ionicons name="cloud-upload" size={16} color={colors.primary} />
                                            <Text style={styles.uploadButtonText}>
                                                {requirement.adminProvided && requirement.uploadedFiles.some((f: any) => f?.providedByAdmin) 
                                                    ? 'Upload Your Copy' 
                                                    : requirement.adminProvided 
                                                    ? 'Upload File (Ask Coordinator)' 
                                                    : 'Upload File'}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        </Card.Content>
                    </Card>
                ))}

                {/* Spacer for bottom nav */}
                <View style={{ height: 24 }} />
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
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            {selectedRequirement && (
                                <>
                                    <Text style={styles.modalSubtitle}>{selectedRequirement.title}</Text>
                                    <Text style={styles.modalDescription}>{selectedRequirement.description}</Text>

                                    <View style={styles.uploadSection}>
                                        <Ionicons name="cloud-upload-outline" size={48} color={colors.primary} />
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
        </Screen>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    headerWrap: { backgroundColor: 'transparent' },
    headerInner: {
        minHeight: 150,
        backgroundColor: colors.primaryDark,
        borderBottomRightRadius: 70,
        paddingLeft: 18,
        paddingRight: 16,
        paddingTop: 44,
        paddingBottom: 18,
        flexDirection: 'row',
        alignItems: 'flex-start',
        overflow: 'hidden',
    },
    headerAccent: {
        position: 'absolute',
        right: -18,
        top: -22,
        width: 130,
        height: 130,
        backgroundColor: colors.primarySoft,
        borderRadius: 80,
        transform: [{ rotate: '18deg' }],
    },
    backButton: {
        padding: 8,
    },
    headerKicker: {
        color: colors.onPrimaryMuted,
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1.2,
        marginBottom: 6,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: colors.onPrimary,
    },
    headerSubtitle: {
        marginTop: 8,
        color: colors.onPrimaryMuted,
        fontSize: 13,
        lineHeight: 18,
        maxWidth: '92%',
    },
    scrollView: {
        flex: 1,
        padding: 16,
    },
    progressCard: {
        marginBottom: 16,
        borderRadius: radii.lg,
        backgroundColor: colors.surface,
        ...shadows.card,
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
        color: colors.text,
    },
    progressPercentage: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.success,
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        marginBottom: 8,
    },
    progressSubtext: {
        fontSize: 14,
        color: colors.textMuted,
    },
    requirementCard: {
        marginBottom: 16,
        borderRadius: radii.lg,
        backgroundColor: colors.surface,
        ...shadows.card,
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
        color: colors.text,
        flex: 1,
    },
    requiredChip: {
        height: 20,
        marginLeft: 8,
    },
    requirementDescription: {
        fontSize: 14,
        color: colors.textMuted,
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
        color: colors.textMuted,
        marginLeft: 6,
    },
    overdueText: {
        color: colors.danger,
        fontWeight: '600',
    },
    uploadedFilesContainer: {
        marginBottom: 12,
    },
    uploadedFilesTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
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
        color: colors.primary,
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
        borderColor: colors.success,
        backgroundColor: 'transparent',
    },
    completedButton: {
        backgroundColor: colors.success,
    },
    statusButtonText: {
        fontSize: 14,
        color: colors.success,
        marginLeft: 4,
        fontWeight: '500',
    },
    completedButtonText: {
        color: colors.onPrimary,
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surfaceAlt,
    },
    uploadButtonText: {
        fontSize: 14,
        color: colors.text,
        marginLeft: 4,
        fontWeight: '500',
    },
    approvalStatusContainer: {
        marginTop: 8,
        marginBottom: 4,
    },
    approvalBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        alignSelf: 'flex-start',
        gap: 4,
    },
    approvalBadgeText: {
        color: colors.onPrimary,
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 4,
    },
    rejectionReasonContainer: {
        marginTop: 8,
        padding: 10,
        backgroundColor: colors.dangerSoft,
        borderRadius: 6,
        borderLeftWidth: 3,
        borderLeftColor: colors.danger,
    },
    rejectionReasonLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.danger,
        marginBottom: 4,
    },
    rejectionReasonText: {
        fontSize: 13,
        color: colors.text,
        fontStyle: 'italic',
    },
    adviserNotesContainer: {
        marginTop: 8,
        padding: 12,
        backgroundColor: colors.infoSoft,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: colors.info,
    },
    adviserNotesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        gap: 6,
    },
    adviserNotesLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.info,
    },
    adviserNotesText: {
        fontSize: 14,
        color: colors.text,
        lineHeight: 20,
    },
    adviserNotesDate: {
        fontSize: 11,
        color: colors.textMuted,
        marginTop: 6,
        fontStyle: 'italic',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: colors.surface,
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
        borderBottomColor: colors.border,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
    },
    modalBody: {
        padding: 20,
    },
    modalSubtitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },
    modalDescription: {
        fontSize: 14,
        color: colors.textMuted,
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
        color: colors.text,
        marginTop: 12,
        marginBottom: 4,
    },
    uploadSubtext: {
        fontSize: 14,
        color: colors.textMuted,
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
        color: colors.success,
        fontWeight: 'bold',
        fontSize: 15,
        marginLeft: 4,
    },
});

export default RequirementsChecklistScreen; 