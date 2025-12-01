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
import { doc, getDoc, collection, getDocs, query, orderBy, setDoc } from 'firebase/firestore';
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

const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
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
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    if (!auth.currentUser) return;
    try {
      const notificationsRef = collection(firestore, 'notifications');
      const notificationsQuery = query(notificationsRef, orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(notificationsQuery);
      const items: NotificationItem[] = snapshot.docs.map((docSnap: any) => {
        const data = docSnap.data();
        const timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : (data.timestamp ? new Date(data.timestamp) : null);
        return {
          id: docSnap.id,
          title: data.title || 'Notification',
          description: data.message || data.description || '',
          time: timestamp ? timestamp.toLocaleString() : (data.time || ''),
          action: data.action,
        };
      });
      // Now filter out any notifications this user has hidden
      try {
        const uid = auth.currentUser.uid;
        const hiddenSnap = await getDocs(collection(firestore, `users/${uid}/hiddenNotifications`));
        const hiddenIds = new Set(hiddenSnap.docs.map((d: any) => d.id));
        if (hiddenIds.size > 0) {
          setNotifications(items.filter(i => !hiddenIds.has(i.id)));
        } else {
          setNotifications(items);
        }
      } catch (e) {
        // If fetching hidden notifications fails, fall back to showing all notifications
        console.warn('Failed to fetch hiddenNotifications for user:', e);
        try {
          if (auth.currentUser) {
            // Persist a short diagnostic on the user doc so server-side logs can be correlated
            await setDoc(doc(firestore, 'users', auth.currentUser.uid), { lastHiddenNotificationsFetchError: { time: new Date().toISOString(), message: String(e) } }, { merge: true });
            console.log('NotificationsScreen: wrote lastHiddenNotificationsFetchError to user doc');
          }
        } catch (diagErr) {
          console.warn('NotificationsScreen: failed to write lastHiddenNotificationsFetchError for user:', diagErr);
        }
        setNotifications(items);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      try {
        if (auth.currentUser) {
          await setDoc(doc(firestore, 'users', auth.currentUser.uid), { lastNotificationsFetchError: { time: new Date().toISOString(), message: String(error) } }, { merge: true });
          console.log('NotificationsScreen: wrote lastNotificationsFetchError to user doc');
        }
      } catch (diagErr) {
        console.warn('NotificationsScreen: failed to write lastNotificationsFetchError for user:', diagErr);
      }
    }
  };

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
    // Hide for the current user only: add an entry under users/{uid}/hiddenNotifications/{notificationId}
    (async () => {
      if (!auth.currentUser) {
        // fallback to local-only removal while signed out
        setNotifications((prev) => prev.filter((item) => item.id !== id));
        return;
      }

      try {
        const uid = auth.currentUser.uid;
        // create a doc where id == notification id so it's easy to check/remove
        await setDoc(doc(firestore, `users/${uid}/hiddenNotifications`, id), {
          hiddenAt: new Date().toISOString(),
        });

        // reflect change in UI
        setNotifications((prev) => prev.filter((item) => item.id !== id));
      } catch (err) {
        console.error('Failed to hide notification for user:', err);
        // Persist a diagnostic marker to the user's doc so we can inspect server-side
        try {
          if (auth.currentUser) {
            await setDoc(doc(firestore, 'users', auth.currentUser.uid), { lastNotificationsHideError: { time: new Date().toISOString(), message: String(err) } }, { merge: true });
            console.log('NotificationsScreen: wrote lastNotificationsHideError to user doc');
          }
        } catch (diagErr) {
          console.warn('NotificationsScreen: failed to write lastNotificationsHideError for user:', diagErr);
        }
        // still remove locally so the user experience is responsive
        setNotifications((prev) => prev.filter((item) => item.id !== id));
      }
    })();
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
            <View style={[styles.cardBadge, { backgroundColor: '#6366F1' }]} />
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
          <View>
            <Text style={styles.headerTitle}>Notifications</Text>
            {userName ? <Text style={styles.headerSubtitle}>Hi, {userName.split(' ')[0]}</Text> : null}
          </View>
        </View>
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
                    <Icon name="bell" size={20} color="#6366F1" style={{ marginRight: 8 }} />
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
    backgroundColor: '#f2f6ff',
    padding: 16,
    paddingTop: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: '#6366F1',
    borderRadius: 12,
  },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#fff' },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
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
    backgroundColor: '#eef2ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '800',
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
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
  },

  cardBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    marginRight: 12,
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
