import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSavedInternships } from '../context/SavedInternshipsContext';
import { Platform } from 'react-native';
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, firestore } from '../firebase/config';

// Types
import type { NavigationProp } from '@react-navigation/native';

type InternshipDetailsScreenRouteProp = RouteProp<RootStackParamList, 'InternshipDetails'>;

type Props = {
  route: InternshipDetailsScreenRouteProp;
};

type WorkMode = {
  type: string;
  description: string;
  icon: string;
};

const modeConfig: Record<string, WorkMode> = {
  hybrid: {
    type: 'Hybrid',
    description: 'Combination of remote and on-site work',
    icon: 'home-city',
  },
  remote: {
    type: 'Remote',
    description: 'Work from anywhere',
    icon: 'laptop',
  },
  onsite: {
    type: 'On-Site',
    description: 'Work at company location',
    icon: 'office-building',
  },
};

const InternshipDetailsScreen: React.FC<Props> = ({ route }) => {
  const { post } = route.params;
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { savedInternships, toggleSaveInternship } = useSavedInternships();
  const isSaved = savedInternships.some(saved => saved.id === post.id);

  // State
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isHired, setIsHired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [workMode, setWorkMode] = useState<WorkMode>({
    type: 'Loading...',
    description: 'Loading work mode...',
    icon: 'home-city',
  });
  const [refreshing, setRefreshing] = useState(false);

  // Geocode the location to get latitude and longitude
  useEffect(() => {
    const geocodeLocation = async () => {
      if (!post.location) {
        Alert.alert('Error', 'No location provided for this internship.');
        return;
      }
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(post.location)}&key=AIzaSyBqKcbvrNZzqs8G43VkWb-THJYVozjI9T0`
        );
        const data = await response.json();
        if (data.status === 'OK' && data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry.location;
          setCoordinates({ latitude: lat, longitude: lng });
        } else {
          Alert.alert('Geocoding Error', 'Unable to find coordinates for the given location.');
        }
      } catch (error) {
        Alert.alert('Geocoding Error', 'There was an issue with retrieving the location.');
      }
    };
    geocodeLocation();
  }, [post.location]);

  // Check if user is already hired
  useEffect(() => {
    const checkHiredStatus = async () => {
      if (!auth.currentUser) return;
      try {
        const userDocRef = doc(firestore, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const status = typeof userData.status === 'string' ? userData.status.toLowerCase() : '';
          setIsHired(status === 'hired');
        }
      } catch (error) {
        console.error('Error checking hired status:', error);
      }
    };
    checkHiredStatus();
  }, []);

  // Fetch work mode (company info)
  const fetchWorkMode = useCallback(async () => {
    try {
      const companyRef = doc(firestore, 'companies', post.id);
      const companyDoc = await getDoc(companyRef);
      if (companyDoc.exists()) {
        const data = companyDoc.data();
        // Get the mode from the array or fallback to 'hybrid'
        const modeRaw = Array.isArray(data.modeOfWork) ? data.modeOfWork[0] : data.modeOfWork || 'hybrid';
        const modeKey = (modeRaw as string).toLowerCase().replace(/\s|-/g, '');
        const validKeys = ['hybrid', 'remote', 'onsite'];
        const safeModeKey = validKeys.includes(modeKey) ? (modeKey as keyof typeof modeConfig) : 'hybrid';
        setWorkMode(modeConfig[safeModeKey]);
      }
    } catch (error) {
      console.error('Error fetching work mode:', error);
      Alert.alert('Error', 'Failed to load work mode information');
    }
  }, [post.id]);

  useEffect(() => {
    fetchWorkMode();
  }, [fetchWorkMode]);

  // Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWorkMode();
    setRefreshing(false);
  };

  // UI Handlers
  const openWebsite = () => {
    if (post.website) {
      Linking.openURL(post.website);
    } else {
      Alert.alert('Website not available');
    }
  };
  const openEmail = () => Linking.openURL(`mailto:${post.email}`);
  const openLocationInMaps = () => {
    const query = encodeURIComponent(post.location);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  const handleGotHiredPress = async () => {
    if (!auth.currentUser) {
      Alert.alert('Error', 'You must be logged in to update your status');
      return;
    }

    if (isHired) {
      Alert.alert(
        'Already Hired',
        'You have already been hired by another company. Please update your status in your profile if you want to change companies.',
        [
          {
            text: 'Go to Profile',
            onPress: () => navigation.navigate('Profile')
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
      return;
    }

    setIsLoading(true);
    try {
      // First show confirmation dialog
      Alert.alert(
        'Confirm Status Update',
        'Are you sure you want to update your status to "Hired" for ' + post.company + '? This can only be changed from your profile.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setIsLoading(false)
          },
          {
            text: 'Yes, Update Status',
            onPress: async () => {
              try {
                const userId = auth.currentUser!.uid;
                const userDocRef = doc(firestore, "users", userId);

                // Update status in Firestore
                await setDoc(userDocRef, {
                  status: 'hired',
                  company: post.company,
                  hiredAt: serverTimestamp(),
                  lastUpdated: serverTimestamp()
                }, { merge: true });

                setIsHired(true);

                // Show success message
                Alert.alert(
                  'Success!',
                  'Your status has been updated to "Hired". You can now track your OJT hours.',
                  [
                    {
                      text: 'Go to OJT Tracker',
                      onPress: () => {
                        navigation.navigate('OJTTracker', {
                          post,
                        });
                      }
                    }
                  ]
                );
              } catch (error) {
                console.error('Error updating status:', error);
                Alert.alert('Error', 'Failed to update status. Please try again.');
              } finally {
                setIsLoading(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error in handleGotHiredPress:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSaveInternship = () => {
    Alert.alert(
      isSaved ? 'Remove from Saved?' : 'Save Internship?',
      isSaved
        ? 'Are you sure you want to remove this internship from your saved list?'
        : 'Would you like to save this internship for later?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: isSaved ? 'Yes, Remove' : 'Yes, Save',
          onPress: () => {
            toggleSaveInternship(post);
            Alert.alert(
              'Success',
              isSaved
                ? 'Internship removed from saved list'
                : 'Internship saved successfully!',
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Internship Details</Text>
        <TouchableOpacity onPress={handleSaveInternship}>
          <Icon name={isSaved ? "bookmark" : "bookmark-outline"} size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={true}
        bounces={true}
        overScrollMode="always"
        scrollEventThrottle={16}
      >
        {/* Content starts here */}
        <View style={styles.contentContainer}>
          {/* Company Name */}
          <View style={styles.companyHeader}>
            <View style={[styles.cardAccent, { backgroundColor: '#6366F1' }]} />
            <View style={styles.companyNameRow}>
              <Text style={styles.companyName}>{post.company}</Text>
            <TouchableOpacity onPress={openWebsite}>
              <Text style={styles.companyLink}>{post.website || 'Company Site'}</Text>
            </TouchableOpacity>
              <View style={styles.locationRow}>
              <Icon name="map-marker" size={16} color="#9ca3af" />
              <Text style={styles.locationText}>{post.location}</Text>
              </View>
            </View>
          </View>

          {/* Company Details */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Company Details</Text>
            <Text style={styles.cardContent}>{post.description}</Text>
          </View>
        </View>

        {/* Company Overview */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Company Overview</Text>
          <View style={styles.infoTable}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Website:</Text>
              <TouchableOpacity onPress={openWebsite} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.link}>{post.website || 'N/A'}</Text>
                  {post.website && (
                  <Icon name="open-in-new" size={16} color="#6366F1" style={{ marginLeft: 4 }} />
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Field:</Text>
              <Text style={styles.detailText}>
                {Array.isArray(post.industry)
                  ? post.industry.join(', ')
                  : post.industry || 'N/A'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location:</Text>
              <Text style={styles.detailText}>{post.location || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <TouchableOpacity onPress={openEmail}>
                <Text style={styles.link}>{post.email || 'N/A'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Skills Required */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Skills Required</Text>
          {post.tags && post.tags.length > 0 ? (
            <View style={styles.skillsContainer}>
              {post.tags.map((tag, index) => (
                <View key={index} style={styles.skillPill}>
                  <Text style={styles.skillPillText}>{tag}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noSkillsText}>No specific skills required.</Text>
          )}
        </View>

        {/* Tags */}
        <View style={styles.tagRow}>
          <TouchableOpacity
            style={styles.tagBox}
            onPress={() => Alert.alert('NDA Info', 'This internship requires an NDA.')}
          >
            {/* removed large icon, keeping concise label */}
            <View style={[styles.smallBadge, { backgroundColor: '#eef2ff' }]} />
            <Text style={styles.tagLabel}>Approved</Text>
            <Text style={styles.tagSubLabel}>MOA</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tagBox}
            onPress={() => Alert.alert('Work Mode', workMode.description)}
          >
            <View style={[styles.smallBadge, { backgroundColor: '#e6fffa' }]} />
            <Text style={styles.tagLabel}>{workMode.type}</Text>
            <Text style={styles.tagSubLabel}>Mode of Work</Text>
          </TouchableOpacity>
        </View>

        {/* Map Preview */}
        <View style={styles.mapContainer}>
          <TouchableOpacity
            style={styles.map}
            onPress={openLocationInMaps}
            activeOpacity={0.9}
          >
            {/* Avoid importing react-native-maps on web (native-only). Use require at runtime. */}
            {Platform.OS !== 'web' ? (
              // Use dynamic require so bundler will not include native-only modules for web
              (() => {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const rnMaps: any = require('react-native-maps');
                const MapViewComp = rnMaps.default || rnMaps;
                const MarkerComp = rnMaps.Marker;

                const region = coordinates
                  ? {
                      latitude: coordinates.latitude,
                      longitude: coordinates.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }
                  : {
                      latitude: 14.5995,
                      longitude: 120.9842,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    };

                return (
                  <MapViewComp
                    style={styles.mapView}
                    initialRegion={region}
                    scrollEnabled={false}
                    zoomEnabled={false}
                    pitchEnabled={false}
                    rotateEnabled={false}
                  >
                    <MarkerComp coordinate={{ latitude: region.latitude, longitude: region.longitude }} title={post.company} description={post.location} />
                  </MapViewComp>
                );
              })()
            ) : (
              <View style={[styles.mapView, styles.mapFallback]}>
                <Text style={styles.mapFallbackText}>Map preview unavailable on web</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, isSaved && styles.savedButton]}
            onPress={handleSaveInternship}
          >
            <Text style={[styles.saveText, isSaved && styles.savedText]}>
              {isSaved ? '✅ Saved Internship' : '⭐ Save Internship'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Extra padding at the bottom for better scrolling */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f6ff'
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  contentContainer: {
    width: '100%',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#6366F1',
    borderBottomWidth: 0,
    zIndex: 10,
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  companyHeader: { marginBottom: 16, flexDirection: 'row', alignItems: 'center' },
  cardAccent: { width: 8, height: 64, borderRadius: 4, marginRight: 12 },
  companyNameRow: { flex: 1 },
  companyName: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  companyLink: { color: '#6366F1', marginBottom: 6 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationText: { color: '#555', marginLeft: 4 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  cardContent: { fontSize: 14, color: '#444' },
  infoTable: {
    marginTop: 8,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 14,
    minWidth: 80,
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#444',
    flex: 1,
    flexWrap: 'wrap',
  },
  link: {
    color: '#6366F1',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  tagRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  tagBox: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#e6f0ff',
    flex: 1,
    marginHorizontal: 6,
    minHeight: 100,
  },
  smallBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    marginBottom: 8,
  },
  tagIcon: {
    marginBottom: 8,
  },
  tagLabel: { fontWeight: 'bold', color: '#6366F1' },
  tagSubLabel: { fontSize: 12, color: '#555' },
  mapContainer: {
    height: 200,
    marginBottom: 20,
    width: '100%',
  },
  map: {
    height: 200,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  mapView: {
    height: 200,
    width: '100%',
    borderRadius: 12,
  },
  mapFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef2f6',
    borderRadius: 12,
  },
  mapFallbackText: {
    color: '#6b7280',
    fontSize: 13,
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 30,
  },
  hiredButton: {
    flex: 1,
    backgroundColor: '#6366F1',
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  hiredButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#e0f7fa',
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  savedButton: {
    backgroundColor: '#00796b',
  },
  saveText: {
    color: '#00796b',
    fontWeight: 'bold',
  },
  savedText: {
    color: '#fff',
  },
  skillsContainer: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillPill: {
    backgroundColor: '#e0f2f1',
    borderRadius: 10,
    marginRight: 2,
    marginBottom: 2,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  skillPillText: {
    fontSize: 12,
    color: '#00796b',
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  noSkillsText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  loadingButton: {
    opacity: 0.8,
  },
});

export default InternshipDetailsScreen;

