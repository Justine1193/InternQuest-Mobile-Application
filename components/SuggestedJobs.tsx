import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

const SuggestedJobs = () => {
  const [showAll, setShowAll] = useState(false);

  const jobs = [
    { id: '1', title: 'Software Engineer', company: 'Tech Co.' },
    { id: '2', title: 'Product Manager', company: 'Business Inc.' },
    { id: '3', title: 'UI/UX Designer', company: 'Creative Studio' },
    { id: '4', title: 'Data Scientist', company: 'Data Solutions' },
  ];

  const handleToggle = () => setShowAll(!showAll);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Suggested Jobs</Text>
      <FlatList
        data={showAll ? jobs : jobs.slice(0, 2)}
        renderItem={({ item }) => (
          <View style={styles.jobCard}>
            <Text style={styles.jobTitle}>{item.title}</Text>
            <Text style={styles.jobCompany}>{item.company}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
      <TouchableOpacity onPress={handleToggle} style={styles.toggleButton}>
        <Text style={styles.toggleButtonText}>{showAll ? 'Show Less' : 'Show All'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  jobCard: {
    padding: 10,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
    borderRadius: 8,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  jobCompany: {
    fontSize: 14,
  },
  toggleButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  toggleButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
});

export default SuggestedJobs;
