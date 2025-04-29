import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import StepsSection from '../components/StepsSection';

const HomeScreen: React.FC = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome to InternQuest</Text>
      <Text style={styles.subtitle}>Find, explore, and land internships that shape your future.</Text>
      <StepsSection />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default HomeScreen;
