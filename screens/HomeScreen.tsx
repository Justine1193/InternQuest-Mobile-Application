import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Modal,
} from 'react-native';
import BottomNavbar from '../components/BottomNav';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Post as BasePost } from '../App';
import { Ionicons } from '@expo/vector-icons';
import { useSavedInternships } from '../context/SavedInternshipsContext';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../firebase/config';
import { auth } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';

type Post = BasePost & { createdAt?: Date };

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

const userPreferences = ['Programming', 'AI', 'React Native', 'Cloud'];

// Advanced filter options
const locationOptions = ['Manila', 'Quezon City', 'Makati', 'Taguig', 'Pasig', 'All Locations'];
const industryOptions = ['Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing', 'All Industries'];
const workModeOptions = ['On-site', 'Remote', 'Hybrid', 'All Modes'];

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('Most Recent');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [companies, setCompanies] = useState<Post[]>([]);
  const { savedInternships, toggleSaveInternship } = useSavedInternships();
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const [refreshing, setRefreshing] = useState(false);
  const [userFields, setUserFields] = useState<string[]>([]);
  const [userSkills, setUserSkills] = useState<string[]>([]);

  // Advanced filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedIndustry, setSelectedIndustry] = useState('All Industries');
  const [selectedWorkMode, setSelectedWorkMode] = useState('All Modes');

  const fetchCompanies = async () => {
    try {
      setRefreshing(true);
      const querySnapshot = await getDocs(collection(firestore, 'companies'));
      const companyData: Post[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          company: data.companyName || '',
          description: data.companyDescription || '',
          category: data.category || '',
          location: data.companyAddress || '',
          industry: data.fields || '',
          tags: data.skillsREq || [],
          website: data.companyWeb || '',
          email: data.companyEmail || '',
          moa: data.moa || '',
          modeOfWork: Array.isArray(data.modeofwork) ? data.modeofwork[0] : data.modeofwork || '',
          latitude: data.latitude || 0,
          longitude: data.longitude || 0,
          createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)) : new Date(),
        };
      });
      setCompanies(companyData);
    } catch (error) {
      console.error('Error fetching companies: ', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    const fetchUserFieldsAndSkills = async () => {
      if (!auth.currentUser) return;
      try {
        const userDoc = await getDoc(doc(firestore, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const fields = Array.isArray(data.field) ? data.field : [data.field];
          setUserFields(fields.filter(Boolean));
          const skills = Array.isArray(data.skills) ? data.skills : [];
          setUserSkills(skills.filter(Boolean));
        }
      } catch (error) {
        console.error('Failed to fetch user fields/skills:', error);
      }
    };
    fetchUserFieldsAndSkills();
  }, []);

  // Remove skills dropdown and best matches logic
  // Only keep Most Recent and Saved Internship
  const filteredPosts = (activeFilter === 'Saved Internship' ? savedInternships : companies)
    .filter(post => {
      // Search text filter
      return post.company.toLowerCase().includes(searchText.toLowerCase()) ||
        post.description.toLowerCase().includes(searchText.toLowerCase());
    })
    .sort((a, b) => {
      // Only sort by Most Recent
      return (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0);
    });

  const handleToggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Helper function to format 'time ago'
  function timeAgo(date: Date) {
    if (!date) return '';
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  const getCompanyLogo = (companyName: string) => {
    const firstLetter = companyName.charAt(0).toUpperCase();
    const colors = ['#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336', '#00BCD4'];
    const colorIndex = companyName.length % colors.length;
    return { letter: firstLetter, color: colors[colorIndex] };
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Internships</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowAdvancedFilters(true)}
        >
          <Ionicons name="filter" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchCompanies} />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search companies, skills, or locations..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
        </View>

        {/* Quick Filters */}
        <View style={styles.topFilters}>
          {['Most Recent', 'Saved Internship'].map((label, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.filterPill, activeFilter === label && styles.activeFilter]}
              onPress={() => setActiveFilter(label)}
            >
              <Text style={[styles.filterPillText, activeFilter === label && styles.activeFilterText]}>
                {label}
              </Text>
              {activeFilter === label && <Ionicons name="checkmark" size={16} color="#fff" style={{ marginLeft: 4 }} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Active Filters Display */}
        {(selectedLocation !== 'All Locations' ||
          selectedIndustry !== 'All Industries' || selectedWorkMode !== 'All Modes') && (
            <View style={styles.activeFiltersContainer}>
              <Text style={styles.activeFiltersLabel}>Active Filters:</Text>
              <View style={styles.activeFiltersList}>
                {selectedLocation !== 'All Locations' && (
                  <View style={styles.activeFilterChip}>
                    <Text style={styles.activeFilterChipText}>{selectedLocation}</Text>
                    <TouchableOpacity onPress={() => setSelectedLocation('All Locations')}>
                      <Ionicons name="close" size={14} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}
                {selectedIndustry !== 'All Industries' && (
                  <View style={styles.activeFilterChip}>
                    <Text style={styles.activeFilterChipText}>{selectedIndustry}</Text>
                    <TouchableOpacity onPress={() => setSelectedIndustry('All Industries')}>
                      <Ionicons name="close" size={14} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}
                {selectedWorkMode !== 'All Modes' && (
                  <View style={styles.activeFilterChip}>
                    <Text style={styles.activeFilterChipText}>{selectedWorkMode}</Text>
                    <TouchableOpacity onPress={() => setSelectedWorkMode('All Modes')}>
                      <Ionicons name="close" size={14} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}

        {/* Results Count */}
        <Text style={styles.resultsCount}>
          {filteredPosts.length} internship{filteredPosts.length !== 1 ? 's' : ''} found
        </Text>

        {/* Company Cards */}
        {filteredPosts.map(post => {
          const logo = getCompanyLogo(post.company);
          return (
            <TouchableOpacity
              key={post.id}
              style={styles.card}
              onPress={() => navigation.navigate('CompanyProfile', { company: post })}
            >
              <View style={styles.cardHeader}>
                <View style={styles.companyInfo}>
                  <View style={[styles.companyLogo, { backgroundColor: logo.color }]}>
                    <Text style={styles.companyLogoText}>{logo.letter}</Text>
                  </View>
                  <View style={styles.companyDetails}>
                    <Text style={styles.companyName}>{post.company}</Text>
                    <Text style={styles.companyLocation}>
                      <Ionicons name="location" size={14} color="#666" />
                      {' '}{post.location}
                    </Text>
                    <Text style={styles.companyIndustry}>
                      <Ionicons name="briefcase" size={14} color="#666" />
                      {' '}{post.industry}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => toggleSaveInternship(post)}
                  style={styles.bookmarkButton}
                >
                  <Ionicons
                    name={savedInternships.some(saved => saved.id === post.id) ? 'bookmark' : 'bookmark-outline'}
                    size={20}
                    color="#007aff"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.descriptionContainer}>
                <Text style={styles.description}>
                  {expanded[post.id] ? post.description : post.description.substring(0, 120) + '...'}
                </Text>
                <TouchableOpacity onPress={() => handleToggleExpand(post.id)}>
                  <Text style={styles.readMore}>{expanded[post.id] ? 'Show Less' : 'Read More'}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.tagContainer}>
                  {post.tags.slice(0, 3).map((tag, idx) => (
                    <View key={idx} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                  {post.tags.length > 3 && (
                    <Text style={styles.moreTagsText}>+{post.tags.length - 3} more</Text>
                  )}
                </View>

                <View style={styles.cardMeta}>
                  <Text style={styles.workMode}>{post.modeOfWork}</Text>
                  <Text style={styles.timeStamp}>{timeAgo(post.createdAt ?? new Date())}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Advanced Filters Modal */}
      <Modal
        visible={showAdvancedFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAdvancedFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Advanced Filters</Text>
              <TouchableOpacity onPress={() => setShowAdvancedFilters(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Location Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Location</Text>
                <View style={styles.filterOptions}>
                  {locationOptions.map((location, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.filterOption,
                        selectedLocation === location && styles.selectedFilterOption
                      ]}
                      onPress={() => setSelectedLocation(location)}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        selectedLocation === location && styles.selectedFilterOptionText
                      ]}>
                        {location}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Industry Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Industry</Text>
                <View style={styles.filterOptions}>
                  {industryOptions.map((industry, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.filterOption,
                        selectedIndustry === industry && styles.selectedFilterOption
                      ]}
                      onPress={() => setSelectedIndustry(industry)}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        selectedIndustry === industry && styles.selectedFilterOptionText
                      ]}>
                        {industry}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Work Mode Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Work Mode</Text>
                <View style={styles.filterOptions}>
                  {workModeOptions.map((mode, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.filterOption,
                        selectedWorkMode === mode && styles.selectedFilterOption
                      ]}
                      onPress={() => setSelectedWorkMode(mode)}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        selectedWorkMode === mode && styles.selectedFilterOptionText
                      ]}>
                        {mode}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={() => {
                  setSelectedLocation('All Locations');
                  setSelectedIndustry('All Industries');
                  setSelectedWorkMode('All Modes');
                  setSelectedTags([]);
                }}
              >
                <Text style={styles.clearFiltersText}>Clear All Filters</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyFiltersButton}
                onPress={() => setShowAdvancedFilters(false)}
              >
                <Text style={styles.applyFiltersText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={styles.ojtTrackerButton}
        onPress={() => navigation.navigate('OJTTracker', {})}
      >
        <Ionicons name="calendar" size={24} color="#fff" />
      </TouchableOpacity>

      <BottomNavbar navigation={navigation} currentRoute="Home" />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  topFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  activeFilter: {
    backgroundColor: '#007aff',
    borderColor: '#007aff',
  },
  filterPillText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#fff',
  },
  activeFiltersContainer: {
    marginBottom: 16,
  },
  activeFiltersLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  activeFiltersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activeFilterChip: {
    backgroundColor: '#007aff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeFilterChipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  companyInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  companyLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  companyLogoText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  companyDetails: {
    flex: 1,
  },
  companyName: {
    fontSize: 18,
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
  bookmarkButton: {
    padding: 8,
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  readMore: {
    color: '#007aff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    gap: 6,
  },
  tag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    color: '#1976d2',
    fontSize: 12,
    fontWeight: '500',
  },
  moreTagsText: {
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
  },
  cardMeta: {
    alignItems: 'flex-end',
  },
  workMode: {
    fontSize: 12,
    color: '#4caf50',
    fontWeight: '600',
    marginBottom: 4,
  },
  timeStamp: {
    fontSize: 11,
    color: '#999',
  },
  tagDropdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    gap: 8,
  },
  tagDropdownTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
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
  modalScroll: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedFilterOption: {
    backgroundColor: '#007aff',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedFilterOptionText: {
    color: '#fff',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 12,
  },
  clearFiltersButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  clearFiltersText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  applyFiltersButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007aff',
    alignItems: 'center',
  },
  applyFiltersText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  ojtTrackerButton: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    backgroundColor: '#007aff',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default HomeScreen;
