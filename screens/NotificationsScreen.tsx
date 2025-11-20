import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import BottomNavbar from '../components/BottomNav';
import { Swipeable } from 'react-native-gesture-handler';
import { auth, firestore } from '../firebase/config';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Notifications'>;
};

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  action?: string;
};

const initialNotifications: NotificationItem[] = [
  {
    id: '1',
    title: "Celebrate David's 2-year anniversary at Techcompany",
    description: 'David has been with Techcompany for 2 years. Congratulate him on his milestone!',
    time: '10m ago',
    action: 'Send message',
  },
  {
    id: '2',
    title: '31 searches reached you this week',
    description: 'Your profile was viewed 31 times this week. Keep up the great work!',
    time: '10m ago',
  },
  {
    id: '3',
    title: 'We found 10 product manager job opportunities in NC',
    description: 'Explore 10 new job opportunities for product managers in North Carolina.',
    time: '10m ago',
    action: 'View all jobs',
  },
  {
    id: '4',
    title: "Celebrate Anna's 4-year anniversary at Techcompany",
    description: 'Anna has been with Techcompany for 4 years. Congratulate her on her milestone!',
    time: '10m ago',
    action: 'Send message',
  },
  {
    id: '5',
    title: "Celebrate Jennifer's 4-year anniversary at Edtechcom",
    description: 'Jennifer has been with Edtechcom for 4 years. Congratulate her on her milestone!',
    time: '10m ago',
    action: 'Send message',
  },
];

const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userName, setUserName] = useState('');
  const [reminders, setReminders] = useState<string[]>([]);

  useEffect(() => {
    const fetchUserName = async () => {
      if (!auth.currentUser) return;
      try {
        const userDoc = await getDoc(doc(firestore, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserName(data.firstName && data.lastName
            ? `${data.firstName} ${data.lastName}`
            : data.name || '');
        }
      } catch (error) {
        console.error('Failed to fetch user name:', error);
      }
    };
    fetchUserName();
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const reminderList: string[] = [];

    // Check requirements
    try {
      const userDoc = await getDoc(doc(firestore, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        const requirements = data.requirements || [];
        requirements.forEach((req: any) => {
          if (!req.uploadedFiles || req.uploadedFiles.length === 0) {
            reminderList.push(`Reminder: Please upload your ${req.title}.`);
          }
        });
      }
    } catch (e) {
      // ignore
    }

    // Check weekly report for current week
    try {
      const reportsCol = collection(firestore, `users/${userId}/weeklyReports`);
      const reportsSnap = await getDocs(reportsCol);
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      let hasReport = false;
      reportsSnap.forEach((doc: any) => {
        const data: any = doc.data();
        const weekStart = new Date(data.weekStartDate);
        const weekEnd = new Date(data.weekEndDate);
        if (
          weekStart.getTime() === startOfWeek.getTime() &&
          weekEnd.getTime() === endOfWeek.getTime()
        ) {
          hasReport = true;
        }
      });
      if (!hasReport) {
        reminderList.push('Reminder: Don’t forget to submit your weekly accomplishment report!');
      }
    } catch (e) {
      // ignore
    }

    setReminders(reminderList);
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const renderRightActions = (id: string) => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => handleDelete(id)}
    >
      <Icon name="delete" size={24} color="#fff" />
      <Text style={styles.deleteText}>Delete</Text>
    </TouchableOpacity>
  );

  const handleNotificationPress = (notification: NotificationItem) => {
    setSelectedNotification(notification);
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <Swipeable
      renderRightActions={() => renderRightActions(item.id)}
    >
      <TouchableOpacity onPress={() => handleNotificationPress(item)}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="account-circle" size={40} color="#007aff" />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardTime}>{item.time}</Text>
            </View>
            <TouchableOpacity>
              <Icon name="dots-horizontal" size={24} color="#999" />
            </TouchableOpacity>
          </View>
          {item.action && (
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>{item.action}</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  // Combine reminders and notifications into a single feed
  const feed = [
    ...reminders.map((reminder) => ({ type: 'reminder', text: reminder })),
    ...notifications.map((notif) => ({ type: 'notification', ...notif })),
  ];

  return (
    <>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
        </View>

        {/* Reminders & Notifications */}
        <Text style={styles.sectionHeader}>Notifications</Text>
        <FlatList
          data={feed}
          keyExtractor={(_, idx) => idx.toString()}
          contentContainerStyle={styles.scrollContent}
          renderItem={({ item }) => {
            if (item.type === 'reminder' && 'text' in item) {
              // Make reminders clickable: go to RequirementsChecklist or WeeklyReport
              let onPress = undefined;
              if (item.text.includes('upload your')) {
                onPress = () => navigation.navigate('RequirementsChecklist');
              } else if (item.text.includes('weekly accomplishment report')) {
                onPress = () => navigation.navigate('WeeklyReport');
              }
              return (
                <TouchableOpacity onPress={onPress} disabled={!onPress}>
                  <View style={styles.reminderCard}>
                    <Ionicons name="alert-circle" size={20} color="#ff9800" style={{ marginRight: 8 }} />
                    <Text style={styles.reminderText}>{item.text}</Text>
                  </View>
                </TouchableOpacity>
              );
            } else if (item.type === 'notification' && 'title' in item && 'description' in item && 'id' in item) {
              // Make notification action button interactive
              let actionPress = undefined;
              if (item.action === 'View all jobs') {
                actionPress = () => navigation.navigate('Home');
              } else if (item.action === 'Send message') {
                actionPress = () => setModalVisible(true);
              }
              return (
                <Swipeable renderRightActions={() => renderRightActions(item.id)}>
                  <View style={styles.notificationCard}>
                    <Icon name="bell" size={20} color="#007bff" style={{ marginRight: 8 }} />
                    <View>
                      <Text style={styles.notificationTitle}>{item.title}</Text>
                      <Text style={styles.notificationText}>{item.description}</Text>
                      {item.action && (
                        <TouchableOpacity style={styles.actionButton} onPress={actionPress}>
                          <Text style={styles.actionButtonText}>{item.action}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </Swipeable>
              );
            } else {
              return null;
            }
          }}
        />
      </View>

      {/* Notification Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedNotification?.title}</Text>
            <Text style={styles.modalDescription}>{selectedNotification?.description}</Text>
            <Text style={styles.modalTime}>{selectedNotification?.time}</Text>

            {selectedNotification?.action && (
              <TouchableOpacity style={styles.modalActionButton}>
                <Text style={styles.modalActionButtonText}>{selectedNotification.action}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bottom Navbar */}
      <BottomNavbar navigation={navigation} currentRoute="Notifications" />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 16,
    paddingTop: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  profileName: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cardTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  actionButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#e6f0ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#007aff',
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 12,
    marginBottom: 12,
  },
  deleteText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  modalDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
  },
  modalTime: {
    fontSize: 12,
    color: '#999',
    marginBottom: 20,
  },
  modalActionButton: {
    backgroundColor: '#007aff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  modalActionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    backgroundColor: '#d9534f',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  reminderSection: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbe6',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  reminderText: {
    color: '#b26a00',
    fontSize: 15,
    flex: 1,
  },
  sectionHeader: {
    fontSize: 24, // Increased from 18 for better prominence
    fontWeight: 'bold',
    color: '#333',
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f8ff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  notificationTitle: {
    color: '#222',
    fontSize: 15,
    fontWeight: 'bold',
  },
  notificationText: {
    color: '#222',
    fontSize: 14,
  },
  scrollContent: {
    paddingBottom: 80, // Add padding to the bottom for the navbar
  },
});

export default NotificationsScreen;
