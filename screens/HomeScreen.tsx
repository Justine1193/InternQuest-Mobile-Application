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
} from 'react-native';
import BottomNavbar from '../components/BottomNav';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Post } from '../App';
import { Ionicons } from '@expo/vector-icons';
import { useSavedInternships } from '../context/SavedInternshipsContext';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../firebase/config';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

const userPreferences = ['Programming', 'AI', 'React Native', 'Cloud'];

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>('Best Matches');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [companies, setCompanies] = useState<Post[]>([]);
  const { savedInternships, toggleSaveInternship } = useSavedInternships();
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const [refreshing, setRefreshing] = useState(false);

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
          industry: data.industry || '',
          tags: data.skillsREq || [],
          website: data.companyWeb || '',
          email: data.companyEmail || '',
          moa: data.moa || '',
          modeOfWork: Array.isArray(data.modeofwork) ? data.modeofwork[0] : data.modeofwork || '',
          latitude: data.latitude || 0,
          longitude: data.longitude || 0,
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

  const handleFilterPress = (filter: string) => {
    setActiveFilter(activeFilter === filter ? null : filter);
    setShowDropdown(false);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const filteredPosts = (activeFilter === 'Saved Internship' ? savedInternships : companies)
    .filter(post => {
      if (selectedTags.length > 0) {
        return post.tags.some(tag => selectedTags.includes(tag));
      }
      return post.company.toLowerCase().includes(searchText.toLowerCase());
    })
    .sort((a, b) => {
      if (activeFilter === 'Best Matches') {
        const aMatches = a.tags.filter(tag => userPreferences.includes(tag)).length;
        const bMatches = b.tags.filter(tag => userPreferences.includes(tag)).length;
        return bMatches - aMatches;
      }
      return 0;
    });

  const handleToggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchCompanies} />
        }
      >
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={searchText}
          onChangeText={setSearchText}
        />
        <View style={styles.topFilters}>
          {['Best Matches', 'Most Recent', 'Saved Internship'].map((label, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.filterPill, activeFilter === label && styles.activeFilter]}
              onPress={() => handleFilterPress(label)}
            >
              <Text style={[styles.filterPillText, activeFilter === label && styles.activeFilterText]}>
                {label}
              </Text>
              {activeFilter === label && <Ionicons name="checkmark" size={16} color="#fff" />}
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.filterPill}
            onPress={() => setShowDropdown(!showDropdown)}
          >
            <Text style={styles.filterPillText}>Tags ▼</Text>
          </TouchableOpacity>
        </View>

        {showDropdown && (
          <View style={styles.tagDropdown}>
            {Array.from(new Set(companies.flatMap(post => post.tags))).map((tag, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.filterPill, selectedTags.includes(tag) && styles.activeFilter]}
                onPress={() => handleTagToggle(tag)}
              >
                <Text style={[styles.filterPillText, selectedTags.includes(tag) && styles.activeFilterText]}>
                  {tag}
                </Text>
                {selectedTags.includes(tag) && <Ionicons name="checkmark" size={16} color="#fff" />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {filteredPosts.map(post => (
          <TouchableOpacity
            key={post.id}
            style={styles.card}
            onPress={() => navigation.navigate('InternshipDetails', { post })}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.companyName}>{post.company}</Text>
              <TouchableOpacity onPress={() => toggleSaveInternship(post)}>
                <Ionicons
                  name={savedInternships.some(saved => saved.id === post.id) ? 'bookmark' : 'bookmark-outline'}
                  size={20}
                  color="#007aff"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.metaText}>Industry: {post.industry}</Text>
            <Text style={styles.metaText}>Location: {post.location}</Text>

            <View style={styles.descriptionContainer}>
              <Text style={styles.description}>
                {expanded[post.id] ? post.description : post.description.substring(0, 150) + '...'}
              </Text>
              <TouchableOpacity onPress={() => handleToggleExpand(post.id)}>
                <Text style={styles.readMore}>{expanded[post.id] ? 'Show Less' : 'View More'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tagContainer}>
              {post.tags.map((tag, idx) => (
                <Text key={idx} style={styles.tag}>{tag}</Text>
              ))}
            </View>
            <Text style={styles.timeStamp}>Posted 1 hour ago</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <BottomNavbar navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 20 },
  scrollContent: { padding: 16 },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  topFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  filterPill: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeFilter: {
    backgroundColor: '#007aff',
    borderColor: '#007aff',
  },
  filterPillText: {
    fontSize: 12,
    color: '#333',
  },
  activeFilterText: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  metaText: {
    fontSize: 13,
    color: '#555',
  },
  descriptionContainer: {
    marginTop: 10,
  },
  description: {
    fontSize: 14,
    color: '#333',
  },
  readMore: {
    color: '#007aff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 6,
  },
  tag: {
    backgroundColor: '#e0f2f1',
    color: '#00796b',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    fontSize: 12,
  },
  timeStamp: {
    fontSize: 11,
    color: '#888',
    marginTop: 10,
  },
  tagDropdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
});

export default HomeScreen;
