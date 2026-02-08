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
import { colors, radii, shadows, spacing } from '../ui/theme';
import { Screen } from '../ui/components/Screen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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
    const [filter, setFilter] = useState<'all' | 'required' | 'completed' | 'pending'>('all');
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

    const filteredRequirements = requirements.filter((r) => {
        if (filter === 'required') return r.isRequired;
        if (filter === 'completed') return r.status === 'completed';
        if (filter === 'pending') return r.status !== 'completed';
        return true;
    });

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

                    // known legacy titles -> new titles (exact mappings only)
                    if (t.includes('notarized parental consent')) {
                        aliases.push(normalizeKey('Parent/Guardian Consent Form'));
                    }
                    if (t.includes('proof of insurance') && !t.includes('enrollment')) {
                        // Explicitly exclude "proof of enrollment" from matching "proof of insurance"
                        aliases.push(normalizeKey('Insurance Certificate'));
                    }
                    if (t.includes('curriculum vitae')) {
                        aliases.push(normalizeKey('Resume/CV'));
                    }
                    if (t.includes('memorandum of agreement') || t === 'moa') {
                        aliases.push(normalizeKey('MOA (Memorandum of Agreement)'));
                    }
                    if (t.includes('proof of enrollment') && !t.includes('insurance')) {
                        // Explicitly exclude "proof of insurance" from matching "proof of enrollment"
                        aliases.push(normalizeKey('Academic Records'));
                    }

                    const candidates = [t, ...aliases];
                    
                    // First pass: exact matches only
                    for (const r of existing) {
                        const rt = normalizeKey(String(r?.title || ''));
                        if (!rt) continue;
                        // Exact match or known alias match
                        if (candidates.includes(rt)) {
                            return r;
                        }
                    }
                    
                    // Second pass: strict partial matching (only if both contain significant unique words)
                    // This prevents "COM" from matching "Insurance" incorrectly
                    const targetWords = t.split(' ').filter(w => w.length > 3); // Only words > 3 chars
                    const targetUniqueWords = targetWords.filter(w => 
                        !['proof', 'of', 'certificate', 'certification', 'form', 'document'].includes(w)
                    );
                    
                    for (const r of existing) {
                        const rt = normalizeKey(String(r?.title || ''));
                        if (!rt) continue;
                        
                        // Skip if already tried exact match
                        if (candidates.includes(rt)) continue;
                        
                        const existingWords = rt.split(' ').filter(w => w.length > 3);
                        const existingUniqueWords = existingWords.filter(w => 
                            !['proof', 'of', 'certificate', 'certification', 'form', 'document'].includes(w)
                        );
                        
                        // Require at least 2 unique matching words (not common words like "proof", "of")
                        const matchingUniqueWords = targetUniqueWords.filter(w => existingUniqueWords.includes(w));
                        
                        // Special case: prevent "COM" from matching "Insurance"
                        const hasCom = t.includes('com') || rt.includes('com');
                        const hasInsurance = t.includes('insurance') || rt.includes('insurance');
                        if (hasCom && hasInsurance) {
                            // Both mention COM and Insurance - likely different requirements
                            continue;
                        }
                        
                        // Only match if we have significant unique word overlap (at least 2 words)
                        if (matchingUniqueWords.length >= 2) {
                            return r;
                        }
                    }
                    
                    return null;
                };

                // Migrate: replace the requirement list with the new one, carrying over existing uploads/status where possible.
                const mergedFromDefaults: Requirement[] = defaultReqs.map((d) => {
                    const match = findMatch(d, savedRequirements);
                    if (!match) {
                        return d;
                    }
                    
                    const uploadedFiles = Array.isArray(match.uploadedFiles) ? match.uploadedFiles : [];
                    const status = match.status || (uploadedFiles.length > 0 ? 'completed' : 'pending');
                    
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
                    // Silent error handling
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
                    }
                } catch (e) {
                    // Silent error handling
                }

                // Merge approval statuses with requirements
                const mergedWithApprovals = mergedWithAdminFiles.map(req => {
                    const titleKey = normalizeKey(req.title);
                    const titleLower = req.title.toLowerCase();
                    
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
                            break;
                        }
                        
                        // Strategy 2: Check if original approval key appears in title (case-insensitive)
                        // e.g., "COM" is in "Proof of Enrollment (COM)"
                        if (titleLower.includes(keyLower)) {
                            approval = value;
                            matchedKey = key;
                            break;
                        }
                        
                        // Strategy 3: Check normalized contains
                        if (titleKey.includes(normalizedKey)) {
                            approval = value;
                            matchedKey = key;
                            break;
                        }
                        
                        // Strategy 4: Check if requirement title contains approval key words
                        // e.g., "Notarized Parental Consent" matches "Parent/Guardian Consent Form"
                        const keyWords = normalizedKey.split(' ').filter(w => w.length > 3);
                        const titleWords = titleKey.split(' ').filter(w => w.length > 3);
                        const commonWords = keyWords.filter(w => titleWords.includes(w));
                        
                        if (commonWords.length >= 2) {
                            approval = value;
                            matchedKey = key;
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
                        
                        // If requirement is rejected, clear uploaded files so student can re-upload
                        const shouldClearFiles = approvalStatus === 'rejected';
                        const uploadedFiles = shouldClearFiles ? [] : req.uploadedFiles;
                        const requirementStatus = shouldClearFiles ? 'pending' : req.status;
                        
                        return {
                            ...req,
                            approvalStatus,
                            uploadedFiles,
                            status: requirementStatus,
                            rejectionReason: (approval.reason as string) || req.rejectionReason,
                            adviserNotes: (approval.notes as string) || req.adviserNotes,
                            reviewedBy: (approval.reviewedBy as string) || req.reviewedBy,
                            reviewedAt: (approval.reviewedAt as string) || req.reviewedAt,
                        };
                    }
                    
                    return req;
                });

                // Normalize statuses: if there are no uploadedFiles, ensure status is 'pending'
                let normalized = mergedWithApprovals.map(r => {
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
                
                // Cleanup: Detect and fix cases where different requirements incorrectly share the same files
                // This can happen if findMatch incorrectly matched requirements
                const fileGroups = new Map<string, Requirement[]>();
                normalized.forEach(req => {
                    if (req.uploadedFiles && req.uploadedFiles.length > 0) {
                        // Create a signature from file URLs/names to detect duplicates
                        const fileSig = JSON.stringify(req.uploadedFiles.map((f: any) => f.url || f.name || f.downloadUrl).sort());
                        if (!fileGroups.has(fileSig)) {
                            fileGroups.set(fileSig, []);
                        }
                        fileGroups.get(fileSig)!.push(req);
                    }
                });
                
                // If multiple different requirements share identical files, clear files from requirements that shouldn't have them
                fileGroups.forEach((reqs, fileSig) => {
                    if (reqs.length > 1) {
                        const titles = reqs.map(r => normalizeKey(r.title));
                        // Check if these are actually different requirements (not just duplicates)
                        const uniqueTitles = new Set(titles);
                        if (uniqueTitles.size > 1) {
                            // Keep files only for the requirement that best matches based on file path/name
                            // For now, we'll keep files for the first requirement and clear others
                            // This is a safety measure - ideally findMatch should prevent this
                            const keepReq = reqs[0];
                            const clearReqs = reqs.slice(1);
                            
                            normalized = normalized.map(req => {
                                if (clearReqs.some(r => r.id === req.id)) {
                                    return { ...req, uploadedFiles: [], status: 'pending' };
                                }
                                return req;
                            });
                        }
                    }
                });
                
                setRequirements(normalized as any);
                calculateProgress(normalized as any);

                // Persist migrated list back to the user doc (best-effort)
                // Always save if files were cleared due to rejection or if there's a title mismatch
                try {
                    const currentTitles = (savedRequirements || []).map((r: any) => String(r?.title || '')).filter(Boolean);
                    const desiredTitles = getDefaultRequirements().map(r => r.title);
                    const titleMismatch = currentTitles.length !== desiredTitles.length || currentTitles.some((t: string) => !desiredTitles.includes(t));
                    
                    // Check if any requirements had files cleared due to rejection
                    const hasRejectedWithClearedFiles = normalized.some((req: any) => {
                        const originalReq = savedRequirements.find((r: any) => {
                            const rt = normalizeKey(String(r?.title || ''));
                            const reqt = normalizeKey(req.title);
                            return rt === reqt || rt.includes(reqt) || reqt.includes(rt);
                        });
                        return req.approvalStatus === 'rejected' && 
                               originalReq && 
                               Array.isArray(originalReq.uploadedFiles) && 
                               originalReq.uploadedFiles.length > 0 &&
                               (!req.uploadedFiles || req.uploadedFiles.length === 0);
                    });
                    
                    if (titleMismatch || hasRejectedWithClearedFiles) {
                        await setDoc(doc(firestore, 'users', auth.currentUser.uid), { requirements: sanitizeForFirestore(normalized) }, { merge: true });
                    }
                } catch (e) {
                    // Silent error handling
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
                        // Silent error handling
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
                            // Silent error handling
                        }

                    }
                } catch (e) {
                    // Silent error handling
                }
            } else {
                const defaultRequirements = getDefaultRequirements();
                setRequirements(defaultRequirements);
                calculateProgress(defaultRequirements);
            }
        } catch (error) {
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
                await updateDoc(doc(firestore, 'users', auth.currentUser.uid), {
                    requirements: sanitizeForFirestore(updatedRequirements),
                });
            } catch (error: any) {
                Alert.alert('Save error', `Failed to save requirements: ${error?.message || String(error)}`);
                // Diagnostic: write the error to the user's document so you can inspect it in the console / server side.
                try {
                    await setDoc(doc(firestore, 'users', auth.currentUser.uid), {
                        lastRequirementsSyncError: { time: new Date().toISOString(), message: error?.message || String(error) }
                    }, { merge: true });
                } catch (dbgErr) {
                    // Silent error handling
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
                // Silent error handling
            }

            return fileMeta;
        } catch (err) {
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
                            await updateDoc(doc(firestore, 'users', auth.currentUser.uid), {
                                requirements: sanitizeForFirestore(updatedRequirements),
                            });
                        } catch (error: any) {
                            Alert.alert('Save error', `Failed to update your requirements in Firestore: ${error?.message || String(error)}`);
                            try {
                                await setDoc(doc(firestore, 'users', auth.currentUser.uid), { lastRequirementsSyncError: { time: new Date().toISOString(), message: error?.message || String(error) } }, { merge: true });
                            } catch (dbgErr) {
                                // Silent error handling
                            }
                        }
                    }

                    Alert.alert('Success', 'File stored in Firestore (small file). Admins can download it.');
                    setShowUploadModal(false);
                    setSelectedRequirement(null);
                    setUploading(false);
                    return;
                } catch (fsErr) {
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
                            await updateDoc(doc(firestore, 'users', auth.currentUser.uid), {
                                requirements: sanitizeForFirestore(updatedRequirements),
                            });
                        } catch (error: any) {
                            Alert.alert('Save error', `Failed to update your requirements in Firestore: ${error?.message || String(error)}`);
                            try {
                                await setDoc(doc(firestore, 'users', auth.currentUser.uid), { lastRequirementsSyncError: { time: new Date().toISOString(), message: error?.message || String(error) } }, { merge: true });
                            } catch (dbgErr) {
                                // Silent error handling
                            }
                        }
                    }

                    Alert.alert('Success', 'File uploaded to Storage. Admins can download it.');
                    setShowUploadModal(false);
                    setSelectedRequirement(null);
                    setUploading(false);
                    return;
                } catch (storageErr) {
                    Alert.alert('Error', 'Failed to upload file to Storage. Please try again.');
                    setUploading(false);
                    return;
                }
            }
        } catch (error) {
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
                            return candidate;
                        }

                        const base64 = await FileSystem.readAsStringAsync(dl.uri, { encoding: FileSystem.EncodingType.Base64 });
                        return `data:${mime};base64,${base64}`;
                    } catch (e) {
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
                            // Silent error handling
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
                                // Silent error handling
                            }
                            
                            // Fallback to user document signature
                            if (!adviserSignatureUrl) {
                                adviserSignatureUrl = await resolveSignatureUrl(adviser.signatureUrl || adviser.signature || adviser.signaturePath);
                            }

                            // Ensure the signature is embeddable in the generated PDF
                            adviserSignatureUrl = await embedImageAsDataUriIfNeeded(adviserSignatureUrl);
                        }
                    } catch (e) {
                        // Silent error handling
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
                                // Silent error handling
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
                // Silent error handling
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
                // Silent error handling
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
            }
        } catch (error) {
            // Silent error handling
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
                                }
                            } catch (e) {
                                // Write diagnostic to user doc if permission error
                                const errCode = typeof e === 'object' && e && 'code' in e ? (e as any).code : undefined;
                                if (errCode === 'storage/unauthorized' || errCode === 'storage/unknown') {
                                    try {
                                        if (auth.currentUser) {
                                            await setDoc(doc(firestore, 'users', auth.currentUser.uid), { lastStorageDeleteError: { time: new Date().toISOString(), message: String(e) } }, { merge: true });
                                        }
                                    } catch (dbg) {
                                        // Silent error handling
                                    }
                                }
                            }
                        }

                        // Delete admin_files doc (by adminDocId or by path)
                        if (fileAny && fileAny.adminDocId) {
                            try {
                                await deleteDoc(doc(firestore, 'admin_files', fileAny.adminDocId));
                            } catch (e) {
                                const errCode = typeof e === 'object' && e && 'code' in e ? (e as any).code : undefined;
                                if (errCode === 'permission-denied') {
                                    try {
                                        if (auth.currentUser) {
                                            await setDoc(doc(firestore, 'users', auth.currentUser.uid), { lastAdminFilesDeleteError: { time: new Date().toISOString(), message: String(e) } }, { merge: true });
                                        }
                                    } catch (dbg) {
                                        // Silent error handling
                                    }
                                }
                            }
                        } else if (fileAny && fileAny.path) {
                            try {
                                const q = query(collection(firestore, 'admin_files'), where('path', '==', fileAny.path));
                                const snap = await getDocs(q);
                                for (const d of snap.docs) {
                                    try { await deleteDoc(d.ref); } catch (ee) {
                                        const errCode = typeof ee === 'object' && ee && 'code' in ee ? (ee as any).code : undefined;
                                        if (errCode === 'permission-denied') {
                                            try {
                                                if (auth.currentUser) {
                                                    await setDoc(doc(firestore, 'users', auth.currentUser.uid), { lastAdminFilesDeleteError: { time: new Date().toISOString(), message: String(ee) } }, { merge: true });
                                                }
                                            } catch (dbg) {
                                                // Silent error handling
                                            }
                                        }
                                    }
                                }
                            } catch (e) {
                                const errCode = typeof e === 'object' && e && 'code' in e ? (e as any).code : undefined;
                                if (errCode === 'permission-denied') {
                                    try {
                                        if (auth.currentUser) {
                                            await setDoc(doc(firestore, 'users', auth.currentUser.uid), { lastAdminFilesDeleteError: { time: new Date().toISOString(), message: String(e) } }, { merge: true });
                                        }
                                    } catch (dbg) {
                                        // Silent error handling
                                    }
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
                                Alert.alert('Save error', `Failed to update your requirements in Firestore: ${e?.message || String(e)}`);
                                try {
                                    await setDoc(doc(firestore, 'users', auth.currentUser.uid), { lastRequirementsSyncError: { time: new Date().toISOString(), message: e?.message || String(e) } }, { merge: true });
                                } catch (dbgErr) {
                                    // Silent error handling
                                }
                            }
                        }

                        Alert.alert('Removed', 'File removed successfully.');
                    } catch (err) {
                        Alert.alert('Error', 'Failed to remove file.');
                    }
                }
            }
        ]);
    };

    return (
        <Screen style={{ backgroundColor: colors.white }} contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 0 }}>
            {/* Filters + content */}
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
                {/* Hero header (scrolls with content) */}
                <View style={styles.heroContainer}>
                    <View style={styles.heroCard}>
                        <View style={styles.heroTitleRow}>
                            <View style={styles.heroIconWrap}>
                                <Icon name="clipboard-check-outline" size={28} color={colors.onPrimary} />
                            </View>
                            <Text style={styles.heroTitle}>Requirements Checklist</Text>
                        </View>
                        <Text style={styles.heroSubtitle}>
                            Upload documents, track approvals, and complete your OJT requirements.
                        </Text>
                    </View>
                </View>

                {/* Progress Section */}
                <Text style={styles.sectionTitle}>Your progress</Text>
                <Card style={styles.progressCard}>
                    <Card.Content>
                        <View style={styles.progressHeader}>
                            <View>
                                <Text style={styles.progressTitle}>Overall progress</Text>
                                <Text style={styles.progressSubtext}>
                                    {requirements.filter(r => r.status === 'completed' && r.isRequired).length} of {requirements.filter(r => r.isRequired).length} required items completed
                                </Text>
                            </View>
                            <Text style={styles.progressPercentage}>{Math.round(progress * 100)}%</Text>
                        </View>
                        <ProgressBar
                            progress={progress}
                            color={colors.success}
                            style={styles.progressBar}
                        />
                    </Card.Content>
                </Card>

                {/* Filter chips */}
                <View style={styles.filterRow}>
                    <Chip
                        selected={filter === 'all'}
                        onPress={() => setFilter('all')}
                        style={[styles.filterChip, filter === 'all' && styles.filterChipSelected]}
                        textStyle={filter === 'all' ? styles.filterChipTextSelected : styles.filterChipText}
                    >
                        All
                    </Chip>
                    <Chip
                        selected={filter === 'required'}
                        onPress={() => setFilter('required')}
                        style={[styles.filterChip, filter === 'required' && styles.filterChipSelected]}
                        textStyle={filter === 'required' ? styles.filterChipTextSelected : styles.filterChipText}
                    >
                        Required
                    </Chip>
                    <Chip
                        selected={filter === 'completed'}
                        onPress={() => setFilter('completed')}
                        style={[styles.filterChip, filter === 'completed' && styles.filterChipSelected]}
                        textStyle={filter === 'completed' ? styles.filterChipTextSelected : styles.filterChipText}
                    >
                        Completed
                    </Chip>
                    <Chip
                        selected={filter === 'pending'}
                        onPress={() => setFilter('pending')}
                        style={[styles.filterChip, filter === 'pending' && styles.filterChipSelected]}
                        textStyle={filter === 'pending' ? styles.filterChipTextSelected : styles.filterChipText}
                    >
                        Pending
                    </Chip>
                </View>

                {/* Requirements List */}
                <Text style={styles.sectionTitle}>Requirements</Text>
                {filteredRequirements.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="folder-open-outline" size={48} color={colors.textSubtle} style={styles.emptyStateIcon} />
                        <Text style={styles.emptyStateTitle}>
                            {filter === 'all' ? 'No requirements yet' : `No ${filter} items`}
                        </Text>
                        <Text style={styles.emptyStateText}>
                            {filter === 'completed'
                                ? 'Complete and upload documents to see them here.'
                                : filter === 'pending'
                                ? 'All required items are done. Great job!'
                                : 'Requirements will appear here. Pull to refresh if needed.'}
                        </Text>
                    </View>
                ) : filteredRequirements.map((requirement) => (
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
                                                            <Ionicons name="trash-outline" size={18} color="#DC2626" />
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
        backgroundColor: colors.white,
    },
    heroContainer: {
        paddingTop: 14,
        paddingBottom: 22,
        backgroundColor: colors.primary,
        marginHorizontal: -spacing.lg,
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.lg,
    },
    heroCard: {
        paddingVertical: 4,
    },
    heroTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    heroIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    heroTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: colors.onPrimary,
        letterSpacing: 0.2,
    },
    heroSubtitle: {
        fontSize: 14,
        color: colors.onPrimarySubtle,
        lineHeight: 21,
        maxWidth: '95%',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 10,
        marginTop: 4,
    },
    emptyState: {
        paddingVertical: 32,
        paddingHorizontal: 24,
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: radii.lg,
        borderWidth: 1,
        borderColor: colors.border,
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
        lineHeight: 20,
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
        alignItems: 'center',
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
    headerAvatarWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: 'hidden',
        marginRight: 10,
    },
    headerAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    headerAvatarPlaceholder: {
        backgroundColor: colors.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerAvatarText: {
        color: colors.onPrimary,
        fontWeight: '700',
        fontSize: 18,
    },
    headerTextBlock: {
        flex: 1,
        paddingLeft: 4,
        paddingRight: 8,
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
        padding: spacing.lg,
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
    filterRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    filterChip: {
        marginRight: 8,
        marginBottom: 8,
        backgroundColor: colors.surfaceAlt,
    },
    filterChipSelected: {
        backgroundColor: colors.primarySoft,
    },
    filterChipText: {
        fontSize: 12,
        color: colors.textMuted,
    },
    filterChipTextSelected: {
        fontSize: 12,
        color: colors.primary,
        fontWeight: '600',
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