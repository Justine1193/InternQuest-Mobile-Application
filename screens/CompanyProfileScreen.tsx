import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Linking,
    StatusBar,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Post } from '../App';
import { auth, firestore, storage } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { getDownloadURL, ref as storageRef } from 'firebase/storage';
import { colors, radii, shadows, spacing } from '../ui/theme';
import { Screen } from '../ui/components/Screen';
import { useSavedInternships } from '../context/SavedInternshipsContext';

type CompanyProfileRouteProp = RouteProp<RootStackParamList, 'CompanyProfile'>;
type CompanyProfileNavigationProp = StackNavigationProp<RootStackParamList, 'CompanyProfile'>;

type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'not_applied';

const BOTTOM_BAR_HEIGHT = 80;
const MOA_NEAR_EXPIRY_DAYS = 30;

const normalizeCompanyKey = (value: unknown): string => {
    if (typeof value !== 'string') return '';
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '');
};

const parseDocDate = (v: any): Date | null => {
    if (!v) return null;
    if (typeof v === 'object' && typeof v.toDate === 'function') {
        const d = v.toDate();
        return d instanceof Date && !Number.isNaN(d.getTime()) ? d : null;
    }
    if (typeof v === 'string' || typeof v === 'number') {
        const d = new Date(v);
        return !Number.isNaN(d.getTime()) ? d : null;
    }
    return null;
};

const deriveMoaExpiryFromCompanyDoc = (data: any): { expiresOn: string | null; daysUntilExpiry: number | null } => {
    const rawYears = data?.moaValidityYears ?? data?.moa_validity_years ?? data?.moaValidity ?? null;
    const parsedYears = typeof rawYears === 'number' ? rawYears : Number(rawYears);
    const years = Number.isFinite(parsedYears) ? parsedYears : null;

    const baseDate =
        parseDocDate(data?.moaUpdatedAt) ||
        parseDocDate(data?.moaUpdatedOn) ||
        parseDocDate(data?.moaSignedAt) ||
        parseDocDate(data?.moaEffectiveAt) ||
        parseDocDate(data?.updatedAt) ||
        parseDocDate(data?.createdAt) ||
        null;

    const explicitExpiry =
        parseDocDate(data?.moaExpiresOn) ||
        parseDocDate(data?.moaExpiresAt) ||
        parseDocDate(data?.moaExpiryDate) ||
        parseDocDate(data?.moaExpiry) ||
        parseDocDate(data?.expiresOn) ||
        parseDocDate(data?.expires_at) ||
        null;

    let expiresOn: string | null = null;
    if (explicitExpiry) {
        expiresOn = explicitExpiry.toISOString();
    } else if (baseDate && years && years > 0) {
        const expiry = new Date(baseDate);
        expiry.setFullYear(expiry.getFullYear() + years);
        if (!Number.isNaN(expiry.getTime())) {
            expiresOn = expiry.toISOString();
        }
    }

    if (!expiresOn) {
        return { expiresOn: null, daysUntilExpiry: null };
    }

    const expiryDate = new Date(expiresOn);
    if (Number.isNaN(expiryDate.getTime())) {
        return { expiresOn: null, daysUntilExpiry: null };
    }

    const days = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return {
        expiresOn,
        daysUntilExpiry: Number.isFinite(days) ? days : null,
    };
};

