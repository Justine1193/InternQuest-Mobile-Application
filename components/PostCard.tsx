import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const PostCard = () => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image
          source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/company.png' }}
          style={styles.companyLogo}
        />
        <View>
          <Text style={styles.companyName}>Group Technology</Text>
          <Text style={styles.followers}>1,350 followers</Text>
        </View>
      </View>

      <Text style={styles.postText}>
        At Group, we take great pride in fostering a culture that values and celebrates accomplishments...
      </Text>

      <Image
        source={{ uri: 'https://via.placeholder.com/300x150' }}
        style={styles.postImage}
      />

      <Text style={styles.reactions}>😍 👏 🔥 200</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Like</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.commentBox}>
        <Image
          source={{ uri: 'https://img.icons8.com/color/48/000000/user-male-circle--v1.png' }}
          style={styles.commentProfile}
        />
        <Text style={styles.commentPlaceholder}>Add a comment...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  companyLogo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  companyName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  followers: {
    fontSize: 12,
    color: '#666',
  },
  postText: {
    fontSize: 14,
    marginBottom: 12,
    color: '#333',
  },
  postImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  reactions: {
    fontSize: 14,
    color: '#888',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    marginBottom: 8,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#333',
  },
  commentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  commentProfile: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  commentPlaceholder: {
    color: '#888',
    fontSize: 14,
  },
});

export default PostCard;
