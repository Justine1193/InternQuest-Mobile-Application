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
    const { company } = route.params;

    const [isLoading, setIsLoading] = useState(false);
    const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>('not_applied');
    const [userProfile, setUserProfile] = useState<any>(null);

    useEffect(() => {
        checkApplicationStatus();
        fetchUserProfile();
    }, []);

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
            const applicationRef = doc(firestore, 'applications', `${auth.currentUser.uid}_${company.id}`);
            const applicationDoc = await getDoc(applicationRef);
            if (applicationDoc.exists()) {
                setApplicationStatus(applicationDoc.data().status || 'pending');
            }
        } catch (error) {
            console.error('Error checking application status:', error);
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
                companyId: company.id,
                companyName: company.company,
                status: 'pending',
                appliedAt: new Date(),
                userProfile: {
                    name: userProfile.name || userProfile.firstName + ' ' + userProfile.lastName,
                    email: userProfile.email,
                    course: userProfile.course,
                    skills: userProfile.skills || [],
                },
            };

            const applicationRef = doc(firestore, 'applications', `${auth.currentUser.uid}_${company.id}`);
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
                if (company.email) {
                    Linking.openURL(`mailto:${company.email}`);
                }
                break;
            case 'website':
                if (company.website) {
                    Linking.openURL(company.website);
                }
                break;
            case 'phone':
                // Add phone number if available
                break;
        }
    };

    const getStatusColor = (status: ApplicationStatus) => {
        switch (status) {
            case 'approved': return '#4CAF50';
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

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Company Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Company Header Card */}
                <Card style={styles.companyHeaderCard}>
                    <Card.Content>
                        <View style={styles.companyHeader}>
                            <View style={styles.companyLogo}>
                                <Ionicons name="business" size={40} color="#2196F3" />
                            </View>
                            <View style={styles.companyInfo}>
                                <Text style={styles.companyName}>{company.company}</Text>
                                <Text style={styles.companyLocation}>
                                    <Ionicons name="location" size={16} color="#666" />
                                    {' '}{company.location}
                                </Text>
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
                            <Ionicons name="time" size={20} color="#666" />
                            <Text style={styles.detailText}>Mode: {company.modeOfWork || 'Not specified'}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Ionicons name="document" size={20} color="#666" />
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
    companyHeaderCard: {
        marginBottom: 16,
        elevation: 2,
        borderRadius: 12,
    },
    companyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    companyLogo: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#f0f8ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    companyInfo: {
        flex: 1,
    },
    companyName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    companyLocation: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    companyIndustry: {
        fontSize: 14,
        color: '#666',
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