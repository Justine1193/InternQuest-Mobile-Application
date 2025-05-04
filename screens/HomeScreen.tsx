import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import BottomNavbar from '../components/BottomNav';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Post } from '../App';
import { Ionicons } from '@expo/vector-icons';
import { useSavedInternships } from '../context/SavedInternshipsContext';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

// Mock user preferences from Setup Account Screen
const userPreferences = ['Programming', 'AI', 'React Native', 'Cloud'];

const mockPosts: Post[] = [
  {
    id: '1',
    company: 'Google',
    description: 'Google is committed to supporting the Philippine government’s ambition for a Digital Philippines.',
    category: 'Tech',
    location: 'Taguig, Metro Manila',
    industry: 'Technology',
    tags: ['Programming', 'Web development', 'Databases'],
  },
  {
    id: '2',
    company: 'Clinchoice',
    description: 'Clinchoice is a global clinical stage CRO with over 1800 professionals in 15+ countries.',
    category: 'Medical',
    location: 'Ortigas Center, Pasig City',
    industry: 'Pharmaceuticals, Biotechnology & Medical',
    tags: ['Programming', 'Web development', 'Databases'],
  },
  {
    id: '3',
    company: 'Amdocs',
    description: 'Amdocs helps those who build the future to make it amazing.',
    category: 'Tech',
    location: 'Pasig City',
    industry: 'Telecommunications',
    tags: ['Java', 'React Native', 'Cloud'],
  },
  {
    id: '4',
    company: 'Accenture',
    description: 'Join Accenture and help transform leading organizations and communities around the world.',
    category: 'Consulting',
    location: 'Mandaluyong City',
    industry: 'IT Services & Consulting',
    tags: ['Business Analysis', 'Agile', 'Scrum'],
  },
  {
    id: '5',
    company: 'IBM',
    description: 'IBM is looking for interns who want to build a smarter planet.',
    category: 'Tech',
    location: 'Quezon City',
    industry: 'Technology & Innovation',
    tags: ['AI', 'Python', 'Machine Learning'],
  },
  {
    id: '6',
    company: 'Ayala Corporation',
    description: 'An opportunity to work in one of the oldest and most respected conglomerates in the Philippines.',
    category: 'Business',
    location: 'Makati City',
    industry: 'Real Estate & Holdings',
    tags: ['Finance', 'Strategy', 'Marketing'],
  },
  {
    id: '7',
    company: 'PLDT',
    description: 'Be a part of the largest telecommunications and digital services company in the Philippines.',
    category: 'Telecom',
    location: 'Makati City',
    industry: 'Telecommunications',
    tags: ['Networking', 'Data Science', 'Security'],
  },
  {
    id: '8',
    company: 'Nestlé Philippines',
    description: 'Work with a leading nutrition, health, and wellness company.',
    category: 'Food & Beverage',
    location: 'Rockwell, Makati',
    industry: 'FMCG',
    tags: ['Marketing', 'Supply Chain', 'Sales'],
  },
  {
    id: '9',
    company: 'GCash',
    description: 'Join GCash’s mission to make digital finance accessible for every Filipino.',
    category: 'Fintech',
    location: 'BGC, Taguig',
    industry: 'Financial Technology',
    tags: ['Mobile Dev', 'UI/UX', 'React Native'],
  },
  {
    id: '10',
    company: 'UNDP Philippines',
    description: 'Support sustainable development projects and gain experience in the NGO sector.',
    category: 'Non-profit',
    location: 'Pasig City',
    industry: 'International Development',
    tags: ['Project Management', 'Research', 'Policy Writing'],
  },
];


const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>('Best Matches'); // Default filter
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]); // State for selected tags
  const { savedInternships, toggleSaveInternship } = useSavedInternships();

  const handleFilterPress = (filter: string) => {
    setActiveFilter(activeFilter === filter ? null : filter); // Toggle filter
    setShowDropdown(false);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const filteredPosts = (activeFilter === 'Saved Internship' ? savedInternships : mockPosts)
    .filter(post => {
      if (selectedTags.length > 0) {
        // Include posts that match any of the selected tags
        return post.tags.some(tag => selectedTags.includes(tag));
      }
      if (activeFilter && !['Best Matches', 'Most Recent', 'Saved Internship'].includes(activeFilter)) {
        return post.tags.includes(activeFilter) && post.company.toLowerCase().includes(searchText.toLowerCase());
      }
      return post.company.toLowerCase().includes(searchText.toLowerCase());
    })
    .sort((a, b) => {
      if (activeFilter === 'Best Matches') {
        // Sort by the number of matching tags with user preferences
        const aMatches = a.tags.filter(tag => userPreferences.includes(tag)).length;
        const bMatches = b.tags.filter(tag => userPreferences.includes(tag)).length;
        return bMatches - aMatches; // Higher matches come first
      }
      return 0; // No sorting for other filters
    });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
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
              {activeFilter === label && <Ionicons name="checkmark" size={16} color="#007aff" />}
            </TouchableOpacity>
          ))}
          {/* Tags dropdown trigger */}
          <TouchableOpacity
            style={styles.filterPill}
            onPress={() => setShowDropdown(!showDropdown)}
          >
            <Text style={styles.filterPillText}>Tags ▼</Text>
          </TouchableOpacity>
        </View>
        {/* Dropdown content */}
        {showDropdown && (
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'center',
              marginLeft: 0,
              marginTop: 8,
              marginBottom: 8,
              gap: 8,
            }}
          >
            {Array.from(new Set(mockPosts.flatMap(post => post.tags))).map((tag, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.filterPill,
                  selectedTags.includes(tag) && styles.activeFilter, // Highlight selected tags
                  { marginRight: 0, marginBottom: 0 },
                ]}
                onPress={() => handleTagToggle(tag)} // Toggle tag selection
              >
                <Text
                  style={[
                    styles.filterPillText,
                    selectedTags.includes(tag) && styles.activeFilterText, // Highlight selected tags
                  ]}
                >
                  {tag}
                </Text>
                {selectedTags.includes(tag) && (
                  <Ionicons name="checkmark" size={16} color="#007aff" />
                )}
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
                  name={savedInternships.some(saved => saved.id === post.id) ? 'star' : 'star-outline'}
                  size={20}
                  color="#007aff"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.metaText}>Industry: {post.industry}</Text>
            <Text style={styles.metaText}>Location: {post.location}</Text>
            <Text numberOfLines={2} style={styles.description}>{post.description}</Text>

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
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 30 },
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
  description: {
    fontSize: 13,
    marginTop: 6,
    color: '#333',
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
});

export default HomeScreen;
