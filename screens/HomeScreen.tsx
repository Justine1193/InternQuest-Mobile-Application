import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Modal,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Post as BasePost } from '../App';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSavedInternships } from '../context/SavedInternshipsContext';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { firestore, db, auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { accentPalette, colors, radii, shadows } from '../ui/theme';
import { Screen } from '../ui/components/Screen';
import { useNotificationCount } from '../context/NotificationCountContext';

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

const FEED_INTRO_DISMISSED_KEY = '@InternQuest_feedIntroDismissed';
const userPreferences = ['Programming', 'AI', 'React Native', 'Cloud'];

// Advanced filter options
const skillOptions = ['Python', 'JavaScript', 'React', 'Node.js', 'Cloud Computing', 'Data Science', 'All Skills'];
const industryOptions = ['Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing', 'All Industries'];
const workModeOptions = ['On-site', 'Remote', 'Hybrid', 'All Modes'];

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { notificationCount } = useNotificationCount();
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('My Feed');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [companies, setCompanies] = useState<Post[]>([]);
  const { savedInternships, toggleSaveInternship } = useSavedInternships();
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const [refreshing, setRefreshing] = useState(false);
  const [userFields, setUserFields] = useState<string[]>([]);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [userCourseOrProgram, setUserCourseOrProgram] = useState<string>('');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [categoryTag, setCategoryTag] = useState<string>('All');
  const [visibleCount, setVisibleCount] = useState<number>(15);
  const [feedIntroDismissed, setFeedIntroDismissed] = useState(false);

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

        const normalizeMoaCandidate = (v: any): string => {
          if (typeof v === 'string') return v.trim();
          if (v && typeof v === 'object') {
            const fromObj = v.url || v.downloadUrl || v.downloadURL || v.path || v.storagePath;
            return typeof fromObj === 'string' ? fromObj.trim() : '';
          }
          return '';
        };
        const moaCandidates = [
          data?.moaFileUrl,
          data?.moaFileURL,
          data?.moaUrl,
          data?.moaURL,
          data?.moaStoragePath,
          data?.moaPath,
          data?.moa,
        ];
        const moaValue = moaCandidates
          .map(normalizeMoaCandidate)
          .find((s) => {
            if (!s) return false;
            const lower = s.toLowerCase();
            if (['yes', 'no', 'true', 'false', '1', '0', 'y', 'n'].includes(lower)) return false;
            return true;
          }) || normalizeMoaCandidate(data?.moa);

        return {
          id: doc.id,
          company: data.companyName || '',
          description: data.companyDescription || '',
          category: data.category || '',
          location: data.companyAddress || '',
          industry: data.fields || '',
          tags: data.skillsREq || [],
          endorsedByCollege: data.endorsedByCollege || data.endorsed_by_college || data.collegeEndorsement || '',
          website: data.companyWeb || '',
          email: data.companyEmail || '',
          contactPersonName: data.contactPersonName || data.companyContactPerson || data.contactPerson || '',
          contactPersonPhone: data.contactPersonPhone || data.companyContactPhone || data.contactPhone || data.phone || '',
          moa: moaValue || '',
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

  // Reset visible internships when filters or search change
  useEffect(() => {
    setVisibleCount(15);
  }, [activeFilter, searchText, selectedSkill, selectedIndustry, selectedWorkMode, categoryTag]);

  useEffect(() => {
    AsyncStorage.getItem(FEED_INTRO_DISMISSED_KEY).then((v: string | null) => {
      if (v === 'true') setFeedIntroDismissed(true);
    });
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
          setUserAvatar((data as any).avatar || null);
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

  // Category tag quick-filter: show only skills the user has picked (from profile) + All + industries
  const categoryTagOptions = ['All', ...userSkills, ...industryOptions.filter(i => i !== 'All Industries')];
  const effectiveSkill = categoryTag === 'All' ? selectedSkill : (userSkills.includes(categoryTag) ? categoryTag : selectedSkill);
  const effectiveIndustry = categoryTag === 'All' ? selectedIndustry : (industryOptions.includes(categoryTag) ? categoryTag : selectedIndustry);

  // Enhanced search and filtering logic
  const filteredPosts = (activeFilter === 'Saved' ? savedInternships : companies)
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
      // Apply advanced filters (use effective skill/industry from category tag or modal)
      if (effectiveSkill !== 'All Skills') {
        const postTags = Array.isArray(post.tags) ? post.tags.map(t => String(t).toLowerCase()) : [];
        const skillLower = effectiveSkill.toLowerCase();
        if (!postTags.some(tag => tag.includes(skillLower))) {
          return false;
        }
      }

      if (effectiveIndustry !== 'All Industries' &&
        typeof post.industry === 'string' &&
        !post.industry.toLowerCase().includes(effectiveIndustry.toLowerCase())) {
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

      const useRelevanceSort =
        (activeFilter === 'My Feed' || activeFilter === 'Best Matches') &&
        !searchText.trim() &&
        selectedSkill === 'All Skills' &&
        selectedIndustry === 'All Industries' &&
        selectedWorkMode === 'All Modes';

      if (useRelevanceSort) {
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

  const hasActiveAdvancedFilters =
    selectedSkill !== 'All Skills' ||
    selectedIndustry !== 'All Industries' ||
    selectedWorkMode !== 'All Modes';

  const getInitials = (name: string) => {
    const parts = (name || '').trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (name || 'U').charAt(0).toUpperCase();
  };

  return (
    <Screen contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 0 }}>
      {/* Header: profile pic | Internships | notification */}
      <View style={styles.headerGradientWrapper}>
        <LinearGradient
          colors={['#4F46E5', '#6366F1', '#818CF8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.headerAvatarWrap}
              onPress={() => navigation.navigate('Profile')}
              activeOpacity={0.8}
              accessibilityLabel="Go to profile"
            >
              {userAvatar ? (
                <Image source={{ uri: userAvatar }} style={styles.headerAvatar} />
              ) : (
                <View style={[styles.headerAvatar, styles.headerAvatarPlaceholder]}>
                  <Text style={styles.headerAvatarText}>{getInitials((auth.currentUser?.email || 'User').split('@')[0])}</Text>
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.headerTitleCenter}>Internships</Text>
            <TouchableOpacity
              style={styles.headerNotificationButton}
              onPress={() => navigation.navigate('Notifications')}
              accessibilityLabel={notificationCount > 0 ? `${notificationCount} unread notifications` : 'Notifications'}
            >
              <View style={styles.headerNotificationIconWrap}>
                <Ionicons name="notifications-outline" size={24} color={colors.white} />
                {notificationCount > 0 && (
                  <View style={styles.headerNotificationBadge}>
                    <Text style={styles.headerNotificationBadgeText} numberOfLines={1}>
                      {notificationCount > 99 ? '99+' : String(notificationCount)}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchCompanies} tintColor={colors.primary} />
        }
      >
        {/* Search bar with magnifying glass + heart (like reference) */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <View style={styles.searchIconWrapper}>
              <Ionicons name="search" size={20} color={colors.primary} />
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for internships..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor={colors.textSubtle}
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={20} color={colors.textSubtle} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.searchHeartButton, activeFilter === 'Saved' && styles.searchHeartButtonActive]}
            onPress={() => setActiveFilter(activeFilter === 'Saved' ? 'My Feed' : 'Saved')}
            accessibilityLabel={activeFilter === 'Saved' ? 'Show all internships' : 'Show saved internships'}
          >
            <Ionicons name={activeFilter === 'Saved' ? 'heart' : 'heart-outline'} size={22} color={activeFilter === 'Saved' ? colors.white : colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButtonNext, hasActiveAdvancedFilters && styles.filterButtonActive]}
            onPress={() => setShowAdvancedFilters(true)}
            accessibilityRole="button"
            accessibilityLabel="Open filters"
          >
            <Ionicons name="filter" size={22} color={hasActiveAdvancedFilters ? colors.white : colors.text} />
            {hasActiveAdvancedFilters && <View style={styles.filterBadge} />}
          </TouchableOpacity>
        </View>

        {/* Tabs: My Feed | Best Matches | Most Recent | Saved */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {['My Feed', 'Best Matches', 'Most Recent', 'Saved'].map((label) => (
            <TouchableOpacity
              key={label}
              style={[styles.tabPill, activeFilter === label && styles.tabPillActive]}
              onPress={() => setActiveFilter(label)}
              activeOpacity={0.7}
            >
              {activeFilter === label && <View style={styles.tabPillIndicator} />}
              <Text style={[styles.tabPillText, activeFilter === label && styles.tabPillTextActive]} numberOfLines={1}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Feed intro – dismissible message */}
        {!feedIntroDismissed && (
          <View style={styles.feedIntroBanner}>
            <Text style={styles.feedIntroText}>
              Build a personal feed of relevant internships by saving companies you like.
            </Text>
            <TouchableOpacity
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              onPress={() => {
                setFeedIntroDismissed(true);
                AsyncStorage.setItem(FEED_INTRO_DISMISSED_KEY, 'true');
              }}
              style={styles.feedIntroClose}
            >
              <Ionicons name="close" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {/* Category tags: horizontal scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTagsScroll}
          style={styles.categoryTagsWrap}
        >
          {categoryTagOptions.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[styles.categoryTag, categoryTag === tag && styles.categoryTagActive]}
              onPress={() => setCategoryTag(tag)}
              activeOpacity={0.8}
            >
              <Text style={[styles.categoryTagText, categoryTag === tag && styles.categoryTagTextActive]} numberOfLines={1}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
          <View style={styles.categoryTagArrow}>
            <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
          </View>
        </ScrollView>

        {/* Active Filters Display */}
        {hasActiveAdvancedFilters && (
          <View style={styles.activeFiltersContainer}>
            <Text style={styles.activeFiltersLabel}>Active filters</Text>
            <View style={styles.activeFiltersList}>
              {selectedSkill !== 'All Skills' && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterChipText}>{selectedSkill}</Text>
                  <TouchableOpacity onPress={() => setSelectedSkill('All Skills')} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                    <Ionicons name="close" size={14} color={colors.onPrimary} />
                  </TouchableOpacity>
                </View>
              )}
              {selectedIndustry !== 'All Industries' && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterChipText}>{selectedIndustry}</Text>
                  <TouchableOpacity onPress={() => setSelectedIndustry('All Industries')} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                    <Ionicons name="close" size={14} color={colors.onPrimary} />
                  </TouchableOpacity>
                </View>
              )}
              {selectedWorkMode !== 'All Modes' && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterChipText}>{selectedWorkMode}</Text>
                  <TouchableOpacity onPress={() => setSelectedWorkMode('All Modes')} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
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

        {/* Empty state: no saved items when on Saved tab */}
        {filteredPosts.length === 0 && activeFilter === 'Saved' && !searchText.trim() && (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateIconWrap}>
              <Ionicons name="bookmark-outline" size={56} color={colors.textSubtle} />
            </View>
            <Text style={styles.emptyStateTitle}>No saved internships</Text>
            <Text style={styles.emptyStateSubtext}>
              Save internships from the list to see them here
            </Text>
          </View>
        )}

        {/* No search/filter results */}
        {filteredPosts.length === 0 && (searchText.trim() !== '' || hasActiveAdvancedFilters) && activeFilter !== 'Saved' && (
          <View style={styles.noResultsContainer}>
            <View style={styles.noResultsIconWrap}>
              <Ionicons name="search-outline" size={48} color={colors.textSubtle} />
            </View>
            <Text style={styles.noResultsText}>No internships found</Text>
            <Text style={styles.noResultsSubtext}>
              Try different keywords or clear some filters
            </Text>
            <TouchableOpacity
              style={styles.noResultsButton}
              onPress={() => { setSearchText(''); setSelectedSkill('All Skills'); setSelectedIndustry('All Industries'); setSelectedWorkMode('All Modes'); }}
            >
              <Text style={styles.noResultsButtonText}>Clear search & filters</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Company Cards (with 'Load more') */}
        {filteredPosts.length > 0 && filteredPosts.slice(0, visibleCount).map(post => {
            const logo = getCompanyLogo(post.company);
            return (
              <TouchableOpacity
                key={post.id}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('CompanyProfile', { companyId: post.id })}
              >
                {/* Top row: posted time left, save heart right (like reference) */}
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardPostedTime}>Posted {timeAgo(post.createdAt ?? new Date())}</Text>
                  <TouchableOpacity
                    onPress={(e) => { e?.stopPropagation?.(); toggleSaveInternship(post); }}
                    style={styles.cardHeartButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={savedInternships.some(saved => saved.id === post.id) ? 'heart' : 'heart-outline'}
                      size={22}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                </View>
                <View style={[styles.cardAccent, { backgroundColor: logo.color }]} />
                <Text style={styles.companyName}>{post.company}</Text>
                <Text style={styles.cardDetailsLine}>
                  {typeof post.modeOfWork === 'string' ? post.modeOfWork : 'Internship'} · {typeof post.location === 'string' ? post.location : 'Location not specified'}
                </Text>
                <View style={styles.descriptionContainer}>
                  <Text style={styles.description}>
                    {expanded[post.id] ? (typeof post.description === 'string' ? post.description : 'No description available') :
                      (typeof post.description === 'string' ? (post.description.length > 120 ? post.description.substring(0, 120) + '...' : post.description) : 'No description available')}
                  </Text>
                  {typeof post.description === 'string' && post.description.length > 120 && (
                    <TouchableOpacity onPress={() => handleToggleExpand(post.id)}>
                      <Text style={styles.readMore}>{expanded[post.id] ? 'Show less' : 'more'}</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.tagContainer}>
                  {(Array.isArray(post.tags) ? post.tags.filter(tag => typeof tag === 'string') : []).slice(0, 4).map((tag, idx) => (
                    <View key={idx} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                  {Array.isArray(post.tags) && post.tags.filter(tag => typeof tag === 'string').length > 4 && (
                    <Text style={styles.moreTagsText}>+{post.tags.filter(tag => typeof tag === 'string').length - 4} more</Text>
                  )}
                </View>
                <View style={styles.cardMetaRow}>
                  <View style={styles.cardMetaItem}>
                    <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                    <Text style={styles.cardMetaText}>{typeof post.location === 'string' ? post.location : '—'}</Text>
                  </View>
                  <Text style={styles.cardMetaDivider}>·</Text>
                  <Text style={styles.cardMetaText}>{typeof post.modeOfWork === 'string' ? post.modeOfWork : '—'}</Text>
                </View>
              </TouchableOpacity>
            );
          })}

        {filteredPosts.length > visibleCount && (
          <View style={styles.loadMoreWrap}>
            <TouchableOpacity
              onPress={() => setVisibleCount(prev => prev + 15)}
              style={styles.loadMoreButton}
              activeOpacity={0.8}
            >
              <Text style={styles.loadMoreText}>Load more</Text>
            </TouchableOpacity>
          </View>
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
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowAdvancedFilters(false)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Skills Filter – only skills the user has picked (from profile) */}
              <View style={styles.filterSection}>
                <View style={styles.filterSectionTitleRow}>
                  <Ionicons name="code-slash" size={18} color={colors.primary} />
                  <Text style={styles.filterSectionTitle}>Skills</Text>
                </View>
                <View style={styles.filterOptions}>
                  {['All Skills', ...userSkills].map((skill, index) => (
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
                <View style={styles.filterSectionTitleRow}>
                  <Ionicons name="business" size={18} color={colors.primary} />
                  <Text style={styles.filterSectionTitle}>Industry</Text>
                </View>
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
                <View style={styles.filterSectionTitleRow}>
                  <Ionicons name="desktop-outline" size={18} color={colors.primary} />
                  <Text style={styles.filterSectionTitle}>Work Mode</Text>
                </View>
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
    </Screen>
  );
};

const styles = StyleSheet.create({
  headerGradientWrapper: {
    overflow: 'hidden',
  },
  headerGradient: {
    paddingBottom: 16,
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerAvatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerAvatarPlaceholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  headerTitleCenter: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.3,
  },
  headerMenuButton: {
    padding: 8,
  },
  headerNotificationButton: {
    padding: 8,
  },
  headerNotificationIconWrap: {
    position: 'relative',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerNotificationBadge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minHeight: 18,
    paddingHorizontal: 6,
    borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerNotificationBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 12,
    paddingHorizontal: 16,
  },
  searchHeartButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchHeartButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
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
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    paddingHorizontal: 4,
    height: 50,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  searchIcon: {
    marginRight: 0,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  filterButtonNext: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    width: 50,
    marginLeft: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  filterButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
    gap: 10,
    paddingVertical: 4,
  },
  tabPill: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
    overflow: 'hidden',
    minWidth: 90,
    alignItems: 'center',
  },
  tabPillActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  tabPillIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  tabPillText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
    zIndex: 1,
  },
  tabPillTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  feedIntroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginHorizontal: 16,
    paddingVertical: 14,
    paddingLeft: 16,
    paddingRight: 12,
    backgroundColor: colors.primarySoft,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  feedIntroText: {
    flex: 1,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
    marginRight: 8,
  },
  feedIntroClose: {
    padding: 4,
  },
  feedIntro: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 14,
    paddingHorizontal: 16,
  },
  categoryTagsWrap: {
    marginBottom: 16,
    maxHeight: 44,
  },
  categoryTagsScroll: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 8,
  },
  categoryTag: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  categoryTagActive: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  categoryTagText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  categoryTagTextActive: {
    color: colors.surface,
  },
  categoryTagArrow: {
    paddingLeft: 4,
  },
  filterPillCheck: {
    marginLeft: 6,
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  noResultsIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: colors.textSubtle,
    textAlign: 'center',
    marginBottom: 20,
  },
  noResultsButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radii.lg,
    backgroundColor: colors.primarySoft,
  },
  noResultsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
    paddingHorizontal: 24,
  },
  emptyStateIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSubtle,
    textAlign: 'center',
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
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    marginTop: 4,
    paddingHorizontal: 16,
    letterSpacing: -0.2,
  },
  loadMoreWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadMoreButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  loadMoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardPostedTime: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  cardHeartButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
  cardAccent: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  companyName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  cardDetailsLine: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 14,
    fontWeight: '500',
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
    fontWeight: '400',
  },
  readMore: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  tagText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  moreTagsText: {
    color: colors.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 4,
  },
  cardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardMetaText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  cardMetaDivider: {
    fontSize: 12,
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
  filterSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
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
});

export default HomeScreen;
