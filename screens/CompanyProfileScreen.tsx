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
} from 'react-native';
import { Card, Chip, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Post } from '../App';
import { auth, firestore } from '../firebase/config';
import { doc, getDoc, setDoc, collection, addDoc } from 'firebase/firestore';
import * as FileSystem from 'expo-file-system';
import { colors, radii, shadows } from '../ui/theme';
import { Screen } from '../ui/components/Screen';
import { AppHeader } from '../ui/components/AppHeader';

type CompanyProfileRouteProp = RouteProp<RootStackParamList, 'CompanyProfile'>;
type CompanyProfileNavigationProp = StackNavigationProp<RootStackParamList, 'CompanyProfile'>;

type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'not_applied';

const CompanyProfileScreen: React.FC = () => {
    const navigation = useNavigation<CompanyProfileNavigationProp>();
    const route = useRoute<CompanyProfileRouteProp>();
    const { companyId } = route.params;

    const [company, setCompany] = useState<Post | null>(null);
    const [requirementsComplete, setRequirementsComplete] = useState(false);
    const [loadingRequirements, setLoadingRequirements] = useState(true);

    useEffect(() => {
        const loadCompany = async () => {
            try {
                const docRef = doc(firestore, 'companies', companyId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data() as any;
                    const mapped: Post = {
                        id: docSnap.id,
                        company: data.companyName || data.company || '',
                        description: data.companyDescription || data.description || '',
                        category: data.category || '',
                        location: data.companyAddress || data.location || '',
                        industry: data.fields || data.industry || '',
                        tags: Array.isArray(data.skillsREq) ? data.skillsREq : (Array.isArray(data.tags) ? data.tags : []),
                        website: data.companyWeb || data.website || '',
                        email: data.companyEmail || data.email || '',
                        contactPersonName: data.contactPersonName || data.companyContactPerson || data.contactPerson || '',
                        contactPersonPhone: data.contactPersonPhone || data.companyContactPhone || data.contactPhone || data.phone || '',
                        moa: data.moa || '',
                        modeOfWork: Array.isArray(data.modeOfWork) ? data.modeOfWork[0] : (data.modeOfWork || ''),
                        latitude: data.latitude || 0,
                        longitude: data.longitude || 0,
                        createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)) : new Date(),
                    };
                    setCompany(mapped);
                }
            } catch (error) {
                console.error('Error loading company:', error);
            }
        };
        loadCompany();
    }, [companyId]);

    const [isLoading, setIsLoading] = useState(false);
    const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>('not_applied');
    const [userProfile, setUserProfile] = useState<any>(null);

    useEffect(() => {
        // fetch profile and requirements status
        fetchUserProfile();
        checkRequirementsStatus();
    }, []);

    // when the company record has been loaded, check application status
    useEffect(() => {
        if (company) {
            checkApplicationStatus();
        }
    }, [company]);

    const checkRequirementsStatus = async () => {
        if (!auth.currentUser) {
            setLoadingRequirements(false);
            return;
        }
        try {
            const userDoc = await getDoc(doc(firestore, 'users', auth.currentUser.uid));
            if (userDoc.exists()) {
                const requirements = userDoc.data().requirements || [];
                // Requirements must be approved by adviser to unlock MOA
                const allComplete = requirements.length > 0 && requirements.every((req: any) => 
                    req.approvalStatus === 'approved' && 
                    (req.uploadedFiles && req.uploadedFiles.length > 0)
                );
                setRequirementsComplete(allComplete);
            }
        } catch (error) {
            console.error('Error checking requirements:', error);
        } finally {
            setLoadingRequirements(false);
        }
    };

    const fetchUserProfile = async () => {
        if (!auth.currentUser) return;
        try {
            const userDoc = await getDoc(doc(firestore, 'users', auth.currentUser.uid));
            if (userDoc.exists()) {
                setUserProfile(userDoc.data());
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    const handleDownloadMOA = async () => {
        if (!company?.moa) {
            Alert.alert('No MOA available', 'The MOA link is not available for this company.');
            return;
        }

        try {
            // If it's a URL, open it directly
            if (company.moa.startsWith('http')) {
                await Linking.openURL(company.moa);
            } else {
                Alert.alert('MOA Information', company.moa);
            }
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
                setApplicationStatus(applicationDoc.data().status || 'pending');
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
            Alert.alert('Success', 'Your application has been submitted successfully!');
        } catch (error) {
            console.error('Error submitting application:', error);
            Alert.alert('Error', 'Failed to submit application. Please try again.');
        } finally {
            setIsLoading(false);
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

    return (
        <Screen contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 0 }}>
            <AppHeader back title="Company profile" />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                {/* Company Header Card */}
                <Card style={styles.companyHeaderCard}>
                    <Card.Content>
                                    <View style={styles.companyHeader}>
                                        {/* removed large logo for a cleaner profile — replaced with slim accent */}
                                        <View style={[styles.cardAccent, { backgroundColor: colors.primary }]} />
                                        <View style={styles.companyInfoEnhanced}>
                                <Text style={styles.companyName}>{company.company}</Text>
                                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => openMaps(company.location)} accessibilityRole="link">
                                    <Ionicons name="location" size={16} color={colors.info} />
                                    <Text style={[styles.companyLocation, { color: colors.info, marginLeft: 6 }]}>{company.location}</Text>
                                </TouchableOpacity>
                                <Text style={styles.companyIndustry}>
                                    <Ionicons name="briefcase" size={16} color={colors.textMuted} />
                                    {' '}{company.industry}
                                </Text>
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                {/* Application Status */}
                {applicationStatus !== 'not_applied' && (
                    <Card style={styles.statusCard}>
                        <Card.Content>
                            <View style={styles.statusContainer}>
                                <Text style={styles.statusLabel}>Application Status:</Text>
                                <Chip
                                    mode="outlined"
                                    textStyle={{ color: getStatusColor(applicationStatus) }}
                                    style={[styles.statusChip, { borderColor: getStatusColor(applicationStatus) }]}
                                >
                                    {getStatusText(applicationStatus)}
                                </Chip>
                            </View>
                        </Card.Content>
                    </Card>
                )}

                {/* Company Description */}
                <Card style={styles.sectionCard}>
                    <Card.Content>
                        <Text style={styles.sectionTitle}>About the Company</Text>
                        <Text style={styles.description}>{company.description}</Text>
                    </Card.Content>
                </Card>

                {/* Work Details */}
                <Card style={styles.sectionCard}>
                    <Card.Content>
                        <Text style={styles.sectionTitle}>Work Details</Text>
                        <View style={styles.detailRow}>
                            <Ionicons name="time" size={20} color={(() => {
                                const m = (company.modeOfWork || '').toString().toLowerCase();
                                if (m.includes('remote')) return colors.success;
                                if (m.includes('hybrid')) return colors.warning;
                                if (m.includes('site') || m.includes('on-site') || m.includes('onsite') || m.includes('on site')) return colors.primary;
                                return colors.textMuted;
                            })()} />
                            <Text style={styles.detailText}>Mode: {company.modeOfWork || 'Not specified'}</Text>
                        </View>
                    </Card.Content>
                </Card>

                {/* MOA Download Section */}
                {company.moa && (
                    <Card style={[styles.sectionCard, { borderLeftWidth: 4, borderLeftColor: requirementsComplete ? colors.success : colors.danger }]}>
                        <Card.Content>
                            <Text style={styles.sectionTitle}>Memorandum of Agreement (MOA)</Text>
                            {loadingRequirements ? (
                                <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 8 }} />
                            ) : requirementsComplete ? (
                                <>
                                    <Text style={styles.description}>✓ Requirements approved! You can now download the MOA.</Text>
                                    <TouchableOpacity
                                        style={[styles.moaButton, { backgroundColor: colors.success }]}
                                        onPress={handleDownloadMOA}
                                    >
                                        <Ionicons name="download" size={18} color={colors.onPrimary} style={{ marginRight: 8 }} />
                                        <Text style={styles.moaButtonText}>Download MOA</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <Text style={styles.description}>⚠ Submit all requirements and wait for adviser approval to unlock the MOA.</Text>
                                    <TouchableOpacity
                                        style={[styles.moaButton, { backgroundColor: colors.primary }]}
                                        onPress={() => navigation.navigate('RequirementsChecklist')}
                                    >
                                        <Ionicons name="documents" size={18} color={colors.onPrimary} style={{ marginRight: 8 }} />
                                        <Text style={styles.moaButtonText}>Submit Requirements to Unlock</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </Card.Content>
                    </Card>
                )}

                {/* Required Skills */}
                <Card style={styles.sectionCard}>
                    <Card.Content>
                        <Text style={styles.sectionTitle}>Required Skills</Text>
                        <View style={styles.skillsContainer}>
                            {company.tags && company.tags.map((skill: string, index: number) => (
                                <Chip key={index} style={styles.skillChip} mode="outlined">
                                    {skill}
                                </Chip>
                            ))}
                        </View>
                    </Card.Content>
                </Card>

                {/* Contact Information */}
                <Card style={styles.sectionCard}>
                    <Card.Content>
                        <Text style={styles.sectionTitle}>Contact Information</Text>
                        <Text style={styles.sectionSubtitle}>Company's primary contact details</Text>
                        {company.location ? (
                            <TouchableOpacity style={styles.contactRow} onPress={() => openMaps(company.location)} accessibilityRole="link">
                                <Ionicons name="location" size={20} color={colors.info} />
                                <Text style={[styles.infoText, { flex: 1, marginLeft: 8 }]}>{company.location}</Text>
                                <Ionicons name="open-outline" size={16} color={colors.textMuted} />
                            </TouchableOpacity>
                        ) : null}
                        {company.email && (
                            <TouchableOpacity style={styles.contactRow} onPress={() => handleContact('email')}>
                                <Ionicons name="mail" size={20} color={colors.info} />
                                <Text style={styles.contactText}>{company.email}</Text>
                                <Ionicons name="open-outline" size={16} color={colors.textMuted} />
                            </TouchableOpacity>
                        )}
                        {company.website && (
                            <TouchableOpacity style={styles.contactRow} onPress={() => handleContact('website')}>
                                <Ionicons name="globe" size={20} color={colors.info} />
                                <Text style={styles.contactText}>{company.website}</Text>
                                <Ionicons name="open-outline" size={16} color={colors.textMuted} />
                            </TouchableOpacity>
                        )}
                    </Card.Content>
                </Card>

                {/* Contact Person Information */}
                <Card style={styles.sectionCard}>
                    <Card.Content>
                        <Text style={styles.sectionTitle}>Contact Person Information</Text>
                        <Text style={styles.sectionSubtitle}>Optional contact details for the company representative</Text>

                        {company.contactPersonName ? (
                            <View style={styles.contactRow}>
                                <Ionicons name="person" size={20} color={colors.textMuted} />
                                <Text style={[styles.infoText, { marginLeft: 8, flex: 1 }]}>{company.contactPersonName}</Text>
                            </View>
                        ) : (
                            <View style={styles.contactRow}>
                                <Ionicons name="person" size={20} color={colors.textMuted} />
                                <Text style={[styles.mutedText, { marginLeft: 8, flex: 1 }]}>Not provided</Text>
                            </View>
                        )}

                        {company.contactPersonPhone ? (
                            <TouchableOpacity style={styles.contactRow} onPress={() => handleContact('phone')} accessibilityRole="link">
                                <Ionicons name="call" size={20} color={colors.info} />
                                <Text style={styles.contactText}>{company.contactPersonPhone}</Text>
                                <Ionicons name="open-outline" size={16} color={colors.textMuted} />
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.contactRow}>
                                <Ionicons name="call" size={20} color={colors.textMuted} />
                                <Text style={[styles.mutedText, { marginLeft: 8, flex: 1 }]}>Not provided</Text>
                            </View>
                        )}
                    </Card.Content>
                </Card>

                {/* Apply Button */}
                {applicationStatus === 'not_applied' && (
                    <View style={styles.applyContainer}>
                        <Button
                            mode="contained"
                            onPress={handleApply}
                            loading={isLoading}
                            disabled={isLoading}
                            style={styles.applyButton}
                            contentStyle={styles.applyButtonContent}
                        >
                            Apply for Internship
                        </Button>
                    </View>
                )}

                {/* Spacer for bottom nav */}
                <View style={{ height: 100 }} />
            </ScrollView>
        </Screen>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: colors.primary,
        borderBottomWidth: 0,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.onPrimary,
    },
    scrollView: {
        flex: 1,
        padding: 16,
    },
    companyHeaderCard: {
        marginBottom: 16,
        elevation: 3,
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 0,
    },
    companyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    /* circular logo removed - using a slim accent stripe */
    cardAccent: {
        width: 8,
        height: 64,
        borderRadius: 4,
        marginRight: 12,
    },
    companyInfoEnhanced: {
        flex: 1,
        paddingVertical: 4,
        paddingRight: 6,
    },
    companyInfo: {
        flex: 1,
    },
    companyName: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.text,
        marginBottom: 6,
    },
    companyLocation: {
        fontSize: 13,
        color: colors.textMuted,
        marginBottom: 2,
    },
    companyIndustry: {
        fontSize: 13,
        color: colors.textMuted,
    },
    statusCard: {
        marginBottom: 16,
        elevation: 2,
        borderRadius: 12,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statusLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    statusChip: {
        height: 28,
    },
    sectionCard: {
        marginBottom: 16,
        elevation: 2,
        borderRadius: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 12,
    },
    sectionSubtitle: {
        marginTop: -6,
        marginBottom: 10,
        color: colors.textMuted,
        fontSize: 13,
        lineHeight: 18,
    },
    description: {
        fontSize: 16,
        color: colors.textMuted,
        lineHeight: 24,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailText: {
        fontSize: 16,
        color: colors.textMuted,
        marginLeft: 8,
    },
    
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    skillChip: {
        marginBottom: 8,
    },
    moaButton: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
    },
    moaButtonText: {
        color: colors.onPrimary,
        fontSize: 16,
        fontWeight: '600',
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    contactText: {
        fontSize: 16,
        color: colors.primary,
        marginLeft: 8,
        flex: 1,
    },
    infoText: {
        fontSize: 16,
        color: colors.text,
    },
    mutedText: {
        fontSize: 16,
        color: colors.textMuted,
    },
    applyContainer: {
        marginTop: 24,
        marginBottom: 16,
    },
    applyButton: {
        borderRadius: 8,
        elevation: 2,
    },
    applyButtonContent: {
        paddingVertical: 8,
    },
});

export default CompanyProfileScreen; 