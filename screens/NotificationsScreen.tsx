import React, { useState } from 'react';
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
import BottomNavbar from '../components/BottomNav';
import { Swipeable } from 'react-native-gesture-handler';

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

  return (
    <>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={{ uri: 'https://via.placeholder.com/40' }}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>{'Jordan Mendez'}</Text>
          <TouchableOpacity>
            <Icon name="magnify" size={24} color="#007aff" />
          </TouchableOpacity>
        </View>

        {/* Notifications List */}
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
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
      <BottomNavbar navigation={navigation} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 16,
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
});

export default NotificationsScreen;
