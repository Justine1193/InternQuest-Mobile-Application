import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
} from 'react-native';
import BottomNavbar from '../components/BottomNav';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

// Define a type for the mock posts
type Post = {
  id: string;
  company: string;
  description: string;
  category: string;
};

const mockPosts: Post[] = [
  { id: '1', company: 'TechCorp', description: 'Innovating AI for the next generation.', category: 'Tech' },
  { id: '2', company: 'DesignPro', description: 'Crafting visual stories that resonate.', category: 'Design' },
  { id: '3', company: 'MarketGurus', description: 'Driving smart digital marketing.', category: 'Marketing' },
  { id: '4', company: 'InnovateX', description: 'Shaping the future with smart devices.', category: 'Tech' },
  { id: '5', company: 'CreateHub', description: 'Creative strategies for brand growth.', category: 'Design' },
  { id: '6', company: 'BrandNest', description: 'Helping brands build identity.', category: 'Marketing' },
  { id: '7', company: 'CodeCrafters', description: 'Custom software for complex needs.', category: 'Tech' },
  { id: '8', company: 'PixelPerfect', description: 'Designing interfaces with precision.', category: 'Design' },
  { id: '9', company: 'AdWise', description: 'Targeted campaigns with measurable results.', category: 'Marketing' },
  { id: '10', company: 'NextGen Solutions', description: 'Tomorrow’s tech, delivered today.', category: 'Tech' },
  { id: '11', company: 'SketchStudio', description: 'From concept to creation.', category: 'Design' },
  { id: '12', company: 'BuzzMetrics', description: 'Social analytics that matter.', category: 'Marketing' },
];

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedPost, setSelectedPost] = useState<null | Post>(null);  // Typing selectedPost
  const [modalVisible, setModalVisible] = useState(false);

  const filteredPosts = mockPosts.filter(post => {
    const matchesSearch = post.company.toLowerCase().includes(searchText.toLowerCase());
    const matchesFilter = filter === 'All' || post.category === filter;
    return matchesSearch && matchesFilter;
  });

  const openModal = (post: Post) => {
    setSelectedPost(post);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Search & Filter */}
        <View style={styles.searchFilterContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search companies..."
            value={searchText}
            onChangeText={setSearchText}
          />
          <View style={styles.filterContainer}>
            {['All', 'Tech', 'Design', 'Marketing'].map(category => (
              <TouchableOpacity
                key={category}
                style={[styles.filterButton, filter === category && styles.activeFilter]}
                onPress={() => setFilter(category)}
              >
                <Text style={[styles.filterText, filter === category && styles.activeFilterText]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Post Cards */}
        {filteredPosts.map((post) => (
          <View key={post.id} style={styles.card}>
            <TouchableOpacity onPress={() => openModal(post)}>
              <View style={styles.cardHeader}>
                <Image
                  source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/company.png' }}
                  style={styles.companyLogo}
                />
                <View>
                  <Text style={styles.companyName}>{post.company}</Text>
                  <Text style={styles.postText}>{post.description}</Text>
                </View>
              </View>
            </TouchableOpacity>
            <Text style={styles.categoryTag}>{post.category}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Navbar */}
      <BottomNavbar navigation={navigation} />

      {/* Modal for selected post */}
      {selectedPost && (
        <Modal
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
          animationType="slide"
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedPost.company}</Text>
            <Text>{selectedPost.description}</Text>
            <Text>Category: {selectedPost.category}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', marginTop: 25 },
  scrollContent: { padding: 16 },
  searchFilterContainer: { marginBottom: 20 },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
    marginBottom: 8,
  },
  activeFilter: {
    backgroundColor: '#004d40',
    borderColor: '#004d40',
  },
  filterText: {
    fontSize: 12,
    color: '#333',
  },
  activeFilterText: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  companyLogo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  companyName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  postText: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0f2f1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    color: '#004d40',
    fontWeight: '500',
  },
  modalContent: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  closeButton: {
    color: '#004d40',
    marginTop: 20,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
