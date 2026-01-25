import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { Swipeable } from 'react-native-gesture-handler';
import { auth, firestore } from '../firebase/config';
import { doc, getDoc, collection, getDocs, query, orderBy, setDoc, where } from 'firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SecurityUtils } from '../services/security';
import { colors, radii, shadows } from '../ui/theme';
import { Screen } from '../ui/components/Screen';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Notifications'>;
};

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  action?: string;
  ts?: number;
};

type PendingApplicationItem = {
  id: string;
  userId: string;
  companyId: string;
  companyName: string;
  appliedAt?: string;
  applicantName?: string;
  applicantEmail?: string;
};

const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userName, setUserName] = useState('');
  const [reminders, setReminders] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingApplications, setPendingApplications] = useState<PendingApplicationItem[]>([]);

  const fetchPendingApplications = async () => {
    try {
      const applicationsRef = collection(firestore, 'applications');
      const pendingQuery = query(applicationsRef, where('status', '==', 'pending'), orderBy('appliedAt', 'desc'));
      const snapshot = await getDocs(pendingQuery);
      const items: PendingApplicationItem[] = snapshot.docs.map((docSnap: any) => {
        const data = docSnap.data();
        const appliedAtDate = data.appliedAt?.toDate ? data.appliedAt.toDate() : (data.appliedAt ? new Date(data.appliedAt) : null);
        return {
          id: docSnap.id,
          userId: data.userId || '',
          companyId: data.companyId || '',
          companyName: data.companyName || 'Unknown Company',
          appliedAt: appliedAtDate ? appliedAtDate.toLocaleString() : undefined,
          applicantName: data.userProfile?.name,
          applicantEmail: data.userProfile?.email,
        };
      });
      setPendingApplications(items);
    } catch (error) {
      console.error('Failed to fetch pending applications:', error);
      try {
        if (auth.currentUser) {
          await setDoc(doc(firestore, 'users', auth.currentUser.uid), { lastPendingApplicationsFetchError: { time: new Date().toISOString(), message: String(error) } }, { merge: true });
        }
      } catch (diagErr) {
        console.warn('NotificationsScreen: failed to write lastPendingApplicationsFetchError', diagErr);
      }
    }
  };

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
    (async () => {
      const admin = await SecurityUtils.isAdmin();
      setIsAdmin(admin);
      if (admin) {
        fetchPendingApplications();
      }
    })();
  }, []);

  const fetchNotifications = async () => {
    if (!auth.currentUser) return;
    try {
      const uid = auth.currentUser.uid;
      const notificationsRef = collection(firestore, 'notifications');
      // IMPORTANT: historical docs may store the recipient under `targetStudentId`
      // while others use `userId`. We query both and merge client-side.
      // (We sort client-side to avoid requiring composite indexes.)
      const [snapByUserId, snapByTargetStudentId] = await Promise.all([
        getDocs(query(notificationsRef, where('userId', '==', uid))),
        getDocs(query(notificationsRef, where('targetStudentId', '==', uid))),
      ]);

      const byId = new Map<string, NotificationItem>();
      const addFromSnap = (snap: any) => {
        snap.docs.forEach((docSnap: any) => {
          const data = docSnap.data();
          const timestampObj = data.timestamp?.toDate
            ? data.timestamp.toDate()
            : (data.timestamp ? new Date(data.timestamp) : null);
          const ts = timestampObj ? timestampObj.getTime() : 0;

          byId.set(docSnap.id, {
            id: docSnap.id,
            title: data.title || 'Notification',
            description: data.message || data.description || '',
            time: timestampObj ? timestampObj.toLocaleString() : (data.time || ''),
            action: data.action,
            ts,
          });
        });
      };

      addFromSnap(snapByUserId);
      addFromSnap(snapByTargetStudentId);

      const items: NotificationItem[] = Array.from(byId.values());

      // Newest first (best-effort).
      items.sort((a, b) => {
        return (b.ts || 0) - (a.ts || 0);
      });

      // Now filter out any notifications this user has hidden
      try {
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
      <Icon name="delete" size={24} color={colors.onPrimary} />
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
            <View style={[styles.cardBadge, { backgroundColor: colors.primary }]} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardTime}>{item.time}</Text>
            </View>
            <TouchableOpacity>
              <Icon name="dots-horizontal" size={24} color={colors.textSubtle} />
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
    <Screen contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 0 }}>
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
        ListHeaderComponent={
          isAdmin && pendingApplications.length > 0 ? (
            <View style={styles.adminSection}>
              <Text style={styles.adminSectionTitle}>Pending Applications</Text>
              {pendingApplications.slice(0, 20).map((app: PendingApplicationItem) => (
                <TouchableOpacity
                  key={app.id}
                  style={styles.adminAppCard}
                  onPress={() => {
                    if (app.companyId) {
                      navigation.navigate('CompanyProfile', { companyId: app.companyId });
                    }
                  }}
                  accessibilityRole="button"
                >
                  <Text style={styles.adminAppTitle}>{app.companyName}</Text>
                  <Text style={styles.adminAppSub}>
                    Applicant: {app.applicantName || app.userId || 'Unknown'}
                    {app.applicantEmail ? ` (${app.applicantEmail})` : ''}
                  </Text>
                  {app.appliedAt ? <Text style={styles.adminAppMeta}>Applied: {app.appliedAt}</Text> : null}
                </TouchableOpacity>
              ))}
            </View>
          ) : null
        }
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
                  <Ionicons name="alert-circle" size={20} color={colors.warning} style={{ marginRight: 8 }} />
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
                  <Icon name="bell" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
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
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: colors.primary,
  },
  headerTitle: { flex: 1, fontSize: 22, fontWeight: '800', color: colors.onPrimary },
  headerSubtitle: { fontSize: 12, color: colors.onPrimaryMuted, marginTop: 2 },
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
    color: colors.text,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
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
    color: colors.text,
  },
  cardTime: {
    fontSize: 12,
    color: colors.textSubtle,
    marginTop: 4,
  },
  actionButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  actionButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '800',
  },
  deleteButton: {
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: radii.lg,
    marginBottom: 12,
  },
  deleteText: {
    color: colors.onPrimary,
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.overlay,
  },
  modalContent: {
    width: '90%',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 20,
    ...shadows.card,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.text,
  },
  modalDescription: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 20,
  },
  modalTime: {
    fontSize: 12,
    color: colors.textSubtle,
    marginBottom: 20,
  },
  modalActionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: radii.md,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  modalActionButtonText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    backgroundColor: colors.danger,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: radii.md,
    alignSelf: 'center',
  },
  modalCloseButtonText: {
    color: colors.onPrimary,
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
    backgroundColor: colors.warningSoft,
    borderRadius: radii.md,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  reminderText: {
    color: colors.text,
    fontSize: 15,
    flex: 1,
  },
  adminSection: {
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  adminSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  adminAppCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  adminAppTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  adminAppSub: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textMuted,
  },
  adminAppMeta: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textSubtle,
  },
  sectionHeader: {
    fontSize: 24, // Increased from 18 for better prominence
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    ...shadows.card,
  },

  cardBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    marginRight: 12,
  },
  notificationTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: 'bold',
  },
  notificationText: {
    color: colors.text,
    fontSize: 14,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
});

export default NotificationsScreen;
