import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSavedInternships } from '../context/SavedInternshipsContext';

type InternshipDetailsScreenRouteProp = RouteProp<RootStackParamList, 'InternshipDetails'>;

type Props = {
  route: InternshipDetailsScreenRouteProp;
};

const InternshipDetailsScreen: React.FC<Props> = ({ route }) => {
  const { post } = route.params;
  const navigation = useNavigation();
  const { savedInternships, toggleSaveInternship } = useSavedInternships();

  const isSaved = savedInternships.some(saved => saved.id === post.id);

  const openWebsite = () => {
    if (post.website) {
      Linking.openURL(post.website);
    } else {
      Alert.alert('Website not available');
    }
  };

  const openEmail = () => {
    Linking.openURL(`mailto:${post.email}`);
  };

  const openLocationInMaps = () => {
    const query = encodeURIComponent(post.location);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Internship Details</Text>
        <Icon name={isSaved ? "bookmark" : "bookmark-outline"} size={24} color="#000" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Company Name */}
        <View style={styles.companyHeader}>
          <Text style={styles.companyName}>{post.company}</Text>
          <TouchableOpacity onPress={openWebsite}>
            <Text style={styles.companyLink}>{post.website || 'Company Site'}</Text>
          </TouchableOpacity>
          <View style={styles.locationRow}>
            <Icon name="map-marker" size={16} color="#888" />
            <Text style={styles.locationText}>{post.location}</Text>
          </View>
        </View>

        {/* Company Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Company Details</Text>
          <Text style={styles.cardContent}>{post.description}</Text>
        </View>

        {/* Company Overview */}
<View style={styles.card}>
  <Text style={styles.cardTitle}>Company Overview</Text>

  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>Website:</Text>
    <TouchableOpacity onPress={openWebsite}>
      <Text style={styles.link}>{post.website || 'N/A'}</Text>
    </TouchableOpacity>
  </View>

  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>Industry:</Text>
    <Text style={styles.detailText}>{post.industry || 'N/A'}</Text>
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
          <TouchableOpacity style={styles.tagBox} onPress={() => Alert.alert('NDA Info', 'This internship requires an NDA.')}>
            <Image source={require('../assets/approved.png')} style={styles.tagIcon} />
            <Text style={styles.tagLabel}>Approved</Text>
            <Text style={styles.tagSubLabel}>MOA</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tagBox} onPress={() => Alert.alert('Mode', 'This internship is Hybrid.')}>
            <Image source={require('../assets/hybrid.png')} style={styles.tagIcon} />
            <Text style={styles.tagLabel}>Hybrid</Text>
            <Text style={styles.tagSubLabel}>Mode of Work</Text>
          </TouchableOpacity>
        </View>

        {/* Map Preview */}
        <TouchableOpacity onPress={openLocationInMaps}>
          <Image
            source={{ uri: 'https://via.placeholder.com/350x200?text=Tap+to+Open+Map' }}
            style={styles.map}
          />
        </TouchableOpacity>

        {/* Bottom Buttons */}
        <View style={styles.bottomButtons}>
          <TouchableOpacity style={styles.hiredButton}>
            <Text style={styles.hiredButtonText}>Got Hired</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, isSaved && styles.savedButton]}
            onPress={() => toggleSaveInternship(post)}
          >
            <Text style={[styles.saveText, isSaved && styles.savedText]}>
              {isSaved ? '✅ Saved Internship' : '⭐ Save Internship'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 16 },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  headerTitle: { fontSize: 16, fontWeight: 'bold' },
  companyHeader: { marginBottom: 16 },
  companyName: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  companyLink: { color: '#007bff', marginBottom: 6 },
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
  detailText: { fontSize: 14, color: '#444', marginBottom: 4 },
  link: { color: '#007bff', textDecorationLine: 'underline', marginBottom: 4 },
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
  },
  tagIcon: { width: 32, height: 32, marginBottom: 8 },
  tagLabel: { fontWeight: 'bold', color: '#0056b3' },
  tagSubLabel: { fontSize: 12, color: '#555' },
  map: {
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 30,
  },
  hiredButton: {
    flex: 1,
    backgroundColor: '#007bff',
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 14,
  },
  skillsContainer: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skill: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  noSkillsText: {
    fontSize: 14,
    color: '#888',
  },
  skillPill: {
    backgroundColor: '#e0f2f1',
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skillPillText: {
    fontSize: 14,
    color: '#00796b',
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});

export default InternshipDetailsScreen;
