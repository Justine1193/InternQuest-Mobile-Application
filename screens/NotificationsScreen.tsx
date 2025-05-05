import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TouchableHighlight,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import BottomNavbar from '../components/BottomNav';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Notifications'>;
};

type NotificationItem = {
  id: string;
  text: string;
  read: boolean;
  type: 'message' | 'application' | 'reminder';
};

const initialNotifications: NotificationItem[] = [
  { id: '1', text: 'You have a new message from HR.', read: false, type: 'message' },
  { id: '2', text: 'Application for Internship #456 is under review.', read: true, type: 'application' },
  { id: '3', text: 'Reminder: Complete your profile.', read: false, type: 'reminder' },
  { id: '4', text: 'Your subscription is expiring soon.', read: true, type: 'reminder' },
  { id: '5', text: 'New message from John about the project.', read: false, type: 'message' },
];

const iconMap = {
  message: 'email-outline',
  application: 'file-document-outline',
  reminder: 'bell-outline',
};

const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  const handleNotificationPress = (item: NotificationItem) => {
    setSelectedNotification(item);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedNotification(null);
  };

  const handleDeleteNotification = () => {
    if (selectedNotification) {
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== selectedNotification.id)
      );
      handleCloseModal();
    }
  };

  const handleMarkAsUnread = () => {
    if (selectedNotification) {
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === selectedNotification.id
            ? { ...notification, read: false }
            : notification
        )
      );
      handleCloseModal();
    }
  };

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      style={[styles.notification, !item.read && styles.unread]}
      onPress={() => handleNotificationPress(item)}
    >
      <Icon
        name={iconMap[item.type]}
        size={24}
        color={item.read ? '#999' : '#0077cc'}
        style={styles.icon}
      />
      <View style={styles.textContainer}>
        <Text style={[styles.notificationText, !item.read && styles.boldText]}>
          {item.text}
        </Text>
        {!item.read && <View style={styles.dot} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <><View style={styles.container}>
      <Text style={styles.header}>Notifications</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list} />

      {/* Modal Popup */}
      {selectedNotification && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Close button at the top-right */}
              <TouchableWithoutFeedback onPress={handleCloseModal}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableWithoutFeedback>

              <Text style={styles.modalTitle}>Notification Details</Text>
              <Text style={styles.modalText}>{selectedNotification.text}</Text>

              {/* Bottom right buttons */}
              <View style={styles.modalButtons}>
                <TouchableHighlight
                  style={styles.deleteButton}
                  onPress={handleDeleteNotification}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableHighlight>
                {!selectedNotification.read && (
                  <TouchableHighlight
                    style={styles.unreadButton}
                    onPress={handleMarkAsUnread}
                  >
                    <Text style={styles.unreadButtonText}>Mark as Unread</Text>
                  </TouchableHighlight>
                )}
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
    <BottomNavbar navigation={navigation} />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, marginTop: 20 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#333' },
  list: { gap: 12 },
  notification: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 12, // More modern with bigger radius
    elevation: 3, // Adds subtle shadow for depth
  },
  unread: {
    backgroundColor: '#e6f0ff',
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    position: 'relative',
  },
  notificationText: {
    fontSize: 16,
    color: '#333',
  },
  boldText: {
    fontWeight: 'bold',
  },
  dot: {
    position: 'absolute',
    top: 2,
    right: -10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0077cc',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Softer overlay
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15, // Rounded corners for a more modern look
    width: '85%',
    maxWidth: 400, // Max width to make it responsive
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    fontSize: 30,
    fontWeight: 'bold',
    color: '#0077cc',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 25,
    color: '#555',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 15,
    marginTop: 15,
  },
  deleteButton: {
    backgroundColor: 'red',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  unreadButton: {
    backgroundColor: '#ffcc00',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  unreadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NotificationsScreen;
