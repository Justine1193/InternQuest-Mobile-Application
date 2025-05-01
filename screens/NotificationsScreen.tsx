import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import BottomNavbar from '../components/BottomNav'; // Ensure you have BottomNavbar component imported
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App'; // Ensure RootStackParamList is correctly imported from App

// Define the prop type for navigation
type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Notifications'>;
};

const notifications = [
  { id: '1', text: 'You have a new message from HR.' },
  { id: '2', text: 'Application for Internship #456 is under review.' },
  { id: '3', text: 'Reminder: Complete your profile.' },
];

const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notifications</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Text style={styles.notification}>{item.text}</Text>}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  list: { gap: 12 },
  notification: { fontSize: 16, backgroundColor: '#f0f0f0', padding: 12, borderRadius: 8 },
});

export default NotificationsScreen;
