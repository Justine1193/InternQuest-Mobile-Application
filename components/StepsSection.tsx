import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import FontAwesome icons

const StepsSection: React.FC = () => {
  const { width } = Dimensions.get('window'); // Get screen width
  const isMobile = width <= 768; // Define a breakpoint for mobile devices

  return (
    <View style={[styles.stepsSection, isMobile && styles.mobileStepsSection]}>
      <View style={styles.step}>
        <Icon name="search" size={48} color="#4f70cb" style={styles.stepIcon} />
        <Text style={styles.stepTitle}>Start Your Journey</Text>
        <Text style={styles.stepText}>
          Take the first step toward gaining real-world experience and building your future career.
        </Text>
      </View>

      <View style={styles.step}>
        <Icon name="briefcase" size={48} color="#4f70cb" style={styles.stepIcon} />
        <Text style={styles.stepTitle}>Explore Opportunities</Text>
        <Text style={styles.stepText}>
          Browse through diverse internship listings tailored to your preferences.
        </Text>
      </View>

      <View style={styles.step}>
        <Icon name="users" size={48} color="#4f70cb" style={styles.stepIcon} />
        <Text style={styles.stepTitle}>Get Connected</Text>
        <Text style={styles.stepText}>
          Connect with industry leaders and kickstart your career through meaningful internship experiences.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stepsSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    backgroundColor: 'white',
    flexWrap: 'wrap',
  },
  mobileStepsSection: {
    flexDirection: 'column', // Stack vertically on mobile
    gap: 24,
  },
  step: {
    textAlign: 'center',
    maxWidth: 250,
  },
  stepIcon: {
    marginBottom: 12,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stepText: {
    fontSize: 16,
    color: '#555',
  },
});

export default StepsSection;
