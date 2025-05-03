import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';

type InternshipDetailsScreenRouteProp = RouteProp<RootStackParamList, 'InternshipDetails'>;

type Props = {
  route: InternshipDetailsScreenRouteProp;
};

const InternshipDetailsScreen: React.FC<Props> = ({ route }) => {
  const { post } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Internship Details</Text>

      <View style={styles.section}>
        <Text style={styles.title}>{post.company}</Text>
        <Text style={styles.location}>{post.location}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Company Details</Text>
        <Text style={styles.description}>{post.description}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Company Overview</Text>
        <Text style={styles.label}>
          Website:{' '}
          <Text
            style={styles.link}
            onPress={() => Linking.openURL('https://www.google.com')}
          >
            https://www.google.com
          </Text>
        </Text>
        <Text style={styles.label}>Industry: {post.industry}</Text>
        <Text style={styles.label}>Location: {post.location}</Text>
        <Text style={styles.label}>Email: company@email.com</Text>
      </View>

      <View style={styles.tagRow}>
        <View style={styles.tagBox}>
          <Image source={require('../assets/approved.png')} style={styles.tagIcon} />
          <Text style={styles.tagLabel}>Approved</Text>
          <Text style={styles.tagSubLabel}>NDA</Text>
        </View>
        <View style={styles.tagBox}>
          <Image source={require('../assets/hybrid.png')} style={styles.tagIcon} />
          <Text style={styles.tagLabel}>Hybrid</Text>
          <Text style={styles.tagSubLabel}>Mode of Work</Text>
        </View>
      </View>

      <Image
        source={{ uri: 'https://via.placeholder.com/350x200?text=Map+Placeholder' }}
        style={styles.map}
      />

      <TouchableOpacity style={styles.saveButton}>
        <Text style={styles.saveText}>⭐ Saved Internship</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, marginTop: 20, backgroundColor: '#fff' },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  section: { marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 'bold' },
  location: { color: '#777', fontSize: 14 },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  description: { fontSize: 14, color: '#444' },
  label: { fontSize: 14, marginVertical: 4, color: '#333' },
  link: { color: '#007bff', textDecorationLine: 'underline' },
  tagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tagBox: {
    alignItems: 'center',
    flex: 1,
    padding: 12,
    marginHorizontal: 5,
    borderRadius: 12,
    backgroundColor: '#e0f2f1',
  },
  tagIcon: { width: 32, height: 32, marginBottom: 8 },
  tagLabel: { fontWeight: 'bold', color: '#004d40' },
  tagSubLabel: { fontSize: 12, color: '#333' },
  map: {
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#e0f7fa',
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 30,
  },
  saveText: {
    color: '#00796b',
    fontWeight: 'bold',
  },
});

export default InternshipDetailsScreen;
