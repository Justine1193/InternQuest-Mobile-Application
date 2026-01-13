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
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { firestore, db, auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { accentPalette, colors, radii, shadows } from '../ui/theme';

type MoaValidity = {
  years: number | null;
  updatedAt: string | null;
  expiresOn: string | null;
  expired: boolean;
};

type Post = BasePost & { createdAt?: Date };

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

const userPreferences = ['Programming', 'AI', 'React Native', 'Cloud'];

// Advanced filter options
const skillOptions = ['Python', 'JavaScript', 'React', 'Node.js', 'Cloud Computing', 'Data Science', 'All Skills'];
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
  const [userCourseOrProgram, setUserCourseOrProgram] = useState<string>('');

  // Realtime MOA validity info (companyId -> validity metadata)
  const [moaValidity, setMoaValidity] = useState<{ [companyId: string]: MoaValidity }>({});

  // Advanced filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState('All Skills');
  const [selectedIndustry, setSelectedIndustry] = useState('All Industries');
  const [selectedWorkMode, setSelectedWorkMode] = useState('All Modes');

  const fetchCompanies = async () => {
    try {
      setRefreshing(true);
      const querySnapshot = await getDocs(collection(firestore, 'companies'));
      const companyData: Post[] = querySnapshot.docs.map((doc: any) => {
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
          contactPersonName: data.contactPersonName || data.companyContactPerson || data.contactPerson || '',
          contactPersonPhone: data.contactPersonPhone || data.companyContactPhone || data.contactPhone || data.phone || '',
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
          const courseOrProgram = (typeof data.course === 'string' && data.course.trim())
            ? data.course.trim()
            : (typeof data.program === 'string' && data.program.trim() ? data.program.trim() : '');
          setUserCourseOrProgram(courseOrProgram);
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

    // Subscribe to realtime MOA validity for all companies.
    // IMPORTANT: RTDB rules typically require auth; avoid subscribing while auth is still null.
    let unsubListener: null | (() => void) = null;
    let unsubAuth: null | (() => void) = null;

    const startMoaSubscription = () => {
      if (unsubListener) return;
      try {
        const companiesRef = ref(db, 'companies');
        unsubListener = onValue(
          companiesRef,
          (snapshot: any) => {
            const companies = snapshot.val() || {};
            const processed: { [key: string]: MoaValidity } = {};

            Object.entries(companies).forEach(([companyId, data]) => {
              const rawYears = (data as any)?.moaValidityYears;
              const parsedYears = typeof rawYears === 'number' ? rawYears : Number(rawYears);
              const years = Number.isFinite(parsedYears) ? parsedYears : null;
              const updatedAt = (data as any)?.updatedAt ?? null;
              const companyName = typeof (data as any)?.companyName === 'string'
                ? (data as any).companyName.trim().toLowerCase()
                : null;

              let expiresOn: string | null = null;
              let expired = false;
              if (updatedAt && years !== null) {
                const updatedDate = new Date(updatedAt);
                if (!Number.isNaN(updatedDate.getTime())) {
                  const expiryDate = new Date(updatedDate);
                  expiryDate.setFullYear(expiryDate.getFullYear() + years);
                  expiresOn = expiryDate.toISOString();
                  expired = expiryDate.getTime() < Date.now();
                }
              }

              processed[companyId] = {
                years,
                updatedAt,
                expiresOn,
                expired,
              };

              if (companyName) {
                processed[companyName] = {
                  years,
                  updatedAt,
                  expiresOn,
                  expired,
                };
              }
            });

            setMoaValidity(processed);
          },
          (error: any) => {
            console.error('Failed to read MOA validity from Realtime DB', error);
          }
        );
      } catch (e) {
        console.warn('Realtime DB MOA subscription skipped:', e);
      }
    };

    if (auth.currentUser) {
      startMoaSubscription();
    } else {
      unsubAuth = onAuthStateChanged(auth, (user) => {
        if (user) {
          startMoaSubscription();
          if (unsubAuth) {
            unsubAuth();
            unsubAuth = null;
          }
        }
      });
    }

    return () => {
      try {
        if (unsubListener) unsubListener();
        if (unsubAuth) unsubAuth();
      } catch (e) { }
    };
  }, []);

  const toTokens = (value: unknown): string[] => {
    if (typeof value !== 'string') return [];
    return value
      .toLowerCase()
      .split(/[^a-z0-9]+/g)
      .map(t => t.trim())
      .filter(Boolean);
  };

  const buildUserMatchTokens = (): string[] => {
    const tokens = new Set<string>();
    toTokens(userCourseOrProgram).forEach(t => tokens.add(t));
    (Array.isArray(userFields) ? userFields : []).forEach((f) => toTokens(String(f)).forEach(t => tokens.add(t)));
    (Array.isArray(userSkills) ? userSkills : []).forEach((s) => toTokens(String(s)).forEach(t => tokens.add(t)));
    return Array.from(tokens);
  };

  const relevanceScoreForPost = (post: Post, userTokens: string[], courseOrProgram: string): number => {
    const company = typeof post.company === 'string' ? post.company.toLowerCase() : '';
    const description = typeof post.description === 'string' ? post.description.toLowerCase() : '';
    const industry = typeof post.industry === 'string' ? post.industry.toLowerCase() : '';
    const category = typeof post.category === 'string' ? post.category.toLowerCase() : '';
    const tags = Array.isArray(post.tags) ? post.tags.map(t => String(t).toLowerCase()) : [];

    const blob = `${company} ${industry} ${category} ${description} ${tags.join(' ')}`;

    let score = 0;
    
    // PROGRAM/COURSE MATCHING (Highest Priority)
    const fullPhrase = (courseOrProgram || '').trim().toLowerCase();
    if (fullPhrase && blob.includes(fullPhrase)) score += 50;  // Exact program match - highest weight
    
    // Also check for partial program word matches
    const programTokens = toTokens(courseOrProgram);
    const programTokenMatches = programTokens.filter(token => {
      return tags.some(t => t.includes(token)) || 
             industry.includes(token) || 
             category.includes(token);
    }).length;
    score += programTokenMatches * 15;  // Each program token match = 15 points

    // If there is no program alignment at all (no exact phrase and no token match),
    // push the post down to avoid unrelated industries surfacing (e.g., medical).
    if (programTokens.length > 0 && !fullPhrase && programTokenMatches === 0) {
      score -= 60; // strong penalty for zero program relevance
    }

    // FIELD/SKILL MATCHING (High priority - close to program)
    // Separate scoring for fields vs skills for better matching
    for (const token of userTokens) {
      if (!token || token.length < 2) continue;
      
      // Check for tag matches (highest for fields/skills)
      if (tags.some(t => t.includes(token))) {
        score += 13;  // Fields/skills match company tags - very high priority
      } 
      // Check for industry/category matches
      else if (industry.includes(token) || category.includes(token)) {
        score += 11;  // Fields/skills match industry/category - very high priority
      } 
      // Check for description/company matches
      else if (description.includes(token) || company.includes(token)) {
        score += 6;   // Fields/skills in description - moderate priority
      }
    }

    // Domain affinity heuristics
    // If user's program is IT/CS-related, strongly prefer tech-aligned posts
    // and demote clearly medical/healthcare-only posts when there's no program token match.
    const programAll = (courseOrProgram || '').toLowerCase();
    const isTechProgram = /(information\s+technology|computer\s+science|it\b|cs\b|software|comput(er|ing)|data\s+(science|analytics)|information\s+systems)/.test(programAll);

    if (isTechProgram) {
      const techBoostTerms = [
        'software', 'developer', 'development', 'engineering', 'engineer', 'technology', 'tech', 'it', 'computer', 'programming', 'programmer',
        'systems', 'information systems', 'data', 'analytics', 'ai', 'machine learning', 'ml', 'cloud', 'network', 'security', 'cyber', 'devops',
      ];
      const medicalTerms = ['hospital', 'clinic', 'medical', 'healthcare', 'nurse', 'nursing', 'pharma', 'pharmaceutical', 'laboratory', 'clinical'];

      // Boost for any tech keyword hit
      for (const kw of techBoostTerms) {
        if (blob.includes(kw)) score += 8;
      }

      // Extra demotion if clearly medical and no program token match
      const isClearlyMedical = medicalTerms.some(m => blob.includes(m));
      if (isClearlyMedical && programTokens.length > 0 && programTokenMatches === 0) {
        score -= 40; // demote medical listings for IT program when no alignment
      }
    }

    return score;
  };

  // Enhanced search and filtering logic
  const filteredPosts = (activeFilter === 'Saved Internship' ? savedInternships : companies)
    .filter(post => {
      // If no search text, show all posts
      if (!searchText.trim()) return true;

      const searchLower = searchText.toLowerCase().trim();

      // Search in multiple fields for better accuracy
      const companyMatch = typeof post.company === 'string' ? post.company.toLowerCase().includes(searchLower) : false;
      const descriptionMatch = typeof post.description === 'string' ? post.description.toLowerCase().includes(searchLower) : false;
      const locationMatch = typeof post.location === 'string' ? post.location.toLowerCase().includes(searchLower) : false;
      const industryMatch = typeof post.industry === 'string' ? post.industry.toLowerCase().includes(searchLower) : false;
      const tagsMatch = Array.isArray(post.tags) ? post.tags.some(tag =>
        typeof tag === 'string' && tag.toLowerCase().includes(searchLower)
      ) : false;
      const workModeMatch = typeof post.modeOfWork === 'string' ? post.modeOfWork.toLowerCase().includes(searchLower) : false;

      // Return true if any field matches
      return companyMatch || descriptionMatch || locationMatch ||
        industryMatch || tagsMatch || workModeMatch;
    })
    .filter(post => {
      // Apply advanced filters
      if (selectedSkill !== 'All Skills') {
        const postTags = Array.isArray(post.tags) ? post.tags.map(t => String(t).toLowerCase()) : [];
        const selectedSkillLower = selectedSkill.toLowerCase();
        if (!postTags.some(tag => tag.includes(selectedSkillLower))) {
          return false;
        }
      }

      if (selectedIndustry !== 'All Industries' &&
        typeof post.industry === 'string' &&
        !post.industry.toLowerCase().includes(selectedIndustry.toLowerCase())) {
        return false;
      }

      if (selectedWorkMode !== 'All Modes' &&
        typeof post.modeOfWork === 'string' &&
        post.modeOfWork.toLowerCase() !== selectedWorkMode.toLowerCase()) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      const aTime = (a.createdAt?.getTime?.() || 0);
      const bTime = (b.createdAt?.getTime?.() || 0);

      const isDefaultBrowse =
        activeFilter === 'Most Recent' &&
        !searchText.trim() &&
        selectedSkill === 'All Skills' &&
        selectedIndustry === 'All Industries' &&
        selectedWorkMode === 'All Modes';

      if (isDefaultBrowse) {
        const userTokens = buildUserMatchTokens();
        const aScore = relevanceScoreForPost(a as Post, userTokens, userCourseOrProgram);
        const bScore = relevanceScoreForPost(b as Post, userTokens, userCourseOrProgram);

        if (bScore !== aScore) return bScore - aScore;
        // Tie-break by recency
        return bTime - aTime;
      }

      // Otherwise keep Most Recent behavior
      return bTime - aTime;
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
    const colorIndex = companyName.length % accentPalette.length;
    return { letter: firstLetter, color: accentPalette[colorIndex] };
  };

  const formatMoaValidity = (post: Post) => {
    const idKey = typeof post.id === 'string' ? post.id : '';
    const nameKey = typeof post.company === 'string' ? post.company.trim().toLowerCase() : '';
    const info = (idKey && moaValidity[idKey]) || (nameKey && moaValidity[nameKey]);
    if (!info || (info.years === null && !info.expiresOn)) return '—';

    const segments: string[] = [];

    if (info.years !== null) {
      segments.push(`${info.years} year${info.years === 1 ? '' : 's'}`);
    }

    if (info.expiresOn) {
      const expiryDate = new Date(info.expiresOn);
      if (!Number.isNaN(expiryDate.getTime())) {
        segments.push(info.expired ? `expired ${expiryDate.toLocaleDateString()}` : `until ${expiryDate.toLocaleDateString()}`);
      }
    }

    return segments.join(' • ') || '—';
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Internships</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchCompanies} />
        }
      >
        {/* Search Bar + Filter Icon Row */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search companies"
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor={colors.textSubtle}
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color={colors.textSubtle} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.filterButtonNext}
            onPress={() => setShowAdvancedFilters(true)}
          >
            <Ionicons name="filter" size={22} color={colors.text} />
          </TouchableOpacity>
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
              {activeFilter === label && <Ionicons name="checkmark" size={16} color={colors.onPrimary} style={{ marginLeft: 4 }} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Active Filters Display */}
        {(selectedSkill !== 'All Skills' ||
          selectedIndustry !== 'All Industries' || selectedWorkMode !== 'All Modes') && (
            <View style={styles.activeFiltersContainer}>
              <Text style={styles.activeFiltersLabel}>Active Filters:</Text>
              <View style={styles.activeFiltersList}>
                {selectedSkill !== 'All Skills' && (
                  <View style={styles.activeFilterChip}>
                    <Text style={styles.activeFilterChipText}>{selectedSkill}</Text>
                    <TouchableOpacity onPress={() => setSelectedSkill('All Skills')}>
                      <Ionicons name="close" size={14} color={colors.onPrimary} />
                    </TouchableOpacity>
                  </View>
                )}
                {selectedIndustry !== 'All Industries' && (
                  <View style={styles.activeFilterChip}>
                    <Text style={styles.activeFilterChipText}>{selectedIndustry}</Text>
                    <TouchableOpacity onPress={() => setSelectedIndustry('All Industries')}>
                      <Ionicons name="close" size={14} color={colors.onPrimary} />
                    </TouchableOpacity>
                  </View>
                )}
                {selectedWorkMode !== 'All Modes' && (
                  <View style={styles.activeFilterChip}>
                    <Text style={styles.activeFilterChipText}>{selectedWorkMode}</Text>
                    <TouchableOpacity onPress={() => setSelectedWorkMode('All Modes')}>
                      <Ionicons name="close" size={14} color={colors.onPrimary} />
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
        {filteredPosts.length === 0 && searchText.trim() !== '' ? (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search" size={48} color={colors.textSubtle} />
            <Text style={styles.noResultsText}>No internships found</Text>
            <Text style={styles.noResultsSubtext}>
              Try adjusting your search terms or filters
            </Text>
          </View>
        ) : (
          filteredPosts.map(post => {
            const logo = getCompanyLogo(post.company);
            return (
              <TouchableOpacity
                key={post.id}
                style={styles.card}
                onPress={() => navigation.navigate('CompanyProfile', { companyId: post.id })}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.companyInfo}>
                    {/* removed round logo to give a cleaner card — replaced with a slim accent stripe */}
                    <View style={[styles.cardAccent, { backgroundColor: logo.color }]} />
                    <View style={styles.companyDetails}>
                      <Text style={styles.companyName}>{post.company}</Text>
                      <Text style={styles.companyLocation}>
                        <Ionicons name="location" size={14} color={colors.textMuted} />
                        {' '}{typeof post.location === 'string' ? post.location : 'Location not specified'}
                      </Text>
                      <Text style={styles.companyIndustry}>
                        <Ionicons name="briefcase" size={14} color={colors.textMuted} />
                        {' '}{typeof post.industry === 'string' ? post.industry : 'Industry not specified'}
                      </Text>
                      {typeof post.id === 'string' && (
                        <Text style={styles.moaRemaining}>
                          MOA validity: {formatMoaValidity(post)}
                        </Text>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => toggleSaveInternship(post)}
                    style={styles.bookmarkButton}
                  >
                    <Ionicons
                      name={savedInternships.some(saved => saved.id === post.id) ? 'bookmark' : 'bookmark-outline'}
                      size={20}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.descriptionContainer}>
                  <Text style={styles.description}>
                    {expanded[post.id] ? (typeof post.description === 'string' ? post.description : 'No description available') :
                      (typeof post.description === 'string' ? (post.description.length > 120 ? post.description.substring(0, 120) + '...' : post.description) : 'No description available')}
                  </Text>
                  {typeof post.description === 'string' && post.description.length > 120 && (
                    <TouchableOpacity onPress={() => handleToggleExpand(post.id)}>
                      <Text style={styles.readMore}>{expanded[post.id] ? 'Show Less' : 'Read More'}</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.cardFooter}>
                  <View style={styles.tagContainer}>
                    {(Array.isArray(post.tags) ? post.tags.filter(tag => typeof tag === 'string') : []).slice(0, 3).map((tag, idx) => (
                      <View key={idx} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                    {Array.isArray(post.tags) && post.tags.filter(tag => typeof tag === 'string').length > 3 && (
                      <Text style={styles.moreTagsText}>+{post.tags.filter(tag => typeof tag === 'string').length - 3} more</Text>
                    )}
                  </View>

                  <View style={styles.cardMeta}>
                    <Text style={styles.workMode}>{typeof post.modeOfWork === 'string' ? post.modeOfWork : 'Work mode not specified'}</Text>
                    <Text style={styles.timeStamp}>{timeAgo(post.createdAt ?? new Date())}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
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
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Skills Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Skills</Text>
                <View style={styles.filterOptions}>
                  {skillOptions.map((skill, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.filterOption,
                        selectedSkill === skill && styles.selectedFilterOption
                      ]}
                      onPress={() => setSelectedSkill(skill)}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        selectedSkill === skill && styles.selectedFilterOptionText
                      ]}>
                        {skill}
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
                  setSelectedSkill('All Skills');
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
        <Ionicons name="calendar" size={24} color={colors.onPrimary} />
      </TouchableOpacity>

      <BottomNavbar navigation={navigation} currentRoute="Home" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: colors.primary,
    borderBottomWidth: 0,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.onPrimary,
  },
  filterButton: {
    padding: 8,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
    paddingHorizontal: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingHorizontal: 12,
    marginRight: 8,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: colors.textSubtle,
    textAlign: 'center',
  },
  filterButtonNext: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
    width: 44,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  topFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    backgroundColor: colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeFilter: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterPillText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  activeFilterText: {
    color: colors.onPrimary,
  },
  activeFiltersContainer: {
    marginBottom: 16,
  },
  activeFiltersLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  activeFiltersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activeFilterChip: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeFilterChipText: {
    color: colors.onPrimary,
    fontSize: 12,
    fontWeight: '500',
  },
  resultsCount: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 16,
    fontWeight: '500',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    paddingLeft: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
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
    alignItems: 'center',
  },
  /* old circular company logo removed for cleaner layout */
  cardAccent: {
    width: 6,
    height: 50,
    borderRadius: 4,
    marginRight: 12,
    marginTop: 4,
  },
  companyDetails: {
    flex: 1,
  },
  companyName: {
    fontSize: 18,
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
  moaRemaining: {
    fontSize: 12,
    color: colors.warning,
    marginTop: 6,
    fontWeight: '700',
  },
  bookmarkButton: {
    padding: 8,
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  readMore: {
    color: colors.primary,
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
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  moreTagsText: {
    color: colors.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
  },
  cardMeta: {
    alignItems: 'flex-end',
  },
  workMode: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '700',
    marginBottom: 4,
  },
  timeStamp: {
    fontSize: 11,
    color: colors.textSubtle,
  },
  tagDropdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
    gap: 8,
  },
  tagDropdownTag: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
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
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
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
    color: colors.text,
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
    backgroundColor: colors.surfaceAlt,
  },
  selectedFilterOption: {
    backgroundColor: colors.primary,
  },
  filterOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  selectedFilterOptionText: {
    color: colors.onPrimary,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  clearFiltersButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
  },
  clearFiltersText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  applyFiltersButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  applyFiltersText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  ojtTrackerButton: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.card,
  },
});

export default HomeScreen;
