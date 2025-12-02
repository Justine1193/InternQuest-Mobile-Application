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

type CompanyProfileRouteProp = RouteProp<RootStackParamList, 'CompanyProfile'>;
type CompanyProfileNavigationProp = StackNavigationProp<RootStackParamList, 'CompanyProfile'>;

type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'not_applied';

const CompanyProfileScreen: React.FC = () => {
    const navigation = useNavigation<CompanyProfileNavigationProp>();
    const route = useRoute<CompanyProfileRouteProp>();
    const { companyId } = route.params;

    const [company, setCompany] = useState<Post | null>(null);

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
        // fetch profile regardless
        fetchUserProfile();
    }, []);

    // when the company record has been loaded, check application status
    useEffect(() => {
        if (company) {
            checkApplicationStatus();
        }
    }, [company]);

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
            const applicationData = {
                userId: auth.currentUser.uid,
                companyId: company!.id,
                companyName: company!.company,
                status: 'pending',
                appliedAt: new Date(),
                userProfile: {
                    name: userProfile.name || userProfile.firstName + ' ' + userProfile.lastName,
                    email: userProfile.email,
                    course: userProfile.course,
                    skills: userProfile.skills || [],
                },
            };

            const applicationRef = doc(firestore, 'applications', `${auth.currentUser.uid}_${company!.id}`);
            await setDoc(applicationRef, applicationData);

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
                // Add phone number if available
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
            case 'approved': return '#2ab0b4ff';
            case 'rejected': return '#F44336';
            case 'pending': return '#FF9800';
            default: return '#757575';
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
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#6366F1" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Company Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Company Header Card */}
                <Card style={styles.companyHeaderCard}>
                    <Card.Content>
                                    <View style={styles.companyHeader}>
                                        {/* removed large logo for a cleaner profile — replaced with slim accent */}
                                        <View style={[styles.cardAccent, { backgroundColor: '#6366F1' }]} />
                                        <View style={styles.companyInfoEnhanced}>
                                <Text style={styles.companyName}>{company.company}</Text>
                                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => openMaps(company.location)} accessibilityRole="link">
                                    <Ionicons name="location" size={16} color="#1e88e5" />
                                    <Text style={[styles.companyLocation, { color: '#1e88e5', marginLeft: 6 }]}>{company.location}</Text>
                                </TouchableOpacity>
                                <Text style={styles.companyIndustry}>
                                    <Ionicons name="briefcase" size={16} color="#666" />
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
                                if (m.includes('remote')) return '#10B981';
                                if (m.includes('hybrid')) return '#F59E0B';
                                if (m.includes('site') || m.includes('on-site') || m.includes('onsite') || m.includes('on site')) return '#6366F1';
                                return '#6b7280';
                            })()} />
                            <Text style={styles.detailText}>Mode: {company.modeOfWork || 'Not specified'}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Ionicons name="document" size={20} color={(() => {
                                const s = String(company.moa || '').toLowerCase();
                                if (['yes', 'y', 'true', '1'].includes(s)) return '#4CAF50';
                                return '#F44336';
                            })()} />
                            <Text style={styles.detailText}>MOA: {company.moa || 'Not specified'}</Text>
                        </View>
                    </Card.Content>
                </Card>

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
                        {company.email && (
                            <TouchableOpacity style={styles.contactRow} onPress={() => handleContact('email')}>
                                <Ionicons name="mail" size={20} color="#2196F3" />
                                <Text style={styles.contactText}>{company.email}</Text>
                                <Ionicons name="open-outline" size={16} color="#666" />
                            </TouchableOpacity>
                        )}
                        {company.website && (
                            <TouchableOpacity style={styles.contactRow} onPress={() => handleContact('website')}>
                                <Ionicons name="globe" size={20} color="#2196F3" />
                                <Text style={styles.contactText}>{company.website}</Text>
                                <Ionicons name="open-outline" size={16} color="#666" />
                            </TouchableOpacity>
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
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
        color: '#111827',
        marginBottom: 6,
    },
    companyLocation: {
        fontSize: 13,
        color: '#6b7280',
        marginBottom: 2,
    },
    companyIndustry: {
        fontSize: 13,
        color: '#6b7280',
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
        color: '#333',
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
        color: '#333',
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailText: {
        fontSize: 16,
        color: '#666',
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
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    contactText: {
        fontSize: 16,
        color: '#2196F3',
        marginLeft: 8,
        flex: 1,
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