const CompanyProfileScreen: React.FC = () => {
    const navigation = useNavigation<CompanyProfileNavigationProp>();
    const route = useRoute<CompanyProfileRouteProp>();
    const { companyId } = route.params;
    const { savedInternships, toggleSaveInternship } = useSavedInternships();

    const [company, setCompany] = useState<Post | null>(null);
    const [moaDaysUntilExpiry, setMoaDaysUntilExpiry] = useState<number | null>(null);
    const [moaExpiresOn, setMoaExpiresOn] = useState<string | null>(null);

    useEffect(() => {
        const loadCompany = async () => {
            try {
                const docRef = doc(firestore, 'companies', companyId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data() as any;

                    const moaStatusRaw = String(data?.moaStatus ?? data?.moa_status ?? '').trim().toLowerCase();
                    const isNoMoaStatus = moaStatusRaw === 'no-moa' || moaStatusRaw === 'no_moa' || moaStatusRaw === 'none';

                    const normalizeMoaCandidate = (v: any): string => {
                        if (typeof v === 'string') return v.trim();
                        if (v && typeof v === 'object') {
                            const fromObj = v.url || v.downloadUrl || v.downloadURL || v.path || v.storagePath;
                            return typeof fromObj === 'string' ? fromObj.trim() : '';
                        }
                        return '';
                    };

                    // NOTE: Some company docs store `moa: "Yes"` as a flag, while the actual file is in `moaFileUrl`/`moaStoragePath`.
                    // Prefer a real URL/path first.
                    const moaCandidates = [
                        data?.moaFileUrl,
                        data?.moaFileURL,
                        data?.moaUrl,
                        data?.moaURL,
                        data?.moaStoragePath,
                        data?.moaPath,
                        data?.moa,
                    ];
                    let moaValue = moaCandidates
                        .map(normalizeMoaCandidate)
                        .find((s) => {
                            if (!s) return false;
                            const lower = s.toLowerCase();
                            // skip boolean-like flags
                            if (['yes', 'no', 'true', 'false', '1', '0', 'y', 'n'].includes(lower)) return false;
                            return true;
                        }) || normalizeMoaCandidate(data?.moa);

                    // Respect Firestore moaStatus: "no-moa" means no MOA section.
                    if (isNoMoaStatus) {
                        moaValue = '';
                    } else if (moaStatusRaw && !moaValue) {
                        moaValue = 'Yes';
                    }

                    const mapped: Post = {
                        id: docSnap.id,
                        company: data.companyName || data.company || '',
                        description: data.companyDescription || data.description || '',
                        category: data.category || '',
                        location: data.companyAddress || data.location || '',
                        industry: data.fields || data.industry || '',
                        tags: Array.isArray(data.skillsREq) ? data.skillsREq : (Array.isArray(data.tags) ? data.tags : []),
                        endorsedByCollege: data.endorsedByCollege || data.endorsed_by_college || data.collegeEndorsement || '',
                        website: data.companyWeb || data.website || '',
                        email: data.companyEmail || data.email || '',
                        contactPersonName: data.contactPersonName || data.companyContactPerson || data.contactPerson || '',
                        contactPersonPhone: data.contactPersonPhone || data.companyContactPhone || data.contactPhone || data.phone || '',
                        moa: moaValue || '',
                        modeOfWork: Array.isArray(data.modeOfWork) ? data.modeOfWork[0] : (data.modeOfWork || ''),
                        latitude: data.latitude || 0,
                        longitude: data.longitude || 0,
                        createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)) : new Date(),
                    };
                    setCompany(mapped);

                    // Compute near-expiry warning from Firestore doc fields (no RTDB dependency).
                    if (isNoMoaStatus) {
                        setMoaExpiresOn(null);
                        setMoaDaysUntilExpiry(null);
                    } else {
                        const expiry = deriveMoaExpiryFromCompanyDoc(data);
                        setMoaExpiresOn(expiry.expiresOn);
                        setMoaDaysUntilExpiry(expiry.daysUntilExpiry);
                    }
                }
            } catch (error) {
                console.error('Error loading company:', error);
            }
        };
        loadCompany();
    }, [companyId]);

    const [isLoading, setIsLoading] = useState(false);
    const [cancelingApplication, setCancelingApplication] = useState(false);
    const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>('not_applied');
    const [userProfile, setUserProfile] = useState<any>(null);
    const [showApplySuccess, setShowApplySuccess] = useState(false);
    const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
    const [placementLocked, setPlacementLocked] = useState(false);
    const [placementCompanyName, setPlacementCompanyName] = useState<string>('');
    const [placementLockStatus, setPlacementLockStatus] = useState<'pending' | 'approved' | ''>('');
    const [showPlacementLockedModal, setShowPlacementLockedModal] = useState(false);

    const hideApplyBecauseHired = placementLocked && placementLockStatus === 'approved';

    useEffect(() => {
        fetchUserProfile();
    }, []);

    // when the company record has been loaded, check application status
    useEffect(() => {
        if (company) {
            checkApplicationStatus();
        }
    }, [company]);

    const checkPlacementLock = async (): Promise<boolean> => {
        if (!auth.currentUser) return false;
        try {
            const currentId = String(companyId);

            // Source of truth: applications collection.
            const q = query(
                collection(firestore, 'applications'),
                where('userId', '==', auth.currentUser.uid),
                // Only one active application at a time:
                // if the user already has a pending OR approved application elsewhere, block applying here.
                where('status', 'in', ['approved', 'pending'])
            );
            const snap = await getDocs(q);
            if (!snap.empty) {
                const apps = snap.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) }));
                const approved = apps.find((a: any) => String(a.status || '').toLowerCase() === 'approved');
                const pending = apps.find((a: any) => String(a.status || '').toLowerCase() === 'pending');
                const chosen = approved || pending;

                if (chosen) {
                    const otherCompanyId = String(chosen.companyId || '').trim();
                    const otherCompanyName = String(chosen.companyName || chosen.company || '').trim();
                    const chosenStatus = String(chosen.status || '').toLowerCase();

                    if (otherCompanyId && otherCompanyId !== currentId) {
                        setPlacementLocked(true);
                        setPlacementCompanyName(otherCompanyName || 'your assigned company');
                        setPlacementLockStatus(chosenStatus === 'pending' ? 'pending' : 'approved');
                        return true;
                    }
                }
            }

            // Fallback: if the user profile already says they're hired/assigned.
            const userStatus = typeof userProfile?.status === 'string' ? userProfile.status.trim().toLowerCase() : '';
            if (userStatus === 'hired') {
                const hiredCompanyId = String(
                    userProfile?.hiredCompanyId ??
                    userProfile?.approvedCompanyId ??
                    userProfile?.assignedCompanyId ??
                    ''
                ).trim();
                const hiredCompanyName = String(userProfile?.company ?? userProfile?.hiredCompanyName ?? '').trim();
                const currentCompanyName = String(company?.company ?? '').trim();

                const isSameCompanyById = hiredCompanyId && hiredCompanyId === currentId;
                const isSameCompanyByName =
                    !isSameCompanyById &&
                    normalizeCompanyKey(hiredCompanyName) &&
                    normalizeCompanyKey(currentCompanyName) &&
                    normalizeCompanyKey(hiredCompanyName) === normalizeCompanyKey(currentCompanyName);

                if (!isSameCompanyById && !isSameCompanyByName) {
                    setPlacementLocked(true);
                    setPlacementCompanyName(hiredCompanyName || 'your assigned company');
                    setPlacementLockStatus('approved');
                    return true;
                }
            }

            setPlacementLocked(false);
            setPlacementCompanyName('');
            setPlacementLockStatus('');
            return false;
        } catch (e) {
            // best-effort; don't block UI if query fails
            console.warn('CompanyProfile: failed to check placement lock', e);
            setPlacementLocked(false);
            setPlacementCompanyName('');
            setPlacementLockStatus('');
            return false;
        }
    };

    // Also check if the user is already approved elsewhere (only one approved company allowed)
    useEffect(() => {
        void checkPlacementLock();
    }, [companyId, applicationStatus, userProfile, company?.company]);

    const fetchUserProfile = async () => {
        if (!auth.currentUser) return;
        try {
            const uid = auth.currentUser.uid;
            const email = auth.currentUser.email;

            const uidSnap = await getDoc(doc(firestore, 'users', uid));
            const uidData = uidSnap.exists() ? (uidSnap.data() as any) : null;

            let emailData: any | null = null;
            if (email) {
                const q = query(collection(firestore, 'users'), where('email', '==', email));
                const qsnap = await getDocs(q);
                if (!qsnap.empty) {
                    emailData = qsnap.docs[0].data() as any;
                }
            }

            if (!uidData && !emailData) return;

            // Prefer UID doc, but if it's incomplete (common with legacy provisioning),
            // fall back to the email doc's skills/field so matching works.
            let merged: any = uidData || emailData;
            if (uidData && emailData) {
                merged = { ...emailData, ...uidData };

                const uidSkills = Array.isArray(uidData.skills) ? uidData.skills : [];
                const emailSkills = Array.isArray(emailData.skills) ? emailData.skills : [];
                if (uidSkills.length === 0 && emailSkills.length > 0) {
                    merged.skills = emailSkills;
                }

                const uidField = uidData.field;
                const emailField = emailData.field;
                const uidFieldEmpty =
                    uidField == null ||
                    (Array.isArray(uidField) && uidField.filter(Boolean).length === 0) ||
                    (typeof uidField === 'string' && !uidField.trim());
                if (uidFieldEmpty && emailField != null) {
                    merged.field = emailField;
                }
            }

            setUserProfile(merged);
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    const handleDownloadMOA = async () => {
        const raw = String(company?.moa || '').trim();
        if (!raw) {
            Alert.alert('No MOA available', 'The MOA link is not available for this company.');
            return;
        }

        try {
            const resolveMoaFromHelpDeskTemplates = async (): Promise<string | null> => {
                try {
                    const snap = await getDocs(query(collection(firestore, 'helpDeskFiles')));
                    const docs: any[] = [];
                    snap.forEach((d: any) => docs.push({ id: d.id, ...(d.data() as any) }));

                    const isMoaTemplate = (t: any) => {
                        const name = String(t?.fileName || t?.name || '').toLowerCase();
                        const desc = String(t?.description || '').toLowerCase();
                        const hay = `${name} ${desc}`;
                        return hay.includes('memorandum of agreement') || hay.includes('moa');
                    };

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

                    const moaDoc = docs.find(isMoaTemplate);
                    if (!moaDoc) return null;
                    return await resolveTemplateUrl(moaDoc);
                } catch (e) {
                    return null;
                }
            };

            let urlToOpen = raw;
            const looksLikeHttp = /^https?:\/\//i.test(raw);
            const looksLikeYesNoFlag = ['yes', 'true', '1', 'y'].includes(raw.toLowerCase());

            // If it's not an http(s) URL, treat it as a Firebase Storage reference or path.
            // Common shapes:
            // - gs://<bucket>/<path>
            // - <folder>/<file>.pdf
            // - /<folder>/<file>.pdf
            if (!looksLikeHttp) {
                const normalizedPath = raw.startsWith('/') ? raw.slice(1) : raw;
                try {
                    urlToOpen = await getDownloadURL(storageRef(storage, normalizedPath));
                } catch (storageErr) {
                    // Some admins store a non-link note (e.g. "Yes").
                    // Fallback: try to use the admin-provided MOA template from Help Desk.
                    const helpDeskUrl = await resolveMoaFromHelpDeskTemplates();
                    if (helpDeskUrl) {
                        urlToOpen = helpDeskUrl;
                    } else {
                        if (looksLikeYesNoFlag) {
                            Alert.alert(
                                'No MOA file configured',
                                'This company is marked as having an MOA, but no downloadable MOA file/link was found. Please ask an admin to upload the MOA in Guides/Help Desk.'
                            );
                        } else {
                            Alert.alert('MOA Information', raw);
                        }
                        return;
                    }
                }
            }

            const canOpen = await Linking.canOpenURL(urlToOpen);
            if (!canOpen) {
                Alert.alert('Error', 'This MOA link cannot be opened on your device.');
                return;
            }

            await Linking.openURL(urlToOpen);
        } catch (error) {
            Alert.alert('Error', 'Could not open the MOA. Please try again.');
            console.error('Error downloading MOA:', error);
        }
    };

    const checkApplicationStatus = async () => {
        if (!auth.currentUser) return;
        try {
            const applicationRef = doc(firestore, 'applications', `${auth.currentUser.uid}_${companyId}`);
            const applicationDoc = await getDoc(applicationRef);
            if (applicationDoc.exists()) {
                const status = applicationDoc.data().status;
                setApplicationStatus(status === 'cancelled' ? 'not_applied' : (status || 'pending'));
            }
        } catch (error) {
            console.error('Error checking application status:', error);
            try {
                if (auth.currentUser) {
                    await setDoc(doc(firestore, 'users', auth.currentUser.uid), { lastApplicationStatusFetchError: { time: new Date().toISOString(), message: String(error), companyId } }, { merge: true });
                }
            } catch (diagErr) {
                console.warn('CompanyProfile: failed to write lastApplicationStatusFetchError', diagErr);
            }
        }
    };

    const handleApply = async () => {
        if (!auth.currentUser) {
            Alert.alert('Error', 'You must be logged in to apply.');
            return;
        }

        if (!userProfile) {
            Alert.alert('Error', 'Please complete your profile before applying.');
            return;
        }

        const lockedNow = await checkPlacementLock();
        if (lockedNow || placementLocked) {
            setShowPlacementLockedModal(true);
            return;
        }

        setIsLoading(true);
        try {
            const userProfileData: any = {
                name: userProfile.name || (userProfile.firstName && userProfile.lastName ? userProfile.firstName + ' ' + userProfile.lastName : 'Unknown'),
                email: userProfile.email || '',
            };
            // Only add course if it exists (avoid undefined values)
            if (userProfile.course) {
                userProfileData.course = userProfile.course;
            }
            // Only add skills if they exist
            if (userProfile.skills && userProfile.skills.length > 0) {
                userProfileData.skills = userProfile.skills;
            }

            const applicationData = {
                userId: auth.currentUser.uid,
                companyId: company!.id,
                companyName: company!.company,
                status: 'pending',
                appliedAt: new Date(),
                userProfile: userProfileData,
            };

            const applicationRef = doc(firestore, 'applications', `${auth.currentUser.uid}_${company!.id}`);
            await setDoc(applicationRef, applicationData);

            // Also update user's profile to track the applied company (optional, for reference)
            await setDoc(doc(firestore, 'users', auth.currentUser.uid), { 
                appliedCompanyId: company!.id,
                appliedCompanyName: company!.company,
                applicationUpdatedAt: new Date().toISOString()
            }, { merge: true });

            setApplicationStatus('pending');
            setShowApplySuccess(true);
        } catch (error) {
            console.error('Error submitting application:', error);
            Alert.alert('Error', 'Failed to submit application. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelApplication = () => {
        // Open a custom confirmation modal instead of a system alert
        setShowWithdrawConfirm(true);
    };

    const confirmWithdrawApplication = async () => {
        if (!auth.currentUser || !company) return;
        setCancelingApplication(true);
        try {
            const applicationRef = doc(firestore, 'applications', `${auth.currentUser.uid}_${company.id}`);
            await updateDoc(applicationRef, {
                status: 'cancelled',
                cancelledAt: new Date(),
            });
            await checkApplicationStatus();
            setShowWithdrawConfirm(false);
        } catch (error) {
            Alert.alert('Error', 'Could not withdraw application. Please try again.');
        } finally {
            setCancelingApplication(false);
        }
    };

    const handleContact = (type: 'email' | 'website' | 'phone') => {
        switch (type) {
            case 'email':
                    if (company?.email) {
                        Linking.openURL(`mailto:${company.email}`);
                }
                break;
            case 'website':
                if (company?.website) {
                    Linking.openURL(company.website);
                }
                break;
            case 'phone':
                if (company?.contactPersonPhone) {
                    const normalized = String(company.contactPersonPhone)
                        .trim()
                        .replace(/\s+/g, '')
                        .replace(/(?!^)\+/g, '');
                    Linking.openURL(`tel:${normalized}`).catch((err) => console.warn('Failed to open phone dialer', err));
                }
                break;
        }
    };

    // Work detail interaction removed; icons will be colored based on values.

    const openMaps = (address?: string) => {
        if (!address) return;
        const query = encodeURIComponent(address);
        const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
        Linking.openURL(url).catch((err) => console.warn('Failed to open maps url', err));
    };

    const getStatusColor = (status: ApplicationStatus) => {
        switch (status) {
            case 'approved': return colors.success;
            case 'rejected': return colors.danger;
            case 'pending': return colors.warning;
            default: return colors.textSubtle;
        }
    };

    const getStatusText = (status: ApplicationStatus) => {
        switch (status) {
            case 'approved': return 'Approved';
            case 'rejected': return 'Rejected';
            case 'pending': return 'Pending';
            default: return 'Not Applied';
        }
    };

    if (!company) {
        return (
            <Screen contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </Screen>
        );
    }

    const modeColor = (() => {
        const m = (company.modeOfWork || '').toString().toLowerCase();
        if (m.includes('remote')) return colors.success;
        if (m.includes('hybrid')) return colors.warning;
        if (m.includes('site') || m.includes('on-site') || m.includes('onsite') || m.includes('on site')) return colors.primary;
        return colors.textMuted;
    })();

    const isSaved = company ? savedInternships.some((s) => s.id === company.id) : false;

    const handleSave = () => {
        if (!company) return;
        toggleSaveInternship(company);
    };

    const fieldItems: string[] = Array.isArray(company.industry)
        ? company.industry
        : typeof company.industry === 'string' && company.industry
            ? company.industry.split(/[,/]+/).map((s: string) => s.trim()).filter(Boolean)
            : [];

    const splitSkillLike = (value: unknown): string[] => {
        if (!value) return [];
        if (Array.isArray(value)) return value.flatMap(splitSkillLike);
        if (typeof value !== 'string') return [String(value)].map((s) => s.trim()).filter(Boolean);

        // Some docs store multiple skills in one string (e.g. "HTML, CSS / JS").
        return value
            .split(/[\n,;/|]+/g)
            .map((s) => s.trim())
            .filter(Boolean);
    };

    const toTokens = (value: unknown): string[] => {
        if (!value) return [];
        return String(value)
            .toLowerCase()
            .split(/[^a-z0-9]+/g)
            .map((t) => t.trim())
            .filter(Boolean);
    };

    const stableDedupe = (items: string[]) => {
        const seen = new Set<string>();
        const out: string[] = [];
        for (const item of items) {
            const key = toTokens(item).join(' ');
            if (!key || seen.has(key)) continue;
            seen.add(key);
            out.push(item);
        }
        return out;
    };

    // Required skills that the user has (skills picked by the user that match this internship)
    const requiredSkills = stableDedupe(splitSkillLike(company.tags));
    const userSkills = stableDedupe(splitSkillLike(userProfile?.skills));
    const userTokenSet = new Set<string>(userSkills.flatMap(toTokens));

    const userMatchingSkills: string[] =
        requiredSkills.length > 0 && userTokenSet.size > 0
            ? requiredSkills.filter((required) => {
                const requiredTokens = toTokens(required);
                if (requiredTokens.length === 0) return false;
                // Match if ALL required tokens exist in the user's token set.
                // Example: required "react native" matches user skill "React-Native".
                return requiredTokens.every((t) => userTokenSet.has(t));
            })
            : [];

    return (
        <Screen contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 0 }}>
            {/* Header: back (left) | title | right spacer – matches Notifications style */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.headerBackButton}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityLabel="Go back"
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Company Details</Text>
                <View style={styles.headerRightButton} />
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 + BOTTOM_BAR_HEIGHT }]}
            >
                {/* Hero: company name card + meta */}
                <View style={styles.hero}>
                    <View style={styles.companyNameCard}>
                        <View style={styles.companyNameCardInner}>
                            <Text style={styles.heroTitle} numberOfLines={3} selectable>
                                {company.company || 'Unnamed Company'}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.heroMeta}>
                        <TouchableOpacity
                            style={styles.heroPill}
                            onPress={() => company.location && openMaps(company.location)}
                            activeOpacity={0.7}
                            accessibilityRole="link"
                            disabled={!company.location}
                        >
                            <Ionicons name="location-outline" size={18} color={colors.info} style={{ marginRight: 8 }} />
                            <View style={styles.heroPillTextWrap}>
                                <Text style={styles.heroPillLabel}>Location</Text>
                                <Text style={styles.heroPillText}>{company.location || '—'}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Application status (when applied) */}
                {applicationStatus !== 'not_applied' && (
                    <View style={[styles.statusCard, { borderLeftColor: getStatusColor(applicationStatus) }]}>
                        <View style={styles.statusRow}>
                            <View style={[styles.statusIconWrap, { backgroundColor: getStatusColor(applicationStatus) + '18' }]}>
                                <Ionicons
                                    name={applicationStatus === 'approved' ? 'checkmark-circle' : applicationStatus === 'rejected' ? 'close-circle' : 'time'}
                                    size={22}
                                    color={getStatusColor(applicationStatus)}
                                />
                            </View>
                            <View style={styles.statusTextWrap}>
                                <Text style={styles.statusLabel}>Application status</Text>
                                <Text style={[styles.statusValue, { color: getStatusColor(applicationStatus) }]}>{getStatusText(applicationStatus)}</Text>
                            </View>
                        </View>
                        {applicationStatus === 'pending' && (
                            <View style={styles.withdrawRow}>
                                <TouchableOpacity
                                    style={styles.withdrawBtn}
                                    onPress={handleCancelApplication}
                                    disabled={cancelingApplication}
                                    activeOpacity={0.8}
                                >
                                    {cancelingApplication ? (
                                        <ActivityIndicator size="small" color={colors.danger} />
                                    ) : (
                                        <>
                                            <Ionicons name="close-circle-outline" size={18} color={colors.danger} style={{ marginRight: 6 }} />
                                            <Text style={styles.withdrawBtnText}>Withdraw application</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                                <Text style={styles.withdrawHint}>You can apply again later if you change your mind.</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* About */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>About</Text>
                    <Text style={styles.bodyText}>{company.description || 'No description provided.'}</Text>
                </View>

                {/* Apply CTA – placed high so it’s visible without scrolling to the bottom */}
                {/* Work setup */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Work setup</Text>
                    <View style={styles.workModeRow}>
                        <View style={[styles.modePill, { backgroundColor: modeColor + '18' }]}>
                            <Ionicons name="desktop-outline" size={18} color={modeColor} />
                            <Text style={[styles.modePillText, { color: modeColor }]}>{company.modeOfWork || 'Not specified'}</Text>
                        </View>
                    </View>
                </View>

                {/* MOA */}
                {company.moa && (
                    <View style={[styles.section, styles.moaSection, applicationStatus === 'approved' && styles.moaSectionUnlocked]}>
                        <Text style={styles.sectionLabel}>Memorandum of Agreement (MOA)</Text>
                        {typeof moaDaysUntilExpiry === 'number' && moaDaysUntilExpiry >= 0 && moaDaysUntilExpiry <= MOA_NEAR_EXPIRY_DAYS && (
                            <View style={styles.moaExpiryRow}>
                                <Ionicons name="warning-outline" size={20} color={colors.warning} />
                                <Text style={styles.moaExpiryText}>
                                    MOA expires in {moaDaysUntilExpiry} day{moaDaysUntilExpiry === 1 ? '' : 's'}{moaExpiresOn ? ` (until ${new Date(moaExpiresOn).toLocaleDateString()})` : ''}
                                </Text>
                            </View>
                        )}
                        {applicationStatus === 'approved' ? (
                            <>
                                <Text style={styles.moaMessage}>Your application was approved. You can now download the MOA.</Text>
                                <TouchableOpacity style={styles.moaButton} onPress={handleDownloadMOA} activeOpacity={0.85}>
                                    <Ionicons name="download-outline" size={20} color={colors.onPrimary} style={{ marginRight: 8 }} />
                                    <Text style={styles.moaButtonText}>Download MOA</Text>
                                </TouchableOpacity>
                            </>
                        ) : applicationStatus === 'pending' ? (
                            <View style={styles.moaLockRow}>
                                <Ionicons name="time-outline" size={22} color={colors.warning} />
                                <Text style={styles.moaLockText}>Your application is under review. The MOA will be available once you are approved.</Text>
                            </View>
                        ) : applicationStatus === 'rejected' ? (
                            <View style={styles.moaLockRow}>
                                <Ionicons name="close-circle-outline" size={22} color={colors.danger} />
                                <Text style={styles.moaLockText}>Your application was not approved. The MOA is not available for this placement.</Text>
                            </View>
                        ) : (
                            <View style={styles.moaLockRow}>
                                <Ionicons name="lock-closed-outline" size={22} color={colors.textMuted} />
                                <Text style={styles.moaLockText}>Apply first. After your application is approved, you can download the MOA.</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Required skills – show only the skills the user has that match */}
                {company.tags && company.tags.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Required skills (your matches)</Text>
                        <View style={styles.skillsWrap}>
                            {userMatchingSkills.length > 0
                                ? userMatchingSkills.map((skill: string, index: number) => (
                                    <View key={index} style={styles.skillPill}>
                                        <Text style={styles.skillPillText}>{skill}</Text>
                                    </View>
                                ))
                                : (
                                    <Text style={styles.skillsEmptyText}>None of your profile skills match the required skills for this internship.</Text>
                                )}
                        </View>
                    </View>
                )}

                {/* Field */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Field</Text>
                    <View style={styles.fieldPillRow}>
                        {fieldItems.length > 0
                            ? fieldItems.map((field: string, index: number) => (
                                <View key={index} style={styles.fieldPill}>
                                    <Text style={styles.fieldPillText}>{field}</Text>
                                </View>
                            ))
                            : (
                                <View style={styles.fieldPill}>
                                    <Text style={styles.fieldPillText}>—</Text>
                                </View>
                            )}
                    </View>
                </View>

                {/* Endorsed by College */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>
                        Endorsed by College <Text style={{ color: colors.danger }}>*</Text>
                    </Text>
                    <Text style={styles.bodyText}>
                        {company.endorsedByCollege?.trim() ? company.endorsedByCollege.trim() : '—'}
                    </Text>
                </View>

                {/* Contact & reach out (single section) */}
                {(company.location || company.email || company.website || company.contactPersonName || company.contactPersonPhone) ? (
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Contact & reach out</Text>
                    {company.location ? (
                        <TouchableOpacity style={styles.contactRow} onPress={() => openMaps(company.location)} activeOpacity={0.7} accessibilityRole="link">
                            <View style={styles.contactIconWrap}>
                                <Ionicons name="location-outline" size={20} color={colors.info} />
                            </View>
                            <View style={styles.contactContent}>
                                <Text style={styles.contactLabel}>Address</Text>
                                <Text style={styles.contactValue} numberOfLines={2}>{company.location}</Text>
                            </View>
                            <Ionicons name="open-outline" size={18} color={colors.textSubtle} />
                        </TouchableOpacity>
                    ) : null}
                    {company.email ? (
                        <TouchableOpacity style={styles.contactRow} onPress={() => handleContact('email')} activeOpacity={0.7}>
                            <View style={styles.contactIconWrap}>
                                <Ionicons name="mail-outline" size={20} color={colors.info} />
                            </View>
                            <View style={styles.contactContent}>
                                <Text style={styles.contactLabel}>Email</Text>
                                <Text style={styles.contactValue} numberOfLines={1}>{company.email}</Text>
                            </View>
                            <Ionicons name="open-outline" size={18} color={colors.textSubtle} />
                        </TouchableOpacity>
                    ) : null}
                    {company.website ? (
                        <TouchableOpacity style={styles.contactRow} onPress={() => handleContact('website')} activeOpacity={0.7}>
                            <View style={styles.contactIconWrap}>
                                <Ionicons name="globe-outline" size={20} color={colors.info} />
                            </View>
                            <View style={styles.contactContent}>
                                <Text style={styles.contactLabel}>Website</Text>
                                <Text style={styles.contactValue} numberOfLines={1}>{company.website}</Text>
                            </View>
                            <Ionicons name="open-outline" size={18} color={colors.textSubtle} />
                        </TouchableOpacity>
                    ) : null}
                    {(company.contactPersonName || company.contactPersonPhone) ? (
                        <>
                            {company.contactPersonName ? (
                                <View style={styles.contactRow}>
                                    <View style={styles.contactIconWrap}>
                                        <Ionicons name="person-outline" size={20} color={colors.textMuted} />
                                    </View>
                                    <View style={styles.contactContent}>
                                        <Text style={styles.contactLabel}>Contact person</Text>
                                        <Text style={styles.contactValue}>{company.contactPersonName}</Text>
                                    </View>
                                </View>
                            ) : null}
                            {company.contactPersonPhone ? (
                                <TouchableOpacity style={styles.contactRow} onPress={() => handleContact('phone')} activeOpacity={0.7} accessibilityRole="link">
                                    <View style={styles.contactIconWrap}>
                                        <Ionicons name="call-outline" size={20} color={colors.info} />
                                    </View>
                                    <View style={styles.contactContent}>
                                        <Text style={styles.contactLabel}>Phone</Text>
                                        <Text style={styles.contactValue}>{company.contactPersonPhone}</Text>
                                    </View>
                                    <Ionicons name="open-outline" size={18} color={colors.textSubtle} />
                                </TouchableOpacity>
                            ) : null}
                        </>
                    ) : null}
                </View>
                ) : null}

            </ScrollView>

            {/* Application success modal */}
            <Modal
                visible={showApplySuccess}
                animationType="fade"
                transparent
                onRequestClose={() => setShowApplySuccess(false)}
            >
                <View style={styles.successOverlay}>
                    <View style={styles.successCard}>
                        <View style={styles.successIconCircle}>
                            <Ionicons name="checkmark" size={22} color={colors.onPrimary} />
                        </View>
                        <Text style={styles.successTitle}>Application submitted</Text>
                        <Text style={styles.successMessage}>
                            Your application has been submitted successfully. You can track its status here in the company details screen.
                        </Text>
                        <TouchableOpacity
                            style={styles.successButton}
                            onPress={() => setShowApplySuccess(false)}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.successButtonText}>Got it</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Withdraw application confirmation modal */}
            <Modal
                visible={showWithdrawConfirm}
                animationType="fade"
                transparent
                onRequestClose={() => setShowWithdrawConfirm(false)}
            >
                <View style={styles.successOverlay}>
                    <View style={styles.withdrawCard}>
                        <View style={styles.withdrawIconCircle}>
                            <Ionicons name="alert-circle" size={22} color={colors.danger} />
                        </View>
                        <Text style={styles.withdrawTitle}>Withdraw application?</Text>
                        <Text style={styles.withdrawMessage}>
                            Are you sure you want to withdraw your application? You can apply again later if you change your mind.
                        </Text>
                        <View style={styles.withdrawButtonsRow}>
                            <TouchableOpacity
                                style={styles.withdrawSecondaryBtn}
                                onPress={() => setShowWithdrawConfirm(false)}
                                activeOpacity={0.8}
                                disabled={cancelingApplication}
                            >
                                <Text style={styles.withdrawSecondaryText}>Keep application</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.withdrawPrimaryBtn,
                                    cancelingApplication && { opacity: 0.7 },
                                ]}
                                onPress={confirmWithdrawApplication}
                                activeOpacity={0.85}
                                disabled={cancelingApplication}
                            >
                                {cancelingApplication ? (
                                    <ActivityIndicator size="small" color={colors.onPrimary} />
                                ) : (
                                    <Text style={styles.withdrawPrimaryText}>Withdraw</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Placement locked modal (already approved elsewhere) */}
            <Modal
                visible={showPlacementLockedModal}
                animationType="fade"
                transparent
                onRequestClose={() => setShowPlacementLockedModal(false)}
            >
                <View style={styles.successOverlay}>
                    <View style={styles.lockedCard}>
                        <View style={styles.lockedIconCircle}>
                            <Ionicons name="lock-closed" size={22} color={colors.primary} />
                        </View>
                        <Text style={styles.lockedTitle}>You’re already assigned</Text>
                        <Text style={styles.lockedMessage}>
                            {placementLockStatus === 'pending'
                                ? `You already have a pending application at ${placementCompanyName || 'another company'}. You can’t apply to another company until the admin decides, or you withdraw that application.`
                                : `You’re already approved at ${placementCompanyName || 'your assigned company'}. You can’t apply to another company unless the admin removes your current placement.`}
                        </Text>
                        <TouchableOpacity
                            style={styles.lockedButton}
                            onPress={() => setShowPlacementLockedModal(false)}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.lockedButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Fixed bottom bar: Apply + Save Internship */}
            <View style={[styles.bottomBar, { height: BOTTOM_BAR_HEIGHT }]}>
                {!hideApplyBecauseHired && (
                    <TouchableOpacity
                        style={[
                            styles.bottomBarApplyBtn,
                            (applicationStatus !== 'not_applied' || placementLocked) && styles.bottomBarApplyBtnDisabled,
                        ]}
                        onPress={handleApply}
                        disabled={isLoading || applicationStatus !== 'not_applied' || placementLocked}
                        activeOpacity={0.8}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color={colors.onPrimary} />
                        ) : (
                            <Text
                                style={[
                                    styles.bottomBarApplyText,
                                    (applicationStatus !== 'not_applied' || placementLocked) && styles.bottomBarApplyTextDisabled,
                                ]}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {placementLocked
                                    ? 'Locked'
                                    : applicationStatus === 'not_applied'
                                        ? 'Apply now'
                                        : applicationStatus === 'pending'
                                            ? 'Pending'
                                            : applicationStatus === 'approved'
                                                ? 'Approved'
                                                : 'Rejected'}
                            </Text>
                        )}
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[
                        styles.bottomBarSaveBtn,
                        hideApplyBecauseHired && styles.bottomBarSaveBtnFull,
                        isSaved && styles.bottomBarSaveBtnSaved,
                    ]}
                    onPress={handleSave}
                    activeOpacity={0.8}
                >
                    <View style={styles.bottomBarSaveContent}>
                        <Ionicons
                            name={isSaved ? 'heart' : 'heart-outline'}
                            size={22}
                            color={colors.primary}
                            style={styles.bottomBarSaveIcon}
                        />
                        <Text style={styles.bottomBarSaveText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
                            {isSaved ? 'Saved Internship' : 'Save Internship'}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        </Screen>
    );
};

const styles = StyleSheet.create({
    /* Header – matches Notifications screen */
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 14,
        backgroundColor: colors.surface,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
        ...shadows.card,
    },
    headerBackButton: {
        padding: 4,
        minWidth: 40,
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
        flex: 1,
    },
    headerRightButton: {
        padding: 4,
        minWidth: 40,
        alignItems: 'flex-end',
    },

    scrollView: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 32,
    },

    /* Fixed bottom bar (Apply + Save Internship) – full width to avoid clipping */
    bottomBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        paddingHorizontal: 12,
        paddingVertical: 12,
        paddingBottom: 12,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: -2 },
        elevation: 4,
    },
    bottomBarApplyBtn: {
        flex: 1,
        flexShrink: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 10,
        borderRadius: 24,
        backgroundColor: colors.primary,
        minWidth: 0,
    },
    bottomBarApplyBtnDisabled: {
        backgroundColor: colors.surfaceAlt,
        borderWidth: 1,
        borderColor: colors.border,
    },
    bottomBarApplyText: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.onPrimary,
        lineHeight: 20,
        includeFontPadding: false,
    },
    bottomBarApplyTextDisabled: {
        color: colors.textMuted,
    },
    bottomBarSaveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 24,
        backgroundColor: colors.surface,
        borderWidth: 2,
        borderColor: colors.primary,
        flexShrink: 0,
        minWidth: 165,
    },
    bottomBarSaveBtnFull: {
        flex: 1,
        minWidth: 0,
    },
    bottomBarSaveBtnSaved: {
        backgroundColor: colors.primarySoft,
        borderColor: colors.primary,
    },
    bottomBarSaveContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomBarSaveIcon: {
        marginRight: 8,
    },
    bottomBarSaveText: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.primary,
        lineHeight: 22,
        includeFontPadding: false,
    },

    /* Hero */
    hero: {
        marginBottom: 24,
    },
    companyNameCard: {
        backgroundColor: colors.surface,
        borderRadius: radii.lg,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
        overflow: 'hidden',
        ...shadows.card,
    },
    companyNameCardInner: {
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: colors.text,
        lineHeight: 32,
        letterSpacing: -0.3,
    },
    heroMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    heroPill: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: radii.md,
        backgroundColor: colors.surfaceAlt,
        borderWidth: 1,
        borderColor: colors.border,
        minWidth: '100%',
        flex: 1,
    },
    heroPillTextWrap: {
        flex: 1,
        minWidth: 0,
    },
    heroPillLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    heroPillText: {
        fontSize: 14,
        color: colors.info,
        fontWeight: '500',
        lineHeight: 20,
    },
    fieldPillRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 4,
    },
    fieldPill: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: 'rgba(13, 148, 136, 0.14)',
    },
    fieldPillText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#0D9488',
    },

    /* Status card */
    statusCard: {
        backgroundColor: colors.surface,
        borderRadius: radii.lg,
        borderLeftWidth: 4,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 24,
        overflow: 'hidden',
        ...shadows.card,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 18,
    },
    statusIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    statusTextWrap: {
        flex: 1,
    },
    statusLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginBottom: 2,
    },
    statusValue: {
        fontSize: 17,
        fontWeight: '700',
    },
    withdrawRow: {
        paddingHorizontal: 18,
        paddingTop: 12,
        paddingBottom: 18,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    withdrawBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: radii.md,
        backgroundColor: colors.dangerSoft,
        borderWidth: 1.5,
        borderColor: colors.danger,
    },
    withdrawBtnText: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.danger,
    },
    withdrawHint: {
        marginTop: 10,
        fontSize: 12,
        color: colors.textMuted,
        textAlign: 'center',
        lineHeight: 18,
    },

    /* Sections */
    section: {
        backgroundColor: colors.surface,
        borderRadius: radii.lg,
        paddingVertical: 18,
        paddingHorizontal: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.card,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 12,
    },
    bodyText: {
        fontSize: 15,
        color: colors.text,
        lineHeight: 26,
        letterSpacing: 0.2,
    },

    /* Work setup */
    workModeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    modePill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: radii.md,
        gap: 8,
    },
    modePillText: {
        fontSize: 15,
        fontWeight: '600',
    },

    /* Apply CTA */
    applyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        borderRadius: radii.lg,
        paddingVertical: 18,
        paddingHorizontal: 20,
        marginBottom: 24,
        ...shadows.card,
    },
    applyIconWrap: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    applyBody: {
        flex: 1,
    },
    applyTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: colors.onPrimary,
        marginBottom: 4,
    },
    applySub: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
    },

    /* MOA */
    moaSection: {
        borderLeftWidth: 4,
        borderLeftColor: colors.border,
    },
    moaSectionUnlocked: {
        borderLeftColor: colors.success,
    },
    moaMessage: {
        fontSize: 15,
        color: colors.text,
        lineHeight: 22,
        marginBottom: 14,
    },
    moaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.success,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: radii.md,
    },
    moaButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.onPrimary,
    },
    moaLockRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    moaExpiryRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: radii.md,
        backgroundColor: colors.warningSoft,
        borderWidth: 1,
        borderColor: colors.warning,
        marginBottom: 12,
    },
    moaExpiryText: {
        flex: 1,
        fontSize: 14,
        color: colors.text,
        lineHeight: 20,
        fontWeight: '600',
    },
    moaLockText: {
        flex: 1,
        fontSize: 15,
        color: colors.textMuted,
        lineHeight: 22,
    },

    /* Application success modal */
    successOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    successCard: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: colors.surface,
        borderRadius: radii.xl,
        paddingVertical: 24,
        paddingHorizontal: 22,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.card,
    },
    successIconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.success,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    successTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    successMessage: {
        fontSize: 14,
        color: colors.textMuted,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    successButton: {
        marginTop: 4,
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: colors.primary,
    },
    successButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.onPrimary,
    },

    /* Withdraw confirmation modal */
    withdrawCard: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: colors.surface,
        borderRadius: radii.xl,
        paddingVertical: 24,
        paddingHorizontal: 22,
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.card,
    },
    withdrawIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.dangerSoft,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    withdrawTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 6,
    },
    withdrawMessage: {
        fontSize: 14,
        color: colors.textMuted,
        lineHeight: 20,
        marginBottom: 20,
    },
    withdrawButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    withdrawSecondaryBtn: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: colors.surfaceAlt,
    },
    withdrawSecondaryText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    withdrawPrimaryBtn: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: colors.danger,
    },
    withdrawPrimaryText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.onPrimary,
    },

    /* Placement locked modal */
    lockedCard: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: colors.surface,
        borderRadius: radii.xl,
        paddingVertical: 24,
        paddingHorizontal: 22,
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.card,
    },
    lockedIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    lockedTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 6,
    },
    lockedMessage: {
        fontSize: 14,
        color: colors.textMuted,
        lineHeight: 20,
        marginBottom: 18,
    },
    lockedButton: {
        alignSelf: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: colors.primary,
    },
    lockedButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.onPrimary,
    },

    /* Skills */
    skillsWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    skillPill: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: radii.md,
        backgroundColor: colors.surfaceAlt,
        borderWidth: 1,
        borderColor: colors.border,
    },
    skillPillText: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '500',
    },
    skillsEmptyText: {
        fontSize: 14,
        color: colors.textMuted,
        lineHeight: 22,
        fontStyle: 'italic',
    },

    /* Contact */
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    contactIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    contactContent: {
        flex: 1,
        minWidth: 0,
    },
    contactLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    contactValue: {
        fontSize: 15,
        color: colors.text,
        fontWeight: '500',
    },
    bottomSpacer: {
        height: 100,
    },
});

export default CompanyProfileScreen; 